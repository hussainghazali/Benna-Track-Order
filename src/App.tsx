import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import AuthPage from "@/pages/AuthPage";
import WelcomePage from "@/pages/WelcomePage";
import TrackOrderPublicPage from "@/pages/TrackOrderPublicPage";
import TrackOrderPage from "@/pages/TrackOrderPage";
import SideActionRail from "@/components/sections/SideActionRail";
import CartDrawer from "@/components/CartDrawer";

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
                <Route path="/welcome" element={<WelcomePage />} />
                <Route path="/login" element={<AuthPage mode="login" />} />
                <Route path="/register" element={<AuthPage mode="register" />} />
                <Route path="*" element={<Navigate to="/track-order" replace />} />
              </Routes>
              <Toaster richColors position="top-center" />
              <SideActionRail />
              <CartDrawer />
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
