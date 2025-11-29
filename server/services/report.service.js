import Report from '../models/Report.js';
import EmissionRecord from '../models/EmissionRecord.js';
import DataCenter from '../models/DataCenter.js';
import { computeTotals } from '../utils/emissionFactors.js';
import { hashReport, hashData } from '../services/hashing.service.js';
import { calculateMerkleRoot } from '../utils/merkle.js';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatOpenAI } from '@langchain/openai';
import crypto from 'crypto';

const getLlm = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('OPENAI_API_KEY missing; narrative generation disabled');
    return {
      invoke: async () => 'LLM disabled',
      pipe: () => ({ invoke: async () => 'LLM disabled' }),
    };
  }
  const modelName = process.env.LLM_MODEL || 'gpt-4o-mini';
  return new ChatOpenAI({
    apiKey,
    model: modelName,
    temperature: 0.2,
    configuration: process.env.OPENAI_BASE ? { baseURL: process.env.OPENAI_BASE } : undefined,
  });
};

/**
 * Get facility ID from owner ID
 * @param {string} ownerId - Owner/User ID
 * @returns {Promise<string>} - Facility ID
 */
const getFacilityIdFromOwner = async (ownerId) => {
  // Try to find a data center owned by this user
  const dataCenter = await DataCenter.findOne({ ownerId }).sort({ createdAt: -1 });
  if (dataCenter) {
    return dataCenter._id.toString();
  }
  // Fallback: use ownerId as facilityId (for backward compatibility)
  return ownerId.toString();
};

/**
 * Calculate total CO2e from scope totals
 * @param {Object} scopeTotals - Scope totals object
 * @returns {number} - Total CO2e in tons
 */
const calculateTotalCO2e = (scopeTotals) => {
  let total = 0;
  
  // Helper to extract CO2e values from a scope object
  const extractCO2e = (scopeObj) => {
    if (!scopeObj || typeof scopeObj !== 'object') return 0;
    let sum = 0;
    Object.entries(scopeObj).forEach(([key, value]) => {
      // Look for CO2/CO2e related keys
      const keyLower = key.toLowerCase();
      if (
        (keyLower.includes('co2') || keyLower.includes('co2e') || keyLower.includes('emission')) &&
        typeof value === 'number' &&
        !isNaN(value)
      ) {
        sum += Math.abs(value); // Use absolute value
      }
    });
    return sum;
  };
  
  // Extract CO2e from each scope
  total += extractCO2e(scopeTotals.scope1);
  total += extractCO2e(scopeTotals.scope2);
  total += extractCO2e(scopeTotals.scope3);
  
  // If still no CO2e found, sum all numeric values as fallback
  // This handles cases where data might not have explicit CO2 labels
  if (total === 0) {
    const sumAllNumeric = (obj) => {
      if (!obj || typeof obj !== 'object') return 0;
      return Object.values(obj).reduce((sum, val) => {
        const numVal = Number(val);
        return sum + (typeof numVal === 'number' && !isNaN(numVal) ? Math.abs(numVal) : 0);
      }, 0);
    };
    
    total = sumAllNumeric(scopeTotals.scope1) + 
            sumAllNumeric(scopeTotals.scope2) + 
            sumAllNumeric(scopeTotals.scope3);
  }
  
  // Ensure we return at least 0
  return Math.max(0, total);
};

/**
 * Generate report hash from report data
 * @param {Object} reportData - Report data object
 * @returns {string} - SHA-256 hash (64 hex characters)
 */
const generateReportHash = (reportData) => {
  const canonical = JSON.stringify(reportData, Object.keys(reportData).sort());
  return crypto.createHash('sha256').update(canonical).digest('hex');
};

/**
 * Generate merkle root from emission records
 * @param {Array} records - Array of emission records
 * @returns {string} - Merkle root hash (64 hex characters)
 */
const generateMerkleRootFromRecords = (records) => {
  if (!records || records.length === 0) {
    // Return a default hash if no records
    return crypto.createHash('sha256').update('empty').digest('hex');
  }
  
  // Convert Mongoose documents to plain objects and stringify
  const data = records.map((record) => {
    const recordObj = record.toObject ? record.toObject() : record;
    // Remove MongoDB internal fields for consistent hashing
    delete recordObj._id;
    delete recordObj.__v;
    return JSON.stringify(recordObj, Object.keys(recordObj).sort());
  });
  
  // Use the merkle utility to calculate root
  const merkleRoot = calculateMerkleRoot(data);
  
  // Fallback if calculateMerkleRoot returns null
  if (!merkleRoot) {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
  }
  
  return merkleRoot;
};

/**
 * Get or create current report for a period
 * @param {Object} params - Report parameters
 * @param {string} params.ownerId - Report owner ID
 * @param {string} params.period - Report period (e.g., "2025-Q4")
 * @returns {Promise<Object>} - Report object
 */
export const getOrCreateCurrentReport = async ({ ownerId, period }) => {
  const records = await EmissionRecord.find({ ownerId, period });
  const scopeTotals = computeTotals(records);
  
  // Get facility ID from owner
  const facilityId = await getFacilityIdFromOwner(ownerId);
  
  // Convert scopeTotals to individual scope objects
  const scope1 = scopeTotals.scope1 || {};
  const scope2 = scopeTotals.scope2 || {};
  const scope3 = scopeTotals.scope3 || {};
  
  // Calculate total CO2e
  const totalCO2e = calculateTotalCO2e(scopeTotals);
  
  // Prepare report data for hashing
  const reportData = {
    facilityId,
    period,
    scope1,
    scope2,
    scope3,
    totalCO2e,
  };
  
  // Generate report hash
  const reportHash = generateReportHash(reportData);
  
  // Generate merkle root from records
  const merkleRoot = generateMerkleRootFromRecords(records);
  
  // Try to find existing report by facilityId and period
  let report = await Report.findOne({ facilityId, period });
  
  if (!report) {
    // Create new report with new model structure
    report = new Report({
      facilityId,
      period,
      scope1,
      scope2,
      scope3,
      totalCO2e,
      reportHash,
      merkleRoot,
      status: 'pending',
    });
  } else {
    // Update existing report
    report.scope1 = scope1;
    report.scope2 = scope2;
    report.scope3 = scope3;
    report.totalCO2e = totalCO2e;
    report.reportHash = generateReportHash(reportData);
    report.merkleRoot = generateMerkleRootFromRecords(records);
    report.updatedAt = new Date();
  }
  
  await report.save();
  return report;
};

/**
 * Freeze a report (maps to validated status in new model)
 * @param {Object} params - Freeze parameters
 * @param {string} params.reportId - Report ID
 * @param {string} params.ownerId - Owner ID for verification
 * @returns {Promise<Object>} - Frozen report
 */
export const freezeReport = async ({ reportId, ownerId }) => {
  // Get facility ID from owner for query
  const facilityId = await getFacilityIdFromOwner(ownerId);
  
  const report = await Report.findOne({ _id: reportId, facilityId });
  if (!report) {
    throw new Error('Report not found');
  }
  
  // Map 'frozen' status to 'validated' in new model
  report.status = 'validated';
  report.updatedAt = new Date();
  await report.save();
  
  return report;
};

/**
 * Generate AI narrative for a report
 * @param {Object} params - Narrative parameters
 * @param {string} params.reportId - Report ID
 * @returns {Promise<string>} - Generated narrative
 */
export const generateReportNarrative = async ({ reportId }) => {
  const report = await Report.findById(reportId);
  if (!report) {
    throw new Error('Report not found');
  }
  
  const prompt = ChatPromptTemplate.fromTemplate(
    'Create a concise narrative for an ESG emissions report. Details: {details}'
  );
  const parser = new StringOutputParser();
  const llm = getLlm();
  const chain = prompt.pipe(llm).pipe(parser);
  
  // Use new model structure for narrative generation
  const reportData = {
    scope1: report.scope1,
    scope2: report.scope2,
    scope3: report.scope3,
    totalCO2e: report.totalCO2e,
  };
  
  const narrative = await chain.invoke({
    details: JSON.stringify(reportData),
  });
  
  // Store narrative in a way compatible with new model
  // Note: New model doesn't have aiNarrative field, so we might need to add it
  // For now, we'll just return it
  return narrative;
};

/**
 * Get all reports for an owner
 * @param {string} ownerId - Owner ID
 * @returns {Promise<Array>} - Array of reports
 */
export const getReportsByOwner = async (ownerId) => {
  const facilityId = await getFacilityIdFromOwner(ownerId);
  return await Report.find({ facilityId }).sort({ createdAt: -1 });
};

/**
 * Get report by ID
 * @param {string} reportId - Report ID
 * @param {string} ownerId - Optional owner ID for verification
 * @returns {Promise<Object>} - Report object
 */
export const getReportById = async (reportId, ownerId = null) => {
  const query = { _id: reportId };
  if (ownerId) {
    const facilityId = await getFacilityIdFromOwner(ownerId);
    query.facilityId = facilityId;
  }
  const report = await Report.findOne(query);
  if (!report) {
    throw new Error('Report not found');
  }
  return report;
};
