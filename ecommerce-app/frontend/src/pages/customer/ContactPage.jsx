import { useState } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
// contact page: no newsletter here (newsletter shown only on homepage)

function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

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

  

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="flex justify-center">
        <section className="w-full max-w-2xl rounded-sm border border-steel-500/40 bg-steel-900/80 p-8">
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

      </div>
    </div>
  );
}

export default ContactPage;
