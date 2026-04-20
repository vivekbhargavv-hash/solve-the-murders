export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function GameLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, access_level')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="border-b border-noir-700 bg-noir-800/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-widest text-crimson-600">
              Case Board
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {profile?.access_level !== 'full' && (
              <Link href="/payment" className="btn btn-gold btn-sm hidden sm:flex">
                Unlock All Cases
              </Link>
            )}
            <span className="font-mono text-xs text-noir-400 hidden sm:block">
              Det. {profile?.display_name ?? user.email}
            </span>
            <form action="/api/auth/signout" method="POST">
              <button className="btn btn-ghost btn-sm font-mono text-xs">
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
