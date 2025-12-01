/**
 * Vendor Agent
 * Analyzes Scope 3 emissions data from vendors
 */

import VendorScope from '../../models/VendorScope.js';
import User from '../../models/User.js';
import { getPreviousQuarter, detectAnomalies } from './utils/periodUtils.js';

/**
 * Vendor Agent - Analyzes vendor Scope 3 emissions
 * @param {string} datacenterName - Name of the datacenter
 * @param {string} facilityId - Facility/Datacenter ID
 * @param {string} period - Period in format "2025-Q1"
 * @returns {Promise<Object>} Vendor analysis JSON
 */
export const vendorAgent = async (datacenterName, facilityId, period) => {
  try {
    console.log(`📊 Vendor Agent: Analyzing Scope 3 emissions for ${datacenterName}, Period: ${period}`);

    // Find all vendors related to this datacenter
    const vendorScopes = await VendorScope.find({
      facilityId: facilityId.toString(),
      period: period,
    });

    if (!vendorScopes || vendorScopes.length === 0) {
      return {
        vendors: [],
        message: `No vendor Scope 3 data found for ${datacenterName} in period ${period}`,
      };
    }

    // Get previous quarter for comparison
    const previousQuarter = getPreviousQuarter(period);

    // Analyze each vendor
    const vendorAnalyses = await Promise.all(
      vendorScopes.map(async (vendorScope) => {
        // Get vendor user information
        const vendorUser = await User.findOne({ email: vendorScope.vendorEmail }).catch(() => null);
        const vendorName = vendorUser?.vendorName || vendorUser?.organizationName || vendorScope.vendorEmail;

        // Extract current quarter Scope 3 emissions
        const currentData = vendorScope.data || {};
        const currentScope3 = extractScope3Total(currentData);

        // Get previous quarter data for comparison
        const previousVendorScope = await VendorScope.findOne({
          vendorEmail: vendorScope.vendorEmail,
          facilityId: facilityId.toString(),
          period: previousQuarter,
        });

        const previousScope3 = previousVendorScope ? extractScope3Total(previousVendorScope.data || {}) : null;

        // Get historical values for statistical analysis
        const historicalScopes = await VendorScope.find({
          vendorEmail: vendorScope.vendorEmail,
          facilityId: facilityId.toString(),
          period: { $ne: period },
        })
          .sort({ period: -1 })
          .limit(6); // Last 6 quarters

        const historicalValues = historicalScopes.map((vs) => extractScope3Total(vs.data || {}));

        // Detect anomalies
        const anomalies = detectAnomalies(currentScope3, previousScope3, historicalValues);

        return {
          name: vendorName,
          email: vendorScope.vendorEmail,
          scope3_comparison: {
            previous_quarter: previousScope3 !== null ? `${previousScope3.toFixed(2)} tCO2e` : 'No data available',
            current_quarter: `${currentScope3.toFixed(2)} tCO2e`,
          },
          anomalies: anomalies.map((a) => ({
            type: a.type,
            reason: a.reason,
          })),
          status: vendorScope.status,
          attested: vendorScope.attested,
        };
      })
    );

    return {
      vendors: vendorAnalyses,
      summary: {
        total_vendors: vendorAnalyses.length,
        total_anomalies: vendorAnalyses.reduce((sum, v) => sum + v.anomalies.length, 0),
        total_scope3: vendorAnalyses.reduce((sum, v) => {
          const match = v.scope3_comparison.current_quarter.match(/(\d+\.?\d*)/);
          return sum + (match ? parseFloat(match[1]) : 0);
        }, 0),
      },
    };
  } catch (error) {
    console.error('❌ Vendor Agent error:', error);
    throw new Error(`Vendor Agent failed: ${error.message}`);
  }
};

/**
 * Extract total Scope 3 CO2e from vendor data object
 * @param {Object} data - Vendor data object
 * @returns {number} Total Scope 3 CO2e in tons
 */
const extractScope3Total = (data) => {
  if (!data || typeof data !== 'object') return 0;

  // Try common field names for Scope 3 total
  const possibleFields = [
    'total_co2e',
    'totalCO2e',
    'scope3_co2e',
    'scope3_total',
    'upstream_co2_tons',
    'total',
    'co2e',
  ];

  for (const field of possibleFields) {
    if (data[field] !== undefined && data[field] !== null) {
      const value = parseFloat(data[field]);
      if (!isNaN(value)) {
        return value;
      }
    }
  }

  // Try to sum all numeric values in scope3 object
  if (data.scope3 && typeof data.scope3 === 'object') {
    const values = Object.values(data.scope3)
      .map((v) => parseFloat(v))
      .filter((v) => !isNaN(v));
    if (values.length > 0) {
      return values.reduce((sum, v) => sum + v, 0);
    }
  }

  // Fallback: sum all numeric values in data
  const allValues = Object.values(data)
    .map((v) => parseFloat(v))
    .filter((v) => !isNaN(v) && v > 0);
  
  return allValues.length > 0 ? allValues.reduce((sum, v) => sum + v, 0) : 0;
};


