const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  desc: { type: String, required: true },
  hsn: { type: String, default: '' },
  qty: { type: Number, required: true, min: 0 },
  rate: { type: Number, required: true, min: 0 },
  gstRate: { type: Number, enum: [0, 5, 12, 18, 28], default: 18 },
  amount: { type: Number },
});

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNo: { type: String, unique: true, required: true },
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['sales', 'purchase'], required: true },
    party: {
      partyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Party' },
      name: { type: String, required: true },
      gstin: { type: String, default: '' },
      state: { type: String, default: '' },
    },
    items: [itemSchema],
    taxable: { type: Number, default: 0 },
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['draft', 'confirmed', 'cancelled'],
      default: 'confirmed',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Invoice', invoiceSchema);
