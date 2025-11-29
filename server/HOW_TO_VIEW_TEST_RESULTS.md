# How to View Test Results in Postman

## 📍 Where to Find Test Results

In Postman, the **Test Results** tab appears **after you run a request** that has test scripts. Here's how to see it:

### Step-by-Step Guide

1. **Open Your Request**

   - Navigate to the request (e.g., "Analyze Emissions - Comprehensive Report")
   - Click on it to open

2. **Run the Request**

   - Click the **"Send"** button
   - Wait for the response

3. **View Test Results**
   - After the request completes, look at the **bottom panel** below the response
   - You'll see tabs: **Body**, **Headers**, **Test Results**, **Console**
   - Click on the **"Test Results"** tab

### Visual Guide

```
┌─────────────────────────────────────────────────┐
│  POST /api/orchestrator/analyze                 │
│  [Send Button]                                  │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│  Response (200 OK)                              │
│  ┌─────────────────────────────────────────┐   │
│  │ [Body] [Headers] [Test Results] [Console]│   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  Test Results Tab shows:                        │
│  ✅ Pillar 1 - Vendors summary exists           │
│  ✅ Pillar 1 - Carbon credits summary exists    │
│  ✅ Pillar 2 - Cryptographic proofs exist       │
│  ✅ Pillar 2 - Report hash is valid SHA-256     │
│  ...                                            │
└─────────────────────────────────────────────────┘
```

## 🔍 Alternative: Check Console Tab

If you don't see Test Results immediately:

1. **Click the "Console" tab** (next to Test Results)
2. Look for test execution logs
3. Check for any error messages

## ✅ What You Should See

After running the "Analyze Emissions - Comprehensive Report" request, you should see:

### In Test Results Tab:

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

### In Console Tab:

You'll see detailed logs like:

```
✅ Analysis completed successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Analysis Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
...
🏗️  FOUR-PILLAR ARCHITECTURE VERIFICATION
...
```

## 🐛 Troubleshooting

### Issue: No Test Results Tab Appears

**Possible causes:**

1. Request hasn't been run yet
2. Test scripts are missing
3. Postman version issue

**Solution:**

- Make sure you've clicked "Send" on the request
- Check that the request has test scripts in the "Tests" tab
- Update Postman to the latest version

### Issue: Tests Show as Failed

**Check:**

- Response status code (should be 200)
- Response structure matches expected format
- Console tab for error messages

### Issue: Empty Test Results

**Check:**

- The request has completed successfully
- Test scripts are properly formatted
- Look at Console tab for execution logs

## 📝 Quick Test

To verify tests are working:

1. **Open**: "Analyze Emissions - Comprehensive Report"
2. **Click**: "Send"
3. **Wait**: For response (may take a few seconds)
4. **Check**: Bottom panel tabs
5. **Click**: "Test Results" tab
6. **Verify**: You see green checkmarks (✅) for each test

## 💡 Pro Tips

1. **Test Results show after execution** - You must run the request first
2. **Console shows all logs** - Use this for debugging
3. **Save responses** - Click "Save Response" to keep a copy
4. **Export collection** - Your tests are saved in the collection

## 🎯 Expected Test Count

For the "Analyze Emissions - Comprehensive Report" request, you should see **8 automated tests**:

1. Pillar 1 - Vendors summary exists
2. Pillar 1 - Carbon credits summary exists
3. Pillar 1 - Staff summary exists
4. Pillar 2 - Cryptographic proofs exist
5. Pillar 2 - Report hash is valid SHA-256
6. Pillar 2 - Merkle root is valid SHA-256
7. Pillar 3 - Masumi transactions array exists
8. Pillar 4 - Final report exists and is substantial

---

**Note:** If you still don't see the Test Results tab, try:

- Running the request again
- Checking the Console tab for errors
- Verifying your Postman version is up to date
