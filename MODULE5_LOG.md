# Module 5 Implementation Log

## Feature: bKash Checkout + escrow hold/release
**Files created:** backend/src/services/bkash.service.js, backend/src/services/escrow.service.js, backend/src/controllers/payment.controller.js, backend/src/routes/payment.routes.js
**Files modified:** backend/src/models/Payment.js, backend/src/models/Campaign.js, backend/src/controllers/proposal.controller.js, backend/src/controllers/report.controller.js, backend/src/app.js, backend/.env.example, MODULE5_LOG.md
**Core logic location:** escrow.service.js → initiateForCampaign, executeAndHold, releaseOnReportApproval
**Logic explanation:** Accepting a proposal creates a Payment (`initiated|executed|completed|failed|refunded`) and stores `bkashPaymentID` on the Campaign. With `BKASH_MOCK=true` (default without keys) the sandbox path auto-executes and marks escrow **held**. Real sandbox/live uses grant-token → create → execute → query. Report **Approved** releases escrow. Admin can refund via bKash refund (mocked when keys are missing). Nagad was skipped as a stretch.

## Feature: Invoicing
**Files created:** backend/src/services/invoice.service.js
**Files modified:** backend/src/services/email.service.js, MODULE5_LOG.md
**Core logic location:** invoice.service.js → generateInvoicePdf
**Logic explanation:** Used existing `pdfkit` instead of Puppeteer/Handlebars so Render/Windows deploys do not need Chromium. A BDT invoice PDF (optional VAT/AIT lines) is written to `/uploads/invoices` and emailed when Nodemailer is configured.
