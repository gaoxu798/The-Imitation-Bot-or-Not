import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

async function getPayPalAccessToken(): Promise<string> {
  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");
  const res = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  return data.access_token;
}

async function verifySignature(
  headers: Headers,
  rawBody: string,
  accessToken: string
): Promise<boolean> {
  const res = await fetch(
    "https://api-m.sandbox.paypal.com/v1/notifications/verify-webhook-signature",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        auth_algo: headers.get("paypal-auth-algo"),
        cert_url: headers.get("paypal-cert-url"),
        transmission_id: headers.get("paypal-transmission-id"),
        transmission_sig: headers.get("paypal-transmission-sig"),
        transmission_time: headers.get("paypal-transmission-time"),
        webhook_id: process.env.PAYPAL_WEBHOOK_ID,
        webhook_event: JSON.parse(rawBody),
      }),
    }
  );
  const data = await res.json();
  return data.verification_status === "SUCCESS";
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const accessToken = await getPayPalAccessToken();

  const valid = await verifySignature(req.headers, rawBody, accessToken);
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const eventType: string = event.event_type;
  const resource = event.resource;

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 付款成功 - 解锁 premium
  if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
    const userId = resource.purchase_units?.[0]?.custom_id
      ?? resource.custom_id
      ?? null;
    if (userId) {
      await adminClient
        .from("profiles")
        .update({ is_premium: true })
        .eq("id", userId);
    }
  }

  // 退款/争议 - 撤销 premium
  if (
    eventType === "PAYMENT.CAPTURE.REFUNDED" ||
    eventType === "PAYMENT.CAPTURE.REVERSED"
  ) {
    const userId = resource.custom_id ?? null;
    if (userId) {
      await adminClient
        .from("profiles")
        .update({ is_premium: false })
        .eq("id", userId);
    }
  }

  return NextResponse.json({ received: true });
}
