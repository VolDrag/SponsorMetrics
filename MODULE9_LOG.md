# Module 9 Implementation Log

## Feature: httpOnly cookie JWT + refresh-token rotation
**Status before:** access JWTs lived in `localStorage` (XSS-readable) and lasted 7 days with no rotation. Login/register JSON also returned the raw token.
**Files created:** backend/src/utils/session.js
**Files modified:** backend/src/models/User.js, backend/src/controllers/auth.controller.js, backend/src/middleware/auth.js, backend/src/routes/auth.routes.js, frontend/src/context/AuthContext.jsx, frontend/src/services/api.js, frontend/src/services/authApi.js, frontend/src/pages/auth/Login.jsx, frontend/src/pages/auth/Register.jsx, frontend/src/pages/auth/VerifyOTP.jsx, frontend/src/components/layout/DashboardLayout.jsx, backend/.env.example, MODULE9_LOG.md
**Core logic location:** backend/src/utils/session.js → issueSession, rotateRefresh; frontend/src/services/api.js → 401 refresh interceptor
**Logic explanation:** Login and register now set two httpOnly cookies (`access_token` 15 minutes, `refresh_token` 7 days) instead of putting a JWT in `localStorage`. Refresh tokens are stored as SHA-256 hashes on the User document and rotated on `POST /api/auth/refresh`. Dev Vite proxies `/api` to port 5000 so cookies are first-party. The SPA also keeps a **memory-only** access token from the login JSON (not written to localStorage) so cross-origin production still authenticates. Logout clears cookies + memory and always returns to `/login`. The 401 interceptor no longer hard-redirects `/auth/me`, which had been kicking users out right after login.


## Feature: Rate limiting on auth, proposal-send, and AI endpoints
**Status before:** did not exist
**Files created:** backend/src/middleware/rateLimit.js
**Files modified:** backend/src/routes/auth.routes.js, backend/src/routes/proposalRoutes.js, backend/src/routes/analytics.routes.js, backend/src/routes/marketing.routes.js, backend/src/app.js, backend/.env.example, MODULE9_LOG.md
**Core logic location:** backend/src/middleware/rateLimit.js → authLimiter, sendLimiter, aiLimiter
**Logic explanation:** `express-rate-limit` caps login/register/refresh (per IP), proposal send (per user), and Gemini-backed routes (`/ai-assist`, `/analytics/ask`, `/marketing/events/:eventId`) so brute-force and AI-cost spikes are bounded. Limits are env-tunable (`RATE_LIMIT_AUTH`, `RATE_LIMIT_SEND`, `RATE_LIMIT_AI`). `trust proxy` is on so Render’s forwarded IP is used.

## Feature: Centralized input validation audit
**Status before:** most Module 2–4 routes used express-validator; tiers, matching, and the strength analyzer were unvalidated (analyzer was also unauthenticated and could write Proposal rows).
**Files created:** backend/src/validators/tier.validator.js, backend/src/validators/match.validator.js, backend/src/validators/analyzer.validator.js
**Files modified:** backend/src/routes/tier.routes.js, backend/src/routes/matchRoutes.js, backend/src/routes/proposalRoutes.js, MODULE9_LOG.md
**Core logic location:** existing `middleware/validate.js` (express-validator) — stayed with the repo’s current library instead of introducing zod
**Logic explanation:** Tier create/update, match query filters, and `/api/proposals/analyze` now go through the same `validate` middleware as events/proposals. Analyzer POST/GET also require an organizer JWT. Filter enums match the existing Discovery UI (`this_month`, `under_50k`, …) so Module 1 matching is not broken. Left GET list endpoints without body validators because they take no body.

## Feature: Upload hardening
**Status before:** Multer already had a MIME allow-list and 5 MB cap, but did not verify file bytes, so a renamed HTML file could be stored and served from `/uploads`.
**Files created:** none
**Files modified:** backend/src/middleware/upload.js, backend/src/routes/campaign.routes.js, backend/src/routes/report.routes.js, backend/src/app.js, MODULE9_LOG.md
**Core logic location:** backend/src/middleware/upload.js → scanUploadedImages, blockNonImageUploads, assertSafeImage
**Logic explanation:** After Multer, each campaign/report file is checked for JPEG/PNG/GIF/WEBP magic bytes and decoded with `sharp`; mismatches are deleted and rejected. `/uploads` refuses non-image extensions before static serving. Size cap is `UPLOAD_MAX_BYTES` (default 5 MB).

## Feature: Sentry error monitoring
**Status before:** did not exist
**Files created:** backend/src/middleware/sentry.js, frontend/src/sentry.js, frontend/.env.example
**Files modified:** backend/src/app.js, frontend/src/main.jsx, backend/.env.example, backend/package.json, frontend/package.json, MODULE9_LOG.md
**Core logic location:** backend/src/middleware/sentry.js → initSentry; frontend/src/sentry.js → initFrontendSentry
**Logic explanation:** `@sentry/node` and `@sentry/react` initialize only when `SENTRY_DSN` / `VITE_SENTRY_DSN` are set. Local/demo deploys without a DSN behave as before. Express errors are captured in the existing 500 handler.

## Feature: Explicit fail-open / fail-closed on fraud and forensics
**Status before:** Hugging Face / hash failures were swallowed with empty catches; a thrown `screenProposal` could 500 after a send had already started, and forensics silently became Unverified.
**Files created:** none
**Files modified:** backend/src/controllers/proposal.controller.js, backend/src/services/forensics.service.js, MODULE9_LOG.md
**Core logic location:** proposal.controller.js send/create screening try/catch; forensics.service.js inspectImage
**Logic explanation:** **Fraud screening is fail-closed:** if `screenProposal` throws, the proposal stays unsent and the organizer gets 503. **Photo forensics stays fail-open** (Unverified) because a down Hugging Face should not block a real event report, but every fallback is now `console.warn`’d so it is not silent.
