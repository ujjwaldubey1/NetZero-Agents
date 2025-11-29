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

export const sendEmail = async ({ to, subject, text }) => {
  const t = getTransporter();
  const from = process.env.SMTP_FROM || 'no-reply@netzero.local';
  await t.sendMail({ from, to, subject, text });
};
