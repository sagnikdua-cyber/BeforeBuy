import React from 'react';
import { ExternalLink, Star, LineChart, Bell } from 'lucide-react';

export default function ProductCard({ product, onAnalyze, onTrack }) {
  const {
    title,
    productLink,
    source,
    price,
    extractedPrice,
    oldPrice,
    rating,
    reviews,
    thumbnail,
    delivery,
    isLowestPrice
  } = product;

  return (
    <div className={`card relative flex flex-col md:flex-row gap-6 hover:border-primary/50 transition-colors ${isLowestPrice ? 'border-success/50 bg-success/5' : ''}`}>
      
      {/* Best Price Badge */}
      {isLowestPrice && (
        <div className="absolute -top-3 -right-3 bg-success text-background text-xs font-bold px-3 py-1 rounded-full shadow-lg">
          Lowest Price
        </div>
      )}

      {/* Product Image */}
      <div className="w-full md:w-48 h-48 bg-background rounded-xl overflow-hidden flex items-center justify-center p-2 flex-shrink-0 border border-border/50">
        {thumbnail ? (
          <img src={thumbnail} alt={title} className="max-w-full max-h-full object-contain" />
        ) : (
          <div className="text-textSecondary text-sm">No Image</div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex flex-col flex-grow justify-between gap-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-textPrimary leading-tight line-clamp-2">
            {title || 'Unknown Product'}
          </h3>
          <div className="flex items-center gap-2 text-sm text-textSecondary">
            <span className="font-medium text-textPrimary bg-surfaceHover px-2 py-0.5 rounded">
              {source || 'Unknown Merchant'}
            </span>
            {(rating || reviews > 0) && (
              <div className="flex items-center gap-1 text-warning">
                <Star size={14} className="fill-warning" />
                <span className="font-medium">{rating}</span>
                {reviews > 0 && <span className="text-textSecondary text-xs">({reviews})</span>}
              </div>
            )}
          </div>
          {delivery && (
            <p className="text-xs text-textSecondary">{delivery}</p>
          )}
        </div>

        {/* Pricing and Action */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-auto">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black text-primary">{price || 'Price unknown'}</span>
              {oldPrice && (
                <span className="text-sm text-textSecondary line-through">{oldPrice}</span>
              )}
            </div>
            {extractedPrice !== null && (
               <div className="text-xs text-textSecondary mt-1 opacity-50">
                 Extracted: {extractedPrice}
               </div>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {onTrack && (
              <button 
                onClick={() => onTrack(product)}
                className="btn flex items-center gap-2 py-2 px-3 whitespace-nowrap !text-sm bg-gray-800 hover:bg-gray-700 text-teal-400 border border-teal-500/30 rounded-lg transition-colors"
                title="Track Price"
              >
                <Bell size={16} />
                <span className="hidden sm:inline">Track</span>
              </button>
            )}
            {onAnalyze && (
              <button 
                onClick={() => onAnalyze(product)}
                className="btn flex items-center gap-2 py-2 px-3 whitespace-nowrap !text-sm bg-surfaceHover hover:bg-border text-textPrimary border border-border/50 rounded-lg transition-colors"
              >
                <LineChart size={16} />
                <span className="hidden sm:inline">Analyze</span>
              </button>
            )}
            <a 
              href={productLink || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary py-2 px-4 whitespace-nowrap !text-sm flex items-center gap-2"
              onClick={(e) => { if (!productLink) e.preventDefault(); }}
            >
              <span>View Deal</span>
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
