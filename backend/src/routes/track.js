import express from 'express';
import axios from 'axios';

const router = express.Router();

// GET /api/track/check?title=...&merchant=...&productId=...
router.get('/check', async (req, res) => {
  try {
    const { title, merchant, productId } = req.query;
    
    if (!title) {
        return res.status(400).json({ error: 'title is required to check price.' });
    }

    // Prepare SerpApi request
    // We search the exact title to try and locate the exact merchant listing again
    const params = {
      engine: 'google_shopping',
      q: title,
      hl: 'en',
      gl: 'in',
      google_domain: 'google.co.in',
      api_key: process.env.SERPAPI_KEY
    };

    const response = await axios.get('https://serpapi.com/search.json', { 
      params,
      timeout: 10000 
    });

    const shoppingResults = response.data.shopping_results || [];

    if (shoppingResults.length === 0) {
        return res.status(404).json({ error: 'Product not found currently.' });
    }

    // Try to find the exact merchant match
    let exactMatch = null;
    if (merchant) {
        exactMatch = shoppingResults.find(item => 
            item.source && item.source.toLowerCase() === merchant.toLowerCase() &&
            typeof item.extracted_price === 'number'
        );
    }
    
    // If we have a product ID, we can also try matching that if merchant fails
    if (!exactMatch && productId) {
        exactMatch = shoppingResults.find(item => 
            item.product_id === productId &&
            typeof item.extracted_price === 'number'
        );
    }

        // If still no exact match, fallback to the lowest price among the exact title matches
    if (!exactMatch) {
        const rawNegativeKeywords = ['case', 'cover', 'protector', 'tempered glass', 'charger', 'cable', 'adapter', 'skin', 'bumper'];
        const titleLowerMain = title.toLowerCase();
        const activeNegativeKeywords = rawNegativeKeywords.filter(
            nk => !titleLowerMain.includes(nk)
        );

        const queryTokens = titleLowerMain.replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(t => t.length > 0);

        const validCandidates = shoppingResults.filter(item => {
            if (!item.title || typeof item.extracted_price !== 'number') return false;
            
            const itemTitleLower = item.title.toLowerCase();
            const sourceLower = item.source ? item.source.toLowerCase() : '';
            
            for (const nk of activeNegativeKeywords) {
                if (itemTitleLower.includes(nk) || sourceLower.includes(nk)) return false;
            }

            const titleNormalized = itemTitleLower.replace(/[^a-z0-9\s]/g, '');
            const titleNoSpaces = titleNormalized.replace(/\s+/g, '');
            
            for (const token of queryTokens) {
                if (!titleNormalized.includes(token) && !titleNoSpaces.includes(token)) {
                    return false;
                }
            }

            return true;
        });

        if (validCandidates.length > 0) {
            exactMatch = validCandidates.reduce((prev, curr) => {
                return (prev.extracted_price < curr.extracted_price) ? prev : curr;
            });
        }
    }

    if (exactMatch) {
        return res.json({
            currentPrice: exactMatch.extracted_price,
            merchant: exactMatch.source || merchant,
            productLink: exactMatch.link || exactMatch.product_link,
            timestamp: new Date().toISOString()
        });
    } else {
        return res.status(404).json({ error: 'Could not resolve a valid current price for this product.' });
    }

  } catch (error) {
    console.error('Track Check API Error:', error.message);
    res.status(500).json({ error: 'Failed to check current price.' });
  }
});

export default router;
