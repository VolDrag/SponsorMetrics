# Module 8 Implementation Log

## Feature: In-app notifications + Socket.io
**Files created:** backend/src/realtime.js, backend/src/services/notification.service.js, backend/src/controllers/notification.controller.js, backend/src/routes/notification.routes.js
**Files modified:** backend/src/models/Notification.js, backend/src/app.js, backend/src/controllers/proposal.controller.js, frontend/src/components/layout/DashboardLayout.jsx, MODULE8_LOG.md
**Core logic location:** notification.service.js → notify; DashboardLayout bell
**Logic explanation:** Events (viewed, counter, accepted, payment, report, dispute, KYC, team invite) write a Notification and emit `notification` to that user's Socket.io room. The top bar bell shows unread count. SMS helper logs when `SMS_API_KEY` is unset (email still used for overspend/OTP). Free-text chat was left as a stretch; structured counters already exist.
