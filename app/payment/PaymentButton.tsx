'use client';

import { useState } from 'react';

export default function PaymentButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCheckout() {
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error ?? 'Failed to create checkout session');
      }

      window.location.href = data.url;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setLoading(false);
    }
  }

  return (
    <div>
      {error && (
        <div className="bg-crimson-950/50 border border-crimson-800 text-crimson-300 px-3 py-2 text-sm font-mono mb-3">
          {error}
        </div>
      )}
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="btn btn-gold w-full btn-lg"
      >
        {loading ? 'Redirecting to Stripe…' : 'Purchase Full Access →'}
      </button>
    </div>
  );
}
