export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full card border-green-800 bg-noir-800 text-center py-8 animate-fade-in">
        <div className="text-5xl mb-4">🔓</div>
        <h1 className="font-serif text-2xl text-noir-50 mb-2">Access Unlocked</h1>
        <p className="text-noir-300 text-sm mb-6">
          All 5 cases are now available. The truth awaits, Detective.
        </p>

        {session_id && (
          <p className="font-mono text-xs text-noir-500 mb-6">
            Session: {session_id.slice(0, 20)}…
          </p>
        )}

        <Link href="/dashboard" className="btn btn-primary w-full">
          Go to Case Board →
        </Link>
      </div>
    </div>
  );
}
