import { Router, type IRouter } from "express";
import { db, donationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getUncachableStripeClient, getStripePublishableKey } from "../stripeClient";
import { Client, Environment, OrdersController, CheckoutPaymentIntent } from "@paypal/paypal-server-sdk";

const router: IRouter = Router();

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID ?? "";
const PAYPAL_SECRET = process.env.PAYPAL_SECRET ?? "";
const USE_SANDBOX = process.env.PAYPAL_SANDBOX !== "false";

function getPayPalClient(): Client {
  return new Client({
    clientCredentialsAuthCredentials: {
      oAuthClientId: PAYPAL_CLIENT_ID,
      oAuthClientSecret: PAYPAL_SECRET,
    },
    environment: USE_SANDBOX ? Environment.Sandbox : Environment.Production,
  });
}

router.get("/payments/config", async (req, res) => {
  let publishableKey = "";
  try {
    publishableKey = await getStripePublishableKey();
  } catch (err) {
    req.log.warn({ err }, "Stripe not configured — Stripe payments unavailable");
  }
  res.json({
    publishableKey,
    paypalClientId: PAYPAL_CLIENT_ID,
    stripeAvailable: Boolean(publishableKey),
    paypalAvailable: Boolean(PAYPAL_CLIENT_ID && PAYPAL_SECRET),
  });
});

router.post("/payments/stripe/create-intent", async (req, res) => {
  try {
    const { amount, donorName, donorPhone, frequency } = req.body as {
      amount: string | number;
      donorName: string;
      donorPhone?: string;
      frequency?: string;
    };

    if (!amount || !donorName) {
      return res.status(400).json({ error: "validation_error", message: "amount and donorName required" });
    }

    const amountJOD = parseFloat(String(amount));
    if (isNaN(amountJOD) || amountJOD <= 0) {
      return res.status(400).json({ error: "validation_error", message: "Invalid amount" });
    }

    const stripe = await getUncachableStripeClient();
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amountJOD * 100),
      currency: "jod",
      description: `Tabbani donation from ${donorName}`,
      metadata: { donorName, donorPhone: donorPhone ?? "", frequency: frequency ?? "one_time" },
    });

    const [donation] = await db.insert(donationsTable).values({
      donorName,
      donorPhone: donorPhone ?? null,
      amount: String(amountJOD),
      type: "monetary",
      paymentMethod: "Card",
      frequency: (frequency as "one_time" | "monthly") ?? "one_time",
      status: "pending",
      stripePaymentIntentId: intent.id,
    }).returning();

    res.json({ clientSecret: intent.client_secret, donationId: donation.id });
  } catch (err) {
    req.log.error({ err }, "Stripe create-intent error");
    res.status(500).json({ error: "payment_error", message: "Could not create payment intent" });
  }
});

router.post("/payments/stripe/confirm", async (req, res) => {
  try {
    const { paymentIntentId } = req.body as { paymentIntentId: string };
    if (!paymentIntentId) {
      return res.status(400).json({ error: "validation_error", message: "paymentIntentId required" });
    }
    const stripe = await getUncachableStripeClient();
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const status = intent.status === "succeeded" ? "success" : "failed";
    await db
      .update(donationsTable)
      .set({ status })
      .where(eq(donationsTable.stripePaymentIntentId, paymentIntentId));
    res.json({ ok: true, status });
  } catch (err) {
    req.log.error({ err }, "Stripe confirm error");
    res.status(500).json({ error: "internal_error", message: "Could not update donation status" });
  }
});

router.post("/payments/paypal/create-order", async (req, res) => {
  try {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
      return res.status(503).json({ error: "paypal_unavailable", message: "PayPal not configured" });
    }

    const { amount, donorName, donorPhone, frequency } = req.body as {
      amount: string | number;
      donorName: string;
      donorPhone?: string;
      frequency?: string;
    };

    if (!amount || !donorName) {
      return res.status(400).json({ error: "validation_error", message: "amount and donorName required" });
    }

    const amountJOD = parseFloat(String(amount));
    if (isNaN(amountJOD) || amountJOD <= 0) {
      return res.status(400).json({ error: "validation_error", message: "Invalid amount" });
    }

    // PayPal does not support JOD (ISO 4217). We use USD as the billing currency.
    // 1 JOD ≈ 1.41 USD (approximate exchange rate used for PayPal billing only).
    const JOD_TO_USD = 1.41;
    const amountUSD = (amountJOD * JOD_TO_USD).toFixed(2);

    const paypalClient = getPayPalClient();
    const ordersController = new OrdersController(paypalClient);

    const { result: order } = await ordersController.createOrder({
      body: {
        intent: CheckoutPaymentIntent.Capture,
        purchaseUnits: [
          {
            amount: {
              currencyCode: "USD",
              value: amountUSD,
            },
            description: `Tabbani donation from ${donorName} (${amountJOD} JOD)`,
          },
        ],
      },
      prefer: "return=representation",
    });

    if (!order.id) {
      throw new Error("PayPal order creation returned no ID");
    }

    const [donation] = await db.insert(donationsTable).values({
      donorName,
      donorPhone: donorPhone ?? null,
      amount: String(amountJOD),
      type: "monetary",
      paymentMethod: "PayPal",
      frequency: (frequency as "one_time" | "monthly") ?? "one_time",
      status: "pending",
      paypalOrderId: order.id,
    }).returning();

    res.json({ orderId: order.id, donationId: donation.id });
  } catch (err) {
    req.log.error({ err }, "PayPal create-order error");
    res.status(500).json({ error: "payment_error", message: "Could not create PayPal order" });
  }
});

router.post("/payments/paypal/capture-order", async (req, res) => {
  try {
    const { orderId } = req.body as { orderId: string };
    if (!orderId) {
      return res.status(400).json({ error: "validation_error", message: "orderId required" });
    }

    const paypalClient = getPayPalClient();
    const ordersController = new OrdersController(paypalClient);

    const { result: capture } = await ordersController.captureOrder({
      id: orderId,
      prefer: "return=representation",
    });

    const captureStatus = capture.status ?? "UNKNOWN";
    const success = captureStatus === "COMPLETED";

    await db
      .update(donationsTable)
      .set({ status: success ? "success" : "failed" })
      .where(eq(donationsTable.paypalOrderId, orderId));

    res.json({ success, status: captureStatus });
  } catch (err) {
    req.log.error({ err }, "PayPal capture error");
    res.status(500).json({ error: "payment_error", message: "Could not capture PayPal order" });
  }
});

router.post("/payments/cliq/confirm", async (req, res) => {
  try {
    const { amount, donorName, donorPhone, frequency } = req.body as {
      amount: string | number;
      donorName: string;
      donorPhone?: string;
      frequency?: string;
    };
    if (!amount || !donorName) {
      return res.status(400).json({ error: "validation_error", message: "amount and donorName required" });
    }
    const [donation] = await db.insert(donationsTable).values({
      donorName,
      donorPhone: donorPhone ?? null,
      amount: String(parseFloat(String(amount))),
      type: "monetary",
      paymentMethod: "CliQ",
      frequency: (frequency as "one_time" | "monthly") ?? "one_time",
      status: "pending",
    }).returning();
    res.status(201).json(donation);
  } catch (err) {
    req.log.error({ err }, "CliQ confirm error");
    res.status(500).json({ error: "internal_error", message: "Could not save donation" });
  }
});

export default router;
