import { NextRequest, NextResponse } from "next/server";
import { isContentBlocked } from "@/lib/content-filter";

export async function POST(request: NextRequest) {
  const { messages } = await request.json();

  // Check if the user's latest message contains blocked content
  const lastUserMsg = [...messages].reverse().find((m: { role: string }) => m.role === "user");
  if (lastUserMsg && isContentBlocked(lastUserMsg.content)) {
    return NextResponse.json({
      answer: "dude what? lets keep it normal lol",
    });
  }

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
    let answer = data.choices?.[0]?.message?.content || "...";

    // Filter AI response as well
    if (isContentBlocked(answer)) {
      answer = "haha nice try, ask me something else";
    }

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("AI request failed:", error);
    return NextResponse.json(
      { error: "AI service unavailable" },
      { status: 503 }
    );
  }
}
