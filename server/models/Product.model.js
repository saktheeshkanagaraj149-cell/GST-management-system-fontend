const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    hsn: { type: String, default: '' },
    unit: {
      type: String,
      enum: ['Nos', 'Kg', 'Mtr', 'Ltr', 'Box', 'Set'],
      default: 'Nos',
    },
    rate: { type: Number, required: true, min: 0 },
    gstRate: { type: Number, enum: [0, 5, 12, 18, 28], default: 18 },
    category: { type: String, default: '' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
