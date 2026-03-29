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
