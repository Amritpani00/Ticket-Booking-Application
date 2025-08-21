import { useEffect, useState } from 'react';
import { apiGet } from '../api';
import { Alert, Box, Card, CardContent, Skeleton, Stack, Typography } from '@mui/material';
import AnimatedStations from '../components/AnimatedStations';
import TimelineGlow from '../components/TimelineGlow';

interface BookingSummary { bookingId: number; trainName: string; trainNumber?: string; source?: string; destination?: string; status: string; totalAmount: number; createdAt: string; }

export default function History() {
  const [items, setItems] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true); setError(null);
    apiGet<BookingSummary[]>('/api/user/bookings')
      .then(setItems)
      .catch(e => setError(e.message || 'Failed to load history'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700}>Booking History</Typography>
          <AnimatedStations />
          <TimelineGlow />
        </CardContent>
      </Card>
      {loading && <Skeleton variant="rectangular" height={40} />}
      {error && <Alert severity="error">{error}</Alert>}
      <Stack gap={1}>
        {items.map(b => (
          <Card key={b.bookingId}>
            <CardContent>
              <Stack>
                <Typography fontWeight={600}>{b.trainNumber ? `${b.trainNumber} — ${b.trainName}` : b.trainName}</Typography>
                <Typography variant="body2" color="text.secondary">{b.source} → {b.destination} • ₹{b.totalAmount.toFixed(2)} • {b.status} • {new Date(b.createdAt).toLocaleString()}</Typography>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}

