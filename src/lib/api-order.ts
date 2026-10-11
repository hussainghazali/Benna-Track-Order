// Minimal order API — only the tracking surface this app needs.
import { apiClient } from "./api-client";

export const orderApi = {
  getById: (orderId: string) =>
    apiClient<{ success: boolean; data: any }>(
      `/users/website/track/${encodeURIComponent(orderId)}?parentOrder=true`,
    ),
};
