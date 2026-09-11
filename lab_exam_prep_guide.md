# SponsorMetrics BD - Lab Exam Preparation Guide (Modules 1–4 Feature 2 Strategy)

> **EXAM SCOPE:** Modules 1, 2, 3, and 4 — Feature 2 of each module.
>
> **EXAM GOAL:** Perform a live modification for your assigned feature question satisfying **all 3 layers**:
> 1. 🗄️ **Database Integration** (Mongoose Schema / Model update)
> 2. ⚙️ **Backend Change** (Express Controller / Route logic)
> 3. 🎨 **Frontend Change** (React Component / State / Form Input / API Service)
>
> ⚠️ **CRITICAL RULE:** Breaking the code, runtime crashes, or missing any of the 3 layers results in **0 marks**.

---

## 🗺️ Feature 2 Master Directory Map (Modules 1–4)

Below is your exact cheat sheet for locating files for Feature 2 in your codebase:

| Module | Feature Name | 🗄️ DB Model | ⚙️ Backend Files | 🎨 Frontend Files |
| :--- | :--- | :--- | :--- | :--- |
| **Module 1** | **Sponsorship Tier Package Creator** | [`SponsorshipTier.js`](file:///c:/471_lab/SponsorMetrics/backend/src/models/SponsorshipTier.js) | [`tier.controller.js`](file:///c:/471_lab/SponsorMetrics/backend/src/controllers/tier.controller.js)<br>[`tier.routes.js`](file:///c:/471_lab/SponsorMetrics/backend/src/routes/tier.routes.js) | [`tierApi.js`](file:///c:/471_lab/SponsorMetrics/frontend/src/services/tierApi.js)<br>[`TierPackageCreator.jsx`](file:///c:/471_lab/SponsorMetrics/frontend/src/pages/organizer/TierPackageCreator.jsx) |
| **Module 2** | **Proposal Review & In-Platform Negotiation** | [`Proposal.js`](file:///c:/471_lab/SponsorMetrics/backend/src/models/Proposal.js) | [`proposal.controller.js`](file:///c:/471_lab/SponsorMetrics/backend/src/controllers/proposal.controller.js)<br>[`proposalRoutes.js`](file:///c:/471_lab/SponsorMetrics/backend/src/routes/proposalRoutes.js) | [`proposalApi.js`](file:///c:/471_lab/SponsorMetrics/frontend/src/services/proposalApi.js)<br>[`ProposalReview.jsx`](file:///c:/471_lab/SponsorMetrics/frontend/src/pages/sponsor/ProposalReview.jsx)<br>[`CounterOfferForm.jsx`](file:///c:/471_lab/SponsorMetrics/frontend/src/components/sponsor/CounterOfferForm.jsx)<br>[`NegotiationHistory.jsx`](file:///c:/471_lab/SponsorMetrics/frontend/src/components/common/NegotiationHistory.jsx) |
| **Module 3** | **Sponsorship Performance & ROI Analytics** | [`PostEventMetrics.js`](file:///c:/471_lab/SponsorMetrics/backend/src/models/PostEventMetrics.js) | [`analytics.controller.js`](file:///c:/471_lab/SponsorMetrics/backend/src/controllers/analytics.controller.js)<br>[`analytics.routes.js`](file:///c:/471_lab/SponsorMetrics/backend/src/routes/analytics.routes.js) | [`analyticsApi.js`](file:///c:/471_lab/SponsorMetrics/frontend/src/services/analyticsApi.js)<br>[`AnalyticsDashboard.jsx`](file:///c:/471_lab/SponsorMetrics/frontend/src/pages/sponsor/AnalyticsDashboard.jsx)<br>[`PostEventMetricsPage.jsx`](file:///c:/471_lab/SponsorMetrics/frontend/src/pages/organizer/PostEventMetricsPage.jsx)<br>[`AnalyticsInsightPanel.jsx`](file:///c:/471_lab/SponsorMetrics/frontend/src/components/sponsor/AnalyticsInsightPanel.jsx) |
| **Module 4** | **Post-Event Report & Approval Workflow** | [`PostEventMetrics.js`](file:///c:/471_lab/SponsorMetrics/backend/src/models/PostEventMetrics.js) | [`report.controller.js`](file:///c:/471_lab/SponsorMetrics/backend/src/controllers/report.controller.js)<br>[`report.routes.js`](file:///c:/471_lab/SponsorMetrics/backend/src/routes/report.routes.js) | [`reportApi.js`](file:///c:/471_lab/SponsorMetrics/frontend/src/services/reportApi.js)<br>[`OrganizerReportPage.jsx`](file:///c:/471_lab/SponsorMetrics/frontend/src/pages/organizer/OrganizerReportPage.jsx)<br>[`SponsorReportReview.jsx`](file:///c:/471_lab/SponsorMetrics/frontend/src/pages/sponsor/SponsorReportReview.jsx) |

---

## ⚡ The Universal 3-Step Live Modification Workflow

```
[Step 1: DB Schema]  --->  [Step 2: Backend Controller/Route]  --->  [Step 3: Frontend Service & React UI]
(Add field with default)     (Destructure req.body & save)             (Add state, input field, API call)
```

### Step 1: Database (Mongoose Schema)
- Open the target model file.
- Add the required field with an explicit `default` value:
  ```javascript
  // String
  customNote: { type: String, default: '' },
  // Number
  maxQuantity: { type: Number, default: 1, min: 1 },
  // Boolean
  isUrgent: { type: Boolean, default: false }
  ```

### Step 2: Backend (Controller & Route)
- Open the controller method handling the request.
- Destructure the new field from `req.body`:
  ```javascript
  const { customNote, maxQuantity } = req.body;
  ```
- Save to DB during creation or update:
  ```javascript
  // Example for creating:
  const newRecord = await Model.create({ ..., customNote, maxQuantity });

  // Example for update / subdocument push:
  doc.customNote = customNote;
  await doc.save();
  ```
- Return the updated data in `res.json(...)`.

### Step 3: Frontend (API & React UI)
1. **API Service (`frontend/src/services/...`):**
   - Ensure the new property is included in the payload passed to Axios.
2. **React Component (`frontend/src/pages/...` or `frontend/src/components/...`):**
   - Add state: `const [customNote, setCustomNote] = useState('');`
   - Render input in JSX:
     ```jsx
     <input
       type="text"
       value={customNote}
       onChange={(e) => setCustomNote(e.target.value)}
       placeholder="Enter custom note..."
       className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
     />
     ```
   - Render field value with optional chaining: `{item?.customNote || 'N/A'}`

---

## 🛡️ Fail-Safe Rules (Zero-Crash Guarantee)

1. ❌ **NEVER leave schema fields without defaults** — prevents server crashes on existing DB records.
2. ❌ **ALWAYS use optional chaining (`?.`) in React** — prevents `Cannot read properties of undefined` UI crashes.
3. 🛠️ **Check Nodemon terminal on save** — verify backend has no syntax errors.
4. 🛠️ **Check Browser Console (F12) Network Tab** — verify 200/201 HTTP status responses.

---

## 🏋️ Mock Practice Drills (Modules 1–4)

Below are **12 realistic mock exam questions** (3 drills per module) spanning Numbers, Strings, Booleans, Enums, and Dates. Every drill contains complete 3-layer implementation code matching this exact repository structure.

---

### 📦 MODULE 1: Sponsorship Tier Package Creator

#### 🔷 Mock Drill 1A: Number Field (`maxSponsors`)
> **Exam Question:** "Add a `maxSponsors` (limit on how many sponsors can buy this tier) field to sponsorship tiers."

1. **🗄️ DB ([`SponsorshipTier.js`](file:///c:/471_lab/SponsorMetrics/backend/src/models/SponsorshipTier.js)):**
   ```javascript
   maxSponsors: { type: Number, default: 5, min: 1 }
   ```
2. **⚙️ Backend ([`tier.controller.js`](file:///c:/471_lab/SponsorMetrics/backend/src/controllers/tier.controller.js)):**
   - **Step A: Destructure `maxSponsors` from `req.body`:**
     - In `createTier` (line 55): `const { eventId, name, price, isCustom, benefits, formatType, maxSponsors } = req.body;`
     - In `updateTier` (line 112): `const { name, price, isCustom, benefits, formatType, maxSponsors } = req.body;`
   - **Step B: Pass to `SponsorshipTier.create(...)` in `createTier` (around line 77–86):**
     ```javascript
     const tier = await SponsorshipTier.create({
       eventId,
       name: normalizedName,
       price: normalizedPrice,
       isCustom: Boolean(isCustom),
       benefits: normalizedBenefits,
       formatType: inferFormatType(normalizedBenefits, formatType),
       maxSponsors: Number(maxSponsors) || 5, // <--- ADD THIS LINE
     });
     ```
   - **Step C: Assign in `updateTier` (around line 152):**
     ```javascript
     if (maxSponsors !== undefined) {
       tier.maxSponsors = Number(maxSponsors) || 5;
     }
     ```
3. **🎨 Frontend ([`TierPackageCreator.jsx`](file:///c:/471_lab/SponsorMetrics/frontend/src/pages/organizer/TierPackageCreator.jsx)):**
   - **State:** `const [maxSponsors, setMaxSponsors] = useState(5);`
   - **Form Input:**
     ```jsx
     <input
       type="number"
       value={maxSponsors}
       onChange={(e) => setMaxSponsors(e.target.value)}
       className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
       placeholder="Max sponsors limit"
     />
     ```
   - **Display Card:** `<span>Max Sponsors: {tier?.maxSponsors || 'Unlimited'}</span>`

---

#### 🔷 Mock Drill 1B: Number / Discount Field (`earlyBirdDiscount`)
> **Exam Question:** "Allow organizers to set an optional `earlyBirdDiscount` percentage (0 to 100%) when creating a tier, and display an Early Bird tag on the tier card."

1. **🗄️ DB ([`SponsorshipTier.js`](file:///c:/471_lab/SponsorMetrics/backend/src/models/SponsorshipTier.js)):**
   ```javascript
   earlyBirdDiscount: { type: Number, default: 0, min: 0, max: 100 }
   ```
2. **⚙️ Backend ([`tier.controller.js`](file:///c:/471_lab/SponsorMetrics/backend/src/controllers/tier.controller.js)):**
   - **Step A: Destructure `earlyBirdDiscount` from `req.body`:**
     - In `createTier` (line 55): `const { eventId, name, price, isCustom, benefits, formatType, earlyBirdDiscount } = req.body;`
     - In `updateTier` (line 112): `const { name, price, isCustom, benefits, formatType, earlyBirdDiscount } = req.body;`
   - **Step B: Pass to `SponsorshipTier.create(...)` inside `createTier` (around line 77–86):**
     ```javascript
     const tier = await SponsorshipTier.create({
       eventId,
       name: normalizedName,
       price: normalizedPrice,
       isCustom: Boolean(isCustom),
       benefits: normalizedBenefits,
       formatType: inferFormatType(normalizedBenefits, formatType),
       earlyBirdDiscount: Number(earlyBirdDiscount) || 0, // <--- ADD THIS LINE
     });
     ```
   - **Step C: Assign inside `updateTier` (around line 152):**
     ```javascript
     if (earlyBirdDiscount !== undefined) {
       tier.earlyBirdDiscount = Number(earlyBirdDiscount) || 0;
     }
     ```
3. **🎨 Frontend ([`TierPackageCreator.jsx`](file:///c:/471_lab/SponsorMetrics/frontend/src/pages/organizer/TierPackageCreator.jsx)):**
   - **State:** `const [earlyBirdDiscount, setEarlyBirdDiscount] = useState(0);`
   - **Form Input:**
     ```jsx
     <input
       type="number"
       min="0"
       max="100"
       value={earlyBirdDiscount}
       onChange={(e) => setEarlyBirdDiscount(e.target.value)}
       placeholder="Discount %"
       className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
     />
     ```
   - **Display Card:**
     ```jsx
     {tier?.earlyBirdDiscount > 0 && (
       <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded">
         {tier.earlyBirdDiscount}% Early Bird Off!
       </span>
     )}
     ```

---

#### 🔷 Mock Drill 1C: Enum / Dropdown Field (`tierBadge`)
> **Exam Question:** "Add a `tierBadge` select dropdown ('Standard', 'Popular', 'VIP', 'Exclusive') to Sponsorship Tiers and render a stylized badge on the card."

1. **🗄️ DB ([`SponsorshipTier.js`](file:///c:/471_lab/SponsorMetrics/backend/src/models/SponsorshipTier.js)):**
   ```javascript
   tierBadge: {
     type: String,
     enum: ['Standard', 'Popular', 'VIP', 'Exclusive'],
     default: 'Standard'
   }
   ```
2. **⚙️ Backend ([`tier.controller.js`](file:///c:/471_lab/SponsorMetrics/backend/src/controllers/tier.controller.js)):**
   - **Step A: Destructure `tierBadge` from `req.body`:**
     - In `createTier` (line 55): `const { eventId, name, price, isCustom, benefits, formatType, tierBadge } = req.body;`
     - In `updateTier` (line 112): `const { name, price, isCustom, benefits, formatType, tierBadge } = req.body;`
   - **Step B: Pass to `SponsorshipTier.create(...)` inside `createTier` (around line 77–86):**
     ```javascript
     const tier = await SponsorshipTier.create({
       eventId,
       name: normalizedName,
       price: normalizedPrice,
       isCustom: Boolean(isCustom),
       benefits: normalizedBenefits,
       formatType: inferFormatType(normalizedBenefits, formatType),
       tierBadge: tierBadge || 'Standard', // <--- ADD THIS LINE
     });
     ```
   - **Step C: Assign inside `updateTier` (around line 152):**
     ```javascript
     if (tierBadge !== undefined) {
       tier.tierBadge = tierBadge || 'Standard';
     }
     ```
3. **🎨 Frontend ([`TierPackageCreator.jsx`](file:///c:/471_lab/SponsorMetrics/frontend/src/pages/organizer/TierPackageCreator.jsx)):**
   - **State:** `const [tierBadge, setTierBadge] = useState('Standard');`
   - **Form Dropdown:**
     ```jsx
     <select
       value={tierBadge}
       onChange={(e) => setTierBadge(e.target.value)}
       className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
     >
       <option value="Standard">Standard</option>
       <option value="Popular">Popular</option>
       <option value="VIP">VIP</option>
       <option value="Exclusive">Exclusive</option>
     </select>
     ```
   - **Display Card:** `<span className="px-2 py-1 bg-purple-600/30 text-purple-300 text-xs rounded">{tier?.tierBadge || 'Standard'}</span>`

---

### 🤝 MODULE 2: Proposal Review & In-Platform Negotiation

#### 🔷 Mock Drill 2A: Number Field (`validityDays`)
> **Exam Question:** "Allow sponsors to specify `validityDays` (expiration in days) when submitting a Counter Offer."

1. **🗄️ DB ([`Proposal.js`](file:///c:/471_lab/SponsorMetrics/backend/src/models/Proposal.js)):**
   - Inside `counterOfferSchema`:
   ```javascript
   validityDays: { type: Number, default: 7, min: 1 }
   ```
2. **⚙️ Backend ([`proposal.controller.js`](file:///c:/471_lab/SponsorMetrics/backend/src/controllers/proposal.controller.js)):**
   - Inside `counterOffer` function:
   ```javascript
   const { proposedBudget, swapFrom, swapTo, message, validityDays } = req.body;
   proposal.counterOffers.push({
     offeredBy: req.user._id,
     role: req.user.role,
     proposedBudget,
     swapFrom,
     swapTo,
     message,
     validityDays: Number(validityDays) || 7,
   });
   ```
3. **🎨 Frontend ([`CounterOfferForm.jsx`](file:///c:/471_lab/SponsorMetrics/frontend/src/components/sponsor/CounterOfferForm.jsx) & [`NegotiationHistory.jsx`](file:///c:/471_lab/SponsorMetrics/frontend/src/components/common/NegotiationHistory.jsx)):**
   - **CounterOfferForm State & Input:**
     ```jsx
     const [validityDays, setValidityDays] = useState(7);
     // In form JSX:
     <input
       type="number"
       value={validityDays}
       onChange={(e) => setValidityDays(e.target.value)}
       className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
       placeholder="Offer valid for (days)"
     />
     ```
   - **Submit Payload:** Pass `validityDays` to `onSubmit({ ..., validityDays })`.
   - **NegotiationHistory Display:** `<span>Valid for: {offer?.validityDays || 7} days</span>`

---

#### 🔷 Mock Drill 2B: String Field (`paymentTerms`)
> **Exam Question:** "Add a `paymentTerms` text input (e.g. '50% Upfront, 50% Post-Event') to the Counter Offer form and display it in the negotiation history."

1. **🗄️ DB ([`Proposal.js`](file:///c:/471_lab/SponsorMetrics/backend/src/models/Proposal.js)):**
   - Inside `counterOfferSchema`:
   ```javascript
   paymentTerms: { type: String, default: '100% Upfront', trim: true }
   ```
2. **⚙️ Backend ([`proposal.controller.js`](file:///c:/471_lab/SponsorMetrics/backend/src/controllers/proposal.controller.js)):**
   ```javascript
   const { paymentTerms } = req.body;
   proposal.counterOffers.push({
     // ...
     paymentTerms: String(paymentTerms || '100% Upfront').trim()
   });
   ```
3. **🎨 Frontend ([`CounterOfferForm.jsx`](file:///c:/471_lab/SponsorMetrics/frontend/src/components/sponsor/CounterOfferForm.jsx) & [`NegotiationHistory.jsx`](file:///c:/471_lab/SponsorMetrics/frontend/src/components/common/NegotiationHistory.jsx)):**
   - **State:** `const [paymentTerms, setPaymentTerms] = useState('50% Upfront, 50% Post-Event');`
   - **Input:** `<input type="text" value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} className="..." />`
   - **History Display:** `<p className="text-xs text-slate-400">Terms: {offer?.paymentTerms || 'N/A'}</p>`

---

#### 🔷 Mock Drill 2C: Boolean Field (`isUrgent`)
> **Exam Question:** "Add an `isUrgent` checkbox when sending a counter offer so the user can mark an offer for urgent review."

1. **🗄️ DB ([`Proposal.js`](file:///c:/471_lab/SponsorMetrics/backend/src/models/Proposal.js)):**
   - Inside `counterOfferSchema`:
   ```javascript
   isUrgent: { type: Boolean, default: false }
   ```
2. **⚙️ Backend ([`proposal.controller.js`](file:///c:/471_lab/SponsorMetrics/backend/src/controllers/proposal.controller.js)):**
   ```javascript
   const { isUrgent } = req.body;
   proposal.counterOffers.push({
     // ...
     isUrgent: Boolean(isUrgent)
   });
   ```
3. **🎨 Frontend ([`CounterOfferForm.jsx`](file:///c:/471_lab/SponsorMetrics/frontend/src/components/sponsor/CounterOfferForm.jsx) & [`NegotiationHistory.jsx`](file:///c:/471_lab/SponsorMetrics/frontend/src/components/common/NegotiationHistory.jsx)):**
   - **State:** `const [isUrgent, setIsUrgent] = useState(false);`
   - **Checkbox:**
     ```jsx
     <label className="flex items-center gap-2 text-white">
       <input type="checkbox" checked={isUrgent} onChange={(e) => setIsUrgent(e.target.checked)} />
       Mark as Urgent Request
     </label>
     ```
   - **History Display:**
     ```jsx
     {offer?.isUrgent && (
       <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded font-bold">URGENT</span>
     )}
     ```

---

### 📊 MODULE 3: Sponsorship Performance & ROI Analytics

#### 🔷 Mock Drill 3A: Number Field (`organizerRating`)
> **Exam Question:** "Allow organizers to submit an `organizerRating` (1 to 10) when submitting post-event metrics and display it on the sponsor's analytics dashboard."

1. **🗄️ DB ([`PostEventMetrics.js`](file:///c:/471_lab/SponsorMetrics/backend/src/models/PostEventMetrics.js)):**
   ```javascript
   organizerRating: { type: Number, default: 10, min: 1, max: 10 }
   ```
2. **⚙️ Backend ([`analytics.controller.js`](file:///c:/471_lab/SponsorMetrics/backend/src/controllers/analytics.controller.js)):**
   - In `submitMetrics`:
   ```javascript
   const { reach, engagement, attendance, organizerRating } = req.body;
   metrics.organizerRating = Number(organizerRating) || 10;
   ```
3. **🎨 Frontend ([`PostEventMetricsPage.jsx`](file:///c:/471_lab/SponsorMetrics/frontend/src/pages/organizer/PostEventMetricsPage.jsx) & [`AnalyticsDashboard.jsx`](file:///c:/471_lab/SponsorMetrics/frontend/src/pages/sponsor/AnalyticsDashboard.jsx)):**
   - **PostEventMetricsPage Form:**
     ```jsx
     const [organizerRating, setOrganizerRating] = useState(10);
     <input type="number" min="1" max="10" value={organizerRating} onChange={(e) => setOrganizerRating(e.target.value)} />
     ```
   - **AnalyticsDashboard Display Card:**
     ```jsx
     <div className="bg-slate-800 p-4 rounded border border-slate-700">
       <span className="text-slate-400 text-sm">Organizer Self Rating</span>
       <p className="text-xl font-bold text-amber-400">{metrics?.organizerRating || 10} / 10</p>
     </div>
     ```

---

#### 🔷 Mock Drill 3B: Number Metric Field (`socialImpressions`)
> **Exam Question:** "Add a `socialImpressions` metric field to post-event metrics submission and display it as an ROI stat card on the Analytics Dashboard."

1. **🗄️ DB ([`PostEventMetrics.js`](file:///c:/471_lab/SponsorMetrics/backend/src/models/PostEventMetrics.js)):**
   ```javascript
   socialImpressions: { type: Number, default: 0, min: 0 }
   ```
2. **⚙️ Backend ([`analytics.controller.js`](file:///c:/471_lab/SponsorMetrics/backend/src/controllers/analytics.controller.js)):**
   ```javascript
   const { socialImpressions } = req.body;
   metrics.socialImpressions = Number(socialImpressions) || 0;
   ```
3. **🎨 Frontend ([`PostEventMetricsPage.jsx`](file:///c:/471_lab/SponsorMetrics/frontend/src/pages/organizer/PostEventMetricsPage.jsx) & [`AnalyticsDashboard.jsx`](file:///c:/471_lab/SponsorMetrics/frontend/src/pages/sponsor/AnalyticsDashboard.jsx)):**
   - **Organizer Input:**
     ```jsx
     const [socialImpressions, setSocialImpressions] = useState(0);
     <input type="number" value={socialImpressions} onChange={(e) => setSocialImpressions(e.target.value)} />
     ```
   - **Sponsor Stat Display:**
     ```jsx
     <p className="text-2xl font-bold text-blue-400">
       {(metrics?.socialImpressions || 0).toLocaleString()} Views
     </p>
     ```

---

#### 🔷 Mock Drill 3C: Boolean Flag Field (`verifiedByThirdParty`)
> **Exam Question:** "Add a `verifiedByThirdParty` Boolean checkbox to metric submissions and display a 'Verified Data' badge on the Sponsor Analytics Dashboard."

1. **🗄️ DB ([`PostEventMetrics.js`](file:///c:/471_lab/SponsorMetrics/backend/src/models/PostEventMetrics.js)):**
   ```javascript
   verifiedByThirdParty: { type: Boolean, default: false }
   ```
2. **⚙️ Backend ([`analytics.controller.js`](file:///c:/471_lab/SponsorMetrics/backend/src/controllers/analytics.controller.js)):**
   ```javascript
   const { verifiedByThirdParty } = req.body;
   metrics.verifiedByThirdParty = Boolean(verifiedByThirdParty);
   ```
3. **🎨 Frontend ([`PostEventMetricsPage.jsx`](file:///c:/471_lab/SponsorMetrics/frontend/src/pages/organizer/PostEventMetricsPage.jsx) & [`AnalyticsDashboard.jsx`](file:///c:/471_lab/SponsorMetrics/frontend/src/pages/sponsor/AnalyticsDashboard.jsx)):**
   - **Organizer Checkbox:**
     ```jsx
     const [verifiedByThirdParty, setVerifiedByThirdParty] = useState(false);
     <label className="flex items-center gap-2 text-white">
       <input type="checkbox" checked={verifiedByThirdParty} onChange={(e) => setVerifiedByThirdParty(e.target.checked)} />
       Audit Verified Data
     </label>
     ```
   - **Sponsor Dashboard Badge:**
     ```jsx
     {metrics?.verifiedByThirdParty && (
       <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-1 rounded">
         ✓ 3rd Party Verified
       </span>
     )}
     ```

---

### 📑 MODULE 4: Post-Event Report & Approval Workflow

#### 🔷 Mock Drill 4A: Date Field (`revisionDeadline`)
> **Exam Question:** "Add an optional `revisionDeadline` date field when a sponsor requests a revision on a post-event report."

1. **🗄️ DB ([`PostEventMetrics.js`](file:///c:/471_lab/SponsorMetrics/backend/src/models/PostEventMetrics.js)):**
   ```javascript
   revisionDeadline: { type: Date, default: null }
   ```
2. **⚙️ Backend ([`report.controller.js`](file:///c:/471_lab/SponsorMetrics/backend/src/controllers/report.controller.js)):**
   - In `requestRevision`:
   ```javascript
   const { comment, revisionDeadline } = req.body;
   if (revisionDeadline) metrics.revisionDeadline = new Date(revisionDeadline);
   ```
3. **🎨 Frontend ([`SponsorReportReview.jsx`](file:///c:/471_lab/SponsorMetrics/frontend/src/pages/sponsor/SponsorReportReview.jsx) & [`OrganizerReportPage.jsx`](file:///c:/471_lab/SponsorMetrics/frontend/src/pages/organizer/OrganizerReportPage.jsx)):**
   - **Sponsor Revision Modal:**
     ```jsx
     const [deadline, setDeadline] = useState('');
     <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="..." />
     ```
   - **Organizer Page Display:**
     ```jsx
     <p className="text-xs text-amber-400">
       Deadline: {report?.revisionDeadline ? new Date(report.revisionDeadline).toLocaleDateString() : 'N/A'}
     </p>
     ```

---

#### 🔷 Mock Drill 4B: Number Rating Field (`satisfactionScore`)
> **Exam Question:** "When a sponsor approves a report, allow them to record a `satisfactionScore` (1 to 5 stars) inside the signOff schema and show it on the report page."

1. **🗄️ DB ([`PostEventMetrics.js`](file:///c:/471_lab/SponsorMetrics/backend/src/models/PostEventMetrics.js)):**
   - Inside `signOff` object schema:
   ```javascript
   signOff: {
     sponsorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
     approvedAt: { type: Date },
     satisfactionScore: { type: Number, default: 5, min: 1, max: 5 }
   }
   ```
2. **⚙️ Backend ([`report.controller.js`](file:///c:/471_lab/SponsorMetrics/backend/src/controllers/report.controller.js)):**
   - In `approveReport`:
   ```javascript
   const { satisfactionScore } = req.body;
   metrics.signOff = {
     sponsorId: req.user._id,
     approvedAt: new Date(),
     satisfactionScore: Number(satisfactionScore) || 5
   };
   ```
3. **🎨 Frontend ([`SponsorReportReview.jsx`](file:///c:/471_lab/SponsorMetrics/frontend/src/pages/sponsor/SponsorReportReview.jsx) & [`OrganizerReportPage.jsx`](file:///c:/471_lab/SponsorMetrics/frontend/src/pages/organizer/OrganizerReportPage.jsx)):**
   - **Approval Action:** Pass `satisfactionScore: 5` in approve API payload.
   - **Report Display:**
     ```jsx
     <span>
       Rating: {'⭐'.repeat(report?.signOff?.satisfactionScore || 5)}
     </span>
     ```

---

#### 🔷 Mock Drill 4C: String / Textarea Field (`executiveSummary`)
> **Exam Question:** "Allow organizers to submit an `executiveSummary` text paragraph when submitting post-event reports for sponsor review."

1. **🗄️ DB ([`PostEventMetrics.js`](file:///c:/471_lab/SponsorMetrics/backend/src/models/PostEventMetrics.js)):**
   ```javascript
   executiveSummary: { type: String, default: '', trim: true }
   ```
2. **⚙️ Backend ([`report.controller.js`](file:///c:/471_lab/SponsorMetrics/backend/src/controllers/report.controller.js)):**
   - In report submission/update controller:
   ```javascript
   const { executiveSummary } = req.body;
   metrics.executiveSummary = String(executiveSummary || '').trim();
   ```
3. **🎨 Frontend ([`OrganizerReportPage.jsx`](file:///c:/471_lab/SponsorMetrics/frontend/src/pages/organizer/OrganizerReportPage.jsx) & [`SponsorReportReview.jsx`](file:///c:/471_lab/SponsorMetrics/frontend/src/pages/sponsor/SponsorReportReview.jsx)):**
   - **Organizer Input:**
     ```jsx
     const [executiveSummary, setExecutiveSummary] = useState('');
     <textarea
       value={executiveSummary}
       onChange={(e) => setExecutiveSummary(e.target.value)}
       placeholder="Enter executive summary for sponsor..."
       className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white h-24"
     />
     ```
   - **Sponsor Review Display:**
     ```jsx
     <div className="bg-slate-800/60 p-4 rounded border border-slate-700">
       <h4 className="text-slate-300 font-semibold mb-1">Executive Summary</h4>
       <p className="text-slate-400 text-sm">{report?.executiveSummary || 'No summary provided.'}</p>
     </div>
     ```

---

## 💻 Local Testing Commands

```powershell
# Backend Server
cd c:\471_lab\SponsorMetrics\backend
npm run dev

# Frontend App
cd c:\471_lab\SponsorMetrics\frontend
npm run dev
```
