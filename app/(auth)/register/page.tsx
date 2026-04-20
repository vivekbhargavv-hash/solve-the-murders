'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="card border-noir-600 text-center py-8 animate-fade-in">
        <div className="text-4xl mb-4">🔍</div>
        <h2 className="font-serif text-xl text-noir-50 mb-2">Credentials Received</h2>
        <p className="text-noir-300 text-sm leading-relaxed">
          Check your email at <span className="text-crimson-400">{email}</span> and confirm your account before proceeding to the case board.
        </p>
      </div>
    );
  }

  return (
    <div className="card border-noir-600 animate-slide-up">
      <h2 className="font-serif text-xl text-noir-50 mb-6">Create Account</h2>

      {error && (
        <div className="bg-crimson-950/50 border border-crimson-800 text-crimson-300 px-3 py-2 text-sm font-mono mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="label">Detective Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="input"
            placeholder="Det. J. Marlowe"
            required
          />
        </div>

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
            placeholder="min. 8 characters"
            required
            autoComplete="new-password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full mt-2"
        >
          {loading ? 'Creating account…' : 'Open Case File'}
        </button>
      </form>

      <p className="text-center text-noir-400 text-sm mt-6">
        Already a detective?{' '}
        <Link href="/login" className="text-crimson-400 hover:text-crimson-300 transition-colors">
          Sign In
        </Link>
      </p>
    </div>
  );
}
