/**
 * Scope 1 and Scope 2 Agents
 * Sub-agents for analyzing individual scopes with same logic as Vendor Agent
 */

import Report from '../../models/Report.js';
import { getPreviousQuarter, detectAnomalies } from './utils/periodUtils.js';

/**
 * Scope 1 Agent - Analyzes Scope 1 emissions
 * @param {string} facilityId - Facility ID
 * @param {string} period - Current period
 * @param {Object} currentReport - Current period Report document
 * @returns {Promise<Object>} Scope 1 analysis
 */
export const scope1Agent = async (facilityId, period, currentReport) => {
  try {
    console.log(`  📊 Scope1Agent: Analyzing Scope 1 for period ${period}`);

    // Extract current Scope 1 data
    const currentScope1 = currentReport.scope1 || {};
    const currentTotal = extractScopeTotal(currentScope1, 'scope1');

    // Get previous quarter report
    const previousQuarter = getPreviousQuarter(period);
    const previousReport = await Report.findOne({
      facilityId: facilityId.toString(),
      period: previousQuarter,
    });

    const previousScope1 = previousReport ? previousReport.scope1 || {} : null;
    const previousTotal = previousScope1 ? extractScopeTotal(previousScope1, 'scope1') : null;

    // Get historical values for statistical analysis
    const historicalReports = await Report.find({
      facilityId: facilityId.toString(),
      period: { $ne: period },
    })
      .sort({ period: -1 })
      .limit(6); // Last 6 quarters

    const historicalValues = historicalReports.map((r) => extractScopeTotal(r.scope1 || {}, 'scope1'));

    // Detect anomalies using same logic as Vendor Agent
    const anomalies = detectAnomalies(currentTotal, previousTotal, historicalValues);

    // Detailed comparison
    const comparison = {
      previous_quarter: previousTotal !== null ? `${previousTotal.toFixed(2)} tCO2e` : 'No data available',
      current_quarter: `${currentTotal.toFixed(2)} tCO2e`,
      change: previousTotal !== null 
        ? `${((currentTotal - previousTotal) / previousTotal * 100).toFixed(2)}%`
        : 'N/A',
    };

    return {
      total_co2e: currentTotal,
      comparison: comparison,
      anomalies: anomalies.map((a) => ({
        type: a.type,
        reason: a.reason,
      })),
      data_breakdown: {
        diesel_liters: currentScope1.diesel_liters || 0,
        diesel_co2_tons: currentScope1.diesel_co2_tons || currentScope1.diesel_co2e || 0,
        refrigerant_kg: currentScope1.refrigerant_kg || 0,
        refrigerant_co2_tons: currentScope1.refrigerant_co2_tons || currentScope1.refrigerant_co2e || 0,
        other_sources: Object.keys(currentScope1).filter(k => 
          !['diesel_liters', 'diesel_co2_tons', 'diesel_co2e', 'refrigerant_kg', 'refrigerant_co2_tons', 'refrigerant_co2e'].includes(k)
        ).reduce((acc, k) => {
          acc[k] = currentScope1[k];
          return acc;
        }, {}),
      },
    };
  } catch (error) {
    console.error('❌ Scope1Agent error:', error);
    return {
      total_co2e: 0,
      comparison: {
        previous_quarter: 'Error',
        current_quarter: 'Error',
      },
      anomalies: [
        {
          type: 'ANALYSIS_ERROR',
          reason: `Failed to analyze Scope 1: ${error.message}`,
        },
      ],
    };
  }
};

/**
 * Scope 2 Agent - Analyzes Scope 2 emissions
 * @param {string} facilityId - Facility ID
 * @param {string} period - Current period
 * @param {Object} currentReport - Current period Report document
 * @returns {Promise<Object>} Scope 2 analysis
 */
export const scope2Agent = async (facilityId, period, currentReport) => {
  try {
    console.log(`  📊 Scope2Agent: Analyzing Scope 2 for period ${period}`);

    // Extract current Scope 2 data
    const currentScope2 = currentReport.scope2 || {};
    const currentTotal = extractScopeTotal(currentScope2, 'scope2');

    // Get previous quarter report
    const previousQuarter = getPreviousQuarter(period);
    const previousReport = await Report.findOne({
      facilityId: facilityId.toString(),
      period: previousQuarter,
    });

    const previousScope2 = previousReport ? previousReport.scope2 || {} : null;
    const previousTotal = previousScope2 ? extractScopeTotal(previousScope2, 'scope2') : null;

    // Get historical values for statistical analysis
    const historicalReports = await Report.find({
      facilityId: facilityId.toString(),
      period: { $ne: period },
    })
      .sort({ period: -1 })
      .limit(6); // Last 6 quarters

    const historicalValues = historicalReports.map((r) => extractScopeTotal(r.scope2 || {}, 'scope2'));

    // Detect anomalies using same logic as Vendor Agent
    const anomalies = detectAnomalies(currentTotal, previousTotal, historicalValues);

    // Detailed comparison
    const comparison = {
      previous_quarter: previousTotal !== null ? `${previousTotal.toFixed(2)} tCO2e` : 'No data available',
      current_quarter: `${currentTotal.toFixed(2)} tCO2e`,
      change: previousTotal !== null 
        ? `${((currentTotal - previousTotal) / previousTotal * 100).toFixed(2)}%`
        : 'N/A',
    };

    return {
      total_co2e: currentTotal,
      comparison: comparison,
      anomalies: anomalies.map((a) => ({
        type: a.type,
        reason: a.reason,
      })),
      data_breakdown: {
        electricity_kwh: currentScope2.electricity_kwh || 0,
        electricity_co2_tons: currentScope2.electricity_co2_tons || currentScope2.electricity_co2e || 0,
        grid_factor: currentScope2.grid_factor || currentScope2.emission_factor || 'Not specified',
        other_sources: Object.keys(currentScope2).filter(k => 
          !['electricity_kwh', 'electricity_co2_tons', 'electricity_co2e', 'grid_factor', 'emission_factor'].includes(k)
        ).reduce((acc, k) => {
          acc[k] = currentScope2[k];
          return acc;
        }, {}),
      },
    };
  } catch (error) {
    console.error('❌ Scope2Agent error:', error);
    return {
      total_co2e: 0,
      comparison: {
        previous_quarter: 'Error',
        current_quarter: 'Error',
      },
      anomalies: [
        {
          type: 'ANALYSIS_ERROR',
          reason: `Failed to analyze Scope 2: ${error.message}`,
        },
      ],
    };
  }
};

/**
 * Extract total CO2e from scope data object
 * @param {Object} scopeData - Scope data object
 * @param {string} scopeType - 'scope1' or 'scope2'
 * @returns {number} Total CO2e in tons
 */
const extractScopeTotal = (scopeData, scopeType) => {
  if (!scopeData || typeof scopeData !== 'object') return 0;

  // Try common field names
  const possibleFields = [
    'total_co2e',
    'totalCO2e',
    'co2e',
    'total',
    `${scopeType}_co2e`,
    `${scopeType}_total`,
  ];

  for (const field of possibleFields) {
    if (scopeData[field] !== undefined && scopeData[field] !== null) {
      const value = parseFloat(scopeData[field]);
      if (!isNaN(value)) {
        return value;
      }
    }
  }

  // Try to sum all numeric CO2-related fields
  const co2Fields = Object.keys(scopeData).filter(k => 
    k.toLowerCase().includes('co2') || k.toLowerCase().includes('co2e')
  );
  
  if (co2Fields.length > 0) {
    const values = co2Fields
      .map(k => parseFloat(scopeData[k]))
      .filter(v => !isNaN(v) && v > 0);
    
    if (values.length > 0) {
      return values.reduce((sum, v) => sum + v, 0);
    }
  }

  // Fallback: sum all numeric values
  const allValues = Object.values(scopeData)
    .map(v => parseFloat(v))
    .filter(v => !isNaN(v) && v > 0);
  
  return allValues.length > 0 ? allValues.reduce((sum, v) => sum + v, 0) : 0;
};

