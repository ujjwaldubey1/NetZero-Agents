# Gemini LLM Configuration Guide

The orchestrator system uses **Google Gemini** as the LLM provider, configured to work as an OpenAI-compatible model.

## Configuration

### Environment Variables

Add these to your `server/.env` file:

```env
# Gemini API Configuration (Primary)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-pro

# Optional: Custom base URL for OpenAI-compatible endpoint
GEMINI_BASE_URL=https://your-custom-endpoint.com/v1/openai

# Fallback: If GEMINI_API_KEY not set, OPENAI_API_KEY will be used
OPENAI_API_KEY=your_api_key_here
```

### Getting a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key and add it to your `.env` file

### Available Models

- `gemini-1.5-pro` (default) - Best for complex analysis
- `gemini-1.5-flash` - Faster, good for simple tasks
- `gemini-pro` - Legacy model

## How It Works

The system uses Gemini's OpenAI-compatible endpoint:
- Base URL: `https://generativelanguage.googleapis.com/v1beta/openai`
- API key is passed as a query parameter: `?key=YOUR_API_KEY`
- Works seamlessly with LangChain's `ChatOpenAI` class

## Usage in Code

All agents automatically use Gemini via the utility:

```javascript
import { getGeminiLLM } from '../utils/llm.js';

const llm = getGeminiLLM({ temperature: 0.2 });
// Use llm with LangChain chains...
```

## Fallback Behavior

- If `GEMINI_API_KEY` is not set, falls back to `OPENAI_API_KEY`
- If no API key is available, the system will:
  - Log a warning
  - Return `null` for LLM instance
  - Use manual/fallback report generation

## Testing

After setting up your API key, test the orchestrator:

```bash
# Check orchestrator status
GET /api/orchestrator/status

# Run analysis (should use Gemini)
POST /api/orchestrator/analyze
```

## Troubleshooting

1. **"LLM disabled" messages:**
   - Check that `GEMINI_API_KEY` is set in `.env`
   - Verify the API key is valid
   - Restart the server after adding the key

2. **Connection errors:**
   - Check your internet connection
   - Verify Gemini API service status
   - Try using a custom base URL if needed

3. **Rate limiting:**
   - Gemini free tier has rate limits
   - Consider upgrading or using `gemini-1.5-flash` for faster responses

