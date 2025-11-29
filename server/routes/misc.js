import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatOpenAI } from '@langchain/openai';

const router = express.Router();
const getLlm = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('OPENAI_API_KEY missing; meme captions disabled');
    return {
      invoke: async () => 'Caption generation disabled',
      pipe: () => ({ invoke: async () => 'Caption generation disabled' }),
    };
  }
  const modelName = process.env.LLM_MODEL || 'gpt-4o-mini';
  return new ChatOpenAI({
    apiKey,
    model: modelName,
    temperature: 0.6,
    configuration: process.env.OPENAI_BASE ? { baseURL: process.env.OPENAI_BASE } : undefined,
  });
};
const parser = new StringOutputParser();

router.post('/ai/meme-caption', authRequired, async (req, res) => {
  try {
    const { theme } = req.body;
    const prompt = ChatPromptTemplate.fromTemplate('Create a short, playful Cardano sustainability meme caption about {theme}. Keep under 12 words.');
    const llm = getLlm();
    const chain = prompt.pipe(llm).pipe(parser);
    const caption = await chain.invoke({ theme: theme || 'net zero data centers' });
    res.json({ caption });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
