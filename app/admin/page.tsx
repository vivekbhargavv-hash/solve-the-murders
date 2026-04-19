import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function AdminHomePage() {
  const supabase = await createClient();

  const [{ count: caseCount }, { count: userCount }, { count: factCount }] = await Promise.all([
    supabase.from('cases').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('facts').select('*', { count: 'exact', head: true }),
  ]);

  return (
    <div>
      <h1 className="font-serif text-2xl text-noir-50 mb-6">Admin Overview</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Cases', value: caseCount ?? 0 },
          { label: 'Users', value: userCount ?? 0 },
          { label: 'Facts Extracted', value: factCount ?? 0 },
        ].map(({ label, value }) => (
          <div key={label} className="card border-noir-600 text-center">
            <p className="font-mono text-3xl font-bold text-crimson-400">{value}</p>
            <p className="text-noir-400 text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <Link href="/admin/cases" className="btn btn-secondary w-full justify-start gap-3">
          📁 Manage Cases
        </Link>
        <Link href="/admin/cases/new" className="btn btn-primary w-full justify-start gap-3">
          + Create New Case
        </Link>
      </div>
    </div>
  );
}
