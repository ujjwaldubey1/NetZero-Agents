# DatacenterName Schema Field Fix ✅

## 🐛 Problem

Error: "Path 'datacenterName' is not in schema, strict mode is `true`, and upsert is `true`."

This error occurs because:
- The Certificate model schema uses **`dataCenterName`** (capital C)
- But the certificate minting service was using **`datacenterName`** (lowercase c)
- Mongoose strict mode rejects fields that don't match the schema exactly

## ✅ Root Cause

**Schema Definition** (`server/models/Certificate.js` line 7):
```javascript
dataCenterName: String,  // ✅ Capital 'C'
```

**Incorrect Usage** (`server/services/certificateMinting.service.js`):
```javascript
datacenterName: datacenter,  // ❌ Lowercase 'c'
```

## 🔧 Fix Applied

Updated `server/services/certificateMinting.service.js`:

1. **Line 161** - In `certificateData` object:
   - Changed `datacenterName: datacenter` → `dataCenterName: datacenter`

2. **Line 179** - In `findOneAndUpdate` query filter:
   - Changed `datacenterName: datacenter` → `dataCenterName: datacenter`

## 📋 Corrected Code

```javascript
const certificateData = {
  // ... other fields
  dataCenterName: datacenter, // ✅ Fixed: matches schema
  // ... other fields
};

const certificate = await Certificate.findOneAndUpdate(
  { 
    reportHash: reportHash,
    dataCenterName: datacenter, // ✅ Fixed: matches schema
    period: period,
  },
  certificateData,
  {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  }
);
```

## ✅ Field Name Convention

Throughout the codebase:
- **Schema fields**: `dataCenterName` (camelCase with capital C)
- **Function parameters**: `datacenterName` (lowercase c - this is fine, just variable names)
- **When saving to DB**: Must use `dataCenterName` to match schema

## 🔍 Other Files Status

Checked all other files:
- ✅ `server/routes/certificates.js` - Already uses `dataCenterName` correctly
- ✅ `server/models/Certificate.js` - Schema is correct
- ✅ All other files use `datacenterName` as variable names (which is fine)

---

**The error is now fixed!** Certificate minting will work correctly with the proper field name. ✅

