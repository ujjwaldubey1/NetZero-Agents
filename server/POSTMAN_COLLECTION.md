# Postman API Routes for Testing

Base URL: `http://localhost:4000`

## 🔍 Health Check

### 1. Server Health Check
```
GET http://localhost:4000/
```

**Expected Response:**
```json
{
  "status": "NetZero Agents API",
  "health": "ok"
}
```

---

## 🔐 Authentication Routes

### 2. Register User
```
POST http://localhost:4000/api/auth/register
Content-Type: application/json

{
  "email": "operator@demo.com",
  "password": "password123",
  "role": "operator",
  "organizationName": "Demo Organization"
}
```

**Expected Response:**
```json
{
  "message": "Registered",
  "userId": "..."
}
```

### 3. Login
```
POST http://localhost:4000/api/auth/login
Content-Type: application/json

{
  "email": "operator@demo.com",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "role": "operator",
    "email": "operator@demo.com",
    "organizationName": "Demo Organization"
  }
}
```

**💡 Save the token for authenticated requests!**

---

## 📊 Report Routes (New Model)

### 4. Create Report (Manual Test)
Since we don't have a route yet, test directly with MongoDB or create a test route:

**Create Test Report Route (add to routes):**
```javascript
POST /api/reports/create
```

**Test Body:**
```json
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
  "merkleRoot": "1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3"
}
```

### 5. Get All Reports
```
GET http://localhost:4000/api/reports
Authorization: Bearer YOUR_TOKEN_HERE
```

### 6. Get Current Report
```
GET http://localhost:4000/api/reports/current?period=2024-Q4
Authorization: Bearer YOUR_TOKEN_HERE
```

### 7. Get Report by ID
```
GET http://localhost:4000/api/reports/{reportId}
Authorization: Bearer YOUR_TOKEN_HERE
```

### 8. Freeze Report
```
POST http://localhost:4000/api/reports/freeze
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "period": "2024-Q4"
}
```

---

## 👥 Vendor Scope Routes (New Model)

### 9. Create Vendor Scope (Test Route Needed)

Since we need to create routes for VendorScope, here's what should be available:

```
POST /api/vendor-scope/create
GET /api/vendor-scope
GET /api/vendor-scope/:id
PUT /api/vendor-scope/:id/attest
PUT /api/vendor-scope/:id/approve
PUT /api/vendor-scope/:id/reject
```

**Test Body for Create:**
```json
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

---

## 🔧 Database Test Routes

### 10. Test MongoDB Connection
Run this via terminal:
```bash
cd server
node scripts/testDbConnection.js
```

Or create a test endpoint:
```
GET http://localhost:4000/api/test/db
```

---

## 📝 Quick Test Checklist

1. ✅ **Health Check** - Server is running
2. ✅ **Register** - Create a user
3. ✅ **Login** - Get authentication token
4. ⚠️ **Create Report** - Need to create route (see below)
5. ⚠️ **Create VendorScope** - Need to create route (see below)
6. ✅ **Get Reports** - Test existing routes

---

## 🚀 Routes to Create for Testing

### Add to `server/routes/report.routes.js`:

```javascript
router.post('/create', authRequired, roleRequired('operator'), async (req, res) => {
  try {
    const report = new Report(req.body);
    await report.save();
    res.status(201).json(report);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
```

### Create `server/routes/vendorScope.routes.js`:

```javascript
import express from 'express';
import VendorScope from '../models/VendorScope.js';
import { authRequired, roleRequired } from '../middleware/auth.js';

const router = express.Router();

router.post('/create', authRequired, async (req, res) => {
  try {
    const vendorScope = new VendorScope(req.body);
    await vendorScope.save();
    res.status(201).json(vendorScope);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', authRequired, async (req, res) => {
  try {
    const scopes = await VendorScope.find().sort({ createdAt: -1 });
    res.json(scopes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authRequired, async (req, res) => {
  try {
    const scope = await VendorScope.findById(req.params.id);
    if (!scope) return res.status(404).json({ error: 'Not found' });
    res.json(scope);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/attest', authRequired, async (req, res) => {
  try {
    const scope = await VendorScope.findById(req.params.id);
    if (!scope) return res.status(404).json({ error: 'Not found' });
    await scope.attest();
    res.json(scope);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/approve', authRequired, roleRequired('admin'), async (req, res) => {
  try {
    const scope = await VendorScope.findById(req.params.id);
    if (!scope) return res.status(404).json({ error: 'Not found' });
    await scope.approve(req.body.comments || '');
    res.json(scope);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/reject', authRequired, roleRequired('admin'), async (req, res) => {
  try {
    const scope = await VendorScope.findById(req.params.id);
    if (!scope) return res.status(404).json({ error: 'Not found' });
    await scope.reject(req.body.comments || '');
    res.json(scope);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
```

Then add to `server/index.js`:
```javascript
import vendorScopeRoutes from './routes/vendorScope.routes.js';
app.use('/api/vendor-scope', vendorScopeRoutes);
```

