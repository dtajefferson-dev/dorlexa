import Stripe from 'stripe';
import Twilio from 'twilio';
import { buffer } from 'micro';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const twilioClient = Twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const caller = session.metadata?.caller;

    if (caller) {
      try {
        await twilioClient.calls.create({
          twiml: `<Response>
            <Say voice="Google.en-US-Standard-C">Payment confirmed. Connecting you now.</Say>
            <Dial>${process.env.YOUR_REAL_PHONE_NUMBER}</Dial>
          </Response>`,
          to: caller,
          from: process.env.TWILIO_NUMBER,
        });
      } catch (e) {
        console.error('Twilio call failed:', e);
      }
    }
  }

  res.json({ received: true });
}
