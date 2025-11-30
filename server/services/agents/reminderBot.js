/**
 * Reminder Bot
 * Checks who hasn't uploaded for the period and sends reminders
 */

import DataCenter from '../../models/DataCenter.js';
import VendorInvite from '../../models/VendorInvite.js';
import User from '../../models/User.js';
import Report from '../../models/Report.js';
import { sendEmail } from '../email.service.js';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { getGeminiLLM } from '../../utils/llm.js';

export const reminderBot = async (datacenterName, period) => {
  console.log(`⏰ Reminder Bot: Checking ${datacenterName} @ ${period}`);
  const results = { sent: 0, skipped: 0, failed: 0, logs: [] };

  try {
    let datacenter = await DataCenter.findOne({ name: { $regex: new RegExp(`^${datacenterName}$`, 'i') } });
    if (!datacenter) {
      if (datacenterName.match(/^[0-9a-fA-F]{24}$/)) {
        datacenter = await DataCenter.findById(datacenterName);
      }
    }
    if (!datacenter) throw new Error(`Datacenter "${datacenterName}" not found`);

    // 1. Identify all expected uploaders
    const invites = await VendorInvite.find({ dataCenter: datacenter._id });
    const staff = await User.find({ role: 'staff' });

    const allTargets = [
      ...invites.map(i => ({ email: i.email, name: i.vendorName, role: 'Vendor', id: i._id.toString() })), // Using invite ID as proxy if user not created
      ...staff.map(u => ({ email: u.email, name: u.email.split('@')[0], role: 'Staff', id: u._id.toString() })) // User ID
    ];

    // 2. Check who has already uploaded
    // Reports are linked by facilityId (datacenter._id). We assume we can match by some metadata or we check if *any* report exists for this period?
    // Actually, Report schema doesn't strictly link to a specific user (vendorId is in LedgerEvent but Report has facilityId).
    // However, `upload.service.js` might link things.
    // For this MVP, let's check if there are *any* reports for this facility+period.
    // Wait, that's not granular enough.
    // Let's look at `LedgerEvent` for 'EMISSIONS_UPLOADED' which has `vendorId` or `email` in payload?
    // Or better: `Report` usually aggregates.
    // Let's check `VendorScope` or similar if it exists.
    // Actually, `VendorScope` tracks vendor specific uploads.
    
    // Let's try to find if there's a Report/VendorScope for this user.
    // Since we don't have a perfect link in the provided schemas, we'll use a heuristic:
    // If we can't find a specific "VendorScope" document for this vendor+period, we remind them.
    
    // Let's assume we have a `VendorScope` model (I saw it in the file list).
    // I'll need to import it.
    
    const { default: VendorScope } = await import('../../models/VendorScope.js');
    
    const uploadedVendorIds = new Set();
    const scopes = await VendorScope.find({ 
      facilityId: datacenter._id.toString(), 
      period: period 
    });
    
    scopes.forEach(s => {
      if (s.vendorId) uploadedVendorIds.add(s.vendorId.toString());
    });

    // 3. Filter targets
    const pendingTargets = allTargets.filter(t => {
      // For staff, we might check Report directly (Scope 1/2)
      if (t.role === 'Staff') {
        // Check if a Report exists with scope1/scope2 data
        // This is a simplification
        return true; // Always remind staff for now as they manage the main report
      }
      // For vendors, check if they have a VendorScope
      // We need to map Invite -> User -> VendorScope.
      // If the vendor hasn't signed up (no User), they definitely haven't uploaded.
      // If they have signed up, we check VendorScope.
      // This is complex without full user linking.
      // SIMPLIFICATION: If we don't find a VendorScope for this *email* (if stored) or ID, remind.
      // VendorScope has `vendorId`. We need to find the User for the Invite email.
      return true; // Default to remind for safety in this demo
    });
    
    // Let's refine the filter with a real lookup if possible
    for (const target of pendingTargets) {
        const user = await User.findOne({ email: target.email });
        if (user && uploadedVendorIds.has(user._id.toString())) {
            target.uploaded = true;
        }
    }
    
    const finalTargets = pendingTargets.filter(t => !t.uploaded);

    if (finalTargets.length === 0) {
      return { message: 'Everyone has uploaded!', results };
    }

    // 4. Generate Reminder Email
    const llm = getGeminiLLM({ temperature: 0.5 });
    const prompt = ChatPromptTemplate.fromTemplate(`
      You are the "NetZero Reminder Bot". Write a polite but firm reminder email to a {role} named {name}.
      
      Context:
      - Datacenter: {datacenterName}
      - Period: {period}
      - Issue: We have not received their emissions data yet.
      - Deadline: Immediate action required.
      
      Subject: Reminder: Missing Data for {period}
      
      Return ONLY the email body text.
    `);

    // 5. Send Emails
    for (const target of finalTargets) {
      try {
        let emailBody;
        if (llm) {
          const chain = prompt.pipe(llm).pipe(new StringOutputParser());
          emailBody = await chain.invoke({
            role: target.role,
            name: target.name,
            datacenterName,
            period
          });
        } else {
          emailBody = `Hello ${target.name},\n\nThis is a reminder to upload your data for ${datacenterName} (${period}).\n\nThanks,\nNetZero Team`;
        }

        await sendEmail({
          to: target.email,
          subject: `Reminder: Missing Data for ${period}`,
          text: emailBody
        });

        results.sent++;
        results.logs.push(`Reminder sent to ${target.email}`);
      } catch (err) {
        console.error(`Failed to remind ${target.email}`, err);
        results.failed++;
        results.logs.push(`Failed: ${target.email} - ${err.message}`);
      }
    }

    return results;

  } catch (error) {
    console.error('Reminder Bot Error:', error);
    throw error;
  }
};
