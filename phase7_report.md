# Phase 7 Implementation Report: Voice Search + PWA

## Objective
Implement browser-native voice search directly within the BeforeBuy search bar and transform the application into an installable Progressive Web App (PWA).

## Summary of Implementation

### 1. Browser-Native Voice Search
- **Component**: `frontend/src/components/SearchBar.jsx`
- **Speech API Implementation**: 
  - Utilized `window.SpeechRecognition` (and `webkitSpeechRecognition` fallback). 
  - Completely self-contained within the browser (no external paid APIs like Azure/AWS/OpenAI).
- **Accessibility & UX**:
  - Added precise UI states: `Listening...`, `No speech detected`, `Microphone access denied`.
  - Added proper ARIA labels (`aria-label="Voice Search"`) and clear `disabled` states for browsers that lack Web Speech API support (e.g., Firefox without flags).
  - The voice transcript populates the search input without auto-submitting, allowing the user to review or edit before hitting Enter.
- **Safety**: Wrapped `recognition.start()` in a `try/catch` and handled cleanup inside `onend` to prevent memory leaks or dual-listening bugs.

### 2. Progressive Web App (PWA)
- **Plugin Added**: `vite-plugin-pwa` injected into `frontend/vite.config.js`.
- **Manifest Setup**:
  - `name`: BeforeBuy
  - `short_name`: BeforeBuy
  - `description`: Compare prices. Understand the trend. Buy at the right time.
  - `theme_color` & `background_color`: `#0a0f18` (Matching Phase 1 Dark Theme).
  - `icons`: Passed the existing `favicon.svg` with sizes spanning `192x192` to `512x512` mapping to `image/svg+xml`, passing Chromium installation prerequisites.
  - Included SEO Meta Tags and Apple Touch Icons in `index.html`.
- **Service Worker Caching Strategy**:
  - Cached static shell assets (JS, CSS, fonts, SVG) via Workbox.
  - **Crucial Rule enforced**: Added a strict `NetworkOnly` runtime caching rule for `urlPattern: ({ url }) => url.pathname.startsWith('/api/')`. This physically prevents the Service Worker from caching SerpApi requests or Track polling, ensuring users are NEVER shown stale "live" prices if they open the app offline.

### 3. Offline UI Feedback
- **Component**: `frontend/src/components/ReloadPrompt.jsx`
- Added a floating global status indicator that listens to `window.ononline` and `window.onoffline`.
- If the user loses connection, a red toast gracefully explains: *"You are offline. Live price search requires an internet connection."*
- Handles PWA updates cleanly (notifying the user when a new build is ready to install).

## Regression & Security
- **No external leaks**: Microphone data is immediately converted to text by the local OS browser layer; no audio blobs are recorded or transmitted to the Node backend.
- **Secrets**: `vite-plugin-pwa` only caches frontend bundles. Backend `.env` remains totally decoupled.
- **Phase 6 Alerts**: The Background Poller (`TrackingContext`) is completely unaffected by the Service Worker logic, as `fetch('/api/track/check')` bypasses the cache entirely.

## Tests Performed
- ✅ Executed `npm run build`; PWA bundles correctly parsed (manifest.webmanifest and sw.js generated without error).
- ✅ Voice Search gracefully degrades when permissions are rejected.
- ✅ Offline topology is strictly isolated from live pricing logic.
