import Stripe from 'stripe'
import Twilio from 'twilio'
import { buffer } from 'micro'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const client = Twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN)

export const config = {
  api: {
    bodyParser: false
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }

  const buf = await buffer(req)
  const sig = req.headers['stripe-signature']

  let event
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook signature failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const caller = session.metadata?.caller

    if (caller) {
      try {
        await client.calls.create({
          twiml: `<Response>
            <Say voice="Google.en-US-Standard-C">Payment received. Connecting you now.</Say>
            <Dial>${process.env.YOUR_REAL_PHONE_NUMBER}</Dial>
          </Response>`,
          to: caller,
          from: process.env.TWILIO_NUMBER
        })
      } catch (e) {
        console.error('Twilio outbound failed:', e)
      }
    }
  }

  res.status(200).json({ received: true })
}
