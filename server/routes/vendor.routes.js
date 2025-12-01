import express from 'express';
import { inviteVendor, getInvitation, onboardFromInvite } from '../controllers/vendor.controller.js';
import { authRequired, roleRequired } from '../middleware/auth.js';

const router = express.Router();

router.post('/invite', authRequired, roleRequired('operator'), inviteVendor);
router.get('/invite/:token', getInvitation);
router.post('/onboard/:token', onboardFromInvite);

export default router;


