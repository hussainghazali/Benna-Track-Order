import { useState, useEffect, useRef } from "react";
import { isSadadOrder, sadadPendingHref } from "@/lib/sadad";
import { isNsbhOrder, nsbhPendingHref } from "@/lib/nsbh";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  Truck,
  Package,
  PackageCheck,
  CheckCircle,
  ClipboardList,
  Clock,
  AlertCircle,
  Shield,
  MapPin,
  CreditCard,
  SendHorizontal,
  TriangleAlert,
  Receipt,
} from "lucide-react";
import OrderJourneyTimeline from "@/components/order/OrderJourneyTimeline";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import OrderProofGallery, {
  type OrderProof,
} from "@/components/order/OrderProofGallery";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  useSeo,
  getBreadcrumbSchema,
  getSpeakableSchema,
  getFAQPageSchema,
} from "@/lib/seo";
import { resolveOrderAmounts, type OrderAmounts } from "@/utils/orderTotals";

// Deterministic pseudo-barcode rendered from the order ID (receipt look)
const OrderBarcode = ({ value }: { value: string }) => {
  const seed = value
    .split("")
    .reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
  const rand = (s: number) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };
  const gap = 1.6;
  const bars = Array.from({ length: 52 }).map((_, i) => ({
    w: rand(seed + i) > 0.68 ? 2.4 : 1.2,
    h: rand(seed * 7 + i) > 0.85 ? 30 : 38,
  }));
  const total = bars.reduce((s, b) => s + b.w + gap, -gap);
  const W = 260;
  const H = 44;
  let x = (W - total) / 2;

  return (
    <div className="flex flex-col items-start px-5 py-1">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        className="text-ali-ink-900"
        aria-hidden="true"
      >
        {bars.map((b, i) => {
          const rect = (
            <rect
              key={i}
              x={x}
              y={(H - b.h) / 2}
              width={b.w}
              height={b.h}
              fill="currentColor"
            />
          );
          x += b.w + gap;
          return rect;
        })}
      </svg>
    </div>
  );
};

interface OrderData {
  _id: string;
  orderId?: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  totalPrice: number;
  shippingRate: number;
  amounts?: Partial<OrderAmounts>;
  currency?: string;
  loyaltyDiscount?: { amount?: number };
  customerEmail?: string;
  limited?: boolean;
  ownershipVerified?: boolean;
  paymentMethod?: string;
  offlinePayment?: { provider?: string | null; expiresAt?: string | null } | null;
  sadad?: { sadadNumber?: string | null; status?: string | null; expiresAt?: string | null } | null;
  itemCount?: number;
  maskedCustomerEmail?: string;
  maskedCustomerPhone?: string;
  lineItems: Array<{
    productName: string;
    productQuantity: number;
    productPrice: number;
    image: string;
  }>;
  createdAt: string;
  isSubOrder?: boolean;
  orderProofs?: OrderProof[];
  parentOrder?: {
    orderId?: string;
    orderNumber?: string;
    status?: string;
    paymentStatus?: string;
    fulfillmentStatus?: string;
    createdAt?: string;
  } | null;
}

const TrackOrderPublicPage = () => {
  const { language, isRTL } = useLanguage();
  const isAr = language === "ar";
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [orderId, setOrderId] = useState(searchParams.get("orderId") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<OrderData | null>(null);
  const autoRanRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const t = (en: string, ar: string) => (isAr ? ar : en);

  // ─── SEO / GEO / AIO / AEO ───
  useSeo({
    title: isAr
      ? "تتبع طلبك | بناء - منصة مواد البناء في السعودية"
      : "Track Your Order | Benna - Building Materials Saudi Arabia",
    description: isAr
      ? "تتبع حالة طلبك في الوقت الفعلي على بناء. أدخل رقم الطلب لمعرفة تفاصيل التوصيل وحالة الشحن لطلبات مواد البناء في السعودية والخليج والعالم."
      : "Track your building materials order in real-time on Benna. Enter your order ID to view delivery status, shipment details, and estimated arrival across KSA, GCC, and worldwide.",
    canonical: "https://store.benna.com.sa/track-order",
    keywords: isAr
      ? "تتبع طلب, تتبع شحنة, حالة الطلب, تتبع طلب مواد بناء, تتبع توصيل السعودية, بناء تتبع, رقم الطلب, حالة التوصيل"
      : "track order, order tracking, shipment status, building materials delivery tracking, track order Saudi Arabia, Benna order status, delivery status KSA, order ID lookup",
    schemas: [
      getBreadcrumbSchema([
        { name: isAr ? "الرئيسية" : "Home", url: "/" },
        { name: isAr ? "تتبع الطلب" : "Track Order", url: "/track-order" },
      ]),
      getSpeakableSchema("/track-order", [
        "h1",
        "[data-speakable]",
        "main p:first-of-type",
      ]),
      getFAQPageSchema([
        {
          question: "How do I track my Benna order?",
          answer:
            "Visit the Track Order page on Benna and enter your order ID (e.g. BENNA-ORD-...) or the order number from your confirmation email. You'll see real-time delivery status, shipment details, items ordered, and payment summary.",
        },
        {
          question: "كيف أتتبع طلبي على بناء؟",
          answer:
            "قم بزيارة صفحة تتبع الطلب على بناء وأدخل رقم الطلب (مثل BENNA-ORD-...) أو رقم الطلب من بريد التأكيد. ستظهر لك حالة التوصيل في الوقت الفعلي وتفاصيل الشحن والمنتجات والدفع.",
        },
        {
          question: "What order statuses are available on Benna?",
          answer:
            "Benna orders go through: Pending, Confirmed, Processing, Shipped, and Delivered. Each status is updated in real-time so you always know where your building materials are.",
        },
        {
          question: "ما هي حالات الطلب المتاحة على بناء؟",
          answer:
            "تمر طلبات بناء بالمراحل التالية: قيد الانتظار، تم التأكيد، قيد المعالجة، تم الشحن، تم التوصيل. يتم تحديث كل حالة في الوقت الفعلي.",
        },
        {
          question: "Can I track my Benna order without an account?",
          answer:
            "Yes. Benna's public order tracking page allows anyone to track an order using just the order ID — no account or login required.",
        },
        {
          question: "Does Benna deliver building materials across Saudi Arabia?",
          answer:
            "Yes. Benna delivers to 165+ Saudi cities including Riyadh, Jeddah, Makkah, Madinah, Dammam, Khobar, Jubail, Taif, and more.",
        },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: isAr ? "تتبع الطلب - بناء" : "Track Order - Benna",
        url: "https://store.benna.com.sa/track-order",
        description: isAr
          ? "تتبع حالة طلبك في الوقت الفعلي على بناء"
          : "Track your building materials order status in real-time on Benna",
        inLanguage: ["ar", "en"],
        isPartOf: {
          "@type": "WebSite",
          name: "Benna",
          url: "https://store.benna.com.sa",
        },
        potentialAction: {
          "@type": "TrackAction",
          name: isAr ? "تتبع الطلب" : "Track Order",
          target: {
            "@type": "EntryPoint",
            urlTemplate:
              "https://store.benna.com.sa/track-order?orderId={order_id}",
          },
        },
      },
    ],
  });

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) {
      setError(t("Please enter an order ID", "الرجاء إدخال رقم الطلب"));
      return;
    }

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const response = await apiClient<{ success: boolean; data: OrderData }>(
        `/users/website/track/${orderId.trim()}?parentOrder=true`,
        {
          guest: true,
          auth: true,
        },
      );

      if (response?.data) {
        setOrder(response.data);
      } else {
        setError(t("Order not found", "الطلب غير موجود"));
      }
    } catch (err: any) {
      console.error("Track order error:", err);
      setError(err?.message || t("Failed to track order", "فشل في تتبع الطلب"));
    } finally {
      setLoading(false);
    }
  };

  // Auto-track when ?orderId= is provided in the URL (e.g. coming from
  // OrderSuccessPage as a guest). Runs once on mount with a prefilled ID.
  useEffect(() => {
    if (autoRanRef.current) return;
    const initial = searchParams.get("orderId");
    if (initial && initial.trim()) {
      autoRanRef.current = true;
      void handleTrackOrder({
        preventDefault: () => {},
      } as React.FormEvent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusIcon = (status: string) => {
    const statusLower = status?.toLowerCase() || "";
    if (statusLower.includes("delivered") || statusLower.includes("completed")) {
      return <CheckCircle className="w-5 h-5 text-emerald-600" />;
    }
    if (statusLower.includes("shipped")) {
      return <Truck className="w-5 h-5 text-blue-600" />;
    }
    if (statusLower.includes("processing") || statusLower.includes("confirmed")) {
      return <Package className="w-5 h-5 text-ali-orange-500" />;
    }
    if (statusLower.includes("awaiting_payment")) {
      return <Clock className="w-5 h-5 text-amber-600" />;
    }
    if (statusLower.includes("pending")) {
      return <Clock className="w-5 h-5 text-ali-ink-700" />;
    }
    return <AlertCircle className="w-5 h-5 text-ali-ink-700" />;
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || "";
    if (statusLower.includes("delivered")) {
      return { label: t("Delivered", "تم التوصيل"), color: "bg-emerald-50 text-emerald-700 border border-emerald-200" };
    }
    if (statusLower.includes("shipped")) {
      return { label: t("Shipped", "تم الشحن"), color: "bg-blue-50 text-blue-700 border border-blue-200" };
    }
    if (statusLower.includes("processing")) {
      return { label: t("Processing", "قيد المعالجة"), color: "bg-ali-orange-100 text-violet-700 border border-ali-orange-500/40" };
    }
    if (statusLower.includes("confirmed")) {
      return { label: t("Confirmed", "تم التأكيد"), color: "bg-indigo-50 text-indigo-700 border border-indigo-200" };
    }
    if (statusLower.includes("pending")) {
      return { label: t("Pending", "قيد الانتظار"), color: "bg-amber-50 text-amber-700 border border-amber-200" };
    }
    if (statusLower.includes("awaiting_payment")) {
      return { label: t("Awaiting Payment", "في انتظار الدفع"), color: "bg-amber-50 text-amber-700 border border-amber-200" };
    }
    return { label: status, color: "bg-gray-50 text-gray-600 border border-gray-200" };
  };

  const getStatusLabel = (status: string) => {
    const statusLower = status?.toLowerCase() || "";
    if (statusLower.includes("delivered")) {
      return t("Delivered", "تم التوصيل");
    }
    if (statusLower.includes("shipped")) {
      return t("Shipped", "تم الشحن");
    }
    if (statusLower.includes("processing")) {
      return t("Processing", "قيد المعالجة");
    }
    if (statusLower.includes("confirmed")) {
      return t("Confirmed", "تم التأكيد");
    }
    if (statusLower.includes("pending")) {
      return t("Pending", "قيد الانتظار");
    }
    if (statusLower.includes("awaiting_payment")) {
      return t("Awaiting Payment", "في انتظار الدفع");
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getPaymentStatusLabel = (paymentStatus: string) => {
    const statusLower = paymentStatus?.toLowerCase() || "";
    if (statusLower.includes("awaiting_offline_payment")) {
      return t("Awaiting Payment", "في انتظار الدفع");
    }
    // "unpaid" must be checked before "paid" — "unpaid".includes("paid") is true
    if (statusLower.includes("unpaid")) {
      return t("Unpaid", "غير مدفوع");
    }
    if (statusLower.includes("paid")) {
      return t("Paid", "مدفوع");
    }
    if (statusLower.includes("pending")) {
      return t("Pending", "قيد الانتظار");
    }
    if (statusLower.includes("failed")) {
      return t("Failed", "فشل");
    }
    if (statusLower.includes("cancelled")) {
      return t("Cancelled", "ملغي");
    }
    // Replace underscores with spaces and capitalize first letter
    return paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1).replace(/_/g, ' ');
  };

  // Authoritative, charge-matching breakdown (prefers persisted `amounts`).
  const amounts = order ? resolveOrderAmounts(order) : null;

  // ── Delivery journey timeline ──
  const ORDER_STEP: Record<string, number> = {
    pending: 0, placed: 0, paid: 0, awaiting_payment: 0,
    accepted: 1, confirmed: 1, processing: 1, preparing: 1, ready: 1,
    shipped: 2, in_transit: 2, out_for_delivery: 2,
    delivered: 3, completed: 3,
  };
  const isCancelledOrder =
    !!order && /cancel|reject|fail/i.test(String(order.status || ""));

  // ── Status alert tone (light variant, like DS alerts) ──
  const paymentFailedFlag = /fail|declin|reject/i.test(
    String(order?.paymentStatus || ""),
  );
  const paymentPendingFlag = /unpaid|awaiting|pending/i.test(
    String(order?.paymentStatus || ""),
  );
  const statusAlertTone = !order
    ? "border-ali-line-200 bg-ali-bg-100"
    : isCancelledOrder || paymentFailedFlag
      ? "border-red-200 bg-red-50"
      : /delivered|completed/i.test(order.status)
        ? "border-emerald-200 bg-emerald-50"
        : /shipped|transit|out_for_delivery/i.test(order.status)
          ? "border-blue-200 bg-blue-50"
          : /awaiting_payment/i.test(order.status) || paymentPendingFlag
            ? "border-amber-200 bg-amber-50"
            : "border-ali-orange-500/25 bg-ali-orange-100/50";
  const statusAlertIcon = paymentFailedFlag ? (
    <TriangleAlert className="h-6 w-6 text-red-600" />
  ) : (
    getStatusIcon(order?.status || "")
  );
  const paymentChip = /unpaid/i.test(String(order?.paymentStatus || ""))
    ? "border-amber-200 bg-amber-100 text-amber-700"
    : /paid/i.test(String(order?.paymentStatus || ""))
      ? "border-emerald-200 bg-emerald-100 text-emerald-700"
      : paymentFailedFlag
        ? "border-red-200 bg-red-100 text-red-700"
        : "border-amber-200 bg-amber-100 text-amber-700";
  const journeyIndex = order
    ? (ORDER_STEP[String(order.status || "").toLowerCase()] ?? 0)
    : 0;
  const paymentMethodLabel = (m?: string | null) => {
    const v = String(m || "").toLowerCase();
    if (v === "paytabs") return "PayTabs";
    if (v === "sadad") return "SADAD";
    if (v === "mada") return "mada";
    if (v === "card") return t("Card", "بطاقة");
    return m || t("Online payment", "دفع إلكتروني");
  };

  const firstImage = order?.lineItems?.find((i) => i.image)?.image;
  const grandTotal = amounts?.grandTotal ?? order?.totalPrice ?? 0;

  const journeySteps =
    order && !isCancelledOrder
      ? [
          {
            title: t("Order placed", "تم استلام الطلب"),
            category: order.orderNumber || order.orderId || "",
            subtitle: new Date(order.createdAt).toLocaleDateString(
              isAr ? "ar-SA" : "en-US",
              { month: "short", day: "numeric", year: "numeric" },
            ),
            icon: ClipboardList,
            content: (
              <div>
                <p>
                  {t(
                    "We received your order and sent a confirmation.",
                    "استلمنا طلبك وأرسلنا التأكيد.",
                  )}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ali-ink-500">
                  <span>
                    {order.itemCount ?? order.lineItems?.length ?? 0}{" "}
                    {t("items", "عنصر")} ·{" "}
                    <span dir="ltr">
                      {grandTotal.toFixed(2)} {order.currency || "SAR"}
                    </span>
                  </span>
                  {(order.customerEmail || order.maskedCustomerEmail) && (
                    <span className="font-mono" dir="ltr">
                      {order.customerEmail || order.maskedCustomerEmail}
                    </span>
                  )}
                  {order.maskedCustomerPhone && (
                    <span className="font-mono" dir="ltr">
                      {order.maskedCustomerPhone}
                    </span>
                  )}
                </div>
              </div>
            ),
          },
          {
            title: t("Confirmed & processing", "مؤكد وقيد المعالجة"),
            category: `${t("Payment", "الدفع")} · ${paymentMethodLabel(order.paymentMethod)}`,
            subtitle: order.paymentStatus
              ? getPaymentStatusLabel(order.paymentStatus)
              : undefined,
            icon: Package,
            content: (
              <p>
                {t(
                  "The vendor confirmed your order and is preparing your items.",
                  "أكد المورد طلبك وهو يجهز موادك الآن.",
                )}
              </p>
            ),
          },
          {
            title: t("Shipped", "تم الشحن"),
            category: t("Logistics", "الشحن"),
            image: firstImage,
            icon: Truck,
            content: (
              <div>
                <p>
                  {t("Your order is on its way to you.", "طلبك في طريقه إليك.")}
                </p>
                {order.lineItems?.length ? (
                  <div className="mt-3 space-y-2">
                    {order.lineItems.slice(0, 5).map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.productName}
                            className="h-9 w-9 shrink-0 rounded-lg border border-ali-line-200 bg-white object-cover"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/placeholder.svg";
                            }}
                          />
                        ) : null}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-ali-ink-900">
                            {item.productName}
                          </p>
                          <p className="text-[11px] text-ali-ink-500">
                            {t("Qty", "الكمية")}: {item.productQuantity} ·{" "}
                            <span dir="ltr">
                              {item.productPrice.toFixed(2)}{" "}
                              {order.currency || "SAR"}
                            </span>
                          </p>
                        </div>
                      </div>
                    ))}
                    {order.lineItems.length > 5 && (
                      <p className="text-xs text-ali-ink-500">
                        +{order.lineItems.length - 5}{" "}
                        {t("more items", "عناصر أخرى")}
                      </p>
                    )}
                  </div>
                ) : null}
              </div>
            ),
          },
          {
            title: t("Delivered", "تم التوصيل"),
            category: `${t("Total", "الإجمالي")} · ${grandTotal.toFixed(2)} ${order.currency || "SAR"}`,
            image: journeyIndex >= 3 ? firstImage : undefined,
            icon: PackageCheck,
            content: (
              <p>
                {journeyIndex >= 3
                  ? t(
                      "Your order has been delivered — thanks for shopping on Benna!",
                      "تم توصيل طلبك — شكرًا لتسوقك على بنّاء!",
                    )
                  : t(
                      "Estimated delivery within 3–5 business days.",
                      "التوصيل المتوقع خلال 3–5 أيام عمل.",
                    )}
              </p>
            ),
          },
        ].map((s, i) => ({
          ...s,
          state:
            i < journeyIndex
              ? ("done" as const)
              : i === journeyIndex
                ? ("current" as const)
                : ("upcoming" as const),
        }))
      : [];

  return (
    <div className="min-h-screen bg-ali-bg-100" dir={isRTL ? "rtl" : "ltr"}>
      <Header />

      <main className="relative flex flex-col items-center overflow-hidden" role="main" aria-label={t('Order Tracking', 'تتبع الطلب')}>
        {/* Hidden semantic content for SEO / AIO / AEO crawlers */}
        <div className="sr-only" aria-hidden="true">
          <div itemScope itemType="https://schema.org/WebPage">
            <meta itemProp="name" content={t('Track Your Order - Benna', 'تتبع طلبك - بناء')} />
            <meta itemProp="url" content="https://store.benna.com.sa/track-order" />
            <meta itemProp="inLanguage" content={isAr ? 'ar-SA' : 'en-US'} />
            <span itemProp="description">
              {t(
                'Track your building materials order in real-time on Benna. Enter your order ID to check delivery status, shipment tracking, and order details. Free order tracking for all customers across 165+ Saudi cities including Riyadh, Jeddah, Dammam, Makkah, and Madinah. No account required.',
                'تتبع طلب مواد البناء في الوقت الفعلي على بناء. أدخل رقم الطلب للتحقق من حالة التوصيل وتتبع الشحن وتفاصيل الطلب. تتبع مجاني لجميع العملاء في أكثر من 165 مدينة سعودية بما في ذلك الرياض وجدة والدمام ومكة والمدينة. لا يتطلب حساب.'
              )}
            </span>
          </div>
          <div itemScope itemType="https://schema.org/Organization">
            <meta itemProp="name" content="Benna" />
            <meta itemProp="url" content="https://store.benna.com.sa" />
            <span itemProp="description">
              {t(
                "Saudi Arabia's #1 building materials marketplace. 184,267+ products from 95 verified vendors. AI BOQ, RFQ, vendor chat, and KSA-wide delivery.",
                'أكبر منصة لمواد البناء في السعودية. أكثر من 184,267+ منتج من 95 مورد معتمد. حاسبة كميات بالذكاء الاصطناعي وطلبات عروض أسعار ودردشة البائعين وتوصيل لكل مدن المملكة.'
              )}
            </span>
          </div>
        </div>
        {/* Hero band — warm gradient like other Alibaba pages */}
        <section
          className="w-full border-b border-ali-line-200"
          style={{
            background:
              "linear-gradient(90deg, #FFFFFF 0%, #FFF9F4 25%, #FFF0E5 50%, #FFF9F4 75%, #FFFFFF 100%)",
            backgroundSize: "200% 100%",
            animation: "gradient-shift 12s ease-in-out infinite",
          }}
        >
          <div className="mx-auto w-full max-w-[1400px] px-4 lg:px-6 xl:px-8 py-6 md:py-8">
            <h1 className="max-w-2xl text-3xl lg:text-4xl font-semibold tracking-tight text-ali-ink-900">
              {isAr ? (
                <>
                  تتبع طلبك{" "}
                  <span className="text-ali-orange-500">في الوقت الفعلي</span>
                </>
              ) : (
                <>
                  Track your order{" "}
                  <span className="text-ali-orange-500">in real time</span>
                </>
              )}
            </h1>
            <p className="mt-2 text-sm text-ali-ink-500" data-speakable="true">
              {t(
                "Enter your order ID to see real-time delivery status",
                "أدخل رقم طلبك لمعرفة حالة التوصيل في الوقت الفعلي",
              )}
            </p>

            {/* Search card */}
            <section
              aria-label={t("Order search", "بحث الطلب")}
              className="mt-6 w-full"
            >
              <form
                onSubmit={handleTrackOrder}
                className="flex items-center gap-3 rounded-2xl border border-ali-line-200 bg-white px-4 py-3 shadow-card transition-colors focus-within:border-ali-orange-500"
              >
                <Search className="size-5 shrink-0 text-ali-ink-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder={t(
                    "Order ID (BENNA-ORD-...) or Sub-order ID (BENNA-SUB-...)",
                    "رقم الطلب (BENNA-ORD-...) أو الطلب الفرعي (BENNA-SUB-...)",
                  )}
                  className="min-w-0 flex-1 bg-transparent text-[15px] text-ali-ink-900 placeholder:text-ali-ink-400 focus:outline-none"
                  dir="ltr"
                />
                <button
                  type="submit"
                  disabled={loading || !orderId.trim()}
                  className="flex shrink-0 items-center gap-2 rounded-full bg-ali-orange-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-ali-orange-600 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <span className="hidden sm:inline">
                        {t("Track", "تتبع")}
                      </span>
                      <SendHorizontal className="size-4" />
                    </>
                  )}
                </button>
              </form>

              {error && (
                <div
                  className="mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-ali-red-700"
                  role="alert"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
            </section>
          </div>
        </section>

        {/* Order Results — Light Stripe cards */}
        {order && (
          <section
            aria-label={t('Order results', 'نتائج الطلب')}
            className="relative z-10 mx-auto -mt-6 w-full max-w-[1400px] px-4 pb-12 lg:px-6 xl:px-8"
          >
            <div className="w-full space-y-5">
            {/* Order Receipt — packing slip style */}
            <article
              className="relative overflow-hidden rounded-2xl border border-ali-line-200 bg-white shadow-card"
              aria-label={t("Order receipt", "إشعار الطلب")}
            >
              {/* Receipt header */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ali-orange-100">
                    <Receipt className="h-5 w-5 text-ali-orange-500" />
                  </div>
                  <div>
                    <h2 className="text-[11px] font-semibold uppercase tracking-widest text-ali-ink-500">
                      {t("Order Receipt", "إشعار الطلب")}
                    </h2>
                    <p className="font-mono text-sm font-semibold text-ali-ink-900" dir="ltr">
                      #{order.orderNumber}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {order.isSubOrder && (
                    <div className="rounded-lg border border-ali-orange-500/40 bg-ali-orange-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-ali-orange-500">
                      {t("Sub-order", "طلب فرعي")}
                    </div>
                  )}
                  {/* Status stamp */}
                  <div
                    className={`rotate-2 rounded-md border-2 border-dashed px-3 py-1 text-xs font-bold uppercase tracking-widest ${getStatusBadge(order.status).color}`}
                  >
                    {getStatusBadge(order.status).label}
                  </div>
                </div>
              </div>

              {/* Barcode */}
              <OrderBarcode value={order.orderId || order.orderNumber} />

              {/* Perforated divider with punched notches */}
              <div className="relative my-2">
                <div className="border-t-2 border-dashed border-ali-line-300" />
                <div className="absolute -left-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-ali-bg-100" />
                <div className="absolute -right-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-ali-bg-100" />
              </div>

              {order.isSubOrder && order.parentOrder?.orderId && (
                <div className="mx-5 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-ali-line-300 bg-ali-bg-100 p-3">
                  <div className="text-xs font-normal text-ali-ink-700">
                    {t("Part of parent order", "جزء من الطلب الأصلي")}{" "}
                    <span className="font-mono text-ali-ink-900" dir="ltr">
                      #{order.parentOrder.orderNumber || order.parentOrder.orderId}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOrderId(order.parentOrder!.orderId!);
                      navigate(`/track-order?orderId=${order.parentOrder!.orderId}`);
                      autoRanRef.current = false;
                      setTimeout(() => {
                        void handleTrackOrder({ preventDefault: () => {} } as React.FormEvent);
                      }, 0);
                    }}
                    className="text-xs font-normal text-ali-orange-500 hover:underline"
                  >
                    {t("Track parent order →", "تتبع الطلب الأصلي ←")}
                  </button>
                </div>
              )}

              {/* Receipt meta rows */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-4 px-5 pb-4 sm:grid-cols-3">
                <div>
                  <p className="text-[11px] font-normal uppercase tracking-wider text-ali-ink-500">
                    {t("Order ID", "معرف الطلب")}
                  </p>
                  <p className="mt-0.5 font-mono text-xs font-medium text-ali-ink-900" dir="ltr">
                    {order.orderId || order._id.slice(-12)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-normal uppercase tracking-wider text-ali-ink-500">
                    {t("Order Date", "تاريخ الطلب")}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-ali-ink-900">
                    {new Date(order.createdAt).toLocaleDateString(
                      isAr ? "ar-SA" : "en-US",
                      { year: "numeric", month: "short", day: "numeric" },
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-normal uppercase tracking-wider text-ali-ink-500">
                    {t("Items", "العناصر")}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-ali-ink-900">
                    {order.itemCount ?? order.lineItems?.length ?? 0}{" "}
                    {t("items", "عنصر")}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-normal uppercase tracking-wider text-ali-ink-500">
                    {t("Total", "الإجمالي")}
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-ali-ink-900" dir="ltr">
                    {grandTotal.toFixed(2)} {order.currency || "SAR"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-normal uppercase tracking-wider text-ali-ink-500">
                    {t("Payment", "الدفع")}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-ali-ink-900">
                    {paymentMethodLabel(order.paymentMethod)}
                  </p>
                </div>
                {(order.customerEmail || order.maskedCustomerEmail) && (
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-[11px] font-normal uppercase tracking-wider text-ali-ink-500">
                      {t("Confirmation", "التأكيد")}
                    </p>
                    <p className="mt-0.5 truncate font-mono text-xs font-medium text-ali-ink-900" dir="ltr">
                      {order.customerEmail || order.maskedCustomerEmail}
                    </p>
                  </div>
                )}
              </div>

              {/* Receipt footer */}
              <div className="px-5 pb-3 text-center">
                <p className="text-[10px] uppercase tracking-widest text-ali-ink-400">
                  {t(
                    "Benna · Keep this slip for your records",
                    "بنّاء · احتفظ بهذا الإشعار لسجلاتك",
                  )}
                </p>
              </div>
            </article>
            {/* Torn receipt edge */}
            <div
              aria-hidden="true"
              className="-mt-5 h-3 w-full"
              style={{
                backgroundImage:
                  "linear-gradient(-45deg, transparent 8px, #ffffff 0), linear-gradient(45deg, transparent 8px, #ffffff 0)",
                backgroundSize: "16px 16px",
                backgroundRepeat: "repeat-x",
                backgroundPosition: "bottom left",
              }}
            />

            {/* Help Section */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ali-line-200 bg-white p-4 shadow-card">
              <p className="text-sm text-ali-ink-700 font-normal">
                {t("Need help with your order?", "تحتاج مساعدة مع طلبك؟")}
              </p>
              <Button
                variant="outline"
                className="border border-ali-line-200 hover:border-ali-orange-500 hover:bg-ali-bg-100 text-ali-ink-900 hover:text-ali-ink-900 font-normal rounded-lg transition-all duration-200 text-[14px]"
                onClick={() => navigate("/contact")}
              >
                <SendHorizontal className="w-4 h-4 mr-2 text-ali-orange-500" />
                {t("Contact Support", "اتصل بالدعم")}
              </Button>
            </div>

            {/* Status Card */}
            <div
              role="alert"
              className={`flex items-start gap-4 rounded-lg border p-4 sm:p-5 ${statusAlertTone}`}
            >
              <div className="mt-0.5 shrink-0">{statusAlertIcon}</div>
              <div className="grow tracking-tight">
                <p className="text-xs font-medium text-ali-ink-500">
                  {t("Current Status", "الحالة الحالية")}
                </p>
                <p className="text-stripe-midnight text-lg font-light">
                  {getStatusLabel(order.status)}
                </p>
                {order.paymentStatus && (
                  <>
                    <p className="text-xs text-stripe-ghost mt-1 font-light">
                      {t("Payment", "الدفع")}: {getPaymentStatusLabel(order.paymentStatus)}
                      {isSadadOrder(order) && (
                        <span className="ms-1">· {t("SADAD", "سداد")}</span>
                      )}
                      {isNsbhOrder(order) && <span className="ms-1">· NSBH</span>}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${paymentChip}`}
                    >
                      {paymentFailedFlag ? (
                        <TriangleAlert className="h-3 w-3" />
                      ) : /paid/i.test(order.paymentStatus) &&
                        !/unpaid/i.test(order.paymentStatus) ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                      {t("Payment", "الدفع")}:{" "}
                      {getPaymentStatusLabel(order.paymentStatus)}
                      {isSadadOrder(order) && (
                        <span className="ms-0.5">· {t("SADAD", "سداد")}</span>
                      )}
                    </span>
                  </>
                )}
                </div>
                {isSadadOrder(order) &&
                  !order.limited &&
                  /awaiting|unpaid|pending/.test(String(order.paymentStatus || "").toLowerCase()) &&
                  !/cancel|expired|refund|fail/.test(String(order.status || "").toLowerCase()) && (
                    <Button
                      className="mt-3 bg-ali-orange-500 hover:bg-ali-orange-500/90 text-white font-normal rounded-lg text-[13px] h-9"
                      onClick={() => navigate(sadadPendingHref(order.orderId || orderId))}
                    >
                      {t("Pay via SADAD", "ادفع عبر سداد")}
                    </Button>
                  )}
                {isNsbhOrder(order) &&
                  !order.limited &&
                  /awaiting/.test(String(order.paymentStatus || "").toLowerCase()) &&
                  !/cancel|expired|refund|fail/.test(String(order.status || "").toLowerCase()) && (
                    <Button
                      className="mt-3 bg-stripe-violet hover:bg-stripe-violet/90 text-white font-light rounded-[4px] text-[13px] h-9"
                      onClick={() => navigate(nsbhPendingHref(order.orderId || orderId))}
                    >
                      {t("Continue with NSBH", "المتابعة مع NSBH")}
                    </Button>
                  )}
              </div>
            </div>

            {/* Delivery journey — scroll-driven timeline */}
            {journeySteps.length > 0 && (
              <article
                className="bg-white border border-ali-line-200 rounded-xl px-5 pt-5 pb-2 shadow-card"
                aria-label={t("Delivery journey", "رحلة التوصيل")}
              >
                <h3 className="mb-2 flex items-center gap-2 font-semibold text-ali-ink-900">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ali-orange-100">
                    <Truck className="h-4 w-4 text-ali-orange-500" />
                  </div>
                  {t("Delivery journey", "رحلة التوصيل")}
                </h3>
                <OrderJourneyTimeline
                  steps={journeySteps}
                  labels={{
                    done: t("Done", "مكتمل"),
                    current: t("In progress", "جاري"),
                    upcoming: t("Upcoming", "قادم"),
                  }}
                />
              </article>
            )}

            {/* Shipping / delivery proof (owner-verified lookups only) */}
            {!order.limited && <OrderProofGallery proofs={order.orderProofs} />}

            {/* Items Card */}
            <article
              className="bg-white border border-ali-line-200 rounded-xl overflow-hidden"
              style={{ boxShadow: 'rgba(23,23,23,0.06) 0px 3px 6px 0px' }}
              aria-label={t('Order items', 'عناصر الطلب')}
            >
              <div className="bg-ali-bg-100 border-b border-ali-line-200 px-5 py-3 flex items-center gap-2">
                <div className="w-1 h-4 bg-ali-orange-500 rounded-full" />
                <span className="text-[13px] font-normal text-ali-ink-900">
                  {t("Order Items", "عناصر الطلب")}
                </span>
                <span className="ml-auto text-[11px] font-normal text-ali-ink-500">
                  {order.lineItems?.length || order.itemCount || 0}{" "}
                  {t("items", "عناصر")}
                </span>
              </div>
              <div className="p-5 space-y-3 max-h-[320px] overflow-y-auto">
                {order.limited && (
                  <div className="flex items-start gap-3 p-4 bg-ali-bg-100 border border-ali-line-200 rounded-lg">
                    <Shield className="w-4 h-4 text-ali-orange-500 mt-0.5 shrink-0" />
                    <div className="text-[13px] font-normal text-ali-ink-700 leading-relaxed">
                      <p className="text-ali-ink-900">
                        {t(
                          "Limited view for your protection",
                          "عرض محدود لحمايتك",
                        )}
                      </p>
                      <p className="mt-1">
                        {t(
                          "We only show status, date, item count and total unless we can confirm the order belongs to you. Sign in with the account used at checkout to see full details.",
                          "نعرض فقط الحالة والتاريخ وعدد العناصر والإجمالي حتى نتأكد أن الطلب يخصك. سجّل الدخول بالحساب المستخدم عند الدفع لعرض كامل التفاصيل.",
                        )}
                      </p>
                      <Button
                        variant="outline"
                        className="mt-3 border border-ali-line-200 hover:border-ali-orange-500 text-ali-ink-900 font-normal rounded-lg text-[13px] h-9"
                        onClick={() =>
                          navigate(
                            `/login?redirect=${encodeURIComponent(
                              `/track-order?orderId=${order.orderId || orderId}`,
                            )}`,
                          )
                        }
                      >
                        {t("Sign in to view details", "تسجيل الدخول لعرض التفاصيل")}
                      </Button>
                    </div>
                  </div>
                )}
                {order.limited && (order.itemCount ?? 0) > 0 && (
                  <p className="text-[13px] font-normal text-ali-ink-700 px-1">
                    {t("Items in this order", "العناصر في هذا الطلب")}:{" "}
                    <span className="text-ali-ink-900">{order.itemCount}</span>
                  </p>
                )}
                {order.lineItems?.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 bg-ali-bg-100 rounded-lg border border-ali-line-200 hover:border-ali-orange-500 transition-colors"
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-14 h-14 object-cover rounded-lg border border-ali-line-200 bg-white"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-normal text-ali-ink-900 text-sm line-clamp-2">
                        {item.productName}
                      </p>
                      <p className="text-xs text-ali-ink-500 mt-1 font-normal">
                        {t("Qty", "الكمية")}: {item.productQuantity}
                      </p>
                    </div>
                    <p className="font-normal text-ali-orange-500 whitespace-nowrap" dir="ltr">
                      {item.productPrice.toFixed(2)} SAR
                    </p>
                  </div>
                ))}
              </div>
            </article>

            {/* Summary Card */}
            <article
              className="bg-white border border-ali-line-200 rounded-xl p-5"
              style={{ boxShadow: 'rgba(23,23,23,0.06) 0px 3px 6px 0px' }}
              aria-label={t('Order summary', 'ملخص الطلب')}
            >
              <h3 className="font-normal text-ali-ink-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-ali-orange-100 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-ali-orange-500" />
                </div>
                {t("Order Summary", "ملخص الطلب")}
              </h3>
              <div className="space-y-3">
                {!order.limited && (
                  <>
                <div className="flex justify-between items-center py-2">
                  <span className="text-ali-ink-700 text-sm font-normal">
                    {t("Subtotal", "المجموع الفرعي")}
                  </span>
                  <span className="font-normal text-ali-ink-900" dir="ltr">
                    {(amounts?.subtotal ?? 0).toFixed(2)} SAR
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-t border-ali-line-200">
                  <span className="text-ali-ink-700 text-sm font-normal">
                    {t("VAT (15%)", "ضريبة القيمة المضافة (15%)")}
                  </span>
                  <span className="font-normal text-ali-ink-900" dir="ltr">
                    {(amounts?.vat ?? 0).toFixed(2)} SAR
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-t border-ali-line-200">
                  <span className="text-ali-ink-700 text-sm font-normal">
                    {t("Shipping", "الشحن")}
                  </span>
                  <span className="font-normal text-ali-ink-900" dir="ltr">
                    {(amounts?.shipping ?? 0).toFixed(2)} SAR
                  </span>
                </div>
                {(amounts?.discount ?? 0) > 0 && (
                  <div className="flex justify-between items-center py-2 border-t border-ali-line-200">
                    <span className="text-ali-ink-700 text-sm font-normal">
                      {t("Discount", "الخصم")}
                    </span>
                    <span className="font-normal text-ali-ink-900" dir="ltr">
                      -{(amounts?.discount ?? 0).toFixed(2)} SAR
                    </span>
                  </div>
                )}
                  </>
                )}
                <div className="flex justify-between items-center py-3 border-t border-ali-line-200 mt-2">
                  <span className="font-normal text-ali-ink-900 text-lg">
                    {t("Total", "الإجمالي")}
                  </span>
                  <span className="font-normal text-ali-orange-500 text-xl" dir="ltr">
                    {(amounts?.grandTotal ?? 0).toFixed(2)} SAR
                  </span>
                </div>
              </div>

              {/* Customer Email */}
              {(order.customerEmail ||
                order.maskedCustomerEmail ||
                order.maskedCustomerPhone) && (
                <div className="mt-4 pt-4 border-t border-ali-line-200 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-ali-ink-500 font-normal">
                    <MapPin className="w-3 h-3" />
                    <span>{t("Confirmation sent to", "تم إرسال التأكيد إلى")}</span>
                    <span className="font-mono text-ali-ink-900" dir="ltr">
                      {order.customerEmail || order.maskedCustomerEmail}
                    </span>
                  </div>
                  {order.limited && order.maskedCustomerPhone && (
                    <div className="flex items-center gap-2 text-xs text-ali-ink-500 font-normal">
                      <SendHorizontal className="w-3 h-3" />
                      <span>{t("Contact number", "رقم التواصل")}</span>
                      <span className="font-mono text-ali-ink-900" dir="ltr">
                        {order.maskedCustomerPhone}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </article>

          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default TrackOrderPublicPage;
