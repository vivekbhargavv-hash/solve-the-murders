import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function AdminCasesPage() {
  const supabase = await createClient();
  const { data: cases } = await supabase
    .from('cases')
    .select('id, title, difficulty, is_free, order_index')
    .order('order_index', { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl text-noir-50">Cases</h1>
        <Link href="/admin/cases/new" className="btn btn-primary btn-sm">
          + New Case
        </Link>
      </div>

      <div className="space-y-2">
        {(cases ?? []).map((c) => (
          <div
            key={c.id}
            className="card border-noir-600 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <span className="font-mono text-crimson-700 text-xs w-6 tabular-nums">
                #{c.order_index}
              </span>
              <span className="text-noir-100">{c.title}</span>
              <span className={`badge badge-${c.difficulty}`}>{c.difficulty}</span>
              {c.is_free ? (
                <span className="badge badge-free">Free</span>
              ) : (
                <span className="badge badge-locked">Premium</span>
              )}
            </div>
            <div className="flex gap-2">
              <Link
                href={`/admin/cases/${c.id}`}
                className="btn btn-ghost btn-sm"
              >
                Edit
              </Link>
              <Link
                href={`/admin/cases/${c.id}/suspects`}
                className="btn btn-ghost btn-sm"
              >
                Suspects
              </Link>
            </div>
          </div>
        ))}

        {!cases?.length && (
          <div className="text-center py-12">
            <p className="text-noir-500 text-sm">No cases yet.</p>
            <Link href="/admin/cases/new" className="btn btn-primary btn-sm mt-4">
              Create First Case
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
