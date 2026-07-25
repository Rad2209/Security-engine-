import { useEffect, useState } from 'react';
import AdminNav from '../../components/layout/AdminNav';
import * as adminApi from '../../api/adminApi';
import EmptyState from '../../components/ui/EmptyState';

function AdminBlockedAccountsPage() {
  const [blockedAccounts, setBlockedAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadBlockedAccounts() {
    setIsLoading(true);
    setError('');
    try {
      const data = await adminApi.listBlockedAccounts();
      setBlockedAccounts(data);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not load blocked accounts.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadBlockedAccounts();
  }, []);

  return (
    <>
      <AdminNav />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="font-display text-2xl text-mist-100">Blocked accounts</h1>

        {error && <p className="mt-4 font-mono text-xs text-tick-red">{error}</p>}

        <div className="mt-8">
          {isLoading ? (
            <p className="font-body text-sm text-mist-100/50">Loading…</p>
          ) : blockedAccounts.length === 0 ? (
            <EmptyState
              title="No accounts currently blocked"
              description="The brute-force detector hasn't blocked any accounts recently."
            />
          ) : (
            <div className="overflow-x-auto rounded-sm border border-steel-500/40">
              <table className="w-full text-left font-body text-sm">
                <thead className="border-b border-steel-500/40 bg-steel-800 font-mono text-xs uppercase tracking-wide text-steel-500">
                  <tr>
                    <th className="px-4 py-3">Identifier</th>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3">Blocked at</th>
                    <th className="px-4 py-3">Expires</th>
                  </tr>
                </thead>
                <tbody>
                  {blockedAccounts.map((entry) => (
                    <tr key={entry.identifier} className="border-b border-steel-500/20 last:border-0">
                      <td className="px-4 py-3 font-mono text-sm text-mist-100">{entry.identifier}</td>
                      <td className="px-4 py-3 font-body text-sm text-mist-100/70">{entry.reason}</td>
                      <td className="px-4 py-3 font-mono text-xs text-steel-500">
                        {new Date(entry.blockedAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-steel-500">
                        {new Date(entry.expiresAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default AdminBlockedAccountsPage;
