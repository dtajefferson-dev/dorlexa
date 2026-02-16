import Stripe from 'stripe';
import Twilio from 'twilio';
import { buffer } from 'micro';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const twilio = Twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const buf = await buffer(req);
  const sig = req.headers ;

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      buf.toString(),
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const caller = event.data.object.metadata.caller;
    await twilio.calls.create({
      to: caller,
      from: process.env.TWILIO_NUMBER,
      url: `http://twimlets.com/echo?Twiml=${encodeURIComponent(
        `<Response><Say>Connecting you now.</Say><Dial>${process.env.YOUR_REAL_PHONE_NUMBER}</Dial></Response>`
      )}`,
    });
  }

  res.json({ received: true });
}
