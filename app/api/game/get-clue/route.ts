import { createClient } from '@/lib/supabase/server';
import { buildCluePrompt } from '@/lib/ai/prompts';
import { checkCaseAccess } from '@/lib/game/actions';
import { CLUE_COST } from '@/lib/types/game';
import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { caseId } = await request.json();
  if (!caseId) return NextResponse.json({ error: 'Missing caseId' }, { status: 400 });

  const hasAccess = await checkCaseAccess(user.id, caseId);
  if (!hasAccess) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

  const { data: progress } = await supabase
    .from('user_case_progress')
    .select('id, points_remaining, status')
    .eq('user_id', user.id)
    .eq('case_id', caseId)
    .single();

  if (!progress || progress.status !== 'active') {
    return NextResponse.json({ error: 'Case not active' }, { status: 400 });
  }

  if (progress.points_remaining < CLUE_COST) {
    return NextResponse.json({ error: 'Insufficient points' }, { status: 400 });
  }

  // Fetch data (solution is server-only)
  const { data: caseData } = await supabase
    .from('cases')
    .select('title, victim_name, solution_killer, solution_motive, solution_method')
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

  // Deduct points
  const newPoints = progress.points_remaining - CLUE_COST;
  await supabase
    .from('user_case_progress')
    .update({ points_remaining: newPoints })
    .eq('id', progress.id);

  const prompt = buildCluePrompt({
    caseTitle: caseData.title,
    victimName: caseData.victim_name,
    discoveredFacts: (facts ?? []).map((f) => f.fact_text),
    suspects: (suspects ?? []).map((s) => ({ name: s.name, role: s.role })),
    solutionKiller: caseData.solution_killer,
    solutionMotive: caseData.solution_motive,
    solutionMethod: caseData.solution_method,
  });

  const aiResponse = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = aiResponse.content[0].type === 'text' ? aiResponse.content[0].text : '{}';

  let clue: { hint: string; category: string };
  try {
    const cleaned = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    clue = JSON.parse(cleaned);
  } catch {
    clue = { hint: 'Look closer at those with the most to lose.', category: 'suspect' };
  }

  return NextResponse.json({
    hint: clue.hint,
    category: clue.category,
    pointsRemaining: newPoints,
  });
}
