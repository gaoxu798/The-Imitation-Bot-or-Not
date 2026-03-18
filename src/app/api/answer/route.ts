import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { messages } = await request.json();

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages,
        max_tokens: 200,
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DeepSeek API error:", errorText);
      return NextResponse.json(
        { error: "AI service error" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || "...";

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("AI request failed:", error);
    return NextResponse.json(
      { error: "AI service unavailable" },
      { status: 503 }
    );
  }
}
