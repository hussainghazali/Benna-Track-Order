import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sparkles, Bell, Rocket, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { LucideIcon } from "lucide-react";

interface ComingSoonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureIcon: LucideIcon;
  featureName: { en: string; ar: string };
  description?: { en: string; ar: string };
}

const ComingSoonModal = ({
  open,
  onOpenChange,
  featureIcon: FeatureIcon,
  featureName,
  description,
}: ComingSoonModalProps) => {
  const { isRTL, language } = useLanguage();

  const defaultDesc = {
    en: `${featureName.en} is launching soon on Benna. We're crafting an experience worth waiting for — stay tuned for the official rollout.`,
    ar: `${featureName.ar} قادم قريباً إلى بنّا. نحن نصمم تجربة تستحق الانتظار — ترقبوا الإطلاق الرسمي.`,
  };

  const desc = description || defaultDesc;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-0 bg-transparent shadow-none">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative bg-white rounded-[6px] p-8 text-center overflow-hidden border border-[#d8d6df] shadow-lg"
              dir={isRTL ? "rtl" : "ltr"}
            >
              {/* Close button */}
              <button
                onClick={() => onOpenChange(false)}
                className="absolute top-4 right-4 p-1.5 rounded-[4px] text-[#64748d] hover:text-[#061b31] hover:bg-[#e5edf5] transition-all duration-200 z-20"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Subtle background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#e5edf5]/50 to-white pointer-events-none" />

              <div className="relative z-10">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: 0.15,
                    duration: 0.3,
                    ease: "easeOut",
                  }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-[6px] bg-[#533afd] mx-auto mb-6 shadow-sm"
                >
                  <FeatureIcon className="w-8 h-8 text-white" />
                </motion.div>

                {/* Coming Soon Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.3 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e5edf5] border border-[#533afd]/20 mb-5"
                >
                  <Rocket className="w-3 h-3 text-[#533afd]" />
                  <span className="text-xs font-medium tracking-wide text-[#533afd]">
                    {isRTL ? "قريباً" : "COMING SOON"}
                  </span>
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.3 }}
                  className="text-xl font-semibold text-[#061b31] mb-3"
                >
                  {isRTL ? featureName.ar : featureName.en}
                </motion.h2>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, duration: 0.3 }}
                  className="text-[#50617a] text-sm leading-relaxed mb-8 max-w-sm mx-auto"
                >
                  {isRTL ? desc.ar : desc.en}
                </motion.p>

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55, duration: 0.3 }}
                  className="flex justify-center"
                >
                  <Button
                    onClick={() => onOpenChange(false)}
                    className="bg-[#533afd] hover:bg-[#422bc7] text-white font-medium px-6 py-2.5 rounded-[4px] transition-all duration-200 shadow-sm"
                  >
                    {isRTL ? "حسناً، فهمت" : "Got it"}
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default ComingSoonModal;
