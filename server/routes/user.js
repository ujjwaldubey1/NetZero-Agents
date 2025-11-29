import express from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import VendorInvite from '../models/VendorInvite.js';
import DataCenter from '../models/DataCenter.js';
import User from '../models/User.js';
import { authRequired, roleRequired } from '../middleware/auth.js';
import { sendEmail } from '../services/mailer.js';

const router = express.Router();

router.get('/me', authRequired, (req, res) => {
  res.json(req.user);
});

const inviteVendor = async (req, res) => {
  try {
    const { email, vendorName, dataCenterId, dataCenterIds } = req.body;
    const token = crypto.randomBytes(16).toString('hex');
    const dcIds = Array.isArray(dataCenterIds) && dataCenterIds.length
      ? dataCenterIds
      : (dataCenterId ? [dataCenterId] : []);

    // Validate datacenters belong to operator
    const validatedDcIds = [];
    for (const id of dcIds) {
      const dc = await DataCenter.findOne({ _id: id, ownerId: req.user.id });
      if (dc) validatedDcIds.push(dc._id);
    }

    const invite = new VendorInvite({ email, vendorName, token, dataCenter: validatedDcIds[0] });
    await invite.save();
    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173';
    const link = `${frontendBase.replace(/\/$/, '')}/vendor/onboard/${token}`;
    const loginUrl = `${frontendBase.replace(/\/$/, '')}/login`;
    const emailPayload = {
      to: email,
      subject: 'Your vendor account is ready',
      text: `Hi ${vendorName || 'vendor'},\n\nA vendor account has been created for you.\n\nEmail: ${email}\nPassword: password123\nLogin: ${loginUrl}\n\nYou can also onboard via the legacy invite link if needed: ${link}\n\nIf you did not expect this, you can ignore the email.\n\nThanks,\nNetZero Agents`,
    };
    await sendEmail(emailPayload);

    // Auto-provision vendor account with default password and attach to datacenters
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
};

// Alias paths for vendor invite to avoid frontend 404s
router.post('/invite-vendor', authRequired, roleRequired('operator'), inviteVendor);
router.post('/users/invite-vendor', authRequired, roleRequired('operator'), inviteVendor);

export default router;
