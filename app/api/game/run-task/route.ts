import { createClient } from '@/lib/supabase/server';
import { buildTaskPrompt } from '@/lib/ai/prompts';
import { checkCaseAccess } from '@/lib/game/actions';
import { TASK_CONFIGS } from '@/lib/types/game';
import type { TaskType } from '@/lib/types/game';
import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { caseId, taskType } = await request.json();

  if (!caseId || !taskType) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const taskConfig = TASK_CONFIGS[taskType as TaskType];
  if (!taskConfig || taskConfig.pointCost === 0) {
    return NextResponse.json({ error: 'Invalid task type' }, { status: 400 });
  }

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

  if (progress.points_remaining < taskConfig.pointCost) {
    return NextResponse.json({ error: 'Insufficient points' }, { status: 400 });
  }

  // Fetch case + solution (server-only)
  const { data: caseData } = await supabase
    .from('cases')
    .select('title, story_intro, victim_name, victim_description, setting, solution_killer, solution_motive, solution_method')
    .eq('id', caseId)
    .single();

  if (!caseData) return NextResponse.json({ error: 'Case not found' }, { status: 404 });

  const { data: suspects } = await supabase
    .from('suspects')
    .select('name, role')
    .eq('case_id', caseId);

  const { data: facts } = await supabase
    .from('facts')
    .select('fact_text')
    .eq('user_id', user.id)
    .eq('case_id', caseId);

  // Deduct points first
  const newPoints = progress.points_remaining - taskConfig.pointCost;
  await supabase
    .from('user_case_progress')
    .update({ points_remaining: newPoints })
    .eq('id', progress.id);

  // AI call
  const prompt = buildTaskPrompt({
    taskType,
    caseTitle: caseData.title,
    caseIntro: caseData.story_intro,
    victimName: caseData.victim_name,
    victimDescription: caseData.victim_description,
    setting: caseData.setting,
    suspects: (suspects ?? []).map((s) => ({ name: s.name, role: s.role })),
    discoveredFacts: (facts ?? []).map((f) => f.fact_text),
    solutionKiller: caseData.solution_killer,
    solutionMotive: caseData.solution_motive,
    solutionMethod: caseData.solution_method,
  });

  const aiResponse = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 800,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = aiResponse.content[0].type === 'text' ? aiResponse.content[0].text : '{}';

  let parsed: {
    narrative: string;
    facts: { fact_text: string; source: string; relevance_score: number }[];
    red_herring?: string;
  };

  try {
    // Strip markdown code blocks if present
    const cleaned = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    parsed = JSON.parse(cleaned);
  } catch {
    return NextResponse.json({ error: 'AI response parse error' }, { status: 500 });
  }

  // Save new facts and award points
  const newFacts = [];
  let pointsEarned = 0;

  for (const fact of parsed.facts ?? []) {
    if (!fact.fact_text || fact.fact_text.length < 10) continue;

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
        source: fact.source ?? taskType,
        relevance_score: Math.min(1, Math.max(0, fact.relevance_score ?? 0.5)),
      })
      .select()
      .single();

    if (saved) {
      newFacts.push(saved);
      pointsEarned += fact.relevance_score >= 0.8 ? 2 : 1;
    }
  }

  // Award points for discovered facts
  const finalPoints = newPoints + pointsEarned;
  if (pointsEarned > 0) {
    await supabase
      .from('user_case_progress')
      .update({ points_remaining: finalPoints })
      .eq('id', progress.id);
  }

  return NextResponse.json({
    narrative: parsed.narrative,
    newFacts,
    pointsEarned,
    redHerring: parsed.red_herring ?? null,
    pointsRemaining: finalPoints,
  });
}
