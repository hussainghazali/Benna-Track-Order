// Minimal wishlist context — the real one syncs to the backend; the standalone
// build only needs the shape so AccountSidebar compiles.
import { createContext, useContext, type ReactNode } from "react";

interface WishlistContextValue {
  wishlistIds: Set<string>;
  items: unknown[];
  isLoading: boolean;
  toggleWishlist: (productId: string) => void;
  refetch: () => Promise<unknown[]>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export const WishlistProvider = ({ children }: { children: ReactNode }) => (
  <WishlistContext.Provider
    value={{
      wishlistIds: new Set<string>(),
      items: [],
      isLoading: false,
      toggleWishlist: () => {},
      refetch: async () => [],
    }}
  >
    {children}
  </WishlistContext.Provider>
);

export const useWishlistContext = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx)
    throw new Error("useWishlistContext must be used within WishlistProvider");
  return ctx;
};
