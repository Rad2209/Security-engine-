import { Routes, Route, Link } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

import HomePage from '../pages/customer/HomePage';
import ProductListPage from '../pages/customer/ProductListPage';
import ProductDetailPage from '../pages/customer/ProductDetailPage';
import CartPage from '../pages/customer/CartPage';
import CheckoutSuccessPage from '../pages/customer/CheckoutSuccessPage';
import OrderHistoryPage from '../pages/customer/OrderHistoryPage';
import LoginPage from '../pages/customer/LoginPage';
import RegisterPage from '../pages/customer/RegisterPage';

import AdminLoginPage from '../pages/admin/AdminLoginPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminProductsPage from '../pages/admin/AdminProductsPage';
import AdminLogsPage from '../pages/admin/AdminLogsPage';
import AdminBlockedIpsPage from '../pages/admin/AdminBlockedIpsPage';

function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-24 text-center">
      <p className="font-mono text-sm text-brass-400">404</p>
      <h1 className="mt-2 font-display text-2xl text-mist-100">Page not found</h1>
      <Link to="/" className="mt-6 inline-block text-sm text-mist-100/70 hover:text-mist-100">
        Back to Escapement →
      </Link>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Customer — public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/shop" element={<ProductListPage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Customer — protected (requires the "token" cookie / logged-in customer) */}
      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout/success"
        element={
          <ProtectedRoute>
            <CheckoutSuccessPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <OrderHistoryPage />
          </ProtectedRoute>
        }
      />

      {/* Admin — public */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Admin — protected (requires the "adminToken" cookie / verified admin session) */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <AdminUsersPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <AdminRoute>
            <AdminProductsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/logs"
        element={
          <AdminRoute>
            <AdminLogsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/blocked-ips"
        element={
          <AdminRoute>
            <AdminBlockedIpsPage />
          </AdminRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;