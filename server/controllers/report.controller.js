const Invoice = require('../models/Invoice.model');

// GSTR-1: Sales invoices grouped by GST rate
const getGSTR1 = async (req, res) => {
  try {
    const { month, year } = req.query;
    const start = new Date(year || new Date().getFullYear(), (month || new Date().getMonth() + 1) - 1, 1);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59);

    const data = await Invoice.aggregate([
      { $match: { type: 'sales', status: { $ne: 'cancelled' }, date: { $gte: start, $lte: end } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: { hsn: '$items.hsn', gstRate: '$items.gstRate' },
          taxable: { $sum: '$items.amount' },
          cgst: { $sum: { $multiply: ['$items.amount', { $divide: ['$items.gstRate', 200] }] } },
          sgst: { $sum: { $multiply: ['$items.amount', { $divide: ['$items.gstRate', 200] }] } },
          igst: { $sum: { $multiply: ['$items.amount', { $divide: ['$items.gstRate', 100] }] } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.gstRate': 1, '_id.hsn': 1 } },
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GSTR-3B: Output + Input tax in one query using $facet
const getGSTR3B = async (req, res) => {
  try {
    const { month, year } = req.query;
    const start = new Date(year || new Date().getFullYear(), (month || new Date().getMonth() + 1) - 1, 1);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59);

    const data = await Invoice.aggregate([
      { $match: { status: { $ne: 'cancelled' }, date: { $gte: start, $lte: end } } },
      {
        $facet: {
          outputTax: [
            { $match: { type: 'sales' } },
            { $group: { _id: null, taxable: { $sum: '$taxable' }, cgst: { $sum: '$cgst' }, sgst: { $sum: '$sgst' }, igst: { $sum: '$igst' }, total: { $sum: '$total' } } },
          ],
          inputTax: [
            { $match: { type: 'purchase' } },
            { $group: { _id: null, taxable: { $sum: '$taxable' }, cgst: { $sum: '$cgst' }, sgst: { $sum: '$sgst' }, igst: { $sum: '$igst' }, total: { $sum: '$total' } } },
          ],
        },
      },
    ]);

    const output = data[0].outputTax[0] || { taxable: 0, cgst: 0, sgst: 0, igst: 0, total: 0 };
    const input = data[0].inputTax[0] || { taxable: 0, cgst: 0, sgst: 0, igst: 0, total: 0 };
    const netPayable = {
      cgst: parseFloat((output.cgst - input.cgst).toFixed(2)),
      sgst: parseFloat((output.sgst - input.sgst).toFixed(2)),
      igst: parseFloat((output.igst - input.igst).toFixed(2)),
      total: parseFloat(((output.cgst + output.sgst + output.igst) - (input.cgst + input.sgst + input.igst)).toFixed(2)),
    };
    res.json({ output, input, netPayable });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Monthly trend
const getMonthlyTrend = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const data = await Invoice.aggregate([
      { $match: { status: { $ne: 'cancelled' }, date: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) } } },
      {
        $group: {
          _id: { month: { $month: '$date' }, type: '$type' },
          total: { $sum: '$total' },
          taxable: { $sum: '$taxable' },
          gst: { $sum: { $add: ['$cgst', '$sgst', '$igst'] } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.month': 1 } },
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Top parties by invoice volume
const getTopParties = async (req, res) => {
  try {
    const data = await Invoice.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: '$party.name', count: { $sum: 1 }, totalValue: { $sum: '$total' }, type: { $first: '$type' } } },
      { $sort: { totalValue: -1 } },
      { $limit: 10 },
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// HSN-wise summary
const getHSNSummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const start = new Date(year || new Date().getFullYear(), (month || new Date().getMonth() + 1) - 1, 1);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59);

    const data = await Invoice.aggregate([
      { $match: { status: { $ne: 'cancelled' }, date: { $gte: start, $lte: end } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.hsn',
          description: { $first: '$items.desc' },
          taxable: { $sum: '$items.amount' },
          gstRate: { $first: '$items.gstRate' },
          qty: { $sum: '$items.qty' },
          count: { $sum: 1 },
        },
      },
      { $sort: { taxable: -1 } },
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Dashboard summary stats
const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [salesThisMonth, purchasesThisMonth, totalInvoices, recentInvoices] = await Promise.all([
      Invoice.aggregate([
        { $match: { type: 'sales', status: { $ne: 'cancelled' }, date: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: '$total' }, gst: { $sum: { $add: ['$cgst', '$sgst', '$igst'] } }, count: { $sum: 1 } } },
      ]),
      Invoice.aggregate([
        { $match: { type: 'purchase', status: { $ne: 'cancelled' }, date: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: '$total' }, gst: { $sum: { $add: ['$cgst', '$sgst', '$igst'] } }, count: { $sum: 1 } } },
      ]),
      Invoice.countDocuments({ status: { $ne: 'cancelled' } }),
      Invoice.find({ status: { $ne: 'cancelled' } }).sort({ createdAt: -1 }).limit(5),
    ]);

    const sales = salesThisMonth[0] || { total: 0, gst: 0, count: 0 };
    const purchases = purchasesThisMonth[0] || { total: 0, gst: 0, count: 0 };

    res.json({
      salesTotal: sales.total,
      salesGST: sales.gst,
      salesCount: sales.count,
      purchasesTotal: purchases.total,
      purchasesGST: purchases.gst,
      purchasesCount: purchases.count,
      netGSTPayable: parseFloat((sales.gst - purchases.gst).toFixed(2)),
      totalInvoices,
      recentInvoices,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getGSTR1, getGSTR3B, getMonthlyTrend, getTopParties, getHSNSummary, getDashboardStats };
