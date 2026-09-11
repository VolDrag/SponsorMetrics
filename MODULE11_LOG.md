# Module 11 Implementation Log

## Feature: Team seats + activity log
**Files created:** backend/src/controllers/team.controller.js, backend/src/routes/team.routes.js, backend/src/models/ActivityLog.js
**Files modified:** backend/src/models/TeamMember.js, frontend/src/pages/common/WorkspaceSettings.jsx, MODULE11_LOG.md
**Core logic location:** team.controller.js → invite, revoke, activity
**Logic explanation:** Org owners invite teammates by email with view / negotiate / admin. Stored permission remains edit|view for the original schema, with `seatRole` preserving the finer intent. Invites notify existing users. Revoke flips status. An ActivityLog lists who invited or revoked whom.
