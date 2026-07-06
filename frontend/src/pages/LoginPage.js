// src/pages/LoginPage.js
import React, { useState } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || '';

function LoginPage()
{
    const [email, set_email] = useState('');
    const [password, set_password] = useState('');
    const [error, set_error] = useState('');
    const [loading, set_loading] = useState(false);

    async function handle_submit(e)
    {
        e.preventDefault();
        set_error('');
        set_loading(true);

        try
        {
            const response = await fetch(API_BASE + '/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok)
            {
                set_error(data.error || 'Login failed');
                return;
            }

            localStorage.setItem('pbm_token', data.token);
            window.location.href = '/';
        }
        catch (err)
        {
            set_error('Connection error');
        }
        finally
        {
            set_loading(false);
        }
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
            <div style={{ width: 360 }}>
                <div style={{ marginBottom: 32, textAlign: 'center' }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Payroll <span style={{ color: 'var(--accent)' }}>&</span> Billing</div>
                    <div style={{ fontSize: 13, color: 'var(--text-2)' }}>Sign in to your workspace</div>
                </div>

                <div className="form-card" style={{ padding: 24 }}>
                    <form onSubmit={handle_submit}>
                        <div className="form-group" style={{ marginBottom: 14 }}>
                            <label>Email</label>
                            <input type="email" value={email} onChange={function (e) { set_email(e.target.value); }} placeholder="admin@payroll.com" required />
                        </div>
                        <div className="form-group" style={{ marginBottom: 20 }}>
                            <label>Password</label>
                            <input type="password" value={password} onChange={function (e) { set_password(e.target.value); }} placeholder="••••••••" required />
                        </div>
                        {error && <p className="error-msg" style={{ marginBottom: 14 }}>{error}</p>}
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
