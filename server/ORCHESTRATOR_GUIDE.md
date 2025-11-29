# AI Data Extraction and Analysis Orchestrator

## Overview

The Orchestrator is a master AI system that coordinates multiple specialized agents to produce comprehensive emissions analysis reports. It triggers Vendor Agent, Carbon Credits Agent, and Staff Agent in parallel, then combines their outputs into a unified, human-readable report.

## Architecture

```
Master Orchestrator
├── Vendor Agent (Scope 3)
├── Carbon Credits Agent
└── Staff Agent
    ├── Scope 1 Agent
    └── Scope 2 Agent
```

## API Endpoints

### 1. Status Check
**GET** `/api/orchestrator/status`

Check if the orchestrator service is operational.

**Response:**
```json
{
  "success": true,
  "service": "AI Data Extraction and Analysis Orchestrator",
  "status": "operational",
  "llm_configured": true,
  "agents": {
    "vendor_agent": "available",
    "carbon_credits_agent": "available",
    "staff_agent": "available",
    "scope1_agent": "available",
    "scope2_agent": "available"
  }
}
```

### 2. Analyze Emissions
**POST** `/api/orchestrator/analyze`

**Headers:**
- `Authorization: Bearer <token>` (required)

**Body:**
```json
{
  "datacenterName": "India_northEast",
  "period": "Q1 2025"
}
```

**Response:**
```json
{
  "success": true,
  "datacenter": "India_northEast",
  "period": "2025-Q1",
  "vendors_summary": {
    "vendors": [
      {
        "name": "Vendor Name",
        "email": "vendor@example.com",
        "scope3_comparison": {
          "previous_quarter": "120.50 tCO2e",
          "current_quarter": "145.30 tCO2e"
        },
        "anomalies": [
          {
            "type": "MODERATE_INCREASE",
            "reason": "Emissions increased by 20.58% compared to previous quarter. Monitor for trends."
          }
        ],
        "status": "submitted",
        "attested": false
      }
    ],
    "summary": {
      "total_vendors": 1,
      "total_anomalies": 1,
      "total_scope3": 145.30
    }
  },
  "carbon_credit_summary": {
    "carbon_credits": {
      "country": "India",
      "latest_threshold": "50.0 tCO2e/year",
      "current_emission": "580.20 tCO2e",
      "annual_projection": "2320.80 tCO2e/year",
      "credit_score": "NON-COMPLIANT (4641.6% of threshold)",
      "credit_requirement": "2271 carbon credits needed",
      "compliance_status": "NON-COMPLIANT",
      "analysis": "..."
    }
  },
  "staff_summary": {
    "staff": {
      "scope1": {
        "total_co2e": 45.5,
        "comparison": {
          "previous_quarter": "42.30 tCO2e",
          "current_quarter": "45.50 tCO2e",
          "change": "7.57%"
        },
        "anomalies": [],
        "data_breakdown": { ... }
      },
      "scope2": {
        "total_co2e": 234.8,
        "comparison": {
          "previous_quarter": "220.10 tCO2e",
          "current_quarter": "234.80 tCO2e",
          "change": "6.68%"
        },
        "anomalies": [
          {
            "type": "MODERATE_INCREASE",
            "reason": "Emissions increased by 6.68% compared to previous quarter. Monitor for trends."
          }
        ],
        "data_breakdown": { ... }
      },
      "summary": {
        "total_scope1_co2e": 45.5,
        "total_scope2_co2e": 234.8,
        "total_scope1_anomalies": 0,
        "total_scope2_anomalies": 1,
        "combined_total": 280.3
      }
    }
  },
  "final_report": "Comprehensive human-readable analysis report...",
  "generatedAt": "2025-01-27T12:00:00.000Z"
}
```

## Agent Logic

### Vendor Agent
- Identifies all vendors related to the datacenter
- For each vendor:
  - Accesses Scope 3 emissions data
  - Compares current quarter vs previous quarter
  - Detects anomalies using statistical methods
  - Tags anomalies with detailed reasons

### Carbon Credits Agent
- Determines datacenter country
- Looks up latest carbon credit threshold (using AI or fallback)
- Compares current emissions vs threshold
- Calculates credit score and requirements
- Provides compliance analysis

### Staff Agent
- Uses Scope1Agent and Scope2Agent sub-agents
- Each sub-agent follows same logic as Vendor Agent:
  - Compare current vs previous quarter
  - Detect anomalies
  - Tag with reasons

### Anomaly Detection

The system detects several types of anomalies:

1. **SIGNIFICANT_INCREASE** - >50% increase from previous quarter
2. **MODERATE_INCREASE** - 25-50% increase
3. **SIGNIFICANT_DECREASE** - >50% decrease (may indicate errors)
4. **STATISTICAL_ANOMALY** - >2 standard deviations from historical mean
5. **NO_BASELINE** - No historical data for comparison
6. **ZERO_OR_NEGATIVE** - Invalid data values
7. **MISSING_DATA** - Current period data missing

## Usage Examples

### cURL

```bash
# Status check
curl http://localhost:4000/api/orchestrator/status

# Analyze emissions
curl -X POST http://localhost:4000/api/orchestrator/analyze \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "datacenterName": "India_northEast",
    "period": "Q1 2025"
  }'
```

### JavaScript

```javascript
const response = await fetch('http://localhost:4000/api/orchestrator/analyze', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    datacenterName: 'India_northEast',
    period: 'Q1 2025',
  }),
});

const result = await response.json();
console.log(result.final_report);
```

## Configuration

Set environment variables:

```env
# Gemini API (Primary)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-pro

# Optional: Custom Gemini endpoint
GEMINI_BASE_URL=https://your-custom-endpoint.com/v1/openai

# Fallback: OpenAI API (optional)
OPENAI_API_KEY=your_openai_api_key_here
```

**Note:** The system uses **Google Gemini** as the LLM provider by default, configured as an OpenAI-compatible model. See `GEMINI_SETUP.md` for detailed configuration instructions.

## Error Handling

The orchestrator includes comprehensive error handling:

- **Missing Data**: Gracefully handles missing reports or vendor data
- **LLM Failures**: Falls back to manual report generation
- **Validation**: Validates inputs before processing
- **Audit Logging**: All operations are logged to AuditLog

## Performance

- Agents run in parallel for efficiency
- Cached datacenter lookups
- Optimized database queries
- Typical analysis time: 2-5 seconds

## Integration

The orchestrator integrates with:

- `Report` model - Staff emissions data
- `VendorScope` model - Vendor Scope 3 data
- `DataCenter` model - Datacenter information
- `AuditLog` model - Operation logging
- LangChain/Gemini - AI-powered analysis (using Gemini as OpenAI-compatible model)

## Next Steps

1. Test with sample data
2. Customize anomaly detection thresholds
3. Add more carbon credit threshold sources
4. Enhance AI prompts for better analysis
5. Add caching for frequently accessed data

