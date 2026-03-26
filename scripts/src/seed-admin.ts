import { db, usersTable, pool } from "@workspace/db";
import bcrypt from "bcryptjs";

async function seedAdmin() {
  console.log("🔐 Seeding admin user...");

  const email = "sarabader4b@gmail.com";
  const password = "sara1234";
  const passwordHash = await bcrypt.hash(password, 12);

  // Use raw SQL to avoid importing drizzle-orm operators directly
  const result = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [email]
  );

  if (result.rows.length > 0) {
    await pool.query(
      "UPDATE users SET password_hash = $1, role = 'admin', is_onboarding_completed = true WHERE email = $2",
      [passwordHash, email]
    );
    console.log("✅ Admin user updated (password refreshed):", email);
  } else {
    await db.insert(usersTable).values({
      fullName: "Sara Bader",
      email,
      phone: "+962799476182",
      country: "Jordan",
      city: "Amman",
      role: "admin",
      passwordHash,
      isOnboardingCompleted: true,
    });
    console.log("✅ Admin user created:", email);
  }

  await pool.end();
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error("❌ Failed to seed admin:", err);
  process.exit(1);
});
