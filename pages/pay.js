import { useEffect, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

export default function Pay({ caller }) {
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!caller) {
      setStatus('error')
      setError('No caller number provided')
      return
    }

    async function startCheckout() {
      try {
        console.log('Starting checkout for caller:', caller)

        const res = await fetch('/api/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ caller })
        })

        if (!res.ok) {
          const errText = await res.text()
          throw new Error(`API error ${res.status}: ${errText}`)
        }

        const { id } = await res.json()
        console.log('Got Stripe session ID:', id)

        const stripe = await stripePromise
        if (!stripe) {
          throw new Error('Stripe failed to load – check publishable key')
        }

        setStatus('redirecting')
        const { error } = await stripe.redirectToCheckout({ sessionId: id })

        if (error) {
          console.error('Stripe redirect error:', error)
          throw new Error(error.message)
        }
      } catch (err) {
        console.error('Checkout failed:', err)
        setStatus('error')
        setError(err.message || 'Something went wrong during checkout')
      }
    }

    startCheckout()
  }, [caller])

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '500px', 
      margin: 'auto', 
      textAlign: 'center',
      fontFamily: 'sans-serif'
    }}>
      <h1>Pay to Connect</h1>
      <p>One-time $0.49 payment (valid 24 hours)</p>
      <p><strong>From:</strong> {caller || 'unknown'}</p>

      {status === 'loading' && (
        <p style={{ marginTop: '2rem', fontSize: '1.1rem' }}>
          Redirecting to payment...
        </p>
      )}

      {status === 'redirecting' && (
        <p style={{ marginTop: '2rem', fontSize: '1.1rem' }}>
          Taking you to Stripe...
        </p>
      )}

      {status === 'error' && (
        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          background: '#ffebee', 
          border: '1px solid #ef5350', 
          borderRadius: '8px',
          color: '#c62828'
        }}>
          <h3>Error</h3>
          <p>{error || 'Unknown error'}</p>
          <p style={{ fontSize: '0.9rem', marginTop: '1rem' }}>
            Check browser console (F12) for details, or make sure env vars are set correctly in Vercel.
          </p>
        </div>
      )}
    </div>
  )
}

export async function getServerSideProps({ query }) {
  return {
    props: { caller: query.caller || null }
  }
}
