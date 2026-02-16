import { useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

export default function Pay({ caller }) {
  useEffect(() => {
    if (!caller) return

    async function startCheckout() {
      try {
        const res = await fetch('/api/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ caller })
        })
        const { id } = await res.json()
        const stripe = await stripePromise
        if (stripe) await stripe.redirectToCheckout({ sessionId: id })
      } catch (err) {
        console.error(err)
      }
    }

    startCheckout()
  }, [caller])

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: 'auto', textAlign: 'center' }}>
      <h1>Pay to Connect</h1>
      <p>One-time $0.49 payment (valid 24 hours)</p>
      <p>From: {caller || 'unknown'}</p>
      <p>Redirecting to payment...</p>
    </div>
  )
}

export async function getServerSideProps({ query }) {
  return {
    props: { caller: query.caller || null }
  }
}
