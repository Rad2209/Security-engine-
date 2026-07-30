import { useState } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import * as contactApi from '../../api/contactApi';

function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [subEmail, setSubEmail] = useState('');
  const [subStatus, setSubStatus] = useState('');
  const [subError, setSubError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('');
    setError('');

    try {
      await contactApi.submitContact({ name, email, message });
      setStatus('Your message has been sent. We will respond shortly.');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to send message. Please try again.');
    }
  }

  async function handleSubscribe(e) {
    e.preventDefault();
    setSubStatus('');
    setSubError('');

    try {
      await contactApi.subscribe({ email: subEmail });
      setSubStatus('Subscribed successfully.');
      setSubEmail('');
    } catch (err) {
      setSubError(err.response?.data?.error?.message || 'Failed to subscribe. Please try again.');
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-sm border border-steel-500/40 bg-steel-900/80 p-8">
          <h1 className="font-display text-3xl text-mist-100">Contact Us</h1>
          <p className="mt-4 max-w-xl font-body text-sm text-mist-100/70">
            Have a question about the collection, a special order, or the care guide? Send us a note.
          </p>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <Input id="contact-name" label="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input id="contact-email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="contact-message" className="font-body text-sm text-mist-100/80">
                Message
              </label>
              <textarea
                id="contact-message"
                rows="5"
                className="rounded-sm border border-steel-500/60 bg-steel-800 px-3 py-2 font-body text-sm text-mist-100 placeholder:text-mist-100/30 focus:border-brass-400"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            {status && <p className="font-mono text-sm text-emerald-400">{status}</p>}
            {error && <p className="font-mono text-sm text-tick-red">{error}</p>}

            <Button type="submit">Send message</Button>
          </form>
        </section>

        {/* <section className="rounded-sm border border-steel-500/40 bg-steel-900/80 p-8">
          <h2 className="font-display text-2xl text-mist-100">Subscribe</h2>
          <p className="mt-4 font-body text-sm text-mist-100/70">
            Get product drops and special news from Escapement. No spam, just curated updates.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubscribe}>
            <Input
              id="subscribe-email"
              label="Email"
              type="email"
              value={subEmail}
              onChange={(e) => setSubEmail(e.target.value)}
            />
            {subStatus && <p className="font-mono text-sm text-emerald-400">{subStatus}</p>}
            {subError && <p className="font-mono text-sm text-tick-red">{subError}</p>}
            <Button type="submit">Subscribe</Button>
          </form>
        </section> */}
      </div>
    </div>
  );
}

export default ContactPage;
