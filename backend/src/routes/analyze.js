import express from 'express';
import axios from 'axios';
import PriceObservation from '../models/PriceObservation.js';
import { getCanonicalIdentity, isAuthorizedDemoProduct } from '../utils/identity.js';

const router = express.Router();

// The specific slug for our permitted demo dataset
const DEMO_PRODUCT_KEY = 'samsung-galaxy-s25-ultra-5g-12gb-256gb';

router.get('/', async (req, res) => {
  try {
    const { productKey, title } = req.query;
    
    if (!productKey || typeof productKey !== 'string') {
      return res.status(400).json({ error: 'productKey is required' });
    }

    // 1. Fetch real historical observations from MongoDB
    let observations = [];
    let dataSource = 'REAL_MONGODB';
    
    try {
       // Sort chronologically (oldest to newest for ML)
       observations = await PriceObservation.find({ productKey })
           .sort({ timestamp: 1 })
           .select('extractedPrice timestamp merchant -_id')
           .lean();
    } catch (dbError) {
       console.error('MongoDB error during analysis:', dbError.message);
       // We don't crash, we just have 0 observations, triggering the fallback logic
    }

    // 2. Decide if we can use real data or fallback to DEMO
    let useDemo = false;
    if (observations.length < 14) {
        const identity = getCanonicalIdentity(title || productKey);
        if (isAuthorizedDemoProduct(identity)) {
            useDemo = true;
            dataSource = 'DEMO';
            observations = []; // The ML service will load its own CSV
        } else {
            return res.status(404).json({
                error: 'Historical analysis is not available yet for this product.',
                code: 'INSUFFICIENT_HISTORY'
            });
        }
    }

    // 3. Call ML Service
    try {
        const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';
        const mlResponse = await axios.post(`${ML_URL}/api/predict`, {
            productId: productKey,
            useDemo: useDemo,
            observations: observations
        }, { timeout: 10000 });
        
        // 4. Return combined result to frontend
        return res.json({
            productKey,
            dataSource,
            history: observations, // Either real observations or empty if demo (frontend will fetch/mock demo chart if empty or rely on ML output for chart if we want. Actually let's just let the frontend know it's DEMO)
            analysis: mlResponse.data
        });
        
    } catch (mlError) {
        console.error('ML Service Error:', mlError.message);
        return res.status(500).json({ error: 'ML analysis service is temporarily unavailable.' });
    }

  } catch (error) {
    console.error('Analyze Route Error:', error.message);
    res.status(500).json({ error: 'Analysis failed due to an internal error.' });
  }
});

export default router;
