# Analyzer Demo Dataset Identity Fix Plan

## Goal Description
Fix the "Analysis Unavailable" bug when searching for the exact authorized demo product. The root cause is that SerpApi returns a numeric `productId` (e.g. `15721896708756098667`) which the frontend prioritizes as `productKey`. When this numeric key reaches the backend, `isDemoProduct` checks for substrings like "samsung" and "s25", which fail on numeric IDs, thereby bypassing the authorized demo fallback. 

## User Review Required
No major architectural changes; just normalizing how the product identity is derived from the title to ensure accurate demographic fallback without breaking `productId` usage for real MongoDB history tracking.

## Proposed Changes

### Backend

#### [NEW] `backend/src/utils/identity.js`
- Create `getCanonicalIdentity(title)` function to parse raw titles and return structured data (brand, model, storage, RAM, and a `canonicalProductKey`).
- Create `isAuthorizedDemoProduct(identity)` to strictly enforce the S25 Ultra 12GB/256GB criteria, ensuring safety against 512GB, 1TB, or different model leaks.

#### [MODIFY] `backend/src/routes/analyze.js`
- Update the `/api/analyze` route to accept `title` as an optional query parameter.
- Use `getCanonicalIdentity(title)` to derive the canonical identity.
- Replace the fragile substring `isDemoProduct` check with `isAuthorizedDemoProduct(canonicalIdentity)`.
- Use the provided `productKey` (the numeric `productId`) for real MongoDB lookups, but use the `canonicalIdentity` for the demo fallback authorization.

### Frontend

#### [MODIFY] `frontend/src/pages/SearchPage.jsx`
- When triggering the Analyze panel, pass the product's `title` via the query string to `/api/analyze` in addition to the `productKey`.

## Verification Plan
### Automated / API Tests
- Make direct calls to `getCanonicalIdentity` for all required test cases in the prompt (256GB, 512GB, S24 Ultra, Titanium color, etc) and verify exact matches.
- Call `/api/analyze` with a numeric `productKey` and the S25 Ultra 256GB title to verify the demo data loads successfully.

### Manual Verification
- Will trigger the actual UI flow to ensure the AnalyzerPanel renders without the "Analysis Unavailable" error.
