import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

function RegisterPage() {
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      // registerUser() deliberately does NOT log the user in automatically
      // (see AuthContext.jsx's comment) — register and login are separate
      // backend calls, so we redirect to /login rather than assuming a
      // session exists after registering.
      await registerUser({ name, email, password });
      navigate('/login', { state: { justRegistered: true } });
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-20">
      <h1 className="font-display text-2xl text-mist-100">Create an account</h1>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <Input id="name" label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input
          id="email"
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          id="password"
          type="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
        {error && <p className="font-mono text-xs text-tick-red">{error}</p>}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
      <p className="mt-6 font-body text-sm text-mist-100/60">
        Already have an account?{' '}
        <Link to="/login" className="text-brass-400 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

export default RegisterPage;