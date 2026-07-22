import { useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AppRoutes from './routes/AppRoutes';

/**
 * Layout
 *
 * Admin routes (/admin/*) intentionally render WITHOUT the customer
 * Header/Footer — the admin dashboard is a separate tool, not a page
 * within the storefront, and gets its own nav in the admin pages phase.
 */
function Layout() {
  const location = useLocation();
  const isAdminSection = location.pathname.startsWith('/admin');

  return (
    <div className="flex min-h-screen flex-col">
      {!isAdminSection && <Header />}
      <main className="flex-1">
        <AppRoutes />
      </main>
      {!isAdminSection && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Layout />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;