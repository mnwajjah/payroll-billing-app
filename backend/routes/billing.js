// routes/billing.js
// 2026-07-05 migrated from mysql2 to pg

const express = require('express');
const router = express.Router();
const pool = require('../config/db');
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const PLAN_PRICES = {
    basic: { name: 'Basic Plan', amount: 5000, currency: 'usd' },
    pro: { name: 'Pro Plan', amount: 15000, currency: 'usd' }
};

router.post('/create-checkout-session', async function (req, res)
{
    try
    {
        const billing_customer_email = req.body.billing_customer_email;
        const billing_plan_key = req.body.billing_plan_key;

        if (!billing_customer_email || !billing_plan_key)
        {
            res.status(400).json({ error: 'billing_customer_email and billing_plan_key are required' });
            return;
        }

        const selected_plan = PLAN_PRICES[billing_plan_key];
        if (!selected_plan)
        {
            res.status(400).json({ error: 'Invalid billing_plan_key' });
            return;
        }

        const checkout_session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            customer_email: billing_customer_email,
            line_items: [
                {
                    price_data: {
                        currency: selected_plan.currency,
                        product_data: { name: selected_plan.name },
                        unit_amount: selected_plan.amount,
                        recurring: { interval: 'month' }
                    },
                    quantity: 1
                }
            ],
            success_url: process.env.FRONTEND_URL + '/billing/success',
            cancel_url: process.env.FRONTEND_URL + '/billing/cancel',
            metadata: { billing_plan_key: billing_plan_key }
        });

        await pool.query(
            'INSERT INTO subscriptions (subscription_customer_email, subscription_plan_name, subscription_status) VALUES ($1, $2, $3)',
            [billing_customer_email, selected_plan.name, 'pending']
        );

        res.json({ checkout_url: checkout_session.url });
    }
    catch (error)
    {
        res.status(500).json({ error: error.message });
    }
});

router.get('/subscriptions', async function (req, res)
{
    try
    {
        const result = await pool.query(
            'SELECT subscription_id, subscription_customer_email, subscription_plan_name, subscription_status, subscription_created_at FROM subscriptions ORDER BY subscription_id DESC'
        );
        res.json(result.rows);
    }
    catch (error)
    {
        res.status(500).json({ error: error.message });
    }
});

router.post('/webhook', async function (req, res)
{
    const stripe_signature = req.headers['stripe-signature'];
    let stripe_event;

    try
    {
        stripe_event = stripe.webhooks.constructEvent(
            req.body,
            stripe_signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    }
    catch (error)
    {
        res.status(400).send('Webhook signature verification failed: ' + error.message);
        return;
    }

    try
    {
        if (stripe_event.type === 'checkout.session.completed')
        {
            const checkout_session = stripe_event.data.object;
            const customer_email = checkout_session.customer_email;

            await pool.query(
                'UPDATE subscriptions SET subscription_status = $1, subscription_stripe_customer_id = $2, subscription_stripe_subscription_id = $3 WHERE subscription_customer_email = $4 AND subscription_id = (SELECT subscription_id FROM subscriptions WHERE subscription_customer_email = $4 ORDER BY subscription_id DESC LIMIT 1)',
                ['active', checkout_session.customer, checkout_session.subscription, customer_email]
            );
        }

        if (stripe_event.type === 'invoice.payment_failed')
        {
            const invoice_object = stripe_event.data.object;
            const customer_email = invoice_object.customer_email;

            await pool.query(
                'UPDATE subscriptions SET subscription_status = $1 WHERE subscription_customer_email = $2 AND subscription_id = (SELECT subscription_id FROM subscriptions WHERE subscription_customer_email = $2 ORDER BY subscription_id DESC LIMIT 1)',
                ['payment_failed', customer_email]
            );
        }

        if (stripe_event.type === 'customer.subscription.deleted')
        {
            const subscription_object = stripe_event.data.object;

            await pool.query(
                'UPDATE subscriptions SET subscription_status = $1 WHERE subscription_stripe_subscription_id = $2',
                ['cancelled', subscription_object.id]
            );
        }

        res.json({ received: true });
    }
    catch (error)
    {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
