import { loadStripe } from '@stripe/stripe-js';
import { useEffect } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function Pay({ caller }) {
  useEffect(() => {
    fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caller }),
    })
      .then((r) => r.json())
      .then(({ id }) => stripePromise.then((s) => s.redirectToCheckout({ sessionId: id })))
      .catch((err) => console.error('Payment redirect failed:', err));
  }, );

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Complete Your Call</h1>
      <p>Pay $0.49 once (valid 24h)</p>
      <p>From: {caller}</p>
      <p>Redirecting to secure payment…</p>
    </div>
  );
}

export async function getServerSideProps({ query }) {
  return { props: { caller: query.caller || 'Unknown' } };
}
