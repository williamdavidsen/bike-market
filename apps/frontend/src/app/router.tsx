import { createBrowserRouter } from "react-router-dom";
import { AdminRoute } from "../components/layout/AdminRoute";
import { AdminLayout } from "../components/admin/AdminLayout";
import { AppLayout } from "../components/layout/AppLayout";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { AccountPage } from "../pages/AccountPage";
import { AdminCategoriesPage } from "../pages/AdminCategoriesPage";
import { AdminDashboardPage } from "../pages/AdminDashboardPage";
import { AdminOrdersPage } from "../pages/AdminOrdersPage";
import { AdminProductsPage } from "../pages/AdminProductsPage";
import { CartPage } from "../pages/CartPage";
import { CategoryPage } from "../pages/CategoryPage";
import { CheckoutPage } from "../pages/CheckoutPage";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { OrdersPage } from "../pages/OrdersPage";
import { PaymentFailedPage } from "../pages/PaymentFailedPage";
import { PaymentSuccessPage } from "../pages/PaymentSuccessPage";
import { PrivacyPolicyPage } from "../pages/PrivacyPolicyPage";
import { ProductDetailPage } from "../pages/ProductDetailPage";
import { ProductListPage } from "../pages/ProductListPage";
import { RegisterPage } from "../pages/RegisterPage";
import { TermsPage } from "../pages/TermsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "produkter", element: <ProductListPage /> },
      { path: "kategori/:slug", element: <CategoryPage /> },
      { path: "produkt/:slug", element: <ProductDetailPage /> },
      { path: "handlekurv", element: <CartPage /> },
      { path: "kasse", element: <CheckoutPage /> },
      { path: "betaling/suksess", element: <PaymentSuccessPage /> },
      { path: "betaling/feilet", element: <PaymentFailedPage /> },
      { path: "logg-inn", element: <LoginPage /> },
      { path: "registrer", element: <RegisterPage /> },
      { path: "personvern", element: <PrivacyPolicyPage /> },
      { path: "vilkar", element: <TermsPage /> },
      {
        path: "konto",
        element: (
          <ProtectedRoute>
            <AccountPage />
          </ProtectedRoute>
        )
      },
      {
        path: "bestillinger",
        element: (
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        )
      },
      {
        path: "admin",
        element: (
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        ),
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: "products", element: <AdminProductsPage /> },
          { path: "orders", element: <AdminOrdersPage /> },
          { path: "categories", element: <AdminCategoriesPage /> }
        ]
      },
      { path: "*", element: <NotFoundPage /> }
    ]
  }
]);
