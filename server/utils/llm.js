/**
 * LLM Utility - Gemini as OpenAI-compatible model
 * Provides unified LLM interface using Gemini API with OpenAI-compatible endpoint
 */

import { ChatOpenAI } from '@langchain/openai';

/**
 * Get Gemini LLM instance configured as OpenAI-compatible
 * @param {Object} options - LLM options
 * @param {number} [options.temperature=0.2] - Temperature for generation
 * @param {string} [options.model] - Model name override
 * @returns {ChatOpenAI|null} Gemini LLM instance or null if not configured
 */
export const getGeminiLLM = ({ temperature = 0.2, model = null } = {}) => {
  // Check for Gemini API key (primary)
  const geminiApiKey = process.env.GEMINI_API_KEY;
  
  // Fallback to OPENAI_API_KEY if GEMINI_API_KEY not set (for backward compatibility)
  const apiKey = geminiApiKey || process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.warn('GEMINI_API_KEY or OPENAI_API_KEY missing; LLM disabled');
    return null;
  }

  // Gemini model names - default to gemini-1.5-pro
  // Common models: gemini-1.5-pro, gemini-1.5-flash, gemini-pro
  const modelName = model || process.env.GEMINI_MODEL || process.env.LLM_MODEL || 'gemini-1.5-pro';
  
  // Check if custom base URL is provided (for OpenAI-compatible endpoints)
  const customBaseURL = process.env.GEMINI_BASE_URL || process.env.OPENAI_BASE;
  
  // If custom base URL is provided, use it (assumes OpenAI-compatible format)
  if (customBaseURL) {
    try {
      return new ChatOpenAI({
        apiKey: apiKey,
        model: modelName,
        temperature: temperature,
        configuration: {
          baseURL: customBaseURL,
        },
      });
    } catch (error) {
      console.error('Failed to initialize Gemini LLM with custom base URL:', error.message);
      return null;
    }
  }
  
  // Default: Use Gemini OpenAI-compatible endpoint
  // Format: https://generativelanguage.googleapis.com/v1beta/openai?key=API_KEY
  const geminiBaseURL = `https://generativelanguage.googleapis.com/v1beta/openai?key=${apiKey}`;
  
  try {
    return new ChatOpenAI({
      apiKey: apiKey, // LangChain requires this, but Gemini uses query param
      model: modelName,
      temperature: temperature,
      configuration: {
        baseURL: geminiBaseURL,
      },
    });
  } catch (error) {
    console.error('Failed to initialize Gemini LLM:', error.message);
    return null;
  }
};

/**
 * Get LLM instance (alias for getGeminiLLM for backward compatibility)
 * @param {Object} options - LLM options
 * @returns {ChatOpenAI|null} LLM instance
 */
export const getLlm = (options = {}) => {
  return getGeminiLLM(options);
};

