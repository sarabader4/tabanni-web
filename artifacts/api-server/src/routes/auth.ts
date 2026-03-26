import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken } from "../middlewares/requireAuth";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  path: "/",
};

router.post("/auth/register", async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body as {
      fullName?: string;
      email?: string;
      phone?: string;
      password?: string;
    };

    if (!fullName || !email || !password) {
      res.status(400).json({ error: "validation_error", message: "fullName, email, and password are required" });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: "validation_error", message: "Password must be at least 6 characters" });
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
      role: user.role,
      isOnboardingCompleted: user.isOnboardingCompleted,
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
    });
  } catch (err) {
    logger.error({ err }, "Error during login");
    res.status(500).json({ error: "internal_error", message: "Login failed" });
  }
});

router.post("/auth/logout", (_req, res) => {
  res.clearCookie("token", { path: "/" });
  res.json({ message: "Logged out successfully" });
});

export default router;
