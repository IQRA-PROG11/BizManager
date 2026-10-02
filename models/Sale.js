const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  invoiceNo: { type: String, required: true },
  customerName: { type: String, default: 'Walk-in Customer' },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: String,
      quantity: Number,
      price: Number,
      total: Number
    }
  ],
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, default: 'Cash' },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema);