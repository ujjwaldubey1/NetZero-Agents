# Masumi Integration Debugging Guide

## Issue: Empty `masumi_transactions` Array

If your orchestrator response shows `"masumi_transactions": []` even though `MASUMI_ENABLED=true`, follow these steps:

## ✅ Fix Applied

I've updated the Masumi service to check environment variables **at runtime** instead of caching them at module load time. This ensures the environment variables are properly loaded before checking.

## 🔍 Debugging Steps

### Step 1: Verify Environment Variable

Check your `.env` file in the `server` directory:

```env
MASUMI_ENABLED=true
MASUMI_API_URL=https://api.masumi.network/v1
MASUMI_NETWORK_ID=masumi-testnet
MASUMI_MASTER_WALLET=your_wallet_address
```

**Important:**
- The value must be the **exact string** `"true"` (not `True`, `TRUE`, `1`, etc.)
- No extra spaces around the `=`
- Restart your server after changing `.env` file

### Step 2: Check Server Logs

After running an analysis, check your server console logs. You should see:

```
🌐 [PILLAR 3] Masumi blockchain integration: ENABLED
   API URL: https://api.masumi.network/v1
   Network: masumi-testnet
   Registering master orchestrator...
   Registration result: { registered: true, txId: 'masumi_...' }
   ✅ Master orchestrator registered (TX: masumi_...)
```

If you see `DISABLED` instead, the environment variable isn't being loaded correctly.

### Step 3: Check Status Endpoint

Call the status endpoint to see Masumi configuration:

```bash
GET /api/orchestrator/status
```

Look for the `masumi_blockchain` section:

```json
{
  "masumi_blockchain": {
    "enabled": true,  // Should be true
    "api_url": "https://api.masumi.network/v1",
    "network": "masumi-testnet"
  }
}
```

### Step 4: Check Console Logs During Analysis

During analysis, look for these log messages:

**If Masumi is enabled:**
```
🌐 [PILLAR 3] Masumi blockchain integration: ENABLED
✅ [Masumi] Agent identity registered: master_orchestrator (TX: masumi_...)
📝 [Masumi] Decision logged: vendor_agent -> analysis_completed (TX: masumi_...)
💰 [Masumi] Payment scheduled: vendor_agent - 1 tokens (TX: masumi_...)
```

**If Masumi is disabled:**
```
🌐 [PILLAR 3] Masumi blockchain integration: DISABLED
   ℹ️  Masumi is disabled. Set MASUMI_ENABLED=true in .env to enable.
```

## 🐛 Common Issues

### Issue 1: Environment Variable Not Loading

**Symptom:** Status shows `enabled: false` even though `.env` has `MASUMI_ENABLED=true`

**Solution:**
1. Make sure `.env` file is in the `server` directory
2. Check that `dotenv` is configured in `server/index.js`:
   ```javascript
   import dotenv from 'dotenv';
   dotenv.config({ path: './server/.env' });
   ```
3. Restart your server completely

### Issue 2: Wrong Variable Name

**Symptom:** Variable not recognized

**Solution:**
- Use exact name: `MASUMI_ENABLED` (all caps, underscore)
- Value must be: `true` (lowercase, no quotes in .env file)

### Issue 3: Cached Configuration

**Symptom:** Changes to `.env` not taking effect

**Solution:**
1. Stop the server completely
2. Wait a few seconds
3. Start the server again
4. The fix I applied checks variables at runtime, so no caching issues

## 📊 Expected Transaction Count

When Masumi is enabled, you should see **7-10 transactions** in the array:

1. **1x Agent Registration** - Master orchestrator
2. **3x Decision Logs** - One per agent (vendor, carbon, staff)
3. **3x Payments** - One per agent
4. **1x Final Decision Log** - Orchestration complete
5. **1x Final Payment** - Master orchestrator payment

## 🔧 Manual Test

You can test Masumi status directly:

```javascript
// In Node.js console or test script
import { isMasumiEnabled } from './services/masumi.service.js';
console.log('Masumi Enabled:', isMasumiEnabled());
console.log('Env Var:', process.env.MASUMI_ENABLED);
```

## ✅ After Fix

After applying the fix, you should see:

1. **Console logs** showing Masumi is ENABLED
2. **Transaction IDs** in the response
3. **7-10 transactions** in `masumi_transactions` array

## 📝 Note

The Masumi service currently **simulates** blockchain transactions (generates transaction IDs but doesn't call a real API). This is expected behavior for development. In production, you would configure the actual Masumi API endpoint.

---

**If you're still seeing empty transactions after these steps, check the server console logs for error messages!**

