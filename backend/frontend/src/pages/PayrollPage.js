// src/pages/PayrollPage.js
import React, { useState, useEffect } from 'react';
import { api_get, api_post, api_delete } from '../api';

const EMPTY_FORM = {
    payroll_employee_id: '',
    payroll_period_month: '',
    payroll_period_year: new Date().getFullYear(),
    payroll_bonuses: '',
    payroll_deductions: ''
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function PayrollPage()
{
    const [payroll_list, set_payroll_list] = useState([]);
    const [employee_list, set_employee_list] = useState([]);
    const [form_data, set_form_data] = useState(EMPTY_FORM);
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
        const field_value = e.target.value;
        set_form_data(function (prev) { return { ...prev, [field_name]: field_value }; });
    }

    async function handle_submit(e)
    {
        e.preventDefault();
        set_error('');
        try
        {
            await api_post('/payroll', form_data);
            set_form_data(EMPTY_FORM);
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
                <h1 className="page-title">Payroll</h1>
            </div>

            <div className="form-card">
                <form onSubmit={handle_submit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Employee</label>
                            <select name="payroll_employee_id" value={form_data.payroll_employee_id} onChange={handle_input_change} required>
                                <option value="">Select employee</option>
                                {employee_list.map(function (emp)
                                {
                                    return <option key={emp.employee_id} value={emp.employee_id}>{emp.employee_full_name}</option>;
                                })}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Month</label>
                            <select name="payroll_period_month" value={form_data.payroll_period_month} onChange={handle_input_change} required>
                                <option value="">Select month</option>
                                {MONTHS.map(function (m, i)
                                {
                                    return <option key={i + 1} value={i + 1}>{m}</option>;
                                })}
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
                            <label>Deductions (IDR)</label>
                            <input name="payroll_deductions" type="number" value={form_data.payroll_deductions} onChange={handle_input_change} />
                        </div>
                    </div>
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
                                    <th>Base Salary</th>
                                    <th>Bonuses</th>
                                    <th>Deductions</th>
                                    <th>Net Pay</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {payroll_list.map(function (p)
                                {
                                    return (
                                        <tr key={p.payroll_id}>
                                            <td>{p.employee_full_name}</td>
                                            <td>{MONTHS[p.payroll_period_month - 1]} {p.payroll_period_year}</td>
                                            <td>Rp {Number(p.payroll_base_salary).toLocaleString('id-ID')}</td>
                                            <td>Rp {Number(p.payroll_bonuses).toLocaleString('id-ID')}</td>
                                            <td>Rp {Number(p.payroll_deductions).toLocaleString('id-ID')}</td>
                                            <td style={{ fontWeight: 700, color: 'var(--success)' }}>Rp {Number(p.payroll_net_pay).toLocaleString('id-ID')}</td>
                                            <td>
                                                <button className="btn btn-danger" onClick={function () { handle_delete(p.payroll_id); }}>Delete</button>
                                            </td>
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

export default PayrollPage;
