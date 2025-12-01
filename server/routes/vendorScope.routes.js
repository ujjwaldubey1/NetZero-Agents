import express from 'express';
import VendorScope from '../models/VendorScope.js';
import { authRequired, roleRequired } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/vendor-scope/create
 * Create a new vendor scope entry
 */
router.post('/create', authRequired, async (req, res) => {
  try {
    const vendorScope = new VendorScope(req.body);
    await vendorScope.save();
    res.status(201).json(vendorScope);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/vendor-scope
 * Get all vendor scope entries
 */
router.get('/', authRequired, async (req, res) => {
  try {
    const { facilityId, period, status, vendorEmail } = req.query;
    const filter = {};
    
    if (facilityId) filter.facilityId = facilityId;
    if (period) filter.period = period;
    if (status) filter.status = status;
    if (vendorEmail) filter.vendorEmail = vendorEmail;
    
    const scopes = await VendorScope.find(filter).sort({ createdAt: -1 });
    res.json(scopes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/vendor-scope/:id
 * Get vendor scope by ID
 */
router.get('/:id', authRequired, async (req, res) => {
  try {
    const scope = await VendorScope.findById(req.params.id);
    if (!scope) {
      return res.status(404).json({ error: 'Vendor scope not found' });
    }
    res.json(scope);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/vendor-scope/:id/submit
 * Vendor submits report (uploads IPFS link)
 */
router.put('/:id/submit', authRequired, async (req, res) => {
  try {
    const { ipfsCid, filename } = req.body;
    if (!ipfsCid || !filename) {
      return res.status(400).json({ error: 'IPFS CID and filename are required' });
    }
    
    const scope = await VendorScope.findById(req.params.id);
    if (!scope) {
      return res.status(404).json({ error: 'Vendor scope not found' });
    }
    
    await scope.markAsSubmitted(ipfsCid, filename);
    res.json(scope);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/vendor-scope/:id/attest
 * Vendor attests to the data
 */
router.put('/:id/attest', authRequired, async (req, res) => {
  try {
    const scope = await VendorScope.findById(req.params.id);
    if (!scope) {
      return res.status(404).json({ error: 'Vendor scope not found' });
    }
    
    await scope.attest();
    res.json(scope);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/vendor-scope/:id/approve
 * Admin approves the submission
 */
router.put('/:id/approve', authRequired, roleRequired(['admin', 'operator']), async (req, res) => {
  try {
    const scope = await VendorScope.findById(req.params.id);
    if (!scope) {
      return res.status(404).json({ error: 'Vendor scope not found' });
    }
    
    await scope.approve(req.body.comments || '');
    res.json(scope);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/vendor-scope/:id/reject
 * Admin rejects the submission
 */
router.put('/:id/reject', authRequired, roleRequired(['admin', 'operator']), async (req, res) => {
  try {
    const scope = await VendorScope.findById(req.params.id);
    if (!scope) {
      return res.status(404).json({ error: 'Vendor scope not found' });
    }
    
    await scope.reject(req.body.comments || '');
    res.json(scope);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/vendor-scope/:id/timeline
 * Get submission timeline
 */
router.get('/:id/timeline', authRequired, async (req, res) => {
  try {
    const scope = await VendorScope.findById(req.params.id);
    if (!scope) {
      return res.status(404).json({ error: 'Vendor scope not found' });
    }
    
    const timeline = scope.getTimeline();
    res.json({ timeline });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;


