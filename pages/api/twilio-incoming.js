import Twilio from 'twilio';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const VoiceResponse = Twilio.twiml.VoiceResponse;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  let caller = req.body.From || '';
  caller = caller.trim();
  if (!caller.startsWith('+')) {
    caller = '+' + caller;
  }

  console.log('[INCOMING] Caller number:', caller);

  const twiml = new VoiceResponse();

  try {
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      created: { gte: Math.floor(Date.now() / 1000) - 86400 },
      status: 'complete'
    });

    const hasPaid = sessions.data.some(session => {
      let storedCaller = session.metadata?.caller?.trim();
      if (storedCaller && !storedCaller.startsWith('+')) {
        storedCaller = '+' + storedCaller;
      }
      return storedCaller === caller;
    });

    console.log('[INCOMING] Has paid recently:', hasPaid);

    if (hasPaid) {
      twiml.say({ voice: 'Google.en-US-Standard-C' }, 'Payment verified. Connecting now.');
      
      const realNumber = process.env.YOUR_REAL_PHONE_NUMBER;
      console.log('[INCOMING] Dialing real number:', realNumber);

      if (!realNumber || !realNumber.startsWith('+')) {
        console.error('[INCOMING] Invalid real number format - must be +1...');
        twiml.say('Sorry, service configuration error. Goodbye.');
        twiml.hangup();
      } else {
        twiml.dial(realNumber);
      }
    } else {
      twiml.say({ voice: 'Google.en-US-Standard-C' }, 
        'This call requires a one-time ninety-nine cent payment to connect. ' +
        'Please hang up, open your phone browser, go to dorlexa dot vercel dot app slash pay, ' +
        'enter your number, pay the fee, then call back. ' +
        'Thanks for using Papercall!'
      );
      twiml.pause({ length: 2 });
      twiml.say('Goodbye.');
      twiml.hangup();
    }
  } catch (err) {
    console.error('[INCOMING] Error:', err.message);
    twiml.say('An error occurred. Goodbye.');
    twiml.hangup();
  }

  res.setHeader('Content-Type', 'text/xml');
  res.send(twiml.toString());
}
