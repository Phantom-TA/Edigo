import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-06-30.basil',
    })
  : null;

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 500 }
    );
  }

  const { amount } = await req.json();
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
    });
    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch {
    return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 });
  }
}
