/**
 * Extracts canonical product identity from a raw product title string.
 */
export function getCanonicalIdentity(title) {
    if (!title || typeof title !== 'string') return null;

    const lowerTitle = title.toLowerCase();
    
    const identity = {
        brand: null,
        model: null,
        generation: null,
        storage: null,
        ram: null,
        canonicalProductKey: null
    };

    // Brand
    if (lowerTitle.includes('samsung')) {
        identity.brand = 'Samsung';
    } else if (lowerTitle.includes('apple')) {
        identity.brand = 'Apple';
    }

    // Samsung Galaxy S-Series Model matching
    if (identity.brand === 'Samsung' && lowerTitle.includes('galaxy')) {
        const generationMatch = lowerTitle.match(/s(\d{2})/);
        if (generationMatch) {
            identity.generation = `S${generationMatch[1]}`;
            identity.model = `Galaxy S${generationMatch[1]}`;
            
            if (lowerTitle.includes('ultra')) {
                identity.model += ' Ultra';
            } else if (lowerTitle.includes('plus') || lowerTitle.includes('+')) {
                identity.model += ' Plus';
            }
        }
    }

    // Storage matching (looks for 128gb, 256gb, 512gb, 1tb with optional spaces)
    const storageMatch = lowerTitle.match(/(128|256|512)\s*gb|1\s*tb/);
    if (storageMatch) {
        identity.storage = storageMatch[0].replace(/\s/g, '').toUpperCase();
    }

    // RAM matching (looks for 8gb, 12gb, 16gb - needs to be careful not to confuse with storage)
    // usually RAM appears before storage or is explicitly called out as "12gb ram"
    const ramExplicitMatch = lowerTitle.match(/(8|12|16)\s*gb\s*ram/);
    if (ramExplicitMatch) {
        identity.ram = ramExplicitMatch[1] + 'GB';
    } else {
        // Fallback heuristic: if two GB values exist, the smaller one is usually RAM
        const gbMatches = [...lowerTitle.matchAll(/(\d+)\s*gb/g)].map(m => parseInt(m[1]));
        if (gbMatches.length >= 2) {
            const sorted = gbMatches.sort((a, b) => a - b);
            if (sorted[0] <= 16) {
                identity.ram = sorted[0] + 'GB';
            }
            if (!identity.storage && sorted[1] >= 128) {
                identity.storage = sorted[1] + 'GB';
            }
        } else if (gbMatches.length === 1) {
             if (gbMatches[0] <= 16) {
                 identity.ram = gbMatches[0] + 'GB';
             }
        }
    }

    // Build canonical key
    if (identity.brand && identity.model) {
        let key = `${identity.brand} ${identity.model}`;
        if (lowerTitle.includes('5g')) {
            key += ' 5G';
        }
        if (identity.ram) {
            key += ` ${identity.ram}`;
        }
        if (identity.storage) {
            key += ` ${identity.storage}`;
        }
        identity.canonicalProductKey = key.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    }

    return identity;
}

/**
 * Strictly verifies if the given canonical identity matches the authorized demo dataset.
 * Authorized: Samsung Galaxy S25 Ultra 5G 12GB RAM 256GB Storage.
 */
export function isAuthorizedDemoProduct(identity) {
    if (!identity) return false;

    const isSamsung = identity.brand === 'Samsung';
    const isS25Ultra = identity.model === 'Galaxy S25 Ultra';
    const is12GB = identity.ram === '12GB';
    const is256GB = identity.storage === '256GB';

    return isSamsung && isS25Ultra && is12GB && is256GB;
}
