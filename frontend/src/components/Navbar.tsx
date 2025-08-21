import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { getRole, getToken } from '../auth';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

export default function Navbar() {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(() => getToken());
  const role = getRole();

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === 'token') setToken(getToken());
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <AppBar position="sticky" elevation={1} color="default">
      <Toolbar sx={{ display: 'flex', gap: 2 }}>
        <Typography variant="h6" component={RouterLink} to="/" sx={{ textDecoration: 'none', color: 'inherit', flexGrow: 1 }}>
          IRCTC Booking
        </Typography>
        <Button color="inherit" component={RouterLink} to="/">Home</Button>
        {token ? (
          <>
            <Button color="inherit" onClick={() => navigate('/dashboard')}>Dashboard</Button>
            <Button color="inherit" component={RouterLink} to="/history">History</Button>
            <Button color="inherit" component={RouterLink} to="/fare">Fare</Button>
            <Button color="inherit" component={RouterLink} to="/profile">Profile</Button>
            {role === 'ADMIN' && <Button color="inherit" component={RouterLink} to="/admin">Admin</Button>}
            <Button color="inherit" component={RouterLink} to="/logout">Logout</Button>
          </>
        ) : (
          <>
            <Button color="inherit" component={RouterLink} to="/login">Login</Button>
            <Button color="primary" variant="contained" component={RouterLink} to="/register">Register</Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

