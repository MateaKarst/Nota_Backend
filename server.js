// Entry point for the backend
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Імпорт і ініціалізація Stripe

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" }));

// Маршрут для перевірки
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Stripe Checkout session
app.post('/create-checkout-session', async (req, res) => {
  const { plan } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: plan.name,
            },
            unit_amount: parseInt(plan.price.replace('$', '')) * 100,
          },
          quantity: 1,
        },
      ],
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Stripe session error:', error);
    res.status(500).json({ error: 'Failed to create Stripe session' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
