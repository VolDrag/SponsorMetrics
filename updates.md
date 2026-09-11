# SponsorMetrics BD — Modules 5–12 Build Prompt (for Cursor)

## Context (paste this block first)

SponsorMetrics BD is a MERN + TypeScript two-sided sponsorship marketplace (React 18/Vite/Tailwind frontend, Node/Express backend, MongoDB Atlas, JWT auth, Gemini for AI writing/insights, Hugging Face for photo forensics). Modules 1–4 are complete: event/tier builder, proposal strength analyzer, sponsor discovery/matching, proposal creator with AI-assist, in-platform negotiation, sponsor portfolio, mutual ratings, ROI analytics, budget pacing alerts, A/B format experiments, volunteer management, report approval workflow, fraud/forensics screening, and AI marketing advice.

Not built yet, and out of scope until called out below: admin dashboard, payments/escrow, dynamic PDF contracts, team seats, scheduled white-label reports, interactive map. Schema stubs already exist for some of these: `Contract.js`, `Payment.js`, `TeamMember.js`, `AdminVerification.js`, `WhiteLabelReport.js`, `Subscription.js`.

**Work one module at a time.** Don't start Module 6 until Module 5 is done and logged. After each module, write `MODULE<N>_LOG.md` in the same style as the existing `MODULE2_LOG.md`–`MODULE4_LOG.md` (files touched, endpoints added, decisions made). Don't change Module 1–4 API contracts or UI without flagging it first. Match existing code style (functional components, Tailwind, controller/service split, Mongoose schemas). Add every new env var to `.env.example` — never commit real credentials.

---

## Module 5 — Payments & Escrow

**5.1 bKash Checkout integration**
Implement `backend/src/services/bkash.service.js` using bKash's Checkout (URL-based) flow: grant token → create payment → customer authorizes in bKash app/USSD → execute → callback → server-side verify. Add HMAC webhook verification if using tokenized checkout. Env vars: `BKASH_APP_KEY`, `BKASH_APP_SECRET`, `BKASH_USERNAME`, `BKASH_PASSWORD`, `BKASH_BASE_URL` (sandbox first). Flesh out `Payment.js` with a status enum: `initiated | executed | completed | failed | refunded`. New routes under `/api/payments`.

**5.2 Escrow-style hold and release**
On proposal acceptance, the sponsor's tier amount is captured and held against the Campaign (store `paymentID` on the Campaign doc). Release triggers: report reaches **Approved** (Module 4 workflow) or an admin manually releases (Module 7). Support full and partial refunds via bKash's refund endpoint if a deal falls through post-payment.

**5.3 Invoicing**
Auto-generate a BDT invoice PDF on payment completion (Handlebars → HTML → PDF via Puppeteer; optional VAT/AIT line). Email it via the existing Nodemailer setup.

**5.4 Nagad (stretch)**
Same pattern as 5.1 as a second MFS rail, behind a feature flag — don't block on this.

---

## Module 6 — Contracts & E-Signature

**6.1 Dynamic PDF contract generation**
On proposal acceptance, populate `Contract.js` from the Event, Tier, and final negotiated terms; render to PDF (same Handlebars/Puppeteer pipeline as invoicing).

**6.2 Lightweight e-signature**
Not a full DocuSign integration — capture typed full name + timestamp + IP + a hash of the document per party, store on `Contract`, require both signatures before the contract is marked final and immutable. Downloadable from Portfolio and Proposal Tracker.

**6.3 Surface contract status**
Show contract state (unsigned / partially signed / executed) on `ProposalStatusTracker.jsx` and `Portfolio.jsx`.

---

## Module 7 — Trust, Admin & Verification

**7.1 Admin portal**
New `/admin` route group gated on the existing `admin` role. Dashboard: organization verification queue, flagged proposals (from `fraud.service.js`), flagged report photos (from `forensics.service.js`), open disputes, manual payment-release action.

**7.2 Organization verification (KYC-lite)**
Org uploads a registration doc / trade license at signup or from settings; admin approves or rejects; approved orgs get a "Verified" badge on `PublicProfile.jsx` and match cards. Flesh out `AdminVerification.js`.

**7.3 Dispute resolution**
Either party can open a dispute on a Campaign or Contract with evidence attachments; admin sees a thread and can resolve by releasing funds, issuing a refund, or closing with notes.

**7.4 Real OTP enforcement**
Registration currently auto-verifies. Send a real OTP (email, or SMS via a local gateway like SSL Wireless or Alpha SMS) and block login until it's confirmed.

---

## Module 8 — Notifications & Communication

**8.1 In-app notification center** — bell icon + unread count, backed by a `Notification` model. Events: proposal viewed/countered/accepted, payment received, report approved, dispute opened.

**8.2 Real-time updates** — Socket.io for negotiation status and counter-offers instead of polling.

**8.3 SMS for high-value events** — payment confirmation, budget overspend alert. Email-only under-reaches users who don't check email often; this is worth prioritizing over polish items.

**8.4 Light free-text chat thread (stretch)** — structured counter-offers already exist; a lot of real negotiation happens in informal back-and-forth before a formal counter is filed.

---

## Module 9 — Security & Platform Hardening
**Do this before Module 5 goes anywhere near real money.**

**9.1 Move JWT out of `localStorage`.** This is the single biggest fix here — a JWT in `localStorage` is readable by any injected script (XSS → full account takeover). Switch to an httpOnly, Secure, SameSite cookie with short-lived access tokens and refresh-token rotation.

**9.2 Rate limiting** (`express-rate-limit`) on auth, proposal-send, and the Gemini/AI-assist endpoints (these are also your cost-control surface).

**9.3 Centralized input validation** (zod or celebrate) across all controllers — audit which ones currently skip it.

**9.4 Upload hardening** on the Multer routes: MIME/extension allow-list, size caps, and a scan step before a file is servable from `/uploads`.

**9.5 Error monitoring** — wire Sentry (or a self-hosted equivalent) into both backend and frontend.

**9.6 Audit the fail-open paths.** `fraud.service.js` and `forensics.service.js` currently default to "pass" / "Unverified" when the external API call fails, silently. Decide per-feature whether that's actually the right default (probably fine for forensics, probably not for the fraud screen) and make the fallback explicit and logged rather than silent.

---

## Module 10 — Analytics Depth & White-Label Reporting

**10.1** Extend `AnalyticsDashboard.jsx` with a renewal/YoY comparison across a sponsor's own event history, and CSV/PDF export.

**10.2** Scheduled white-label PDF reports — `node-cron` job generates a weekly branded PDF per sponsor from active campaigns and emails it. Flesh out `WhiteLabelReport.js`.

**10.3** Organizer-side rollup analytics — ROI analytics is currently sponsor-only; give organizers a simple cross-sponsor performance view for their own events.

---

## Module 11 — Team Seats & Collaboration

**11.1** Flesh out `TeamMember.js` — an org owner invites teammates by email with role-based permissions (view-only / negotiate / admin) within one organizer or sponsor account.

**11.2** Per-organization activity log (who sent, edited, or approved what).

---

## Module 12 — Public-Facing Polish

**12.1** Marketing landing page separate from the authenticated app — value prop, how-it-works, placeholder case studies, pricing if you decide to monetize the platform itself.

**12.2** SEO basics on public routes (public event pages, public profiles) — meta tags, OG images, sitemap.

**12.3** PWA basics (installable, offline shell). No native app is planned, and this is a cheap way to feel app-like on the mobile-first usage you'll get in Bangladesh.

---

## Suggested order

1. **Module 9** (security) — before real money touches the system
2. **Module 5 + 6** (payments, contracts) — the two gaps that most separate this from a "real" platform
3. **Module 7** (admin/trust) — needed once you're actually holding money and making verification claims
4. **Module 8** (notifications)
5. **Modules 10–12** — polish, slot in as time allows

## Constraints

- BDT everywhere; bKash/Nagad are the primary payment rails, not Stripe-first
- Don't silently touch Module 1–4 contracts
- One module per Cursor session where possible — feeding it all 8 modules at once will produce shallow, inconsistent output