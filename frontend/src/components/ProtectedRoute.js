// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { get_token } from '../api';

function ProtectedRoute({ children })
{
    const token = get_token();
    if (!token) return <Navigate to="/login" replace />;
    return children;
}

export default ProtectedRoute;
