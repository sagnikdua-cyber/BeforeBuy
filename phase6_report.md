# Phase 6 Implementation Report: Track Product

## Objective
Implement anonymous "Track Product" functionality leveraging LocalStorage, browser polling, and native notifications.

## Summary of Implementation

### 1. Frontend State & Storage
- **`frontend/src/utils/trackingStorage.js`**:
  - Implemented `trackProduct`, `untrackProduct`, `getTrackedProducts`, and `updateTrackedProductStatus`.
  - Uses the fixed `beforebuy_tracked_products` LocalStorage key.
  - Implements a rigid schema containing: `trackingId`, `title`, `merchant`, `targetPrice`, `lastKnownPrice`, `alertTriggered`, and `createdAt`.
  - Gracefully handles missing storage or malformed JSON (returns `[]` on error instead of throwing).

### 2. Context & Polling (`TrackingContext.jsx`)
- Global React Context handles providing tracking state to the entire app.
- Hosted a rigid 15-minute `setInterval` polling loop (`15 * 60 * 1000`).
- During polling: it staggers fetch requests by 2 seconds between each product to prevent SerpApi bursts.
- Evaluates `if (currentPrice <= targetPrice)` accurately. Triggers native `window.Notification` if permitted. Fallbacks to a safe `setTimeout(alert)` if notifications are denied or unsupported. 
- Properly halts repeated alerts by flipping `alertTriggered` to true once condition is met.

### 3. Backend Tracking API
- **`backend/src/routes/track.js`**:
  - Implemented lightweight `GET /api/track/check?title=...&merchant=...` endpoint.
  - Passes requests cleanly to SerpApi. 
  - Prevents "accessory leaking" (e.g., getting a ₹700 case instead of a phone) by mirroring Phase 4 and Phase 5's strict exact-match token and negative-keyword filtering fallback logic if an exact `product_id` match isn't present.

### 4. UI Adjustments
- Integrated a new "Track" button into `ProductCard.jsx` and `AlternativeCard.jsx`. 
- Built a pop-up `TrackingModal.jsx` for configuring the numeric target price (safeguarded against negatives, 0, or non-numeric inputs).
- Built a dedicated route: **`/tracked`** (`TrackedPage.jsx`), accessible via the new "Tracked Alerts" button in the header.
- The Tracked page displays clear status badges ("Monitoring" vs "Target Reached!"), permits in-line `targetPrice` editing, and offers manual "Check Prices Now" functionality for instant testing.

## Security & Regression
- Phase 1-5 core logic is isolated and unaffected.
- No MongoDB records were used for tracking.
- No user credentials (login/email) were created or exposed.
- All pricing constraints execute entirely locally.
- ML prediction endpoints continue functioning purely on the analysis views.
