/**
 * Forgot Password email template.
 * Includes OTP display and security context table (IP, Location, Browser, OS).
 *
 * @param {{ name: string, otp: string, clientInfo: { ip: string, location: string, browser: string, os: string } }} params
 * @returns {string} HTML email string
 */
const forgotPasswordTemplate = ({ name, otp, clientInfo = {} }) => {
  const { ip = "Unknown", location = "Unknown", browser = "Unknown", os = "Unknown" } = clientInfo;

  const rows = [
    ["IP Address", ip],
    ["Location", location],
    ["Browser", browser],
    ["Operating System", os],
  ];

  const tableRows = rows
    .map(
      ([label, value], i) => `
      <tr style="background-color:${i % 2 === 0 ? "#f8fafc" : "#ffffff"};">
        <td style="padding:11px 16px;font-size:13px;font-weight:600;color:#64748b;width:45%;border-bottom:1px solid #e2e8f0;">${label}</td>
        <td style="padding:11px 16px;font-size:13px;color:#1e293b;border-bottom:1px solid #e2e8f0;">${value}</td>
      </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Password Reset — TechBlog</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;padding:40px 16px;">
    <tr>
      <td align="center">

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

          <!-- Amber/Orange gradient header -->
          <tr>
            <td style="background:linear-gradient(135deg,#F59E0B 0%,#D97706 100%);padding:44px 40px;text-align:center;">
              <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:50%;width:72px;height:72px;line-height:72px;text-align:center;margin-bottom:16px;">
                <span style="font-size:36px;">🔑</span>
              </div>
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">TechBlog</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;letter-spacing:1px;text-transform:uppercase;">Password Reset</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:44px 40px 32px;">

              <p style="margin:0 0 8px;font-size:22px;font-weight:600;color:#1e293b;">Hello, ${name}!</p>
              <h2 style="margin:0 0 20px;font-size:18px;font-weight:600;color:#D97706;">Password Reset Request</h2>

              <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#475569;">
                We received a request to reset the password for your TechBlog account. Use the code below to complete the process. This code is valid for <strong>10 minutes</strong>.
              </p>

              <!-- OTP Box -->
              <div style="background:#1e293b;border-radius:12px;padding:32px;text-align:center;margin:0 0 28px;">
                <p style="margin:0 0 12px;font-size:12px;color:#94a3b8;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Password Reset Code</p>
                <p style="margin:0;font-size:48px;font-weight:700;letter-spacing:16px;color:#F59E0B;font-family:'Courier New',Courier,monospace;">${otp}</p>
              </div>

              <!-- Expiry warning -->
              <div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:0 8px 8px 0;padding:14px 18px;margin:0 0 28px;">
                <p style="margin:0;font-size:14px;color:#c2410c;font-weight:600;">⏱ This code expires in <strong>10 minutes</strong>.</p>
              </div>

              <!-- Security context header -->
              <p style="margin:0 0 10px;font-size:14px;font-weight:600;color:#475569;">Request details:</p>

              <!-- Security info table -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin:0 0 28px;">
                ${tableRows}
              </table>

              <!-- Didn't request this -->
              <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:18px 20px;">
                <p style="margin:0;font-size:14px;color:#dc2626;font-weight:700;">
                  🚨 Didn't request this?
                </p>
                <p style="margin:8px 0 0;font-size:14px;color:#b91c1c;line-height:1.6;">
                  If you did not request a password reset, your account may be at risk. Please change your password immediately and enable additional security measures.
                </p>
              </div>

            </td>
          </tr>

          <tr>
            <td style="padding:0 40px;"><hr style="border:none;border-top:1px solid #e2e8f0;" /></td>
          </tr>

          <tr>
            <td style="padding:24px 40px 36px;text-align:center;">
              <p style="margin:0;font-size:13px;color:#94a3b8;">© 2026 TechBlog. Sent with ♥ for security.</p>
              <p style="margin:8px 0 0;font-size:12px;color:#cbd5e1;">This is an automated message — please do not reply to this email.</p>
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

module.exports = { forgotPasswordTemplate };