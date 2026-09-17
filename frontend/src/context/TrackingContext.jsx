import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { getTrackedProducts, trackProduct, untrackProduct, updateTrackedProductStatus } from '../utils/trackingStorage';

const TrackingContext = createContext();

export const useTracking = () => useContext(TrackingContext);

export const TrackingProvider = ({ children }) => {
  const [trackedItems, setTrackedItems] = useState([]);
  const [notificationPermission, setNotificationPermission] = useState('default');
  
  // Polling interval: 15 minutes in milliseconds
  const POLLING_INTERVAL = 15 * 60 * 1000;

  useEffect(() => {
    // Initial load
    setTrackedItems(getTrackedProducts());
    
    // Check notification permission if available
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return 'unsupported';
    
    if (Notification.permission === 'granted') {
        setNotificationPermission('granted');
        return 'granted';
    }
    
    try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        return permission;
    } catch (error) {
        console.error("Failed to request notification permission:", error);
        return 'error';
    }
  };

  const notifyUser = (item, currentPrice) => {
    const formattedPrice = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(currentPrice);
    
    const title = '🎯 Target Price Reached!';
    const options = {
        body: `${item.title}\nNow: ${formattedPrice} (Target: ₹${item.targetPrice})\nClick to view deal.`,
        icon: item.thumbnail || '/favicon.ico',
        tag: `price-alert-${item.trackingId}`,
        requireInteraction: true
    };

    if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(title, options);
        notification.onclick = () => {
            window.open(item.productLink, '_blank');
            notification.close();
        };
    } else {
        // Fallback: In-app alert (using native alert for MVP, or could be a custom toast)
        // Since alerts block JS thread, setTimeout is safer
        setTimeout(() => {
             alert(`${title}\n\n${options.body}`);
        }, 100);
    }
  };

  const checkPrices = useCallback(async () => {
    const currentItems = getTrackedProducts();
    if (currentItems.length === 0) return;

    // Stagger API calls to avoid bursting SerpApi (Wait 2s between each call)
    for (let i = 0; i < currentItems.length; i++) {
        const item = currentItems[i];
        
        // Skip if alert was already triggered for this target
        if (item.alertTriggered) continue;

        try {
            const queryParams = new URLSearchParams({
                title: item.title,
                merchant: item.merchant
            });
            if (item.productId) queryParams.append('productId', item.productId);

            const response = await fetch(`/api/track/check?${queryParams.toString()}`);
            if (response.ok) {
                const data = await response.json();
                const currentPrice = data.currentPrice;
                
                let updates = {
                    lastCheckedAt: new Date().toISOString(),
                    lastKnownPrice: currentPrice
                };

                // Check alert condition exactly
                if (currentPrice <= item.targetPrice) {
                    updates.alertTriggered = true;
                    notifyUser(item, currentPrice);
                }

                updateTrackedProductStatus(item.trackingId, updates);
            }
        } catch (error) {
            console.error(`Failed to check price for ${item.trackingId}:`, error);
        }

        // Wait 2 seconds before the next check
        if (i < currentItems.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    
    // Refresh React state
    setTrackedItems(getTrackedProducts());
  }, []);

  // Polling Effect
  useEffect(() => {
    const timer = setInterval(() => {
        checkPrices();
    }, POLLING_INTERVAL);
    
    return () => clearInterval(timer);
  }, [checkPrices, POLLING_INTERVAL]);

  // Context API methods
  const addTrackedItem = (product, targetPrice) => {
    trackProduct(product, targetPrice);
    setTrackedItems(getTrackedProducts());
    
    // If adding a new item, and we don't have permission, maybe silently attempt or wait for user
    if (notificationPermission === 'default') {
        requestNotificationPermission();
    }
  };

  const removeTrackedItem = (trackingId) => {
    untrackProduct(trackingId);
    setTrackedItems(getTrackedProducts());
  };

  const updateTargetPrice = (trackingId, newTargetPrice) => {
    const item = trackedItems.find(p => p.trackingId === trackingId);
    if (item) {
        // Reset alert triggered if price is updated
        updateTrackedProductStatus(trackingId, { 
            targetPrice: Number(newTargetPrice),
            alertTriggered: false 
        });
        setTrackedItems(getTrackedProducts());
    }
  };

  return (
    <TrackingContext.Provider value={{
      trackedItems,
      addTrackedItem,
      removeTrackedItem,
      updateTargetPrice,
      requestNotificationPermission,
      notificationPermission,
      forceCheckNow: checkPrices
    }}>
      {children}
    </TrackingContext.Provider>
  );
};
