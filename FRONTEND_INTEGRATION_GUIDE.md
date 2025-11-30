# Frontend Integration Guide - NetZero Platform

## 🎯 Goal

Connect the React frontend to the fully operational backend to create a unified emissions analysis experience.

---

## 📋 Backend Status

✅ **All systems operational:**
- Four-Pillar Architecture working
- Masumi blockchain integration (11 transactions)
- Cryptographic proofs generated
- IPFS ready
- File uploads working
- All API routes registered

---

## 🔌 API Integration Points

### 1. Orchestrator Analysis

**Endpoint:** `POST /api/orchestrator/analyze`

**Request:**
```javascript
const response = await fetch('http://localhost:4000/api/orchestrator/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    datacenterName: 'india-northeast',
    period: '2025-Q1'
  })
});

const data = await response.json();
```

**Response Structure:**
```javascript
{
  success: true,
  datacenter: "india-northeast",
  period: "2025-Q1",
  vendors_summary: {...},
  carbon_credit_summary: {...},
  staff_summary: {...},
  cryptographic_proofs: {
    report_hash: "...",
    evidence_hashes: [...],
    evidence_merkle_root: "..."
  },
  masumi_transactions: [...], // 11 transactions
  final_report: "...",
  generatedAt: "..."
}
```

---

### 2. Status Check

**Endpoint:** `GET /api/orchestrator/status`

```javascript
const status = await fetch('http://localhost:4000/api/orchestrator/status');
const data = await status.json();
// Returns: service status, LLM config, Masumi status, agent availability
```

---

### 3. Data Freeze Verification

**Endpoint:** `POST /api/data-freeze/verify-report`

```javascript
const verify = await fetch('http://localhost:4000/api/data-freeze/verify-report', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    data: {...}, // Report data without cryptographic_proofs
    expectedHash: "..." // From cryptographic_proofs.report_hash
  })
});
```

---

## 🎨 React Component Examples

### Example 1: OrchestratorAnalysis.jsx

```jsx
import React, { useState } from 'react';

const OrchestratorAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const runAnalysis = async (datacenterName, period) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/orchestrator/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ datacenterName, period })
      });

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading && <BootLoader />}
      {error && <ErrorMessage error={error} />}
      {result && (
        <>
          <ReportTable data={result} />
          <DashboardCards data={result} />
          <LedgerTimeline transactions={result.masumi_transactions} />
          <BlockchainVisualization proofs={result.cryptographic_proofs} />
        </>
      )}
    </div>
  );
};
```

---

### Example 2: ReportTable.jsx

```jsx
import React from 'react';

const ReportTable = ({ data }) => {
  return (
    <div>
      <h2>Vendors Summary</h2>
      <table>
        <thead>
          <tr>
            <th>Vendor</th>
            <th>Scope 3 (tCO2e)</th>
            <th>Anomalies</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.vendors_summary?.vendors?.map((vendor, idx) => (
            <tr key={idx}>
              <td>{vendor.name || vendor.email}</td>
              <td>{vendor.scope3_comparison?.current_quarter}</td>
              <td>{vendor.anomalies?.length || 0}</td>
              <td>{vendor.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

---

### Example 3: LedgerTimeline.jsx

```jsx
import React from 'react';

const LedgerTimeline = ({ transactions }) => {
  return (
    <div className="timeline">
      <h2>Masumi Blockchain Timeline</h2>
      {transactions?.map((tx, idx) => (
        <div key={idx} className="timeline-item">
          <div className="timestamp">{new Date(tx.timestamp).toLocaleString()}</div>
          <div className="event-type">{tx.type}</div>
          <div className="agent">{tx.agentId}</div>
          <div className="tx-id">{tx.txId}</div>
          {tx.amount && <div className="amount">{tx.amount} tokens</div>}
        </div>
      ))}
    </div>
  );
};
```

---

### Example 4: BlockchainVisualization.jsx

```jsx
import React from 'react';

const BlockchainVisualization = ({ proofs }) => {
  return (
    <div className="blockchain-viz">
      <h2>Cryptographic Proofs</h2>
      
      <div className="hash-display">
        <label>Report Hash:</label>
        <code>{proofs?.report_hash}</code>
      </div>
      
      <div className="merkle-root">
        <label>Merkle Root:</label>
        <code>{proofs?.evidence_merkle_root}</code>
      </div>
      
      <div className="evidence-count">
        <label>Evidence Items:</label>
        <span>{proofs?.evidence_hashes?.length || 0}</span>
      </div>
      
      {/* Merkle Tree Visualization */}
      <MerkleTreeView hashes={proofs?.evidence_hashes} />
    </div>
  );
};
```

---

## 🔄 Data Flow Example

```javascript
// 1. User triggers analysis
const handleAnalyze = async () => {
  // 2. Call orchestrator API
  const result = await fetch('/api/orchestrator/analyze', {
    method: 'POST',
    body: JSON.stringify({
      datacenterName: selectedDatacenter,
      period: selectedPeriod
    })
  }).then(r => r.json());

  // 3. Extract UI-ready data
  const uiData = {
    vendors: result.vendors_summary.vendors,
    carbonCredits: result.carbon_credit_summary,
    staff: result.staff_summary,
    proofs: result.cryptographic_proofs,
    transactions: result.masumi_transactions,
    report: result.final_report
  };

  // 4. Update state for React components
  setAnalysisResult(uiData);
  
  // 5. Components automatically re-render
  // - ReportTable shows vendors
  // - DashboardCards shows summaries
  // - LedgerTimeline shows transactions
  // - BlockchainVisualization shows proofs
};
```

---

## 📊 UI Payload Structure

### Charts Data
```javascript
const chartsData = {
  emissions_by_scope: {
    scope1: result.staff_summary.staff.scope1.total_co2e,
    scope2: result.staff_summary.staff.scope2.total_co2e,
    scope3: result.vendors_summary.summary.total_scope3
  },
  vendor_comparison: result.vendors_summary.vendors.map(v => ({
    name: v.name,
    current: parseFloat(v.scope3_comparison.current_quarter) || 0,
    previous: parseFloat(v.scope3_comparison.previous_quarter) || 0
  })),
  anomaly_timeline: [...]
};
```

### Timeline Data
```javascript
const timelineData = result.masumi_transactions.map(tx => ({
  timestamp: tx.timestamp,
  event: tx.type,
  agent: tx.agentId,
  txId: tx.txId,
  amount: tx.amount,
  action: tx.action
}));
```

---

## 🎨 Component Mapping

| Backend Data | Frontend Component | Display |
|-------------|-------------------|---------|
| `vendors_summary` | `ReportTable.jsx` | Vendor list table |
| `carbon_credit_summary` | `DashboardCards.jsx` | Compliance card |
| `staff_summary` | `ReportTable.jsx` | Staff emissions table |
| `cryptographic_proofs` | `BlockchainVisualization.jsx` | Hash display + Merkle tree |
| `masumi_transactions` | `LedgerTimeline.jsx` | Transaction timeline |
| `final_report` | `ReportViewer.jsx` | Formatted report |
| `ui_payload.charts` | Chart components | Graphs and visualizations |

---

## ✅ Integration Checklist

### API Integration
- [ ] Create API service layer (`services/api.js`)
- [ ] Add authentication token management
- [ ] Handle API errors gracefully
- [ ] Add loading states

### Components
- [ ] ReportTable.jsx - Display emissions data
- [ ] DashboardCards.jsx - Summary cards
- [ ] LedgerTimeline.jsx - Blockchain timeline
- [ ] BlockchainVisualization.jsx - Merkle tree
- [ ] UploadForm.jsx - File uploads
- [ ] ReportViewer.jsx - Final report
- [ ] ExportMenu.jsx - Download options

### Features
- [ ] Connect to orchestrator API
- [ ] Display analysis results
- [ ] Show Masumi transactions
- [ ] Render cryptographic proofs
- [ ] Implement charts/graphs
- [ ] Add export functionality
- [ ] Error handling
- [ ] Loading states

---

## 🚀 Quick Start

1. **Install dependencies:**
```bash
cd client
npm install axios react-chartjs-2
```

2. **Create API service:**
```javascript
// client/src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const analyzeEmissions = (datacenterName, period) => {
  return api.post('/orchestrator/analyze', { datacenterName, period });
};

export default api;
```

3. **Use in components:**
```javascript
import { analyzeEmissions } from '../services/api';

// In your component
const result = await analyzeEmissions('india-northeast', '2025-Q1');
```

---

**Ready to connect your React frontend to the fully operational backend!** 🚀

