# SponsorMetrics BD — Complete Project Context & Feature Architecture Guide

> **Note for Gemini / AI Assistants:**  
> This document contains the complete context, directory structure, data schemas, API routes, controller logic, and frontend components for the **SponsorMetrics BD** platform.  
> When answering questions or providing solutions:
> 1. Always specify the **exact file path** (e.g., `backend/src/controllers/tier.controller.js` or `frontend/src/pages/sponsor/ProposalReview.jsx`).
> 2. Indicate the exact **function, component, or line region** where modifications should be made.
> 3. Provide production-ready code snippets that conform to the existing patterns in this document.

---

## 1. Project Overview & Tech Stack

**SponsorMetrics BD** is a two-sided sponsorship marketplace and performance-management platform tailored for Bangladesh. Event organizers (university clubs, NGOs, startups) create event profiles, build sponsorship tiers, and send proposals. Sponsors discover events, negotiate packages, manage campaign portfolios, track budget burn rates, analyze post-event ROI, and approve post-event reports.

### Tech Stack Summary
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose ORM)
- **Frontend:** React.js (Vite), TailwindCSS, Lucide React icons, Recharts
- **Authentication:** JWT (JSON Web Tokens), bcryptjs, role-based access control (`organizer`, `sponsor`, `admin`)
- **External Services & Libraries:**
  - **Gemini API:** AI-assisted proposal writing (`@google/genai` / `@google/generative-ai`), ROI analytics narrative, and AI marketing advice.
  - **HuggingFace Inference API:** Media forensics and proof verification on post-event crowd photos.
  - **Multer:** Local image/photo upload handling (`uploads/campaigns`, `uploads/reports`).
  - **Leaflet.js / OpenStreetMap:** Interactive mapping for event locations.
  - **Nodemailer:** Email notifications (overspend alerts, volunteer roster emails).

---

## 2. Overall Directory Structure

```
SponsorMetrics/
├── backend/
│   ├── uploads/                      # Local uploaded media (campaigns, reports)
│   ├── src/
│   │   ├── app.js                    # Express app initialization & route mounting
│   │   ├── controllers/
│   │   │   ├── analytics.controller.js  # Module 3 Feature 2: ROI Analytics
│   │   │   ├── auth.controller.js       # Auth & OTP registration
│   │   │   ├── budget.controller.js      # Module 3 Feature 3: Budget Pacing
│   │   │   ├── campaign.controller.js    # Module 2 Feature 3: Sponsor Portfolio
│   │   │   ├── event.controller.js       # Module 1 Feature 1: Event Builder
│   │   │   ├── experiment.controller.js # Module 3 Feature 4: A/B Experiment Tracker
│   │   │   ├── marketing.controller.js  # Module 4 Feature 4: AI Marketing Advice
│   │   │   ├── proposal.controller.js   # Module 2 Features 1, 2, 4: Proposals & Negotiation
│   │   │   ├── report.controller.js     # Module 4 Feature 2: Post-Event Reports Workflow
│   │   │   ├── review.controller.js     # Module 3 Feature 1: Rating & Review
│   │   │   ├── tier.controller.js       # Module 1 Feature 2: Tier Creator
│   │   │   └── volunteer.controller.js  # Module 4 Feature 1: Volunteer Management
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js     # JWT auth & role validation
│   │   │   └── upload.js              # Multer configuration for file uploads
│   │   ├── models/
│   │   │   ├── Budget.js              # Sponsor budget schema
│   │   │   ├── Campaign.js            # Campaign portfolio schema
│   │   │   ├── Deal.js                # Accepted deal schema
│   │   │   ├── Event.js               # Event profile schema
│   │   │   ├── Experiment.js          # A/B Experiment schema
│   │   │   ├── Notification.js        # User notifications schema
│   │   │   ├── PhotoHash.js           # Media forensics photo hashes
│   │   │   ├── PostEventMetrics.js    # ROI metrics & post-event report schema
│   │   │   ├── Proposal.js            # Proposal & counter-offer schema
│   │   │   ├── Review.js              # Mutual ratings/reviews schema
│   │   │   ├── SponsorshipTier.js     # Sponsorship tier package schema
│   │   │   ├── User.js                # User accounts & roles schema
│   │   │   ├── Volunteer.js           # Volunteer roster schema
│   │   │   └── VolunteerEmailLog.js   # Sent volunteer emails log
│   │   ├── routes/
│   │   │   ├── analytics.routes.js    # /api/analytics
│   │   │   ├── auth.routes.js         # /api/auth
│   │   │   ├── budget.routes.js       # /api/budgets
│   │   │   ├── campaign.routes.js     # /api/campaigns
│   │   │   ├── event.routes.js        # /api/events
│   │   │   ├── experiment.routes.js   # /api/experiments
│   │   │   ├── marketing.routes.js    # /api/marketing
│   │   │   ├── matchRoutes.js         # /api/matches
│   │   │   ├── proposalRoutes.js      # /api/proposals
│   │   │   ├── report.routes.js       # /api/reports
│   │   │   ├── review.routes.js       # /api/reviews
│   │   │   ├── tier.routes.js         # /api/tiers
│   │   │   └── volunteer.routes.js    # /api/volunteers
│   │   ├── services/
│   │   │   ├── email.service.js       # Nodemailer helper
│   │   │   ├── forensics.service.js   # HuggingFace & perceptual hash helper
│   │   │   ├── fraud.service.js       # Rule-based proposal fraud detector
│   │   │   ├── gemini.service.js      # Gemini AI client wrapper
│   │   │   └── match.service.js       # Smart matching algorithm
│   │   ├── utils/
│   │   │   ├── benefitPresets.js      # Predefined tier package deliverables
│   │   │   └── proposalAnalyzer.js    # Proposal score calculator
│   │   └── validators/
│   │       ├── analytics.validator.js
│   │       ├── auth.validator.js
│   │       ├── campaign.validator.js
│   │       ├── proposal.validator.js
│   │       ├── tier.validator.js
│   │       └── volunteer.validator.js
├── frontend/
│   ├── src/
│   │   ├── main.jsx                   # React entry point
│   │   ├── index.css                  # Global Tailwind CSS styles
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── NegotiationHistory.jsx
│   │   │   │   ├── ProtectedRoute.jsx
│   │   │   │   ├── RateDealBanner.jsx
│   │   │   │   └── RateDealModal.jsx
│   │   │   ├── layout/
│   │   │   │   └── DashboardLayout.jsx
│   │   │   ├── organizer/
│   │   │   │   ├── AiProposalAssistant.jsx
│   │   │   │   ├── MarketingAdvicePanel.jsx
│   │   │   │   ├── ProposalPipelineCard.jsx
│   │   │   │   ├── SponsorMatchCard.jsx
│   │   │   │   └── TierCard.jsx
│   │   │   └── sponsor/
│   │   │       ├── AnalyticsInsightPanel.jsx
│   │   │       ├── BudgetPacingWidget.jsx
│   │   │       ├── CounterOfferForm.jsx
│   │   │       ├── EventReportModal.jsx
│   │   │       ├── MatchCard.jsx
│   │   │       └── PortfolioCard.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # User authentication state & methods
│   │   ├── pages/
│   │   │   ├── auth/ (Login.jsx, Register.jsx, VerifyOTP.jsx)
│   │   │   ├── common/ (PublicProfile.jsx)
│   │   │   ├── organizer/
│   │   │   │   ├── EventBuilder.jsx
│   │   │   │   ├── EventDetails.jsx
│   │   │   │   ├── MarketingAdvicePanel.jsx
│   │   │   │   ├── MyEvents.jsx
│   │   │   │   ├── MyProposals.jsx
│   │   │   │   ├── OrganizerReportPage.jsx
│   │   │   │   ├── PostEventMetricsPage.jsx
│   │   │   │   ├── ProposalCreator.jsx
│   │   │   │   ├── ProposalStatusTracker.jsx
│   │   │   │   ├── ProposalStrengthAnalyzer.jsx
│   │   │   │   ├── SponsorMatches.jsx
│   │   │   │   ├── TierPackageCreator.jsx
│   │   │   │   └── VolunteerManagement.jsx
│   │   │   ├── public/ (VolunteerSignup.jsx)
│   │   │   └── sponsor/
│   │   │       ├── AnalyticsDashboard.jsx
│   │   │       ├── BudgetSettings.jsx
│   │   │       ├── Discovery.jsx
│   │   │       ├── Experiments.jsx
│   │   │       ├── Portfolio.jsx
│   │   │       ├── ProposalInbox.jsx
│   │   │       ├── ProposalReview.jsx
│   │   │       └── SponsorReportReview.jsx
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx          # React Router v6 route configuration
│   │   └── services/
│   │       ├── api.js                 # Axios instance with auth headers
│   │       ├── analyticsApi.js
│   │       ├── budgetApi.js
│   │       ├── campaignApi.js
│   │       ├── eventApi.js
│   │       ├── experimentApi.js
│   │       ├── marketingApi.js
│   │       ├── proposalApi.js
│   │       ├── reportApi.js
│   │       ├── reviewApi.js
│   │       ├── tierApi.js
│   │       └── volunteerApi.js
```

---

## 3. Detailed Architecture of Modules 1-4 (Feature 2s)

This section provides in-depth technical documentation for **Feature 2 across Modules 1 to 4**.

---

### 3.1 Module 1 — Feature 2: Sponsorship Tier Package Creator

#### Feature Summary
Organizers design standard tier packages (e.g., Gold, Silver, Bronze) or custom tiers for their events. Each tier specifies a price, format type, and a structured list of deliverables/benefits (e.g., main banner placement, stage speaking slot, social media posts).

#### Backend Model: `backend/src/models/SponsorshipTier.js`
```javascript
const mongoose = require('mongoose');

const benefitSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    detail: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const sponsorshipTierSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    isCustom: { type: Boolean, default: false },
    formatType: {
      type: String,
      enum: ['banner', 'booth', 'speaking_slot', 'social_post', 'other'],
      default: 'other',
    },
    benefits: { type: [benefitSchema], default: [] },
  },
  { timestamps: true, collection: 'sponsorshiptiers' }
);

module.exports = mongoose.model('SponsorshipTier', sponsorshipTierSchema);
```

#### Backend Controller: `backend/src/controllers/tier.controller.js`
Key exported controller methods:
- `createTier`: Validates `eventId`, ownership, price $\ge 0$, normalizes benefits array, infers `formatType` (from benefit labels if not specified), and saves tier.
- `getTiersByEvent`: Fetches all tiers associated with a given `eventId` sorted by creation date.
- `updateTier`: Updates tier name, price, benefits, and formatType with ownership verification.
- `deleteTier`: Deletes tier after ownership validation.
- `getOrganizerEvents`: Retrieves all events belonging to the logged-in organizer for tier selection.

#### API Routes: `backend/src/routes/tier.routes.js`
- `POST /api/tiers` $\rightarrow$ `createTier` (Organizer Auth)
- `GET /api/tiers/organizer-events` $\rightarrow$ `getOrganizerEvents` (Organizer Auth)
- `GET /api/tiers/event/:eventId` $\rightarrow$ `getTiersByEvent` (Auth)
- `PUT /api/tiers/:tierId` $\rightarrow$ `updateTier` (Organizer Auth)
- `DELETE /api/tiers/:tierId` $\rightarrow$ `deleteTier` (Organizer Auth)

#### Frontend Services & Views
- `frontend/src/services/tierApi.js`: API wrapper for tier endpoints (`getOrganizerEvents`, `getTiersByEvent`, `createTier`, `updateTier`, `deleteTier`).
- `frontend/src/pages/organizer/TierPackageCreator.jsx`: Multi-step interface for picking an event, choosing preset tiers (Gold/Silver/Bronze) or creating custom packages, adding preset or custom benefits, setting prices, and saving tiers.
- `frontend/src/components/organizer/TierCard.jsx`: Reusable tier presentation card with action triggers for editing or deletion.

---

### 3.2 Module 2 — Feature 2: Proposal Review & In-Platform Negotiation

#### Feature Summary
Enables sponsors to review incoming event proposals, accept, reject, or submit counter-offers with proposed budget adjustments and package benefit swaps (e.g. swapping a banner for a booth slot). Stores a full negotiation history and enforces a turn-taking restriction (`lastActionBy`) to prevent users from accepting their own counter-offers.

#### Backend Model: `backend/src/models/Proposal.js` (Negotiation sub-schemas)
```javascript
const counterOfferSchema = new mongoose.Schema(
  {
    offeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['sponsor', 'organizer'], required: true },
    proposedBudget: { type: Number, min: 0 },
    swapFrom: { type: String, trim: true, default: '' },
    swapTo: { type: String, trim: true, default: '' },
    message: { type: String, trim: true, default: '', maxlength: 2000 },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  },
  { timestamps: true }
);

// Added to proposalSchema:
// status: ['drafted', 'sent', 'viewed', 'negotiation', 'accepted', 'rejected']
// counterOffers: [counterOfferSchema]
// lastActionBy: { userId: ObjectId, role: 'organizer' | 'sponsor' }
// viewedAt: Date
```

#### Backend Controller: `backend/src/controllers/proposal.controller.js` (Negotiation methods)
- `getProposalById`: Fetches proposal. If viewed by sponsor for the first time while status is `sent`, updates status to `viewed` and sets `viewedAt`.
- `counterOffer`: Validates role and checks `lastActionBy` to prevent self-countering. Appends counter-offer subdocument, updates proposal `status` to `negotiation`, sets `proposedBudget` to new value, and updates `lastActionBy`.
- `acceptProposal`: Verifies caller is not the same role as `lastActionBy`. Marks proposal status as `accepted`, sets active counter offer status to `accepted`, creates/updates a `Campaign` record for the sponsor portfolio, and creates a `Deal`.
- `rejectProposal`: Marks proposal status as `rejected`.

#### API Routes: `backend/src/routes/proposalRoutes.js`
- `GET /api/proposals/inbox` $\rightarrow$ `getInbox` (Sponsor Auth)
- `GET /api/proposals/:id` $\rightarrow$ `getProposalById` (Auth)
- `POST /api/proposals/:id/counter` $\rightarrow$ `counterOffer` (Auth)
- `PATCH /api/proposals/:id/accept` $\rightarrow$ `acceptProposal` (Auth)
- `PATCH /api/proposals/:id/reject` $\rightarrow$ `rejectProposal` (Auth)

#### Frontend Services & Views
- `frontend/src/services/proposalApi.js`: Axios methods for fetching inbox/details, sending counter-offers, accepting, and rejecting deals.
- `frontend/src/pages/sponsor/ProposalInbox.jsx`: Inbox view of incoming proposals filtered by status.
- `frontend/src/pages/sponsor/ProposalReview.jsx`: Sponsor detailed review page with action buttons (Accept, Reject, Counter Offer). Also exports `OrganizerProposalReview` for organizers to review counter-offers.
- `frontend/src/components/sponsor/CounterOfferForm.jsx`: Modal form for specifying budget changes, item swaps, and custom negotiation messages.
- `frontend/src/components/common/NegotiationHistory.jsx`: Timeline rendering previous counter-offers with timestamps, roles, swapped items, and messages.

---

### 3.3 Module 3 — Feature 2: Sponsorship Performance & ROI Analytics

#### Feature Summary
Provides sponsors with a dedicated ROI analytics dashboard comparing post-event performance metrics (total reach, total engagement, audience growth) against their own historical averages. Features interactive Recharts visualization and an integrated AI Insight Panel powered by Gemini for custom Q&A on performance metrics.

#### Backend Model: `backend/src/models/PostEventMetrics.js`
```javascript
const postEventMetricsSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    proposalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Proposal', required: true, unique: true },
    totalReach: { type: Number, required: true, min: 0 },
    totalEngagement: { type: Number, required: true, min: 0 },
    attendeeCount: { type: Number, required: true, min: 0 },
    submittedAt: { type: Date, default: Date.now },
    // Extended in Module 4 for Post-Event Reports Workflow
    crowdPhotos: [{ url: String, mediaForensicsResult: Object }],
    engagementScreenshots: [{ url: String, mediaForensicsResult: Object }],
    status: { type: String, enum: ['Draft', 'Submitted', 'Under Review', 'Revision Requested', 'Approved'], default: 'Draft' },
    reviewComments: [{ authorId: ObjectId, role: String, comment: String, createdAt: Date }],
    signOff: { sponsorId: ObjectId, approvedAt: Date },
  },
  { timestamps: true, collection: 'posteventmetrics' }
);
```

#### Backend Controller & Services
- `backend/src/controllers/analytics.controller.js`:
  - `submitMetrics`: Allows organizers to enter/update post-event numbers for an accepted proposal.
  - `getSponsorRoi`: Computes cost-per-reach ($CPR = \frac{\text{Budget}}{\text{Total Reach}}$), cost-per-engagement ($CPE = \frac{\text{Budget}}{\text{Total Engagement}}$), and historical average benchmarks for the requesting sponsor.
  - `askAboutRoi`: Takes user questions and metrics context, calls `gemini.service.js` (`explainRoiStats`), and returns AI-generated performance advice.
- `backend/src/services/gemini.service.js` $\rightarrow$ `explainRoiStats`: Formats KPI data into a structured prompt for Gemini to generate actionable ROI narratives.

#### API Routes: `backend/src/routes/analytics.routes.js`
- `POST /api/analytics/submit` $\rightarrow$ `submitMetrics` (Organizer Auth)
- `GET /api/analytics/sponsor-roi` $\rightarrow$ `getSponsorRoi` (Sponsor Auth)
- `POST /api/analytics/ask` $\rightarrow$ `askAboutRoi` (Sponsor Auth)

#### Frontend Services & Views
- `frontend/src/services/analyticsApi.js`: API functions for ROI stats retrieval and AI questions (`getSponsorRoi`, `askAboutRoi`, `submitMetrics`).
- `frontend/src/pages/sponsor/AnalyticsDashboard.jsx`: Sponsor analytics suite featuring Recharts Bar and Line charts comparing event KPIs to benchmark averages.
- `frontend/src/pages/organizer/PostEventMetricsPage.jsx`: Organizer page for keying in reach, engagement, and attendee counts.
- `frontend/src/components/sponsor/AnalyticsInsightPanel.jsx`: AI chat widget interface for asking Gemini about campaign performance and ROI improvements.

---

### 3.4 Module 4 — Feature 2: Post-Event Report & Approval Workflow

#### Feature Summary
A formal post-event verification workflow. Organizers upload crowd proof photos and engagement screenshots. Sponsors review the submissions (with automated Hugging Face AI fraud/forensics verification badges), comment with timestamped feedback, request revisions, or grant a 1-click digital sign-off that locks and archives the report.

#### Backend Controller: `backend/src/controllers/report.controller.js`
- `getReport`: Loads post-event report document for a proposal; updates status from `Submitted` to `Under Review` when opened by a sponsor.
- `listSponsorReports`: Lists all reports sent to the requesting sponsor.
- `saveReport`: Organizer endpoint to update metrics and append uploaded crowd/screenshot photos via `multer` (`backend/src/middleware/upload.js`). Triggers `forensics.service.js` (`inspectImage`) for Hugging Face image classification.
- `submitReport`: Moves report status from `Draft` / `Revision Requested` to `Submitted`.
- `approveReport`: Grants sponsor approval, records `signOff` timestamp/sponsorId, and transitions status to `Approved` (locking the report).
- `requestRevision`: Appends sponsor revision comments and flips status to `Revision Requested`.

#### Helper Services & Middleware
- `backend/src/services/forensics.service.js`: Runs image classification via HuggingFace Inference API to check photo validity, flagging potential stock/AI photos with verification badges (`Verified`, `Needs Review`, `Unverified`).
- `backend/src/middleware/upload.js`: Handles multipart disk uploads to `uploads/reports/`.

#### API Routes: `backend/src/routes/report.routes.js`
- `GET /api/reports/sponsor` $\rightarrow$ `listSponsorReports` (Sponsor Auth)
- `GET /api/reports/:proposalId` $\rightarrow$ `getReport` (Auth)
- `POST /api/reports/:proposalId/save` $\rightarrow$ `saveReport` (Organizer Auth + Multer upload)
- `POST /api/reports/:proposalId/submit` $\rightarrow$ `submitReport` (Organizer Auth)
- `POST /api/reports/:proposalId/approve` $\rightarrow$ `approveReport` (Sponsor Auth)
- `POST /api/reports/:proposalId/revision` $\rightarrow$ `requestRevision` (Sponsor Auth)

#### Frontend Services & Views
- `frontend/src/services/reportApi.js`: Handles report fetching, photo uploads (FormData), submissions, approvals, and revision requests.
- `frontend/src/pages/organizer/OrganizerReportPage.jsx`: Organizer interface for uploading proof photos, tracking status, viewing sponsor comments, and submitting.
- `frontend/src/pages/sponsor/SponsorReportReview.jsx`: Sponsor review panel displaying media galleries with forensics badges, comment thread, revision request drawer, and final digital approval button. Also exports `SponsorReportsInbox`.

---

## 4. Other Modules & Features Summary

| Module | Feature | File Locations | Key Logic |
| :--- | :--- | :--- | :--- |
| **M1 F1** | Event Profile Builder | `controllers/event.controller.js`, `pages/organizer/EventBuilder.jsx` | Multi-step form for creating event profile (crowd size, date, venue, social reach). |
| **M1 F3** | Proposal Strength Analyzer | `utils/proposalAnalyzer.js`, `pages/organizer/ProposalStrengthAnalyzer.jsx` | Virtual mentor scoring proposals out of 100 with actionable feedback tips. |
| **M1 F4** | Sponsor Discovery & Smart Matching | `services/match.service.js`, `pages/sponsor/Discovery.jsx` | Location/budget matching algorithm + Bangladesh Leaflet map pins. |
| **M2 F1** | AI Proposal Creator | `controllers/proposal.controller.js`, `services/gemini.service.js` | Persuasive proposal creation with Gemini "Help Me Write" button. |
| **M2 F3** | Sponsor Portfolio Handler | `controllers/campaign.controller.js`, `pages/sponsor/Portfolio.jsx` | Card dashboard tracking active/completed campaign health indicators and report editing. |
| **M2 F4** | Proposal Status Tracker | `pages/organizer/ProposalStatusTracker.jsx` | Visual Kanban pipeline tracking status from Drafted to Accepted. |
| **M3 F1** | Mutual Review & Rating System | `controllers/review.controller.js`, `components/common/RateDealModal.jsx` | 1–5 star reviews for closed deals shown on public profiles. |
| **M3 F3** | Budget Pacing & Overspend Alerts | `controllers/budget.controller.js`, `services/email.service.js` | Burn rate calculator triggering email alerts at >10% projected overspend. |
| **M3 F4** | A/B Experiment Tracker | `controllers/experiment.controller.js`, `pages/sponsor/Experiments.jsx` | Format performance comparison (banner vs booth) calculating metric lift. |
| **M4 F1** | Volunteer Management | `controllers/volunteer.controller.js`, `pages/organizer/VolunteerManagement.jsx` | Event day volunteer roster, shifts, email notifications, public signup. |
| **M4 F3** | AI Fraud & Spam Detection | `services/fraud.service.js`, `models/PhotoHash.js` | Rule-based pitch screening and image perceptual hashing. |
| **M4 F4** | AI Marketing Consultation | `controllers/marketing.controller.js`, `components/organizer/MarketingAdvicePanel.jsx` | Gemini-powered channel and content recommendations for organizers. |

---

## 5. Guidelines for Asking Gemini / AI Assistants

When asking Gemini to add features, modify logic, or fix bugs in this codebase, provide clear context referencing the sections above.

### Recommended Prompting Format for Gemini:
```text
I am working on SponsorMetrics BD. Refer to the project context document.

TASK: [Describe what you want to implement or fix]
FEATURE/MODULE: [e.g. Module 2 Feature 2 - Negotiation]
QUESTION/REQUEST: [Your specific question]

Please output:
1. Exact file paths to modify or create.
2. Complete, drop-in code snippet for the target file.
3. Summary of how frontend and backend interact for this solution.
```
