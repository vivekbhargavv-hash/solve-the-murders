import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { checkCaseAccess, getOrCreateProgress } from '@/lib/game/actions';
import RulesGate from '@/components/game/RulesGate';

interface Props {
  params: Promise<{ caseId: string }>;
}

export default async function CaseStartPage({ params }: Props) {
  const { caseId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Access check
  const hasAccess = await checkCaseAccess(user.id, caseId);
  if (!hasAccess) redirect('/payment');

  // Fetch case
  const { data: caseData } = await supabase
    .from('cases')
    .select('id, title, difficulty, story_intro, victim_name, victim_description, setting')
    .eq('id', caseId)
    .single();

  if (!caseData) notFound();

  // Check if already active / completed
  const { data: existing } = await supabase
    .from('user_case_progress')
    .select('id, status')
    .eq('user_id', user.id)
    .eq('case_id', caseId)
    .maybeSingle();

  if (existing?.status === 'active' || existing?.status === 'completed') {
    redirect(`/case/${caseId}/investigate`);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <RulesGate caseData={caseData} userId={user.id} />
    </div>
  );
}
