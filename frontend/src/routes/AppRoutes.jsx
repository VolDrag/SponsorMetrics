import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from '../components/common/ProtectedRoute';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import VerifyOTP from '../pages/auth/VerifyOTP';

// Feature 1 (Debashish): Event Profile & Proposal Builder
import MyEvents from '../pages/organizer/MyEvents';
import EventBuilder from '../pages/organizer/EventBuilder';
import EventDetails from '../pages/organizer/EventDetails';

// Feature 2 (Ifty): Sponsorship Tier Package Creator
import TierPackageCreator from '../pages/organizer/TierPackageCreator';

// Feature 3 (Your Feature): Proposal Strength Analyzer
import ProposalStrengthAnalyzer from '../pages/organizer/ProposalStrengthAnalyzer';

const AppRoutes = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />

          {/* Feature 1 Routes (Debashish) */}
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
          <Route
            path="/organizer/events/:id"
            element={
              <ProtectedRoute allowedRoles={['organizer']}>
                <EventDetails />
              </ProtectedRoute>
            }
          />

          {/* Feature 2 Routes (Ifty) */}
          <Route
            path="/organizer/events/:eventId/tiers"
            element={
              <ProtectedRoute allowedRoles={['organizer']}>
                <TierPackageCreator />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/tiers"
            element={
              <ProtectedRoute allowedRoles={['organizer']}>
                <TierPackageCreator />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/tier-packages"
            element={
              <ProtectedRoute allowedRoles={['organizer']}>
                <TierPackageCreator />
              </ProtectedRoute>
            }
          />

          {/* Feature 3 Route (Your Feature: Proposal Strength Analyzer) */}
          <Route
            path="/organizer/proposal-analyzer"
            element={
              <ProtectedRoute allowedRoles={['organizer']}>
                <ProposalStrengthAnalyzer />
              </ProtectedRoute>
            }
          />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default AppRoutes;