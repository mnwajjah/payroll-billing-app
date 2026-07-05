// routes/payroll.js
// 2026-07-05 migrated from mysql2 to pg

const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async function (req, res)
{
    try
    {
        const filter_employee_id = req.query.employee_id;

        let sql_query = 'SELECT payroll_id, payroll_employee_id, payroll_period_month, payroll_period_year, payroll_base_salary, payroll_deductions, payroll_bonuses, payroll_net_pay FROM payroll_records';
        const query_params = [];

        if (filter_employee_id)
        {
            sql_query += ' WHERE payroll_employee_id = $1';
            query_params.push(filter_employee_id);
        }

        sql_query += ' ORDER BY payroll_period_year DESC, payroll_period_month DESC';

        const payroll_result = await pool.query(sql_query, query_params);
        const employee_result = await pool.query(
            'SELECT employee_id, employee_full_name FROM employees'
        );

        // 2026-07-05 no JOIN per coding convention — merge in JS
        const employee_name_by_id = {};
        for (let i = 0; i < employee_result.rows.length; i++)
        {
            employee_name_by_id[employee_result.rows[i].employee_id] = employee_result.rows[i].employee_full_name;
        }

        const merged_rows = [];
        for (let i = 0; i < payroll_result.rows.length; i++)
        {
            const row = payroll_result.rows[i];
            row.employee_full_name = employee_name_by_id[row.payroll_employee_id];
            merged_rows.push(row);
        }

        res.json(merged_rows);
    }
    catch (error)
    {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async function (req, res)
{
    try
    {
        const payroll_employee_id = req.body.payroll_employee_id;
        const payroll_period_month = req.body.payroll_period_month;
        const payroll_period_year = req.body.payroll_period_year;

        // 2026-07-05 explicit if/else per coding convention
        let payroll_deductions = req.body.payroll_deductions;
        if (payroll_deductions === undefined || payroll_deductions === null)
        {
            payroll_deductions = 0;
        }

        let payroll_bonuses = req.body.payroll_bonuses;
        if (payroll_bonuses === undefined || payroll_bonuses === null)
        {
            payroll_bonuses = 0;
        }

        if (!payroll_employee_id || !payroll_period_month || !payroll_period_year)
        {
            res.status(400).json({ error: 'payroll_employee_id, payroll_period_month, and payroll_period_year are required' });
            return;
        }

        const employee_result = await pool.query(
            'SELECT employee_base_salary FROM employees WHERE employee_id = $1',
            [payroll_employee_id]
        );

        if (employee_result.rows.length === 0)
        {
            res.status(404).json({ error: 'Employee not found' });
            return;
        }

        const payroll_base_salary = employee_result.rows[0].employee_base_salary;
        const payroll_net_pay = (
            parseFloat(payroll_base_salary) +
            parseFloat(payroll_bonuses) -
            parseFloat(payroll_deductions)
        );

        const insert_result = await pool.query(
            'INSERT INTO payroll_records (payroll_employee_id, payroll_period_month, payroll_period_year, payroll_base_salary, payroll_deductions, payroll_bonuses, payroll_net_pay) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING payroll_id',
            [payroll_employee_id, payroll_period_month, payroll_period_year, payroll_base_salary, payroll_deductions, payroll_bonuses, payroll_net_pay]
        );

        res.status(201).json({ payroll_id: insert_result.rows[0].payroll_id, payroll_net_pay: payroll_net_pay, message: 'Payroll record created' });
    }
    catch (error)
    {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async function (req, res)
{
    try
    {
        const payroll_id = req.params.id;
        const result = await pool.query(
            'DELETE FROM payroll_records WHERE payroll_id = $1',
            [payroll_id]
        );

        if (result.rowCount === 0)
        {
            res.status(404).json({ error: 'Payroll record not found' });
        }
        else
        {
            res.json({ message: 'Payroll record deleted' });
        }
    }
    catch (error)
    {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
