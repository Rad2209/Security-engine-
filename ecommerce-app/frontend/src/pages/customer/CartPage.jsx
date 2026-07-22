import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import * as orderApi from '../../api/orderApi';
import CartItemRow from '../../components/cart/CartItemRow';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import { formatCurrency } from '../../utils/formatCurrency';

function CartPage() {
  const { cart, isLoadingCart, updateItem, removeItem, refreshCart } = useCart();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const items = cart?.items?.filter((item) => item.productId) || [];
  const subtotal = items.reduce((sum, item) => sum + item.productId.price * item.quantity, 0);

  async function handleUpdateQuantity(productId, quantity) {
    setError('');
    try {
      await updateItem(productId, quantity);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not update quantity.');
    }
  }

  async function handleRemove(productId) {
    setError('');
    try {
      await removeItem(productId);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not remove item.');
    }
  }

  async function handleCheckout() {
    setError('');
    setIsCheckingOut(true);
    try {
      const order = await orderApi.checkout();
      // The cart is now empty server-side (checkout clears it) — refresh
      // local state to match rather than assuming.
      await refreshCart();
      navigate('/checkout/success', { state: { order } });
    } catch (err) {
      // Covers real business errors from orderService.checkout() — e.g.
      // "Cart is empty" or "Insufficient stock for X" — surfaced verbatim
      // since they're already user-appropriate messages, not internal detail.
      setError(err.response?.data?.error?.message || 'Checkout failed.');
    } finally {
      setIsCheckingOut(false);
    }
  }

  if (isLoadingCart) {
    return <p className="mx-auto max-w-3xl px-6 py-16 font-body text-sm text-mist-100/50">Loading…</p>;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Find something worth winding."
        action={<Button to="/shop">Browse the collection</Button>}
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-2xl text-mist-100">Cart</h1>

      <div className="mt-8">
        {items.map((item) => (
          <CartItemRow
            key={item.productId._id}
            item={item}
            onUpdateQuantity={handleUpdateQuantity}
            onRemove={handleRemove}
          />
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-steel-500/30 pt-6">
        <p className="font-body text-sm text-mist-100/70">Subtotal</p>
        <p className="font-mono text-xl text-brass-400">{formatCurrency(subtotal)}</p>
      </div>

      {error && <p className="mt-4 font-mono text-xs text-tick-red">{error}</p>}

      <Button onClick={handleCheckout} disabled={isCheckingOut} className="mt-6 w-full">
        {isCheckingOut ? 'Processing…' : 'Checkout (simulated)'}
      </Button>
      <p className="mt-3 text-center font-mono text-xs text-steel-500">
        This is a checkout simulation — no real payment is processed.
      </p>
    </div>
  );
}

export default CartPage;