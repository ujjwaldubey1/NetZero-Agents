import fs from 'fs';
import pdf from 'pdf-parse';
import xlsx from 'xlsx';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatOpenAI } from '@langchain/openai';
import EmissionRecord from '../models/EmissionRecord.js';
import { computeCo2e } from '../utils/emissionFactors.js';
import EmissionThreshold from '../models/EmissionThreshold.js';

const getLlm = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('OPENAI_API_KEY missing; using no-op LLM');
    return {
      invoke: async () => '{"summary":"LLM disabled","anomalies":[]}',
      pipe: () => ({ invoke: async () => '{"summary":"LLM disabled","anomalies":[]}' }),
    };
  }
  const modelName = process.env.LLM_MODEL || 'gpt-4o-mini';
  return new ChatOpenAI({
    apiKey,
    model: modelName,
    temperature: 0.1,
    configuration: process.env.OPENAI_BASE ? { baseURL: process.env.OPENAI_BASE } : undefined,
  });
};

const extractionPrompt = ChatPromptTemplate.fromTemplate(
  `You are an ESG compliance expert. Parse the provided text data and extract emissions into JSON.
Return JSON only with keys scope1, scope2, scope3.
Example schema (write valid JSON): 
scope1: diesel_liters, diesel_co2_tons, refrigerant_kg, refrigerant_co2_tons
scope2: electricity_kwh, electricity_co2_tons
scope3: upstream_co2_tons
Keep numbers only.`
);

const summaryPrompt = ChatPromptTemplate.fromTemplate(`You are analyzing emissions trends. Given current data and optional prior context, produce a short summary and list anomalies.
Current JSON: {current}
Prior JSON: {previous}
Respond with JSON: {"summary":"...","anomalies":["..."]}`);

const parser = new StringOutputParser();

const parseSpreadsheet = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  return rows.map((r) => r.join(',')).join('\n');
};

export const extractEmissions = async ({ filePath, mimeType, scope, period, ownerId, dataCenterId, dataCenterName, folderRef, sectionRef }) => {
  let text = '';
  const buffer = fs.readFileSync(filePath);
  if (mimeType.includes('pdf')) {
    const data = await pdf(buffer);
    text = data.text;
  } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet') || mimeType.includes('sheet')) {
    text = parseSpreadsheet(filePath);
  } else if (mimeType.includes('csv') || filePath.endsWith('.csv')) {
    text = buffer.toString('utf-8');
  } else {
    text = buffer.toString('utf-8');
  }

  const llm = getLlm();
  const extractionChain = extractionPrompt.pipe(llm).pipe(parser);
  let structured;
  try {
    const raw = await extractionChain.invoke({ input: text });
    structured = JSON.parse(raw);
  } catch (err) {
    structured = { scope1: {}, scope2: {}, scope3: {}, error: 'LLM parse failed, please adjust input' };
  }

  // Coerce numeric and add derived CO2e
  ['scope1', 'scope2', 'scope3'].forEach((key) => {
    structured[key] = structured[key] || {};
    Object.entries(structured[key]).forEach(([k, v]) => {
      structured[key][k] = Number(v) || 0;
    });
    structured[key] = { ...structured[key], ...computeCo2e(structured[key]) };
  });

  const previousRecords = await EmissionRecord.find({ ownerId, period: { $ne: period } }).sort({ createdAt: -1 }).limit(3);
  const previousData = previousRecords.map((r) => r.extractedData);
  const summaryChain = summaryPrompt.pipe(llm).pipe(parser);
  let summary = 'No summary generated';
  let anomalies = [];
  try {
    const raw = await summaryChain.invoke({ current: JSON.stringify(structured), previous: JSON.stringify(previousData) });
    const parsed = JSON.parse(raw);
    summary = parsed.summary || summary;
    anomalies = parsed.anomalies || [];
  } catch (err) {
    summary = 'AI summary unavailable.';
  }

  const thresholds = await EmissionThreshold.find({});
  const thresholdMap = Object.fromEntries(thresholds.map((t) => [t.key, t.value]));
  Object.entries(structured || {}).forEach(([scopeKey, values]) => {
    Object.entries(values || {}).forEach(([k, v]) => {
      if (thresholdMap[k] && Number(v) > thresholdMap[k]) {
        anomalies.push(`${scopeKey}.${k} exceeds threshold ${thresholdMap[k]}`);
      }
    });
  });

  const record = new EmissionRecord({
    ownerType: scope === 3 ? 'vendor' : 'operator',
    ownerId,
    scope,
    dataCenterId,
    dataCenterName,
    folderRef,
    sectionRef,
    rawFilePath: filePath,
    extractedData: structured,
    aiSummary: summary,
    aiAnomalies: anomalies,
    period,
  });
  await record.save();

  return { structured, summary, anomalies, recordId: record._id };
};
