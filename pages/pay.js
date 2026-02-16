import { useEffect, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'

// DEBUG VERSION - ADDED 2026-02-16 FOR STUCK REDIRECT FIX

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

export default function Pay({ caller }) {
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!caller) {
      setStatus('error')
      setError('No caller number provided in URL (add ?caller=+1YOURNUMBER)')
      return
    }

    async function startCheckout() {
      try {
        console.log('[PAY DEBUG] Starting checkout for caller:', caller)
        console.log('[PAY DEBUG] Using publishable key:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'present' : 'MISSING')

        const res = await fetch('/api/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ caller })
        })

        console.log('[PAY DEBUG] Fetch response status:', res.status)

        if (!res.ok) {
          const errText = await res.text()
          throw new Error(`Create-checkout API failed: ${res.status} - ${errText}`)
        }

        const data = await res.json()
        console.log('[PAY DEBUG] API response:', data)

        if (!data.id) {
          throw new Error('No session ID returned from API')
        }

        const stripe = await stripePromise
        if (!stripe) {
          throw new Error('Stripe.js failed to load - check NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in Vercel env vars')
        }

        console.log('[PAY DEBUG] Stripe loaded, redirecting to session:', data.id)

        setStatus('redirecting')
        const { error: stripeError } = await stripe.redirectToCheckout({ sessionId: data.id })

        if (stripeError) {
          console.error('[PAY DEBUG] Stripe redirect error:', stripeError)
          throw new Error(stripeError.message)
        }
      } catch (err) {
        console.error('[PAY DEBUG] Full checkout error:', err)
        setStatus('error')
        setError(err.message || 'Unknown checkout error - check browser console (F12)')
      }
    }

    startCheckout()
  }, [caller])

  return (
    <div style={{ 
      padding: '3rem 1rem', 
      maxWidth: '600px', 
      margin: 'auto', 
      textAlign: 'center',
      fontFamily: 'system-ui, sans-serif',
      background: '#000',
      color: '#fff',
      minHeight: '100vh'
    }}>
      <h1 style={{ fontSize: '2.5rem' }}>Pay to Connect</h1>
      <p style={{ fontSize: '1.2rem', margin: '1rem 0' }}>
        One-time $0.49 payment (valid 24 hours)
      </p>
      <p style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>
        From: {caller || 'unknown'}
      </p>

      {status === 'loading' && (
        <p style={{ marginTop: '3rem', fontSize: '1.3rem' }}>
          Redirecting to payment...
        </p>
      )}

      {status === 'redirecting' && (
        <p style={{ marginTop: '3rem', fontSize: '1.3rem' }}>
          Taking you to Stripe secure checkout...
        </p>
      )}

      {status === 'error' && (
        <div style={{ 
          marginTop: '3rem', 
          padding: '1.5rem', 
          background: 'rgba(255, 82, 82, 0.15)', 
          border: '2px solid #ff5252', 
          borderRadius: '12px',
          color: '#ffcccc'
        }}>
          <h3 style={{ color: '#ff8a80' }}>Error During Payment Setup</h3>
          <p style={{ fontSize: '1.1rem' }}>{error}</p>
          <p style={{ marginTop: '1rem', fontSize: '0.95rem', opacity: 0.9 }}>
            Open browser console (F12 or right-click → Inspect → Console tab) for more details.<br />
            Common fixes: Check Vercel env vars for NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY and STRIPE_SECRET_KEY.<br />
            Also verify /api/create-checkout logs in Vercel Functions tab.
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
