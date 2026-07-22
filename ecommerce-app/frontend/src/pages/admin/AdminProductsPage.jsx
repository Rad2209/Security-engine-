import { useEffect, useState } from 'react';
import AdminNav from '../../components/layout/AdminNav';
import * as adminApi from '../../api/adminApi';
import EmptyState from '../../components/ui/EmptyState';
import { formatCurrency } from '../../utils/formatCurrency';

function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    adminApi
      .listAllProducts()
      .then((data) => {
        if (!cancelled) setProducts(data);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <AdminNav />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl text-mist-100">Products</h1>
          {/* View-only by design — see Phase 6's decision: no admin
              create/edit/delete endpoint exists; product data is seeded. */}
          <p className="font-mono text-xs text-steel-500">
            View-only — product data is seeded, not managed here.
          </p>
        </div>

        {isLoading ? (
          <p className="mt-8 font-body text-sm text-mist-100/50">Loading…</p>
        ) : products.length === 0 ? (
          <EmptyState title="No products yet" />
        ) : (
          <div className="mt-8 overflow-x-auto rounded-sm border border-steel-500/40">
            <table className="w-full text-left font-body text-sm">
              <thead className="border-b border-steel-500/40 bg-steel-800 font-mono text-xs uppercase tracking-wide text-steel-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="border-b border-steel-500/20 last:border-0">
                    <td className="px-4 py-3 text-mist-100">{product.name}</td>
                    <td className="px-4 py-3 text-mist-100/70">{product.categoryId?.name || '—'}</td>
                    <td className="px-4 py-3 font-mono text-brass-400">{formatCurrency(product.price)}</td>
                    <td className="px-4 py-3 font-mono text-mist-100/70">{product.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export default AdminProductsPage;