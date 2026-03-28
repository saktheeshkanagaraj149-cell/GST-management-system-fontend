const Invoice = require('../models/Invoice.model');
const { processInvoiceItems } = require('../utils/gstEngine');

// Helper: generate invoice number
const generateInvoiceNo = async (type) => {
  const prefix = type === 'sales' ? 'INV' : 'PUR';
  const count = await Invoice.countDocuments({ type });
  return `${prefix}-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
};

// GET /api/invoices
const getInvoices = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;

    const invoices = await Invoice.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Invoice.countDocuments(filter);
    res.json({ invoices, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/invoices/:id
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/invoices
const createInvoice = async (req, res) => {
  try {
    const { type, party, items, date, status } = req.body;
    const invoiceNo = await generateInvoiceNo(type);
    const processed = processInvoiceItems(items, party.state);

    const invoice = await Invoice.create({
      invoiceNo,
      date: date || Date.now(),
      type,
      party,
      status: status || 'confirmed',
      ...processed,
    });
    res.status(201).json(invoice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/invoices/:id
const updateInvoice = async (req, res) => {
  try {
    const { party, items, date, status } = req.body;
    const processed = processInvoiceItems(items, party.state);

    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { party, date, status, ...processed },
      { new: true, runValidators: true }
    );
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/invoices/:id
const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getInvoices, getInvoiceById, createInvoice, updateInvoice, deleteInvoice };
