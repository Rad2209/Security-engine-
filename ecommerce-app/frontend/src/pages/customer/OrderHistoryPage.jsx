import { useEffect, useState } from 'react';
import * as orderApi from '../../api/orderApi';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import { formatCurrency } from '../../utils/formatCurrency';

function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    orderApi
      .listOrders()
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return <p className="mx-auto max-w-3xl px-6 py-16 font-body text-sm text-mist-100/50">Loading…</p>;
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        title="No orders yet"
        description="Your past orders will show up here."
        action={<Button to="/shop">Browse the collection</Button>}
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-2xl text-mist-100">Order history</h1>

      <div className="mt-8 space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="rounded-sm border border-steel-500/40 bg-steel-800 p-5">
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs text-steel-500">
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
              {/* status is currently always "simulated_paid" — the enum is
                  deliberately narrow, since checkout is a simulation
                  (see Order.js's schema comment). Rendered generically
                  rather than hardcoded, so it stays correct if the enum
                  ever grows. */}
              <span className="rounded-sm border border-brass-400/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-brass-400">
                {order.status.replace('_', ' ')}
              </span>
            </div>
            <p className="mt-2 font-body text-sm text-mist-100/70">
              {order.items.length} item{order.items.length > 1 ? 's' : ''}
            </p>
            <p className="mt-2 font-mono text-lg text-brass-400">{formatCurrency(order.totalAmount)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrderHistoryPage;