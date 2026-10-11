// SADAD helpers — standalone build: only the pieces TrackOrderPublicPage uses.
export const SADAD_GOPAY_METHOD = "sadad_gopay" as const;
export const SADAD_GOPAY_PROVIDER = "gopay" as const;

export const isSadadOrder = (
  order?: {
    paymentMethod?: string | null;
    offlinePayment?: { provider?: string | null } | null;
  } | null,
) =>
  !!order &&
  (order.paymentMethod === SADAD_GOPAY_METHOD ||
    order.offlinePayment?.provider === SADAD_GOPAY_PROVIDER);

export const sadadPendingHref = (orderId: string, guestId?: string | null) => {
  const params = new URLSearchParams();
  params.set("orderId", orderId);
  if (guestId) params.set("guestId", guestId);
  return `/order/sadad-pending?${params.toString()}`;
};
