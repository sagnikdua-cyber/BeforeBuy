import express from 'express';
import axios from 'axios';
import PriceObservation from '../models/PriceObservation.js';
import { rankAlternatives } from '../services/alternativeRankingService.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    let { q } = req.query;
    
    // 1. Validation and sanitization
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    q = q.trim();
    if (q.length === 0) {
      return res.status(400).json({ error: 'Search query cannot be empty' });
    }
    if (q.length > 100) {
      return res.status(400).json({ error: 'Search query exceeds maximum length of 100 characters' });
    }

    // 2. SerpApi Configuration for Google Shopping (India localization)
    const params = {
      engine: 'google_shopping',
      q: q,
      hl: 'en',
      gl: 'in',
      google_domain: 'google.co.in',
      api_key: process.env.SERPAPI_KEY
    };

    // 3. Perform SerpApi request safely
    const response = await axios.get('https://serpapi.com/search.json', { 
      params,
      timeout: 15000 // 15 seconds timeout
    });
    
    const shoppingResults = response.data.shopping_results || [];
    
    if (shoppingResults.length === 0) {
       return res.json({ message: 'No results found', results: [] });
    }

    // 4. Normalize the data structure
    const normalizedResults = shoppingResults.map(item => ({
      id: item.position !== undefined ? String(item.position) : null,
      productId: item.product_id || null,
      title: item.title || null,
      productLink: item.link || item.product_link || null,
      source: item.source || null,
      sourceIcon: item.source_icon || null,
      price: item.price || null,
      extractedPrice: item.extracted_price !== undefined ? item.extracted_price : null,
      oldPrice: item.old_price || null,
      extractedOldPrice: item.extracted_old_price !== undefined ? item.extracted_old_price : null,
      rating: item.rating !== undefined ? item.rating : null,
      reviews: item.reviews !== undefined ? item.reviews : null,
      thumbnail: item.thumbnail || null,
      delivery: item.delivery || null,
      snippet: item.snippet || null,
      extensions: item.extensions || null,
      isLowestPrice: false
    }));

    // 4.5 Filter out accessories and similar products (strict matching)
    const queryTokens = q.toLowerCase().replace(/[^a-z0-9\\s]/g, '').split(/\\s+/).filter(t => t.length > 0);
    const rawNegativeKeywords = ['case', 'cover', 'protector', 'tempered glass', 'charger', 'cable', 'adapter', 'skin', 'bumper', 'refurbished', 'used', 'renewed', 'pre-owned', 'strap', 'band'];
    
    const activeNegativeKeywords = rawNegativeKeywords.filter(
      nk => !q.toLowerCase().includes(nk)
    );

    const strictResults = normalizedResults.filter(item => {
      if (!item.title) return false;
      const titleLower = item.title.toLowerCase();
      const sourceLower = item.source ? item.source.toLowerCase() : '';
      
      for (const nk of activeNegativeKeywords) {
        if (titleLower.includes(nk) || sourceLower.includes(nk)) {
          return false;
        }
      }

      const titleNormalized = titleLower.replace(/[^a-z0-9\s]/g, '');
      const titleNoSpaces = titleNormalized.replace(/\s+/g, '');
      
      for (const token of queryTokens) {
        if (!titleNormalized.includes(token) && !titleNoSpaces.includes(token)) {
          return false;
        }
      }
      return true;
    });

    // Capture candidates that failed strict matching but passed the negative keywords filter
    const candidateResults = normalizedResults.filter(item => {
      if (!item.title || typeof item.extractedPrice !== 'number') return false;
      if (strictResults.includes(item)) return false; // Not a strict match

      const titleLower = item.title.toLowerCase();
      const sourceLower = item.source ? item.source.toLowerCase() : '';
      for (const nk of activeNegativeKeywords) {
        if (titleLower.includes(nk) || sourceLower.includes(nk)) {
          return false;
        }
      }
      return true;
    });

    // 5. Filter for valid results to find the lowest price
    const validPricedResults = strictResults.filter(item => typeof item.extractedPrice === 'number');
    
    let lowestPriceResult = null;
    if (validPricedResults.length > 0) {
      lowestPriceResult = validPricedResults.reduce((prev, curr) => {
        return (prev.extractedPrice < curr.extractedPrice) ? prev : curr;
      });
      
      // Mark the lowest price item natively
      const lowestPriceIndex = strictResults.findIndex(r => r === lowestPriceResult);
      if (lowestPriceIndex !== -1) {
        strictResults[lowestPriceIndex].isLowestPrice = true;
      }
    }

    // Generate ranked alternatives
    const alternatives = rankAlternatives(lowestPriceResult, candidateResults);

    res.json({
      query: q,
      results: strictResults,
      alternatives: alternatives
    });

    // 6. Asynchronously persist observations to MongoDB (fire-and-forget)
    (async () => {
      try {
        if (!validPricedResults || validPricedResults.length === 0) return;
        
        const normalizedProductName = q.toLowerCase().trim();
        
        for (const item of validPricedResults) {
          if (!item.title || !item.source) continue;
          
          const productKey = item.productId || item.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
          const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
          
          // Deduplication check
          const existing = await PriceObservation.findOne({
            productKey,
            merchant: item.source,
            extractedPrice: item.extractedPrice,
            timestamp: { $gte: oneHourAgo }
          });

          if (!existing) {
            await PriceObservation.create({
              productKey,
              productId: item.productId || null,
              normalizedProductName,
              title: item.title,
              merchant: item.source,
              source: item.source,
              productLink: item.productLink,
              price: item.price,
              extractedPrice: item.extractedPrice,
              currency: 'INR',
              observationType: 'live_search'
            });
          }
        }
      } catch (dbError) {
        console.error('MongoDB persistence error (non-fatal):', dbError.message);
      }
    })();

  } catch (error) {
    // Log the error securely on the server
    console.error('SerpApi Search Error:', error.message);
    if (error.response) {
       console.error('SerpApi Response:', error.response.data);
    }
    
    // Return a generic error to the frontend
    res.status(500).json({ 
      error: 'Live price search is temporarily unavailable.' 
    });
  }
});

export default router;
