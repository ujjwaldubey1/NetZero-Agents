/**
 * Carbon Credits Agent
 * Analyzes carbon credit thresholds and calculates credit requirements
 */

import DataCenter from '../../models/DataCenter.js';
import Report from '../../models/Report.js';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { getGeminiLLM } from '../../utils/llm.js';

/**
 * Carbon Credits Agent - Analyzes carbon credit thresholds and requirements
 * @param {string} datacenterName - Name of the datacenter
 * @param {string} facilityId - Facility/Datacenter ID
 * @param {string} period - Period in format "2025-Q1"
 * @returns {Promise<Object>} Carbon credits analysis JSON
 */
export const carbonCreditsAgent = async (datacenterName, facilityId, period) => {
  try {
    console.log(`🌿 Carbon Credits Agent: Analyzing thresholds for ${datacenterName}, Period: ${period}`);

    // Get datacenter information to determine country
    const datacenter = await DataCenter.findById(facilityId);
    if (!datacenter) {
      throw new Error(`Datacenter not found: ${facilityId}`);
    }

    // Extract country from location (basic parsing)
    const location = datacenter.location || '';
    const country = extractCountry(location, datacenterName);

    // Get current period emissions
    const currentReport = await Report.findOne({
      facilityId: facilityId.toString(),
      period: period,
    });

    const currentEmission = currentReport ? currentReport.totalCO2e || 0 : 0;

    // Lookup latest carbon credit threshold for the country
    const thresholdInfo = await lookupCarbonCreditThreshold(country);

    // Calculate credit score/requirement
    const creditAnalysis = calculateCreditScore(currentEmission, thresholdInfo.threshold);

    return {
      carbon_credits: {
        country: country,
        latest_threshold: thresholdInfo.threshold 
          ? `${thresholdInfo.threshold} tCO2e/year` 
          : 'Not available',
        threshold_source: thresholdInfo.source || 'Estimated',
        current_emission: `${currentEmission.toFixed(2)} tCO2e`,
        annual_projection: `${(currentEmission * 4).toFixed(2)} tCO2e/year`, // Quarterly * 4
        credit_score: creditAnalysis.score,
        credit_requirement: creditAnalysis.requirement,
        compliance_status: creditAnalysis.status,
        analysis: creditAnalysis.analysis,
      },
    };
  } catch (error) {
    console.error('❌ Carbon Credits Agent error:', error);
    throw new Error(`Carbon Credits Agent failed: ${error.message}`);
  }
};

/**
 * Extract country from location string
 */
const extractCountry = (location, datacenterName) => {
  // Try to extract country from location
  if (location) {
    // Common patterns
    const patterns = [
      /,\s*([A-Z][a-z]+(?: [A-Z][a-z]+)*)$/, // "City, Country"
      /^([A-Z][a-z]+(?: [A-Z][a-z]+)*),/,     // "Country, Region"
    ];

    for (const pattern of patterns) {
      const match = location.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    // If location is a single word/country name
    const parts = location.split(/[,\s]+/);
    if (parts.length === 1 && parts[0].length > 2) {
      return parts[0];
    }
  }

  // Try to extract from datacenter name (e.g., "India_northEast" -> "India")
  if (datacenterName) {
    const nameParts = datacenterName.split(/[_\s-]+/);
    if (nameParts.length > 0) {
      const firstPart = nameParts[0];
      if (firstPart.length > 2 && /^[A-Z]/.test(firstPart)) {
        return firstPart;
      }
    }
  }

  // Default fallback
  return 'Unknown';
};

/**
 * Lookup carbon credit threshold for a country using AI or fallback
 */
const lookupCarbonCreditThreshold = async (country) => {
  // Fallback thresholds (example values - should be updated with real data)
  const fallbackThresholds = {
    'India': 50.0, // tCO2e/year example
    'United States': 100.0,
    'China': 80.0,
    'Germany': 30.0,
    'United Kingdom': 25.0,
    'Canada': 60.0,
    'Australia': 70.0,
    'Brazil': 40.0,
    'France': 28.0,
    'Japan': 45.0,
  };

  const llm = getGeminiLLM({ temperature: 0.1 });
  
  if (!llm) {
    const threshold = fallbackThresholds[country] || 50.0; // Default
    return {
      threshold,
      source: 'Fallback estimate',
    };
  }

  try {
    const prompt = ChatPromptTemplate.fromTemplate(`
You are an ESG compliance expert. Research the latest carbon credit threshold or legal emission limit for data centers in {country}.

Return ONLY a JSON object with this exact format:
{{
  "threshold": <number in tCO2e per year>,
  "source": "<brief source description>",
  "year": <year of regulation>
}}

If you cannot find specific data, use reasonable estimates based on similar countries. Be conservative in estimates.
`);

    const chain = prompt.pipe(llm).pipe(new StringOutputParser());
    const response = await chain.invoke({ country });
    
    try {
      const parsed = JSON.parse(response);
      return {
        threshold: parsed.threshold || fallbackThresholds[country] || 50.0,
        source: parsed.source || 'AI research',
        year: parsed.year || new Date().getFullYear(),
      };
    } catch (parseError) {
      console.warn('Failed to parse LLM response, using fallback');
      const threshold = fallbackThresholds[country] || 50.0;
      return {
        threshold,
        source: 'Fallback estimate',
      };
    }
  } catch (error) {
    console.warn('LLM lookup failed, using fallback:', error.message);
    const threshold = fallbackThresholds[country] || 50.0;
    return {
      threshold,
      source: 'Fallback estimate',
    };
  }
};

/**
 * Calculate carbon credit score and requirements
 */
const calculateCreditScore = (currentEmission, threshold) => {
  if (!threshold || threshold <= 0) {
    return {
      score: 'N/A',
      requirement: 'N/A',
      status: 'UNKNOWN',
      analysis: 'Threshold data not available. Cannot determine compliance status.',
    };
  }

  const annualProjection = currentEmission * 4; // Quarterly * 4
  const excess = annualProjection - threshold;
  const percentage = ((annualProjection / threshold) * 100).toFixed(1);

  let score, requirement, status, analysis;

  if (annualProjection <= threshold) {
    score = 'COMPLIANT';
    requirement = '0 credits needed';
    status = 'COMPLIANT';
    analysis = `Annual emissions projection (${annualProjection.toFixed(2)} tCO2e) is below the threshold (${threshold} tCO2e/year). No carbon credits required.`;
  } else {
    const creditsNeeded = Math.ceil(excess);
    score = `NON-COMPLIANT (${percentage}% of threshold)`;
    requirement = `${creditsNeeded} carbon credits needed`;
    status = 'NON-COMPLIANT';
    analysis = `Annual emissions projection (${annualProjection.toFixed(2)} tCO2e) exceeds the threshold (${threshold} tCO2e/year) by ${excess.toFixed(2)} tCO2e. Approximately ${creditsNeeded} carbon credits required to achieve compliance.`;
  }

  return {
    score,
    requirement,
    status,
    analysis,
  };
};

