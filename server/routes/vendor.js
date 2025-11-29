import express from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import VendorInvite from '../models/VendorInvite.js';
import User from '../models/User.js';
import DataCenter from '../models/DataCenter.js';
import { authRequired, roleRequired } from '../middleware/auth.js';
import { sendEmail } from '../services/mailer.js';

const router = express.Router();

router.post('/invite', authRequired, roleRequired('operator'), async (req, res) => {
  try {
    const { email, vendorName, dataCenterId, dataCenterIds } = req.body;
    const token = crypto.randomBytes(16).toString('hex');
    const dcIds = Array.isArray(dataCenterIds) && dataCenterIds.length
      ? dataCenterIds
      : (dataCenterId ? [dataCenterId] : []);
    const validatedDcIds = [];
    for (const id of dcIds) {
      const dc = await DataCenter.findOne({ _id: id, ownerId: req.user.id });
      if (dc) validatedDcIds.push(dc._id);
    }
    const invite = new VendorInvite({ email, vendorName, token, dataCenter: validatedDcIds[0] });
    await invite.save();
    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:3000';
    const link = `${frontendBase.replace(/\/$/, '')}/vendor/onboard/${token}`;
    const loginUrl = `${frontendBase.replace(/\/$/, '')}/login`;
    await sendEmail({
      to: email,
      subject: 'Your vendor account is ready',
      text: `Hi ${vendorName || 'vendor'},\n\nA vendor account has been created for you.\n\nEmail: ${email}\nPassword: password123\nLogin: ${loginUrl}\n\nYou can also onboard via the legacy invite link if needed: ${link}\n\nIf you did not expect this, you can ignore the email.\n\nThanks,\nNetZero Agents`,
    });
    // Auto-provision vendor with default password
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        email,
        role: 'vendor',
        vendorName,
        passwordHash: await bcrypt.hash('password123', 10),
      });
      await user.save();
    }
    if (validatedDcIds.length) {
      await DataCenter.updateMany(
        { _id: { $in: validatedDcIds } },
        { $addToSet: { vendorIds: user._id } }
      );
    }
    invite.status = 'accepted';
    invite.acceptedAt = new Date();
    await invite.save();
    res.json({ inviteId: invite._id, link, inviteLink: link, userId: user._id });
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
