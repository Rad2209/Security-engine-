import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

/**
 * Header
 *
 * Hairline bottom border, zero shadow — matches the design brief's "no
 * dramatic product lighting, no jewelry-brand gloss" thesis.
 *
 * The brass tick mark next to the wordmark is the site's single deliberate
 * moment of motion (design brief: "a watch ticks, and nowhere else does
 * anything move"). It animates once on mount via the tick-once keyframe
 * (defined in index.css) and respects prefers-reduced-motion via Tailwind's
 * motion-safe: variant, backed by the global reduced-motion override in
 * index.css.
 */
function Header() {
  const { user, logoutUser } = useAuth();
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-steel-500/40 bg-ink-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block h-3 w-0.5 origin-bottom bg-brass-400 motion-safe:animate-[tick-once_0.6s_ease-out]"
          />
          <span className="font-display text-lg font-semibold tracking-wide text-mist-100">
            ESCAPEMENT
          </span>
        </Link>

        <nav className="hidden items-center gap-6 font-body text-sm text-mist-100/80 md:flex">
          <NavLink
            to="/shop"
            className={({ isActive }) =>
              `transition-colors hover:text-mist-100 ${isActive ? 'text-brass-400' : ''}`
            }
          >
            Shop
          </NavLink>
          {user && (
            <NavLink
              to="/orders"
              className={({ isActive }) =>
                `transition-colors hover:text-mist-100 ${isActive ? 'text-brass-400' : ''}`
              }
            >
              Orders
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-5">
          <Link to="/cart" className="relative font-mono text-sm text-mist-100/90 hover:text-mist-100">
            Cart
            {itemCount > 0 && (
              <span className="ml-1 rounded-full bg-brass-400 px-1.5 py-0.5 text-[10px] font-semibold text-ink-950">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <button
              type="button"
              onClick={logoutUser}
              className="font-body text-sm text-mist-100/80 transition-colors hover:text-mist-100"
            >
              Log out
            </button>
          ) : (
            <Link to="/login" className="font-body text-sm text-mist-100/80 transition-colors hover:text-mist-100">
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;