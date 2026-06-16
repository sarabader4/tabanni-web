import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable, passwordResetTokensTable } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";
import { signToken } from "../middlewares/requireAuth";
import { logger } from "../lib/logger";
import { sendNotificationEmail } from "../lib/mailer";
import crypto from "crypto";

const router: IRouter = Router();

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "none" as const,
  secure: true,
  maxAge: 30 * 24 * 60 * 60 * 1000,
  path: "/",
};

router.post("/auth/register", async (req, res) => {
  try {
    const { fullName, email, phone, city, password } = req.body as {
      fullName?: string;
      email?: string;
      phone?: string;
      city?: string;
      password?: string;
    };

    if (!fullName || !email || !password) {
      res.status(400).json({ error: "validation_error", message: "fullName, email, and password are required" });
      return;
    }
    if (!phone || !phone.trim()) {
      res.status(400).json({ error: "validation_error", message: "Phone number is required" });
      return;
    }
    if (!city || !city.trim()) {
      res.status(400).json({ error: "validation_error", message: "City is required" });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: "validation_error", message: "Password must be at least 6 characters long" });
      return;
    }
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[^a-zA-Z0-9]/.test(password)) {
      res.status(400).json({ error: "validation_error", message: "Password must contain at least one uppercase letter, lowercase letter, number, and symbol" });
      return;
    }

    const existing = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, email.toLowerCase().trim()));
    if (existing.length > 0) {
      res.status(409).json({ error: "conflict", message: "An account with this email already exists" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await db.insert(usersTable).values({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() ?? null,
      city: city.trim(),
      passwordHash,
      role: "user",
    }).returning();

    const token = signToken(user.id, user.role ?? "user");
    res.cookie("token", token, COOKIE_OPTS);
    res.status(201).json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      city: user.city,
      role: user.role,
      isOnboardingCompleted: user.isOnboardingCompleted,
      emailNotificationsEnabled: user.emailNotificationsEnabled,
    });
  } catch (err) {
    logger.error({ err }, "Error during registration");
    res.status(500).json({ error: "internal_error", message: "Registration failed" });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      res.status(400).json({ error: "validation_error", message: "email and password are required" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase().trim()));
    if (!user || !user.passwordHash) {
      res.status(401).json({ error: "unauthorized", message: "Invalid email or password" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "unauthorized", message: "Invalid email or password" });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ error: "forbidden", message: "Account has been deactivated" });
      return;
    }

    const token = signToken(user.id, user.role ?? "user");
    res.cookie("token", token, COOKIE_OPTS);
    res.json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      country: user.country,
      city: user.city,
      avatarUrl: user.avatarUrl,
      role: user.role,
      isOnboardingCompleted: user.isOnboardingCompleted,
      emailNotificationsEnabled: user.emailNotificationsEnabled,
    });
  } catch (err) {
    logger.error({ err }, "Error during login");
    res.status(500).json({ error: "internal_error", message: "Login failed" });
  }
});

router.post("/auth/logout", (_req, res) => {
  res.clearCookie("token", { path: "/" });
  res.json({ success: true, message: "Logged out successfully" });
});

router.post("/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body as { email?: string };
    if (!email) {
      res.status(400).json({ error: "validation_error", message: "Email is required" });
      return;
    }

    const [user] = await db.select({ id: usersTable.id, email: usersTable.email, fullName: usersTable.fullName })
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase().trim()));

    // Always return success to prevent email enumeration
    if (!user) {
      res.json({ success: true, message: "If an account exists with this email, you will receive a reset link." });
      return;
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Invalidate old tokens
    await db.delete(passwordResetTokensTable)
      .where(eq(passwordResetTokensTable.userId, user.id));

    // Save new token
    await db.insert(passwordResetTokensTable).values({
      userId: user.id,
      token,
      expiresAt,
    });

    const baseUrl = process.env.APP_URL ?? "https://web-production-7fb7f.up.railway.app";
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    await sendNotificationEmail({
      to: user.email,
      type: "password_reset",
      title: "Reset Your Password",
      message: `Hello ${user.fullName},<br><br>You requested to reset your password. Click the button below to set a new password. This link will expire in 1 hour.<br><br><a href="${resetLink}" style="display:inline-block;background:#FA8D29;color:#fff;padding:12px 28px;border-radius:12px;text-decoration:none;font-weight:700;">Reset Password</a><br><br>If you didn't request this, please ignore this email.`,
    });

    logger.info({ userId: user.id }, "Password reset email sent");
    res.json({ success: true, message: "If an account exists with this email, you will receive a reset link." });
  } catch (err) {
    logger.error({ err }, "Error in forgot password");
    res.status(500).json({ error: "internal_error", message: "Failed to process request" });
  }
});

router.post("/auth/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body as { token?: string; password?: string };

    if (!token || !password) {
      res.status(400).json({ error: "validation_error", message: "Token and password are required" });
      return;
    }

    if (password.length < 6 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[^a-zA-Z0-9]/.test(password)) {
      res.status(400).json({ error: "validation_error", message: "Password must contain at least one uppercase letter, lowercase letter, number, and symbol" });
      return;
    }

    const [resetToken] = await db.select()
      .from(passwordResetTokensTable)
      .where(and(
        eq(passwordResetTokensTable.token, token),
        eq(passwordResetTokensTable.used, false),
        gt(passwordResetTokensTable.expiresAt, new Date()),
      ));

    if (!resetToken) {
      res.status(400).json({ error: "invalid_token", message: "This reset link is invalid or has expired." });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await db.update(usersTable)
      .set({ passwordHash })
      .where(eq(usersTable.id, resetToken.userId));

    await db.update(passwordResetTokensTable)
      .set({ used: true })
      .where(eq(passwordResetTokensTable.id, resetToken.id));

    logger.info({ userId: resetToken.userId }, "Password reset successful");
    res.json({ success: true, message: "Password has been reset successfully." });
  } catch (err) {
    logger.error({ err }, "Error in reset password");
    res.status(500).json({ error: "internal_error", message: "Failed to reset password" });
  }
});

export default router;