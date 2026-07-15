/**
 * Email sending utility using Nodemailer.
 *
 * - In production (SMTP_HOST set): uses the configured SMTP credentials.
 * - In development / no SMTP_HOST: auto-creates an Ethereal test account
 *   and prints a preview URL to the console after each send.
 */

const nodemailer = require("nodemailer");
const { otpVerifyTemplate } = require("../templates/otpVerify");
const { forgotPasswordTemplate } = require("../templates/forgotPassword");
const { loginAlertTemplate } = require("../templates/loginAlert");
const { passwordResetTemplate } = require("../templates/passwordReset");

// Module-level transporter — initialised once and reused.
let transporter = null;

/**
 * Lazily create and cache the Nodemailer transporter.
 * Uses real SMTP when SMTP_HOST is provided, otherwise Ethereal.
 *
 * @returns {Promise<import("nodemailer").Transporter>}
 */
const getTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST) {
    // --- Real SMTP ---
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465, // true for port 465 (SSL)
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    console.log("📧  Email transporter configured with SMTP:", process.env.SMTP_HOST);
  } else {
    // --- Ethereal test account (development / CI) ---
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    console.log("📧  Email transporter configured with Ethereal test account.");
    console.log("    User:", testAccount.user);
  }

  return transporter;
};

/**
 * Core send function.
 *
 * @param {{ to: string, subject: string, html: string }} options
 * @returns {Promise<void>}
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    const transport = await getTransporter();

    const fromAddress =
      process.env.SMTP_FROM || '"TechBlog" <noreply@techblog.dev>';

    const info = await transport.sendMail({
      from: fromAddress,
      to,
      subject,
      html,
    });

    // Print Ethereal preview URL so developers can inspect the email
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log("📬  Email preview:", previewUrl);
    }
  } catch (error) {
    // Log but do not throw — a failed email should not crash the request
    console.error("❌  Failed to send email:", error.message);
  }
};

// ---------------------------------------------------------------------------
// Convenience helpers — each builds the HTML from a template then sends it.
// ---------------------------------------------------------------------------

/**
 * Send OTP email for account verification.
 *
 * @param {{ to: string, name: string, otp: string }} params
 */
const sendOTPVerifyEmail = async ({ to, name, otp }) => {
  const html = otpVerifyTemplate({ name, otp });
  await sendEmail({
    to,
    subject: "Verify your TechBlog account",
    html,
  });
};

/**
 * Send OTP email for password reset.
 *
 * @param {{ to: string, name: string, otp: string, clientInfo: object }} params
 */
const sendForgotPasswordEmail = async ({ to, name, otp, clientInfo }) => {
  const html = forgotPasswordTemplate({ name, otp, clientInfo });
  await sendEmail({
    to,
    subject: "TechBlog — Password Reset Request",
    html,
  });
};

/**
 * Send login alert email when a new sign-in is detected.
 *
 * @param {{ to: string, name: string, clientInfo: object }} params
 */
const sendLoginAlertEmail = async ({ to, name, clientInfo }) => {
  const html = loginAlertTemplate({ name, clientInfo });
  await sendEmail({
    to,
    subject: "TechBlog — New Sign-in Detected",
    html,
  });
};

/**
 * Send confirmation email after a successful password reset.
 *
 * @param {{ to: string, name: string, clientInfo: object }} params
 */
const sendPasswordResetEmail = async ({ to, name, clientInfo }) => {
  const html = passwordResetTemplate({ name, clientInfo });
  await sendEmail({
    to,
    subject: "TechBlog — Your Password Has Been Reset",
    html,
  });
};

module.exports = {
  sendEmail,
  sendOTPVerifyEmail,
  sendForgotPasswordEmail,
  sendLoginAlertEmail,
  sendPasswordResetEmail,
};
