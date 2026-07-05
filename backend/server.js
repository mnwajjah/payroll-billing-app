// server.js
// 2026-06-30 Main entry point — wires up routes and starts the server

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const employee_routes = require('./routes/employees');
const payroll_routes = require('./routes/payroll');
const billing_routes = require('./routes/billing');

const app = express();

app.use(cors());

// 2026-06-30 IMPORTANT: the Stripe webhook route needs the raw body to verify
// the signature, so it must be registered BEFORE express.json() middleware,
// using express.raw() only for that specific path.
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));

// All other routes can use normal JSON parsing
app.use(express.json());

app.use('/api/employees', employee_routes);
app.use('/api/payroll', payroll_routes);
app.use('/api/billing', billing_routes);

app.get('/', function (req, res)
{
    res.json({ message: 'Payroll & Billing API is running' });
});

const server_port = process.env.PORT || 4000;
app.listen(server_port, function ()
{
    console.log('Server running on http://localhost:' + server_port);
});
