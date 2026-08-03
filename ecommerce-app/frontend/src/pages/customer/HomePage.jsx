// import { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import * as productApi from '../../api/productApi';
// import * as categoryApi from '../../api/categoryApi';
// import ProductGrid from '../../components/product/ProductGrid';
// import Button from '../../components/ui/Button';

// function HomePage() {
//   const [featured, setFeatured] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     let cancelled = false;

//     async function load() {
//       try {
//         const [productsResult, categoriesResult] = await Promise.all([
//           productApi.listProducts({ limit: 4 }),
//           categoryApi.listCategories(),
//         ]);
//         if (!cancelled) {
//           setFeatured(productsResult.items);
//           setCategories(categoriesResult);
//         }
//       } finally {
//         if (!cancelled) setIsLoading(false);
//       }
//     }

//     load();
//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   return (
//     <div>
//       <section className="mx-auto max-w-6xl px-6 py-20">
//         <p className="font-mono text-5xl text-brass-400">42h</p>
//         <div className="mt-2 h-px w-16 bg-steel-500" />
//         <p className="mt-6 max-w-xl font-body text-lg text-mist-100/80">
//           average power reserve across our automatic collection. Every listing here ships with its
//           full spec sheet — no marketing gloss.
//         </p>
//         <Button to="/shop" className="mt-8">
//           Browse the collection →
//         </Button>
//       </section>

//       {categories.length > 0 && (
//         <section className="mx-auto max-w-6xl px-6 pb-16">
//           <p className="mb-4 font-mono text-xs uppercase tracking-wider text-steel-500">
//             Shop by category
//           </p>
//           <div className="flex flex-wrap gap-2">
//             {categories.map((cat) => (
//               <Link
//                 key={cat.slug}
//                 to={`/shop?category=${cat.slug}`}
//                 className="rounded-sm border border-steel-500/60 px-3 py-1.5 font-mono text-xs text-mist-100/80 transition-colors hover:border-brass-400/60 hover:text-brass-400"
//               >
//                 {cat.name}
//               </Link>
//             ))}
//           </div>
//         </section>
//       )}

//       <section className="mx-auto max-w-6xl px-6 pb-24">
//         <p className="mb-4 font-mono text-xs uppercase tracking-wider text-steel-500">
//           Recently added
//         </p>
//         {isLoading ? (
//           <p className="font-body text-sm text-mist-100/50">Loading…</p>
//         ) : (
//           <ProductGrid products={featured} />
//         )}
//       </section>
//     </div>
//   );
// }

// export default HomePage;

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as productApi from '../../api/productApi';
import * as categoryApi from '../../api/categoryApi';
import ProductGrid from '../../components/product/ProductGrid';
import Button from '../../components/ui/Button';
import * as contactApi from '../../api/contactApi';

function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [subError, setSubError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [productsResult, categoriesResult] = await Promise.all([
          productApi.listProducts({ limit: 4 }),
          categoryApi.listCategories(),
        ]);
        if (!cancelled) {
          setFeatured(Array.isArray(productsResult?.items) ? productsResult.items : []);
          setCategories(Array.isArray(categoriesResult) ? categoriesResult : []);
        }
      } catch (err) {
        console.error('HomePage failed to load products/categories:', err);
        if (!cancelled) {
          setError(
            err.response?.data?.error?.message ||
              'Could not load the storefront. Is the backend running and reachable?'
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="font-display text-6xl uppercase tracking-tight text-brass-400 md:text-7xl">
          TIMELESS
        </p>
        <div className="mt-2 h-px w-16 bg-steel-500" />
        <p className="mt-6 max-w-xl font-body text-lg text-mist-100/80">
          Discover premium wristwatches for men and women. From classic designs to modern smart
          styles, find the perfect timepiece that complements your personality and lifestyle.
        </p>
        <Button to="/shop" className="mt-8">
          Browse the collection →
        </Button>
      </section>

      {error && (
        <section className="mx-auto max-w-6xl px-6 pb-8">
          <p className="rounded-sm border border-tick-red/40 bg-tick-red/10 px-4 py-3 font-mono text-xs text-tick-red">
            {error}
          </p>
        </section>
      )}

      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-16">
          <p className="mb-4 font-mono text-xs uppercase tracking-wider text-steel-500">
            Shop by category
          </p>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/shop?category=${cat.slug}`}
                className="rounded-sm border border-steel-500/60 px-3 py-1.5 font-mono text-xs text-mist-100/80 transition-colors hover:border-brass-400/60 hover:text-brass-400"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <p className="mb-4 font-mono text-xs uppercase tracking-wider text-steel-500">
          Recently added
        </p>
        {isLoading ? (
          <p className="font-body text-sm text-mist-100/50">Loading…</p>
        ) : featured.length === 0 && !error ? (
          <p className="font-body text-sm text-mist-100/50">
            No products yet — run{' '}
            <code className="font-mono text-brass-400">npm run seed:products</code> in the backend
            to populate the catalog.
          </p>
        ) : (
          <ProductGrid products={featured} />
        )}
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-12">
        <div className="rounded-sm border border-steel-500/40 bg-steel-900/80 p-6">
          <p className="font-display text-sm uppercase tracking-wide text-mist-100">Subscribe to our emails</p>
          <form
            className="mt-6 max-w-3xl"
            onSubmit={async (e) => {
              e.preventDefault();
              setStatusMsg('');
              setSubError('');
              setSubmitting(true);
              try {
                await contactApi.subscribe({ email });
                setStatusMsg('Subscribed successfully.');
                setEmail('');
              } catch (err) {
                setSubError(err.response?.data?.error?.message || 'Failed to subscribe. Please try again.');
              } finally {
                setSubmitting(false);
              }
            }}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label htmlFor="home-subscribe-email" className="sr-only">
                Email
              </label>
              <div className="flex w-full items-center overflow-hidden rounded-md border border-steel-500/70 bg-ink-950 shadow-sm transition-colors focus-within:border-brass-400/70">
                <input
                  id="home-subscribe-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 border-none bg-transparent px-3 py-2.5 text-sm text-mist-100 placeholder:text-mist-100/40 focus:outline-none"
                  placeholder="Email"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-10 w-10 items-center justify-center bg-brass-400 text-ink-950 transition-colors hover:bg-brass-400/90 disabled:opacity-50"
                >
                  →
                </button>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              {statusMsg && <p className="font-mono text-xs text-emerald-400">{statusMsg}</p>}
              {subError && <p className="font-mono text-xs text-tick-red">{subError}</p>}
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

export default HomePage;