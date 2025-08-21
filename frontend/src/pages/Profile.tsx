import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut } from '../api';
import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';

export default function Profile() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    setLoading(true);
    apiGet<any>('/api/profile')
      .then(d => { setName(d.name); setEmail(d.email); setRole(d.role); })
      .catch(e => setError(e.message || 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  async function saveProfile() {
    setError(null); setOk(null);
    try {
      await apiPut('/api/profile', { name });
      setOk('Profile updated');
    } catch (e: any) {
      setError(e.message || 'Update failed');
    }
  }

  async function changePassword() {
    setError(null); setOk(null);
    try {
      await apiPost('/api/profile/password', { oldPassword, newPassword });
      setOk('Password changed'); setOldPassword(''); setNewPassword('');
    } catch (e: any) {
      setError(e.message || 'Password change failed');
    }
  }

  return (
    <Box>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700}>Profile</Typography>
        </CardContent>
      </Card>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {ok && <Alert severity="success" sx={{ mb: 2 }}>{ok}</Alert>}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack spacing={2}>
            <TextField label="Email" value={email} disabled fullWidth />
            <TextField label="Name" value={name} onChange={e => setName(e.target.value)} fullWidth />
            <TextField label="Role" value={role} disabled fullWidth />
            <Button variant="contained" onClick={saveProfile} disabled={loading}>Save</Button>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={700} gutterBottom>Change Password</Typography>
          <Stack spacing={2}>
            <TextField label="Old Password" type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
            <TextField label="New Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            <Button variant="contained" color="secondary" onClick={changePassword} disabled={loading}>Change Password</Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

