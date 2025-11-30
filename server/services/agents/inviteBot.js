/**
 * Invite Bot
 * Sends invitation emails to vendors/staff to start uploading data
 */

import DataCenter from '../../models/DataCenter.js';
import VendorInvite from '../../models/VendorInvite.js';
import User from '../../models/User.js';
import { sendEmail } from '../email.service.js';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { getGeminiLLM } from '../../utils/llm.js';

export const inviteBot = async (datacenterName, period) => {
  console.log(`🤖 Invite Bot: Starting for ${datacenterName} @ ${period}`);
  const results = { sent: 0, failed: 0, logs: [] };

  try {
    // 1. Find Datacenter
    // 1. Find Datacenter
    let datacenter = await DataCenter.findOne({ name: { $regex: new RegExp(`^${datacenterName}$`, 'i') } });
    if (!datacenter) {
      // Try by ID if name fails
      if (datacenterName.match(/^[0-9a-fA-F]{24}$/)) {
        datacenter = await DataCenter.findById(datacenterName);
      }
    }
    if (!datacenter) throw new Error(`Datacenter "${datacenterName}" not found`);

    // 2. Find Vendors linked to this datacenter
    // Strategy: Find VendorInvites for this DC, and also Users with role='vendor' who might be linked (if we had a link)
    // For now, we rely on VendorInvite as the primary link source
    const invites = await VendorInvite.find({ dataCenter: datacenter._id });
    
    // Also find staff
    const staff = await User.find({ role: 'staff' }); // Assuming staff are global or we'd need a link

    const targets = [
      ...invites.map(i => ({ email: i.email, name: i.vendorName, role: 'Vendor' })),
      ...staff.map(u => ({ email: u.email, name: u.email.split('@')[0], role: 'Staff' }))
    ];

    if (targets.length === 0) {
      return { message: 'No targets found', results };
    }

    // 3. Generate Email Content using AI
    const llm = getGeminiLLM({ temperature: 0.7 });
    const prompt = ChatPromptTemplate.fromTemplate(`
      You are the "NetZero Invite Bot". Write a professional, encouraging email to a {role} named {name}.
      
      Context:
      - Datacenter: {datacenterName}
      - Reporting Period: {period}
      - Action: They need to log in to the NetZero Portal and upload their emissions data (Scope 1/2/3).
      - Tone: Professional, urgent but polite, emphasizing sustainability.
      
      Subject: Action Required: NetZero Data Upload for {period}
      
      Return ONLY the email body text.
    `);

    // 4. Send Emails
    for (const target of targets) {
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
          emailBody = `Hello ${target.name},\n\nPlease upload your data for ${datacenterName} (${period}).\n\nThanks,\nNetZero Team`;
        }

        await sendEmail({
          to: target.email,
          subject: `Action Required: NetZero Data Upload for ${period}`,
          text: emailBody
        });

        results.sent++;
        results.logs.push(`Sent to ${target.email}`);
      } catch (err) {
        console.error(`Failed to send to ${target.email}`, err);
        results.failed++;
        results.logs.push(`Failed: ${target.email} - ${err.message}`);
      }
    }

    return results;

  } catch (error) {
    console.error('Invite Bot Error:', error);
    throw error;
  }
};
