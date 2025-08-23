import { useEffect, useState } from 'react';
import { apiGet } from '../api';
import { apiPost } from '../api';
import { Alert, Box, Card, CardContent, Skeleton, Stack, Typography, Button } from '@mui/material';
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
                {b.status === 'PENDING_PAYMENT' && (
                  <Button size="small" variant="contained" sx={{ mt: 1, alignSelf: 'flex-start' }} onClick={async () => {
                    try {
                      const data: any = await apiPost(`/api/payments/retry/${b.bookingId}`, undefined as any);
                      const devMode = !(window as any).Razorpay;
                      if (devMode) {
                        await apiPost(`/api/bookings/verify`, { bookingId: b.bookingId, razorpayOrderId: data.orderId, razorpayPaymentId: 'pay_test_retry', razorpaySignature: 'sig_test_retry' } as any);
                        setItems(prev => prev.map(x => x.bookingId === b.bookingId ? { ...x, status: 'CONFIRMED' } : x));
                        return;
                      }
                      if (!(window as any).Razorpay) {
                        await new Promise<void>((resolve, reject) => { const s = document.createElement('script'); s.src = 'https://checkout.razorpay.com/v1/checkout.js'; s.onload = () => resolve(); s.onerror = () => reject(new Error('Failed to load Razorpay')); document.body.appendChild(s); });
                      }
                      const rz = new (window as any).Razorpay({ key: data.razorpayKeyId, amount: Math.round(data.amount * 100), currency: data.currency, order_id: data.orderId, handler: async (resp: any) => { await apiPost(`/api/bookings/verify`, { bookingId: b.bookingId, razorpayOrderId: resp.razorpay_order_id, razorpayPaymentId: resp.razorpay_payment_id, razorpaySignature: resp.razorpay_signature } as any); setItems(prev => prev.map(x => x.bookingId === b.bookingId ? { ...x, status: 'CONFIRMED' } : x)); } });
                      rz.open();
                    } catch {}
                  }}>Pay Now</Button>
                )}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}

