import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import VendorInvite from '../models/VendorInvite.js';
import EmissionRecord from '../models/EmissionRecord.js';
import EmissionThreshold from '../models/EmissionThreshold.js';
import { authRequired, roleRequired } from '../middleware/auth.js';
import { sendEmail } from '../services/mailer.js';

const router = express.Router();
const adminOnly = [authRequired, roleRequired(['admin'])];
const adminOrOperator = [authRequired, roleRequired(['admin', 'operator'])];
const adminOperatorStaff = [authRequired, roleRequired(['admin', 'operator', 'staff'])];

// Staff management
router.get('/staff', adminOperatorStaff, async (_req, res) => {
  const staff = await User.find({ role: { $in: ['staff'] } });
  res.json(staff);
});

router.post('/staff', adminOperatorStaff, async (req, res) => {
  const { email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ error: 'Email exists' });
  const chosenPassword = password || 'password123';
  const passwordHash = await bcrypt.hash(chosenPassword, 10);
  const staff = new User({ email, passwordHash, role: 'staff' });
  await staff.save();

  const frontendBase = process.env.FRONTEND_URL || 'http://localhost:3000';
  const loginUrl = `${frontendBase.replace(/\/$/, '')}/login`;
  await sendEmail({
    to: email,
    subject: 'Your staff account is ready',
    text: `Hi,\n\nA staff account has been created for you.\n\nEmail: ${email}\nPassword: ${chosenPassword}\nLogin: ${loginUrl}\n\nIf you did not expect this, you can ignore the email.\n\nThanks,\nNetZero Agents`,
  });

  res.json(staff);
});

router.delete('/staff/:id', adminOperatorStaff, async (req, res) => {
  await User.deleteOne({ _id: req.params.id, role: 'staff' });
  res.json({ ok: true });
});

// Vendor management
router.get('/vendors', adminOrOperator, async (_req, res) => {
  const vendors = await User.find({ role: 'vendor' });
  res.json(vendors);
});

router.post('/vendors', adminOrOperator, async (req, res) => {
  const { email, vendorName, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ error: 'Email exists' });
  const passwordHash = await bcrypt.hash(password || 'changeme123', 10);
  const user = new User({ email, vendorName, passwordHash, role: 'vendor' });
  await user.save();
  res.json(user);
});

router.put('/vendors/:id', adminOrOperator, async (req, res) => {
  const { vendorName } = req.body;
  const updated = await User.findOneAndUpdate({ _id: req.params.id, role: 'vendor' }, { vendorName }, { new: true });
  res.json(updated);
});

router.delete('/vendors/:id', adminOrOperator, async (req, res) => {
  await User.deleteOne({ _id: req.params.id, role: 'vendor' });
  res.json({ ok: true });
});

// Thresholds
router.get('/thresholds', adminOrOperator, async (_req, res) => {
  const thresholds = await EmissionThreshold.find({});
  res.json(thresholds);
});

router.post('/thresholds', adminOrOperator, async (req, res) => {
  const { key, value } = req.body;
  const t = await EmissionThreshold.findOneAndUpdate({ key }, { value, updatedAt: new Date() }, { new: true, upsert: true });
  res.json(t);
});

// Vendor status for a month
router.get('/vendor-status', adminOrOperator, async (req, res) => {
  const { period } = req.query;
  const vendors = await User.find({ role: 'vendor' });
  const records = await EmissionRecord.find({ scope: 3, period });
  const shared = new Set(records.map((r) => r.ownerId.toString()));
  const data = vendors.map((v) => ({ vendor: v, status: shared.has(v._id.toString()) ? 'submitted' : 'pending' }));
  res.json(data);
});

router.post('/notify-vendor', adminOrOperator, async (req, res) => {
  const { email, message } = req.body;
  await sendEmail({ to: email, subject: 'NetZero Agents update', text: message || 'Please update your Scope 3 data.' });
  res.json({ ok: true });
});

router.get('/reports', adminOrOperator, async (_req, res) => {
  const reports = await (await import('../models/Report.js')).default.find({}).sort({ createdAt: -1 });
  res.json(reports);
});

export default router;
