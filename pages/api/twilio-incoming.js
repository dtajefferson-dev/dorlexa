import Twilio from 'twilio';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const VoiceResponse = Twilio.twiml.VoiceResponse;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  const { From: caller } = req.body;

  const twiml = new VoiceResponse();

  // Check recent payments (last 24h)
  const recent = await stripe.paymentIntents.list({
    limit: 100,
    created: { gte: Math.floor(Date.now() / 1000) - 86400 },
  });

  const paid = recent.data.some(
    pi => pi.metadata?.caller === caller && pi.status === 'succeeded'
  );

  if (paid) {
    twiml.say({ voice: 'Google.en-US-Standard-C' }, 'Payment verified. Connecting now.');
    twiml.dial(process.env.YOUR_REAL_PHONE_NUMBER);
  } else {
    twiml.say({ voice: 'Google.en-US-Standard-C' }, 'This call requires a $0.49 one-time payment. Redirecting to pay.');
    twiml.pause({ length: 1 });
    const payUrl = `https://${req.headers.host}/pay?caller=${encodeURIComponent(caller)}`;
    twiml.redirect(payUrl);
  }

  res.setHeader('Content-Type', 'text/xml');
  res.send(twiml.toString());
}
