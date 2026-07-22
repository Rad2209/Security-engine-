import { useEffect, useState } from 'react';
import AdminNav from '../../components/layout/AdminNav';
import * as adminApi from '../../api/adminApi';
import EmptyState from '../../components/ui/EmptyState';

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    adminApi
      .listUsers()
      .then((data) => {
        if (!cancelled) setUsers(data);
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
        <h1 className="font-display text-2xl text-mist-100">Users</h1>

        {isLoading ? (
          <p className="mt-8 font-body text-sm text-mist-100/50">Loading…</p>
        ) : users.length === 0 ? (
          <EmptyState title="No users yet" />
        ) : (
          <div className="mt-8 overflow-x-auto rounded-sm border border-steel-500/40">
            <table className="w-full text-left font-body text-sm">
              <thead className="border-b border-steel-500/40 bg-steel-800 font-mono text-xs uppercase tracking-wide text-steel-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-steel-500/20 last:border-0">
                    <td className="px-4 py-3 text-mist-100">{user.name}</td>
                    <td className="px-4 py-3 text-mist-100/70">{user.email}</td>
                    <td className="px-4 py-3 font-mono text-xs text-steel-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
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

export default AdminUsersPage;