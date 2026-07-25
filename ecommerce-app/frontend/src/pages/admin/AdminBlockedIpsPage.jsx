// import { useEffect, useState } from 'react';
// import AdminNav from '../../components/layout/AdminNav';
// import * as adminApi from '../../api/adminApi';
// import EmptyState from '../../components/ui/EmptyState';
// import Button from '../../components/ui/Button';

// function AdminBlockedIpsPage() {
//   const [blockedIps, setBlockedIps] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [unblockingIp, setUnblockingIp] = useState('');

//   async function loadBlockedIps() {
//     setIsLoading(true);
//     setError('');
//     try {
//       const data = await adminApi.listBlockedIps();
//       setBlockedIps(data);
//     } catch (err) {
//       setError(err.response?.data?.error?.message || 'Could not load blocked IPs.');
//     } finally {
//       setIsLoading(false);
//     }
//   }

//   useEffect(() => {
//     loadBlockedIps();
//   }, []);

//   async function handleUnblock(ip) {
//     setError('');
//     setUnblockingIp(ip);
//     try {
//       await adminApi.unblockIp(ip);
//       // Re-fetch rather than optimistically removing the row locally — the
//       // list is small and this guarantees the UI reflects exactly what the
//       // engine's storageAdapter now reports, not an assumption about the
//       // unblock succeeding in the shape we expect.
//       await loadBlockedIps();
//     } catch (err) {
//       setError(err.response?.data?.error?.message || 'Could not unblock IP.');
//     } finally {
//       setUnblockingIp('');
//     }
//   }

//   return (
//     <>
//       <AdminNav />
//       <div className="mx-auto max-w-6xl px-6 py-10">
//         <h1 className="font-display text-2xl text-mist-100">Blocked IPs</h1>

//         {error && <p className="mt-4 font-mono text-xs text-tick-red">{error}</p>}

//         <div className="mt-8">
//           {isLoading ? (
//             <p className="font-body text-sm text-mist-100/50">Loading…</p>
//           ) : blockedIps.length === 0 ? (
//             <EmptyState
//               title="No IPs currently blocked"
//               description="The brute-force detector hasn't blocked anyone recently."
//             />
//           ) : (
//             <div className="overflow-x-auto rounded-sm border border-steel-500/40">
//               <table className="w-full text-left font-body text-sm">
//                 <thead className="border-b border-steel-500/40 bg-steel-800 font-mono text-xs uppercase tracking-wide text-steel-500">
//                   <tr>
//                     <th className="px-4 py-3">IP</th>
//                     <th className="px-4 py-3">Reason</th>
//                     <th className="px-4 py-3">Blocked at</th>
//                     <th className="px-4 py-3">Expires</th>
//                     <th className="px-4 py-3" />
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {blockedIps.map((entry) => (
//                     <tr key={entry.ip} className="border-b border-steel-500/20 last:border-0">
//                       <td className="px-4 py-3 font-mono text-sm text-mist-100">{entry.ip}</td>
//                       <td className="px-4 py-3 font-body text-sm text-mist-100/70">{entry.reason}</td>
//                       <td className="px-4 py-3 font-mono text-xs text-steel-500">
//                         {new Date(entry.blockedAt).toLocaleString()}
//                       </td>
//                       <td className="px-4 py-3 font-mono text-xs text-steel-500">
//                         {new Date(entry.expiresAt).toLocaleString()}
//                       </td>
//                       <td className="px-4 py-3">
//                         <Button
//                           variant="secondary"
//                           onClick={() => handleUnblock(entry.ip)}
//                           disabled={unblockingIp === entry.ip}
//                         >
//                           {unblockingIp === entry.ip ? 'Unblocking…' : 'Unblock'}
//                         </Button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// }

// export default AdminBlockedIpsPage;
import { useEffect, useState } from 'react';
import AdminNav from '../../components/layout/AdminNav';
import * as adminApi from '../../api/adminApi';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';

/**
 * Shared table for both sections below — IP rows and account rows have the
 * same shape (identifier column, reason, blockedAt, expiresAt, unblock
 * button), just a different key field (`ip` vs `identifier`).
 */
function BlockedTable({ entries, idField, idLabel, unblockingId, onUnblock }) {
  return (
    <div className="overflow-x-auto rounded-sm border border-steel-500/40">
      <table className="w-full text-left font-body text-sm">
        <thead className="border-b border-steel-500/40 bg-steel-800 font-mono text-xs uppercase tracking-wide text-steel-500">
          <tr>
            <th className="px-4 py-3">{idLabel}</th>
            <th className="px-4 py-3">Reason</th>
            <th className="px-4 py-3">Blocked at</th>
            <th className="px-4 py-3">Expires</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const id = entry[idField];
            return (
              <tr key={id} className="border-b border-steel-500/20 last:border-0">
                <td className="px-4 py-3 font-mono text-sm text-mist-100">{id}</td>
                <td className="px-4 py-3 font-body text-sm text-mist-100/70">{entry.reason}</td>
                <td className="px-4 py-3 font-mono text-xs text-steel-500">
                  {new Date(entry.blockedAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-steel-500">
                  {new Date(entry.expiresAt).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <Button
                    variant="secondary"
                    onClick={() => onUnblock(id)}
                    disabled={unblockingId === id}
                  >
                    {unblockingId === id ? 'Unblocking…' : 'Unblock'}
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function AdminBlockedIpsPage() {
  const [blockedIps, setBlockedIps] = useState([]);
  const [blockedAccounts, setBlockedAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [unblockingId, setUnblockingId] = useState('');

  async function loadAll() {
    setIsLoading(true);
    setError('');
    try {
      const [ips, accounts] = await Promise.all([
        adminApi.listBlockedIps(),
        adminApi.listBlockedAccounts(),
      ]);
      setBlockedIps(Array.isArray(ips) ? ips : []);
      setBlockedAccounts(Array.isArray(accounts) ? accounts : []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not load blocked IPs/accounts.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleUnblockIp(ip) {
    setError('');
    setUnblockingId(ip);
    try {
      await adminApi.unblockIp(ip);
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not unblock IP.');
    } finally {
      setUnblockingId('');
    }
  }

  async function handleUnblockAccount(identifier) {
    setError('');
    setUnblockingId(identifier);
    try {
      await adminApi.unblockAccount(identifier);
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not unblock account.');
    } finally {
      setUnblockingId('');
    }
  }

  return (
    <>
      <AdminNav />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="font-display text-2xl text-mist-100">Blocked IPs &amp; Accounts</h1>
        <p className="mt-2 max-w-2xl font-body text-sm text-mist-100/60">
          The brute-force detector tracks two independent thresholds: 10 failures from the same
          IP, or 5 failures on the same account, within 15 minutes — whichever trips first.
          SQL injection and XSS attempts are blocked per-request (see Attack Logs) but never
          create a lasting entry here, since there's nothing to "ban" for a one-off blocked
          request.
        </p>

        {error && <p className="mt-4 font-mono text-xs text-tick-red">{error}</p>}

        {isLoading ? (
          <p className="mt-8 font-body text-sm text-mist-100/50">Loading…</p>
        ) : (
          <>
            <section className="mt-10">
              <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-steel-500">
                Blocked IPs
              </h2>
              {blockedIps.length === 0 ? (
                <EmptyState
                  title="No IPs currently blocked"
                  description="No IP has hit the 10-failure threshold recently."
                />
              ) : (
                <BlockedTable
                  entries={blockedIps}
                  idField="ip"
                  idLabel="IP"
                  unblockingId={unblockingId}
                  onUnblock={handleUnblockIp}
                />
              )}
            </section>

            <section className="mt-12">
              <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-steel-500">
                Blocked accounts
              </h2>
              {blockedAccounts.length === 0 ? (
                <EmptyState
                  title="No accounts currently blocked"
                  description="No account has hit the 5-failure threshold recently."
                />
              ) : (
                <BlockedTable
                  entries={blockedAccounts}
                  idField="identifier"
                  idLabel="Account"
                  unblockingId={unblockingId}
                  onUnblock={handleUnblockAccount}
                />
              )}
            </section>
          </>
        )}
      </div>
    </>
  );
}

export default AdminBlockedIpsPage;