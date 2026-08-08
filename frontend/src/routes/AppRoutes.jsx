import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from '../components/common/ProtectedRoute';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import VerifyOTP from '../pages/auth/VerifyOTP';
import TierPackageCreator from '../pages/organizer/TierPackageCreator';
import MyEvents from '../pages/organizer/MyEvents';
import EventBuilder from '../pages/organizer/EventBuilder';

import Discovery from '../pages/sponsor/Discovery';

import SponsorMatches from '../pages/organizer/SponsorMatches';

const AuthenticatedLanding = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
    <div className="rounded-xl bg-white p-8 text-center shadow">
      <h1 className="text-2xl font-bold text-slate-900">Authenticated</h1>
      <p className="mt-2 text-slate-600">Your authentication foundation is active.</p>
    </div>
  </div>
);

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<AuthenticatedLanding />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['organizer']} />}>
            <Route path="/organizer/events" element={<MyEvents />} />
            <Route path="/organizer/events/new" element={<EventBuilder />} />
            <Route path="/organizer/tier-packages" element={<TierPackageCreator />} />
            <Route path="/organizer/events/:eventId/matches" element={<SponsorMatches />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['sponsor']} />}>
            <Route path="/sponsor/discovery" element={<Discovery />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;
