import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

function LoginPage() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = location.state?.from?.pathname || '/';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await loginUser({ email, password });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      // Deliberately vague — same message the backend returns for both
      // "no such account" and "wrong password" (see authService.js), so
      // the frontend never re-introduces the user-enumeration leak the
      // backend was specifically designed to avoid.
      setError(err.response?.data?.error?.message || 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-20">
      <h1 className="font-display text-2xl text-mist-100">Log in</h1>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
        />
        {error && <p className="font-mono text-xs text-tick-red">{error}</p>}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </Button>
      </form>
      <p className="mt-6 font-body text-sm text-mist-100/60">
        No account?{' '}
        <Link to="/register" className="text-brass-400 hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}

export default LoginPage;