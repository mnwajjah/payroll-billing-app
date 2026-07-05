// src/pages/EmployeesPage.js
import React, { useState, useEffect } from 'react';
import { api_get, api_post, api_delete } from '../api';

const EMPTY_FORM = {
    employee_full_name: '',
    employee_email: '',
    employee_position: '',
    employee_base_salary: '',
    employee_join_date: ''
};

function EmployeesPage()
{
    const [employee_list, set_employee_list] = useState([]);
    const [form_data, set_form_data] = useState(EMPTY_FORM);
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

    useEffect(function ()
    {
        load_employees();
    }, []);

    function handle_input_change(e)
    {
        const field_name = e.target.name;
        const field_value = e.target.value;
        set_form_data(function (prev)
        {
            return { ...prev, [field_name]: field_value };
        });
    }

    async function handle_submit(e)
    {
        e.preventDefault();
        set_error('');
        try
        {
            await api_post('/employees', form_data);
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

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Employees</h1>
            </div>

            <div className="form-card">
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
                    </div>
                    {error && <p className="error-msg">{error}</p>}
                    <button type="submit" className="btn btn-primary">Add Employee</button>
                </form>
            </div>

            {loading
                ? <p className="loading">Loading...</p>
                : (
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Position</th>
                                    <th>Base Salary</th>
                                    <th>Join Date</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {employee_list.map(function (emp)
                                {
                                    return (
                                        <tr key={emp.employee_id}>
                                            <td>{emp.employee_full_name}</td>
                                            <td>{emp.employee_email}</td>
                                            <td>{emp.employee_position}</td>
                                            <td>Rp {Number(emp.employee_base_salary).toLocaleString('id-ID')}</td>
                                            <td>{emp.employee_join_date ? emp.employee_join_date.slice(0, 10) : '-'}</td>
                                            <td>
                                                <button className="btn btn-danger" onClick={function () { handle_delete(emp.employee_id); }}>Delete</button>
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
