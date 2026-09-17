import { evaluateSimilarity } from './productSimilarityService.js';

/**
 * Generates the ranked alternatives based on the candidate pool and main context.
 */
export const rankAlternatives = (mainProduct, candidates) => {
    if (!mainProduct || !candidates || candidates.length === 0) return [];

    const alternatives = [];
    const seenTitles = new Set(); // To prevent exact duplicates from multiple merchants if we want. Let's group by title/source minimally.

    for (const candidate of candidates) {
        // Basic deduplication: if title and source are identical, skip.
        // If same title but different source, we can allow it as an alternative merchant.
        const dedupeKey = `${candidate.title}-${candidate.source}`.toLowerCase();
        if (seenTitles.has(dedupeKey)) continue;
        
        // Skip identical products with identical prices (likely the exact same listing from a different sub-page)
        if (candidate.title === mainProduct.title && candidate.extractedPrice === mainProduct.extractedPrice) continue;

        const { score, features } = evaluateSimilarity(
            mainProduct.title, 
            candidate.title, 
            mainProduct.extractedPrice, 
            candidate.extractedPrice
        );

        // Minimum score threshold to be considered an alternative
        if (score < 30) continue;
        
        // Generate classification and explanation
        let classification = 'Similar Product';
        const reasons = [];

        if (features.sameVariant) {
            classification = 'Same Variant';
            reasons.push('Same model and specifications');
        } else if (features.sameBrand && features.sameCategory) {
            classification = 'Comparable Product';
            reasons.push('Comparable category');
            if (features.sameStorage) reasons.push('same storage');
        } else if (features.sameCategory) {
            classification = 'Alternative Option';
            reasons.push('Similar category');
        }

        if (features.lowerPrice && features.priceDiff > 0) {
            if (!features.sameVariant) {
                classification = 'Lower-Cost Alternative';
            }
            reasons.push(`lower current price by ₹${features.priceDiff.toLocaleString('en-IN')}`);
        }

        if (candidate.rating && mainProduct.rating && candidate.rating > mainProduct.rating) {
             reasons.push('higher listed rating');
        }

        // Format the explanation string nicely
        let explanation = reasons.length > 0 ? reasons.join('; ') : 'Similar specification';
        explanation = explanation.charAt(0).toUpperCase() + explanation.slice(1);

        seenTitles.add(dedupeKey);
        
        alternatives.push({
            ...candidate,
            similarityScore: score,
            classification,
            explanation,
            priceDifference: features.priceDiff // negative means candidate is more expensive
        });
    }

    // Sort by score (desc), then by price (asc)
    alternatives.sort((a, b) => {
        if (b.similarityScore !== a.similarityScore) {
            return b.similarityScore - a.similarityScore;
        }
        return (a.extractedPrice || 0) - (b.extractedPrice || 0);
    });

    // Cap the number of alternatives to keep UI clean
    return alternatives.slice(0, 5);
};
