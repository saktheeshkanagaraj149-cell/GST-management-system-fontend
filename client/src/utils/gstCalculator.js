const MY_STATE = import.meta.env.VITE_MY_STATE || 'Tamil Nadu';

export { MY_STATE };

/**
 * Calculate CGST, SGST, IGST for a single taxable amount
 * Intra-state → CGST + SGST
 * Inter-state → IGST
 */
export const calculateTax = (taxable, gstRate, partyState) => {
  const isIntra = partyState?.trim().toLowerCase() === MY_STATE.trim().toLowerCase();
  let cgst = 0, sgst = 0, igst = 0;

  if (isIntra) {
    cgst = round2(taxable * (gstRate / 2) / 100);
    sgst = round2(taxable * (gstRate / 2) / 100);
  } else {
    igst = round2(taxable * gstRate / 100);
  }

  return { cgst, sgst, igst, total: round2(taxable + cgst + sgst + igst) };
};

/**
 * Process an array of invoice items → compute amounts + totals
 */
export const processItems = (items, partyState) => {
  let totTaxable = 0, totCgst = 0, totSgst = 0, totIgst = 0;

  const processed = items.map((item) => {
    const amount = round2((item.qty || 0) * (item.rate || 0));
    const tax = calculateTax(amount, item.gstRate || 0, partyState);
    totTaxable += amount;
    totCgst += tax.cgst;
    totSgst += tax.sgst;
    totIgst += tax.igst;
    return { ...item, amount };
  });

  return {
    items: processed,
    taxable: round2(totTaxable),
    cgst: round2(totCgst),
    sgst: round2(totSgst),
    igst: round2(totIgst),
    total: round2(totTaxable + totCgst + totSgst + totIgst),
  };
};

/**
 * Round to 2 decimal places
 */
export const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

/**
 * Compute net GST payable (output - input)
 */
export const computeNetGST = (outputGST, inputGST) => round2(outputGST - inputGST);

export const GST_RATES = [0, 5, 12, 18, 28];
