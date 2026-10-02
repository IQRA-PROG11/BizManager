const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  purchasePrice: {
    type: Number,
    required: true,
  },
  stockQuantity: {
    type: Number,
    required: true,
    default: 0,
  },
  lowStockLimit: {
    type: Number,
    default: 5,
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);