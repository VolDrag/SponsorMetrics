 

**Project Overview**

SponsorMetrics BD is a two-sided sponsorship marketplace and performance-management platform for Bangladesh. Event organisers (university clubs, NGOs, startups) build proposals and get discovered by sponsors; sponsors don't just browse and pay — they manage every sponsorship as a tracked "campaign" inside a portfolio dashboard, complete with spend pacing, ROI analytics, A/B testing across sponsorship formats, and AI-generated performance narratives for internal reporting. This turns sponsorship from a one-off transaction into a measurable, repeatable marketing channel — the same discipline agencies apply to Facebook/Google ad spend, applied to event sponsorship.

 

**Tech Stack:**  
● 	**Language:** JavaScript / TypeScript

● 	**Database:** MongoDB (Atlas Free Tier)

● 	**Backend:** Express.js on Node.js

● 	**Frontend:** React.js (Vite) \+ TailwindCSS

● 	**Auth:** JWT \+ email OTP verification, role-based routing

● 	**AI:** Gemini API (proposal writing) \+ OpenAI/Gemini (sponsorship narrative & insight generation)

● 	**Vision/Classification:** HuggingFace Inference API (media forensics)

● 	**Maps:** Leaflet.js \+ OpenStreetMap

● 	**Email:** Nodemailer \+ Gmail API

● 	**Payments:** bKash Sandbox / Stripe Test Mode (escrow \+ subscription billing)

● 	**Charts:** Chart.js / Recharts

● 	**Version Control:** GitHub, individual commit history

 

# **User Roles**

1\. 	**Organizer:** The primary users of the platform includes university clubs, NGOs, and startups. They can build event profiles, create sponsorship proposals, track proposal status, and submit post-event reports.

 

2\. 	**Sponsor:** Verified businesses managing sponsorships as a portfolio — discover events, negotiate, pay via escrow, track ROI/pacing/goals across multiple sponsored events, and manage a team.

 

3\. 	**Admin:** The system super-user responsible for platform integrity, monitoring analytics, and configuring system parameters.

 

# **Functional Requirements**

| SL | Common Workflows |
| :---- | :---- |
| 1 | **Registration, Auth & Role Management:** Separate multi-step sign-up flows for Organizer and Sponsor accounts; JWT \+ email OTP verification; role-based dashboard routing immediately post-login; Admin has a dedicated secure portal |
| 2 | **Profile & Brand Portfolio Management:** Organizers manage their organizational details, while sponsors maintain a public profile listing their industry, budget tier, and past sponsored events. |
| 3 | **Admin Dashboard & Verification:** Admins review registration documents (trade licenses, authorization letters) to approve or reject accounts, manage disputes, and oversee platform integrity. |
| 4 | **Team Member Access & Role Assignment Panel:** Sponsor organizations invite team members (Marketing Managers, Analysts) by email, assign them to specific sponsored events, and enforce role-based permissions (edit vs. view-only). Includes activity log and instant access revocation. |

 

 

 

 

| Module 1  |  |
| :---- | :---- |
| Member | Feature Description |
| 1 | **Event Profile Builder:** A blank Word document wondering what corporate executives want to see, organizers use a clean, step-by-step form. They simply type in their event’s name, expected crowd size, venue, date, and their current social media reach.  |
| 2 | **Sponsorship Tier Package Creator:** Organizers can easily set up standard "Gold," "Silver," and "Bronze" packages (or create custom tiers). For each tier, they check off exactly what the sponsor gets—like their logo on the main banner, a 10-minute speaking slot on stage, or 5 dedicated Facebook posts. |
| 3 | **Proposal Strength Analyzer:** Right before an organizer hits Send, this tool acts like a virtual mentor. It scans the proposal and gives it a score out of 100, like Likelihood of Success: 78%, along with friendly tips like: Your budget is a bit high for a crowd of 200 people" or "Try adding more details about your venue. |
| 4 | **Sponsor Discovery & Smart Matching:** Organizers no longer have to blindly blast cold emails to 100 random companies. The moment they publish a proposal, the platform generates a curated "Top Matches" list of brands that are actively looking to fund their specific type of event. **Event Discovery & Filtering:** Corporate marketing managers get a clean, searchable feed of upcoming events across Bangladesh. Instead of checking a chaotic email inbox, they can use drop-down filters to say: "Show me all university tech fests in Dhaka happening next month with a budget under X BDT" |

 

| Module 2  |  |
| :---- | :---- |
| Member | Feature Description |
| 1 | **Proposal Creator:** A blank Word document wondering what corporate executives want to see, organizers use a clean, step-by-step form.**AI Proposal Assistant (External API \- Gemini API):** If a student organizer struggles with formal corporate writing or suffers from writer's block, they can click a "Help Me Write" button. The AI takes their rough bullet points and rewrites them into persuasive, professional business English.  |
| 2 | **Proposal Review & In-Platform Negotiation:** If a sponsor likes an event but thinks the "Gold Package" is too expensive, they don’t need to switch to WhatsApp. They simply click Counter Offer, type in their proposed budget, and ask to swap a banner ad for a booth space. |
| 3 | **Sponsor Portfolio Handler:** A page that shows and handle/manage every sponsored event as a card: spend, status (Active/Upcoming/Completed), and a green/yellow/red performance health indicator. |
| 4 | **Proposal Status Tracker:** Organizers get a visual pipeline, just like tracking a package on an e-commerce site that shows the exact live status of their sent proposals: Drafted, Sent, Viewed by Sponsor, Under Negotiation, Accepted (or Rejected). |

 

 

 

 

| Module 3  |  |
| :---- | :---- |
| Member | Feature Description |
| 1 | **Mutual Review & Rating System:** After a deal closes, both parties rate each other on reliability and communication, building credibility scores visible on public profiles.. |
| 2 | **Sponsorship Performance & ROI Analytics:** Cross-event KPI comparison (cost-per-reach, cost-per-engagement, audience growth) via bar/line charts, benchmarked against the sponsor's own historical averages. Pulls from organiser-submitted post-event data. |
| 3 | **Budget Pacing & Overspend Alert System:** Tracks a sponsor's quarterly/annual sponsorship budget burn rate, projects over/underspend, and fires email alerts at \>10% projected overspend. |
| 4 | **A/B Experiment Tracker for Sponsorship Formats:** Sponsors log experiments comparing sponsorship formats across similar events (e.g. banner vs. booth vs. speaking slot), define the primary metric, and the system calculates performance lift and flags the winning format — building institutional knowledge on what sponsorship formats actually work. |

 

| Module 4 \- Contracts, Payments & Reporting |  |
| :---- | :---- |
| Member | Feature Description |
| 1 | **Volunteer management system for organizers (Volunteer  recruitment, event day management, send instructions, send mails etc)** |
| 2 | **Post-Event Report & Approval Workflow:** Organizer uploads crowd photos, engagement screenshots, and attendee counts as proof of delivery. Sponsor reviews in-platform, approves with one click, or requests revisions via timestamped comments. Approved reports are auto-archived with a digital sign-off. The feature 3 elements will also work here, as the sponsor would see the photos posted by the organizer regarding the event. |
| 3 | **AI Fraud & Spam Detection:** To keep the platform safe from scammers, this hidden shield catches fake organizations, absurdly fake budget requests, like asking for a huge amount of money for a small club meeting, or copy-pasted spam proposals before sponsors ever see them.   **Media Forensics for Event Proofs (External API \- HuggingFace Inference):** When organizers upload their post-event wrap-up photos to claim their escrow payment, this feature makes sure they didn't just grab |
| 4 | **AI-Powered Marketing Consultation** |
|  |  |
| 5 | . |
|   |  |

 

 

 

 

 

| Module 5 \- Trust, Monetization & Platform Intelligence |  |
| :---- | :---- |
| Member | Feature Description |
| 1 | **AI Fraud & Spam Detection:** To keep the platform safe from scammers, this hidden shield catches fake organizations, absurdly fake budget requests, like asking for a huge amount of money for a small club meeting, or copy-pasted spam proposals before sponsors ever see them.   **Media Forensics for Event Proofs (External API \- HuggingFace Inference):** When organizers upload their post-event wrap-up photos to claim their escrow payment, this feature makes sure they didn't just grab |
|   | random photos from Google or upload unrelated pictures just to trick the system   |
| 2 | **Dynamic Contract Generation:** The second a sponsor and organizer click "Accept Deal," the system instantly generates a formal, legally binding PDF contract detailing the agreed budget, event dates, and promised marketing materials. Both sides can download it immediately. |
| 3 |  |
| 4 | **Automated White-Label Report Generator:** One-click branded PDF: sponsorship summary, spend vs. budget, top-performing events, month-over-month comparison. Can be scheduled for auto-delivery (e.g. every Monday) via email. |
| 5 |  |

 **AI Proposal Assistant (External API \- Gemini API):** If a student organizer struggles with formal corporate writing or suffers from writer's block, they can click a "Help Me Write" button. The AI takes their rough bullet points and rewrites them into persuasive, professional business English. 

**Event  	Location  	Mapping  	(External  	API 	\-  	Leaflet.js   	&**  
**OpenStreetMap):** Sponsors can switch from a standard list view to an interactive map of Bangladesh. They can literally zoom into geographical areas (like Banani or specific university campuses) to see pins of where upcoming events are taking place  
   
