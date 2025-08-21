import { useEffect, useState } from 'react';
import { apiDelete, apiGet, apiPost, apiPut } from '../api';
import { Alert, Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';

interface Train {
  id?: number;
  name: string;
  trainNumber?: string;
  source?: string;
  destination?: string;
  venue: string;
  description?: string;
  startTime: string;
  endTime: string;
  seatPrice: number;
  classType?: string;
}

export default function Admin() {
  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Train | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    apiGet<Train[]>('/api/admin/trains')
      .then(setTrains)
      .catch(e => setError(e.message || 'Failed to load trains'))
      .finally(() => setLoading(false));
  }, []);

  function startAdd() {
    setEditing({ name: '', venue: '', startTime: new Date().toISOString(), endTime: new Date().toISOString(), seatPrice: 0 });
    setOpen(true);
  }
  function startEdit(t: Train) { setEditing({ ...t }); setOpen(true); }
  function close() { setOpen(false); setEditing(null); }

  async function save() {
    if (!editing) return;
    try {
      if (editing.id) {
        const saved = await apiPut<Train, Train>(`/api/admin/trains/${editing.id}`, editing);
        setTrains(prev => prev.map(t => t.id === saved.id ? saved : t));
      } else {
        const saved = await apiPost<Train, Train>('/api/admin/trains', editing);
        setTrains(prev => [saved, ...prev]);
      }
      close();
    } catch (e: any) {
      setError(e.message || 'Save failed');
    }
  }

  async function remove(id: number) {
    if (!confirm('Delete this train?')) return;
    await apiDelete(`/api/admin/trains/${id}`);
    setTrains(prev => prev.filter(t => t.id !== id));
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>Admin - Trains</Typography>
        <Button variant="contained" onClick={startAdd}>Add Train</Button>
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? <Typography>Loading…</Typography> : (
        <Stack gap={1}>
          {trains.map(t => (
            <Card key={t.id}>
              <CardContent>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                  <Stack>
                    <Typography fontWeight={700}>{t.trainNumber ? `${t.trainNumber} — ${t.name}` : t.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{t.source} → {t.destination} • ₹{t.seatPrice.toFixed(2)}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" onClick={() => startEdit(t)}>Edit</Button>
                    <Button size="small" color="error" onClick={() => t.id && remove(t.id)}>Delete</Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <Dialog open={open} onClose={close} fullWidth maxWidth="md">
        <DialogTitle>{editing?.id ? 'Edit Train' : 'Add Train'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" value={editing?.name || ''} onChange={e => setEditing(s => ({ ...(s as Train), name: e.target.value }))} fullWidth />
            <TextField label="Train Number" value={editing?.trainNumber || ''} onChange={e => setEditing(s => ({ ...(s as Train), trainNumber: e.target.value }))} fullWidth />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <TextField label="Source" value={editing?.source || ''} onChange={e => setEditing(s => ({ ...(s as Train), source: e.target.value }))} fullWidth />
              <TextField label="Destination" value={editing?.destination || ''} onChange={e => setEditing(s => ({ ...(s as Train), destination: e.target.value }))} fullWidth />
              <TextField label="Venue" value={editing?.venue || ''} onChange={e => setEditing(s => ({ ...(s as Train), venue: e.target.value }))} fullWidth />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <TextField label="Start Time" type="datetime-local" value={editing?.startTime?.slice(0,16) || ''} onChange={e => setEditing(s => ({ ...(s as Train), startTime: new Date(e.target.value).toISOString() }))} fullWidth />
              <TextField label="End Time" type="datetime-local" value={editing?.endTime?.slice(0,16) || ''} onChange={e => setEditing(s => ({ ...(s as Train), endTime: new Date(e.target.value).toISOString() }))} fullWidth />
              <TextField label="Seat Price (₹)" type="number" value={editing?.seatPrice ?? 0} onChange={e => setEditing(s => ({ ...(s as Train), seatPrice: parseFloat(e.target.value || '0') }))} fullWidth />
            </Stack>
            <TextField label="Class Type (e.g. 3A, SL)" value={editing?.classType || ''} onChange={e => setEditing(s => ({ ...(s as Train), classType: e.target.value }))} fullWidth />
            <TextField label="Description" value={editing?.description || ''} onChange={e => setEditing(s => ({ ...(s as Train), description: e.target.value }))} fullWidth multiline minRows={2} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>Cancel</Button>
          <Button variant="contained" onClick={save}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

