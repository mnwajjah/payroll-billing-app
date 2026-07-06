// src/pages/BillingPage.js
import React, { useState, useEffect } from 'react';
import { api_get, api_post } from '../api';

function BillingPage()
{
    const [subscription_list, set_subscription_list] = useState([]);
    const [selected_plan, set_selected_plan] = useState('basic');
    const [customer_email, set_customer_email] = useState('');
    const [loading, set_loading] = useState(true);
    const [submitting, set_submitting] = useState(false);
    const [error, set_error] = useState('');

    async function load_subscriptions()
    {
        try
        {
            const data = await api_get('/billing/subscriptions');
            set_subscription_list(data);
        }
        catch (err)
        {
            set_error(err.message);
        }
        finally
        {
            set_loading(false);
        }
    }

    useEffect(function () { load_subscriptions(); }, []);

    async function handle_checkout(e)
    {
        e.preventDefault();
        set_error('');
        set_submitting(true);
        try
        {
            const result = await api_post('/billing/create-checkout-session', {
                billing_customer_email: customer_email,
                billing_plan_key: selected_plan
            });
            window.location.href = result.checkout_url;
        }
        catch (err)
        {
            set_error(err.message);
            set_submitting(false);
        }
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Billing</h1>
            </div>

            <div className="plan-grid">
                <div className={'plan-card' + (selected_plan === 'basic' ? ' selected' : '')} onClick={function () { set_selected_plan('basic'); }}>
                    <div className="plan-name">Basic</div>
                    <div className="plan-price">$50 <span>/ month</span></div>
                </div>
                <div className={'plan-card' + (selected_plan === 'pro' ? ' selected' : '')} onClick={function () { set_selected_plan('pro'); }}>
                    <div className="plan-name">Pro</div>
                    <div className="plan-price">$150 <span>/ month</span></div>
                </div>
            </div>

            <div className="form-card" style={{ maxWidth: 400 }}>
                <form onSubmit={handle_checkout}>
                    <div className="form-group" style={{ marginBottom: 16 }}>
                        <label>Customer Email</label>
                        <input type="email" value={customer_email} onChange={function (e) { set_customer_email(e.target.value); }} required />
                    </div>
                    {error && <p className="error-msg">{error}</p>}
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                        {submitting ? 'Redirecting...' : 'Subscribe — ' + (selected_plan === 'basic' ? '$50' : '$150') + '/mo'}
                    </button>
                </form>
            </div>

            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Subscriptions</h2>

            {loading
                ? <p className="loading">Loading...</p>
                : (
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Email</th>
                                    <th>Plan</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subscription_list.map(function (sub)
                                {
                                    return (
                                        <tr key={sub.subscription_id}>
                                            <td>{sub.subscription_customer_email}</td>
                                            <td>{sub.subscription_plan_name}</td>
                                            <td><span className={'badge badge-' + sub.subscription_status}>{sub.subscription_status}</span></td>
                                            <td>{new Date(sub.subscription_created_at).toLocaleDateString('id-ID')}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )
            }
        </div>
    );
}

export default BillingPage;
