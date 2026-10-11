import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlistContext } from "@/contexts/WishlistContext";
import {
  Package,
  RotateCcw,
  Coins,
  Heart,
  UserCircle,
  MapPinned,
  CreditCard,
  Shield,
  Gift,
  ChevronRight,
  Lock,
  LucideIcon,
  Sparkles,
  FileText,
  Bell,
  Star,
  MessageSquare,
  FileSearch,
  ClipboardList,
  Calculator,
  Download,
  Crown,
  X,
  Menu,
  Landmark,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ComingSoonModal from "@/components/ComingSoonModal";

const AccountSidebar = () => {
  const { t, isRTL, language } = useLanguage();
  const { user } = useAuth();
  const { wishlistIds } = useWishlistContext();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [comingSoonModal, setComingSoonModal] = useState<{
    open: boolean;
    icon: LucideIcon;
    name: { en: string; ar: string };
  }>({ open: false, icon: Coins, name: { en: "", ar: "" } });

  const isAr = language === "ar";
  const tx = (en: string, ar: string) => (isAr ? ar : en);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const mainMenuItems = [
    { icon: Package, label: t("common.orders"), path: "/account/orders" },
    {
      icon: Landmark,
      label: tx("Bank Transfers", "التحويلات البنكية"),
      path: "/account/bank-transfers",
    },
    { icon: RotateCcw, label: t("common.returns"), path: "/account/returns" },
    {
      icon: Heart,
      label: t("common.wishlist"),
      path: "/account/wishlist",
      badge: wishlistIds.size > 0 ? `${wishlistIds.size}` : undefined,
    },
    {
      icon: FileText,
      label: tx("Invoices", "الفواتير"),
      path: "/account/invoices",
    },
    {
      icon: MessageSquare,
      label: tx("Support Tickets", "تذاكر الدعم"),
      path: "/account/support-tickets",
    },
    {
      icon: FileSearch,
      label: tx("RFQ Proposals", "طلبات عروض الأسعار"),
      path: "/account/rfq-proposals",
    },
    {
      icon: ClipboardList,
      label: tx("My RFQs", "طلبات التسعير الخاصة بي"),
      path: "/account/rfqs",
    },
    {
      icon: Calculator,
      label: tx("BOQ / Projects", "جداول الكميات / المشاريع"),
      path: "/account/boq-projects",
    },
    {
      icon: Coins,
      label: t("common.bennaCredits"),
      path: "/account/credits",
      comingSoon: true,
      featureName: { en: "Benna Credits", ar: "رصيد بنّا" },
    },
  ];

  const accountMenuItems = [
    { icon: UserCircle, label: t("common.profile"), path: "/account/profile" },
    {
      icon: MapPinned,
      label: t("common.addresses"),
      path: "/account/addresses",
    },
    {
      icon: CreditCard,
      label: t("common.payments"),
      path: "/account/payments",
    },
    {
      icon: Shield,
      label: t("common.warrantyClaims"),
      path: "/account/warranty",
    },
    {
      icon: Lock,
      label: tx("Security", "الأمان"),
      path: "/account/security",
    },
    {
      icon: Bell,
      label: tx("Notifications", "الإشعارات"),
      path: "/account/notifications",
    },
    {
      icon: Star,
      label: tx("Reviews", "التقييمات"),
      path: "/account/reviews",
    },
    {
      icon: Crown,
      label: tx("Loyalty / Rewards", "الولاء / المكافآت"),
      path: "/account/loyalty",
      // comingSoon: true,
      featureName: { en: "Loyalty/Rewards", ar: "برنامج الولاء/المكافآت" },
    },
    {
      icon: Download,
      label: tx("Download Center", "مركز التنزيلات"),
      path: "/account/download-center",
    },
    {
      icon: Gift,
      label: t("orders.giftCards"),
      path: "/account/gift-cards",
      comingSoon: true,
      featureName: { en: "Gift Cards", ar: "بطاقات الهدايا" },
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleComingSoonClick = (
    e: React.MouseEvent,
    icon: LucideIcon,
    name: { en: string; ar: string },
  ) => {
    e.preventDefault();
    setComingSoonModal({ open: true, icon, name });
  };

  const renderMenuItem = (item: {
    icon: LucideIcon;
    label: string;
    path: string;
    badge?: string;
    comingSoon?: boolean;
    featureName?: { en: string; ar: string };
  }) => {
    const Icon = item.icon;
    const baseClasses = cn(
      "flex items-center gap-3 px-4 py-3 transition-all duration-200 w-full text-left",
      isRTL ? "border-r-2 text-right" : "border-l-2",
      item.comingSoon
        ? "border-transparent hover:bg-violet-50 text-gray-500 cursor-pointer"
        : isActive(item.path)
          ? "bg-violet-600/10 border-violet-600 text-violet-700"
          : "border-transparent hover:bg-gray-50 text-gray-600",
    );

    const content = (
      <>
        <Icon
          className={cn(
            "w-5 h-5 transition-colors",
            item.comingSoon
              ? "text-gray-600"
              : isActive(item.path)
                ? "text-violet-700"
                : "text-gray-500 group-hover:text-violet-600",
          )}
        />
        <span className="flex-1 text-sm font-medium">{item.label}</span>
        {item.comingSoon ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
            <Lock className="w-2.5 h-2.5" />
            {isRTL ? "قريباً" : "Soon"}
          </span>
        ) : (
          item.badge && (
            <span className="text-xs font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full">
              {item.badge}
            </span>
          )
        )}
      </>
    );

    if (item.comingSoon && item.featureName) {
      return (
        <button
          key={item.path}
          type="button"
          onClick={(e) =>
            handleComingSoonClick(e, item.icon, item.featureName!)
          }
          className={baseClasses}
        >
          {content}
        </button>
      );
    }

    return (
      <Link key={item.path} to={item.path} className={baseClasses}>
        {content}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-violet-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-violet-600 transition-colors"
        aria-label={isRTL ? "القائمة" : "Menu"}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={cn(
          "lg:hidden fixed inset-y-0 right-0 z-50 w-80 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out",
          isRTL ? "left-0 right-auto" : "right-0",
          isMobileMenuOpen
            ? "translate-x-0"
            : isRTL
              ? "-translate-x-full"
              : "translate-x-full",
        )}
      >
        <div className="h-full overflow-y-auto">
          {/* Mobile Drawer Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-black">
              {isRTL ? "القائمة" : "Menu"}
            </h2>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label={isRTL ? "إغلاق" : "Close"}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Drawer Content */}
          <div className="p-4 space-y-4">
            {/* User Info Card - Mobile */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center text-base font-black text-white shrink-0">
                  {user?.name ? getInitials(user.name) : "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-black truncate">
                    {isRTL ? "هلا" : "Hala"} {user?.name || "User"}!
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* Membership Badge - Mobile */}
              <Link
                to="/benna-pro"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between bg-violet-50 rounded-xl px-3 py-2.5 hover:bg-violet-100 transition-all border border-violet-200"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-700 shrink-0" />
                  <span className="text-sm font-bold text-black">benna</span>
                  <span className="bg-violet-600 text-white text-xs font-bold px-1.5 py-0.5 rounded shrink-0">
                    PRO
                  </span>
                  <span className="text-sm text-gray-600">
                    {t("orders.member")}
                  </span>
                </div>
                <ChevronRight
                  className={cn(
                    "w-4 h-4 text-violet-600 shrink-0",
                    isRTL && "rotate-180",
                  )}
                />
              </Link>
            </div>

            {/* Main Menu - Mobile */}
            <nav className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
              {mainMenuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 transition-all duration-200 w-full",
                    isActive(item.path)
                      ? "bg-violet-600/10 border-l-2 border-violet-600 text-violet-700"
                      : "border-l-2 border-transparent hover:bg-gray-50 text-gray-600", 
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 shrink-0 transition-colors",
                      isActive(item.path) ? "text-violet-700" : "text-gray-500",
                    )}
                  />
                  <span className="flex-1 text-sm font-medium">
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="text-xs font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full shrink-0">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            {/* Account Menu - Mobile */}
            <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {t("common.myAccount")}
                </span>
              </div>
              <nav>
                {accountMenuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 transition-all duration-200 w-full",
                      isActive(item.path)
                        ? "bg-violet-600/10 border-l-2 border-violet-600 text-violet-700"
                        : "border-l-2 border-transparent hover:bg-gray-50 text-gray-600",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "w-5 h-5 shrink-0 transition-colors",
                        isActive(item.path)
                          ? "text-violet-700"
                          : "text-gray-500",
                      )}
                    />
                    <span className="flex-1 text-sm font-medium">
                      {item.label}
                    </span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 lg:w-72 xl:w-80 shrink-0">
        {/* User Info Card - Yellow Theme */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-5 mb-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-full bg-violet-600 flex items-center justify-center text-lg font-black text-white">
              {user?.name ? getInitials(user.name) : "U"}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-black truncate text-lg">
                {isRTL ? "هلا" : "Hala"} {user?.name || "User"}!
              </h3>
              <p className="text-sm text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>

          {/* Membership Badge - Yellow Theme */}
          <Link
            to="/benna-pro"
            className="flex items-center justify-between bg-violet-50 rounded-xl px-3 py-2.5 hover:bg-violet-100 transition-all border border-violet-200"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-700" />
              <span className="text-sm font-bold text-black">benna</span>
              <span className="bg-violet-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                PRO
              </span>
              <span className="text-sm text-gray-600">
                {t("orders.member")}
              </span>
            </div>
            <ChevronRight
              className={cn("w-4 h-4 text-violet-600", isRTL && "rotate-180")}
            />
          </Link>
        </div>

        {/* Main Menu */}
        <nav className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden mb-5">
          {mainMenuItems.map(renderMenuItem)}
        </nav>

        {/* Account Menu */}
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {t("common.myAccount")}
            </span>
          </div>
          <nav>{accountMenuItems.map(renderMenuItem)}</nav>
        </div>

        <ComingSoonModal
          open={comingSoonModal.open}
          onOpenChange={(open) =>
            setComingSoonModal((prev) => ({ ...prev, open }))
          }
          featureIcon={comingSoonModal.icon}
          featureName={comingSoonModal.name}
        />
      </aside>
    </>
  );
};

export default AccountSidebar;
