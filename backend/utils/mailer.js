const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST,
  port:   parseInt(process.env.EMAIL_PORT, 10),
  secure: false,           // STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── Verify email address ──────────────────────────────────────────────────────
async function sendVerificationEmail(to, name, token) {
  const link = `${process.env.CLIENT_URL}/api/auth/verify-email?token=${token}`;

  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to,
    subject: "Verify your Odoo Cafe account",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;background:#1E1A14;color:#F5EDD8;padding:32px;border-radius:12px">
        <h1 style="color:#E8A020;font-size:22px;margin-bottom:4px">Odoo <em>Cafe</em></h1>
        <p style="color:#B0A080;font-size:13px;margin-bottom:24px">Restaurant Point of Sale</p>
        <p>Hi <strong>${name}</strong>,</p>
        <p style="margin:12px 0">Thanks for signing up! Click the button below to verify your email address and activate your account.</p>
        <a href="${link}"
           style="display:inline-block;margin:20px 0;padding:12px 28px;background:#E8A020;color:#12100D;border-radius:8px;font-weight:700;text-decoration:none;font-size:14px">
          Verify Email →
        </a>
        <p style="font-size:12px;color:#B0A080;margin-top:20px">
          This link expires in <strong>24 hours</strong>.<br>
          If you didn't create an account, you can safely ignore this email.
        </p>
        <hr style="border-color:rgba(232,160,32,0.15);margin:20px 0"/>
        <p style="font-size:11px;color:#B0A080">
          Can't click the button? Copy this link:<br>
          <span style="color:#E8A020;word-break:break-all">${link}</span>
        </p>
      </div>`,
  });
}

// ── Password reset ────────────────────────────────────────────────────────────
async function sendPasswordResetEmail(to, name, token) {
  const link = `${process.env.CLIENT_URL}/reset-password.html?token=${token}`;

  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to,
    subject: "Reset your Odoo Cafe password",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;background:#1E1A14;color:#F5EDD8;padding:32px;border-radius:12px">
        <h1 style="color:#E8A020;font-size:22px;margin-bottom:4px">Odoo <em>Cafe</em></h1>
        <p>Hi <strong>${name}</strong>,</p>
        <p style="margin:12px 0">We received a request to reset your password. Click below to set a new one.</p>
        <a href="${link}"
           style="display:inline-block;margin:20px 0;padding:12px 28px;background:#E8A020;color:#12100D;border-radius:8px;font-weight:700;text-decoration:none;font-size:14px">
          Reset Password →
        </a>
        <p style="font-size:12px;color:#B0A080;margin-top:20px">This link expires in <strong>1 hour</strong>. If you didn't request a reset, ignore this email.</p>
      </div>`,
  });
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
