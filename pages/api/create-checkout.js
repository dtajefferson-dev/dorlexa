const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [
    {
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Papercall Access',
        },
        unit_amount: PRICE_PER_CALL,
      },
      quantity: 1,
    },
  ],
  mode: 'payment',
  success_url: `${req.headers.origin}/success?caller=${caller}`,
  cancel_url: `${req.headers.origin}/cancel?caller=${caller}`,
  metadata: { caller },
});
