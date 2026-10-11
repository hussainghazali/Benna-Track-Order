/**
 * productPricing.ts — SINGLE SOURCE OF TRUTH for storefront product pricing.
 *
 * Mirrors the backend's `helpers/productPricing.js` (`effectiveUnitPrice`).
 * Keep the two in sync: the server resolves the price that is actually charged,
 * so any divergence here means the storefront advertises a price the customer
 * will not be charged.
 *
 * DATA CONTRACT (from the product model):
 *   - `price`         = the LIST price (pre-discount). This is the strike-through.
 *   - `discountMode`  = "PERCENT" (discountValue is a %) | "FIXED" (flat SAR off).
 *                       Defaults to "PERCENT" server-side.
 *   - `discountValue` = magnitude of the discount, 0 means no discount.
 *
 * So the price the customer pays is `price - discount`, NEVER `price` itself.
 *
 * Historically several surfaces inverted this: they rendered `price` as the sale
 * price and *grossed up* a fake original via `price / (1 - discountValue / 100)`.
 * That invented a list price that never existed (a 250 SAR product at 60% off was
 * shown as "625 → 250" instead of the correct "250 → 100"). Always route pricing
 * through this module rather than re-deriving it at the call site.
 */

export type DiscountMode = "PERCENT" | "FIXED" | string;

export interface DiscountablePricing {
  /** List price (pre-discount). `productPrice` is accepted as a legacy alias. */
  price?: number | null;
  productPrice?: number | null;
  discountMode?: DiscountMode | null;
  discountValue?: number | null;
}

const toNum = (value: unknown, fallback = 0): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const round2 = (n: number): number =>
  Math.round((n + Number.EPSILON) * 100) / 100;

/**
 * The product's LIST price — what belongs in the strike-through slot.
 * Returns 0 when absent/invalid.
 */
export const listPrice = (product: DiscountablePricing = {}): number => {
  const raw =
    product.productPrice != null ? product.productPrice : product.price;
  return Math.max(toNum(raw, 0), 0);
};

/**
 * The effective (discounted) unit price — what the customer actually pays,
 * and what belongs in the primary price slot. Never negative.
 *
 * Falls back to the list price when there is no discount, so this is always
 * safe to call unconditionally.
 */
export const effectiveUnitPrice = (
  product: DiscountablePricing = {},
): number => {
  const base = listPrice(product);
  const value = toNum(product.discountValue, 0);

  if (value <= 0 || base <= 0) return base;

  // Deliberately NO default mode. The schema defaults discountMode to "PERCENT",
  // but the backend's effectiveUnitPrice only discounts when the mode is an
  // explicit "PERCENT" or "FIXED" — an absent mode leaves the price untouched.
  // Defaulting to PERCENT here would advertise a price lower than the server
  // charges, so an unrecognised/missing mode must fall through to the base price.
  const mode = String(product.discountMode || "").toUpperCase();

  let price = base;
  if (mode === "PERCENT") {
    price = base - (base * value) / 100;
  } else if (mode === "FIXED") {
    price = base - value;
  }

  return Math.max(round2(price), 0);
};

/**
 * True only when the discount actually reduces the price.
 *
 * Defined in terms of the resolved price rather than `discountValue > 0`, so an
 * unrecognised or missing `discountMode` (which the server does not discount)
 * can't produce a strike-through equal to the sale price, e.g. "~~200~~ 200".
 */
export const hasDiscount = (product: DiscountablePricing = {}): boolean => {
  const base = listPrice(product);
  return base > 0 && effectiveUnitPrice(product) < base;
};

/**
 * List price for display purposes — `undefined` when there is no discount, so
 * the strike-through and "% OFF" badge stay hidden rather than rendering
 * "250 → 250 / 0% OFF".
 */
export const originalPriceForDisplay = (
  product: DiscountablePricing = {},
): number | undefined => (hasDiscount(product) ? listPrice(product) : undefined);

/**
 * Whole-number discount percentage for the badge, `undefined` when there is no
 * discount. Derived from the resolved prices so PERCENT and FIXED modes agree
 * with the numbers actually shown on the card.
 */
export const discountPercentage = (
  product: DiscountablePricing = {},
): number | undefined => {
  if (!hasDiscount(product)) return undefined;
  const base = listPrice(product);
  const final = effectiveUnitPrice(product);
  const pct = Math.round(((base - final) / base) * 100);
  return pct > 0 ? pct : undefined;
};

/**
 * Everything a product card needs, in one call.
 *
 * @example
 *   const { price, originalPrice, discountPercent } = resolveProductPrice(item);
 *   // item = { price: 250, discountMode: "PERCENT", discountValue: 60 }
 *   // → { price: 100, originalPrice: 250, discountPercent: 60 }
 */
export const resolveProductPrice = (product: DiscountablePricing = {}) => ({
  price: effectiveUnitPrice(product),
  originalPrice: originalPriceForDisplay(product),
  discountPercent: discountPercentage(product),
});

/**
 * Positional variant, for call sites that only have loose values to hand
 * (e.g. `getDiscountedPrice(product.price, product.discountMode, product.discountValue)`).
 * Prefer passing the product object to `effectiveUnitPrice`.
 */
export const getDiscountedPrice = (
  price?: number | null,
  discountMode?: DiscountMode | null,
  discountValue?: number | null,
): number => effectiveUnitPrice({ price, discountMode, discountValue });
