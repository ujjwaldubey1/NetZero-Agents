import express from 'express';
import Report from '../models/Report.js';
import EmissionRecord from '../models/EmissionRecord.js';
import LedgerEvent from '../models/LedgerEvent.js';
import { authRequired, roleRequired } from '../middleware/auth.js';
import { computeTotals } from '../utils/emissionFactors.js';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatOpenAI } from '@langchain/openai';

const router = express.Router();
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

router.get('/current', authRequired, roleRequired('operator'), async (req, res) => {
  const { period } = req.query;
  const records = await EmissionRecord.find({ ownerId: req.user.id, period });
  const scopeTotals = computeTotals(records);
  let report = await Report.findOne({ ownerId: req.user.id, period });
  if (!report) {
    report = new Report({ ownerId: req.user.id, period, scopeTotals, details: { records }, status: 'draft' });
  } else {
    report.scopeTotals = scopeTotals;
    report.details = { records };
    report.updatedAt = new Date();
  }
  await report.save();
  res.json(report);
});

router.post('/freeze', authRequired, roleRequired('operator'), async (req, res) => {
  const { period } = req.body;
  const report = await Report.findOne({ ownerId: req.user.id, period });
  if (!report) return res.status(404).json({ error: 'Report not found' });
  report.status = 'frozen';
  report.updatedAt = new Date();
  await report.save();
  await LedgerEvent.create({ type: 'REPORT_FROZEN', reportId: report._id, detail: `Report frozen ${period}` });
  res.json(report);
});

router.post('/generate-narrative', authRequired, roleRequired('operator'), async (req, res) => {
  const { reportId } = req.body;
  const report = await Report.findById(reportId);
  if (!report) return res.status(404).json({ error: 'Report not found' });
  const prompt = ChatPromptTemplate.fromTemplate('Create a concise narrative for an ESG emissions report. Details: {details}');
  const parser = new StringOutputParser();
  const llm = getLlm();
  const chain = prompt.pipe(llm).pipe(parser);
  const narrative = await chain.invoke({ details: JSON.stringify(report.scopeTotals) });
  report.aiNarrative = narrative;
  await report.save();
  res.json({ narrative });
});

router.get('/', authRequired, roleRequired('operator'), async (req, res) => {
  const reports = await Report.find({ ownerId: req.user.id }).sort({ createdAt: -1 });
  res.json(reports);
});

export default router;
