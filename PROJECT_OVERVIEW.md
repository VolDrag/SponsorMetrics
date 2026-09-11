# SponsorMetrics BD — Project Overview

SponsorMetrics BD is a two-sided sponsorship marketplace for Bangladesh. University clubs, NGOs, and startups build events and sponsorship packages; brands discover those events, negotiate in-platform, and treat each deal as a tracked campaign with spend, ROI, and proof of delivery.

The lab implementation covers **Modules 1–4** (16 features). Auth, role-based dashboards, Gemini writing/insights, and Hugging Face photo checks are included. Payments, escrow, admin verification, team seats, and auto-generated PDF contracts from the original spec are **not** built.

---

## Who uses it

| Role | What they do |
|---|---|
| **Organizer** | Create events and Gold/Silver/Bronze (or custom) tiers, analyze proposal strength, match to sponsors, write and send proposals, negotiate, track status, manage volunteers, submit post-event numbers and photo reports. |
| **Sponsor** | Browse a filtered event feed, open an inbox of proposals, counter-offer, manage a campaign portfolio, set a budget with overspend alerts, compare ROI across events, run format A/B experiments, approve or send back reports. |
| **Admin** | Role exists on the User model. There is **no** admin portal in this repo. |

Public visitors can join an event volunteer roster via a no-login signup link.

---

## Tech stack (what is actually used)

| Layer | Choice |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router, Lucide icons |
| Charts | Recharts (ROI and experiments) |
| Backend | Node.js, Express |
| Database | MongoDB Atlas via Mongoose |
| Auth | JWT in `localStorage` + role-protected routes (`organizer` / `sponsor`) |
| Email | Nodemailer (Gmail) — budget overspend alerts, volunteer instruction emails |
| AI writing & advice | Google Gemini (`GEMINI_API_KEY`) — Help Me Write, ROI Q&A, marketing cards |
| Media checks | Hugging Face Inference API — AI-image likelihood on report photos |
| Uploads | Multer, stored under `backend/uploads/` and served at `/uploads` |
| Matching | Rule-based scores in `backend/src/services/match.service.js` |

Leaflet is listed in frontend dependencies; discovery is a **filterable list**, not a live map.

---

## How a deal moves through the product

```
Register (organizer or sponsor)
        │
        ▼
Organizer builds event + tiers
        │
        ▼
Strength analyzer (score / 100)  →  Top sponsor matches
        │
        ▼
Proposal Creator (+ Help Me Write)  →  Send
        │
        ▼
Fraud screen on send (hold if flagged)
        │
        ▼
Sponsor inbox: Viewed → Counter offer ⇄ Accept / Reject
        │
        ▼
Accepted deal creates a Campaign card (portfolio)
        │
        ▼
Event day: volunteer roster + check-in
        │
        ▼
Organizer submits metrics + photo report
        │
        ▼
Sponsor: Under Review → Approve or request revision
        │
        ▼
Approved report unlocks mutual ratings on public profiles
Sponsor analytics / budget / experiments use those numbers
```

---

## Module 1 — Events, packages, matching

### 1. Event Profile Builder

Organizers create an event with name, expected crowd, venue, lat/lng, date, and social reach. Events live on **Event Hub** (`/organizer/events`) and open into **Event Details**.

- Pages: `MyEvents.jsx`, `EventBuilder.jsx`, `EventDetails.jsx`
- API: `/api/events`

### 2. Sponsorship Tier Package Creator

Per-event packages (Gold / Silver / Bronze or custom) with a BDT price and a checklist of benefits (banner, booth, speaking slot, social posts, and so on). Tiers attach to an event and are later picked on a proposal.

- Page: `TierPackageCreator.jsx` (`/organizer/events/:eventId/tiers`)
- API: `/api/tiers`

### 3. Proposal Strength Analyzer

Before send, a rule-based mentor scores the draft out of 100 (crowd vs budget, venue detail, social reach, package completeness) and returns tips such as “budget is high for this crowd.”

- Page: `ProposalStrengthAnalyzer.jsx` (`/organizer/proposal-analyzer`)
- Logic: `backend/src/utils/proposalAnalyzer.js`
- API: `POST /api/proposals/analyze`

### 4. Sponsor Discovery & Smart Matching

**Sponsors** get a searchable feed of upcoming events (date and budget filters) with a match score and reasons (category fit, budget tier, credibility, timing).

**Organizers** get a **Top Matches** list of brands for a given event instead of blasting cold email.

- Pages: `Discovery.jsx` (`/sponsor/discovery`), `SponsorMatches.jsx`
- API: `/api/matches/events`, `/api/matches/sponsors/:eventId`

---

## Module 2 — Proposals, negotiation, portfolio

### 1. Proposal Creator + AI Proposal Assistant

Four-step flow: pick an event, pick a tier, add goals/notes/bullets, review and save or send. **Help Me Write** sends rough bullets to Gemini and returns formal business English. If Gemini is down, a local rewrite is used.

- Pages: `ProposalCreator.jsx`, `MyProposals.jsx`
- Gemini: `gemini.service.js` → `rewriteProposal`
- API: `/api/proposals`, `POST /api/proposals/ai-assist`

Statuses: `draft` → `sent` → `viewed` → `under_negotiation` → `accepted` | `rejected`.

### 2. Proposal Review & In-Platform Negotiation

Sponsors open a sent proposal (first open flips **Sent → Viewed**). They can **Counter Offer** a new budget and/or swap package items (e.g. banner for booth) without leaving the app. Each counter is stored on the proposal. Accept / reject / counter again until the deal closes.

The party that made the last move cannot accept their own offer (`lastActionBy`). The waiting side sees a “Waiting for Sponsor/Organizer” badge.

- Pages: `ProposalInbox.jsx`, `ProposalReview.jsx`
- Components: `CounterOfferForm.jsx`, `NegotiationHistory.jsx`

### 3. Sponsor Portfolio Handler

When a proposal is accepted, a **Campaign** card is created. The portfolio lists spend, status (Active / Upcoming / Completed), and a green / yellow / red health dot. Sponsors can change status. Completed cards can attach an **event report** (reach, engagement, photos, etc.) stored on the Campaign document.

- Page: `Portfolio.jsx` (`/sponsor/portfolio`)
- API: `/api/campaigns`

### 4. Proposal Status Tracker

Organizers get a kanban of every proposal: Drafted, Sent, Viewed by Sponsor, Under Negotiation, Accepted, Rejected. Cards link back to the proposal.

- Page: `ProposalStatusTracker.jsx` (`/organizer/proposal-tracker`)
- API: pipeline endpoint on `/api/proposals`

---

## Module 3 — Trust, ROI, budget, experiments

### 1. Mutual Review & Rating System

After a deal is closed **and** the post-event report is **Approved** (Module 4 Feature 2), both sides get a dashboard banner to rate reliability and communication (1–5) plus an optional comment. One review per user per deal. Averages are stored on the User and shown on match cards and the public profile (`/profile/:userId`).

- Components: `RateDealBanner.jsx`, `RateDealModal.jsx`
- Page: `PublicProfile.jsx`
- API: `/api/reviews`

### 2. Sponsorship Performance & ROI Analytics

Organizers enter three numbers against an accepted proposal: **reach, engagement, attendance**. The sponsor analytics page computes:

- cost-per-reach
- cost-per-engagement
- audience growth vs that sponsor’s own history

Bar/line charts include average reference lines. **Ask about your stats** sends the KPI JSON to Gemini for explanations and improvement ideas (local fallback if the model fails).

- Pages: `AnalyticsDashboard.jsx`, `PostEventMetricsPage.jsx`
- Component: `AnalyticsInsightPanel.jsx`
- API: `/api/analytics`

### 3. Budget Pacing & Overspend Alert System

Sponsors set a quarterly or annual BDT budget. On dashboard load and after a proposal is accepted, committed spend ÷ days elapsed is projected across the period. If projected overspend is **> 10%**, one email is sent per period (`lastAlertSentAt` blocks repeats). A green / yellow / red widget sits on Discovery and Portfolio; Settings edits the budget.

- Pages / widget: `BudgetSettings.jsx` (`/sponsor/settings`), `BudgetPacingWidget.jsx`
- API: `/api/budgets`

### 4. A/B Experiment Tracker for Sponsorship Formats

Tiers and proposals carry a `formatType` (inferred from benefits if unset). Sponsors create an experiment, pick a primary KPI, and tag event variants. The API averages the metric, treats the most-tagged (or marked) variant as control, computes **lift%**, and badges a winner (lower-is-better for cost metrics).

- Page: `Experiments.jsx` (`/sponsor/experiments`)
- API: `/api/experiments`

---

## Module 4 — Volunteers, reports, fraud, marketing advice

### 1. Volunteer Management System

Per-event roster: name, email, phone, role, shift, notes, plus an event-day **check-in** toggle grouped by role/shift. Organizers email all volunteers or a subset; each send is logged. A public link `/volunteer-signup/:eventId` lets people self-join without an account.

- Pages: `VolunteerManagement.jsx`, `VolunteerSignup.jsx`
- API: `/api/volunteers`

### 2. Post-Event Report & Approval Workflow

The same `PostEventMetrics` document gains crowd photos, engagement screenshots, and a workflow:

**Draft → Submitted → Under Review → Revision Requested → Approved**

Sponsors review in-platform, request changes with timestamped comments, or **digitally sign off**. Approval locks the report and is what opens mutual reviews (Module 3 Feature 1).

- Pages: `OrganizerReportPage.jsx`, `SponsorReportReview.jsx` (`/sponsor/reports`)
- API: `/api/reports`

### 3. AI Fraud & Spam Detection + Media Forensics

**On proposal send** (`fraud.service.js`): missing website, free-email domain on an institutional org, near-duplicate organization names, budget-per-attendee over `MAX_BUDGET_PER_ATTENDEE`, copy-paste similarity vs other events. Flagged proposals stay **drafted**; the organizer sees why they were held.

**On report photo upload** (`forensics.service.js`): Hugging Face AI-image score + perceptual hash vs other events. Badges: **Verified / Needs Review / Unverified**. API failures stay Unverified (fail-open).

### 4. AI-Powered Marketing Consultation

**Get Marketing Advice** on the event or proposal page. The backend sends event crowd, venue, package price range, and past metrics to Gemini and expects a JSON array of channel / content / pricing cards. Invalid JSON falls back to three local suggestions. The panel can regenerate.

- Component: `MarketingAdvicePanel.jsx`
- API: `POST /api/marketing/events/:eventId`

---

## Auth and accounts

- Register as **organizer** or **sponsor** (org name, type, industry, budget tier, optional website).
- Login issues a JWT; protected routes check role.
- OTP routes exist (`/verify-otp`) but registration currently marks the user verified immediately — OTP is a stub for the original email-verification requirement.

---

## Repository layout

```
SponsorMetrics/
├── backend/                 Express API (port 5000)
│   ├── src/app.js           Routes, CORS, /uploads, Mongo connect
│   ├── src/controllers/     Feature handlers
│   ├── src/models/          Mongoose schemas
│   ├── src/routes/          /api/...
│   ├── src/services/        Gemini, fraud, forensics, matching, email
│   └── uploads/             Campaign + report photos (local disk)
└── frontend/                Vite React app (port 5173)
    └── src/pages/           organizer / sponsor / auth / public
```

Frontend talks to the API through `VITE_API_URL` (default `http://localhost:5000/api`).

---

## Run locally

**Backend** (`backend/`): copy `.env` from `.env.example`, then `npm install` and `npm run dev`.

Needed env: `MONGODB_URI`, `JWT_SECRET`, `EMAIL_USER`, `EMAIL_PASS`, `FRONTEND_URL`, `GEMINI_API_KEY`. Optional: `HUGGINGFACE_API_KEY`, `HF_AI_DETECTOR_MODEL`, `MAX_BUDGET_PER_ATTENDEE`.

**Frontend** (`frontend/`): `npm install` and `npm run dev`.

Health check: `GET /api/health`.

---

## Specified in the original brief, not implemented

These models or spec lines exist but have **no working UI/API flow**:

- Admin dashboard, document verification, disputes
- Sponsor team invites and permission roles
- bKash / Stripe payments and escrow release
- Dynamic PDF contract generation on accept
- Scheduled white-label PDF reports emailed weekly
- Interactive Bangladesh map of events (Leaflet listed, not wired)

Schema stubs you may see: `Contract.js`, `Payment.js`, `TeamMember.js`, `AdminVerification.js`, `WhiteLabelReport.js`, `Subscription.js`.

---

## Feature index (quick lookup)

| # | Feature | Primary UI |
|---|---|---|
| M1-1 | Event Profile Builder | `/organizer/events` |
| M1-2 | Tier Package Creator | `/organizer/events/:eventId/tiers` |
| M1-3 | Proposal Strength Analyzer | `/organizer/proposal-analyzer` |
| M1-4 | Discovery & Smart Matching | `/sponsor/discovery`, event Matches |
| M2-1 | Proposal Creator + Gemini write | `/organizer/proposals` |
| M2-2 | Review & negotiation | `/sponsor/proposals` |
| M2-3 | Campaign portfolio | `/sponsor/portfolio` |
| M2-4 | Proposal status kanban | `/organizer/proposal-tracker` |
| M3-1 | Mutual ratings | Dashboard banner, `/profile/:userId` |
| M3-2 | ROI analytics + Gemini Q&A | `/sponsor/analytics` |
| M3-3 | Budget pacing + email alert | `/sponsor/settings` |
| M3-4 | Format A/B experiments | `/sponsor/experiments` |
| M4-1 | Volunteer roster + public signup | `/organizer/events/:eventId/volunteers` |
| M4-2 | Report approval workflow | `/sponsor/reports` |
| M4-3 | Fraud screen + photo forensics | On send / on photo upload |
| M4-4 | Gemini marketing advice | Event / proposal “Get Marketing Advice” |

Implementation notes with file lists live in `MODULE2_LOG.md`, `MODULE3_LOG.md`, and `MODULE4_LOG.md`. The original requirement tables are in `Project Specifications.md`.
