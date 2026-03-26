import Stripe from "stripe";

interface StripeConnectionSettings {
  publishable: string;
  secret: string;
}

interface ReplitConnectorItem {
  settings: StripeConnectionSettings;
}

interface ReplitConnectorResponse {
  items?: ReplitConnectorItem[];
}

async function getCredentials(): Promise<{ publishableKey: string; secretKey: string }> {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const replIdentity = process.env.REPL_IDENTITY;
  const webReplRenewal = process.env.WEB_REPL_RENEWAL;

  const xReplitToken = replIdentity
    ? "repl " + replIdentity
    : webReplRenewal
      ? "depl " + webReplRenewal
      : null;

  if (!xReplitToken) {
    throw new Error("X-Replit-Token not found: REPL_IDENTITY or WEB_REPL_RENEWAL required");
  }

  const connectorName = "stripe";
  const isProduction = process.env.REPLIT_DEPLOYMENT === "1";
  const targetEnvironment = isProduction ? "production" : "development";

  const url = new URL(`https://${hostname}/api/v2/connection`);
  url.searchParams.set("include_secrets", "true");
  url.searchParams.set("connector_names", connectorName);
  url.searchParams.set("environment", targetEnvironment);

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "X-Replit-Token": xReplitToken,
    },
  });

  const data: ReplitConnectorResponse = await response.json() as ReplitConnectorResponse;
  const item = data.items?.[0];

  if (!item?.settings?.publishable || !item?.settings?.secret) {
    throw new Error(`Stripe ${targetEnvironment} connection not found or missing keys`);
  }

  return {
    publishableKey: item.settings.publishable,
    secretKey: item.settings.secret,
  };
}

export async function getUncachableStripeClient(): Promise<Stripe> {
  const { secretKey } = await getCredentials();
  return new Stripe(secretKey);
}

export async function getStripePublishableKey(): Promise<string> {
  const { publishableKey } = await getCredentials();
  return publishableKey;
}

export async function getStripeSecretKey(): Promise<string> {
  const { secretKey } = await getCredentials();
  return secretKey;
}
