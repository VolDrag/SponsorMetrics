# Module 3 Implementation Log

## Feature: Mutual Review & Rating System
**Files created:** backend/src/controllers/review.controller.js, backend/src/routes/review.routes.js, backend/src/validators/review.validator.js, frontend/src/services/reviewApi.js, frontend/src/components/common/RateDealModal.jsx, frontend/src/components/common/RateDealBanner.jsx, frontend/src/pages/common/PublicProfile.jsx
**Files modified:** backend/src/models/Review.js, backend/src/models/User.js, backend/src/models/Notification.js, backend/src/app.js, frontend/src/components/layout/DashboardLayout.jsx, frontend/src/routes/AppRoutes.jsx, frontend/src/components/organizer/SponsorMatchCard.jsx, frontend/src/pages/sponsor/ProposalReview.jsx, frontend/src/components/sponsor/MatchCard.jsx
**Core logic location:** backend/src/controllers/review.controller.js → isDealClosedForReview, createReview, getPendingReviews, refreshUserScores
**Logic explanation:** After a proposal is accepted and the event date has passed, both parties see a dashboard banner prompting them to rate reliability and communication (1–5) plus an optional comment. Each user can review a given deal only once; averages and review count are denormalized onto the User document and shown on the existing match/proposal profile surfaces plus the public profile review list. The closed-deal check is marked to be rewired to post-event report approval in Module 4 Feature 2.

## Feature: Sponsorship Performance & ROI Analytics
**Files created:** backend/src/models/PostEventMetrics.js, backend/src/controllers/analytics.controller.js, backend/src/routes/analytics.routes.js, backend/src/validators/analytics.validator.js, frontend/src/services/analyticsApi.js, frontend/src/pages/sponsor/AnalyticsDashboard.jsx, frontend/src/pages/organizer/PostEventMetricsPage.jsx
**Files modified:** backend/src/app.js, frontend/src/routes/AppRoutes.jsx, frontend/src/components/layout/DashboardLayout.jsx, frontend/src/pages/organizer/EventDetails.jsx, MODULE3_LOG.md
**Core logic location:** backend/src/controllers/analytics.controller.js → buildRoiPayload, getSponsorRoi, submitMetrics
**Logic explanation:** Organizers submit three post-event numbers (reach, engagement, attendance) against an accepted proposal. The ROI endpoint computes cost-per-reach, cost-per-engagement, and audience growth across a sponsor's dated event history, then benchmarks each event against the average of that sponsor's other sponsorships. The sponsor analytics page charts those KPIs with Recharts bars (plus average reference lines) and an audience-growth trend line.

## Feature: Budget Pacing & Overspend Alert System
**Files created:** backend/src/models/Budget.js, backend/src/controllers/budget.controller.js, backend/src/routes/budget.routes.js, backend/src/validators/budget.validator.js, frontend/src/services/budgetApi.js, frontend/src/components/sponsor/BudgetPacingWidget.jsx, frontend/src/pages/sponsor/BudgetSettings.jsx
**Files modified:** backend/src/app.js, backend/src/services/email.service.js, backend/src/controllers/proposal.controller.js, frontend/src/routes/AppRoutes.jsx, frontend/src/components/layout/DashboardLayout.jsx, frontend/src/pages/sponsor/Portfolio.jsx, frontend/src/pages/sponsor/Discovery.jsx, MODULE3_LOG.md
**Core logic location:** backend/src/controllers/budget.controller.js → recalculateForSponsor, buildPacing, maybeSendOverspendAlert
**Logic explanation:** Sponsors set a quarterly or annual budget. On dashboard load and immediately after a proposal is accepted, committed spend in the period is divided by days elapsed to get a daily burn rate, then projected across the full period. If projected overspend exceeds 10%, one email is sent per period via the existing mailer (`lastAlertSentAt` prevents repeats). A green/yellow/red progress widget sits on the sponsor dashboard, with a settings page to edit the budget.

## Feature: A/B Experiment Tracker for Sponsorship Formats
**Files created:** backend/src/controllers/experiment.controller.js, backend/src/routes/experiment.routes.js, backend/src/validators/experiment.validator.js, frontend/src/services/experimentApi.js, frontend/src/pages/sponsor/Experiments.jsx
**Files modified:** backend/src/models/Experiment.js, backend/src/models/SponsorshipTier.js, backend/src/models/Proposal.js, backend/src/controllers/tier.controller.js, backend/src/controllers/proposal.controller.js, backend/src/app.js, frontend/src/routes/AppRoutes.jsx, frontend/src/components/layout/DashboardLayout.jsx, MODULE3_LOG.md
**Core logic location:** backend/src/controllers/experiment.controller.js → scoreExperiment, createExperiment
**Logic explanation:** Tiers and proposals now carry a `formatType` (inferred from package benefits if not set). Sponsors create experiments with a primary KPI and tagged-event variants. The API averages that metric per variant, treats the most-tagged (or manually marked) variant as control, computes lift%, and flags a winner using lower-is-better for cost metrics and higher-is-better for reach/engagement/growth. The results page charts variants and badges the winner.

