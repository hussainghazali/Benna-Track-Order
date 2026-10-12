import { useState, useEffect, useRef } from "react";
import { isSadadOrder, sadadPendingHref } from "@/lib/sadad";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  Truck,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  Shield,
  MapPin,
  CreditCard,
  SendHorizontal,
  Bolt,
} from "lucide-react";
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
      return <Package className="w-5 h-5 text-stripe-violet" />;
    }
    if (statusLower.includes("awaiting_payment")) {
      return <Clock className="w-5 h-5 text-amber-600" />;
    }
    if (statusLower.includes("pending")) {
      return <Clock className="w-5 h-5 text-stripe-slate" />;
    }
    return <AlertCircle className="w-5 h-5 text-stripe-slate" />;
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || "";
    if (statusLower.includes("delivered") || statusLower.includes("completed")) {
      return "text-emerald-700 bg-emerald-50 border-emerald-200";
    }
    if (statusLower.includes("shipped")) {
      return "text-blue-700 bg-blue-50 border-blue-200";
    }
    if (statusLower.includes("processing") || statusLower.includes("confirmed")) {
      return "text-stripe-violet bg-stripe-powder border-stripe-stone";
    }
    if (statusLower.includes("awaiting_payment")) {
      return "text-amber-700 bg-amber-50 border-amber-200";
    }
    if (statusLower.includes("pending")) {
      return "text-stripe-slate bg-stripe-porcelain border-stripe-stone";
    }
    return "text-stripe-slate bg-stripe-porcelain border-stripe-stone";
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
      return { label: t("Processing", "قيد المعالجة"), color: "bg-violet-50 text-violet-700 border border-violet-200" };
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

  return (
    <div className="min-h-screen bg-stripe-porcelain" dir={isRTL ? "rtl" : "ltr"}>
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
        {/* Dark Hero Section with Ray Background */}
        <div className="relative w-full flex flex-col items-center pb-28">
          {/* Ray Background — confined to hero */}
          <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none">
            <div className="absolute inset-0 bg-stripe-midnight" />
            <div
              className="absolute left-1/2 -translate-x-1/2 w-[4000px] h-[1800px] sm:w-[6000px]"
              style={{
                background: `radial-gradient(circle at center 800px, hsl(var(--stripe-violet) / 0.7) 0%, hsl(var(--stripe-violet) / 0.3) 14%, hsl(var(--stripe-violet) / 0.15) 18%, hsl(var(--stripe-violet) / 0.06) 22%, hsl(var(--stripe-midnight) / 0.2) 25%)`
              }}
            />
            <div
              className="absolute top-[175px] left-1/2 w-[1600px] h-[1600px] sm:top-1/2 sm:w-[3043px] sm:h-[2865px]"
              style={{ transform: 'translate(-50%) rotate(180deg)' }}
            >
              <div className="absolute w-full h-full rounded-full bg-stripe-midnight -mt-[13px]" style={{ background: 'radial-gradient(43.89% 25.74% at 50.02% 97.24%, hsl(212 79% 14%) 0%, hsl(var(--stripe-midnight)) 100%)', border: '16px solid hsl(var(--stripe-powder) / 0.9)', transform: 'rotate(180deg)', zIndex: 5 }} />
              <div className="absolute w-full h-full rounded-full bg-stripe-midnight -mt-[11px]" style={{ border: '23px solid hsl(var(--stripe-violet-washed) / 0.6)', transform: 'rotate(180deg)', zIndex: 4 }} />
              <div className="absolute w-full h-full rounded-full bg-stripe-midnight -mt-[8px]" style={{ border: '23px solid hsl(var(--stripe-violet-soft) / 0.5)', transform: 'rotate(180deg)', zIndex: 3 }} />
              <div className="absolute w-full h-full rounded-full bg-stripe-midnight -mt-[4px]" style={{ border: '23px solid hsl(var(--stripe-violet) / 0.7)', transform: 'rotate(180deg)', zIndex: 2 }} />
              <div className="absolute w-full h-full rounded-full bg-stripe-midnight" style={{ border: '20px solid hsl(var(--stripe-violet) / 0.8)', boxShadow: '0 -15px 24.8px hsl(var(--stripe-violet) / 0.6)', transform: 'rotate(180deg)', zIndex: 1 }} />
            </div>
          </div>

          {/* Announcement Badge */}
          {!order && (
            <div className="relative z-10 mt-20 sm:mt-28">
              <div
                className="relative inline-flex items-center gap-2 px-6 py-2.5 min-h-[44px] rounded-full text-base overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(229,237,245,0.1), rgba(229,237,245,0.05))',
                  backdropFilter: 'blur(20px) saturate(140%)',
                  boxShadow: 'inset 0 1px rgba(229,237,245,0.2), inset 0 -1px rgba(0,0,0,0.1), 0 8px 32px -8px rgba(0,0,0,0.1), 0 0 0 1px rgba(229,237,245,0.08)'
                }}
              >
                <span className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none opacity-70 mix-blend-overlay" style={{ background: 'radial-gradient(ellipse at center top, rgba(229,237,245,0.15) 0%, transparent 70%)' }} />
                <span className="absolute -top-px left-1/2 -translate-x-1/2 h-[2px] w-[100px] opacity-60" style={{ background: 'linear-gradient(90deg, transparent 0%, hsl(var(--stripe-violet) / 0.8) 20%, hsl(var(--stripe-violet-soft) / 0.8) 50%, hsl(var(--stripe-violet) / 0.8) 80%, transparent 100%)', filter: 'blur(0.5px)' }} />
                <Bolt className="size-4 relative z-10 text-stripe-powder" />
                <span className="relative z-10 text-stripe-powder font-light">
                  {t("Real-time Order Tracking", "تتبع الطلب في الوقت الفعلي")}
                </span>
              </div>
            </div>
          )}

          {/* Hero Title */}
          <div className={`relative z-10 text-center ${order ? 'mt-10 sm:mt-16' : 'mt-10'} mb-8 sm:mb-12 px-4`}>
            <h1 className="text-5xl sm:text-6xl font-light text-white tracking-tight mb-3">
              {t("Track Your", "تتبع")}{' '}
              <span className="bg-gradient-to-b from-stripe-violet-soft via-stripe-violet-soft to-white bg-clip-text text-transparent italic">
                {t("Order", "طلبك")}
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-stripe-powder/70 font-light" data-speakable="true">
              {t(
                "Enter your order ID to see real-time delivery status",
                "أدخل رقم طلبك لمعرفة حالة التوصيل في الوقت الفعلي",
              )}
            </p>
          </div>

          {/* Search Input — Bolt style on dark hero */}
          <section aria-label={t('Order search', 'بحث الطلب')} className="relative z-10 w-full max-w-[820px] mx-auto px-4 mb-8">
            <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-b from-white/20 to-stripe-violet/10 pointer-events-none" />
            <form
              onSubmit={handleTrackOrder}
              className="relative rounded-3xl bg-white/10 backdrop-blur-xl ring-1 ring-white/20 shadow-[0_4px_32px_rgba(0,0,0,0.25)]"
            >
              <div className="flex items-center px-7 py-6 gap-4">
                <Search className="size-6 text-stripe-powder/50 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder={t("Order ID (BENNA-ORD-...) or Sub-order ID (BENNA-SUB-...)", "رقم الطلب (BENNA-ORD-...) أو الطلب الفرعي (BENNA-SUB-...)")}
                  className="flex-1 bg-transparent text-lg text-white placeholder-stripe-powder/40 focus:outline-none min-w-0 font-light"
                  dir="ltr"
                />
                <button
                  type="submit"
                  disabled={loading || !orderId.trim()}
                  className="flex items-center gap-2 px-7 py-3 rounded-full text-base font-light text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                  style={{ background: 'linear-gradient(90deg, #FF6600, #E65C00)', boxShadow: '0 0 20px hsl(var(--stripe-violet) / 0.4)' }}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="hidden sm:inline">{t("Track", "تتبع")}</span>
                      <SendHorizontal className="size-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {error && (
              <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm font-light flex items-center gap-2" role="alert">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
          </section>
        </div>

        {/* Order Results — Light Stripe cards */}
        {order && (
          <section aria-label={t('Order results', 'نتائج الطلب')} className="relative z-10 w-full max-w-[680px] mx-auto px-4 -mt-6 pb-12 space-y-5">
            {/* Order Header Card */}
            <article
              className="bg-white border border-stripe-stone rounded-[6px] p-5"
              style={{ boxShadow: 'rgba(23,23,23,0.06) 0px 3px 6px 0px' }}
              aria-label={t('Order details', 'تفاصيل الطلب')}
            >
              <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[4px] bg-stripe-powder flex items-center justify-center">
                    <Package className="w-5 h-5 text-stripe-violet" />
                  </div>
                  <div>
                    <h2 className="text-[11px] text-stripe-ghost font-light uppercase tracking-wider">
                      {t("Order Details", "تفاصيل الطلب")}
                    </h2>
                    <p className="text-sm font-mono text-stripe-midnight font-light">
                      #{order.orderNumber}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {order.isSubOrder && (
                    <div className="px-2.5 py-1 rounded-[4px] text-[10px] font-light uppercase tracking-wide bg-violet-50 text-stripe-violet border border-violet-200">
                      {t("Sub-order", "طلب فرعي")}
                    </div>
                  )}
                  <div className={`px-3 py-1.5 rounded-[4px] text-xs font-light uppercase tracking-wide ${getStatusBadge(order.status).color}`}>
                    {getStatusBadge(order.status).label}
                  </div>
                </div>
              </div>

              {order.isSubOrder && order.parentOrder?.orderId && (
                <div className="mb-4 p-3 rounded-[4px] bg-stripe-porcelain border border-stripe-stone flex items-center justify-between gap-3 flex-wrap">
                  <div className="text-xs font-light text-stripe-slate">
                    {t("Part of parent order", "جزء من الطلب الأصلي")}{" "}
                    <span className="font-mono text-stripe-midnight" dir="ltr">
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
                    className="text-xs font-light text-stripe-violet hover:underline"
                  >
                    {t("Track parent order →", "تتبع الطلب الأصلي ←")}
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] text-stripe-ghost font-light uppercase tracking-wider">
                    {t("Order ID", "معرف الطلب")}
                  </p>
                  <p className="text-sm font-mono text-stripe-midnight mt-0.5 font-light" dir="ltr">
                    {order.orderId || order._id.slice(-12)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-stripe-ghost font-light uppercase tracking-wider">
                    {t("Order Date", "تاريخ الطلب")}
                  </p>
                  <p className="text-sm text-stripe-midnight mt-0.5 font-light">
                    {new Date(order.createdAt).toLocaleDateString(
                      isAr ? "ar-SA" : "en-US",
                      { year: "numeric", month: "short", day: "numeric" },
                    )}
                  </p>
                </div>
              </div>
            </article>

            {/* Status Card */}
            <div className={`flex items-center gap-4 p-5 rounded-[6px] border ${getStatusColor(order.status)}`}>
              <div className={`p-3 rounded-[4px] ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
              </div>
              <div className="flex-1">
                <p className="text-sm text-stripe-slate font-light">
                  {t("Current Status", "الحالة الحالية")}
                </p>
                <p className="text-stripe-midnight text-lg font-light">
                  {getStatusLabel(order.status)}
                </p>
                {order.paymentStatus && (
                  <p className="text-xs text-stripe-ghost mt-1 font-light">
                    {t("Payment", "الدفع")}: {getPaymentStatusLabel(order.paymentStatus)}
                    {isSadadOrder(order) && (
                      <span className="ms-1">· {t("SADAD", "سداد")}</span>
                    )}
                  </p>
                )}
                {isSadadOrder(order) &&
                  !order.limited &&
                  /awaiting|unpaid|pending/.test(String(order.paymentStatus || "").toLowerCase()) &&
                  !/cancel|expired|refund|fail/.test(String(order.status || "").toLowerCase()) && (
                    <Button
                      className="mt-3 bg-stripe-violet hover:bg-stripe-violet/90 text-white font-light rounded-[4px] text-[13px] h-9"
                      onClick={() => navigate(sadadPendingHref(order.orderId || orderId))}
                    >
                      {t("Pay via SADAD", "ادفع عبر سداد")}
                    </Button>
                  )}
              </div>
            </div>

            {/* Shipping / delivery proof (owner-verified lookups only) */}
            {!order.limited && <OrderProofGallery proofs={order.orderProofs} />}

            {/* Items Card */}
            <article
              className="bg-white border border-stripe-stone rounded-[6px] overflow-hidden"
              style={{ boxShadow: 'rgba(23,23,23,0.06) 0px 3px 6px 0px' }}
              aria-label={t('Order items', 'عناصر الطلب')}
            >
              <div className="bg-stripe-porcelain border-b border-stripe-stone px-5 py-3 flex items-center gap-2">
                <div className="w-1 h-4 bg-stripe-violet rounded-full" />
                <span className="text-[13px] font-light text-stripe-midnight">
                  {t("Order Items", "عناصر الطلب")}
                </span>
                <span className="ml-auto text-[11px] font-light text-stripe-ghost">
                  {order.lineItems?.length || order.itemCount || 0}{" "}
                  {t("items", "عناصر")}
                </span>
              </div>
              <div className="p-5 space-y-3 max-h-[320px] overflow-y-auto">
                {order.limited && (
                  <div className="flex items-start gap-3 p-4 bg-stripe-porcelain border border-stripe-stone rounded-[4px]">
                    <Shield className="w-4 h-4 text-stripe-violet mt-0.5 shrink-0" />
                    <div className="text-[13px] font-light text-stripe-slate leading-relaxed">
                      <p className="text-stripe-midnight">
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
                        className="mt-3 border border-stripe-stone hover:border-stripe-violet text-stripe-midnight font-light rounded-[4px] text-[13px] h-9"
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
                  <p className="text-[13px] font-light text-stripe-slate px-1">
                    {t("Items in this order", "العناصر في هذا الطلب")}:{" "}
                    <span className="text-stripe-midnight">{order.itemCount}</span>
                  </p>
                )}
                {order.lineItems?.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 bg-stripe-porcelain rounded-[4px] border border-stripe-stone hover:border-stripe-violet transition-colors"
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-14 h-14 object-cover rounded-[4px] border border-stripe-stone bg-white"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-light text-stripe-midnight text-sm line-clamp-2">
                        {item.productName}
                      </p>
                      <p className="text-xs text-stripe-ghost mt-1 font-light">
                        {t("Qty", "الكمية")}: {item.productQuantity}
                      </p>
                    </div>
                    <p className="font-light text-stripe-violet whitespace-nowrap" dir="ltr">
                      {item.productPrice.toFixed(2)} SAR
                    </p>
                  </div>
                ))}
              </div>
            </article>

            {/* Summary Card */}
            <article
              className="bg-white border border-stripe-stone rounded-[6px] p-5"
              style={{ boxShadow: 'rgba(23,23,23,0.06) 0px 3px 6px 0px' }}
              aria-label={t('Order summary', 'ملخص الطلب')}
            >
              <h3 className="font-light text-stripe-midnight mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-[4px] bg-stripe-powder flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-stripe-violet" />
                </div>
                {t("Order Summary", "ملخص الطلب")}
              </h3>
              <div className="space-y-3">
                {!order.limited && (
                  <>
                <div className="flex justify-between items-center py-2">
                  <span className="text-stripe-slate text-sm font-light">
                    {t("Subtotal", "المجموع الفرعي")}
                  </span>
                  <span className="font-light text-stripe-midnight" dir="ltr">
                    {(amounts?.subtotal ?? 0).toFixed(2)} SAR
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-t border-stripe-stone">
                  <span className="text-stripe-slate text-sm font-light">
                    {t("VAT (15%)", "ضريبة القيمة المضافة (15%)")}
                  </span>
                  <span className="font-light text-stripe-midnight" dir="ltr">
                    {(amounts?.vat ?? 0).toFixed(2)} SAR
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-t border-stripe-stone">
                  <span className="text-stripe-slate text-sm font-light">
                    {t("Shipping", "الشحن")}
                  </span>
                  <span className="font-light text-stripe-midnight" dir="ltr">
                    {(amounts?.shipping ?? 0).toFixed(2)} SAR
                  </span>
                </div>
                {(amounts?.discount ?? 0) > 0 && (
                  <div className="flex justify-between items-center py-2 border-t border-stripe-stone">
                    <span className="text-stripe-slate text-sm font-light">
                      {t("Discount", "الخصم")}
                    </span>
                    <span className="font-light text-stripe-midnight" dir="ltr">
                      -{(amounts?.discount ?? 0).toFixed(2)} SAR
                    </span>
                  </div>
                )}
                  </>
                )}
                <div className="flex justify-between items-center py-3 border-t border-stripe-stone mt-2">
                  <span className="font-light text-stripe-midnight text-lg">
                    {t("Total", "الإجمالي")}
                  </span>
                  <span className="font-light text-stripe-violet text-xl" dir="ltr">
                    {(amounts?.grandTotal ?? 0).toFixed(2)} SAR
                  </span>
                </div>
              </div>

              {/* Customer Email */}
              {(order.customerEmail ||
                order.maskedCustomerEmail ||
                order.maskedCustomerPhone) && (
                <div className="mt-4 pt-4 border-t border-stripe-stone space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-stripe-ghost font-light">
                    <MapPin className="w-3 h-3" />
                    <span>{t("Confirmation sent to", "تم إرسال التأكيد إلى")}</span>
                    <span className="font-mono text-stripe-midnight" dir="ltr">
                      {order.customerEmail || order.maskedCustomerEmail}
                    </span>
                  </div>
                  {order.limited && order.maskedCustomerPhone && (
                    <div className="flex items-center gap-2 text-xs text-stripe-ghost font-light">
                      <SendHorizontal className="w-3 h-3" />
                      <span>{t("Contact number", "رقم التواصل")}</span>
                      <span className="font-mono text-stripe-midnight" dir="ltr">
                        {order.maskedCustomerPhone}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </article>

            {/* Help Section */}
            <div className="text-center pt-4">
              <p className="text-sm text-stripe-slate mb-3 font-light">
                {t("Need help with your order?", "تحتاج مساعدة مع طلبك؟")}
              </p>
              <Button
                variant="outline"
                className="border border-stripe-stone hover:border-stripe-violet hover:bg-stripe-porcelain text-stripe-midnight hover:text-stripe-midnight font-light rounded-[4px] transition-all duration-200 text-[14px]"
                onClick={() => navigate("/contact")}
              >
                <SendHorizontal className="w-4 h-4 mr-2 text-stripe-violet" />
                {t("Contact Support", "اتصل بالدعم")}
              </Button>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default TrackOrderPublicPage;
