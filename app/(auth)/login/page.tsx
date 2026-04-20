'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicSent, setMagicSent] = useState(false);

  async function handlePasswordLogin(e: React.FormEvent) {
    const supabase = createClient();
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  }

  async function handleMagicLink() {
    if (!email) {
      setError('Enter your email address first.');
      return;
    }
    setError('');
    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}` },
    });

    if (error) {
      setError(error.message);
    } else {
      setMagicSent(true);
    }
    setLoading(false);
  }

  if (magicSent) {
    return (
      <div className="card border-noir-600 text-center py-8">
        <div className="text-4xl mb-4">✉️</div>
        <h2 className="font-serif text-xl text-noir-50 mb-2">Check your inbox</h2>
        <p className="text-noir-300 text-sm">
          We sent a magic link to <span className="text-crimson-400">{email}</span>.
          Click it to sign in.
        </p>
      </div>
    );
  }

  return (
    <div className="card border-noir-600 animate-slide-up">
      <h2 className="font-serif text-xl text-noir-50 mb-6">Sign In</h2>

      {error && (
        <div className="bg-crimson-950/50 border border-crimson-800 text-crimson-300 px-3 py-2 text-sm font-mono mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handlePasswordLogin} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="detective@precinct.com"
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label className="label">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <Link
            href="/forgot-password"
            className="font-mono text-xs text-noir-400 hover:text-crimson-400 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full mt-2"
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <div className="divider" />

      <button
        onClick={handleMagicLink}
        disabled={loading}
        className="btn btn-secondary w-full"
      >
        Send Magic Link
      </button>

      <p className="text-center text-noir-400 text-sm mt-6">
        No account?{' '}
        <Link href="/register" className="text-crimson-400 hover:text-crimson-300 transition-colors">
          Register
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
