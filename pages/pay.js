import { loadStripe } from "@stripe/stripe-js";
import { useEffect } from "react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function PayPage({ caller }) {
  useEffect(() => {
    if (!caller) return;

    fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caller }),
    })
      .then(res => res.json())
      .then(({ id }) => {
        stripePromise.then(stripe => {
          if (stripe) stripe.redirectToCheckout({ sessionId: id });
        });
      })
      .catch(err => console.error('Checkout error:', err));
  }, [caller]);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "400px", margin: "auto", textAlign: "center" }}>
      <h1>🔑 Complete Your Call</h1>
      <p>Pay $0.49 once to connect (valid 24 hours).</p>
      <p>From: {caller || 'Unknown'}</p>
      <div style={{ marginTop: "2rem" }}>Redirecting to Stripe payment...</div>
    </div>
  );
}

export async function getServerSideProps({ query }) {
  return {
    props: {
      caller: query.caller || null,
    },
  };
}
