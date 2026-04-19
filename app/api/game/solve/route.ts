import { createClient } from '@/lib/supabase/server';
import { buildSolveEvaluationPrompt } from '@/lib/ai/prompts';
import { checkCaseAccess } from '@/lib/game/actions';
import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { caseId, progressId, killerSuspectId, motive, method } = await request.json();

  if (!caseId || !progressId || !killerSuspectId || !motive || !method) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const hasAccess = await checkCaseAccess(user.id, caseId);
  if (!hasAccess) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

  // Check ownership and attempts
  const { data: progress } = await supabase
    .from('user_case_progress')
    .select('id, attempts_used, status, user_id')
    .eq('id', progressId)
    .single();

  if (!progress || progress.user_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (progress.attempts_used >= 1) {
    return NextResponse.json({ error: 'Already solved — one attempt allowed' }, { status: 400 });
  }

  // Get case solution
  const { data: caseData } = await supabase
    .from('cases')
    .select('title, solution_killer, solution_motive, solution_method')
    .eq('id', caseId)
    .single();

  if (!caseData) return NextResponse.json({ error: 'Case not found' }, { status: 404 });

  // Get suspect name
  const { data: suspect } = await supabase
    .from('suspects')
    .select('name')
    .eq('id', killerSuspectId)
    .single();

  const submittedKillerName = suspect?.name ?? killerSuspectId;

  const prompt = buildSolveEvaluationPrompt({
    caseTitle: caseData.title,
    solutionKiller: caseData.solution_killer,
    solutionMotive: caseData.solution_motive,
    solutionMethod: caseData.solution_method,
    submittedKiller: submittedKillerName,
    submittedMotive: motive,
    submittedMethod: method,
  });

  const aiResponse = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 400,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = aiResponse.content[0].type === 'text' ? aiResponse.content[0].text : '{}';

  let result: {
    killer_correct: boolean;
    motive_correct: boolean;
    method_correct: boolean;
    correct: boolean;
    explanation: string;
  };

  try {
    const cleaned = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    result = JSON.parse(cleaned);
  } catch {
    // Fallback: manual comparison
    const killerMatch = caseData.solution_killer.toLowerCase().includes(submittedKillerName.toLowerCase()) ||
      submittedKillerName.toLowerCase().includes(caseData.solution_killer.toLowerCase());
    result = {
      killer_correct: killerMatch,
      motive_correct: false,
      method_correct: false,
      correct: false,
      explanation: 'The case has been evaluated. Review the facts you uncovered.',
    };
  }

  // Update progress
  await supabase
    .from('user_case_progress')
    .update({
      attempts_used: 1,
      status: 'completed',
      completed_at: new Date().toISOString(),
      solve_result: result as Record<string, unknown>,
    })
    .eq('id', progressId);

  return NextResponse.json({ result });
}
