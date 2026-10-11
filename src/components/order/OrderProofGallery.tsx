import { useState } from "react";
import { Camera, Play } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

export type OrderProof = {
  _id: string;
  url: string;
  type: "image" | "video";
  mimeType?: string;
  stage: "shipped" | "delivered";
  uploadedAt?: string;
  subOrderId?: string;
};

type Props = {
  proofs?: OrderProof[] | null;
  className?: string;
};

const STAGES: Array<OrderProof["stage"]> = ["shipped", "delivered"];

/**
 * Shipping / delivery proof photos and videos uploaded by the seller or Benna.
 * Renders nothing when the order has no proof (it is optional).
 */
const OrderProofGallery = ({ proofs, className = "" }: Props) => {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const tx = (en: string, ar: string) => (isAr ? ar : en);
  const [viewing, setViewing] = useState<OrderProof | null>(null);

  const list = Array.isArray(proofs) ? proofs.filter((p) => p?.url) : [];
  if (list.length === 0) return null;

  const stageLabel = (stage: OrderProof["stage"]) =>
    stage === "shipped"
      ? tx("Shipping proof", "إثبات الشحن")
      : tx("Delivery proof", "إثبات التسليم");

  const formatDate = (value?: string) => {
    if (!value) return "";
    try {
      return new Date(value).toLocaleString(isAr ? "ar-SA" : "en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <section
      className={`bg-white rounded-[6px] shadow-sm border border-[#d8d6df] p-6 ${className}`}
      aria-label={tx("Order proof", "إثبات الطلب")}
    >
      <div className="flex items-center gap-2 mb-4">
        <Camera className="w-4 h-4 text-[#533afd]" />
        <h3 className="text-[16px] font-medium text-[#061b31]">
          {tx("Order Proof", "إثبات الطلب")}
        </h3>
      </div>

      <div className="space-y-5">
        {STAGES.map((stage) => {
          const items = list.filter((p) => p.stage === stage);
          if (items.length === 0) return null;
          return (
            <div key={stage}>
              <p className="text-[12px] font-semibold text-[#64748d] uppercase tracking-wider mb-2">
                {stageLabel(stage)}
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {items.map((proof) => (
                  <button
                    key={proof._id}
                    type="button"
                    onClick={() => setViewing(proof)}
                    className="relative aspect-square overflow-hidden rounded-[4px] border border-[#d8d6df] bg-[#e5edf5] focus:outline-none focus:ring-2 focus:ring-[#533afd]"
                    aria-label={
                      proof.type === "video"
                        ? tx("Play video", "تشغيل الفيديو")
                        : tx("View image", "عرض الصورة")
                    }
                  >
                    {proof.type === "video" ? (
                      <>
                        <video
                          src={proof.url}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                          preload="metadata"
                        />
                        <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
                          <Play className="w-6 h-6 text-white fill-white" />
                        </span>
                      </>
                    ) : (
                      <img
                        src={proof.url}
                        alt={stageLabel(stage)}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className="max-w-3xl p-3 sm:p-4">
          <DialogTitle className="text-[14px] font-medium text-[#061b31] pe-8">
            {viewing ? stageLabel(viewing.stage) : ""}
            {viewing?.uploadedAt && (
              <span className="ms-2 text-[12px] font-normal text-[#64748d]">
                {formatDate(viewing.uploadedAt)}
              </span>
            )}
          </DialogTitle>
          {viewing &&
            (viewing.type === "video" ? (
              <video
                src={viewing.url}
                controls
                autoPlay
                playsInline
                className="w-full max-h-[75vh] rounded-[4px] bg-black"
              />
            ) : (
              <img
                src={viewing.url}
                alt={stageLabel(viewing.stage)}
                className="w-full max-h-[75vh] object-contain rounded-[4px]"
              />
            ))}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default OrderProofGallery;
