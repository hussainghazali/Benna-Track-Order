// shadcn-style toast shim backed by sonner.
import { toast as sonnerToast } from "sonner";

interface ToastInput {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export const toast = ({ title, description, variant }: ToastInput) => {
  const fn = variant === "destructive" ? sonnerToast.error : sonnerToast;
  fn(title, { description });
};

export const useToast = () => ({ toast });
