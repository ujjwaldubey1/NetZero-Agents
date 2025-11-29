# Postman Collection - Orchestrator Routes

## ✅ Updated Routes

The Postman collection has been enhanced with comprehensive orchestrator testing routes.

### Collection Variables Added

- `lastAnalysisPeriod` - Stores the last analyzed period (e.g., "2025-Q1")
- `lastAnalysisDatacenter` - Stores the last analyzed datacenter name

### AI Orchestrator Folder

Located in: **"AI Orchestrator - Emissions Analysis"** folder

#### 1. Orchestrator Status
- **Method:** `GET`
- **URL:** `/api/orchestrator/status`
- **Auth:** None required
- **Purpose:** Check if orchestrator service is operational
- **Enhanced Features:**
  - Displays LLM provider (Gemini/OpenAI)
  - Shows LLM configuration status
  - Lists all available agents
  - Provides helpful setup messages

#### 2. Analyze Emissions - Comprehensive Report
- **Method:** `POST`
- **URL:** `/api/orchestrator/analyze`
- **Auth:** Required (Bearer token)
- **Body:**
  ```json
  {
    "datacenterName": "{{datacenterId}}",
    "period": "Q1 2025"
  }
  ```
- **Enhanced Features:**
  - Pre-request script sets default datacenter
  - Comprehensive test script with detailed console output
  - Saves analysis results to collection variables
  - Detailed summary in console:
    - Datacenter and period
    - Vendor count and Scope 3 totals
    - Carbon credit status
    - Staff emissions (Scope 1 & 2)
    - Total anomalies detected
    - Final report preview

#### 3. Analyze Emissions - Current Quarter
- **Method:** `POST`
- **URL:** `/api/orchestrator/analyze`
- **Auth:** Required
- **Body:**
  ```json
  {
    "datacenterName": "India_northEast",
    "period": "2025-Q1"
  }
  ```
- **Purpose:** Example with explicit datacenter name

#### 4. Analyze Emissions - Previous Quarter Comparison
- **Method:** `POST`
- **URL:** `/api/orchestrator/analyze`
- **Auth:** Required
- **Body:**
  ```json
  {
    "datacenterName": "{{datacenterId}}",
    "period": "2024-Q4"
  }
  ```
- **Purpose:** Test quarter-over-quarter comparison

#### 5. Analyze Emissions - Test with Different Format
- **Method:** `POST`
- **URL:** `/api/orchestrator/analyze`
- **Auth:** Required
- **Body:**
  ```json
  {
    "datacenterName": "{{datacenterId}}",
    "period": "Q2 2025"
  }
  ```
- **Purpose:** Test period format conversion ("Q2 2025" → "2025-Q2")

## 🧪 Testing Workflow

### Step 1: Check Status
```
GET /api/orchestrator/status
```
- Verify service is operational
- Check if Gemini LLM is configured
- See available agents

### Step 2: Run Analysis
```
POST /api/orchestrator/analyze
{
  "datacenterName": "India_northEast",
  "period": "2025-Q1"
}
```
- Trigger comprehensive analysis
- View detailed console output
- Check response body for full report

### Step 3: Review Results
- Check console for summary
- Review response body for:
  - `vendors_summary` - Vendor analysis
  - `carbon_credit_summary` - Compliance analysis
  - `staff_summary` - Staff emissions
  - `final_report` - Human-readable report

## 📝 Console Output Features

The enhanced test scripts provide:

1. **Status Check:**
   - ✅/❌ Service status
   - LLM provider (Gemini/OpenAI)
   - Configuration status
   - Available agents

2. **Analysis Results:**
   - 📊 Summary table
   - 👥 Vendor statistics
   - 🌿 Carbon credit info
   - 👨‍💼 Staff emissions
   - ⚠️ Anomaly counts
   - 📄 Report preview

3. **Error Handling:**
   - Clear error messages
   - Status codes
   - Helpful troubleshooting info

## 🔧 Setup Requirements

1. **Environment Variables:**
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   # OR
   OPENAI_API_KEY=your_openai_key
   ```

2. **Collection Variables:**
   - `baseUrl` - API base URL (default: http://localhost:4000)
   - `token` - JWT authentication token
   - `datacenterId` - Datacenter name or ID

3. **Authentication:**
   - Get token from `/api/auth/login` or `/api/auth/register`
   - Set in collection variable: `token`

## 💡 Tips

- Use "Orchestrator Status" first to verify setup
- Check console output for detailed information
- Collection variables are auto-populated after analysis
- Use different period formats to test flexibility
- Review the final_report for human-readable summary

## 📚 Related Documentation

- `ORCHESTRATOR_GUIDE.md` - Complete orchestrator guide
- `GEMINI_SETUP.md` - Gemini LLM configuration
- `GEMINI_MIGRATION_SUMMARY.md` - Migration details

