import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import EmployeesPage from './pages/EmployeesPage';
import PayrollPage from './pages/PayrollPage';
import BillingPage from './pages/BillingPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App()
{
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/*" element={
                    <ProtectedRoute>
                        <div className="app-wrapper">
                            <nav className="sidebar">
                                <div className="sidebar-logo">Payroll <span>&</span> Billing</div>
                                <div className="nav-section">Workspace</div>
                                <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Employees</NavLink>
                                <NavLink to="/payroll" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Payroll</NavLink>
                                <NavLink to="/billing" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Billing</NavLink>
                            </nav>
                            <main className="main-content">
                                <Routes>
                                    <Route path="/" element={<EmployeesPage />} />
                                    <Route path="/payroll" element={<PayrollPage />} />
                                    <Route path="/billing" element={<BillingPage />} />
                                    <Route path="/billing/success" element={<div className="status-page">Payment successful.</div>} />
                                    <Route path="/billing/cancel" element={<div className="status-page">Payment cancelled.</div>} />
                                </Routes>
                            </main>
                        </div>
                    </ProtectedRoute>
                } />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
