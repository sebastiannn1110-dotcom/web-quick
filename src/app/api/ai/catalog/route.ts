import OpenAI from "openai";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { locales, type Locale } from "@/lib/constants";
import { rateLimit } from "@/lib/rate-limit";
import { searchProductsForAssistant } from "@/lib/ai/catalog-tools";

const requestSchema = z.object({
  locale: z.enum(locales).default("en"),
  message: z.string().trim().min(2).max(1000),
});

function clientKey(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

export async function POST(request: NextRequest) {
  if (!rateLimit(`ai:${clientKey(request)}`, 12, 60_000)) {
    return NextResponse.json(
      { ok: false, code: "rate_limited" },
      { status: 429 },
    );
  }

  const parsed = requestSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, code: "invalid_payload" },
      { status: 400 },
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    const results = await searchProductsForAssistant(
      { query: parsed.data.message, limit: 5 },
      parsed.data.locale as Locale,
    );

    return NextResponse.json({
      ok: true,
      mode: "search_only",
      message:
        "OpenAI is not configured. Returning server-side catalog search results only.",
      results,
    });
  }

  const results = await searchProductsForAssistant(
    { query: parsed.data.message, limit: 5 },
    parsed.data.locale as Locale,
  );

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-5-mini",
    input: [
      {
        role: "system",
        content:
          "You are a B2B catalog assistant. Use only the provided product records. Do not invent price, stock, compatibility, or specifications. Ask for RFQ when uncertain.",
      },
      {
        role: "user",
        content: `Locale: ${parsed.data.locale}\nUser request: ${parsed.data.message}\nServer catalog records: ${JSON.stringify(results.products)}`,
      },
    ],
    max_output_tokens: 700,
  });

  return NextResponse.json({
    ok: true,
    mode: "openai",
    message: response.output_text,
    results,
  });
}

