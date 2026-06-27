import type { OrderAdapter, OrderItem, OrderResult } from "./types";

/**
 * v2 — Amazon Fresh browser automation. NOT IMPLEMENTED. Interface-compliant
 * no-op so the rest of the app can depend on it without it existing yet.
 *
 * TODO(phase-2): Drive a logged-in Amazon Fresh session with Playwright:
 *   - Maintain an authenticated browser context (handle login + 2FA out of band).
 *   - For each item, search Amazon Fresh, pick the best match, add to cart.
 *   - Report matched vs. unmatched items via OrderResult.unmatched.
 *
 * ⚠️ This is FRAGILE and UNOFFICIAL: Amazon has no public ordering API, the UI
 * changes without notice, and automation may break or be blocked at any time.
 * It must never be imported into the Phase 1 path or block the manual export.
 */
export class AmazonFreshBrowserAdapter implements OrderAdapter {
  readonly name = "Amazon Fresh (Browser)";

  async placeOrder(items: OrderItem[]): Promise<OrderResult> {
    return {
      status: "failed",
      message:
        "Amazon Fresh browser automation is not implemented yet. Use Manual Export.",
      unmatched: items,
    };
  }
}
