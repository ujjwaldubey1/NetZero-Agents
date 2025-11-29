# Quick Start Guide - Frontend Integration ✅

## 🎉 Integration Complete!

Your NetZero orchestrator is now fully integrated with the React frontend!

---

## 🚀 Quick Start

### 1. Start Backend
```bash
cd server
npm start
```
Backend should run on `http://localhost:4000`

### 2. Start Frontend
```bash
cd client
npm run dev
```
Frontend should run on `http://localhost:5173` (Vite default)

### 3. Access the Orchestrator
1. Open browser: `http://localhost:5173`
2. Login as operator/admin
3. Navigate to: **`/operator/orchestrator`**

---

## 🎯 Using the Orchestrator

### Step 1: Select Datacenter & Period
- Choose a datacenter from dropdown
- Select period (e.g., "2025-Q1")

### Step 2: Run Analysis
- Click **"Run Analysis"** button
- Wait ~10-30 seconds for analysis

### Step 3: View Results
- **Dashboard Cards**: Emissions totals
- **Cryptographic Proofs**: Report hash, Merkle root
- **IPFS Links**: View stored reports
- **Masumi Timeline**: Blockchain transactions
- **Vendors Table**: Analysis results
- **Final Report**: Human-readable summary

### Step 4: Export (Optional)
- Click **"Export JSON"** to download complete analysis

---

## 📋 What You'll See

### ✅ Status Card
- LLM provider (Gemini/OpenAI)
- Masumi blockchain status
- Service availability

### ✅ Analysis Results
- **Emissions by Scope**: Scope 1, 2, 3 totals
- **Cryptographic Proofs**: 
  - Report hash (SHA-256)
  - Merkle root
  - Evidence count
- **IPFS Storage**: Links to stored reports
- **Blockchain Timeline**: All Masumi transactions
- **Vendor Analysis**: 
  - Current vs previous quarter
  - Anomalies detected
  - Status indicators
- **Final Report**: Complete analysis summary

---

## 🔧 Troubleshooting

### Issue: Can't access page
- ✅ Make sure you're logged in as operator/admin
- ✅ Check route: `/operator/orchestrator`
- ✅ Verify backend is running

### Issue: Analysis fails
- ✅ Check backend is running on port 4000
- ✅ Verify `GEMINI_API_KEY` in backend `.env`
- ✅ Check browser console for errors

### Issue: No datacenters in dropdown
- ✅ Ensure datacenters exist in database
- ✅ Check `/api/datacenters` endpoint works
- ✅ Verify authentication token

### Issue: Masumi transactions not showing
- ✅ Check `MASUMI_ENABLED=true` in backend `.env`
- ✅ Verify Masumi API URL is configured

---

## 📁 Files Created

### New Components:
- `client/src/pages/operator/OrchestratorAnalysisPage.jsx` - Main orchestrator page
- `client/src/components/VendorAnalysisTable.jsx` - Vendor analysis table

### Updated Files:
- `client/src/api.js` - Added orchestrator API functions
- `client/src/App.jsx` - Added route

---

## 🎨 Features

✅ **Complete Integration**
- All four pillars visible
- Real-time analysis
- Blockchain transactions
- Cryptographic proofs
- IPFS storage links

✅ **User-Friendly UI**
- Loading states
- Error handling
- Status indicators
- Export functionality

✅ **Production Ready**
- Protected routes
- Authentication
- Error boundaries
- Responsive design

---

## 📚 Documentation

See `FRONTEND_INTEGRATION_COMPLETE.md` for detailed documentation.

---

**Your NetZero platform is now fully integrated!** 🚀

Start analyzing emissions with your AI-powered orchestrator!

