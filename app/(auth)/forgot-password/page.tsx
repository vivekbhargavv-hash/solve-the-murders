'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const supabase = createClient();

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="card border-noir-600 text-center py-8 animate-fade-in">
        <div className="text-4xl mb-4">🔑</div>
        <h2 className="font-serif text-xl text-noir-50 mb-2">Reset link sent</h2>
        <p className="text-noir-300 text-sm">
          Check <span className="text-crimson-400">{email}</span> for a password reset link.
        </p>
      </div>
    );
  }

  return (
    <div className="card border-noir-600 animate-slide-up">
      <h2 className="font-serif text-xl text-noir-50 mb-2">Forgot Password</h2>
      <p className="text-noir-400 text-sm mb-6">
        Enter your email and we'll send you a reset link.
      </p>

      {error && (
        <div className="bg-crimson-950/50 border border-crimson-800 text-crimson-300 px-3 py-2 text-sm font-mono mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleReset} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="detective@precinct.com"
            required
          />
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading ? 'Sending…' : 'Send Reset Link'}
        </button>
      </form>

      <p className="text-center text-noir-400 text-sm mt-6">
        <Link href="/login" className="text-crimson-400 hover:text-crimson-300 transition-colors">
          Back to Sign In
        </Link>
      </p>
    </div>
  );
}
