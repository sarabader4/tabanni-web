import type Stripe from "stripe";
import { getStripeSecretKey, getUncachableStripeClient } from "./stripeClient";
import { db, donationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./lib/logger";

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        "STRIPE WEBHOOK ERROR: Payload must be a Buffer. " +
        "Received type: " + typeof payload + ". " +
        "This usually means express.json() parsed the body before reaching this handler. " +
        "FIX: Ensure webhook route is registered BEFORE app.use(express.json())."
      );
    }

    const stripe = await getUncachableStripeClient();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not set — refusing to process unsigned webhook");
    }

    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

    await WebhookHandlers.handleEvent(event);
  }

  private static async handleEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const intent = event.data.object as Stripe.PaymentIntent;
        await db
          .update(donationsTable)
          .set({ status: "success" })
          .where(eq(donationsTable.stripePaymentIntentId, intent.id));
        logger.info({ intentId: intent.id }, "Donation marked success via webhook");
        break;
      }
      case "payment_intent.payment_failed":
      case "payment_intent.canceled": {
        const intent = event.data.object as Stripe.PaymentIntent;
        await db
          .update(donationsTable)
          .set({ status: "failed" })
          .where(eq(donationsTable.stripePaymentIntentId, intent.id));
        logger.info({ intentId: intent.id, type: event.type }, "Donation marked failed via webhook");
        break;
      }
      default:
        logger.info({ type: event.type }, "Unhandled Stripe event type");
    }
  }
}
