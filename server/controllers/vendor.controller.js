import { createVendorInvite, getVendorInvite, onboardVendor } from '../services/vendor.service.js';
import { logAction } from '../services/audit.service.js';

/**
 * Create vendor invitation
 */
export const inviteVendor = async (req, res) => {
  try {
    const { email, vendorName, dataCenterId } = req.body;
    
    const result = await createVendorInvite({
      email,
      vendorName,
      operatorId: req.user.id,
      dataCenterId,
    });
    
    await logAction(req, 'CREATE', 'VENDOR_INVITE', result.inviteId, { email, vendorName });
    
    res.json({ inviteId: result.inviteId, link: result.link });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get vendor invitation details
 */
export const getInvitation = async (req, res) => {
  try {
    const { token } = req.params;
    const invite = await getVendorInvite(token);
    res.json(invite);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

/**
 * Onboard vendor from invitation
 */
export const onboardFromInvite = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    const result = await onboardVendor({ token, password });
    
    res.json({ message: 'Vendor onboarded', userId: result.userId });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

