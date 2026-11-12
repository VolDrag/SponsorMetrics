# SponsorMetrics BD

A two-sided sponsorship marketplace for Bangladesh. University clubs, NGOs and startups package their events into sponsorship tiers; brands discover those events, negotiate inside the platform, and track every deal as a campaign with spend, ROI and proof of delivery.

## Who it is for

| Role | What they can do |
|---|---|
| **Organizer** | Create events and sponsorship tiers, get a proposal-strength score, see top sponsor matches, write and send proposals, negotiate, manage volunteers, and submit post-event metrics and photo reports |
| **Sponsor** | Browse a filtered event feed, review a proposal inbox, counter-offer, manage a campaign portfolio, set budgets with overspend alerts, compare ROI across events, and run A/B experiments on formats |

## How a deal works

Organizer builds event → strength analysis and sponsor matching → proposal sent (with fraud screening) → sponsor negotiates and accepts → campaign is created → event runs with a volunteer roster → organizer submits metrics and photos → sponsor approves the report → both sides rate each other.

## Highlights

- **AI writing help** with Google Gemini for proposals, ROI questions and marketing cards
- **Photo report checks** using the Hugging Face Inference API to estimate whether images are AI-generated
- **Rule-based sponsor matching** and proposal-strength scoring
- **Analytics** with Recharts for ROI and experiment results
- **Email alerts** for budget overspend and volunteer instructions

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router, Recharts |
| Backend | Node.js, Express |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT with role-protected routes |
| Integrations | Google Gemini, Hugging Face, Nodemailer, Multer |

## Getting started

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

The backend needs MongoDB, JWT, Gemini and email settings in its environment file. See [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) for details.

## Documentation

- [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md): product overview, modules and data flow
- [Project Specifications.md](Project%20Specifications.md): original specification
- `MODULE*_LOG.md`: development logs for each module

## Team

[@VolDrag](https://github.com/VolDrag) · [@azrafi](https://github.com/azrafi) · [@debashishchowdhury](https://github.com/debashishchowdhury) · [@sagorsenanupam](https://github.com/sagorsenanupam)
