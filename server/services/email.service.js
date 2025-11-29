import nodemailer from 'nodemailer';

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;
  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
  } else {
    transporter = {
      sendMail: async (opts) => {
        console.log('Email (console fallback):', opts.to, opts.subject);
        return { messageId: 'console' };
      },
    };
  }
  return transporter;
};

/**
 * Send an email
 * @param {Object} params - Email parameters
 * @param {string} params.to - Recipient email
 * @param {string} params.subject - Email subject
 * @param {string} params.text - Email text content
 * @param {string} params.html - Optional HTML content
 * @returns {Promise<Object>} - Email send result
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  const t = getTransporter();
  const from = process.env.SMTP_FROM || 'no-reply@netzero.local';
  const mailOptions = { from, to, subject, text };
  if (html) {
    mailOptions.html = html;
  }
  await t.sendMail(mailOptions);
};

