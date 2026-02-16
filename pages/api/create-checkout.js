import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end('Method Not Allowed')
  }

  const { caller } = req.body

  if (!caller) {
    return res.status(400).json({ error: 'Missing caller number' })
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Papercall One-Time Access'
            },
            unit_amount: 49
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/success`,
      cancel_url: `${req.headers.origin}/cancel`,
      metadata: { caller }
    })

    res.status(200).json({ id: session.id })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to create session' })
  }
}
