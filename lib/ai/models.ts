/**
 * OpenRouter model identifiers available on the free tier.
 * See: https://openrouter.ai/models?q=free
 *
 * Usage: import { MODELS } from "@/lib/ai/models"
 * Then pass MODELS.default (or any key) as the `model` param to openrouter().
 */

export const MODELS = {
  /** General-purpose default — fast, free, strong reasoning */
  default: "google/gemma-4-31b-it:free",

  /** Lightweight tasks: tagging, classification, short summaries */
  fast: "google/gemma-3-12b-it:free",

  /** Creative / long-form writing */
  creative: "meta-llama/llama-4-scout:free",

  /** Code generation and review */
  code: "qwen/qwen3-coder:free",

  /** Detailed product description generation */
  product: "mistralai/mistral-7b-instruct:free",
} as const;

export type ModelKey = keyof typeof MODELS;
export type ModelId = (typeof MODELS)[ModelKey];
