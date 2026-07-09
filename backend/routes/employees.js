// routes/employees.js
// 2026-07-05 added employee_status field

const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async function (req, res)
{
    try
    {
        const result = await pool.query(
            'SELECT employee_id, employee_full_name, employee_email, employee_position, employee_base_salary, employee_join_date, employee_status FROM employees ORDER BY employee_id DESC'
        );
        res.json(result.rows);
    }
    catch (error)
    {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async function (req, res)
{
    try
    {
        const employee_id = req.params.id;
        const result = await pool.query(
            'SELECT employee_id, employee_full_name, employee_email, employee_position, employee_base_salary, employee_join_date, employee_status FROM employees WHERE employee_id = $1',
            [employee_id]
        );
        if (result.rows.length === 0)
        {
            res.status(404).json({ error: 'Employee not found' });
        }
        else
        {
            res.json(result.rows[0]);
        }
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
        const employee_full_name = req.body.employee_full_name;
        const employee_email = req.body.employee_email;
        const employee_position = req.body.employee_position;
        const employee_base_salary = req.body.employee_base_salary;
        const employee_join_date = req.body.employee_join_date;

        let employee_status = req.body.employee_status;
        if (!employee_status)
        {
            employee_status = 'Active';
        }

        if (!employee_full_name || !employee_email || !employee_base_salary)
        {
            res.status(400).json({ error: 'employee_full_name, employee_email, employee_base_salary required' });
            return;
        }

        const result = await pool.query(
            'INSERT INTO employees (employee_full_name, employee_email, employee_position, employee_base_salary, employee_join_date, employee_status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING employee_id',
            [employee_full_name, employee_email, employee_position, employee_base_salary, employee_join_date, employee_status]
        );

        res.status(201).json({ employee_id: result.rows[0].employee_id, message: 'Employee created' });
    }
    catch (error)
    {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async function (req, res)
{
    try
    {
        const employee_id = req.params.id;
        const employee_full_name = req.body.employee_full_name;
        const employee_email = req.body.employee_email;
        const employee_position = req.body.employee_position;
        const employee_base_salary = req.body.employee_base_salary;
        const employee_join_date = req.body.employee_join_date;

        let employee_status = req.body.employee_status;
        if (!employee_status)
        {
            employee_status = 'Active';
        }

        const result = await pool.query(
            'UPDATE employees SET employee_full_name = $1, employee_email = $2, employee_position = $3, employee_base_salary = $4, employee_join_date = $5, employee_status = $6 WHERE employee_id = $7',
            [employee_full_name, employee_email, employee_position, employee_base_salary, employee_join_date, employee_status, employee_id]
        );

        if (result.rowCount === 0)
        {
            res.status(404).json({ error: 'Employee not found' });
        }
        else
        {
            res.json({ message: 'Employee updated' });
        }
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
        const employee_id = req.params.id;
        const result = await pool.query('DELETE FROM employees WHERE employee_id = $1', [employee_id]);
        if (result.rowCount === 0)
        {
            res.status(404).json({ error: 'Employee not found' });
        }
        else
        {
            res.json({ message: 'Employee deleted' });
        }
    }
    catch (error)
    {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
