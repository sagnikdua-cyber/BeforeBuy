# 🛒 BeforeBuy

### Compare prices. Understand the trend. Track the right price.

> BeforeBuy is a shopping intelligence platform that helps users discover live product prices across merchants, understand historical price behaviour, explore relevant alternatives, and track a personal target price — so they can make a more informed decision before they buy.

---

## 💡 The Idea

Most shopping tools answer one question:

> **"Where is it cheapest right now?"**

BeforeBuy asks three more:

> **"What is happening to the price over time?"**  
> **"Are there relevant alternatives worth considering?"**  
> **"When does the price reach what I'm willing to pay?"**

A price that looks low today might be normal for this product. A price that looks high today might be dropping. BeforeBuy surfaces that context alongside the current live price, so the shopper has more to work with than a single number.

---

## ✨ Features

### 🔎 Live Product Search
Search any product and receive live Google Shopping results in real time, powered by **SerpApi**. Results are filtered to remove accessories, cases, chargers, and unrelated listings — so the user sees relevant products only.

### 💰 Current Price Comparison
All valid numeric prices from the live SerpApi response are compared. The lowest current price among exact-match results is highlighted automatically.

### 🛍️ Before You Buy — Alternative Discovery
The backend scores every non-exact-match result from the same SerpApi response against the primary product using a deterministic similarity algorithm (brand match, category match, storage/RAM spec match, model token overlap, price ratio analysis). Up to 5 scored alternatives are returned, classified as *Same Variant*, *Comparable Product*, *Lower-Cost Alternative*, or *Similar Product*, each with an explanation of why it was surfaced.

No extra SerpApi requests are made for alternatives — they are derived from candidates already present in the same search response.

### 📊 Price History
Historical price observations are collected anonymously and stored in MongoDB every time a live search returns a valid priced result. The backend deduplicates observations within a one-hour window per product/merchant/price combination.

### 🤖 ML Price Forecast
When sufficient historical observations exist (minimum 14 data points), the Python ML service fits an **Ordinary Least Squares linear regression** on chronological price data, validates it on a held-out 20% tail, and forecasts the price **7 days ahead**. Outputs:

| Field | Description |
|---|---|
| `trend` | `increasing` / `decreasing` / `stable` (based on a ±2% threshold) |
| `predicted_price_7d` | Forecasted price 7 days from the last observation |
| `confidence` | `1 − MAPE` on the validation set, clamped to [0.01, 0.99] |
| `historical_min` | Lowest price in the observation window |
| `historical_max` | Highest price in the observation window |
| `chart_data` | Date/price series for visualisation |

> **Note:** This is a statistical forecast based on observed price trends, not a guaranteed future price.

### 🔔 Target Price Tracking
Users can track any product and set a personal target price. The frontend polls the backend every **15 minutes** (staggered 2 seconds apart per item to avoid bursting the API). When the live current price from SerpApi is **≤ target price**, a browser Web Notification fires. If notifications are not permitted, an in-app fallback alert is shown. Tracking state and targets are persisted in `localStorage`.

### 🎙️ Voice Search
Search by voice using the browser-native **Web Speech API** (`SpeechRecognition` / `webkitSpeechRecognition`). No external speech service is used.

### 📱 Progressive Web App (PWA)
Configured via `vite-plugin-pwa` with `autoUpdate` mode, a custom Web App Manifest (`standalone` display, dark theme), and a Workbox service worker that caches the app shell but never caches API responses.

### 🌙 Dark-First UI
Built with React 19, Tailwind CSS v4, and Recharts. The interface uses a dark-first design system with a consistent colour token set, smooth transitions, and Lucide icons.

---

## 🔌 How SerpApi Powers BeforeBuy

SerpApi is the **live data backbone** of BeforeBuy. It is not a peripheral integration — without it, there are no prices, no comparisons, no alternatives, and no tracking checks.

### Data Flow

```
User Search Query
      ↓
BeforeBuy Frontend (React)
      ↓
BeforeBuy Backend (Express) — SERPAPI_KEY stays server-side
      ↓
SerpApi Google Shopping API
  engine: google_shopping
  gl: in  (India locale)
  google_domain: google.co.in
      ↓
Normalised Shopping Results
      ↓
┌─────────────────────────────────────┐
│  Strict Match Filter                │
│  → Price Comparison                 │
│  → Lowest Price Detection           │
│  → Product Cards shown to user      │
│  → MongoDB observation persistence  │
└─────────────────────────────────────┘
      +
┌─────────────────────────────────────┐
│  Candidate Pool (non-strict)        │
│  → Similarity Scoring               │
│  → Alternative Ranking              │
│  → Before You Buy section           │
└─────────────────────────────────────┘
      ↓
Merchant Product Links (actual retailer pages)
```

### Fields Consumed from SerpApi

| SerpApi Field | Used For |
|---|---|
| `title` | Display, filtering, similarity scoring, identity canonicalisation |
| `product_id` | Deduplication key, track-by-ID matching |
| `source` | Merchant name, display, tracking exact-merchant match |
| `source_icon` | Merchant logo display |
| `price` | Formatted price string display |
| `extracted_price` | Numeric comparison, lowest-price detection, tracking alert |
| `old_price` | Crossed-out original price display |
| `extracted_old_price` | Numeric old price |
| `rating` | Product card display, alternative ranking bonus |
| `reviews` | Review count display |
| `delivery` | Delivery info display |
| `thumbnail` | Product image |
| `link` / `product_link` | "View Deal" / "Buy Now" destination |
| `snippet` | Product description |

### Security

- `SERPAPI_KEY` is stored in `backend/.env` and only referenced server-side.
- The frontend never calls SerpApi directly.
- The frontend never receives or logs the API key.

### Where SerpApi Is Used

| Feature | SerpApi Call |
|---|---|
| Product search | `GET /api/search` → `serpapi.com/search.json` (google_shopping) |
| Alternatives | **No additional call** — derived from the same search response |
| Live price tracking check | `GET /api/track/check` → `serpapi.com/search.json` (google_shopping, per tracked item) |

> SerpApi does **not** provide the ML model, the historical dataset, or the price forecast. Those are produced by a separate Python service.

---

## 🧠 Data & Intelligence Architecture

| Layer | Source |
|---|---|
| **Live current prices** | SerpApi Google Shopping (real time) |
| **Multi-merchant comparison** | SerpApi Google Shopping (same response) |
| **Alternative discovery** | Deterministic scoring on SerpApi candidates |
| **Historical price observations** | MongoDB — anonymously collected per live search |
| **Demo historical dataset** | Synthetic CSV (see disclosure below) |
| **Price forecast** | Python OLS linear regression (ML service, port 5001) |
| **Decision interpretation** | Deterministic application logic (trend threshold ±2%) |
| **Tracking state** | Browser `localStorage` |

---

## ⚠️ Demo Data Disclosure

For the hackathon demonstration, this repository includes a **synthetic** historical price dataset for:

**Samsung Galaxy S25 Ultra 5G — 12GB RAM / 256GB Storage**

**File:** `ml-service/data/demo/samsung_galaxy_s25_ultra_12gb_256gb.csv`

The synthetic dataset is used **only** when the MongoDB collection contains fewer than 14 real observations for this exact product variant. When that threshold is not met and the product matches the authorised identity, the backend sets `useDemo: true` in its request to the ML service, which then loads the CSV directly.

### The demo dataset IS used for:
- Historical price chart visualisation
- ML training and 7-day price forecast
- Demonstrating the full analysis pipeline end-to-end

### The demo dataset is NOT used for:
- Live current price display
- Multi-merchant price comparison
- "Buy Now" / "View Deal" links
- Target-price alert evaluation

The live current price shown to the user always comes from a real SerpApi Google Shopping response, regardless of whether demo history is active.

---

## 🔐 Product Identity & Variant Safety

The backend enforces a strict identity gate before allowing the synthetic demo dataset to be used. The function `isAuthorizedDemoProduct` in `backend/src/utils/identity.js` requires **all four** of the following conditions to be true simultaneously:

| Field | Required Value |
|---|---|
| Brand | Samsung |
| Model | Galaxy S25 Ultra |
| RAM | 12GB |
| Storage | 256GB |

If any condition is false, the backend returns `INSUFFICIENT_HISTORY` rather than serving demo data. This means the synthetic dataset cannot be accidentally applied to:

- Samsung Galaxy S25 Ultra 512GB variants
- Samsung Galaxy S25 Ultra 8GB variants
- Samsung Galaxy S25+ or S25 base models
- Any other generation or brand

Product identity is extracted from raw product titles using a canonical parser (`getCanonicalIdentity`) that resolves brand, generation, model suffix (Ultra / Plus), RAM, and storage from free-text strings.

---

## 🤖 Machine Learning

The ML service is a standalone **Python / Flask** application running on port 5001.

**Stack:**
- Python (standard library only for the regression — no scikit-learn dependency)
- `flask`, `flask-cors`
- OLS linear regression implemented from scratch using closed-form normal equations

**Pipeline:**

1. Load observations (MongoDB data passed in by the backend, or demo CSV if `useDemo: true`)
2. Parse and sort chronologically by date
3. **Time-aware train/validation split:** 80% train (oldest), 20% validation (most recent)
4. Fit OLS on training set: slope (`m`) and intercept (`b`) via normal equations
5. Evaluate on validation set: compute **MAPE** (Mean Absolute Percentage Error)
6. Derive confidence: `confidence = clamp(1 − MAPE, 0.01, 0.99)`
7. Refit OLS on full dataset for final prediction
8. Forecast price at `last_date + 7 days`
9. Classify trend: `decreasing` if forecast < current × 0.98, `increasing` if forecast > current × 1.02, otherwise `stable`

**Forecast horizon:** 7 days from the last observed data point

**Minimum data requirement:** 14 clean observations

**API endpoint:** `POST /api/predict`

```json
{
  "productId": "string",
  "useDemo": false,
  "observations": [{ "timestamp": "...", "extractedPrice": 0 }]
}
```

**Response:**

```json
{
  "predicted_price_7d": 109999.50,
  "trend": "decreasing",
  "confidence": 0.87,
  "historical_min": 107999.00,
  "historical_max": 114999.00,
  "data_points": 42,
  "chart_data": [{ "date": "2026-08-01", "price": 112499.00 }]
}
```

---

## 🗂️ Project Structure

```
BeforeBuy/
├── backend/                        # Node.js / Express API server (port 5000)
│   ├── src/
│   │   ├── config/db.js            # MongoDB connection
│   │   ├── models/
│   │   │   ├── PriceObservation.js # Price history schema
│   │   │   ├── Product.js
│   │   │   └── TrackedProduct.js
│   │   ├── routes/
│   │   │   ├── search.js           # SerpApi search + normalization + alternatives
│   │   │   ├── analyze.js          # History fetch + ML service proxy
│   │   │   └── track.js            # Live price-check via SerpApi for tracking
│   │   ├── services/
│   │   │   ├── productNormalizationService.js  # Title to brand/category/storage/RAM
│   │   │   ├── productSimilarityService.js     # Deterministic similarity scoring
│   │   │   └── alternativeRankingService.js    # Alternative ranking + classification
│   │   ├── utils/
│   │   │   └── identity.js         # Canonical identity extraction + demo gate
│   │   └── server.js
│   └── .env.example
│
├── frontend/                       # React 19 + Vite + Tailwind CSS v4 (port 5173)
│   └── src/
│       ├── components/             # SearchBar, ProductCard, AlternativeCard, etc.
│       ├── context/
│       │   └── TrackingContext.jsx # Polling, notification, localStorage
│       ├── pages/                  # LandingPage, SearchPage, TrackedPage
│       └── utils/
│           ├── decisionEngine.js   # Buy/wait interpretation logic
│           └── trackingStorage.js  # localStorage helpers
│
└── ml-service/                     # Python / Flask ML service (port 5001)
    ├── app.py                      # OLS regression + forecast endpoint
    ├── requirements.txt
    └── data/demo/
        └── samsung_galaxy_s25_ultra_12gb_256gb.csv
```

---

## ⚙️ Running Locally

### Prerequisites
- Node.js >= 18
- Python >= 3.9
- MongoDB (local or Atlas connection string)
- A [SerpApi](https://serpapi.com) API key

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env and set SERPAPI_KEY and MONGODB_URI
npm install
npm run dev
```

Runs on `http://localhost:5000`.

### 2. ML Service

```bash
cd ml-service
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux
pip install flask flask-cors
python app.py
```

Runs on `http://localhost:5001`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`. API calls are proxied to port 5000 via Vite's dev server proxy.

### Environment Variables

Create `backend/.env`:

```
SERPAPI_KEY=your_serpapi_key_here
MONGODB_URI=mongodb://localhost:27017/beforebuy
PORT=5000
```

> Never commit `.env`. It is in `.gitignore`. The file `backend/.env.example` shows the required keys without values.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Live shopping data | SerpApi Google Shopping |
| Backend API | Node.js, Express 5, Mongoose |
| Database | MongoDB |
| ML Service | Python, Flask, flask-cors |
| ML Algorithm | OLS Linear Regression (pure Python, closed-form) |
| Frontend framework | React 19, React Router 7 |
| Frontend build | Vite 8 |
| Frontend styling | Tailwind CSS v4 |
| Charts | Recharts |
| Icons | Lucide React |
| PWA | vite-plugin-pwa + Workbox |
| Voice Search | Web Speech API (browser-native) |
| Notifications | Web Notifications API (browser-native) |

---

## 📄 License

MIT
