import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiPost } from '../api';
import { setToken } from '../auth';

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const resp = await apiPost('/api/auth/register', { name, email, password }) as any;
      setToken(resp.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 440 }}>
      <h1>Register</h1>
      <form onSubmit={onSubmit} className="booking-form">
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <div className="error">{error}</div>}
        <button disabled={loading} type="submit">{loading ? 'Registering…' : 'Create account'}</button>
      </form>
      <p style={{ marginTop: 12 }}>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}

