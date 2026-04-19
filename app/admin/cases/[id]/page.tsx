import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CaseForm from '@/components/admin/CaseForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCasePage({ params }: Props) {
  const { id } = await params;

  if (id === 'new') {
    return (
      <div>
        <h1 className="font-serif text-2xl text-noir-50 mb-6">New Case</h1>
        <CaseForm />
      </div>
    );
  }

  const supabase = await createClient();
  const { data: caseData } = await supabase
    .from('cases')
    .select('*')
    .eq('id', id)
    .single();

  if (!caseData) notFound();

  return (
    <div>
      <h1 className="font-serif text-2xl text-noir-50 mb-6">Edit: {caseData.title}</h1>
      <CaseForm initialData={caseData} />
    </div>
  );
}
