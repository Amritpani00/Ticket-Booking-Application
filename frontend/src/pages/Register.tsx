import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { apiPost } from '../api';
import { setToken } from '../auth';
import { Alert, Box, Button, Link, Stack, TextField, Typography, Paper } from '@mui/material';
import AnimatedTrain from '../components/AnimatedTrain';

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
    <Box display="flex" justifyContent="center" mt={4}>
      <Paper elevation={1} sx={{ p: 3, width: 440, maxWidth: '100%' }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>Register</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>Create your account to book and manage tickets.</Typography>
        <AnimatedTrain />
        <Box component="form" onSubmit={onSubmit}>
          <Stack spacing={2}>
            <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth required />
            <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth required />
            <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth required />
            {error && <Alert severity="error">{error}</Alert>}
            <Button disabled={loading} type="submit" variant="contained">{loading ? 'Registering…' : 'Create account'}</Button>
          </Stack>
        </Box>
        <Typography variant="body2" mt={2}>Already have an account? <Link component={RouterLink} to="/login">Login</Link></Typography>
      </Paper>
    </Box>
  );
}

