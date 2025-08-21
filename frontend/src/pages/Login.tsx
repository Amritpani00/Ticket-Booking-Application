import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { apiPost } from '../api';
import { setToken } from '../auth';
import { Alert, Box, Button, Link, Stack, TextField, Typography, Paper } from '@mui/material';
import AnimatedTrain from '../components/AnimatedTrain';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const resp = await apiPost('/api/auth/login', { email, password }) as any;
      setToken(resp.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box display="flex" justifyContent="center" mt={4}>
      <Paper elevation={1} sx={{ p: 3, width: 440, maxWidth: '100%' }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>Login</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>Welcome back! Please sign in to continue.</Typography>
        <AnimatedTrain />
        <Box component="form" onSubmit={onSubmit}>
          <Stack spacing={2}>
            <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth required />
            <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth required />
            {error && <Alert severity="error">{error}</Alert>}
            <Button disabled={loading} type="submit" variant="contained">{loading ? 'Logging in…' : 'Login'}</Button>
          </Stack>
        </Box>
        <Typography variant="body2" mt={2}>No account? <Link component={RouterLink} to="/register">Register</Link></Typography>
      </Paper>
    </Box>
  );
}

