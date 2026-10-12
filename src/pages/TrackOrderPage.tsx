import { locNum } from "@/utils/formatPrice";
import RiyalSymbol from "@/components/ui/RiyalSymbol";
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccountSidebar from "@/components/AccountSidebar";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Package,
  CheckCircle2,
  Truck,
  PackageCheck,
  Clock,
  XCircle,
  MapPin,
  Sparkles,
  Shield,
  Calendar,
} from "lucide-react";
import { orderApi } from "@/lib/api-client";
import { getProductImage } from "@/utils/imageUtils";
import { toast } from "@/hooks/use-toast";
import OrderProofGallery, {
  type OrderProof,
} from "@/components/order/OrderProofGallery";

const safeNum = (v: unknown) => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : 0;
};

// Map various backend status values to the 4 visible timeline steps
const STATUS_TO_STEP: Record<string, number> = {
  pending: 0,
  placed: 0,
  paid: 0,
  // Offline payment (SADAD) bill issued but not yet settled. The order exists
  // and its stock is reserved, so it belongs on step 0 rather than being
  // treated as an unknown status — but it has NOT been confirmed.
  awaiting_payment: 0,
  accepted: 1,
  confirmed: 1,
  processing: 1,
  preparing: 1,
  ready: 1,
  shipped: 2,
  in_transit: 2,
  out_for_delivery: 2,
  delivered: 3,
  completed: 3,
};

interface TrackingOrder {
  orderProofs?: OrderProof[];
  _id: string;
  orderId?: string;
  parentOrderId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  products: {
    productName: string;
    image: string;
    quantity: number;
    price: string;
  }[];
  shippingAddress?: {
    address?: string;
    city?: string;
    region?: string;
    country?: string;
  };
}

const STEPS_EN = [
  {
    key: "pending",
    label: "Order Placed",
    icon: Clock,
    description: "Your order has been received",
  },
  {
    key: "accepted",
    label: "Confirmed",
    icon: CheckCircle2,
    description: "Order confirmed & processed",
  },
  {
    key: "shipped",
    label: "Shipped",
    icon: Truck,
    description: "Your order is on the way",
  },
  {
    key: "delivered",
    label: "Delivered",
    icon: PackageCheck,
    description: "Order delivered successfully",
  },
];

const STEPS_AR = [
  {
    key: "pending",
    label: "تم الطلب",
    icon: Clock,
    description: "تم استلام طلبك",
  },
  {
    key: "accepted",
    label: "تم التأكيد",
    icon: CheckCircle2,
    description: "تم تأكيد الطلب وتجهيزه",
  },
  {
    key: "shipped",
    label: "تم الشحن",
    icon: Truck,
    description: "طلبك في طريقه إليك",
  },
  {
    key: "delivered",
    label: "تم التوصيل",
    icon: PackageCheck,
    description: "تم توصيل الطلب بنجاح",
  },
];

const getStepIndex = (status: string) => {
  const s = String(status || "").toLowerCase();
  if (s === "cancelled" || s === "rejected") return -1;
  return STATUS_TO_STEP[s] ?? 0;
};

const TrackOrderPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { isRTL, language } = useLanguage();
  const navigate = useNavigate();
  const [order, setOrder] = useState<TrackingOrder | null>(null);
  const [loading, setLoading] = useState(true);

  const isAr = language === "ar";
  const tx = (en: string, ar: string) => (isAr ? ar : en);
  const STEPS = isAr ? STEPS_AR : STEPS_EN;

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      setLoading(true);
      try {
        const response = await orderApi.getById(orderId);
        setOrder(response?.data || null);
      } catch (err) {
        setOrder(null);
        toast({
          title: tx("Failed to load tracking", "فشل تحميل التتبع"),
          description: err instanceof Error ? err.message : "",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;
  const isCancelled =
    order?.status === "cancelled" || order?.status === "rejected";
  const currentStep = order ? getStepIndex(order.status) : 0;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(isAr ? "ar-SA" : "en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? "rtl" : "ltr"}>
      <Header />
      <main className="w-full px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          <div className="hidden lg:block">
            <AccountSidebar />
          </div>

          <div className="flex-1 min-w-0">
            {/* Back Button */}
            <div className="mb-4">
              <Link
                to="/account/orders"
                className="text-[14px] text-[#50617a] hover:text-[#061b31] inline-flex items-center gap-2"
              >
                <BackArrow className="w-4 h-4" />
                {tx("Back to Orders", "العودة للطلبات")}
              </Link>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20 bg-white rounded-[6px] border border-[#d8d6df] shadow-sm">
                <Loader2 className="w-8 h-8 animate-spin text-[#FA6400]" />
              </div>
            ) : !order ? (
              <div className="text-center py-16 bg-white rounded-[6px] border border-[#d8d6df] shadow-sm">
                <div className="w-20 h-20 rounded-full bg-[#e5edf5] flex items-center justify-center mx-auto mb-4">
                  <Package className="w-10 h-10 text-[#50617a]" />
                </div>
                <h2 className="text-xl font-semibold text-[#061b31] mb-2">
                  {tx("Order not found", "الطلب غير موجود")}
                </h2>
                <p className="text-sm text-[#50617a] mb-4">
                  {tx(
                    "The order you're looking for doesn't exist or has been removed.",
                    "الطلب الذي تبحث عنه غير موجود أو تم إزالته.",
                  )}
                </p>
                <Button
                  asChild
                  className="bg-[#FA6400] hover:bg-[#E85A00] text-white font-light rounded-[4px] px-6 py-2.5"
                >
                  <Link to="/account/orders">
                    {tx("View All Orders", "عرض جميع الطلبات")}
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Track Order Header */}
                <div className="bg-white rounded-[6px] shadow-sm border border-[#d8d6df] mb-6 p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-1 bg-[#FA6400] rounded-full" />
                    <h2 className="text-[22px] font-medium text-[#061b31]">
                      {tx("Track Order", "تتبع الطلب")}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 text-[#50617a] text-[14px]">
                    <Shield className="w-4 h-4 text-[#8087ff]" />
                    <span dir="ltr">
                      {tx("Order ID", "رقم الطلب")}: #
                      {order.orderId || (order._id || "").slice(-8) || "—"}
                    </span>
                  </div>
                </div>

                {/* Tracking Timeline */}
                <div className="bg-white rounded-[6px] shadow-sm border border-[#d8d6df] mb-6 p-8 relative overflow-hidden">
                  {isCancelled ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-10 h-10 text-red-500" />
                      </div>
                      <h2 className="text-xl font-semibold text-red-600 mb-2">
                        {order.status === "cancelled"
                          ? tx("Order Cancelled", "تم إلغاء الطلب")
                          : tx("Order Rejected", "تم رفض الطلب")}
                      </h2>
                      <p className="text-sm text-[#50617a] max-w-md mx-auto">
                        {tx(
                          `This order was ${order.status} on ${formatDate(order.updatedAt)}`,
                          `تم ${order.status === "cancelled" ? "إلغاء" : "رفض"} هذا الطلب في ${formatDate(order.updatedAt)}`,
                        )}
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Desktop Timeline */}
                      <div className="hidden md:block">
                        <div className="max-w-4xl mx-auto">
                          {/* Progress Line */}
                          <div className="absolute top-[60px] left-[10%] right-[10%] h-0.5 bg-[#d8d6df] z-0" />
                          <div
                            className="absolute top-[60px] left-[10%] h-0.5 bg-[#FA6400] z-0"
                            style={{
                              width: `${(currentStep / (STEPS.length - 1)) * 80}%`,
                            }}
                          />

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
                            {STEPS.map((step, idx) => {
                              const isActive = idx <= currentStep;
                              const isCurrent = idx === currentStep;
                              const StepIcon = step.icon;
                              return (
                                <div
                                  key={step.key}
                                  className="flex flex-col items-center text-center"
                                >
                                  <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-sm ${
                                      isCurrent
                                        ? "bg-[#FA6400] text-white"
                                        : isActive
                                          ? "bg-[#FA6400] text-white"
                                          : "bg-white border border-[#d8d6df] text-[#64748d]"
                                    }`}
                                  >
                                    <StepIcon className="w-5 h-5" />
                                  </div>
                                  <h4 className="text-[14px] font-medium text-[#061b31] mb-1">
                                    {step.label}
                                  </h4>
                                  <p className="text-[12px] text-[#50617a] mb-2">
                                    {step.description}
                                  </p>
                                  {isCurrent && (
                                    <span className="text-[10px] font-semibold text-[#FA6400] bg-[#e5edf5] px-2 py-1 rounded">
                                      {tx("CURRENT", "الحالي")}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Mobile Timeline */}
                      <div className="md:hidden space-y-0">
                        {STEPS.map((step, idx) => {
                          const isActive = idx <= currentStep;
                          const isCurrent = idx === currentStep;
                          const StepIcon = step.icon;
                          const isLast = idx === STEPS.length - 1;
                          return (
                            <div key={step.key} className="flex gap-4">
                              <div className="flex flex-col items-center">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 ${
                                    isCurrent
                                      ? "bg-[#FA6400] border-[#FA6400] text-white shadow-md"
                                      : isActive
                                        ? "bg-[#FA6400] border-[#FA6400] text-white"
                                        : "bg-white border-2 border-[#d8d6df] text-[#64748d]"
                                  }`}
                                >
                                  <StepIcon className="w-4 h-4" />
                                </div>
                                {!isLast && (
                                  <div
                                    className={`w-0.5 h-12 mt-1 ${isActive ? "bg-[#FA6400]" : "bg-[#d8d6df]"}`}
                                  />
                                )}
                              </div>
                              <div className="pb-6 flex-1">
                                <p
                                  className={`text-sm font-medium ${isActive ? "text-[#061b31]" : "text-[#64748d]"}`}
                                >
                                  {step.label}
                                </p>
                                <p className="text-xs text-[#50617a] mt-0.5">
                                  {step.description}
                                </p>
                                {isCurrent && (
                                  <p className="text-xs font-semibold text-[#FA6400] mt-1">
                                    {tx("Current Status", "الحالة الحالية")}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Items Box */}
                  <div className="bg-white rounded-[6px] shadow-sm border border-[#d8d6df] p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Package className="w-4 h-4 text-[#FA6400]" />
                      <h3 className="text-[16px] font-medium text-[#061b31]">
                        {tx("Items in this order", "منتجات هذا الطلب")}
                      </h3>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-16 h-16 flex-shrink-0 bg-[#e5edf5] rounded-[4px] border border-[#d8d6df] p-1">
                        <img
                          src={
                            getProductImage(order.products?.[0]?.image) ||
                            "/placeholder.svg"
                          }
                          alt="Product Image"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/placeholder.svg";
                          }}
                        />
                      </div>
                      <div>
                        <h4 className="text-[14px] font-medium text-[#061b31] leading-snug mb-1 line-clamp-2">
                          {order.products?.[0]?.productName}
                        </h4>
                        <div className="text-[12px] text-[#50617a]">
                          <span>
                            {tx("Qty", "الكمية")}:{" "}
                            {order.products?.[0]?.quantity}
                          </span>{" "}
                          •{" "}
                          <span className="text-[#FA6400] font-medium">
                            {locNum(safeNum(order.products?.[0]?.price))}{" "}
                            <RiyalSymbol />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Info Box */}
                  <div className="bg-white rounded-[6px] shadow-sm border border-[#d8d6df] p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="w-4 h-4 text-[#FA6400]" />
                      <h3 className="text-[16px] font-medium text-[#061b31]">
                        {tx("Delivery Information", "معلومات التوصيل")}
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <Calendar className="w-4 h-4 text-[#64748d] mt-1" />
                        <div>
                          <p className="text-[10px] font-semibold text-[#64748d] uppercase tracking-wider mb-0.5">
                            {tx("ORDER PLACED", "تم الطلب")}
                          </p>
                          <p className="text-[14px] font-medium text-[#061b31]">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Clock className="w-4 h-4 text-[#64748d] mt-1" />
                        <div>
                          <p className="text-[10px] font-semibold text-[#64748d] uppercase tracking-wider mb-0.5">
                            {tx("LAST UPDATED", "آخر تحديث")}
                          </p>
                          <p className="text-[14px] font-medium text-[#061b31]">
                            {formatDate(order.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                    {!isCancelled && currentStep < STEPS.length - 1 && (
                      <div className="mt-4 pt-4 border-t border-[#d8d6df] flex items-center gap-2 text-[#FA6400] text-[12px] font-medium">
                        <Sparkles className="w-[14px] h-[14px]" />
                        {tx(
                          "ESTIMATED DELIVERY WITHIN 3-5 BUSINESS DAYS",
                          "التوصيل المتوقع خلال 3-5 أيام عمل",
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <OrderProofGallery proofs={order.orderProofs} className="mb-6" />

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    className="bg-white border border-[#d8d6df] text-[#061b31] rounded-[4px] py-[14.5px] px-[24px] text-[14px] font-medium hover:bg-[#e5edf5] transition-colors flex items-center justify-center gap-2"
                    asChild
                  >
                    <Link to={`/account/orders/${orderId}`}>
                      {tx("View Full Details", "عرض التفاصيل الكاملة")}
                    </Link>
                  </Button>
                  <Button
                    className="bg-white border border-[#d8d6df] text-[#061b31] rounded-[4px] py-[14.5px] px-[24px] text-[14px] font-medium hover:bg-[#e5edf5] transition-colors flex items-center justify-center gap-2"
                    asChild
                  >
                    <Link to="/contact">
                      {tx("Need Help?", "تحتاج مساعدة؟")}
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TrackOrderPage;
