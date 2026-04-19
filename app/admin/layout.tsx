import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

// Admin email list — in production use a role-based system or DB flag
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '').split(',').map((e) => e.trim());

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');
  if (!ADMIN_EMAILS.includes(user.email ?? '')) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-noir-700 bg-noir-800 px-4 h-12 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="font-mono text-xs uppercase tracking-widest text-crimson-600">
            Admin Panel
          </Link>
          <Link href="/admin/cases" className="font-mono text-xs text-noir-400 hover:text-noir-100 transition-colors">
            Cases
          </Link>
          <Link href="/dashboard" className="font-mono text-xs text-noir-400 hover:text-noir-100 transition-colors">
            ← Game
          </Link>
        </div>
        <span className="font-mono text-xs text-noir-500">{user.email}</span>
      </header>

      <main className="flex-1 p-6 max-w-5xl mx-auto w-full">{children}</main>
    </div>
  );
}
