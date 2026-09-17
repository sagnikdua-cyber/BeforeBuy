import React, { useState } from 'react';
import PageContainer from '../layouts/PageContainer';
import Header from '../components/Header';
import { useTracking } from '../context/TrackingContext';
import { Bell, BellOff, Trash2, Edit2, ExternalLink, RefreshCw } from 'lucide-react';

export default function TrackedPage() {
  const { 
    trackedItems, 
    removeTrackedItem, 
    updateTargetPrice,
    requestNotificationPermission,
    notificationPermission,
    forceCheckNow
  } = useTracking();
  
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const handleEditClick = (item) => {
    setEditingId(item.trackingId);
    setEditPrice(item.targetPrice);
  };

  const handleSaveEdit = (trackingId) => {
    const parsed = parseFloat(editPrice);
    if (!isNaN(parsed) && parsed > 0) {
      updateTargetPrice(trackingId, parsed);
    }
    setEditingId(null);
  };

  const formatPrice = (p) => {
    if (typeof p === 'number') {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);
    }
    return p || 'N/A';
  };

  const handleForceCheck = async () => {
    setIsChecking(true);
    await forceCheckNow();
    setTimeout(() => setIsChecking(false), 1000);
  };

  return (
    <PageContainer>
      <Header />
      
      <main className="flex-grow flex flex-col items-center mt-6 space-y-8 w-full pb-12 max-w-5xl mx-auto px-4">
        
        <div className="w-full flex justify-between items-end border-b border-gray-800 pb-4">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <Bell className="text-teal-400" />
              Tracked Products
            </h2>
            <p className="text-gray-400 mt-2">
              Monitor live prices anonymously. We'll alert you when your target is reached.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {notificationPermission !== 'granted' && (
              <button 
                onClick={requestNotificationPermission}
                className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 py-1.5 px-3 rounded flex items-center gap-2 transition-colors border border-gray-700"
              >
                <BellOff size={14} /> Enable Notifications
              </button>
            )}
            
            <button 
              onClick={handleForceCheck}
              disabled={isChecking || trackedItems.length === 0}
              className={`text-sm bg-teal-600/20 hover:bg-teal-600/30 text-teal-400 py-2 px-4 rounded-lg flex items-center gap-2 transition-colors border border-teal-500/30 ${isChecking ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <RefreshCw size={16} className={isChecking ? 'animate-spin' : ''} />
              Check Prices Now
            </button>
          </div>
        </div>

        {trackedItems.length === 0 ? (
          <div className="mt-12 w-full text-center py-16 opacity-80 border-dashed border-gray-800 border-2 bg-gray-900/50 p-6 rounded-2xl">
            <Bell className="mx-auto mb-4 text-gray-600" size={48} />
            <h3 className="text-xl font-semibold mb-2 text-white">No products being tracked</h3>
            <p className="text-gray-400">
              Search for a product and click "Track Product" to monitor its price drops.
            </p>
          </div>
        ) : (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trackedItems.map((item) => (
              <div key={item.trackingId} className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden flex flex-col relative group hover:border-teal-500/50 transition-colors">
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3 z-10">
                  {item.alertTriggered ? (
                    <span className="bg-green-500/20 text-green-400 border border-green-500/50 px-2.5 py-1 rounded-full text-xs font-semibold shadow-lg backdrop-blur-md animate-pulse">
                      Target Reached!
                    </span>
                  ) : (
                    <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-md">
                      Monitoring
                    </span>
                  )}
                </div>

                {/* Header/Image */}
                <div className="h-40 bg-gray-900 p-4 flex items-center justify-center relative">
                   {item.thumbnail ? (
                     <img src={item.thumbnail} alt={item.title} className="max-h-full object-contain" />
                   ) : (
                     <div className="text-gray-600">No Image</div>
                   )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <h4 className="text-white font-medium line-clamp-2 mb-1" title={item.title}>
                    {item.title}
                  </h4>
                  <div className="text-sm text-gray-400 mb-4">{item.merchant}</div>

                  <div className="space-y-3 mb-6 bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Current Price:</span>
                      <span className={`font-semibold ${item.alertTriggered ? 'text-green-400' : 'text-white'}`}>
                        {formatPrice(item.lastKnownPrice)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Target Price:</span>
                      {editingId === item.trackingId ? (
                        <div className="flex items-center gap-2">
                           <input 
                              type="number" 
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="w-24 bg-gray-950 border border-gray-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-teal-500"
                              autoFocus
                           />
                           <button onClick={() => handleSaveEdit(item.trackingId)} className="text-teal-400 text-xs font-medium hover:text-teal-300">Save</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-teal-400">{formatPrice(item.targetPrice)}</span>
                          <button onClick={() => handleEditClick(item)} className="text-gray-500 hover:text-white transition-colors" title="Edit Target Price">
                            <Edit2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-700">
                    <button 
                      onClick={() => removeTrackedItem(item.trackingId)}
                      className="text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1 text-sm"
                    >
                      <Trash2 size={16} /> Remove
                    </button>
                    
                    {item.productLink ? (
                        <a 
                            href={item.productLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1"
                        >
                            View Deal <ExternalLink size={14} />
                        </a>
                    ) : (
                        <span className="text-gray-600 text-sm">No link available</span>
                    )}
                  </div>
                  
                  {item.lastCheckedAt && (
                      <div className="text-[10px] text-gray-500 mt-3 text-center">
                          Last checked: {new Date(item.lastCheckedAt).toLocaleTimeString()}
                      </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </PageContainer>
  );
}
