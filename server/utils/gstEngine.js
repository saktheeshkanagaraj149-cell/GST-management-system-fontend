/**
 * GST Calculation Engine — Server Side
 * Rules:
 *  - Intra-state (same state as MY_STATE): CGST = SGST = gstRate/2
 *  - Inter-state: IGST = gstRate
 */

const MY_STATE = process.env.MY_STATE || 'Tamil Nadu';

const calculateItemAmount = (qty, rate) => {
  return parseFloat((qty * rate).toFixed(2));
};

const calculateTax = (taxable, gstRate, partyState) => {
  const isIntraState = partyState && partyState.trim().toLowerCase() === MY_STATE.trim().toLowerCase();
  let cgst = 0, sgst = 0, igst = 0;

  if (isIntraState) {
    cgst = parseFloat(((taxable * (gstRate / 2)) / 100).toFixed(2));
    sgst = parseFloat(((taxable * (gstRate / 2)) / 100).toFixed(2));
    igst = 0;
  } else {
    cgst = 0;
    sgst = 0;
    igst = parseFloat(((taxable * gstRate) / 100).toFixed(2));
  }

  const total = parseFloat((taxable + cgst + sgst + igst).toFixed(2));
  return { cgst, sgst, igst, total };
};

const processInvoiceItems = (items, partyState) => {
  let totalTaxable = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;

  const processedItems = items.map((item) => {
    const amount = calculateItemAmount(item.qty, item.rate);
    const { cgst, sgst, igst } = calculateTax(amount, item.gstRate, partyState);

    totalTaxable += amount;
    totalCgst += cgst;
    totalSgst += sgst;
    totalIgst += igst;

    return { ...item, amount };
  });

  totalTaxable = parseFloat(totalTaxable.toFixed(2));
  totalCgst = parseFloat(totalCgst.toFixed(2));
  totalSgst = parseFloat(totalSgst.toFixed(2));
  totalIgst = parseFloat(totalIgst.toFixed(2));
  const total = parseFloat((totalTaxable + totalCgst + totalSgst + totalIgst).toFixed(2));

  return {
    items: processedItems,
    taxable: totalTaxable,
    cgst: totalCgst,
    sgst: totalSgst,
    igst: totalIgst,
    total,
  };
};

module.exports = { calculateTax, processInvoiceItems, MY_STATE };
