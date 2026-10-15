/** NSBH (B2B procurement financing) — storefront markers used in Track Order */

export const NSBH_METHOD = "nsbh_bnpl" as const;
export const NSBH_PROVIDER = "nsbh" as const;

export const isNsbhOrder = (
  order?: {
    paymentMethod?: string | null;
    offlinePayment?: { provider?: string | null } | null;
  } | null,
): boolean =>
  !!order && (order.paymentMethod === NSBH_METHOD || order.offlinePayment?.provider === NSBH_PROVIDER);

export const nsbhPendingHref = (orderId: string) =>
  `/order/nsbh-pending?${new URLSearchParams({ orderId }).toString()}`;
