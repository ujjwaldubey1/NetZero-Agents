# Why Do We Need `expectedHash`?

## 🔐 The Purpose of Hash Verification

Hash verification works like a **digital fingerprint** for your data:

1. **Original Freeze**: When data is first frozen, a SHA-256 hash is computed → this becomes the **"expected hash"**
2. **Later Verification**: When you want to verify data integrity, you:
   - Re-compute the hash of the data you have → this is the **"computed hash"**
   - Compare it with the **"expected hash"** (from the original freeze)
   - If they match → ✅ Data is unchanged (no tampering)
   - If they don't match → ❌ Data has been modified

## 🎯 Why We Need Both Hashes

You provide `expectedHash` because:

1. **It's the Baseline**: It's the "truth" - the hash from when data was originally frozen
2. **It's Stored Separately**: The hash is stored in `cryptographic_proofs`, not in the data itself
3. **It Enables Verification**: Without it, we can't compare and verify integrity

## 📍 Where to Get `expectedHash`

### From Orchestrator Response

When you run the orchestrator analysis, you get:

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
    "report_hash": "ec313542fb36bee93c239d378d2c74b6c8cc06471c0058e8cc83ebaa539c0322",  ← THIS IS YOUR expectedHash
    "evidence_hashes": [ ... ],
    "evidence_merkle_root": "..."
  }
}
```

**Extract**: `cryptographic_proofs.report_hash` → this is your `expectedHash`

## ✅ Your Current Situation

Looking at your response:

```json
{
  "computedHash": "ec313542fb36bee93c239d378d2c74b6c8cc06471c0058e8cc83ebaa539c0322",
  "expectedHash": "...",  ← This is wrong! You used "..." as placeholder
  "hashesMatch": false
}
```

**Good News**: Your `computedHash` matches the hash from your original orchestrator response! This means:
- ✅ Your data structure is correct
- ✅ Your data matches the original frozen data
- ❌ You just need to use the **actual hash** instead of "..."

## 🔧 How to Fix

### Step 1: Get the Hash from Your Orchestrator Response

From your original orchestrator response, copy this value:

```json
"cryptographic_proofs": {
  "report_hash": "ec313542fb36bee93c239d378d2c74b6c8cc06471c0058e8cc83ebaa539c0322"
}
```

### Step 2: Use It in Your Verification Request

```json
{
  "data": {
    "success": true,
    "datacenter": "india-northeast",
    // ... rest of your data
  },
  "expectedHash": "ec313542fb36bee93c239d378d2c74b6c8cc06471c0058e8cc83ebaa539c0322"  ← Use the actual hash
}
```

### Step 3: Verification Should Pass

Since your `computedHash` already matches this hash, verification will succeed!

## 🎯 Real-World Analogy

Think of it like a **seal on a document**:

- **Original Seal** (expectedHash): The official seal that was placed when the document was created
- **Current Seal** (computedHash): The seal you compute from the document you have now
- **Verification**: Compare the two seals - if they match, the document is authentic

## 💡 Why Not Store It Automatically?

You might wonder: "Why can't the system remember the hash automatically?"

**Answer**: This is **by design** for security:
- The hash is stored separately (in cryptographic_proofs or database)
- You verify **against the stored hash** to detect any tampering
- Even if someone modifies the data, they can't modify the stored hash (if stored securely)
- This provides **tamper-proof verification**

## 📝 Summary

1. **expectedHash** = The original hash from when data was frozen
2. **computedHash** = The hash you compute from current data
3. **Purpose** = Compare them to verify data integrity
4. **Get it from** = `cryptographic_proofs.report_hash` in orchestrator response
5. **Your situation** = Use the actual hash value, not "..."

**Your data is correct!** Just use the real hash value: `ec313542fb36bee93c239d378d2c74b6c8cc06471c0058e8cc83ebaa539c0322`

