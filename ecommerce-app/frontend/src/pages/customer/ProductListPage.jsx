import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as productApi from '../../api/productApi';
import * as categoryApi from '../../api/categoryApi';
import ProductGrid from '../../components/product/ProductGrid';
import CategoryFilterBar from '../../components/product/CategoryFilterBar';
import EmptyState from '../../components/ui/EmptyState';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const page = Number(searchParams.get('page')) || 1;

  const [searchInput, setSearchInput] = useState(search);
  const [categories, setCategories] = useState([]);
  const [result, setResult] = useState({ items: [], pagination: { page: 1, totalPages: 1 } });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    categoryApi.listCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    productApi
      .listProducts({ search: search || undefined, category: category || undefined, page, limit: 12 })
      .then((res) => {
        if (!cancelled) setResult(res);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [search, category, page]);

  function updateParams(next) {
    const params = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.delete('page'); // any filter change resets pagination
    setSearchParams(params);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    updateParams({ search: searchInput });
  }

  function goToPage(nextPage) {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(nextPage));
    setSearchParams(params);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-display text-2xl text-mist-100">Shop</h1>

      <form onSubmit={handleSearchSubmit} className="mt-6 flex max-w-md gap-2">
        <Input
          id="search"
          placeholder="Search products…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <div className="mt-6">
        <CategoryFilterBar
          categories={categories}
          activeSlug={category}
          onSelect={(slug) => updateParams({ category: slug })}
        />
      </div>

      <div className="mt-10">
        {isLoading ? (
          <p className="font-body text-sm text-mist-100/50">Loading…</p>
        ) : result.items.length === 0 ? (
          <EmptyState title="No products found" description="Try a different search or category." />
        ) : (
          <>
            <ProductGrid products={result.items} />
            {result.pagination.totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-4 font-mono text-sm text-mist-100/70">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => goToPage(page - 1)}
                  className="disabled:opacity-30"
                >
                  ← Prev
                </button>
                <span>
                  Page {result.pagination.page} of {result.pagination.totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= result.pagination.totalPages}
                  onClick={() => goToPage(page + 1)}
                  className="disabled:opacity-30"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ProductListPage;