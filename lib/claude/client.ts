import Anthropic from "@anthropic-ai/sdk";

/** Latest Sonnet, per the project spec. */
export const MODEL = "claude-sonnet-4-6";

let client: Anthropic | null = null;

/** Lazily construct the client so a missing key only fails at call time. */
export function anthropic(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  client ??= new Anthropic();
  return client;
}

/** Extract the concatenated text from a Messages API response. */
export function responseText(message: Anthropic.Message): string {
  return message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
}
