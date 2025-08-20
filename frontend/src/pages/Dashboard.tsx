import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { getToken } from '../auth';
import { apiGet } from '../api';
import { Alert, Box, Card, CardContent, Chip, Link, Skeleton, Stack, Typography } from '@mui/material';

interface EventItem { id: number; name: string; venue: string; seatPrice: number; }
interface BookingSummary { bookingId: number; trainName: string; trainNumber?: string; source?: string; destination?: string; status: string; totalAmount: number; createdAt: string; }

export default function Dashboard() {
  const navigate = useNavigate();
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    setLoading(true);
    setError(null);
    Promise.all([
      apiGet<EventItem[]>('/api/events'),
      apiGet<BookingSummary[]>('/api/user/bookings').catch(() => []),
    ])
      .then(([evs, bs]) => { setEvents(evs); setBookings(bs); })
      .catch((e) => setError(e.message || 'Failed to load data'))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <Box>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700}>Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">Welcome! Browse trains or continue booking.</Typography>
        </CardContent>
      </Card>
      {loading && <Skeleton variant="rectangular" height={40} />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 2 }}>
        {events.map(ev => (
          <Card key={ev.id}>
            <CardContent>
              <Stack>
                <Link component={RouterLink} to={`/`} underline="hover" variant="subtitle1" fontWeight={700}>{ev.name}</Link>
                <Typography variant="body2" color="text.secondary">{ev.venue}</Typography>
                <Chip size="small" color="success" label={`₹${ev.seatPrice.toFixed(2)}`} sx={{ mt: 1, alignSelf: 'flex-start' }} />
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={700} gutterBottom>Your Bookings</Typography>
          {bookings.length === 0 && <Typography variant="body2" color="text.secondary">No bookings yet.</Typography>}
          <Stack>
            {bookings.map(b => (
              <Box key={b.bookingId} sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography fontWeight={600}>
                  {b.trainNumber ? `${b.trainNumber} — ${b.trainName}` : b.trainName}
                </Typography>
                <Typography variant="body2" color="text.secondary">{b.source} → {b.destination} • ₹{b.totalAmount.toFixed(2)} • {b.status} • {new Date(b.createdAt).toLocaleString()}</Typography>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}