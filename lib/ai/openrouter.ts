/**
 * OpenRouter client helper — OpenAI-compatible chat completions API.
 * Docs: https://openrouter.ai/docs
 *
 * All calls are SERVER-SIDE ONLY (uses process.env.OPENROUTER_API_KEY).
 * Never import this file in client components.
 */

import { MODELS, type ModelId } from "./models";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenRouterOptions {
  /** The OpenRouter model identifier. Defaults to MODELS.default */
  model?: ModelId;
  /** Maximum tokens to generate. Defaults to 1024 */
  maxTokens?: number;
  /** Temperature 0–2. Defaults to 0.7 */
  temperature?: number;
  /**
   * Optional — shown in openrouter.ai/activity for your key.
   * Set to your site URL in production.
   */
  siteUrl?: string;
  /** Optional — shown in openrouter.ai/activity for your key. */
  siteName?: string;
}

export interface OpenRouterResponse {
  /** The text content of the first choice */
  text: string;
  /** Full raw response from OpenRouter */
  raw: OpenRouterRawResponse;
}

interface OpenRouterRawResponse {
  id: string;
  model: string;
  choices: Array<{
    message: { role: string; content: string };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// ─── Client ───────────────────────────────────────────────────────────────────

/**
 * Send a chat completion request to OpenRouter.
 *
 * @example
 * ```ts
 * import { openrouter } from "@/lib/ai/openrouter";
 *
 * const { text } = await openrouter([
 *   { role: "system", content: "You are a helpful farming assistant." },
 *   { role: "user",   content: "What is the best season to grow tomatoes?" },
 * ]);
 * ```
 */
export async function openrouter(
  messages: ChatMessage[],
  options: OpenRouterOptions = {}
): Promise<OpenRouterResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const baseUrl =
    process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";

  if (!apiKey) {
    throw new Error(
      "[OpenRouter] OPENROUTER_API_KEY is not set. " +
        "Add it to your .env.local file."
    );
  }

  const {
    model = MODELS.default,
    maxTokens = 1024,
    temperature = 0.7,
    siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    siteName = "FarmDirect",
  } = options;

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      // OpenRouter-specific headers (used in activity dashboard & routing)
      "HTTP-Referer": siteUrl,
      "X-Title": siteName,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `[OpenRouter] API error ${response.status} ${response.statusText}: ${errorBody}`
    );
  }

  const raw: OpenRouterRawResponse = await response.json();

  const text = raw.choices?.[0]?.message?.content ?? "";

  if (!text) {
    throw new Error(
      "[OpenRouter] Received an empty response. " +
        `Model: ${model}, finish_reason: ${raw.choices?.[0]?.finish_reason}`
    );
  }

  return { text, raw };
}

// ─── Convenience helpers ───────────────────────────────────────────────────────

/**
 * Shorthand for a single user prompt with an optional system prompt.
 *
 * @example
 * ```ts
 * const { text } = await prompt(
 *   "Summarise this product listing in 2 sentences.",
 *   "You are a concise copywriter."
 * );
 * ```
 */
export async function prompt(
  userMessage: string,
  systemMessage?: string,
  options?: OpenRouterOptions
): Promise<OpenRouterResponse> {
  const messages: ChatMessage[] = [];
  if (systemMessage) messages.push({ role: "system", content: systemMessage });
  messages.push({ role: "user", content: userMessage });
  return openrouter(messages, options);
}
