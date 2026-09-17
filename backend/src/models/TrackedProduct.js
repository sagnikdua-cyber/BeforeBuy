import mongoose from 'mongoose';

const trackedProductSchema = new mongoose.Schema({
  deviceIdentifier: {
    type: String,
    required: true, // Anonymous ID stored in LocalStorage
    index: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  targetPrice: {
    type: Number,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

const TrackedProduct = mongoose.model('TrackedProduct', trackedProductSchema);
export default TrackedProduct;
