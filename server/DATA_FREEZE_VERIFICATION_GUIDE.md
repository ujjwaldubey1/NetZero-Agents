# Data Freeze Verification - Step-by-Step Guide

## Understanding the Error

When you see:
```json
{
  "error": "Invalid data",
  "message": "Request body must contain a \"data\" field"
}
```

This means you're sending the orchestrator response directly, but the verify endpoint expects a **wrapped format**.

## ✅ Correct Request Format

The verify endpoint expects:

```json
{
  "data": {
    // Your orchestrator result (without cryptographic_proofs)
  },
  "expectedHash": "your-report-hash-here"
}
```

## 🔍 The Problem

You're sending:
```json
{
  "success": true,
  "datacenter": "...",
  "vendors_summary": { ... },
  "cryptographic_proofs": { ... }
}
```

But the endpoint needs:
```json
{
  "data": {
    "success": true,
    "datacenter": "...",
    "vendors_summary": { ... }
  },
  "expectedHash": "ec313542..."
}
```

## 📝 Step-by-Step Solution

### Step 1: Get Your Orchestrator Response

Run:
```
POST /api/orchestrator/analyze
{
  "datacenterName": "india-northeast",
  "period": "2025-Q1"
}
```

You'll get a response like:
```json
{
  "success": true,
  "datacenter": "india-northeast",
  "period": "2025-Q1",
  "vendors_summary": { ... },
  "carbon_credit_summary": { ... },
  "staff_summary": { ... },
  "final_report": "...",
  "generatedAt": "...",
  "cryptographic_proofs": {
    "report_hash": "ec313542fb36bee93c239d378d2c74b6c8cc06471c0058e8cc83ebaa539c0322",
    "evidence_hashes": [ ... ],
    "evidence_merkle_root": "..."
  }
}
```

### Step 2: Prepare Verification Request

**Remove `cryptographic_proofs`** and **wrap the rest in `data`**:

```json
{
  "data": {
    "success": true,
    "datacenter": "india-northeast",
    "period": "2025-Q1",
    "vendors_summary": {
      "vendors": [
        {
          "name": "samsung",
          "email": "ujjwal+samsung@gmail.com",
          "scope3_comparison": {
            "previous_quarter": "No data available",
            "current_quarter": "0.00 tCO2e"
          },
          "anomalies": [
            {
              "type": "NO_BASELINE",
              "reason": "No historical data available for comparison. Baseline should be established for future analysis."
            }
          ],
          "status": "submitted",
          "attested": false
        }
      ],
      "summary": {
        "total_vendors": 1,
        "total_anomalies": 1,
        "total_scope3": 0
      }
    },
    "carbon_credit_summary": {
      "carbon_credits": {
        "country": "manipur",
        "latest_threshold": "50 tCO2e/year",
        "threshold_source": "Fallback estimate",
        "current_emission": "0.00 tCO2e",
        "annual_projection": "0.00 tCO2e/year",
        "credit_score": "COMPLIANT",
        "credit_requirement": "0 credits needed",
        "compliance_status": "COMPLIANT",
        "analysis": "Annual emissions projection (0.00 tCO2e) is below the threshold (50 tCO2e/year). No carbon credits required."
      }
    },
    "staff_summary": {
      "staff": {
        "scope1": {
          "total_co2e": 0,
          "comparison": {
            "previous_quarter": "No data available",
            "current_quarter": "0.00 tCO2e",
            "change": "N/A"
          },
          "anomalies": [
            {
              "type": "NO_BASELINE",
              "reason": "No historical data available for comparison. Baseline should be established for future analysis."
            }
          ],
          "data_breakdown": {
            "diesel_liters": 0,
            "diesel_co2_tons": 0,
            "refrigerant_kg": 0,
            "refrigerant_co2_tons": 0,
            "other_sources": {}
          }
        },
        "scope2": {
          "total_co2e": 0,
          "comparison": {
            "previous_quarter": "No data available",
            "current_quarter": "0.00 tCO2e",
            "change": "N/A"
          },
          "anomalies": [
            {
              "type": "NO_BASELINE",
              "reason": "No historical data available for comparison. Baseline should be established for future analysis."
            }
          ],
          "data_breakdown": {
            "electricity_kwh": 0,
            "electricity_co2_tons": 0,
            "grid_factor": "Not specified",
            "other_sources": {}
          }
        },
        "summary": {
          "total_scope1_co2e": 0,
          "total_scope2_co2e": 0,
          "total_scope1_anomalies": 1,
          "total_scope2_anomalies": 1,
          "combined_total": 0
        }
      }
    },
    "final_report": "# Emissions Analysis Report...",
    "generatedAt": "2025-11-29T18:23:09.499Z"
  },
  "expectedHash": "ec313542fb36bee93c239d378d2c74b6c8cc06471c0058e8cc83ebaa539c0322"
}
```

### Step 3: Send Verification Request

```
POST /api/data-freeze/verify-report
```

With the properly formatted body above.

## ⚠️ Important Notes

1. **DO NOT include `cryptographic_proofs`** in the `data` field - it's added after freezing
2. **DO include all other fields** from the orchestrator response
3. **Extract `report_hash`** from `cryptographic_proofs.report_hash` as `expectedHash`
4. **Use exact data** - any difference will cause verification to fail

## 🎯 Quick Checklist

- [ ] Remove `cryptographic_proofs` from orchestrator response
- [ ] Wrap remaining data in `data` field
- [ ] Extract `cryptographic_proofs.report_hash` as `expectedHash`
- [ ] Include all fields: success, datacenter, period, vendors_summary, carbon_credit_summary, staff_summary, final_report, generatedAt

## 💡 Example: Using Collection Variables

If you've run the orchestrator analysis, the hash is saved in `{{lastReportHash}}`:

```json
{
  "data": {
    // Your orchestrator data without cryptographic_proofs
  },
  "expectedHash": "{{lastReportHash}}"
}
```

## 🔧 Alternative: Automatically Extract

You can use this JavaScript in Postman's pre-request script to automatically prepare the data:

```javascript
// If you have the full orchestrator response saved
const orchestratorResponse = pm.collectionVariables.get('lastOrchestratorResponse');
if (orchestratorResponse) {
  const response = JSON.parse(orchestratorResponse);
  const { cryptographic_proofs, ...dataToVerify } = response;
  
  const requestBody = {
    data: dataToVerify,
    expectedHash: cryptographic_proofs.report_hash
  };
  
  pm.collectionVariables.set('verificationRequestBody', JSON.stringify(requestBody));
}
```

---

**The key issue:** You're sending the orchestrator response directly. You need to wrap it in a `data` field and extract the hash separately.

