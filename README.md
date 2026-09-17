# BeforeBuy

BeforeBuy is a consumer price-intelligence application that helps users find the lowest live prices across merchants, analyze historical pricing trends, forecast future prices using Machine Learning, compare similar products, and track target prices anonymously.

## Features
- **Live Search**: Pulls live Google Shopping data using SerpApi.
- **Price Analysis**: View historical trends and ML-based predictions.
- **Before You Buy**: Discovers similar variants or lower-cost alternatives deterministically.
- **Track Product**: Set target price alerts anonymously via PWA/browser notifications.
- **Voice Search**: Built-in native browser voice search capabilities.
- **PWA Ready**: Installable app shell with robust offline-handling.

## Architecture
- **Frontend**: React (Vite), TailwindCSS, Recharts. Fully PWA configured.
- **Backend**: Node.js, Express.
- **Database**: MongoDB (For anonymous historical observations).
- **ML Engine**: Python, scikit-learn (OLS Regression logic for price trend and forecasting).

## Setup Instructions

1. Install dependencies:
   ```bash
   cd frontend
   npm install

   cd ../backend
   npm install
   ```

2. Environment configuration:
   Duplicate `backend/.env.example` into `backend/.env` and add your valid keys:
   ```bash
   # backend/.env
   PORT=5000
   SERPAPI_KEY=your_actual_key
   MONGODB_URI=your_actual_mongodb_uri
   ```
   *(Note: The `SERPAPI_KEY` and `MONGODB_URI` remain exclusively backend configurations. The frontend has absolutely no `.env` files.)*

3. Start Development:
   ```bash
   # Run the backend (Terminal 1)
   cd backend
   npm run dev

   # Run the frontend (Terminal 2)
   cd frontend
   npm run dev
   ```

## Production Build
To create a production build of the PWA frontend:
```bash
cd frontend
npm run build
```

The resulting `/dist` folder can be served by any static host. Note that the frontend still fundamentally requires the Node.js backend to execute API requests, access SerpApi, and perform MongoDB insertions securely.
