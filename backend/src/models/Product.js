import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  normalizedName: {
    type: String,
    required: true,
    index: true,
  },
  brand: {
    type: String,
    default: 'Unknown',
  },
  category: {
    type: String,
    default: 'Uncategorized',
  },
  metadata: {
    type: Object, // Flexible for specs (RAM, Storage, etc.)
    default: {},
  }
}, {
  timestamps: true,
});

const Product = mongoose.model('Product', productSchema);
export default Product;
