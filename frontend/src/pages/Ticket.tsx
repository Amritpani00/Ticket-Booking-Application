import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Box, Card, CardContent, Chip, Divider, Skeleton, Stack, Typography } from '@mui/material';
import { apiGet } from '../api';

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

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    apiGet<TicketDto>(`/api/bookings/${id}`)
      .then(setTicket)
      .catch((e) => setError(e.message || 'Failed to load ticket'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <Skeleton variant="rounded" height={160} />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!ticket) return null;

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
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
            <Typography variant="body2" color="text.secondary">PNR/Booking ID: {ticket.bookingId}</Typography>
            <Typography variant="body2" color="text.secondary">Booked at: {new Date(ticket.createdAt).toLocaleString()}</Typography>
            <Typography variant="body2" fontWeight={700}>Total Paid: ₹{ticket.totalAmount.toFixed(2)}</Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}