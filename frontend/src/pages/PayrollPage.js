// src/pages/PayrollPage.js
// 2026-07-05 added BPJS and THR calculation

import React, { useState, useEffect } from 'react';
import { api_get, api_post, api_delete } from '../api';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// 2026-07-05 BPJS rates (Indonesia standard)
const BPJS_KESEHATAN_RATE = 0.01;   // 1% employee share
const BPJS_KETENAGAKERJAAN_RATE = 0.02; // 2% employee share (JHT)

function calculate_bpjs(base_salary)
{
    const bpjs_kesehatan = Math.round(base_salary * BPJS_KESEHATAN_RATE);
    const bpjs_ketenagakerjaan = Math.round(base_salary * BPJS_KETENAGAKERJAAN_RATE);
    return bpjs_kesehatan + bpjs_ketenagakerjaan;
}

function is_thr_month(month)
{
    // 2026-07-05 THR typically disbursed in month of Eid (varies) or April/May
    // for simplicity we use April (4) as THR month
    return parseInt(month) === 4;
}

const EMPTY_FORM = {
    payroll_employee_id: '',
    payroll_period_month: '',
    payroll_period_year: new Date().getFullYear(),
    payroll_bonuses: '',
    payroll_deductions: '',
    payroll_include_bpjs: true,
    payroll_include_thr: false
};

function PayrollPage()
{
    const [payroll_list, set_payroll_list] = useState([]);
    const [employee_list, set_employee_list] = useState([]);
    const [form_data, set_form_data] = useState(EMPTY_FORM);
    const [preview, set_preview] = useState(null);
    const [loading, set_loading] = useState(true);
    const [error, set_error] = useState('');

    async function load_data()
    {
        try
        {
            const payroll_data = await api_get('/payroll');
            const employee_data = await api_get('/employees');
            set_payroll_list(payroll_data);
            set_employee_list(employee_data);
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

    useEffect(function () { load_data(); }, []);

    function handle_input_change(e)
    {
        const field_name = e.target.name;
        const field_value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        set_form_data(function (prev)
        {
            const updated = { ...prev, [field_name]: field_value };
            update_preview(updated);
            return updated;
        });
    }

    function update_preview(data)
    {
        if (!data.payroll_employee_id || !data.payroll_period_month) { set_preview(null); return; }

        const selected_employee = employee_list.find(function (e) { return String(e.employee_id) === String(data.payroll_employee_id); });
        if (!selected_employee) { set_preview(null); return; }

        const base = Number(selected_employee.employee_base_salary);
        const bonuses = Number(data.payroll_bonuses) || 0;
        let deductions = Number(data.payroll_deductions) || 0;

        let bpjs = 0;
        if (data.payroll_include_bpjs)
        {
            bpjs = calculate_bpjs(base);
            deductions += bpjs;
        }

        let thr = 0;
        if (data.payroll_include_thr || is_thr_month(data.payroll_period_month))
        {
            thr = base; // 1 month salary
        }

        const net = base + bonuses + thr - deductions;

        set_preview({ base, bonuses, deductions, bpjs, thr, net });
    }

    async function handle_submit(e)
    {
        e.preventDefault();
        set_error('');

        const selected_employee = employee_list.find(function (em) { return String(em.employee_id) === String(form_data.payroll_employee_id); });
        const base = Number(selected_employee.employee_base_salary);
        let total_deductions = Number(form_data.payroll_deductions) || 0;
        let total_bonuses = Number(form_data.payroll_bonuses) || 0;

        if (form_data.payroll_include_bpjs)
        {
            total_deductions += calculate_bpjs(base);
        }

        if (form_data.payroll_include_thr || is_thr_month(form_data.payroll_period_month))
        {
            total_bonuses += base;
        }

        try
        {
            await api_post('/payroll', {
                payroll_employee_id: form_data.payroll_employee_id,
                payroll_period_month: form_data.payroll_period_month,
                payroll_period_year: form_data.payroll_period_year,
                payroll_bonuses: total_bonuses,
                payroll_deductions: total_deductions
            });
            set_form_data(EMPTY_FORM);
            set_preview(null);
            load_data();
        }
        catch (err)
        {
            set_error(err.message);
        }
    }

    async function handle_delete(payroll_id)
    {
        if (!window.confirm('Delete this payroll record?')) return;
        try
        {
            await api_delete('/payroll/' + payroll_id);
            load_data();
        }
        catch (err)
        {
            set_error(err.message);
        }
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Payroll</h1>
                    <div className="page-subtitle">{payroll_list.length} records</div>
                </div>
            </div>

            <div className="form-card">
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 16 }}>Generate Payroll</div>
                <form onSubmit={handle_submit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Employee</label>
                            <select name="payroll_employee_id" value={form_data.payroll_employee_id} onChange={handle_input_change} required>
                                <option value="">Select employee</option>
                                {employee_list.map(function (emp) { return <option key={emp.employee_id} value={emp.employee_id}>{emp.employee_full_name}</option>; })}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Month</label>
                            <select name="payroll_period_month" value={form_data.payroll_period_month} onChange={handle_input_change} required>
                                <option value="">Select month</option>
                                {MONTHS.map(function (m, i) { return <option key={i + 1} value={i + 1}>{m}</option>; })}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Year</label>
                            <input name="payroll_period_year" type="number" value={form_data.payroll_period_year} onChange={handle_input_change} required />
                        </div>
                        <div className="form-group">
                            <label>Bonuses (IDR)</label>
                            <input name="payroll_bonuses" type="number" value={form_data.payroll_bonuses} onChange={handle_input_change} />
                        </div>
                        <div className="form-group">
                            <label>Extra Deductions (IDR)</label>
                            <input name="payroll_deductions" type="number" value={form_data.payroll_deductions} onChange={handle_input_change} />
                        </div>
                    </div>

                    <div className="row" style={{ marginBottom: 16, gap: 20 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text-2)' }}>
                            <input type="checkbox" name="payroll_include_bpjs" checked={form_data.payroll_include_bpjs} onChange={handle_input_change} />
                            Include BPJS deduction (3% of base)
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text-2)' }}>
                            <input type="checkbox" name="payroll_include_thr" checked={form_data.payroll_include_thr} onChange={handle_input_change} />
                            Include THR (1x base salary)
                        </label>
                    </div>

                    {preview && (
                        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 16px', marginBottom: 16, fontSize: 13 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                                <div><div style={{ color: 'var(--text-2)', marginBottom: 2 }}>Base</div><div>Rp {preview.base.toLocaleString('id-ID')}</div></div>
                                <div><div style={{ color: 'var(--text-2)', marginBottom: 2 }}>BPJS</div><div style={{ color: 'var(--danger)' }}>- Rp {preview.bpjs.toLocaleString('id-ID')}</div></div>
                                <div><div style={{ color: 'var(--text-2)', marginBottom: 2 }}>THR</div><div style={{ color: 'var(--success)' }}>+ Rp {preview.thr.toLocaleString('id-ID')}</div></div>
                                <div><div style={{ color: 'var(--text-2)', marginBottom: 2 }}>Bonuses</div><div style={{ color: 'var(--success)' }}>+ Rp {preview.bonuses.toLocaleString('id-ID')}</div></div>
                                <div><div style={{ color: 'var(--text-2)', marginBottom: 2 }}>Deductions</div><div style={{ color: 'var(--danger)' }}>- Rp {preview.deductions.toLocaleString('id-ID')}</div></div>
                                <div><div style={{ color: 'var(--text-2)', marginBottom: 2 }}>Net Pay</div><div style={{ fontWeight: 700, color: 'var(--success)', fontSize: 15 }}>Rp {preview.net.toLocaleString('id-ID')}</div></div>
                            </div>
                        </div>
                    )}

                    {error && <p className="error-msg">{error}</p>}
                    <button type="submit" className="btn btn-primary">Generate Payroll</button>
                </form>
            </div>

            {loading
                ? <p className="loading">Loading...</p>
                : (
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Period</th>
                                    <th>Base</th>
                                    <th>Bonuses</th>
                                    <th>Deductions</th>
                                    <th>Net Pay</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {payroll_list.length === 0
                                    ? <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-3)', padding: 32 }}>No payroll records yet.</td></tr>
                                    : payroll_list.map(function (p)
                                    {
                                        return (
                                            <tr key={p.payroll_id}>
                                                <td style={{ fontWeight: 500 }}>{p.employee_full_name}</td>
                                                <td className="text-muted">{MONTHS[p.payroll_period_month - 1]} {p.payroll_period_year}</td>
                                                <td>Rp {Number(p.payroll_base_salary).toLocaleString('id-ID')}</td>
                                                <td style={{ color: 'var(--success)' }}>Rp {Number(p.payroll_bonuses).toLocaleString('id-ID')}</td>
                                                <td style={{ color: 'var(--danger)' }}>Rp {Number(p.payroll_deductions).toLocaleString('id-ID')}</td>
                                                <td style={{ fontWeight: 700 }}>Rp {Number(p.payroll_net_pay).toLocaleString('id-ID')}</td>
                                                <td><button className="btn btn-danger-ghost" onClick={function () { handle_delete(p.payroll_id); }}>Delete</button></td>
                                            </tr>
                                        );
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                )
            }
        </div>
    );
}

export default PayrollPage;
