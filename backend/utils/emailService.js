const { Resend } = require('resend');
const nodemailer = require('nodemailer');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;
const EMAIL_FROM = process.env.EMAIL_FROM || 'DiGi Campus Portal <onboarding@resend.dev>';

// Helper function to send email via official Resend SDK or Nodemailer SMTP fallback
async function sendMail({ to, subject, html, text }) {
  // Method 1: Official Resend SDK
  if (RESEND_API_KEY && RESEND_API_KEY.startsWith('re_') && resend) {
    try {
      const senderString = EMAIL_FROM.includes('<') ? EMAIL_FROM : `DiGi Campus Portal <${EMAIL_FROM}>`;
      const data = await resend.emails.send({
        from: senderString,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text
      });

      console.log('✅ [RESEND EMAIL SENT SUCCESS]', data);
      return data;
    } catch (err) {
      console.error('❌ Failed sending via Resend SDK:', err.message);
    }
  }

  // Method 2: Nodemailer SMTP Fallback
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: port === '465',
      auth: { user, pass }
    });

    return await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      text,
      html
    });
  }

  // Method 3: Mock Transporter (Local Development Fallback)
  console.log('📧 [EMAIL SERVICE - MOCK PREVIEW] Destination:', to);
  console.log('Subject:', subject);
  console.log('Body Preview:', text || html.substring(0, 150));
  return { messageId: 'mock-email-' + Date.now() };
}

/**
 * Send Welcome Email on Account Creation / Sign Up
 */
async function sendWelcomeEmail({ toEmail, name, role, department, studentId }) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e1e2ed; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #004ac6, #2563eb); padding: 28px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 26px; font-weight: 900;">Welcome to DiGi Campus! ✨</h1>
        <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;">Your Enterprise College Event Portal Account is Ready</p>
      </div>

      <div style="padding: 24px; color: #191b23;">
        <p style="font-size: 16px; font-weight: 700; margin-top: 0;">Hello ${name},</p>
        <p style="font-size: 14px; color: #434655;">Welcome aboard! Your account has been successfully created. You can now discover upcoming campus hackathons, workshops, cultural fests, and claim digital entry passes with QR validation.</p>

        <div style="background-color: #f3f3fe; border-left: 4px solid #004ac6; padding: 16px; border-radius: 12px; margin: 20px 0;">
          <p style="margin: 4px 0; font-size: 14px;"><strong>👤 Account Name:</strong> ${name}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>🎓 Department:</strong> ${department || 'Computer Science'}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>🆔 Student/Member ID:</strong> <span style="font-family: monospace; font-weight: bold;">${studentId || 'CP-STUDENT'}</span></p>
          <p style="margin: 4px 0; font-size: 14px; color: #004ac6;"><strong>🌟 Starter Gamification Bonus:</strong> +150 XP Points Awarded!</p>
        </div>

        <p style="font-size: 13px; color: #737686; text-align: center; margin-top: 24px;">If you didn't create this account, please report to your campus administrator.<br><br>Happy Campus Exploring!<br><strong>DiGi Campus Event Portal Team</strong></p>
      </div>
    </div>
  `;

  return await sendMail({
    to: toEmail,
    subject: `✨ Welcome to DiGi Campus, ${name}! Your Account is Active`,
    text: `Hello ${name}, welcome to DiGi Campus! Account details: Department: ${department}. Starter Bonus: +150 XP`,
    html: htmlContent
  });
}

/**
 * Send Security Alert Email on Account Login / Sign In
 */
async function sendLoginNotificationEmail({ toEmail, name, loginTime, ipAddress }) {
  const timeFormatted = loginTime ? new Date(loginTime).toLocaleString() : new Date().toLocaleString();

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e1e2ed; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #1e293b; padding: 20px; text-align: center; color: #ffffff;">
        <h2 style="margin: 0; font-size: 20px; font-weight: 800;">🔒 Security Alert: Account Sign In</h2>
      </div>

      <div style="padding: 24px; color: #191b23;">
        <p style="font-size: 15px; font-weight: 700; margin-top: 0;">Hello ${name},</p>
        <p style="font-size: 14px; color: #434655;">We detected a new successful sign-in to your <strong>DiGi Campus</strong> account.</p>

        <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 14px; border-radius: 8px; margin: 16px 0; font-size: 13px;">
          <p style="margin: 3px 0;"><strong>⏰ Time:</strong> ${timeFormatted}</p>
          <p style="margin: 3px 0;"><strong>🌐 Device IP:</strong> ${ipAddress || 'Client Web Browser'}</p>
        </div>

        <p style="font-size: 12px; color: #64748b;">If this was you, no action is needed. If you did not sign in, please contact your admin immediately to secure your account.</p>
      </div>
    </div>
  `;

  return await sendMail({
    to: toEmail,
    subject: `🔒 Security Alert: New Sign-in to DiGi Campus`,
    text: `Hello ${name}, a new sign-in was detected on your DiGi Campus account at ${timeFormatted}.`,
    html: htmlContent
  });
}

/**
 * Send RSVP Ticket Confirmation Email
 */
async function sendRsvpConfirmationEmail({ toEmail, studentName, eventTitle, eventDate, eventTime, venue, location, ticketCode, qrCodeUrl }) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e1e2ed; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #004ac6, #2563eb); padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 800;">DiGi Campus Event Pass</h1>
        <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">Official College Event Ticket</p>
      </div>

      <div style="padding: 24px; color: #191b23;">
        <p style="font-size: 16px; font-weight: 700; margin-top: 0;">Hello ${studentName},</p>
        <p style="font-size: 14px; color: #434655;">Your RSVP for <strong>${eventTitle}</strong> is confirmed! Below are your digital entry details:</p>

        <div style="background-color: #f3f3fe; border-left: 4px solid #004ac6; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 4px 0; font-size: 14px;"><strong>📅 Date & Time:</strong> ${new Date(eventDate).toLocaleDateString()} at ${eventTime}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>📍 Venue:</strong> ${venue} (${location})</p>
          <p style="margin: 4px 0; font-size: 14px; color: #004ac6;"><strong>🎟️ Ticket Code:</strong> <span style="font-family: monospace; font-weight: bold;">${ticketCode}</span></p>
        </div>

        <div style="text-align: center; margin: 24px 0;">
          <p style="font-size: 12px; color: #737686; margin-bottom: 8px;">Present this QR pass at the entrance gate scanner:</p>
          <img src="${qrCodeUrl}" alt="Ticket QR Code" style="width: 150px; height: 150px; border-radius: 12px; border: 1px solid #e1e2ed;" />
        </div>

        <p style="font-size: 12px; color: #737686; text-align: center;">See you at the event!<br><strong>DiGi Campus Event Team</strong></p>
      </div>
    </div>
  `;

  return await sendMail({
    to: toEmail,
    subject: `🎉 Registration Confirmed: ${eventTitle}`,
    text: `Hello ${studentName}, your RSVP for ${eventTitle} is confirmed! Pass ID: ${ticketCode}. Venue: ${venue}`,
    html: htmlContent
  });
}

/**
 * Send Campus Announcement Notification Email
 */
async function sendAnnouncementEmail({ toEmails, title, content, category, authorName }) {
  if (!toEmails || toEmails.length === 0) return;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e1e2ed; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #004ac6; padding: 20px; text-align: center; color: #ffffff;">
        <h2 style="margin: 0; font-size: 20px;">📢 Campus Bulletin: ${category}</h2>
      </div>

      <div style="padding: 24px; color: #191b23;">
        <h3 style="margin-top: 0; font-size: 18px; color: #004ac6;">${title}</h3>
        <p style="font-size: 14px; color: #434655; line-height: 1.6;">${content}</p>

        <hr style="border: 0; border-top: 1px solid #e1e2ed; margin: 20px 0;" />
        <p style="font-size: 12px; color: #737686;">Posted by ${authorName || 'Campus Admin'}</p>
      </div>
    </div>
  `;

  return await sendMail({
    to: toEmails,
    subject: `📢 [DiGi Campus ${category}] ${title}`,
    text: `${title}\n\n${content}\n\nPosted by ${authorName}`,
    html: htmlContent
  });
}

module.exports = {
  sendWelcomeEmail,
  sendLoginNotificationEmail,
  sendRsvpConfirmationEmail,
  sendAnnouncementEmail
};
