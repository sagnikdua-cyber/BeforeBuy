import React, { useState } from 'react';
import { useTracking } from '../context/TrackingContext';
import { Bell, X, AlertCircle } from 'lucide-react';

const TrackingModal = ({ product, isOpen, onClose }) => {
  const { addTrackedItem } = useTracking();
  const [targetPrice, setTargetPrice] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !product) return null;

  const currentPrice = typeof product.extractedPrice === 'number' ? product.extractedPrice : product.price;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const parsedPrice = parseFloat(targetPrice);

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError('Please enter a valid target price greater than 0.');
      return;
    }

    // Call context to add tracking
    addTrackedItem(product, parsedPrice);
    setTargetPrice('');
    onClose();
  };

  const formatPrice = (p) => {
    if (typeof p === 'number') {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);
    }
    return p;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Bell size={18} className="text-teal-400" />
            Track This Product
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <div className="text-sm text-gray-400 mb-1">Product</div>
            <div className="text-white font-medium line-clamp-2">{product.title}</div>
            
            <div className="mt-3 text-sm text-gray-400 mb-1">Current Price</div>
            <div className="text-xl font-bold text-white">
              {formatPrice(currentPrice) || 'Unavailable'}
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="targetPrice" className="block text-sm text-gray-400 mb-2">
              Target Price (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
              <input
                id="targetPrice"
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="e.g. 90000"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 pl-8 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                autoFocus
              />
            </div>
            {error && (
              <div className="mt-2 text-red-400 text-sm flex items-center gap-1">
                <AlertCircle size={14} />
                {error}
              </div>
            )}
            <p className="mt-2 text-xs text-gray-500">
              You will be notified anonymously when the live price drops to or below this target.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-medium transition-colors"
            >
              Start Tracking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrackingModal;
