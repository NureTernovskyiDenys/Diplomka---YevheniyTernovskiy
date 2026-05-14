import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Landing from './pages/Landing';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Exercises from './pages/Exercises';
import ExerciseDetail from './pages/ExerciseDetail';
import Workouts from './pages/Workouts';
import WorkoutDetail from './pages/WorkoutDetail';
import ActiveExercise from './pages/ActiveExercise';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import ComingSoon from './pages/ComingSoon';
import Profile from './pages/Profile';
import CalorieCalculator from './pages/CalorieCalculator';
import MacroCalculator from './pages/MacroCalculator';
import OneRepMax from './pages/OneRepMax';
import Subscriptions from './pages/Subscriptions';
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
        {/* Public Routes - Accessible to all */}
        <Route path="/" element={<Landing />} />
        <Route path="/map" element={<Home />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        {/* Auth Routes - Redirect if already logged in */}
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/demo" element={<ComingSoon />} />

        {/* Protected Routes - Only accessible IF logged in */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/exercises" element={<Exercises />} />
          <Route path="/exercise/:id" element={<ExerciseDetail />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/workout/:id" element={<WorkoutDetail />} />
          <Route path="/train/:sessionId/exercise/:exerciseId" element={<ActiveExercise />} />
          <Route path="/tools/calories" element={<CalorieCalculator />} />
          <Route path="/tools/macros" element={<MacroCalculator />} />
          <Route path="/tools/onerepmax" element={<OneRepMax />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          {/* Future authenticated routes go here */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
