import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

const ProtectedRoute = () => {
    // If not authenticated, redirect to login page
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    // If authenticated, render the child route components (Dashboard, etc.)
    return <Outlet />;
};

export default ProtectedRoute;
