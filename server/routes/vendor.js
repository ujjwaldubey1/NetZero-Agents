import express from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import VendorInvite from '../models/VendorInvite.js';
import User from '../models/User.js';
import DataCenter from '../models/DataCenter.js';
import { authRequired, roleRequired } from '../middleware/auth.js';

const router = express.Router();

router.post('/invite', authRequired, roleRequired('operator'), async (req, res) => {
  try {
    const { email, vendorName, dataCenterId } = req.body;
    const token = crypto.randomBytes(16).toString('hex');
    let dataCenter = null;
    if (dataCenterId) {
      dataCenter = await DataCenter.findOne({ _id: dataCenterId, ownerId: req.user.id });
      if (!dataCenter) return res.status(404).json({ error: 'Datacenter not found for this operator' });
    }
    const invite = new VendorInvite({ email, vendorName, token, dataCenter: dataCenter?._id });
    await invite.save();
    const link = `http://localhost:3000/vendor/onboard/${token}`;
    res.json({ inviteId: invite._id, link });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/invite/:token', async (req, res) => {
  const invite = await VendorInvite.findOne({ token: req.params.token });
  if (!invite || invite.status !== 'pending') return res.status(404).json({ error: 'Invalid invite' });
  let dataCenterName = null;
  if (invite.dataCenter) {
    const dc = await DataCenter.findById(invite.dataCenter);
    dataCenterName = dc?.name || null;
  }
  res.json({ email: invite.email, vendorName: invite.vendorName, dataCenterName });
});

router.post('/onboard/:token', async (req, res) => {
  try {
    const { password } = req.body;
    const invite = await VendorInvite.findOne({ token: req.params.token });
    if (!invite || invite.status !== 'pending') return res.status(404).json({ error: 'Invalid invite' });
    const existing = await User.findOne({ email: invite.email });
    if (existing) return res.status(400).json({ error: 'User already exists' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ email: invite.email, passwordHash, role: 'vendor', vendorName: invite.vendorName });
    await user.save();
    if (invite.dataCenter) {
      await DataCenter.findByIdAndUpdate(invite.dataCenter, { $addToSet: { vendorIds: user._id } });
    }
    invite.status = 'accepted';
    invite.acceptedAt = new Date();
    await invite.save();
    res.json({ message: 'Vendor onboarded', userId: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
