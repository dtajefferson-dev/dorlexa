# dorlexa
papercall
# Papercall

Charge $0.49 for every incoming call. Spam callers pay—or hang up. You earn passive income.

## How it works
1. Forward calls to your Twilio number  
2. Caller gets redirected to pay via Stripe  
3. After payment: call connects automatically (24h access)  

## Setup
- Add your keys to `.env.local`  
- Deploy to Vercel  
- Point Twilio webhook to `/api/twilio-incoming`  

Built with Next.js, Stripe, Twilio.  
Spam dies. You win.
