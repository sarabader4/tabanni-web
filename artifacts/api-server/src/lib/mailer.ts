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
