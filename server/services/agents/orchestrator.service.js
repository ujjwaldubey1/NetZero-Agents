/**
 * Master AI Data Extraction and Analysis Orchestrator
 * Coordinates multiple specialized agents to produce unified emissions analysis reports
 */

import { vendorAgent } from './vendorAgent.js';
import { carbonCreditsAgent } from './carbonCreditsAgent.js';
import { staffAgent } from './staffAgent.js';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { getGeminiLLM } from '../../utils/llm.js';
import DataCenter from '../../models/DataCenter.js';

/**
 * Master Orchestrator - Coordinates all agents and produces unified report
 * @param {string} datacenterName - Name of the datacenter
 * @param {string} period - Period in format "Q1 2025" or "2025-Q1"
 * @returns {Promise<Object>} Unified analysis report
 */
export const orchestrateAnalysis = async (datacenterName, period) => {
  try {
    console.log(`🎯 Orchestrating analysis for: ${datacenterName}, Period: ${period}`);

    // Normalize period format (convert "Q1 2025" to "2025-Q1" if needed)
    const normalizedPeriod = normalizePeriod(period);

    // Find datacenter
    const datacenter = await DataCenter.findOne({ name: datacenterName });
    if (!datacenter) {
      throw new Error(`Datacenter "${datacenterName}" not found`);
    }

    const facilityId = datacenter._id.toString();

    // Trigger all agents in parallel for efficiency
    console.log('🚀 Triggering specialized agents...');
    const [vendorsResult, carbonCreditsResult, staffResult] = await Promise.all([
      vendorAgent(datacenterName, facilityId, normalizedPeriod),
      carbonCreditsAgent(datacenterName, facilityId, normalizedPeriod),
      staffAgent(datacenterName, facilityId, normalizedPeriod),
    ]);

    console.log('✅ All agents completed, generating unified report...');

    // Generate unified summary using AI
    const unifiedReport = await generateUnifiedReport({
      vendors: vendorsResult,
      carbonCredits: carbonCreditsResult,
      staff: staffResult,
      datacenterName,
      period: normalizedPeriod,
    });

    return {
      success: true,
      datacenter: datacenterName,
      period: normalizedPeriod,
      vendors_summary: vendorsResult,
      carbon_credit_summary: carbonCreditsResult,
      staff_summary: staffResult,
      final_report: unifiedReport,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ Orchestration error:', error);
    throw new Error(`Orchestration failed: ${error.message}`);
  }
};

/**
 * Generate unified human-readable report from all agent outputs
 */
const generateUnifiedReport = async ({ vendors, carbonCredits, staff, datacenterName, period }) => {
  const llm = getGeminiLLM({ temperature: 0.2 });

  if (!llm) {
    // Fallback to manual report generation if LLM unavailable
    return generateManualReport({ vendors, carbonCredits, staff, datacenterName, period });
  }

  try {
    const prompt = ChatPromptTemplate.fromTemplate(`
You are an expert ESG compliance analyst. Generate a comprehensive, human-readable analysis report based on the following emissions data analysis.

**Context:**
- Datacenter: {datacenterName}
- Period: {period}

**Agent Results:**

1. **Vendor Analysis:**
{vendorsJson}

2. **Carbon Credits Analysis:**
{carbonCreditsJson}

3. **Staff Emissions Analysis:**
{staffJson}

**Instructions:**
Create a comprehensive report that includes:
1. **Executive Summary** - Brief overview of key findings
2. **Vendor Insights** - Summary of vendor emissions, anomalies, and trends
3. **Staff Emissions Evaluation** - Analysis of Scope 1 and Scope 2 emissions
4. **Carbon Credit Positioning** - Current status vs legal thresholds
5. **Risks & Recommendations** - Identified risks and actionable recommendations

Write in clear, professional business language. Be specific about anomalies, trends, and actionable insights.

Return ONLY the report text (no JSON, no code blocks, just the report).
`);

    const chain = prompt.pipe(llm).pipe(new StringOutputParser());
    const report = await chain.invoke({
      datacenterName,
      period,
      vendorsJson: JSON.stringify(vendors, null, 2),
      carbonCreditsJson: JSON.stringify(carbonCredits, null, 2),
      staffJson: JSON.stringify(staff, null, 2),
    });

    return report.trim();
  } catch (error) {
    console.error('AI report generation failed, using fallback:', error.message);
    return generateManualReport({ vendors, carbonCredits, staff, datacenterName, period });
  }
};

/**
 * Fallback manual report generation when AI is unavailable
 */
const generateManualReport = ({ vendors, carbonCredits, staff, datacenterName, period }) => {
  const vendorCount = vendors.vendors?.length || 0;
  const anomalyCount = vendors.vendors?.reduce((sum, v) => sum + (v.anomalies?.length || 0), 0) || 0;
  const totalScope3 = vendors.vendors?.reduce((sum, v) => {
    const current = parseFloat(v.scope3_comparison?.current_quarter) || 0;
    return sum + current;
  }, 0) || 0;

  return `
# Emissions Analysis Report
**Datacenter:** ${datacenterName}
**Period:** ${period}
**Generated:** ${new Date().toLocaleString()}

## Executive Summary
This report analyzes emissions data for ${datacenterName} during ${period}. The analysis covers vendor Scope 3 emissions, staff Scope 1 and Scope 2 emissions, and carbon credit positioning.

## Vendor Insights
- **Total Vendors Analyzed:** ${vendorCount}
- **Total Anomalies Detected:** ${anomalyCount}
- **Total Scope 3 Emissions:** ${totalScope3.toFixed(2)} tCO2e

${vendorCount > 0 ? vendors.vendors.map(v => `
### ${v.name || 'Unknown Vendor'}
- Current Quarter: ${v.scope3_comparison?.current_quarter || 'N/A'}
- Previous Quarter: ${v.scope3_comparison?.previous_quarter || 'N/A'}
- Anomalies: ${v.anomalies?.length || 0}
${v.anomalies?.map(a => `  - ${a.type}: ${a.reason}`).join('\n') || '  - None'}
`).join('\n') : 'No vendor data available.'}

## Staff Emissions Evaluation
- **Scope 1 Emissions:** ${staff.scope1?.total_co2e || 'N/A'} tCO2e
- **Scope 2 Emissions:** ${staff.scope2?.total_co2e || 'N/A'} tCO2e
- **Scope 1 Anomalies:** ${staff.scope1?.anomalies?.length || 0}
- **Scope 2 Anomalies:** ${staff.scope2?.anomalies?.length || 0}

## Carbon Credit Positioning
- **Country:** ${carbonCredits.carbon_credits?.country || 'N/A'}
- **Current Emissions:** ${carbonCredits.carbon_credits?.current_emission || 'N/A'}
- **Legal Threshold:** ${carbonCredits.carbon_credits?.latest_threshold || 'N/A'}
- **Credit Score:** ${carbonCredits.carbon_credits?.credit_score || 'N/A'}

## Risks & Recommendations
Based on the analysis:
1. Monitor vendors with detected anomalies closely
2. Review staff emissions patterns for unusual increases
3. Ensure compliance with carbon credit thresholds
4. Consider implementing corrective actions for identified anomalies

---
*Report generated automatically. For detailed analysis, review individual agent outputs.*
  `.trim();
};

/**
 * Normalize period format
 * Converts "Q1 2025" -> "2025-Q1" or keeps "2025-Q1" as-is
 */
const normalizePeriod = (period) => {
  if (!period) {
    // Default to current quarter
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const quarter = Math.ceil(month / 3);
    return `${year}-Q${quarter}`;
  }

  // Already in YYYY-QN format
  if (/^\d{4}-Q[1-4]$/.test(period)) {
    return period;
  }

  // Convert "Q1 2025" or "2025 Q1" format
  const match = period.match(/(?:Q([1-4])\s*(\d{4})|(\d{4})\s*Q([1-4]))/i);
  if (match) {
    const quarter = match[1] || match[4];
    const year = match[2] || match[3];
    return `${year}-Q${quarter}`;
  }

  // Try YYYY-MM format
  const monthMatch = period.match(/^(\d{4})-(\d{2})$/);
  if (monthMatch) {
    const year = parseInt(monthMatch[1], 10);
    const month = parseInt(monthMatch[2], 10);
    if (month >= 1 && month <= 12) {
      const quarter = Math.ceil(month / 3);
      return `${year}-Q${quarter}`;
    }
  }

  // Return as-is if can't parse
  console.warn(`Could not normalize period format: ${period}. Using as-is.`);
  return period;
};

