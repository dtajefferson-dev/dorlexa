import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { caller } = req.body;
  if (!caller) return res.status(400).json({ error: 'Missing caller' });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'Call Access' },
            unit_amount: 49,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/success`,
      cancel_url: `${req.headers.origin}/cancel`,
      metadata: { caller },
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Checkout failed' });
  }
}
