import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import SuspectForm from '@/components/admin/SuspectForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ManageSuspectsPage({ params }: Props) {
  const { id: caseId } = await params;
  const supabase = await createClient();

  const { data: caseData } = await supabase
    .from('cases')
    .select('id, title')
    .eq('id', caseId)
    .single();

  if (!caseData) notFound();

  const { data: suspects } = await supabase
    .from('suspects')
    .select('*')
    .eq('case_id', caseId)
    .order('created_at', { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            href="/admin/cases"
            className="font-mono text-xs text-noir-400 hover:text-crimson-400 transition-colors"
          >
            ← Cases
          </Link>
          <h1 className="font-serif text-2xl text-noir-50 mt-1">
            Suspects — {caseData.title}
          </h1>
        </div>
      </div>

      {/* Existing suspects */}
      {(suspects ?? []).length > 0 && (
        <div className="space-y-3 mb-8">
          <h2 className="font-mono text-xs uppercase tracking-widest text-noir-400">
            Existing Suspects
          </h2>
          {(suspects ?? []).map((s) => (
            <div key={s.id} className="card border-noir-600 flex items-center justify-between">
              <div>
                <span className="text-noir-100">{s.name}</span>
                <span className="font-mono text-xs text-noir-500 ml-3">{s.role}</span>
                {s.is_killer && (
                  <span className="badge badge-locked ml-2 text-crimson-400 border-crimson-700">
                    KILLER
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add suspect form */}
      <div>
        <h2 className="font-mono text-xs uppercase tracking-widest text-noir-400 mb-4">
          Add Suspect / Character
        </h2>
        <SuspectForm caseId={caseId} />
      </div>
    </div>
  );
}
