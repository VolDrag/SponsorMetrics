# Module 2 Implementation Log

## Feature: Proposal Creator
**Files created:** backend/src/controllers/proposal.controller.js, backend/src/validators/proposal.validator.js, backend/src/services/gemini.service.js, frontend/src/services/proposalApi.js, frontend/src/pages/organizer/ProposalCreator.jsx, frontend/src/pages/organizer/MyProposals.jsx, frontend/src/components/organizer/AiProposalAssistant.jsx
**Files modified:** backend/src/models/Proposal.js, backend/src/routes/proposalRoutes.js, frontend/src/routes/AppRoutes.jsx, frontend/src/components/layout/DashboardLayout.jsx, frontend/src/pages/organizer/MyEvents.jsx, frontend/src/components/organizer/SponsorMatchCard.jsx
**Core logic location:** backend/src/controllers/proposal.controller.js → createProposal, aiAssist; frontend/src/pages/organizer/ProposalCreator.jsx → ProposalCreator; backend/src/services/gemini.service.js → rewriteProposal
**Logic explanation:** Organizers build a sponsorship proposal in four steps: pick an existing Module 1 event, choose a tier package, add notes/goals/bullet points, then review and save or send to a sponsor. The Help Me Write button posts those rough bullets to `/api/proposals/ai-assist`, which calls the Gemini API (or a local fallback if `GEMINI_API_KEY` is missing) and returns professional copy the organizer can accept, edit, or ignore before saving. Drafts stay editable; sending requires a tier and a sponsor and moves status to `sent`.

## Feature: Proposal Review & In-Platform Negotiation
**Files created:** frontend/src/pages/sponsor/ProposalInbox.jsx, frontend/src/pages/sponsor/ProposalReview.jsx, frontend/src/components/sponsor/CounterOfferForm.jsx, frontend/src/components/common/NegotiationHistory.jsx
**Files modified:** backend/src/models/Proposal.js, backend/src/controllers/proposal.controller.js, backend/src/validators/proposal.validator.js, backend/src/routes/proposalRoutes.js, frontend/src/services/proposalApi.js, frontend/src/routes/AppRoutes.jsx, frontend/src/pages/organizer/MyProposals.jsx
**Core logic location:** backend/src/controllers/proposal.controller.js → counterOffer, acceptProposal, rejectProposal, getInbox, getProposalById
**Logic explanation:** Sponsors open a sent proposal from their inbox; the first view flips status from Sent to Viewed. Instead of leaving for chat, they submit a Counter Offer with a new budget and/or a package-item swap (e.g. banner for booth space). Each counter-offer is stored as its own record on the proposal so both sides can see a full negotiation history, accept, reject, or counter again until the deal is closed.

## Feature: Sponsor Portfolio Handler
**Files created:** backend/src/controllers/campaign.controller.js, backend/src/routes/campaign.routes.js, backend/src/validators/campaign.validator.js, frontend/src/services/campaignApi.js, frontend/src/pages/sponsor/Portfolio.jsx, frontend/src/components/sponsor/PortfolioCard.jsx
**Files modified:** backend/src/app.js, frontend/src/routes/AppRoutes.jsx, frontend/src/components/layout/DashboardLayout.jsx
**Core logic location:** backend/src/controllers/campaign.controller.js → getMyPortfolio, updateCampaign, deriveHealth; frontend/src/pages/sponsor/Portfolio.jsx → Portfolio
**Logic explanation:** When a proposal is accepted, a Campaign record is created (or backfilled) for that sponsor-event pair. The portfolio page lists every campaign as a card showing committed spend, Active/Upcoming/Completed status, and a green/yellow/red health dot derived from status, spend, and whether the event date has already passed. Sponsors can change a card's status from the dropdown, and health is recalculated after the update.

## Feature: Proposal Status Tracker
**Files created:** frontend/src/pages/organizer/ProposalStatusTracker.jsx, frontend/src/components/organizer/ProposalPipelineCard.jsx
**Files modified:** backend/src/controllers/proposal.controller.js, backend/src/routes/proposalRoutes.js, frontend/src/services/proposalApi.js, frontend/src/routes/AppRoutes.jsx, frontend/src/components/layout/DashboardLayout.jsx, frontend/src/pages/organizer/MyProposals.jsx
**Core logic location:** backend/src/controllers/proposal.controller.js → getPipeline; frontend/src/pages/organizer/ProposalStatusTracker.jsx → ProposalStatusTracker
**Logic explanation:** Organizers open a kanban-style pipeline that groups every proposal into Drafted, Sent, Viewed by Sponsor, Under Negotiation, Accepted, or Rejected. Status is live: sending moves a card to Sent, a sponsor opening it moves it to Viewed, a counter-offer moves it to Under Negotiation, and accept/reject land it in the final column. Each card links to the proposal so the organizer can respond without leaving the tracker workflow.

## Feature: Sponsor Portfolio Handler — Event Editing
**Status before:** did not exist
**Files created:** backend/src/middleware/upload.js, frontend/src/components/sponsor/EventReportModal.jsx
**Files modified:** backend/src/models/Campaign.js, backend/src/controllers/campaign.controller.js, backend/src/routes/campaign.routes.js, backend/src/validators/campaign.validator.js, backend/src/app.js, frontend/src/services/campaignApi.js, frontend/src/services/api.js, frontend/src/pages/sponsor/Portfolio.jsx, frontend/src/components/sponsor/PortfolioCard.jsx, .gitignore
**Core logic location:** backend/src/controllers/campaign.controller.js → updateEventReport; frontend/src/components/sponsor/EventReportModal.jsx → EventReportModal; frontend/src/components/sponsor/PortfolioCard.jsx → PortfolioCard
**Logic explanation:** Completed portfolio cards now have an Edit Event Report action that opens a form for reach, engagement, leads, conversions, likes, shares, attendance, audience growth, revenue, profit, and multiple photos. Those fields live on the existing Campaign document as `eventReport` (aligned with PerformanceMetric/PostEventReport field names) rather than a new collection, because each portfolio card is already one campaign. Photos are stored with local multer under `backend/uploads/campaigns` and served at `/uploads`, since multer was already a backend dependency and the repo had no Cloudinary (or any other) upload flow. Saved reports show a stats/profit summary on the card with a link to view full details.

## Feature: Negotiation Logic Bug Fix (self-acceptance of own offer)
**Files created:** none
**Files modified:** backend/src/models/Proposal.js, backend/src/controllers/proposal.controller.js, frontend/src/pages/sponsor/ProposalReview.jsx, MODULE2_LOG.md
**Core logic location:** backend/src/controllers/proposal.controller.js → assertOtherPartyCanAct, acceptProposal, rejectProposal, counterOffer
**Logic explanation:** Proposals now store `lastActionBy` (userId + role) whenever an organizer sends a proposal or either party submits a counter-offer. Accept, reject, and counter-offer endpoints reject with 403 if the caller is the same role that made the last move, so an organizer can no longer accept their own pending send and a sponsor cannot accept their own counter. The negotiation view hides Accept/Reject/Counter for the waiting party and shows a "Waiting for [Sponsor/Organizer] to respond" badge instead.

