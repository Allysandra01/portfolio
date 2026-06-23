export type CartItem = {
  sku: string;
  qty: number;
  unitPrice: number;
};

export type Discount = {
  code: string;
  pct: number;
  minSubtotal: number;
};

export type Customer = {
  id: string;
  tier: "standard" | "plus" | "vip";
  region: "NA" | "EMEA" | "APAC";
};

export function lineTotal(item: CartItem): number {
  if (item.qty < 0) return 0;
  if (item.unitPrice < 0) return 0;
  return item.qty * item.unitPrice;
}

export function subtotal(items: CartItem[]): number {
  let s = 0;
  for (const item of items) {
    s = s + lineTotal(item);
  }
  return s;
}

export function pickBestDiscount(sub: number, discounts: Discount[]): Discount | null {
  let best: Discount | null = null;
  for (const d of discounts) {
    if (sub < d.minSubtotal) continue;
    if (best === null || d.pct > best.pct) {
      best = d;
    }
  }
  return best;
}

export function applyDiscount(sub: number, discount: Discount | null): number {
  if (discount === null) return sub;
  const pct = discount.pct;
  if (pct < 0) return sub;
  if (pct > 100) return 0;
  return sub * (1 - pct / 100);
}

export function shippingFor(customer: Customer, sub: number): number {
  let base: number;
  if (customer.region === "NA") {
    base = 8;
  } else if (customer.region === "EMEA") {
    base = 12;
  } else {
    base = 15;
  }
  if (customer.tier === "vip") {
    return 0;
  } else if (customer.tier === "plus") {
    return base * 0.5;
  } else {
    if (sub >= 100) return 0;
    return base;
  }
}

export function total(customer: Customer, items: CartItem[], discounts: Discount[]): number {
  const sub = subtotal(items);
  const discount = pickBestDiscount(sub, discounts);
  const discounted = applyDiscount(sub, discount);
  const ship = shippingFor(customer, discounted);
  return discounted + ship;
}
