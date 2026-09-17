# BeforeBuy

BeforeBuy is a consumer price-intelligence application that helps users find the lowest live prices across merchants, analyze historical pricing trends, forecast future prices using Machine Learning, compare similar products, and track target prices anonymously.

## Features
- **Live Search**: Pulls live Google Shopping data.
- **Price Analysis**: View historical trends and ML-based predictions.
- **Before You Buy**: Discovers similar variants or lower-cost alternatives.
- **Track Product**: Set target price alerts anonymously via PWA/browser notifications.
- **Voice Search**: Built-in native browser voice search.

## Setup Instructions

1. Install dependencies for both frontend and backend:
   ```bash
   cd frontend
   npm install

   cd ../backend
   npm install
   ```

2. Configure environment variables. Duplicate `backend/.env.example` to `backend/.env` and add your keys:
   ```bash
   # backend/.env
   SERPAPI_KEY=your_actual_key
   MONGODB_URI=your_actual_mongodb_uri
   ```

3. Run the development environment:
   ```bash
   # Terminal 1: Backend
   cd backend
   npm run dev

   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

4. Python ML Service (Optional if testing purely frontend/search):
   The backend auto-runs the python ML script (`forecast.py`) locally when required for price analysis. Ensure Python is installed.

## Production Build
To create a production build of the PWA frontend:
```bash
cd frontend
npm run build
```
