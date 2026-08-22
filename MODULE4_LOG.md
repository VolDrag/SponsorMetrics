# Module 4 Implementation Log

## Feature: Volunteer Management System
**Files created:** backend/src/models/Volunteer.js, backend/src/models/VolunteerEmailLog.js, backend/src/controllers/volunteer.controller.js, backend/src/routes/volunteer.routes.js, backend/src/validators/volunteer.validator.js, frontend/src/services/volunteerApi.js, frontend/src/pages/organizer/VolunteerManagement.jsx, frontend/src/pages/public/VolunteerSignup.jsx
**Files modified:** backend/src/app.js, backend/src/services/email.service.js, frontend/src/routes/AppRoutes.jsx, frontend/src/pages/organizer/EventDetails.jsx
**Core logic location:** backend/src/controllers/volunteer.controller.js → createVolunteer, toggleCheckIn, emailVolunteers
**Logic explanation:** Organizers maintain an event roster (name, email, phone, role, shift, notes) with an event-day check-in toggle grouped by role/shift. They can email all volunteers or a role/selection through the existing mailer, and each send is logged with recipients, subject, and timestamp. A no-login public signup link writes into the same Volunteer collection as a stretch item after the roster flow.

## Feature: Post-Event Report & Approval Workflow
**Files created:** backend/src/controllers/report.controller.js, backend/src/routes/report.routes.js, backend/src/services/forensics.service.js, frontend/src/services/reportApi.js, frontend/src/pages/organizer/OrganizerReportPage.jsx, frontend/src/pages/sponsor/SponsorReportReview.jsx
**Files modified:** backend/src/models/PostEventMetrics.js, backend/src/middleware/upload.js, backend/src/controllers/review.controller.js, backend/src/app.js, frontend/src/routes/AppRoutes.jsx, frontend/src/components/layout/DashboardLayout.jsx, frontend/src/pages/organizer/PostEventMetricsPage.jsx, MODULE4_LOG.md
**Core logic location:** backend/src/controllers/report.controller.js → saveReport, submitReport, approveReport, requestRevision
**Logic explanation:** The existing PostEventMetrics document now carries crowd photos, engagement screenshots, a Draft→Submitted→Under Review→Revision Requested→Approved workflow, timestamped revision comments, and a sponsor digital sign-off that locks the report. Mutual reviews (Module 3 Feature 1) now open only after approval. Uploaded photos call the forensics service so Module 4 Feature 3 can attach Verified / Needs Review / Unverified badges in the sponsor gallery.

## Feature: AI Fraud & Spam Detection + Media Forensics
**Files created:** backend/src/services/fraud.service.js, backend/src/models/PhotoHash.js, backend/.env.example
**Files modified:** backend/src/services/forensics.service.js, backend/src/models/Proposal.js, backend/src/models/User.js, backend/src/controllers/proposal.controller.js, backend/src/controllers/auth.controller.js, backend/src/validators/auth.validator.js, frontend/src/pages/auth/Register.jsx, backend/package.json, MODULE4_LOG.md
**Core logic location:** backend/src/services/fraud.service.js → screenProposal; backend/src/services/forensics.service.js → inspectImage
**Logic explanation:** Sending a proposal now runs rule-based fraud checks (missing website, free-email institutions, duplicate org names, budget-per-attendee ceiling, copy-paste similarity). Flagged pitches stay drafted and the organizer sees why they were held rather than going to the sponsor. Report photo uploads call Hugging Face for AI-image likelihood and compare a perceptual hash against other events; API failures stay Unverified (fail-open) and badges show in the sponsor gallery.

## Feature: AI-Powered Marketing Consultation
**Files created:** backend/src/controllers/marketing.controller.js, backend/src/routes/marketing.routes.js, frontend/src/services/marketingApi.js, frontend/src/components/organizer/MarketingAdvicePanel.jsx
**Files modified:** backend/src/services/gemini.service.js, backend/src/app.js, frontend/src/pages/organizer/EventDetails.jsx, frontend/src/pages/organizer/ProposalCreator.jsx, frontend/src/pages/sponsor/ProposalReview.jsx, MODULE4_LOG.md
**Core logic location:** backend/src/controllers/marketing.controller.js → getEventAdvice; backend/src/services/gemini.service.js → generateMarketingAdvice
**Logic explanation:** Organizers click Get Marketing Advice on the event or proposal page. The backend injects that event's crowd, venue, package budget range, and past post-event metrics into the shared Gemini client, then parses a JSON array of channel/content/pricing cards. Malformed model output falls back to local structured suggestions; the panel matches the Help Me Write loading and regenerate pattern.



