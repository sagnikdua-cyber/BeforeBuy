/**
 * Deterministic decision engine to interpret ML metrics.
 * Does NOT return absolute purchasing commands like BUY_NOW or SELL.
 */
export const interpretAnalysis = ({ currentPrice, predictedPrice, trend, historicalMin }) => {
    if (!currentPrice || !predictedPrice) return 'Monitor';

    // Calculate percentage difference
    const diffPercent = ((predictedPrice - currentPrice) / currentPrice) * 100;

    // Favorable if the price is expected to rise significantly (buy now before it goes up)
    // Wait if the price is expected to drop significantly (buy later when it's cheaper)
    // Monitor if stable

    if (trend === 'decreasing' || diffPercent <= -2) {
        return 'Wait';
    } else if (trend === 'increasing' || diffPercent >= 2) {
        return 'Favorable';
    }

    return 'Monitor';
};
