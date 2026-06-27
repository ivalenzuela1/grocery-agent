// The ordering layer is the one fragile/unofficial part of the app, so the rest
// of the codebase depends ONLY on these interfaces. Swapping the manual export
// for browser automation later must not touch anything outside lib/ordering.

export type OrderItem = {
  name: string;
  quantity: number;
  unit: string;
  category: string;
  source: "staple" | "recipe" | "adhoc";
};

export interface OrderResult {
  status: "exported" | "submitted" | "partial" | "failed";
  message: string;
  unmatched?: OrderItem[]; // items the adapter couldn't resolve
}

export interface OrderAdapter {
  readonly name: string;
  placeOrder(items: OrderItem[]): Promise<OrderResult>;
}
