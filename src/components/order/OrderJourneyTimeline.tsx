import { motion } from "framer-motion";
import { CheckCircle2, Clock, Circle, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface JourneyStep {
  title: string;
  subtitle?: string;
  category?: string;
  image?: string;
  content?: React.ReactNode;
  icon: LucideIcon;
  state: "done" | "current" | "upcoming";
}

interface Props {
  steps: JourneyStep[];
  labels: { done: string; current: string; upcoming: string };
}

const stateConfig = {
  done: {
    bar: "bg-ali-success",
    border: "border-ali-success/30",
    badge: "bg-ali-success/10 text-ali-success",
    icon: CheckCircle2,
    tint: "bg-ali-success/10 text-ali-success",
    progress: "100%",
  },
  current: {
    bar: "bg-ali-orange-500",
    border: "border-ali-orange-500/40",
    badge: "bg-ali-orange-100 text-ali-orange-600",
    icon: Clock,
    tint: "bg-ali-orange-100 text-ali-orange-500",
    progress: "65%",
  },
  upcoming: {
    bar: "bg-ali-line-300",
    border: "border-ali-line-200",
    badge: "bg-ali-bg-100 text-ali-ink-500",
    icon: Circle,
    tint: "bg-ali-bg-100 text-ali-ink-400",
    progress: "12%",
  },
} as const;

const OrderJourneyTimeline = ({ steps, labels }: Props) => {
  if (!steps.length) return null;

  return (
    <section role="list" aria-label="Order delivery timeline">
      <div className="relative">
        {/* Track + animated fill line */}
        <div
          className="absolute bottom-6 start-6 top-2 w-px bg-ali-line-300 sm:start-8"
          aria-hidden="true"
        />
        <motion.div
          className="absolute start-6 top-2 w-px origin-top bg-ali-orange-500 sm:start-8"
          style={{ bottom: "1.5rem" }}
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          aria-hidden="true"
        />

        <div className="relative space-y-5 sm:space-y-7">
          {steps.map((step, index) => {
            const config = stateConfig[step.state];
            const StatusIcon = config.icon;
            const StepIcon = step.icon;

            return (
              <motion.div
                key={index}
                className="group relative"
                initial={{ opacity: 0, y: 32, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                role="listitem"
              >
                <div className="flex items-start gap-4 sm:gap-6">
                  {/* Avatar */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                    className="relative z-10 shrink-0"
                  >
                    <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-white shadow-md sm:h-16 sm:w-16">
                      {step.image ? (
                        <img
                          src={step.image}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/placeholder.svg";
                          }}
                        />
                      ) : (
                        <div
                          className={cn(
                            "flex h-full w-full items-center justify-center",
                            config.tint,
                          )}
                        >
                          <StepIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                      )}
                    </div>
                    {step.state === "current" && (
                      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-ali-orange-500/30" />
                    )}
                  </motion.div>

                  {/* Card */}
                  <motion.div
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "min-w-0 flex-1 rounded-xl border bg-white p-4 shadow-card transition-all duration-300 hover:shadow-md sm:p-5",
                      config.border,
                    )}
                  >
                    <div className="mb-2.5 flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4
                          className={cn(
                            "text-base font-semibold transition-colors sm:text-lg",
                            step.state === "upcoming"
                              ? "text-ali-ink-400"
                              : "text-ali-ink-900 group-hover:text-ali-orange-500",
                          )}
                        >
                          {step.title}
                        </h4>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-ali-ink-500">
                          {step.category && (
                            <span
                              className="max-w-[220px] truncate font-mono font-medium"
                              dir="ltr"
                            >
                              {step.category}
                            </span>
                          )}
                          {step.category && step.subtitle && (
                            <span
                              className="h-1 w-1 rounded-full bg-ali-ink-400"
                              aria-hidden="true"
                            />
                          )}
                          {step.subtitle && <span>{step.subtitle}</span>}
                        </div>
                      </div>
                      <span
                        className={cn(
                          "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                          config.badge,
                        )}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {labels[step.state]}
                      </span>
                    </div>

                    <div
                      className={cn(
                        "text-sm leading-relaxed",
                        step.state === "upcoming"
                          ? "text-ali-ink-400"
                          : "text-ali-ink-700",
                      )}
                    >
                      {step.content}
                    </div>

                    {/* Per-step progress bar */}
                    <div
                      className="mt-4 h-1 overflow-hidden rounded-full bg-ali-bg-100"
                      role="progressbar"
                      aria-valuenow={parseInt(config.progress)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <motion.div
                        className={cn("h-full rounded-full", config.bar)}
                        initial={{ width: 0 }}
                        whileInView={{ width: config.progress }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 1,
                          delay: index * 0.15 + 0.6,
                          ease: "easeOut",
                        }}
                      />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Terminal dot */}
        <motion.div
          className="absolute -bottom-1 start-6 -translate-x-1/2 sm:start-8"
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.4,
            delay: steps.length * 0.08 + 0.3,
            type: "spring",
            stiffness: 400,
          }}
          aria-hidden="true"
        >
          <div className="h-3 w-3 rounded-full bg-ali-orange-500 shadow-sm" />
        </motion.div>
      </div>
    </section>
  );
};

export default OrderJourneyTimeline;
