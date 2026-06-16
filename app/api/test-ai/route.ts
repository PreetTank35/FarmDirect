/**
 * GET /api/test-ai
 * Quick health-check for the OpenRouter integration.
 * Remove or protect this route before deploying to production.
 */

import { NextResponse } from "next/server";
import { prompt } from "@/lib/ai/openrouter";
import { MODELS } from "@/lib/ai/models";

export async function GET() {
  try {
    const { text, raw } = await prompt(
      'Say "FarmDirect AI is online!" and nothing else.',
      "You are a helpful assistant.",
      { model: MODELS.default, maxTokens: 30 }
    );

    return NextResponse.json({
      status: "ok",
      model: raw.model,
      response: text,
      usage: raw.usage ?? null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}
