/**
 * Period and Quarter Utilities
 * Helper functions for period comparison and quarter calculations
 */

/**
 * Get previous quarter from a given period
 * @param {string} period - Period in format "2025-Q1"
 * @returns {string} Previous quarter in format "2024-Q4"
 */
export const getPreviousQuarter = (period) => {
  const match = period.match(/^(\d{4})-Q([1-4])$/);
  if (!match) {
    throw new Error(`Invalid period format: ${period}. Expected format: YYYY-QN`);
  }

  let year = parseInt(match[1], 10);
  let quarter = parseInt(match[2], 10);

  // Go to previous quarter
  quarter--;
  if (quarter < 1) {
    quarter = 4;
    year--;
  }

  return `${year}-Q${quarter}`;
};

/**
 * Parse period string to year and quarter numbers
 * @param {string} period - Period in format "2025-Q1"
 * @returns {Object} { year: number, quarter: number }
 */
export const parsePeriod = (period) => {
  const match = period.match(/^(\d{4})-Q([1-4])$/);
  if (!match) {
    throw new Error(`Invalid period format: ${period}`);
  }

  return {
    year: parseInt(match[1], 10),
    quarter: parseInt(match[2], 10),
  };
};

/**
 * Calculate percentage change between two values
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {Object} { change: number, percentage: number, direction: 'increase' | 'decrease' | 'no change' }
 */
export const calculateChange = (current, previous) => {
  if (previous === 0 || previous === null || previous === undefined) {
    return {
      change: current,
      percentage: current > 0 ? 100 : 0,
      direction: current > 0 ? 'increase' : 'no change',
    };
  }

  const change = current - previous;
  const percentage = ((change / previous) * 100).toFixed(2);

  return {
    change,
    percentage: parseFloat(percentage),
    direction: change > 0 ? 'increase' : change < 0 ? 'decrease' : 'no change',
  };
};

/**
 * Detect anomalies using statistical methods
 * @param {number} current - Current value
 * @param {number} previous - Previous value (optional)
 * @param {Array<number>} historicalValues - Array of historical values for statistical analysis
 * @returns {Array<Object>} Array of detected anomalies
 */
export const detectAnomalies = (current, previous = null, historicalValues = []) => {
  const anomalies = [];

  if (current === null || current === undefined || isNaN(current)) {
    anomalies.push({
      type: 'MISSING_DATA',
      reason: 'Current period data is missing or invalid',
    });
    return anomalies;
  }

  // Compare with previous quarter
  if (previous !== null && previous !== undefined && !isNaN(previous)) {
    const change = calculateChange(current, previous);

    // Significant increase (>50%)
    if (change.percentage > 50) {
      anomalies.push({
        type: 'SIGNIFICANT_INCREASE',
        reason: `Emissions increased by ${change.percentage}% compared to previous quarter (${change.change.toFixed(2)} tCO2e increase)`,
      });
    }

    // Significant decrease (>50%) - could indicate data error
    if (change.percentage < -50) {
      anomalies.push({
        type: 'SIGNIFICANT_DECREASE',
        reason: `Emissions decreased by ${Math.abs(change.percentage)}% compared to previous quarter. This may indicate data collection errors or actual improvements.`,
      });
    }

    // Moderate increase (25-50%)
    if (change.percentage > 25 && change.percentage <= 50) {
      anomalies.push({
        type: 'MODERATE_INCREASE',
        reason: `Emissions increased by ${change.percentage}% compared to previous quarter. Monitor for trends.`,
      });
    }
  }

  // Statistical anomaly detection using historical data
  if (historicalValues.length >= 3) {
    const values = historicalValues.filter(v => v !== null && v !== undefined && !isNaN(v));
    if (values.length >= 3) {
      const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
      const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);

      // Z-score calculation
      const zScore = stdDev > 0 ? Math.abs((current - mean) / stdDev) : 0;

      // Flag if more than 2 standard deviations away
      if (zScore > 2) {
        anomalies.push({
          type: 'STATISTICAL_ANOMALY',
          reason: `Current value (${current.toFixed(2)}) is ${zScore.toFixed(2)} standard deviations from historical mean (${mean.toFixed(2)}). This indicates an unusual pattern.`,
        });
      }
    }
  } else if (!previous && historicalValues.length === 0) {
    // No historical data - flag for manual review
    anomalies.push({
      type: 'NO_BASELINE',
      reason: 'No historical data available for comparison. Baseline should be established for future analysis.',
    });
  }

  // Zero or negative values (likely errors)
  if (current <= 0 && previous && previous > 0) {
    anomalies.push({
      type: 'ZERO_OR_NEGATIVE',
      reason: 'Current period shows zero or negative emissions, which may indicate data collection errors.',
    });
  }

  return anomalies;
};

