# Quick Start: Viewing Test Results in Postman

## ✅ The Test Results Tab WILL Appear After You Run a Request

### Step 1: Open a Request
1. In Postman, open your collection: **"NetZero Agents API"**
2. Navigate to: **"AI Orchestrator - Emissions Analysis"** folder
3. Click on: **"Analyze Emissions - Comprehensive Report"** (or any request with tests)

### Step 2: Run the Request
1. Click the **"Send"** button (blue button in top-right)
2. Wait for the response (this may take a few seconds)

### Step 3: Find Test Results Tab
**After the request completes**, look at the **bottom panel** below the response:

```
┌─────────────────────────────────────────────┐
│  Response Area                              │
│  ┌───────────────────────────────────────┐ │
│  │ [Body] [Headers] [Test Results] [Console] │
│  └───────────────────────────────────────┘ │
│                                             │
│  Click "Test Results" tab here! ←───        │
└─────────────────────────────────────────────┘
```

### Step 4: View Test Results

Click on the **"Test Results"** tab. You should see:

```
✅ Pillar 1 - Vendors summary exists
✅ Pillar 1 - Carbon credits summary exists  
✅ Pillar 1 - Staff summary exists
✅ Pillar 2 - Cryptographic proofs exist
✅ Pillar 2 - Report hash is valid SHA-256
✅ Pillar 2 - Merkle root is valid SHA-256
✅ Pillar 3 - Masumi transactions array exists
✅ Pillar 4 - Final report exists and is substantial
```

## 🎯 Quick Checklist

- [ ] Request has been **sent** (clicked "Send" button)
- [ ] Response has **loaded** (waiting for server response)
- [ ] Looking at the **bottom panel** (below response)
- [ ] Clicked on **"Test Results"** tab (next to Body/Headers/Console)

## 📍 Where Exactly?

```
Postman Window Layout:

┌──────────────────────────────────────────────┐
│  [Request URL]              [Send Button]   │  ← Top
├──────────────────────────────────────────────┤
│                                               │
│          Request/Response Area                │
│                                               │
├──────────────────────────────────────────────┤
│  [Body] [Headers] [Test Results] [Console]   │  ← Bottom Panel
│                                               │
│  ← Click "Test Results" tab here!            │
└──────────────────────────────────────────────┘
```

## 💡 Important Notes

1. **Test Results tab only appears AFTER running a request**
   - You must click "Send" first
   - Wait for the response to load

2. **All requests in the collection now have tests**
   - "Analyze Emissions - Comprehensive Report" has 8 tests
   - "Freeze Data and Generate Proofs" has 3 tests
   - "Verify Report Hash" has 3 tests
   - "Orchestrator Status" has 3 tests

3. **Console tab shows detailed logs**
   - Check Console tab for detailed verification output
   - Shows pillar-by-pillar breakdown

## 🐛 If You Still Don't See It

1. **Check Postman version**: Update to latest version
2. **Try a different request**: "Orchestrator Status" (simpler, faster)
3. **Check Console tab**: Tests might be running but tab not visible
4. **Look for errors**: Red X marks indicate failed tests

## 📊 Example: What You Should See

### In Test Results Tab:
```
✅ Response status is 200
✅ Pillar 1 - Vendors summary exists
✅ Pillar 1 - Carbon credits summary exists
✅ Pillar 1 - Staff summary exists
✅ Pillar 2 - Cryptographic proofs exist
✅ Pillar 2 - Report hash is valid SHA-256
✅ Pillar 2 - Merkle root is valid SHA-256
✅ Pillar 3 - Masumi transactions array exists
✅ Pillar 4 - Final report exists and is substantial

8 passed, 0 failed
```

### In Console Tab:
```
✅ Analysis completed successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Analysis Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
...
🏗️  FOUR-PILLAR ARCHITECTURE VERIFICATION
...
```

---

**Still having issues?** Make sure:
- ✅ You've clicked "Send" on a request
- ✅ The response has finished loading
- ✅ You're looking at the bottom panel tabs
- ✅ You've clicked the "Test Results" tab specifically

