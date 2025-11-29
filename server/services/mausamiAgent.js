import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatOpenAI } from '@langchain/openai';

const decisionPrompt = ChatPromptTemplate.fromTemplate(`
You are the LangChain-based carbon operations agent for the Mausami network (Cardano CIP-68 carbon tokens).
Given report context, decide whether to proceed with minting and propose a network fee.
Return strictly JSON with keys: decision ("proceed" or "hold"), feeAda (number, 0.05-2.0), note (short explanation).

Context:
- Org DID: {orgDid}
- Data center: {dataCenterName}
- Scope totals (tCO2e): scope1={scope1}, scope2={scope2}, scope3={scope3}
- Report hash: {reportHash}
- Certificate ref: {certificateRef}
`);

export const mausamiMintRecommendation = async (payload) => {
  const {
    orgDid,
    dataCenterName,
    scopeTotals = {},
    reportHash,
    certificateRef,
  } = payload;

  const fallback = {
    decision: 'proceed',
    feeAda: Number(process.env.MAUSAMI_FEE_ADA || 0.25),
    note: 'LLM unavailable; using default fee.',
  };

  if (!process.env.OPENAI_API_KEY) return fallback;

  try {
    const model = new ChatOpenAI({
      model: process.env.LANGCHAIN_MODEL || 'gpt-4o-mini',
      temperature: 0.2,
    });
    const chain = decisionPrompt.pipe(model).pipe(new StringOutputParser());
    const response = await chain.invoke({
      orgDid,
      dataCenterName,
      scope1: scopeTotals.scope1 || 0,
      scope2: scopeTotals.scope2 || 0,
      scope3: scopeTotals.scope3 || 0,
      reportHash,
      certificateRef,
    });
    const parsed = JSON.parse(response);
    return {
      decision: parsed.decision || fallback.decision,
      feeAda: Number(parsed.feeAda || fallback.feeAda),
      note: parsed.note || fallback.note,
    };
  } catch (err) {
    console.warn('Mausami LangChain recommendation failed', err.message);
    return fallback;
  }
};
