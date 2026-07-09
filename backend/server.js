// server.js
// 2026-07-05 added auth routes

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const employee_routes = require('./routes/employees');
const payroll_routes = require('./routes/payroll');
const billing_routes = require('./routes/billing');
const { router: auth_routes, verify_token } = require('./routes/auth');

const app = express();

app.use(cors());
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// 2026-07-05 auth middleware — protects all /api routes except login/verify/webhook
function require_auth(req, res, next)
{
    const auth_header = req.headers['authorization'];
    if (!auth_header)
    {
        res.status(401).json({ error: 'No token' });
        return;
    }

    const token = auth_header.replace('Bearer ', '');
    const payload = verify_token(token);
    if (!payload)
    {
        res.status(401).json({ error: 'Invalid token' });
        return;
    }

    next();
}

app.use('/api/auth', auth_routes);
app.use('/api/employees', require_auth, employee_routes);
app.use('/api/payroll', require_auth, payroll_routes);
app.use('/api/billing', require_auth, billing_routes);

app.get('/', function (req, res)
{
    res.json({ message: 'Payroll & Billing API running' });
});

const server_port = process.env.PORT || 4000;
app.listen(server_port, function ()
{
    console.log('Server running on port ' + server_port);
});
