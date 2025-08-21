import { useEffect, useState } from 'react';
import { apiGet } from '../api';
import { Alert, Box, Card, CardContent, FormControl, InputLabel, MenuItem, Select, Skeleton, Stack, TextField, Typography } from '@mui/material';

interface EventItem { id: number; name: string; trainNumber?: string; source?: string; destination?: string; seatPrice: number; }

export default function Fare() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventId, setEventId] = useState<number | ''>('' as any);
  const [passengers, setPassengers] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    apiGet<EventItem[]>('/api/events').then(setEvents).catch(() => {});
  }, []);

  useEffect(() => {
    if (!eventId) return;
    setLoading(true); setError(null);
    apiGet<any>(`/api/fare/enquiry?eventId=${eventId}&passengers=${passengers}`)
      .then(setResult)
      .catch(e => setError(e.message || 'Failed to fetch fare'))
      .finally(() => setLoading(false));
  }, [eventId, passengers]);

  return (
    <Box>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700}>Fare Enquiry</Typography>
        </CardContent>
      </Card>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2 }}>
        <FormControl fullWidth>
          <InputLabel id="fare-train">Select Train</InputLabel>
          <Select labelId="fare-train" label="Select Train" value={eventId} onChange={(e) => setEventId(e.target.value as any)}>
            {events.map(e => (
              <MenuItem key={e.id} value={e.id}>{e.trainNumber ? `${e.trainNumber} — ${e.name}` : e.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField type="number" label="Passengers" value={passengers} onChange={(e) => setPassengers(Math.max(1, parseInt(e.target.value || '1', 10)))} sx={{ minWidth: 160 }} />
      </Stack>
      {loading && <Skeleton variant="rounded" height={36} />}
      {error && <Alert severity="error">{error}</Alert>}
      {result && (
        <Card>
          <CardContent>
            <Typography fontWeight={600}>{result.trainNumber ? `${result.trainNumber} — ${result.trainName}` : result.trainName}</Typography>
            <Typography variant="body2" color="text.secondary">{result.source} → {result.destination}</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 1 }}>
              <TextField label="Base Fare" value={`₹${Number(result.baseFare).toFixed(2)}`} InputProps={{ readOnly: true }} />
              <TextField label="Tax" value={`₹${Number(result.tax).toFixed(2)}`} InputProps={{ readOnly: true }} />
              <TextField label="Total/Passenger" value={`₹${Number(result.totalPerPassenger).toFixed(2)}`} InputProps={{ readOnly: true }} />
              <TextField label="Passengers" value={String(result.passengers)} InputProps={{ readOnly: true }} />
              <TextField label="Grand Total" value={`₹${Number(result.grandTotal).toFixed(2)}`} InputProps={{ readOnly: true }} />
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

