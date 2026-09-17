/**
 * Deterministic utility to extract standard product specifications from messy titles.
 */

const CATEGORIES = {
    smartphone: ['smartphone', 'phone', 'mobile', 'iphone', 'galaxy s', 'pixel', 'oneplus'],
    laptop: ['laptop', 'macbook', 'notebook', 'chromebook', 'thinkpad', 'ideapad'],
    tablet: ['tablet', 'ipad', 'galaxy tab'],
    headphone: ['headphone', 'earphone', 'earbud', 'airpod', 'galaxy bud', 'headset'],
    smartwatch: ['smartwatch', 'apple watch', 'galaxy watch', 'band', 'fitness tracker'],
    monitor: ['monitor', 'display'],
    television: ['television', 'tv', 'smart tv'],
    camera: ['camera', 'dslr', 'mirrorless']
};

const BRANDS = [
    'samsung', 'apple', 'google', 'sony', 'oneplus', 'xiaomi', 'motorola', 'lenovo',
    'hp', 'dell', 'asus', 'acer', 'lg', 'bose', 'sennheiser', 'jabra', 'garmin'
];

export const normalizeProduct = (title) => {
    if (!title) return null;
    
    const t = title.toLowerCase();
    
    // 1. Brand Detection
    let brand = null;
    for (const b of BRANDS) {
        if (t.includes(b)) {
            brand = b;
            break;
        }
    }

    // 2. Category Detection
    let category = null;
    for (const [cat, keywords] of Object.entries(CATEGORIES)) {
        if (keywords.some(kw => t.includes(kw))) {
            category = cat;
            break;
        }
    }

    // 3. Storage Detection (e.g. 128gb, 256 gb, 1tb)
    let storage = null;
    const storageMatch = t.match(/\b(\d+)\s*(gb|tb)\b/);
    // Be careful, sometimes RAM is listed before storage (e.g., 12gb ram 256gb storage)
    // A better approach is to look for both and guess based on typical values.
    // RAM is usually <= 64gb. Storage is usually >= 64gb or expressed in tb.
    
    let ram = null;
    const allGbMatches = [...t.matchAll(/\b(\d+)\s*(gb|tb)\b/g)];
    
    for (const match of allGbMatches) {
        const val = parseInt(match[1]);
        const unit = match[2];
        
        if (unit === 'tb') {
            storage = `${val}tb`;
        } else if (unit === 'gb') {
            if (val <= 64 && !t.includes(`${val}gb storage`) && !t.includes(`${val} gb rom`)) {
                // Highly likely to be RAM if <= 64, unless explicitly marked as storage/rom.
                // However, older phones have 32GB/64GB storage.
                // Let's use contextual keywords if available.
                const surroundingText = t.substring(Math.max(0, match.index - 10), Math.min(t.length, match.index + 20));
                if (surroundingText.includes('ram') || surroundingText.includes('memory')) {
                    ram = `${val}gb`;
                } else if (surroundingText.includes('rom') || surroundingText.includes('storage')) {
                    storage = `${val}gb`;
                } else {
                    // Fallback heuristic
                    if (val <= 32) {
                        ram = `${val}gb`;
                    } else if (val > 64) {
                        storage = `${val}gb`;
                    } else if (val === 64) {
                         // 64 could be either. If we already found a higher one (e.g. 256), then 64 might be RAM (rare) or just an error.
                         // But typical modern standard: assume storage if no other storage found.
                         if (!storage) storage = `64gb`;
                    }
                }
            } else {
                storage = `${val}gb`;
            }
        }
    }

    // Catch specific format like "12/256" or "12+256" or "12GB/256GB"
    const slashMatch = t.match(/\b(\d{1,2})\s*[\/\+]\s*(\d{2,4})\b/);
    if (slashMatch) {
        ram = `${slashMatch[1]}gb`;
        storage = `${slashMatch[2]}gb`;
    }

    // 4. Model extraction (heuristic: everything before the specs and after the brand)
    let model = t;
    if (brand) {
        model = model.replace(brand, '').trim();
    }
    // Strip common spec strings from the model string
    model = model.replace(/\b\d+\s*(gb|tb|ram|rom)\b/g, '')
                 .replace(/\b\d{1,2}\s*[\/\+]\s*\d{2,4}\b/g, '')
                 .replace(/5g|4g|lte/g, '')
                 .replace(/[^a-z0-9\s]/g, ' ')
                 .replace(/\s+/g, ' ')
                 .trim();

    return {
        brand,
        category,
        storage,
        ram,
        modelText: model
    };
};
