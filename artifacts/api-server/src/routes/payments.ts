import { Router, type IRouter } from "express";
import { db, donationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getUncachableStripeClient, getStripePublishableKey } from "../stripeClient";

const router: IRouter = Router();

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID ?? "";
const PAYPAL_SECRET = process.env.PAYPAL_SECRET ?? "";
const PAYPAL_BASE =
  process.env.PAYPAL_SANDBOX === "false"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

async function getPayPalAccessToken(): Promise<string> {
  const credentials = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString("base64");
  const resp = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!resp.ok) throw new Error("PayPal auth failed");
  const data = await resp.json() as { access_token: string };
  return data.access_token;
}

router.get("/payments/config", async (req, res) => {
  try {
    const publishableKey = await getStripePublishableKey();
    res.json({ publishableKey, paypalClientId: PAYPAL_CLIENT_ID });
  } catch (err) {
    req.log.error({ err }, "Error fetching payment config");
    res.status(503).json({ error: "payment_unavailable", message: "Payment provider not configured" });
  }
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

    const token = await getPayPalAccessToken();
    const resp = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: { currency_code: "USD", value: amountJOD.toFixed(2) },
            description: `Tabbani donation from ${donorName}`,
          },
        ],
      }),
    });
    if (!resp.ok) {
      const err = await resp.text();
      req.log.error({ err }, "PayPal create order error");
      return res.status(502).json({ error: "paypal_error", message: "Could not create PayPal order" });
    }
    const order = await resp.json() as { id: string };

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

    const token = await getPayPalAccessToken();
    const resp = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const capture = await resp.json() as { status?: string };
    const success = capture.status === "COMPLETED";

    await db
      .update(donationsTable)
      .set({ status: success ? "success" : "failed" })
      .where(eq(donationsTable.paypalOrderId, orderId));

    res.json({ success, status: capture.status });
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
