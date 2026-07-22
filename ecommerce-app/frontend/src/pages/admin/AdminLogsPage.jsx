import { useEffect, useState } from 'react';
import AdminNav from '../../components/layout/AdminNav';
import * as adminApi from '../../api/adminApi';
import EmptyState from '../../components/ui/EmptyState';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const TYPES = ['SQL_INJECTION', 'XSS', 'BRUTE_FORCE'];

const SEVERITY_COLOR = {
  high: 'text-tick-red',
  medium: 'text-brass-400',
  low: 'text-mist-100/60',
};

function AdminLogsPage() {
  const [filters, setFilters] = useState({ type: '', ip: '' });
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadLogs(activeFilters) {
    setIsLoading(true);
    setError('');
    try {
      const data = await adminApi.listLogs({
        type: activeFilters.type || undefined,
        ip: activeFilters.ip || undefined,
      });
      setLogs(data);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not load logs.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadLogs(filters);
    // Intentionally load-once on mount; subsequent loads are triggered
    // explicitly by the filter form's submit/clear handlers below, not by
    // watching `filters` reactively — avoids firing a request on every
    // keystroke in the IP input.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFilterSubmit(e) {
    e.preventDefault();
    loadLogs(filters);
  }

  function handleClear() {
    const cleared = { type: '', ip: '' };
    setFilters(cleared);
    loadLogs(cleared);
  }

  return (
    <>
      <AdminNav />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="font-display text-2xl text-mist-100">Attack logs</h1>

        <form onSubmit={handleFilterSubmit} className="mt-6 flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="type-filter" className="font-body text-sm text-mist-100/80">
              Type
            </label>
            <select
              id="type-filter"
              value={filters.type}
              onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
              className="mt-1.5 block rounded-sm border border-steel-500/60 bg-steel-800 px-3 py-2 font-mono text-sm text-mist-100"
            >
              <option value="">All types</option>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <Input
            id="ip-filter"
            label="IP address"
            placeholder="e.g. 192.168.1.1"
            value={filters.ip}
            onChange={(e) => setFilters((f) => ({ ...f, ip: e.target.value }))}
          />

          <Button type="submit" variant="secondary">
            Filter
          </Button>
          <Button type="button" variant="ghost" onClick={handleClear}>
            Clear
          </Button>
        </form>

        {error && <p className="mt-4 font-mono text-xs text-tick-red">{error}</p>}

        <div className="mt-8">
          {isLoading ? (
            <p className="font-body text-sm text-mist-100/50">Loading…</p>
          ) : logs.length === 0 ? (
            <EmptyState
              title="No attacks logged"
              description="Nothing matches these filters — or nothing has been blocked yet."
            />
          ) : (
            <div className="overflow-x-auto rounded-sm border border-steel-500/40">
              <table className="w-full text-left font-body text-sm">
                <thead className="border-b border-steel-500/40 bg-steel-800 font-mono text-xs uppercase tracking-wide text-steel-500">
                  <tr>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">IP</th>
                    <th className="px-4 py-3">Endpoint</th>
                    <th className="px-4 py-3">Severity</th>
                    <th className="px-4 py-3">Payload</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id} className="border-b border-steel-500/20 align-top last:border-0">
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-steel-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-brass-400">
                        {log.type.replace('_', ' ')}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-mist-100/80">{log.ip}</td>
                      <td className="px-4 py-3 font-mono text-xs text-mist-100/60">
                        {log.method} {log.endpoint}
                      </td>
                      <td
                        className={`px-4 py-3 font-mono text-xs uppercase ${
                          SEVERITY_COLOR[log.severity] || 'text-mist-100/60'
                        }`}
                      >
                        {log.severity}
                      </td>
                      <td
                        className="max-w-xs truncate px-4 py-3 font-mono text-xs text-mist-100/50"
                        title={log.payloadSnippet}
                      >
                        {log.payloadSnippet}
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

export default AdminLogsPage;