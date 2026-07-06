-- 2026-07-05 Postgres schema (migrated from MySQL)
-- Run via Railway Postgres shell or psql

CREATE TABLE IF NOT EXISTS employees (
    employee_id SERIAL PRIMARY KEY,
    employee_full_name VARCHAR(150) NOT NULL,
    employee_email VARCHAR(150) NOT NULL UNIQUE,
    employee_position VARCHAR(100),
    employee_base_salary NUMERIC(12,2) NOT NULL,
    employee_join_date DATE,
    employee_created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payroll_records (
    payroll_id SERIAL PRIMARY KEY,
    payroll_employee_id INT NOT NULL REFERENCES employees(employee_id),
    payroll_period_month INT NOT NULL,
    payroll_period_year INT NOT NULL,
    payroll_base_salary NUMERIC(12,2) NOT NULL,
    payroll_deductions NUMERIC(12,2) DEFAULT 0,
    payroll_bonuses NUMERIC(12,2) DEFAULT 0,
    payroll_net_pay NUMERIC(12,2) NOT NULL,
    payroll_created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
    subscription_id SERIAL PRIMARY KEY,
    subscription_customer_email VARCHAR(150) NOT NULL,
    subscription_plan_name VARCHAR(50) NOT NULL,
    subscription_stripe_customer_id VARCHAR(255),
    subscription_stripe_subscription_id VARCHAR(255),
    subscription_status VARCHAR(50) DEFAULT 'pending',
    subscription_created_at TIMESTAMP DEFAULT NOW(),
    subscription_updated_at TIMESTAMP DEFAULT NOW()
);

-- Sample data
INSERT INTO employees (employee_full_name, employee_email, employee_position, employee_base_salary, employee_join_date)
VALUES
('Budi Santoso', 'budi@example.com', 'Backend Developer', 8000000, '2024-01-15'),
('Siti Aminah', 'siti@example.com', 'Frontend Developer', 7500000, '2024-03-01');
