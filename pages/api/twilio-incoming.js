import Twilio from 'twilio';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const twimlResponse = new Twilio.twiml.VoiceResponse();

const PRICE_PER_CALL = 49; // cents

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { From: caller, To: myNumber } = req.body;

  // Check for recent successful payment from this caller (last 24 hours)
  const recentPayments = await stripe.paymentIntents.list({
    limit: 100,
    created: { gte: Math.floor(Date.now() / 1000) - 86400 }, // 24 hours ago
  });

  const alreadyPaid = recentPayments.data.some(
    (pi) => pi.metadata?.caller === caller && pi.status === 'succeeded'
  );

  if (alreadyPaid) {
    // Already paid → connect the call
    twimlResponse.say({
      voice: 'Google.en-US-Standard-C',
    }, 'Payment verified. Connecting you now—enjoy your spam-free call!');
    twimlResponse.dial(process.env.YOUR_REAL_PHONE_NUMBER);
  } else {
    // Not paid → tell them and redirect to payment page
    twimlResponse.say({
      voice: 'Google.en-US-Standard-C',
    }, 'This number requires a one-time $0.49 payment to connect. You will now be redirected to pay securely.');

    const paymentUrl = `https://${req.headers.host}/pay?caller=${encodeURIComponent(caller)}`;
    twimlResponse.pause({ length: 1 });
    twimlResponse.redirect(paymentUrl);
  }

  res.setHeader('Content-Type', 'text/xml');
  res.send(twimlResponse.toString());
}
