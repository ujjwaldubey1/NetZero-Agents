import User from '../models/User.js';
import { sendEmail } from './mailer.js';

const ONE_DAY = 24 * 60 * 60 * 1000;

export const startReminderAgent = () => {
  const tick = async () => {
    const today = new Date();
    const day = today.getDate();
    if (day === 15) {
      const vendors = await User.find({ role: 'vendor' });
      for (const v of vendors) {
        await sendEmail({ to: v.email, subject: 'Reminder: update Scope 3 data', text: 'Please update your Scope 3 emissions before end of month.' });
      }
    }
    if (day === 30) {
      const staff = await User.find({ role: { $in: ['staff', 'admin'] } });
      for (const s of staff) {
        await sendEmail({ to: s.email, subject: 'Monthly processing starting', text: 'Automated aggregation starting. Please review uploads and certificates.' });
      }
    }
  };
  tick();
  setInterval(tick, ONE_DAY);
};
