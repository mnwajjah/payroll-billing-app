// src/pages/EmployeesPage.js
// 2026-07-05 added edit modal + employee status

import React, { useState, useEffect } from 'react';
import { api_get, api_post, api_put, api_delete } from '../api';

const EMPTY_FORM = {
    employee_full_name: '',
    employee_email: '',
    employee_position: '',
    employee_base_salary: '',
    employee_join_date: '',
    employee_status: 'Active'
};

const STATUS_OPTIONS = ['Active', 'Probation', 'Resign'];

function EmployeesPage()
{
    const [employee_list, set_employee_list] = useState([]);
    const [form_data, set_form_data] = useState(EMPTY_FORM);
    const [editing_id, set_editing_id] = useState(null);
    const [show_form, set_show_form] = useState(false);
    const [loading, set_loading] = useState(true);
    const [error, set_error] = useState('');

    async function load_employees()
    {
        try
        {
            const data = await api_get('/employees');
            set_employee_list(data);
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

    useEffect(function () { load_employees(); }, []);

    function handle_input_change(e)
    {
        const field_name = e.target.name;
        const field_value = e.target.value;
        set_form_data(function (prev) { return { ...prev, [field_name]: field_value }; });
    }

    function handle_edit_click(emp)
    {
        set_editing_id(emp.employee_id);
        set_form_data({
            employee_full_name: emp.employee_full_name,
            employee_email: emp.employee_email,
            employee_position: emp.employee_position || '',
            employee_base_salary: emp.employee_base_salary,
            employee_join_date: emp.employee_join_date ? emp.employee_join_date.slice(0, 10) : '',
            employee_status: emp.employee_status || 'Active'
        });
        set_show_form(true);
    }

    function handle_add_click()
    {
        set_editing_id(null);
        set_form_data(EMPTY_FORM);
        set_show_form(true);
    }

    async function handle_submit(e)
    {
        e.preventDefault();
        set_error('');
        try
        {
            if (editing_id)
            {
                await api_put('/employees/' + editing_id, form_data);
            }
            else
            {
                await api_post('/employees', form_data);
            }
            set_show_form(false);
            set_editing_id(null);
            set_form_data(EMPTY_FORM);
            load_employees();
        }
        catch (err)
        {
            set_error(err.message);
        }
    }

    async function handle_delete(employee_id)
    {
        if (!window.confirm('Delete this employee?')) return;
        try
        {
            await api_delete('/employees/' + employee_id);
            load_employees();
        }
        catch (err)
        {
            set_error(err.message);
        }
    }

    const active_count = employee_list.filter(function (e) { return e.employee_status === 'Active' || !e.employee_status; }).length;
    const total_payroll = employee_list.reduce(function (sum, e) { return sum + Number(e.employee_base_salary); }, 0);

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Employees</h1>
                    <div className="page-subtitle">{employee_list.length} total members</div>
                </div>
                <button className="btn btn-primary" onClick={handle_add_click}>+ Add Employee</button>
            </div>

            <div className="stat-grid">
                <div className="stat-card">
                    <div className="stat-label">Total Employees</div>
                    <div className="stat-value">{employee_list.length}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Active</div>
                    <div className="stat-value text-success">{active_count}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Monthly Payroll Estimate</div>
                    <div className="stat-value" style={{ fontSize: 16 }}>Rp {total_payroll.toLocaleString('id-ID')}</div>
                </div>
            </div>

            {show_form && (
                <div className="form-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{editing_id ? 'Edit Employee' : 'New Employee'}</div>
                        <button className="btn btn-ghost btn-sm" onClick={function () { set_show_form(false); }}>Cancel</button>
                    </div>
                    <form onSubmit={handle_submit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input name="employee_full_name" value={form_data.employee_full_name} onChange={handle_input_change} required />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input name="employee_email" type="email" value={form_data.employee_email} onChange={handle_input_change} required />
                            </div>
                            <div className="form-group">
                                <label>Position</label>
                                <input name="employee_position" value={form_data.employee_position} onChange={handle_input_change} />
                            </div>
                            <div className="form-group">
                                <label>Base Salary (IDR)</label>
                                <input name="employee_base_salary" type="number" value={form_data.employee_base_salary} onChange={handle_input_change} required />
                            </div>
                            <div className="form-group">
                                <label>Join Date</label>
                                <input name="employee_join_date" type="date" value={form_data.employee_join_date} onChange={handle_input_change} />
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select name="employee_status" value={form_data.employee_status} onChange={handle_input_change}>
                                    {STATUS_OPTIONS.map(function (s) { return <option key={s} value={s}>{s}</option>; })}
                                </select>
                            </div>
                        </div>
                        {error && <p className="error-msg">{error}</p>}
                        <button type="submit" className="btn btn-primary">{editing_id ? 'Save Changes' : 'Add Employee'}</button>
                    </form>
                </div>
            )}

            {loading
                ? <p className="loading">Loading...</p>
                : employee_list.length === 0
                    ? <div className="empty-state">No employees yet. Add one above.</div>
                    : (
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Position</th>
                                        <th>Status</th>
                                        <th>Base Salary</th>
                                        <th>Join Date</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employee_list.map(function (emp)
                                    {
                                        const emp_status = emp.employee_status || 'Active';
                                        return (
                                            <tr key={emp.employee_id}>
                                                <td>
                                                    <div style={{ fontWeight: 500 }}>{emp.employee_full_name}</div>
                                                    <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{emp.employee_email}</div>
                                                </td>
                                                <td className="text-muted">{emp.employee_position || '—'}</td>
                                                <td><span className={'badge badge-' + emp_status}>{emp_status}</span></td>
                                                <td>Rp {Number(emp.employee_base_salary).toLocaleString('id-ID')}</td>
                                                <td className="text-muted">{emp.employee_join_date ? emp.employee_join_date.slice(0, 10) : '—'}</td>
                                                <td>
                                                    <div className="row">
                                                        <button className="btn btn-ghost btn-sm" onClick={function () { handle_edit_click(emp); }}>Edit</button>
                                                        <button className="btn btn-danger-ghost" onClick={function () { handle_delete(emp.employee_id); }}>Delete</button>
                                                    </div>
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

export default EmployeesPage;
