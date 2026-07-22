import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LINKS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/logs', label: 'Attack Logs' },
  { to: '/admin/blocked-ips', label: 'Blocked IPs' },
];

/**
 * AdminNav
 *
 * Shared across all 5 protected admin pages (not the login page). Admin
 * routes deliberately render without the customer Header/Footer (App.jsx),
 * since the admin dashboard is a separate tool, not a storefront page.
 */
function AdminNav() {
  const { admin, logoutAdmin } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logoutAdmin();
    navigate('/admin/login');
  }

  return (
    <header className="border-b border-steel-500/40 bg-ink-950">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <span className="font-display text-sm font-semibold tracking-wide text-mist-100">
            ESCAPEMENT <span className="text-brass-400">/ admin</span>
          </span>
          <nav className="hidden items-center gap-5 font-mono text-xs uppercase tracking-wide text-mist-100/60 md:flex">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `transition-colors hover:text-mist-100 ${isActive ? 'text-brass-400' : ''}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {admin?.name && <span className="font-mono text-xs text-mist-100/50">{admin.name}</span>}
          <button
            type="button"
            onClick={handleLogout}
            className="font-mono text-xs text-mist-100/60 transition-colors hover:text-mist-100"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}

export default AdminNav;