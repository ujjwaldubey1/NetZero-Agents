/**
 * Staff Agent
 * Analyzes Scope 1 and Scope 2 emissions from staff operations
 * Uses internal Scope1Agent and Scope2Agent sub-agents
 */

import Report from '../../models/Report.js';
import { scope1Agent, scope2Agent } from './scopeAgents.js';

/**
 * Staff Agent - Analyzes staff Scope 1 and Scope 2 emissions
 * @param {string} datacenterName - Name of the datacenter
 * @param {string} facilityId - Facility/Datacenter ID
 * @param {string} period - Period in format "2025-Q1"
 * @returns {Promise<Object>} Staff analysis JSON
 */
export const staffAgent = async (datacenterName, facilityId, period) => {
  try {
    console.log(`👥 Staff Agent: Analyzing Scope 1 & 2 emissions for ${datacenterName}, Period: ${period}`);

    // Find current period report
    const currentReport = await Report.findOne({
      facilityId: facilityId.toString(),
      period: period,
    });

    if (!currentReport) {
      return {
        staff: {
          scope1: {
            message: `No report found for period ${period}`,
            anomalies: [],
          },
          scope2: {
            message: `No report found for period ${period}`,
            anomalies: [],
          },
        },
      };
    }

    // Trigger both scope agents in parallel
    const [scope1Analysis, scope2Analysis] = await Promise.all([
      scope1Agent(facilityId, period, currentReport),
      scope2Agent(facilityId, period, currentReport),
    ]);

    return {
      staff: {
        scope1: scope1Analysis,
        scope2: scope2Analysis,
        summary: {
          total_scope1_co2e: scope1Analysis.total_co2e || 0,
          total_scope2_co2e: scope2Analysis.total_co2e || 0,
          total_scope1_anomalies: scope1Analysis.anomalies?.length || 0,
          total_scope2_anomalies: scope2Analysis.anomalies?.length || 0,
          combined_total: (scope1Analysis.total_co2e || 0) + (scope2Analysis.total_co2e || 0),
        },
      },
    };
  } catch (error) {
    console.error('❌ Staff Agent error:', error);
    throw new Error(`Staff Agent failed: ${error.message}`);
  }
};


