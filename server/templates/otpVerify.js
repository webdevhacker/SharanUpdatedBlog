/**
 * OTP Verification email template.
 * Returns a fully inline-styled HTML string.
 *
 * @param {{ name: string, otp: string }} params
 * @returns {string} HTML email string
 */
const otpVerifyTemplate = ({ name, otp }) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify Your Email — TechBlog</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;padding:40px 16px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

          <!-- Header gradient -->
          <tr>
            <td style="background:linear-gradient(135deg,#4F46E5 0%,#7C3AED 100%);padding:44px 40px;text-align:center;">
              <!-- Shield icon SVG -->
              <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:50%;width:72px;height:72px;line-height:72px;text-align:center;margin-bottom:16px;">
                <span style="font-size:36px;">🔐</span>
              </div>
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">TechBlog</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.80);font-size:14px;letter-spacing:1px;text-transform:uppercase;">Email Verification</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:44px 40px 32px;">

              <p style="margin:0 0 8px;font-size:22px;font-weight:600;color:#1e293b;">Hello, ${name}! 👋</p>
              <h2 style="margin:0 0 20px;font-size:18px;font-weight:600;color:#4F46E5;">Verify Your Email Address</h2>

              <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#475569;">
                Welcome to TechBlog! We're excited to have you on board. To complete your registration and activate your account, please use the verification code below.
              </p>

              <!-- OTP Box -->
              <div style="background:#1e293b;border-radius:12px;padding:32px;text-align:center;margin:0 0 28px;">
                <p style="margin:0 0 12px;font-size:12px;color:#94a3b8;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Your Verification Code</p>
                <p style="margin:0;font-size:48px;font-weight:700;letter-spacing:16px;color:#6366f1;font-family:'Courier New',Courier,monospace;">${otp}</p>
              </div>

              <!-- Expiry warning -->
              <div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:0 8px 8px 0;padding:14px 18px;margin:0 0 28px;">
                <p style="margin:0;font-size:14px;color:#c2410c;font-weight:600;">
                  ⏱ This code expires in <strong>10 minutes</strong>.
                </p>
              </div>

              <!-- Security note -->
              <p style="margin:0;font-size:14px;line-height:1.7;color:#64748b;background:#f8fafc;border-radius:8px;padding:16px;">
                🔒 <strong>Security note:</strong> If you did not create a TechBlog account, please ignore this email. Your email address will not be used without verification.
              </p>

            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;"><hr style="border:none;border-top:1px solid #e2e8f0;" /></td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px 36px;text-align:center;">
              <p style="margin:0;font-size:13px;color:#94a3b8;">
                © 2026 TechBlog. Sent with ♥ for security.
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:#cbd5e1;">
                This is an automated message — please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `.trim();
};

module.exports = { otpVerifyTemplate };