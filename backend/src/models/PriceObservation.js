import mongoose from 'mongoose';

const PriceObservationSchema = new mongoose.Schema({
  productKey: {
    type: String,
    required: true,
    index: true
  },
  productId: {
    type: String, // SerpApi product_id when available
    index: true
  },
  normalizedProductName: {
    type: String,
    required: true
  },
  variant: {
    type: String
  },
  title: {
    type: String,
    required: true
  },
  merchant: {
    type: String,
    required: true,
    index: true
  },
  source: {
    type: String
  },
  productLink: {
    type: String
  },
  price: {
    type: String // String representation e.g., "₹95,999"
  },
  extractedPrice: {
    type: Number,
    required: true
  },
  currency: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: -1
  },
  observationType: {
    type: String,
    default: 'live_search'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
});

// Compound index to help with deduplication queries
PriceObservationSchema.index({ productKey: 1, merchant: 1, extractedPrice: 1, timestamp: -1 });

const PriceObservation = mongoose.model('PriceObservation', PriceObservationSchema);

export default PriceObservation;
