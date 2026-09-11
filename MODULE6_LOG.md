# Module 6 Implementation Log

## Feature: Dynamic PDF contract + lightweight e-signature
**Files created:** backend/src/services/contract.service.js, backend/src/controllers/contract.controller.js, backend/src/routes/contract.routes.js, frontend/src/pages/common/ContractsPage.jsx
**Files modified:** backend/src/models/Contract.js, backend/src/controllers/proposal.controller.js, frontend/src/routes/AppRoutes.jsx, frontend/src/components/layout/DashboardLayout.jsx, MODULE6_LOG.md
**Core logic location:** contract.service.js → createContractForProposal, signContract
**Logic explanation:** On proposal accept, a PDF is generated from event/tier/negotiated budget and hashed. Each party types their full name; the API stores name, timestamp, IP, and document hash. Status is unsigned → partially_signed → executed. Executed contracts are immutable. Download lives on `/contracts` (also linked from the sidebar used by Portfolio/Tracker users).
