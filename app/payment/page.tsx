import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PaymentButton from './PaymentButton';

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ cancelled?: string }>;
}) {
  const { cancelled } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/payment');

  // Already paid?
  const { data: payment } = await supabase
    .from('payments')
    .select('access_level, status')
    .eq('user_id', user.id)
    .eq('status', 'succeeded')
    .maybeSingle();

  if (payment?.access_level === 'full') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-md w-full">
        {cancelled && (
          <div className="bg-crimson-950/50 border border-crimson-800 text-crimson-300 px-4 py-2 text-sm font-mono mb-6 text-center">
            Payment cancelled — no charge was made.
          </div>
        )}

        <div className="card border-gold-800 bg-noir-800">
          <div className="text-center mb-6">
            <p className="font-mono text-xs uppercase tracking-widest text-gold-600 mb-2">
              Full Access
            </p>
            <h1 className="font-serif text-3xl text-noir-50 mb-1">
              Unlock All Cases
            </h1>
            <p className="text-noir-400 text-sm">
              One-time purchase. All 5 cases. No subscription.
            </p>
          </div>

          <div className="space-y-3 mb-6">
            {[
              '✓ All 5 murder cases (3 free + 2 premium)',
              '✓ Full AI interrogation system',
              '✓ Unlimited investigation time',
              '✓ Permanent access — no expiry',
            ].map((item) => (
              <p key={item} className="text-sm text-noir-200 font-mono">
                {item}
              </p>
            ))}
          </div>

          <div className="divider-red" />

          <div className="text-center py-4">
            <p className="font-mono text-4xl font-bold text-gold-500 mb-1">$9.99</p>
            <p className="text-noir-500 text-xs">USD · One-time</p>
          </div>

          <PaymentButton />
        </div>

        <p className="text-center text-noir-600 text-xs font-mono mt-4">
          Secured by Stripe · No card data touches our servers
        </p>
      </div>
    </div>
  );
}
