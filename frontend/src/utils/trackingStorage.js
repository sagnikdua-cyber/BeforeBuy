const STORAGE_KEY = 'beforebuy_tracked_products';

/**
 * Safely get all tracked products from LocalStorage
 */
export const getTrackedProducts = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to parse tracked products from LocalStorage:', error);
    return []; // Graceful recovery from corruption
  }
};

/**
 * Safely save tracked products to LocalStorage
 */
export const saveTrackedProducts = (products) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (error) {
    console.error('Failed to save tracked products to LocalStorage:', error);
  }
};

/**
 * Add or update a tracked product
 */
export const trackProduct = (productData, targetPrice) => {
  const products = getTrackedProducts();
  
  // Deduplication based on title and merchant
  const trackingId = productData.productId 
      || `${productData.title}-${productData.source}`.toLowerCase().replace(/[^a-z0-9]/g, '-');
      
  const existingIndex = products.findIndex(p => p.trackingId === trackingId);
  
  const newRecord = {
    trackingId,
    productId: productData.productId || null,
    title: productData.title,
    merchant: productData.source || 'Unknown Merchant',
    productLink: productData.productLink || '',
    thumbnail: productData.thumbnail || '',
    targetPrice: Number(targetPrice),
    currency: 'INR',
    createdAt: new Date().toISOString(),
    lastCheckedAt: null,
    lastKnownPrice: productData.extractedPrice || productData.price,
    alertTriggered: false
  };

  if (existingIndex >= 0) {
    // Preserve createdAt if updating
    newRecord.createdAt = products[existingIndex].createdAt;
    products[existingIndex] = newRecord;
  } else {
    products.push(newRecord);
  }
  
  saveTrackedProducts(products);
  return newRecord;
};

/**
 * Remove a tracked product
 */
export const untrackProduct = (trackingId) => {
  const products = getTrackedProducts();
  const updated = products.filter(p => p.trackingId !== trackingId);
  saveTrackedProducts(updated);
};

/**
 * Update tracking status (e.g., after a poll)
 */
export const updateTrackedProductStatus = (trackingId, updates) => {
  const products = getTrackedProducts();
  const index = products.findIndex(p => p.trackingId === trackingId);
  
  if (index >= 0) {
    products[index] = { ...products[index], ...updates };
    saveTrackedProducts(products);
  }
};
