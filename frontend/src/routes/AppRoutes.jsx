import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from '../components/common/ProtectedRoute';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
<<<<<<< HEAD
import VerifyOTP from '../pages/auth/VerifyOTP';
// ifty
import TierPackageCreator from '../pages/organizer/TierPackageCreator';
// ifty end

const AuthenticatedLanding = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
    <div className="rounded-xl bg-white p-8 text-center shadow">
      <h1 className="text-2xl font-bold text-slate-900">Authenticated</h1>
      <p className="mt-2 text-slate-600">Your authentication foundation is active.</p>
    </div>
  </div>
);

// ifty
const organizerTierRoute = (
  <Route element={<ProtectedRoute allowedRoles={['organizer']} />}>
    <Route path="/organizer/tier-packages" element={<TierPackageCreator />} />
  </Route>
);
// ifty end

const AppRoutes = () => (
  <Routes>
    <Route path="/register" element={<Register />} />
    <Route path="/verify-otp" element={<VerifyOTP />} />
    <Route path="/login" element={<Login />} />

    <Route element={<ProtectedRoute />}>
      <Route path="/" element={<AuthenticatedLanding />} />
    </Route>
    {organizerTierRoute}

    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);
=======
import MyEvents from '../pages/organizer/MyEvents';
import EventBuilder from '../pages/organizer/EventBuilder';

const AppRoutes = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/organizer/events"
            element={
              <ProtectedRoute allowedRoles={['organizer']}>
                <MyEvents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/events/new"
            element={
              <ProtectedRoute allowedRoles={['organizer']}>
                <EventBuilder />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Login />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
>>>>>>> 39bb17d90599a739c5041e532ad6f933f7b961a3

export default AppRoutes;
