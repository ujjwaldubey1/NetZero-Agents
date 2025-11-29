import express from 'express';
import DataCenter from '../models/DataCenter.js';
import User from '../models/User.js';
import { authRequired, roleRequired } from '../middleware/auth.js';

const router = express.Router();

const filterByRole = (user) => {
  if (user.role === 'operator') return { ownerId: user.id };
  if (user.role === 'vendor') return { vendorIds: user.id };
  if (user.role === 'staff') return { staffIds: user.id };
  return {};
};

router.get('/', authRequired, async (req, res) => {
  const filter = filterByRole(req.user);
  const dataCenters = await DataCenter.find(filter)
    .sort({ createdAt: -1 })
    .populate('vendorIds', 'email vendorName')
    .populate('staffIds', 'email');
  res.json(dataCenters);
});

router.post('/', authRequired, roleRequired(['operator', 'admin']), async (req, res) => {
  const { name, location } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const existing = await DataCenter.findOne({ ownerId: req.user.id, name });
  if (existing) return res.status(400).json({ error: 'Datacenter name already exists' });
  const dc = new DataCenter({ name, location, ownerId: req.user.id });
  await dc.save();
  res.json(dc);
});

router.put('/:id/assign', authRequired, roleRequired(['operator', 'admin']), async (req, res) => {
  const { vendorIds, staffIds } = req.body;
  const baseQuery = { _id: req.params.id };
  if (req.user.role === 'operator') baseQuery.ownerId = req.user.id;
  const dc = await DataCenter.findOne(baseQuery);
  if (!dc) return res.status(404).json({ error: 'Datacenter not found' });

  if (Array.isArray(vendorIds)) {
    const validVendors = await User.find({ _id: { $in: vendorIds }, role: 'vendor' }).select('_id');
    dc.vendorIds = validVendors.map((v) => v._id);
  }
  if (Array.isArray(staffIds)) {
    const validStaff = await User.find({ _id: { $in: staffIds }, role: 'staff' }).select('_id');
    dc.staffIds = validStaff.map((s) => s._id);
  }

  await dc.save();
  const populated = await dc.populate([
    { path: 'vendorIds', select: 'email vendorName' },
    { path: 'staffIds', select: 'email' },
  ]);
  res.json(populated);
});

export default router;
