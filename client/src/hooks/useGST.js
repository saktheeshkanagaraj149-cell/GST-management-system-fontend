import { useMemo } from 'react';
import { processItems, calculateTax, computeNetGST, MY_STATE } from '../utils/gstCalculator';

export const useGST = () => {
  const myState = MY_STATE;

  const calcItems = (items, partyState) => {
    if (!items || items.length === 0)
      return { items: [], taxable: 0, cgst: 0, sgst: 0, igst: 0, total: 0 };
    return processItems(items, partyState);
  };

  const calcSingleTax = (taxable, gstRate, partyState) =>
    calculateTax(taxable, gstRate, partyState);

  const calcNet = (outputGST, inputGST) => computeNetGST(outputGST, inputGST);

  const isIntraState = (state) =>
    state?.trim().toLowerCase() === myState.trim().toLowerCase();

  return { myState, calcItems, calcSingleTax, calcNet, isIntraState };
};
