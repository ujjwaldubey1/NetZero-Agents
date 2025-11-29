/**
 * Date utility functions for NetZero Agents
 */

/**
 * Get quarter from a date
 * @param {Date|string} date - Date object or date string
 * @returns {string} - Quarter string in format "YYYY-QN" (e.g., "2025-Q1")
 */
export const getQuarterFromDate = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1; // getMonth() returns 0-11
  
  let quarter;
  if (month >= 1 && month <= 3) quarter = 'Q1';
  else if (month >= 4 && month <= 6) quarter = 'Q2';
  else if (month >= 7 && month <= 9) quarter = 'Q3';
  else quarter = 'Q4';
  
  return `${year}-${quarter}`;
};

/**
 * Get current quarter
 * @returns {string} - Current quarter string
 */
export const getCurrentQuarter = () => {
  return getQuarterFromDate(new Date());
};

/**
 * Parse period string to validate format
 * @param {string} period - Period string (e.g., "2025-Q1" or "2025-01")
 * @returns {Object|null} - Parsed period object or null if invalid
 */
export const parsePeriod = (period) => {
  if (!period || typeof period !== 'string') return null;
  
  // Match YYYY-QN format
  const quarterMatch = period.match(/^(\d{4})-Q([1-4])$/);
  if (quarterMatch) {
    return {
      year: parseInt(quarterMatch[1]),
      quarter: parseInt(quarterMatch[2]),
      format: 'quarter',
    };
  }
  
  // Match YYYY-MM format
  const monthMatch = period.match(/^(\d{4})-(\d{2})$/);
  if (monthMatch) {
    const month = parseInt(monthMatch[2]);
    if (month >= 1 && month <= 12) {
      return {
        year: parseInt(monthMatch[1]),
        month,
        format: 'month',
      };
    }
  }
  
  return null;
};

/**
 * Validate period format
 * @param {string} period - Period string to validate
 * @returns {boolean} - True if valid
 */
export const isValidPeriod = (period) => {
  return parsePeriod(period) !== null;
};

