// routes/auth.js
// 2026-07-05 simple JWT auth for dashboard

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
require('dotenv').config();

// 2026-07-05 hardcoded single admin user for portfolio project
// in production this would be a users table
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const JWT_SECRET = process.env.JWT_SECRET;

function make_token(payload)
{
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const sig = crypto.createHmac('sha256', JWT_SECRET).update(header + '.' + body).digest('base64url');
    return header + '.' + body + '.' + sig;
}

function verify_token(token)
{
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const sig = crypto.createHmac('sha256', JWT_SECRET).update(parts[0] + '.' + parts[1]).digest('base64url');
    if (sig !== parts[2]) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    if (payload.exp < Date.now()) return null;
    return payload;
}

// POST /api/auth/login
router.post('/login', function (req, res)
{
    const input_email = req.body.email;
    const input_password = req.body.password;

    if (!input_email || !input_password)
    {
        res.status(400).json({ error: 'Email and password required' });
        return;
    }

    const input_hash = crypto.createHash('sha256').update(input_password).digest('hex');

    if (input_email !== ADMIN_EMAIL || input_hash !== ADMIN_PASSWORD_HASH)
    {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
    }

    const token = make_token({ email: input_email, exp: Date.now() + 86400000 });
    res.json({ token });
});

// POST /api/auth/verify
router.post('/verify', function (req, res)
{
    const token = req.body.token;
    if (!token)
    {
        res.status(400).json({ error: 'Token required' });
        return;
    }

    const payload = verify_token(token);
    if (!payload)
    {
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
    }

    res.json({ valid: true, email: payload.email });
});

module.exports = { router, verify_token };
