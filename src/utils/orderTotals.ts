/**
 * orderTotals.ts — SINGLE SOURCE OF TRUTH for rendering order money on the
 * storefront. Every order/receipt surface (success, tracking, account orders,
 * order detail, invoice preview) must use `resolveOrderAmounts` so the numbers
 * shown always match what the customer was actually charged.
 *
 * Model: VAT-EXCLUSIVE. Line-item `price` is the net (pre-VAT) unit price;
 * 15% VAT is added on top of items AND shipping; a coupon is a flat SAR amount
 * off the gross total. `grandTotal` equals the amount charged.
 *
 * The backend now persists an authoritative `amounts` object on each order and
 * sub-order. We prefer it. For legacy orders created before that change we fall
 * back to recomputing from line items — using the SAME formula as the backend.
 */

export const VAT_RATE = 0.15;
export const DEFAULT_SHIPPING_RATE = 30;

export interface OrderAmounts {
  subtotal: number;
  discount: number;
  itemVat: number;
  shipping: number;
  shippingVat: number;
  vat: number;
  grandTotal: number;
  vatRate: number;
  currency: string;
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const num = (v: unknown, fallback = 0): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

interface LooseLine {
  price?: unknown;
  productPrice?: unknown;
  quantity?: unknown;
  productQuantity?: unknown;
}

export const computeOrderAmounts = (args: {
  lineItems?: LooseLine[];
  shippingRate?: unknown;
  couponDiscount?: unknown;
  vatRate?: number;
  currency?: string;
}): OrderAmounts => {
  const vatRate = args.vatRate ?? VAT_RATE;
  const lineItems = args.lineItems ?? [];
  const subtotal = round2(
    lineItems.reduce((sum, item) => {
      const price = num(item.productPrice ?? item.price);
      const qty = num(item.quantity ?? item.productQuantity, 1);
      return sum + price * qty;
    }, 0),
  );
  const itemVat = round2(subtotal * vatRate);
  const shipping = round2(num(args.shippingRate, DEFAULT_SHIPPING_RATE));
  const shippingVat = round2(shipping * vatRate);
  const vat = round2(itemVat + shippingVat);
  const gross = round2(subtotal + itemVat + shipping + shippingVat);
  const discount = round2(Math.min(Math.max(num(args.couponDiscount), 0), gross));
  const grandTotal = round2(Math.max(gross - discount, 0));
  return {
    subtotal,
    discount,
    itemVat,
    shipping,
    shippingVat,
    vat,
    grandTotal,
    vatRate,
    currency: args.currency ?? "SAR",
  };
};

const isUsableAmounts = (a: unknown): a is Partial<OrderAmounts> =>
  !!a && typeof a === "object" && Number(( a as OrderAmounts).grandTotal) > 0;

/**
 * Resolve the authoritative amounts for any order/sub-order shape. Prefers the
 * backend-persisted `amounts`; otherwise recomputes from line items.
 */
export const resolveOrderAmounts = (order: any): OrderAmounts => {
  if (isUsableAmounts(order?.amounts)) {
    const a = order.amounts;
    const subtotal = num(a.subtotal);
    const itemVat = a.itemVat != null ? num(a.itemVat) : round2(subtotal * VAT_RATE);
    const shipping = num(a.shipping);
    const shippingVat =
      a.shippingVat != null ? num(a.shippingVat) : round2(shipping * VAT_RATE);
    return {
      subtotal,
      discount: num(a.discount),
      itemVat,
      shipping,
      shippingVat,
      vat: a.vat != null ? num(a.vat) : round2(itemVat + shippingVat),
      grandTotal: num(a.grandTotal),
      vatRate: a.vatRate != null ? num(a.vatRate) : VAT_RATE,
      currency: a.currency ?? order?.currency ?? "SAR",
    };
  }

  // Legacy fallback — recompute from whatever line items the shape carries.
  const lineItems: LooseLine[] =
    order?.products ?? order?.lineItems ?? [];
  const couponDiscount =
    order?.loyaltyDiscount?.amount ?? order?.discount ?? 0;
  return computeOrderAmounts({
    lineItems,
    shippingRate: order?.shippingRate,
    couponDiscount,
    currency: order?.currency,
  });
};
