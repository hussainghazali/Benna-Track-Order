// src/lib/ai-error-handler.ts
// Central client-side handler for AI quota / availability problems.
// Edge functions wrap AI failures into a 200 response shaped:
//   { ok: false, code: "AI_OUT_OF_CREDITS" | "AI_RATE_LIMITED" | "AI_UNAVAILABLE" | "AI_INVALID" | "ALLOWANCE_EXCEEDED", message, messageAr }
// This module:
//   • detects that envelope,
//   • shows a friendly toast,
//   • dispatches a global event so the app can open the credit paywall.

import { toast } from "sonner";

export type AiErrorCode =
  | "AI_OUT_OF_CREDITS"
  | "AI_RATE_LIMITED"
  | "AI_UNAVAILABLE"
  | "AI_INVALID"
  | "ALLOWANCE_EXCEEDED";

export interface AiErrorEnvelope {
  ok: false;
  code: AiErrorCode | string;
  message?: string;
  messageAr?: string;
}

const isAr = () => {
  try {
    return document?.documentElement?.dir === "rtl";
  } catch {
    return false;
  }
};

export const AI_PAYWALL_EVENT = "benna:ai-paywall";

export interface AiPaywallDetail {
  code: AiErrorCode | string;
  message: string;
}

/** True if the response body is an AI-error envelope. */
export const isAiError = (data: any): data is AiErrorEnvelope =>
  data && data.ok === false && typeof data.code === "string";

/** True if the user needs to buy credits to unblock. */
export const shouldOpenPaywall = (code: string) =>
  code === "AI_OUT_OF_CREDITS" || code === "ALLOWANCE_EXCEEDED";

/**
 * Handle an AI-error envelope. Returns true if it WAS an AI error and was handled
 * (so the caller can bail out without showing its own technical toast).
 */
export const handleAiError = (data: any, opts: { silent?: boolean } = {}): boolean => {
  if (!isAiError(data)) return false;
  const msg = (isAr() && data.messageAr) || data.message || "AI service unavailable.";
  if (!opts.silent) {
    if (shouldOpenPaywall(data.code as string)) {
      // No toast — the paywall modal is the primary CTA
    } else {
      toast.error(msg);
    }
  }
  if (shouldOpenPaywall(data.code as string)) {
    try {
      window.dispatchEvent(
        new CustomEvent<AiPaywallDetail>(AI_PAYWALL_EVENT, {
          detail: { code: data.code as string, message: msg },
        }),
      );
    } catch {
      /* ignore */
    }
  }
  return true;
};

/**
 * Map a thrown supabase.functions.invoke error (FunctionsHttpError or network) into
 * a friendly toast. Returns the parsed envelope when we can recover one.
 */
export const handleInvokeError = async (err: any): Promise<AiErrorEnvelope | null> => {
  // supabase-js v2: error.context is the underlying Response object
  try {
    const resp: Response | undefined = err?.context;
    if (resp && typeof resp.json === "function") {
      const body = await resp.json().catch(() => null);
      if (isAiError(body)) {
        handleAiError(body);
        return body;
      }
    }
  } catch {
    /* ignore */
  }
  const message =
    err?.message?.includes("non-2xx") || err?.name === "FunctionsHttpError"
      ? isAr()
        ? "خدمة الذكاء الاصطناعي غير متوفرة حالياً. يرجى المحاولة لاحقاً."
        : "Benna AI is temporarily unavailable. Please try again shortly."
      : err?.message || "Something went wrong. Please try again.";
  toast.error(message);
  return null;
};
