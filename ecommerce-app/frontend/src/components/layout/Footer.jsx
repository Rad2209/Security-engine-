import { useState } from 'react';
import * as contactApi from '../../api/contactApi';

function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubscribe(e) {
    e.preventDefault();
    setStatus('');
    setError('');
    setSubmitting(true);

    try {
      await contactApi.subscribe({ email });
      setStatus('Subscribed successfully.');
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to subscribe. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <footer className="border-t border-steel-500/40 bg-ink-950">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <p className="font-display text-base tracking-wide text-mist-100">ESCAPEMENT</p>
            <p className="mt-2 max-w-md font-body text-sm text-mist-100/60">
              Mechanical watches and the accessories that go with them. Every listing ships with its
              full spec sheet — no marketing gloss.
            </p>
          </div>

          <div className="rounded-sm border border-steel-500/40 bg-steel-900/80 p-6">
            <p className="font-display text-sm uppercase tracking-wide text-mist-100">Subscribe</p>
            <p className="mt-3 font-body text-sm text-mist-100/70">
              Join the list for product drops, news, and support updates.
            </p>
            <form className="mt-6 space-y-3" onSubmit={handleSubscribe}>
              <label htmlFor="footer-subscribe-email" className="font-body text-sm text-mist-100/80">
                Email
              </label>
              <input
                id="footer-subscribe-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-sm border border-steel-500/60 bg-steel-800 px-3 py-2 font-body text-sm text-mist-100 placeholder:text-mist-100/30 focus:border-brass-400"
                placeholder="you@example.com"
              />
              {status && <p className="font-mono text-xs text-emerald-400">{status}</p>}
              {error && <p className="font-mono text-xs text-tick-red">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center rounded-sm bg-brass-400 px-4 py-2 text-sm font-medium text-ink-950 transition-colors hover:bg-brass-400/90 disabled:opacity-50"
              >
                {submitting ? 'Subscribing…' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>

        <p className="mt-8 font-mono text-xs text-steel-500">
          © {new Date().getFullYear()} Escapement. Demo storefront for a Security Engine research project.
        </p>
      </div>
    </footer>
  );
}

export default Footer;