# Postman Routes - Quick Reference

**Base URL:** `http://localhost:4000`

## 📋 Quick Start

1. **Import Collection:** Import `NetZero_Agents.postman_collection.json` into Postman
2. **Start Server:** Run `npm run dev` in the `server/` directory
3. **Set Base URL:** Collection variable `baseUrl` is set to `http://localhost:4000`

---

## 🔐 Step 1: Authentication (Get Token)

### Register User
```
POST /api/auth/register
Body:
{
  "email": "operator@demo.com",
  "password": "password123",
  "role": "operator",
  "organizationName": "Demo Organization"
}
```

### Login (Save Token!)
```
POST /api/auth/login
Body:
{
  "email": "operator@demo.com",
  "password": "password123"
}

Response: { "token": "...", "user": {...} }
```
**⚠️ Save the token! It's auto-saved in Postman collection variables.**

---

## 📊 Step 2: Test Report Model (NEW)

### Create Report
```
POST /api/reports/create
Headers:
  Authorization: Bearer YOUR_TOKEN
Body:
{
  "facilityId": "facility-001",
  "period": "2024-Q4",
  "scope1": {
    "diesel_liters": 1000,
    "diesel_co2_tons": 2.68
  },
  "scope2": {
    "electricity_kwh": 5000,
    "electricity_co2_tons": 2.0
  },
  "scope3": {
    "upstream_co2_tons": 5.0
  },
  "totalCO2e": 9.68,
  "reportHash": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2",
  "merkleRoot": "1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3",
  "status": "pending"
}
```

### Get All Reports
```
GET /api/reports
Headers:
  Authorization: Bearer YOUR_TOKEN
```

### Get Report by ID
```
GET /api/reports/{reportId}
Headers:
  Authorization: Bearer YOUR_TOKEN
```

---

## 👥 Step 3: Test VendorScope Model (NEW)

### Create Vendor Scope
```
POST /api/vendor-scope/create
Headers:
  Authorization: Bearer YOUR_TOKEN
Body:
{
  "vendorEmail": "vendor@demo.com",
  "facilityId": "facility-001",
  "period": "2024-Q4",
  "data": {
    "scope3": {
      "upstream_co2_tons": 3.5,
      "transport_co2_tons": 1.2
    }
  }
}
```

### Get All Vendor Scopes
```
GET /api/vendor-scope
Headers:
  Authorization: Bearer YOUR_TOKEN

Query Params (optional):
  ?facilityId=facility-001
  ?period=2024-Q4
  ?status=pending
  ?vendorEmail=vendor@demo.com
```

### Submit Report (Add IPFS Link)
```
PUT /api/vendor-scope/{id}/submit
Headers:
  Authorization: Bearer YOUR_TOKEN
Body:
{
  "ipfsCid": "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
  "filename": "scope3-report-2024-Q4.pdf"
}
```

### Vendor Attest
```
PUT /api/vendor-scope/{id}/attest
Headers:
  Authorization: Bearer YOUR_TOKEN
```

### Admin Approve
```
PUT /api/vendor-scope/{id}/approve
Headers:
  Authorization: Bearer YOUR_TOKEN
Body:
{
  "comments": "Looks good, approved!"
}
```

### Admin Reject
```
PUT /api/vendor-scope/{id}/reject
Headers:
  Authorization: Bearer YOUR_TOKEN
Body:
{
  "comments": "Please revise the scope 3 data."
}
```

### Get Timeline
```
GET /api/vendor-scope/{id}/timeline
Headers:
  Authorization: Bearer YOUR_TOKEN
```

---

## 🧪 Test Workflow Example

### Complete Vendor Scope Workflow:

1. **Create Vendor Scope**
   ```
   POST /api/vendor-scope/create
   → Save the `_id` from response
   ```

2. **Submit Report**
   ```
   PUT /api/vendor-scope/{id}/submit
   → Adds IPFS link and filename
   → Status changes to "submitted"
   ```

3. **Vendor Attests**
   ```
   PUT /api/vendor-scope/{id}/attest
   → Status changes to "attested"
   → attestedAt timestamp set
   ```

4. **Admin Reviews Timeline**
   ```
   GET /api/vendor-scope/{id}/timeline
   → See complete submission history
   ```

5. **Admin Approves**
   ```
   PUT /api/vendor-scope/{id}/approve
   → Status changes to "approved"
   → reviewedAt timestamp set
   ```

---

## ✅ Validation Testing

### Test Report Validation:

1. **Missing Required Field:**
   ```json
   {
     "facilityId": "facility-001"
     // Missing period, scope1, etc.
   }
   ```
   **Expected:** 400 error with validation message

2. **Invalid Hash Format:**
   ```json
   {
     "reportHash": "invalid-hash"
   }
   ```
   **Expected:** 400 error - hash must be 64 hex characters

3. **Invalid Status:**
   ```json
   {
     "status": "invalid-status"
   }
   ```
   **Expected:** 400 error - status must be one of enum values

### Test VendorScope Validation:

1. **Invalid Email:**
   ```json
   {
     "vendorEmail": "not-an-email"
   }
   ```
   **Expected:** 400 error - invalid email format

2. **Invalid Period Format:**
   ```json
   {
     "period": "2024-Q5" // Q5 doesn't exist
   }
   ```
   **Expected:** 400 error - invalid period format

3. **Duplicate Entry:**
   ```
   POST /api/vendor-scope/create
   (Same vendorEmail + facilityId + period twice)
   ```
   **Expected:** 400 error - unique index violation

---

## 📝 Sample Test Data

### Valid Report Hash (64 hex chars):
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

### Valid Merkle Root (64 hex chars):
```
1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3
```

### Sample IPFS CID:
```
QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG
```

---

## 🚨 Troubleshooting

### 401 Unauthorized
- Make sure you've logged in first
- Check that token is in Authorization header: `Bearer {token}`
- Token may have expired - login again

### 400 Bad Request
- Check request body format
- Verify all required fields are present
- Check field validation (email format, hash format, etc.)

### 404 Not Found
- Verify the ID exists in database
- Check route path is correct
- Make sure server is running on port 4000

### 500 Server Error
- Check server logs for detailed error
- Verify MongoDB connection is working
- Check if .env file has MONGO_URI set

---

## 📦 Files Created

1. ✅ `server/routes/vendorScope.routes.js` - Vendor scope routes
2. ✅ `server/NetZero_Agents.postman_collection.json` - Postman collection
3. ✅ `server/POSTMAN_ROUTES.md` - This documentation

---

## 🎯 Next Steps

1. Import Postman collection
2. Run test workflow above
3. Verify all endpoints work
4. Test error cases
5. Test edge cases

Happy Testing! 🚀

