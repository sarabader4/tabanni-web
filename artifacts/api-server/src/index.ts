import app from "./app";
import { logger } from "./lib/logger";
import { db, notificationsTable } from "@workspace/db";
import { lt } from "drizzle-orm";

async function purgeOldNotifications() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const result = await db.delete(notificationsTable)
      .where(lt(notificationsTable.createdAt, thirtyDaysAgo))
      .returning({ id: notificationsTable.id });
    if (result.length > 0) {
      logger.info({ count: result.length }, "Purged old notifications");
    }
  } catch (err) {
    logger.error({ err }, "Failed to purge old notifications");
  }
}

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  purgeOldNotifications();
  setInterval(purgeOldNotifications, 24 * 60 * 60 * 1000);
});
