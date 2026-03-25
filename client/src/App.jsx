import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import RecruiterDashboard from './pages/RecruiterDashboard';
import ApplyJob from './pages/ApplyJob';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- 🔓 PUBLIC ROUTES --- */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* --- 🛡️ PROTECTED WRAPPER (Shares the same Layout) --- */}
        <Route element={<Layout />}>
          
          {/* 🏢 RECRUITER ONLY ZONE */}
          <Route element={<ProtectedRoute allowedRoles={['recruiter']} />}>
            <Route path="/dashboard" element={<RecruiterDashboard />} />
            {/* Add more recruiter pages here: /manage-jobs, /analytics, etc. */}
          </Route>

          {/* 📝 CANDIDATE ONLY ZONE */}
          <Route element={<ProtectedRoute allowedRoles={['candidate']} />}>
            <Route path="/apply" element={<ApplyJob />} />
            {/* Add more candidate pages here: /my-applications, /profile, etc. */}
          </Route>

        </Route>

        {/* --- 🚩 404 / FALLBACK --- */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;