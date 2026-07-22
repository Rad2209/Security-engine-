import { useEffect, useState } from 'react';
import AdminNav from '../../components/layout/AdminNav';
import * as adminApi from '../../api/adminApi';
import Button from '../../components/ui/Button';

function StatCard({ label, value }) {
  return (
    <div className="rounded-sm border border-steel-500/40 bg-steel-800 p-6">
      <p className="font-mono text-xs uppercase tracking-wider text-steel-500">{label}</p>
      <p className="mt-2 font-mono text-3xl text-brass-400">{value}</p>
    </div>
  );
}

function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    adminApi
      .getStats()
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.error?.message || 'Could not load stats.');
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
        <h1 className="font-display text-2xl text-mist-100">Security overview</h1>

        {isLoading ? (
          <p className="mt-8 font-body text-sm text-mist-100/50">Loading…</p>
        ) : error ? (
          <p className="mt-8 font-mono text-xs text-tick-red">{error}</p>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
              <StatCard label="Total attacks blocked" value={stats.totalAttacks} />
              <StatCard label="SQL injection" value={stats.byType.SQL_INJECTION} />
              <StatCard label="XSS" value={stats.byType.XSS} />
              <StatCard label="Brute force" value={stats.byType.BRUTE_FORCE} />
              <StatCard label="Active blocked IPs" value={stats.activeBlockedIps} />
              <StatCard label="Active blocked accounts" value={stats.activeBlockedAccounts} />
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <Button to="/admin/logs" variant="secondary">
                View attack logs
              </Button>
              <Button to="/admin/blocked-ips" variant="secondary">
                Manage blocked IPs
              </Button>
              <Button to="/admin/users" variant="secondary">
                View users
              </Button>
              <Button to="/admin/products" variant="secondary">
                View products
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default AdminDashboardPage;