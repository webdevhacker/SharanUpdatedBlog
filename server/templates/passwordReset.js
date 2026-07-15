/**
 * Password Reset Confirmation email template.
 * Sent after a successful password reset to confirm the action.
 *
 * @param {{ name: string, clientInfo: { ip: string, location: string, browser: string, os: string, timestamp: string } }} params
 * @returns {string} HTML email string
 */
const passwordResetTemplate = ({ name, clientInfo = {} }) => {
  const {
    ip = "Unknown",
    location = "Unknown",
    browser = "Unknown",
    os = "Unknown",
    timestamp = new Date().toLocaleString(),
  } = clientInfo;

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

  const rows = [
    ["IP Address", ip],
    ["Location", location],
    ["Browser", browser],
    ["Operating System", os],
    ["Date &amp; Time", timestamp],
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
  <title>Password Reset Successful — TechBlog</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;padding:40px 16px;">
    <tr>
      <td align="center">

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

          <!-- Teal/Emerald gradient header -->
          <tr>
            <td style="background:linear-gradient(135deg,#14B8A6 0%,#0F766E 100%);padding:44px 40px;text-align:center;">
              <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:50%;width:72px;height:72px;line-height:72px;text-align:center;margin-bottom:16px;">
                <span style="font-size:36px;">🔒</span>
              </div>
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">TechBlog</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;letter-spacing:1px;text-transform:uppercase;">Password Updated</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:44px 40px 32px;">

              <p style="margin:0 0 8px;font-size:22px;font-weight:600;color:#1e293b;">Hello, ${name}!</p>
              <h2 style="margin:0 0 20px;font-size:18px;font-weight:600;color:#0F766E;">Password Successfully Reset</h2>

              <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#475569;">
                Your TechBlog account password was recently changed. Here are the details of the action:
              </p>

              <!-- Security info table -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin:0 0 28px;">
                ${tableRows}
              </table>

              <!-- Success note -->
              <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:16px 20px;margin:0 0 20px;">
                <p style="margin:0;font-size:14px;color:#166534;font-weight:700;">✅ Password changed successfully</p>
                <p style="margin:6px 0 0;font-size:14px;color:#15803d;line-height:1.6;">
                  Your new password is now active. Use it to sign in to your account.
                </p>
              </div>

              <!-- If this wasn't you -->
              <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:16px 20px;margin:0 0 28px;">
                <p style="margin:0;font-size:14px;color:#dc2626;font-weight:700;">🚨 If this wasn't you</p>
                <p style="margin:6px 0 0;font-size:14px;color:#b91c1c;line-height:1.6;">
                  If you did not make this change, your account may be compromised. Please contact support immediately and reset your password.
                </p>
                <div style="margin-top:16px;text-align:center;">
                  <a href="${clientUrl}/auth/forgot-password"
                     style="display:inline-block;background:#dc2626;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 28px;border-radius:8px;letter-spacing:0.3px;">
                    🔑 Reset Password Now
                  </a>
                </div>
              </div>

              <!-- Sessions note -->
              <p style="margin:0;font-size:13px;color:#94a3b8;text-align:center;font-style:italic;">
                For security, all other active sessions have been signed out.
              </p>

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

module.exports = { passwordResetTemplate };