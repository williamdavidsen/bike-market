import { Outlet } from "react-router-dom";
import { CookieBanner } from "../common/CookieBanner";
import { CartDrawer } from "./CartDrawer";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function AppLayout() {
  return (
    <div className="app-shell min-h-screen">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <CookieBanner />
    </div>
  );
}
