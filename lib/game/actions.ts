'use server';

import { createClient } from '@/lib/supabase/server';
import type { TaskType, SolveSubmission, SolveResult } from '@/lib/types/game';
import { INITIAL_POINTS, CLUE_COST } from '@/lib/types/game';
import { getTaskCost } from './points';

// ── Progress ──────────────────────────────────────────────────────────────────

export async function getOrCreateProgress(userId: string, caseId: string) {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('user_case_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('case_id', caseId)
    .single();

  if (existing) return existing;

  const { data, error } = await supabase
    .from('user_case_progress')
    .insert({
      user_id: userId,
      case_id: caseId,
      points_remaining: INITIAL_POINTS,
      status: 'active',
      attempts_used: 0,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deductPoints(progressId: string, amount: number): Promise<number> {
  const supabase = await createClient();

  const { data: progress, error: fetchErr } = await supabase
    .from('user_case_progress')
    .select('points_remaining')
    .eq('id', progressId)
    .single();

  if (fetchErr || !progress) throw new Error('Progress not found');

  const newPoints = Math.max(0, progress.points_remaining - amount);

  const { error } = await supabase
    .from('user_case_progress')
    .update({ points_remaining: newPoints })
    .eq('id', progressId);

  if (error) throw new Error(error.message);
  return newPoints;
}

export async function addPoints(progressId: string, amount: number): Promise<number> {
  const supabase = await createClient();

  const { data: progress, error: fetchErr } = await supabase
    .from('user_case_progress')
    .select('points_remaining')
    .eq('id', progressId)
    .single();

  if (fetchErr || !progress) throw new Error('Progress not found');

  const newPoints = progress.points_remaining + amount;

  const { error } = await supabase
    .from('user_case_progress')
    .update({ points_remaining: newPoints })
    .eq('id', progressId);

  if (error) throw new Error(error.message);
  return newPoints;
}

// ── Facts ─────────────────────────────────────────────────────────────────────

export async function saveFact(params: {
  userId: string;
  caseId: string;
  factText: string;
  source: string;
  relevanceScore: number;
}) {
  const supabase = await createClient();

  // Dedup: skip if identical fact already stored
  const { data: existing } = await supabase
    .from('facts')
    .select('id')
    .eq('user_id', params.userId)
    .eq('case_id', params.caseId)
    .eq('fact_text', params.factText)
    .maybeSingle();

  if (existing) return existing;

  const { data, error } = await supabase
    .from('facts')
    .insert({
      user_id: params.userId,
      case_id: params.caseId,
      fact_text: params.factText,
      source: params.source,
      relevance_score: params.relevanceScore,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getFacts(userId: string, caseId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('facts')
    .select('*')
    .eq('user_id', userId)
    .eq('case_id', caseId)
    .order('discovered_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

// ── Chat logs ─────────────────────────────────────────────────────────────────

export async function saveChatMessage(params: {
  userId: string;
  caseId: string;
  character: string;
  message: string;
  role: 'user' | 'ai';
}) {
  const supabase = await createClient();
  const { error } = await supabase.from('chat_logs').insert(params);
  if (error) throw new Error(error.message);
}

export async function getChatHistory(userId: string, caseId: string, character: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('chat_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('case_id', caseId)
    .eq('character', character)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

// ── Solve ─────────────────────────────────────────────────────────────────────

export async function submitSolve(
  userId: string,
  caseId: string,
  progressId: string,
  submission: SolveSubmission
): Promise<SolveResult> {
  const supabase = await createClient();

  // Check attempts
  const { data: progress } = await supabase
    .from('user_case_progress')
    .select('attempts_used, status')
    .eq('id', progressId)
    .single();

  if (!progress) throw new Error('Progress not found');
  if (progress.attempts_used >= 1) throw new Error('You have already used your solve attempt.');
  if (progress.status === 'completed') throw new Error('This case is already completed.');

  // Get case solution
  const { data: caseData } = await supabase
    .from('cases')
    .select('solution_killer, solution_motive, solution_method, title')
    .eq('id', caseId)
    .single();

  if (!caseData) throw new Error('Case not found');

  // Get submitted suspect name
  const { data: suspect } = await supabase
    .from('suspects')
    .select('name')
    .eq('id', submission.killer_suspect_id)
    .single();

  const submittedKillerName = suspect?.name ?? submission.killer_suspect_id;

  // Evaluate via Edge Function for AI explanation
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/evaluate-solve`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        caseTitle: caseData.title,
        solutionKiller: caseData.solution_killer,
        solutionMotive: caseData.solution_motive,
        solutionMethod: caseData.solution_method,
        submittedKiller: submittedKillerName,
        submittedMotive: submission.motive,
        submittedMethod: submission.method,
      }),
    }
  );

  const result: SolveResult = await response.json();

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

  return result;
}

// ── Access check ──────────────────────────────────────────────────────────────

export async function checkCaseAccess(userId: string, caseId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data: caseData } = await supabase
    .from('cases')
    .select('is_free')
    .eq('id', caseId)
    .single();

  if (!caseData) return false;
  if (caseData.is_free) return true;

  const { data: payment } = await supabase
    .from('payments')
    .select('access_level, status')
    .eq('user_id', userId)
    .eq('status', 'succeeded')
    .maybeSingle();

  return payment?.access_level === 'full';
}
