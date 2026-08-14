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

// Feature 4 (Rafi): Discovery & Matching
import Discovery from '../pages/sponsor/Discovery';
import SponsorMatches from '../pages/organizer/SponsorMatches';

// Module 2
// Feature 1: Proposal Creator
import ProposalCreator from '../pages/organizer/ProposalCreator';
import MyProposals from '../pages/organizer/MyProposals';
// Feature 2: Proposal Review & In-Platform Negotiation
import ProposalInbox from '../pages/sponsor/ProposalInbox';
import SponsorProposalReview, { OrganizerProposalReview } from '../pages/sponsor/ProposalReview';
// Feature 3: Sponsor Portfolio Handler
import Portfolio from '../pages/sponsor/Portfolio';
// Feature 4: Proposal Status Tracker
import ProposalStatusTracker from '../pages/organizer/ProposalStatusTracker';

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

          {/* Feature 4 Routes (Rafi): Discovery & Matching */}
          <Route
            path="/sponsor/discovery"
            element={
              <ProtectedRoute allowedRoles={['sponsor']}>
                <Discovery />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/events/:eventId/matches"
            element={
              <ProtectedRoute allowedRoles={['organizer']}>
                <SponsorMatches />
              </ProtectedRoute>
            }
          />

          {/* ========== MODULE 2 | Feature 1: Proposal Creator — START ========== */}
          <Route
            path="/organizer/proposals"
            element={
              <ProtectedRoute allowedRoles={['organizer']}>
                <MyProposals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/proposals/new"
            element={
              <ProtectedRoute allowedRoles={['organizer']}>
                <ProposalCreator />
              </ProtectedRoute>
            }
          />
          {/* ========== MODULE 2 | Feature 1: Proposal Creator — END ========== */}
          {/* MODULE 2 | Feature 2: organizer view of a sent proposal (accept / counter) */}
          <Route
            path="/organizer/proposals/:proposalId"
            element={
              <ProtectedRoute allowedRoles={['organizer']}>
                <OrganizerProposalReview />
              </ProtectedRoute>
            }
          />
          {/* MODULE 2 | Feature 4: Proposal Status Tracker */}
          <Route
            path="/organizer/proposal-tracker"
            element={
              <ProtectedRoute allowedRoles={['organizer']}>
                <ProposalStatusTracker />
              </ProtectedRoute>
            }
          />

          {/* ========== MODULE 2 | Feature 2: Proposal Review & In-Platform Negotiation — START ========== */}
          <Route
            path="/sponsor/proposals"
            element={
              <ProtectedRoute allowedRoles={['sponsor']}>
                <ProposalInbox />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sponsor/proposals/:proposalId"
            element={
              <ProtectedRoute allowedRoles={['sponsor']}>
                <SponsorProposalReview />
              </ProtectedRoute>
            }
          />
          {/* ========== MODULE 2 | Feature 2: Proposal Review & In-Platform Negotiation — END ========== */}
          {/* MODULE 2 | Feature 3: Sponsor Portfolio Handler */}
          <Route
            path="/sponsor/portfolio"
            element={
              <ProtectedRoute allowedRoles={['sponsor']}>
                <Portfolio />
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
