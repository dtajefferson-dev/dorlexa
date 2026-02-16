import { useEffect, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'

// FORCED DEBUG UPDATE - FEB 16 2026 - TO BREAK CACHE AND SHOW ISSUES

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

export default function Pay({ caller }) {
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  useEffect(() => {
    console.log('=== PAY PAGE LOADED DEBUG ===')
    console.log('Caller from URL:', caller)
    console.log('Publishable key exists?', !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
    console.log('Full env object sample:', Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC_')))

    if (!caller) {
      setError('Missing caller in URL (?caller=...)')
      setStatus('error')
      return
    }

    async function startCheckout() {
      setStatus('processing')
      try {
        console.log('Fetching /api/create-checkout...')
        const res = await fetch('/api/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ caller })
        })

        console.log('Fetch status:', res.status, res.ok ? 'OK' : 'FAILED')

        if (!res.ok) {
          const text = await res.text()
          throw new Error(`API call failed: ${res.status} - ${text}`)
        }

        const data = await res.json()
        console.log('API data received:', data)

        if (!data.id) {
          throw new Error('No session ID in response')
        }

        console.log('Loading Stripe...')
        const stripe = await stripePromise
        if (!stripe) {
          throw new Error('Stripe failed to initialize - key issue?')
        }

        console.log('Redirecting to Stripe session:', data.id)
        const { error: redirError } = await stripe.redirectToCheckout({ sessionId: data.id })

        if (redirError) {
          throw new Error(`Redirect failed: ${redirError.message}`)
        }
      } catch (err) {
        console.error('Checkout crash:', err.message, err.stack)
        setError(err.message)
        setStatus('error')
      }
    }

    startCheckout()
  }, [caller])

  return (
    <div style={{ 
      padding: '4rem 1rem', 
      maxWidth: '600px', 
      margin: 'auto', 
      textAlign: 'center',
      background: '#000',
      color: '#fff',
      fontFamily: 'sans-serif'
    }}>
      <h1 style={{ color: '#ff9800' }}>DEBUG MODE ACTIVE</h1>
      <p style={{ fontSize: '1.5rem' }}>Pay to Connect Test</p>
      <p>One-time $0.49 (24h valid)</p>
      <p><strong>From:</strong> {caller || 'missing'}</p>

      {status === 'loading' && <p style={{ fontSize: '1.4rem', marginTop: '3rem' }}>Initializing...</p>}
      {status === 'processing' && <p style={{ fontSize: '1.4rem', marginTop: '3rem' }}>Contacting payment server...</p>}
      {status === 'redirecting' && <p style={{ fontSize: '1.4rem', marginTop: '3rem' }}>Redirecting to Stripe...</p>}

      {status === 'error' && (
        <div style={{ 
          marginTop: '3rem', 
          padding: '2rem', 
          background: 'rgba(244, 67, 54, 0.2)', 
          border: '3px solid #f44336', 
          borderRadius: '12px'
        }}>
          <h2 style={{ color: '#f44336' }}>PAYMENT SETUP ERROR</h2>
          <p style={{ fontSize: '1.2rem' }}>{error || 'Unknown issue'}</p>
          <p style={{ marginTop: '1rem', fontSize: '1rem' }}>
            Open F12 → Console tab for [PAY DEBUG] logs.<br />
            Check Vercel env vars and Functions logs for /api/create-checkout.
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
