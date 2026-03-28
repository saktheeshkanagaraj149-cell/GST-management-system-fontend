/**
 * Format a number as Indian currency ₹
 */
export const formatCurrency = (amount) => {
  if (amount == null) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format a number with Indian comma system (no currency symbol)
 */
export const formatNumber = (num) => {
  if (num == null) return '0.00';
  return new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
};

/**
 * Format date as DD-MM-YYYY
 */
export const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
};

/**
 * Format date as "26 Mar 2026"
 */
export const formatDateLong = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

/**
 * Month name from number (1-12)
 */
export const monthName = (m) =>
  ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m - 1] || '';

/**
 * Truncate string
 */
export const truncate = (str, len = 30) =>
  str && str.length > len ? str.substring(0, len) + '…' : str;

/**
 * Get status badge class
 */
export const statusBadgeClass = (status) => {
  const map = { confirmed: 'badge-green', draft: 'badge-amber', cancelled: 'badge-red' };
  return map[status] || 'badge-blue';
};

/**
 * Type badge class (sales vs purchase)
 */
export const typeBadgeClass = (type) =>
  type === 'sales' ? 'badge-green' : 'badge-amber';
