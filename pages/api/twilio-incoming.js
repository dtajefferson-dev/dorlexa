import Twilio from 'twilio';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const twilio = Twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const caller = req.body.From;
  if (!caller) return res.status(400).send('Missing caller');

  const twiml = new Twilio.twiml.VoiceResponse();

  // Check for recent payment (DB later)
  const payments = await stripe.paymentIntents.list({ limit: 100 });
  const alreadyPaid = payments.data.some(
    (p) => p.metadata.caller === caller && p.status === 'succeeded'
  );

  if (alreadyPaid) {
    twiml.dial(process.env.YOUR_REAL_PHONE_NUMBER);
  } else {
    twiml.say('Pay forty-nine cents to connect this call.');
    const url = `https://${req.headers.host}/pay?caller=${encodeURIComponent(caller)}`;
    twiml.redirect(url);
  }

  res.type('text/xml').send(twiml.toString());
}
