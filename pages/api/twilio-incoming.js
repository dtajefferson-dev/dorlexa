import Twilio from 'twilio'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const VoiceResponse = Twilio.twiml.VoiceResponse

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', )
    return res.status(405).end('Method Not Allowed')
  }

  const { From: caller } = req.body
  const twiml = new VoiceResponse()

  try {
    const payments = await stripe.paymentIntents.list({
      limit: 100,
      created: { gte: Math.floor(Date.now() / 1000) - 86400 }
    })

    const hasPaid = payments.data.some(
      pi => pi.metadata && pi.metadata.caller === caller && pi.status === 'succeeded'
    )

    if (hasPaid) {
      twiml.say({ voice: 'Google.en-US-Standard-C' }, 'Payment verified. Connecting now.')
      twiml.dial(process.env.YOUR_REAL_PHONE_NUMBER)
    } else {
      twiml.say({ voice: 'Google.en-US-Standard-C' }, 
        'This number requires a one-time fifty cent payment to connect. ' +
        'Please hang up, go to dorlexa dot vercel dot app slash pay in your browser, ' +
        'enter your number, pay the fifty cents, then call back. ' +
        'Thank you!'
      )
      twiml.pause({ length: 2 })
      twiml.say('Goodbye.')
      twiml.hangup()
    }
  } catch (err) {
    console.error(err)
    twiml.say('An error occurred. Goodbye.')
    twiml.hangup()
  }

  res.setHeader('Content-Type', 'text/xml')
  res.send(twiml.toString())
}
