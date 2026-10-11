import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import AuthPage from "@/pages/AuthPage";
import TrackOrderPublicPage from "@/pages/TrackOrderPublicPage";
import TrackOrderPage from "@/pages/TrackOrderPage";

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Navigate to="/track-order" replace />} />
                <Route path="/track-order" element={<TrackOrderPublicPage />} />
                <Route path="/account/track/:orderId" element={<TrackOrderPage />} />
                <Route path="/login" element={<AuthPage mode="login" />} />
                <Route path="/register" element={<AuthPage mode="register" />} />
                <Route path="*" element={<Navigate to="/track-order" replace />} />
              </Routes>
              <Toaster richColors position="top-center" />
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
