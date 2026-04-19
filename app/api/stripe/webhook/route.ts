import { stripe } from '@/lib/stripe/server';
import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type Stripe from 'stripe';

export const config = {
  api: { bodyParser: false },
};

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook error';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabase = await createAdminClient();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;

    if (!userId) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    // Update payment record
    await supabase
      .from('payments')
      .update({
        status: 'succeeded',
        access_level: 'full',
        stripe_customer_id: session.customer as string | null,
      })
      .eq('stripe_session_id', session.id);

    // Update user profile
    await supabase
      .from('profiles')
      .update({ access_level: 'full' })
      .eq('id', userId);
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session;
    await supabase
      .from('payments')
      .update({ status: 'failed' })
      .eq('stripe_session_id', session.id);
  }

  return NextResponse.json({ received: true });
}
