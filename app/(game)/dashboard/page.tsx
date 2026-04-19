import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CaseCard from '@/components/game/CaseCard';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch cases ordered by index
  const { data: cases } = await supabase
    .from('cases')
    .select('id, title, difficulty, is_free, story_intro, order_index')
    .order('order_index', { ascending: true });

  // Fetch user's progress for all cases
  const { data: progressList } = await supabase
    .from('user_case_progress')
    .select('case_id, status, points_remaining')
    .eq('user_id', user.id);

  // Fetch user access level
  const { data: profile } = await supabase
    .from('profiles')
    .select('access_level, display_name')
    .eq('id', user.id)
    .single();

  const progressMap = new Map(
    (progressList ?? []).map((p) => [p.case_id, p])
  );

  const hasFull = profile?.access_level === 'full';

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-widest text-crimson-600 mb-1">
          Case Board
        </p>
        <h1 className="text-3xl font-serif text-noir-50">
          Welcome back, Det. {profile?.display_name ?? 'Detective'}
        </h1>
        <p className="text-noir-400 text-sm mt-1">
          Select a case to begin your investigation.
        </p>
      </div>

      {/* Case grid */}
      <div className="space-y-4">
        {(cases ?? []).map((c) => {
          const progress = progressMap.get(c.id);
          const isLocked = !c.is_free && !hasFull;

          return (
            <CaseCard
              key={c.id}
              caseData={c}
              progress={progress}
              isLocked={isLocked}
              userId={user.id}
            />
          );
        })}
      </div>

      {!hasFull && (
        <div className="mt-8 card border-gold-800 bg-gold-900/10 text-center py-6">
          <p className="font-serif text-noir-100 text-lg mb-1">
            Ready for harder cases?
          </p>
          <p className="text-noir-400 text-sm mb-4">
            Unlock all 5 cases with a one-time purchase.
          </p>
          <a href="/payment" className="btn btn-gold">
            Unlock All Cases
          </a>
        </div>
      )}
    </div>
  );
}
