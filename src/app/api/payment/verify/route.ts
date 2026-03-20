import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

async function getPayPalAccessToken(): Promise<string> {
  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch("https://api.paypal.com/v1/oauth2/token", {
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

export async function POST(req: Request) {
  try {
    const { orderId, accessToken } = await req.json();
    if (!orderId || !accessToken) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    // 1. Get PayPal token
    const paypalToken = await getPayPalAccessToken();

    // 2. Capture order
    const captureRes = await fetch(
      `https://api.paypal.com/v2/checkout/orders/${orderId}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${paypalToken}`,
        },
      }
    );
    const captureData = await captureRes.json();

    if (captureData.status !== "COMPLETED") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    // 3. Verify user identity via their JWT
    const userClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
    );
    const { data: userData } = await userClient.auth.getUser();
    if (!userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 4. Update using service role key (bypasses RLS)
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { error } = await adminClient
      .from("profiles")
      .update({ is_premium: true })
      .eq("id", userData.user.id);

    if (error) {
      return NextResponse.json({ error: "DB update failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
