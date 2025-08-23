import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Box, Button, Card, CardContent, Chip, Divider, Skeleton, Stack, Typography } from '@mui/material';
import { apiGet, apiPost } from '../api';

interface TicketDto {
  bookingId: number;
  status: 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED';
  trainName: string;
  trainNumber?: string;
  source?: string;
  destination?: string;
  seatLabels: string[];
  totalAmount: number;
  createdAt: string;
}

export default function Ticket() {
  const { id } = useParams();
  const [ticket, setTicket] = useState<TicketDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    apiGet<TicketDto>(`/api/bookings/${id}`)
      .then(setTicket)
      .catch((e) => setError(e.message || 'Failed to load ticket'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Skeleton variant="rounded" height={160} />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!ticket) return null;

  async function handleRetryPayment() {
    if (!ticket || ticket.status !== 'PENDING_PAYMENT') return;
    setRetrying(true);
    try {
      const data = await apiPost<undefined, any>(`/api/payments/retry/${ticket.bookingId}`, undefined as any);
      const devMode = !(window as any).Razorpay;
      if (devMode) {
        await apiPost(`/api/bookings/verify`, { bookingId: ticket.bookingId, razorpayOrderId: data.orderId, razorpayPaymentId: 'pay_test_retry', razorpaySignature: 'sig_test_retry' } as any);
        setToast('Payment verified. Ticket confirmed.');
        setTicket({ ...ticket, status: 'CONFIRMED' });
        return;
      }
      if (!(window as any).Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Razorpay'));
          document.body.appendChild(script);
        });
      }
      const options: any = {
        key: data.razorpayKeyId,
        amount: Math.round(data.amount * 100),
        currency: data.currency,
        name: 'IRCTC Pro - Train Ticket Booking',
        description: `Booking #${ticket.bookingId}`,
        order_id: data.orderId,
        handler: async (response: any) => {
          await apiPost(`/api/bookings/verify`, { bookingId: ticket.bookingId, razorpayOrderId: response.razorpay_order_id, razorpayPaymentId: response.razorpay_payment_id, razorpaySignature: response.razorpay_signature } as any);
          setToast('Payment verified. Ticket confirmed.');
          setTicket({ ...ticket, status: 'CONFIRMED' });
        },
        modal: { ondismiss: () => setToast('Payment dismissed') },
      };
      const rz = new (window as any).Razorpay(options);
      rz.open();
    } catch (e: any) {
      setToast(e.message || 'Payment retry failed');
    } finally {
      setRetrying(false);
    }
  }

  function downloadPdf() {
    const w = window.open('', '_blank');
    if (!w) return;
    const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Ticket ${ticket!.bookingId}</title>
      <style>
        body{font-family:Arial,Helvetica,sans-serif;margin:20px;color:#111}
        .row{display:flex;justify-content:space-between;align-items:center;gap:8px}
        .muted{color:#6b7280}
        .chip{display:inline-block;border:1px solid #e5e7eb;border-radius:9999px;padding:3px 8px;margin-left:4px}
        .section{border-top:1px solid #e5e7eb;margin:10px 0;padding-top:8px}
        h1{font-size:18px;margin:0 0 8px 0}
      </style>
      </head><body>
        <div class="row">
          <h1>E-Ticket</h1>
          <span class="chip">${ticket!.status}</span>
        </div>
        <div class="section row">
          <div>
            <div><strong>${ticket!.trainNumber ? `${ticket!.trainNumber} — ` : ''}${ticket!.trainName}</strong></div>
            <div class="muted">${ticket!.source || ''} → ${ticket!.destination || ''}</div>
          </div>
          <div>
            ${ticket!.seatLabels.map(s => `<span class=\"chip\">${s}</span>`).join('')}
          </div>
        </div>
        <div class="row muted">
          <div>PNR/Booking ID: ${ticket!.bookingId}</div>
          <div>Booked at: ${new Date(ticket!.createdAt).toLocaleString()}</div>
          <div><strong>Total Paid: ₹${ticket!.totalAmount.toFixed(2)}</strong></div>
        </div>
        <script>window.onload=()=>{window.print(); setTimeout(()=>window.close(), 300);}</script>
      </body></html>`;
    w.document.open();
    w.document.write(html);
    w.document.close();
  }

  return (
    <Box display="flex" justifyContent="center" mt={2}>
      <Card sx={{ width: 680, maxWidth: '100%', p: 1 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={700}>E-Ticket</Typography>
            <Chip label={ticket.status} color={ticket.status === 'CONFIRMED' ? 'success' : ticket.status === 'PENDING_PAYMENT' ? 'warning' : 'default'} />
          </Stack>
          <Divider sx={{ my: 1 }} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
            <Stack>
              <Typography fontWeight={700}>{ticket.trainNumber ? `${ticket.trainNumber} — ${ticket.trainName}` : ticket.trainName}</Typography>
              <Typography variant="body2" color="text.secondary">{ticket.source} → {ticket.destination}</Typography>
            </Stack>
            <Stack direction="row" spacing={1}>
              {ticket.seatLabels.map((s) => <Chip key={s} label={s} />)}
            </Stack>
          </Stack>
          <Divider sx={{ my: 1 }} />
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }}>
            <Typography variant="body2" color="text.secondary">PNR/Booking ID: {ticket.bookingId}</Typography>
            <Typography variant="body2" color="text.secondary">Booked at: {new Date(ticket.createdAt).toLocaleString()}</Typography>
            <Typography variant="body2" fontWeight={700}>Total Paid: ₹{ticket.totalAmount.toFixed(2)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1 }}>
            {ticket.status === 'PENDING_PAYMENT' && (
              <Button variant="contained" color="warning" onClick={handleRetryPayment} disabled={retrying} sx={{ mr: 1 }}>
                {retrying ? 'Retrying...' : 'Retry Payment'}
              </Button>
            )}
            <Button variant="outlined" onClick={downloadPdf}>Download PDF</Button>
          </Stack>
          {toast && <Alert severity="info" sx={{ mt: 1 }}>{toast}</Alert>}
        </CardContent>
      </Card>
    </Box>
  );
}