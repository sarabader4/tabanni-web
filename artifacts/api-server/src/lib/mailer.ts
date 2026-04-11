import nodemailer from "nodemailer";
import { logger } from "./logger";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT ?? "587", 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM ?? "noreply@tabanni.com";

function createTransport() {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    logger.warn("SMTP credentials not configured (SMTP_HOST, SMTP_USER, SMTP_PASS). Emails will not be sent.");
    return null;
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

export async function sendNotificationEmail({
  to,
  type,
  title,
  message,
  whatsappLink,
  requestTypeName,
}: {
  to: string;
  type?: string;
  title?: string;
  message?: string;
  whatsappLink?: string;
  requestTypeName?: string;
}): Promise<void> {
  const transport = createTransport();
  if (!transport) return;

  const isApproval = type === "adoption_accepted" || type === "foster_accepted";

  if (isApproval && whatsappLink) {
    const subjectEn = title ?? "Your Request Has Been Approved";
    const requestLabel = requestTypeName === "adoption" ? "adoption" : "foster";
    const requestLabelAr = requestTypeName === "adoption" ? "التبني" : "الحضانة المؤقتة";

    const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subjectEn}</title>
</head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#00B8A0;padding:28px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">🎉 Congratulations!</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Your ${requestLabel} request has been approved</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px;">
              <p style="margin:0 0 16px;color:#1E2A3A;font-size:15px;line-height:1.6;">
                ${message ?? `Your ${requestLabel} request has been approved!`}
              </p>
              <p style="margin:0 0 16px;color:#4B5563;font-size:14px;line-height:1.6;">
                To complete the ${requestLabel} process, please contact the owner directly via WhatsApp to arrange the next steps.
              </p>
              <div style="text-align:center;margin:28px 0;">
                <a href="${whatsappLink}" target="_blank" style="display:inline-block;background:#25D366;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:15px;font-weight:700;letter-spacing:0.3px;">
                  💬 Contact via WhatsApp
                </a>
              </div>
              <hr style="border:none;border-top:1px solid #f0f0f0;margin:24px 0;" />
              <p style="margin:0;color:#9CA3AF;font-size:12px;text-align:center;line-height:1.6;" dir="rtl">
                تهانينا! تمت الموافقة على طلب ${requestLabelAr} الخاص بك.<br/>
                يرجى التواصل مع المالك عبر واتساب لإتمام الإجراءات.
              </p>
              <div style="text-align:center;margin:16px 0 0;">
                <a href="${whatsappLink}" target="_blank" style="display:inline-block;background:#25D366;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:12px;font-size:14px;font-weight:700;" dir="rtl">
                  💬 تواصل عبر واتساب
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background:#f5f7fa;padding:16px 32px;text-align:center;">
              <p style="margin:0;color:#9CA3AF;font-size:11px;">
                This email was sent by Tabanni · <a href="https://tabanni.com" style="color:#00B8A0;text-decoration:none;">tabanni.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const textBody = [
      subjectEn,
      "",
      message ?? `Your ${requestLabel} request has been approved!`,
      "",
      "To complete the process, please contact the owner via WhatsApp:",
      whatsappLink,
      "",
      "---",
      `تهانينا! يرجى التواصل مع المالك عبر واتساب: ${whatsappLink}`,
    ].join("\n");

    try {
      await transport.sendMail({
        from: SMTP_FROM,
        to,
        subject: subjectEn,
        text: textBody,
        html: htmlBody,
      });
      logger.info({ to, type }, "Approval notification email sent");
    } catch (err) {
      logger.error({ err, to }, "Failed to send approval notification email");
    }
    return;
  }

  try {
    await transport.sendMail({
      from: SMTP_FROM,
      to,
      subject: title ?? "New Notification",
      text: message
        ? `${title ? title + "\n\n" : ""}${message}`
        : "There is a notification waiting for you. Please log in to your account to view more details.",
    });
    logger.info({ to }, "Notification email sent");
  } catch (err) {
    logger.error({ err, to }, "Failed to send notification email");
  }
}

export async function sendVolunteerStatusEmail({
  to,
  userName,
  status,
}: {
  to: string;
  userName: string;
  status: "accepted" | "rejected";
}): Promise<void> {
  const transport = createTransport();
  if (!transport) return;

  const statusLabel = status === "accepted" ? "Accepted" : "Rejected";
  const messageBody = status === "accepted"
    ? "Congratulations! Your volunteer application has been accepted. We look forward to working with you."
    : "Thank you for your interest. Unfortunately, your volunteer application has been rejected at this time. You are welcome to reapply in the future.";

  try {
    await transport.sendMail({
      from: SMTP_FROM,
      to,
      subject: `Volunteer Application ${statusLabel}`,
      text: [
        `Hello ${userName},`,
        "",
        messageBody,
        "",
        "Thank you for your interest in Tabanni.",
      ].join("\n"),
    });
    logger.info({ to, status }, "Volunteer status email sent");
  } catch (err) {
    logger.error({ err, to }, "Failed to send volunteer status email");
  }
}

export async function sendPetStatusEmail({
  to,
  userName,
  petName,
  status,
  message,
}: {
  to: string;
  userName: string;
  petName: string;
  status: "accepted" | "rejected";
  message: string;
}): Promise<void> {
  const transport = createTransport();
  if (!transport) return;

  const statusLabel = status === "accepted" ? "Approved" : "Rejected";

  try {
    await transport.sendMail({
      from: SMTP_FROM,
      to,
      subject: "Pet Submission Status Update",
      text: [
        `Hello ${userName},`,
        "",
        `We have an update on your pet submission for "${petName}".`,
        "",
        `Status: ${statusLabel}`,
        "",
        message,
        "",
        "Thank you for using Tabanni.",
      ].join("\n"),
    });
    logger.info({ to, petName, status }, "Pet status email sent");
  } catch (err) {
    logger.error({ err, to, petName }, "Failed to send pet status email");
  }
}
