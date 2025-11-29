import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import VendorInvite from '../models/VendorInvite.js';
import User from '../models/User.js';
import DataCenter from '../models/DataCenter.js';
import { sendEmail } from './email.service.js';

/**
 * Create a vendor invitation
 * @param {Object} params - Invitation parameters
 * @param {string} params.email - Vendor email
 * @param {string} params.vendorName - Vendor name
 * @param {string} params.operatorId - Operator ID creating the invite
 * @param {string} params.dataCenterId - Optional data center ID
 * @returns {Promise<Object>} - Invitation object with link
 */
export const createVendorInvite = async ({ email, vendorName, operatorId, dataCenterId }) => {
  const token = crypto.randomBytes(16).toString('hex');
  let dataCenter = null;
  
  if (dataCenterId) {
    dataCenter = await DataCenter.findOne({ _id: dataCenterId, ownerId: operatorId });
    if (!dataCenter) {
      throw new Error('Datacenter not found for this operator');
    }
  }

  const invite = new VendorInvite({
    email,
    vendorName,
    token,
    dataCenter: dataCenter?._id,
  });
  
  await invite.save();
  
  const link = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/vendor/onboard/${token}`;
  
  // Send invitation email
  try {
    await sendEmail({
      to: email,
      subject: 'Vendor Invitation - NetZero Agents',
      text: `You have been invited to join NetZero Agents as a vendor.\n\nInvitation link: ${link}`,
    });
  } catch (err) {
    console.warn('Failed to send invitation email:', err.message);
  }
  
  return { inviteId: invite._id, link };
};

/**
 * Get vendor invitation by token
 * @param {string} token - Invitation token
 * @returns {Promise<Object>} - Invitation details
 */
export const getVendorInvite = async (token) => {
  const invite = await VendorInvite.findOne({ token });
  if (!invite || invite.status !== 'pending') {
    throw new Error('Invalid invite');
  }
  
  let dataCenterName = null;
  if (invite.dataCenter) {
    const dc = await DataCenter.findById(invite.dataCenter);
    dataCenterName = dc?.name || null;
  }
  
  return {
    email: invite.email,
    vendorName: invite.vendorName,
    dataCenterName,
  };
};

/**
 * Onboard a vendor from invitation
 * @param {Object} params - Onboarding parameters
 * @param {string} params.token - Invitation token
 * @param {string} params.password - Vendor password
 * @returns {Promise<Object>} - Created user object
 */
export const onboardVendor = async ({ token, password }) => {
  const invite = await VendorInvite.findOne({ token });
  if (!invite || invite.status !== 'pending') {
    throw new Error('Invalid invite');
  }
  
  const existing = await User.findOne({ email: invite.email });
  if (existing) {
    throw new Error('User already exists');
  }
  
  const passwordHash = await bcrypt.hash(password, 10);
  const user = new User({
    email: invite.email,
    passwordHash,
    role: 'vendor',
    vendorName: invite.vendorName,
  });
  
  await user.save();
  
  if (invite.dataCenter) {
    await DataCenter.findByIdAndUpdate(invite.dataCenter, {
      $addToSet: { vendorIds: user._id },
    });
  }
  
  invite.status = 'accepted';
  invite.acceptedAt = new Date();
  await invite.save();
  
  return { userId: user._id, email: user.email, vendorName: user.vendorName };
};

