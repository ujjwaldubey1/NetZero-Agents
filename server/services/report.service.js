import Report from '../models/Report.js';
import EmissionRecord from '../models/EmissionRecord.js';
import { computeTotals } from '../utils/emissionFactors.js';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatOpenAI } from '@langchain/openai';

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
 * Get or create current report for a period
 * @param {Object} params - Report parameters
 * @param {string} params.ownerId - Report owner ID
 * @param {string} params.period - Report period (e.g., "2025-Q4")
 * @returns {Promise<Object>} - Report object
 */
export const getOrCreateCurrentReport = async ({ ownerId, period }) => {
  const records = await EmissionRecord.find({ ownerId, period });
  const scopeTotals = computeTotals(records);
  
  let report = await Report.findOne({ ownerId, period });
  
  if (!report) {
    report = new Report({
      ownerId,
      period,
      scopeTotals,
      details: { records },
      status: 'draft',
    });
  } else {
    report.scopeTotals = scopeTotals;
    report.details = { records };
    report.updatedAt = new Date();
  }
  
  await report.save();
  return report;
};

/**
 * Freeze a report
 * @param {Object} params - Freeze parameters
 * @param {string} params.reportId - Report ID
 * @param {string} params.ownerId - Owner ID for verification
 * @returns {Promise<Object>} - Frozen report
 */
export const freezeReport = async ({ reportId, ownerId }) => {
  const report = await Report.findOne({ _id: reportId, ownerId });
  if (!report) {
    throw new Error('Report not found');
  }
  
  report.status = 'frozen';
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
  
  const narrative = await chain.invoke({
    details: JSON.stringify(report.scopeTotals),
  });
  
  report.aiNarrative = narrative;
  await report.save();
  
  return narrative;
};

/**
 * Get all reports for an owner
 * @param {string} ownerId - Owner ID
 * @returns {Promise<Array>} - Array of reports
 */
export const getReportsByOwner = async (ownerId) => {
  return await Report.find({ ownerId }).sort({ createdAt: -1 });
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
    query.ownerId = ownerId;
  }
  const report = await Report.findOne(query);
  if (!report) {
    throw new Error('Report not found');
  }
  return report;
};

