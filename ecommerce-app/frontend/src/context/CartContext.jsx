import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as cartApi from '../api/cartApi';
import { useAuth } from './AuthContext';

const CartContext = createContext(undefined);

/**
 * CartContext
 *
 * Depends on AuthContext (must be rendered inside AuthProvider in the
 * component tree) since every cart endpoint requires a logged-in customer.
 * Cart state is fetched once the session check resolves and the user is
 * confirmed logged in; it's cleared immediately on logout — never left
 * stale or visible after a session ends.
 */
export function CartProvider({ children }) {
  const { user, isLoadingUser } = useAuth();
  const [cart, setCart] = useState(null);
  const [isLoadingCart, setIsLoadingCart] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    setIsLoadingCart(true);
    try {
      const freshCart = await cartApi.getCart();
      setCart(freshCart);
    } finally {
      setIsLoadingCart(false);
    }
  }, [user]);

  useEffect(() => {
    if (isLoadingUser) return; // wait for AuthContext's initial session check
    if (user) {
      refreshCart();
    } else {
      setCart(null); // logged out (or never logged in) — nothing to show
    }
    // refreshCart is stable via useCallback and depends on `user` itself,
    // so omitting it here avoids a redundant extra effect run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoadingUser]);

  const addItem = useCallback(async (productId, quantity) => {
    const updated = await cartApi.addCartItem({ productId, quantity });
    setCart(updated);
    return updated;
  }, []);

  const updateItem = useCallback(async (productId, quantity) => {
    const updated = await cartApi.updateCartItem(productId, quantity);
    setCart(updated);
    return updated;
  }, []);

  const removeItem = useCallback(async (productId) => {
    const updated = await cartApi.removeCartItem(productId);
    setCart(updated);
    return updated;
  }, []);

  const clear = useCallback(async () => {
    const updated = await cartApi.clearCart();
    setCart(updated);
    return updated;
  }, []);

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const value = {
    cart,
    isLoadingCart,
    itemCount,
    addItem,
    updateItem,
    removeItem,
    clear,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}