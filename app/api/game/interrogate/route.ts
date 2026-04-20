import { createClient } from '@/lib/supabase/server';
import { sanitizeUserInput, buildInterrogationPrompt, buildFactExtractionPrompt } from '@/lib/ai/prompts';
import { checkCaseAccess } from '@/lib/game/actions';
import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { caseId, characterId, character, message } = body;

  if (!caseId || !characterId || !character || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Access check
  const hasAccess = await checkCaseAccess(user.id, caseId);
  if (!hasAccess) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

  // Progress check
  const { data: progress } = await supabase
    .from('user_case_progress')
    .select('id, points_remaining, status')
    .eq('user_id', user.id)
    .eq('case_id', caseId)
    .single();

  if (!progress || progress.status !== 'active') {
    return NextResponse.json({ error: 'Case not active' }, { status: 400 });
  }

  // Sanitize input
  const safeMessage = sanitizeUserInput(message);

  // Fetch case data
  const { data: caseData } = await supabase
    .from('cases')
    .select('title, story_intro, victim_name, victim_description')
    .eq('id', caseId)
    .single();

  if (!caseData) return NextResponse.json({ error: 'Case not found' }, { status: 404 });

  // Fetch character data — look in suspects first, then use fixed roles
  let characterData: {
    name: string;
    role: string;
    personality: string;
    knowledge_base: Record<string, unknown>;
    hidden_truths: Record<string, unknown>;
    reveal_conditions: Record<string, unknown>;
    is_killer: boolean;
  } | null = null;

  // Try suspects table
  const { data: suspect } = await supabase
    .from('suspects')
    .select('name, role, personality, knowledge_base, hidden_truths, reveal_conditions, is_killer')
    .eq('id', characterId)
    .eq('case_id', caseId)
    .maybeSingle();

  if (suspect) {
    characterData = suspect as unknown as typeof characterData;
  } else {
    // Fixed roles (police, coroner, first_witness, ballistics)
    const { data: roleChar } = await supabase
      .from('suspects')
      .select('name, role, personality, knowledge_base, hidden_truths, reveal_conditions, is_killer')
      .eq('case_id', caseId)
      .ilike('role', `%${characterId.replace('_', ' ')}%`)
      .maybeSingle();

    if (roleChar) {
      characterData = roleChar as unknown as typeof characterData;
    }
  }

  if (!characterData) {
    // Fallback generic character
    characterData = {
      name: character,
      role: character,
      personality: 'Cautious and professional',
      knowledge_base: { general: 'Has knowledge of the case from their perspective' },
      hidden_truths: {},
      reveal_conditions: {},
      is_killer: false,
    };
  }

  // Fetch chat history for context
  const { data: chatHistory } = await supabase
    .from('chat_logs')
    .select('role, message')
    .eq('user_id', user.id)
    .eq('case_id', caseId)
    .eq('character', character)
    .order('created_at', { ascending: true })
    .limit(20);

  // Fetch discovered facts
  const { data: facts } = await supabase
    .from('facts')
    .select('fact_text')
    .eq('user_id', user.id)
    .eq('case_id', caseId);

  const systemPrompt = buildInterrogationPrompt({
    caseTitle: caseData.title,
    caseIntro: caseData.story_intro,
    victimName: caseData.victim_name,
    victimDescription: caseData.victim_description,
    character: {
      name: characterData.name,
      role: characterData.role,
      personality: characterData.personality,
      knowledgeBase: characterData.knowledge_base as Record<string, unknown>,
      hiddenTruths: characterData.hidden_truths as Record<string, unknown>,
      revealConditions: characterData.reveal_conditions as Record<string, unknown>,
      isKiller: characterData.is_killer,
    },
    discoveredFacts: (facts ?? []).map((f) => f.fact_text),
    chatHistory: (chatHistory ?? []).map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.message,
    })),
    userQuestion: safeMessage,
  });

  // AI call
  const aiResponse = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    system: systemPrompt,
    messages: [
      ...(chatHistory ?? []).map((m) => ({
        role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.message,
      })),
      { role: 'user', content: safeMessage },
    ],
  });

  const responseText =
    aiResponse.content[0].type === 'text' ? aiResponse.content[0].text : '';

  // Extract facts from the AI response
  const factExtractResponse = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    messages: [
      {
        role: 'user',
        content: buildFactExtractionPrompt(responseText, characterData.name),
      },
    ],
  });

  let extractedFacts: { fact_text: string; source: string; relevance_score: number }[] = [];
  try {
    const raw = factExtractResponse.content[0].type === 'text'
      ? factExtractResponse.content[0].text
      : '[]';
    extractedFacts = JSON.parse(raw);
  } catch {
    extractedFacts = [];
  }

  // Save chat messages
  await supabase.from('chat_logs').insert([
    { user_id: user.id, case_id: caseId, character, message: safeMessage, role: 'user' },
    { user_id: user.id, case_id: caseId, character, message: responseText, role: 'ai' },
  ]);

  // Save new facts and award points
  const newFacts = [];
  let pointsEarned = 0;

  for (const fact of extractedFacts) {
    if (!fact.fact_text || fact.fact_text.length < 10) continue;

    // Dedup
    const { data: existing } = await supabase
      .from('facts')
      .select('id')
      .eq('user_id', user.id)
      .eq('case_id', caseId)
      .eq('fact_text', fact.fact_text)
      .maybeSingle();

    if (existing) continue;

    const { data: saved } = await supabase
      .from('facts')
      .insert({
        user_id: user.id,
        case_id: caseId,
        fact_text: fact.fact_text,
        source: fact.source,
        relevance_score: Math.min(1, Math.max(0, fact.relevance_score ?? 0.5)),
      })
      .select()
      .single();

    if (saved) {
      newFacts.push(saved);
      // Award points: +1 per fact, +2 for high relevance
      pointsEarned += fact.relevance_score >= 0.8 ? 2 : 1;
    }
  }

  // Update points
  let newPoints = progress.points_remaining;
  if (pointsEarned > 0) {
    newPoints = progress.points_remaining + pointsEarned;
    await supabase
      .from('user_case_progress')
      .update({ points_remaining: newPoints })
      .eq('id', progress.id);
  }

  return NextResponse.json({
    response: responseText,
    newFacts,
    pointsEarned,
    pointsRemaining: newPoints,
  });
}
