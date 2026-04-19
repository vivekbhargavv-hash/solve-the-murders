import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { checkCaseAccess } from '@/lib/game/actions';
import InvestigationScreen from '@/components/game/InvestigationScreen';

interface Props {
  params: Promise<{ caseId: string }>;
}

export const dynamic = 'force-dynamic';

export default async function InvestigatePage({ params }: Props) {
  const { caseId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const hasAccess = await checkCaseAccess(user.id, caseId);
  if (!hasAccess) redirect('/payment');

  // Case data (never expose solution fields to client)
  const { data: caseData } = await supabase
    .from('cases')
    .select('id, title, difficulty, story_intro, victim_name, victim_description, setting')
    .eq('id', caseId)
    .single();

  if (!caseData) notFound();

  // Progress
  const { data: progress } = await supabase
    .from('user_case_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('case_id', caseId)
    .single();

  if (!progress) redirect(`/case/${caseId}`);

  // Suspects (no hidden truths sent to client)
  const { data: suspects } = await supabase
    .from('suspects')
    .select('id, name, role, description')
    .eq('case_id', caseId);

  // Discovered facts
  const { data: facts } = await supabase
    .from('facts')
    .select('*')
    .eq('user_id', user.id)
    .eq('case_id', caseId)
    .order('discovered_at', { ascending: false });

  return (
    <InvestigationScreen
      caseData={caseData}
      progress={progress}
      suspects={suspects ?? []}
      facts={facts ?? []}
      userId={user.id}
    />
  );
}
