import { normalizeProduct } from './productNormalizationService.js';

/**
 * Deterministic utility to compare a candidate product against the main context product.
 */
export const evaluateSimilarity = (mainTitle, candidateTitle, mainPrice, candidatePrice) => {
    const main = normalizeProduct(mainTitle);
    const candidate = normalizeProduct(candidateTitle);

    let score = 0;
    const features = {
        sameBrand: false,
        sameCategory: false,
        sameStorage: false,
        sameRam: false,
        sameVariant: false,
        lowerPrice: false,
        priceDiff: 0,
        comparablePrice: false
    };

    if (!candidate) return { score, features, candidateNorm: null };

    // 1. Brand match
    if (main.brand && candidate.brand && main.brand === candidate.brand) {
        features.sameBrand = true;
        score += 20;
    }

    // 2. Category match
    if (main.category && candidate.category && main.category === candidate.category) {
        features.sameCategory = true;
        score += 30;
    } else if (!main.category || !candidate.category) {
        // If we can't determine category, but model text overlaps heavily, grant some points
        score += 10;
    }

    // 3. Spec Match
    if (main.storage && candidate.storage) {
        if (main.storage === candidate.storage) {
            features.sameStorage = true;
            score += 15;
        } else {
            // Explicitly DIFFERENT storage. Strongly penalize exact-variant possibility.
            score -= 10;
        }
    }
    
    if (main.ram && candidate.ram) {
        if (main.ram === candidate.ram) {
            features.sameRam = true;
            score += 15;
        } else {
            score -= 10;
        }
    }

    // 4. Model family match (Token overlap)
    const mainTokens = main.modelText.split(' ').filter(t => t.length > 2);
    const candidateTokens = candidate.modelText.split(' ').filter(t => t.length > 2);
    
    let overlapCount = 0;
    for (const t of mainTokens) {
        if (candidateTokens.includes(t)) overlapCount++;
    }
    
    if (mainTokens.length > 0) {
        const overlapRatio = overlapCount / mainTokens.length;
        score += Math.round(overlapRatio * 20);
    }

    // Exact variant determination
    if (features.sameBrand && features.sameStorage && features.sameRam && overlapCount >= mainTokens.length - 1) {
        features.sameVariant = true;
    }

    // 5. Price analysis
    if (mainPrice && candidatePrice) {
        const diff = mainPrice - candidatePrice;
        features.priceDiff = diff;
        
        if (diff > 0) {
            features.lowerPrice = true;
            // Reward for being cheaper, but not suspiciously cheap (e.g. 80% cheaper usually means wrong product/accessory)
            const ratio = candidatePrice / mainPrice;
            if (ratio > 0.4) {
                features.comparablePrice = true;
                score += 10;
            } else {
                // Suspiciously cheap (likely an accessory that slipped through)
                score -= 50; 
            }
        } else {
            // More expensive
            const ratio = candidatePrice / mainPrice;
            if (ratio < 1.5) {
                features.comparablePrice = true;
            }
        }
    }

    return {
        score,
        features,
        mainNorm: main,
        candidateNorm: candidate
    };
};
