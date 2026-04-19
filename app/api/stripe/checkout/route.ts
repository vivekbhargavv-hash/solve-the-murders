import { createClient } from '@/lib/supabase/server';
import { createCheckoutSession } from '@/lib/stripe/server';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check not already paid
  const { data: existing } = await supabase
    .from('payments')
    .select('access_level')
    .eq('user_id', user.id)
    .eq('status', 'succeeded')
    .maybeSingle();

  if (existing?.access_level === 'full') {
    return NextResponse.json({ error: 'Already has full access' }, { status: 400 });
  }

  const session = await createCheckoutSession(user.id, user.email!);

  // Record pending payment
  await supabase.from('payments').insert({
    user_id: user.id,
    stripe_session_id: session.id,
    status: 'pending',
    access_level: 'free',
    amount_cents: 999,
  });

  return NextResponse.json({ url: session.url });
}
