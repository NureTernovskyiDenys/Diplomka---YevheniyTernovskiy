import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ComingSoon from './pages/ComingSoon';
import ProtectedRoute from './components/ProtectedRoute';
import { isAuthenticated } from './utils/auth';

// Helper component to redirect authenticated users away from public pages (like Home/Login)
const PublicOnlyRoute = ({ children }) => {
  return isAuthenticated() ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes - Only accessible if NOT logged in */}
        <Route path="/" element={<PublicOnlyRoute><Home /></PublicOnlyRoute>} />
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/demo" element={<ComingSoon />} />

        {/* Protected Routes - Only accessible IF logged in */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Future authenticated routes go here */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
