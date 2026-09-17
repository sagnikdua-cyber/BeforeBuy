import React from 'react';
import { ShoppingCart, Star, Shield, TrendingDown, Bell } from 'lucide-react';
import AnalyzerPanel from './AnalyzerPanel'; // In case we want to nest it, but let's keep it simple for alternatives

const AlternativeCard = ({ product, onTrack }) => {
  const {
    title,
    price,
    extractedPrice,
    oldPrice,
    source,
    thumbnail,
    productLink,
    rating,
    reviews,
    delivery,
    classification,
    explanation,
    priceDifference
  } = product;

  // Formatting helpers
  const formatPrice = (p) => {
    if (typeof p === 'number') {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);
    }
    return p;
  };

  const getClassificationColor = (type) => {
    if (type === 'Same Variant') return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50';
    if (type === 'Lower-Cost Alternative') return 'bg-teal-500/20 text-teal-400 border-teal-500/50';
    return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all duration-300 group flex flex-col md:flex-row h-full">
      {/* Image Section */}
      <div className="w-full md:w-48 h-48 md:h-auto bg-gray-900 flex-shrink-0 p-4 flex items-center justify-center relative">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="text-gray-600 flex flex-col items-center">
            <ShoppingCart size={32} className="mb-2" />
            <span className="text-xs uppercase tracking-wider">No Image</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          {classification && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getClassificationColor(classification)}`}>
              {classification}
            </span>
          )}
          {priceDifference > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <TrendingDown size={12} className="mr-1" />
              Save {formatPrice(priceDifference)}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-medium text-white mb-2 line-clamp-2 leading-tight">
          {title}
        </h3>

        {/* Explanation Reason */}
        {explanation && (
          <p className="text-sm text-gray-400 mb-3 italic">
            Why this? {explanation}
          </p>
        )}

        {/* Metadata */}
        <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
          {source && (
            <span className="flex items-center">
              <Shield size={14} className="mr-1 text-gray-500" />
              {source}
            </span>
          )}
          {rating !== null && (
            <span className="flex items-center text-amber-400">
              <Star size={14} className="mr-1 fill-current" />
              {rating} {reviews ? `(${reviews})` : ''}
            </span>
          )}
        </div>

        {/* Price & Action (Pushed to bottom) */}
        <div className="mt-auto flex items-end justify-between pt-4 border-t border-gray-700/50">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Current Price</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">
                {price || formatPrice(extractedPrice) || 'Price unavailable'}
              </span>
              {oldPrice && (
                <span className="text-sm text-gray-500 line-through">
                  {oldPrice}
                </span>
              )}
            </div>
            {delivery && (
              <div className="text-xs text-gray-400 mt-1">{delivery}</div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onTrack && (
              <button
                onClick={() => onTrack(product)}
                className="py-2.5 px-3 bg-gray-800 hover:bg-gray-700 text-teal-400 rounded-lg font-medium transition-colors border border-teal-500/30 flex items-center justify-center"
                title="Track Price"
              >
                <Bell size={18} />
              </button>
            )}
            <a
              href={productLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors duration-200 flex items-center"
            >
              View Deal
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlternativeCard;
