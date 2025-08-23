import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { getToken } from '../auth';
import { apiGet } from '../api';
import { apiPost } from '../api';
import { Alert, Box, Card, CardContent, Chip, Link, Skeleton, Stack, Typography, Button } from '@mui/material';
import AnimatedTrain from '../components/AnimatedTrain';
import AnimatedClouds from '../components/AnimatedClouds';
import PulseIcons from '../components/PulseIcons';
import GradientBanner from '../components/GradientBanner';
import DottedLine from '../components/DottedLine';

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
          <GradientBanner />
          <AnimatedClouds />
          <AnimatedTrain />
          <PulseIcons />
          <DottedLine />
        </CardContent>
      </Card>
      {loading && <Skeleton variant="rectangular" height={40} />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 2 }}>
        {events.map(ev => (
          <Card key={ev.id}>
            <CardContent>
              <Stack>
                <Link component={RouterLink} to={`/?eventId=${ev.id}`} underline="hover" variant="subtitle1" fontWeight={700}>{ev.name}</Link>
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
                {b.status === 'PENDING_PAYMENT' && (
                  <Button size="small" variant="contained" sx={{ mt: 1 }} onClick={async () => {
                    try {
                      const data: any = await apiPost(`/api/payments/retry/${b.bookingId}`, undefined as any);
                      const devMode = !(window as any).Razorpay;
                      if (devMode) {
                        await apiPost(`/api/bookings/verify`, { bookingId: b.bookingId, razorpayOrderId: data.orderId, razorpayPaymentId: 'pay_test_retry', razorpaySignature: 'sig_test_retry' } as any);
                        setBookings(prev => prev.map(x => x.bookingId === b.bookingId ? { ...x, status: 'CONFIRMED' } : x));
                        return;
                      }
                      if (!(window as any).Razorpay) {
                        await new Promise<void>((resolve, reject) => { const s = document.createElement('script'); s.src = 'https://checkout.razorpay.com/v1/checkout.js'; s.onload = () => resolve(); s.onerror = () => reject(new Error('Failed to load Razorpay')); document.body.appendChild(s); });
                      }
                      const rz = new (window as any).Razorpay({ key: data.razorpayKeyId, amount: Math.round(data.amount * 100), currency: data.currency, order_id: data.orderId, handler: async (resp: any) => { await apiPost(`/api/bookings/verify`, { bookingId: b.bookingId, razorpayOrderId: resp.razorpay_order_id, razorpayPaymentId: resp.razorpay_payment_id, razorpaySignature: resp.razorpay_signature } as any); setBookings(prev => prev.map(x => x.bookingId === b.bookingId ? { ...x, status: 'CONFIRMED' } : x)); } });
                      rz.open();
                    } catch {}
                  }}>Pay Now</Button>
                )}
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}