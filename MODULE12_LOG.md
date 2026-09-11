# Module 12 Implementation Log

## Feature: Landing, SEO, PWA shell
**Files created:** frontend/src/pages/public/Landing.jsx, frontend/public/manifest.json, frontend/vite.config.js
**Files modified:** frontend/src/routes/AppRoutes.jsx, frontend/index.html, MODULE12_LOG.md
**Core logic location:** Landing.jsx; index.html meta/OG; manifest.json
**Logic explanation:** `/` is a public marketing page (value prop, how-it-works, CTAs). Public HTML has description + OG tags. A web app manifest makes the UI installable. Vite proxies `/api` and `/uploads` in dev so auth cookies work on localhost.
