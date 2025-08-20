import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiPost } from './api';
import { getToken } from './auth';
import { Alert, Box, Button, Card, CardActionArea, CardContent, Chip, Divider, Skeleton, Stack, TextField, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

interface EventDto {
	id: number;
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

interface SeatDto {
	id: number;
	rowLabel: string;
	seatNumber: number;
	status: 'AVAILABLE' | 'RESERVED' | 'BOOKED';
}

interface CreateBookingResponse {
	bookingId: number;
	orderId: string;
	razorpayKeyId: string;
	amount: number;
	currency: string;
}

function formatSeat(seat: SeatDto) {
	return `${seat.rowLabel}${seat.seatNumber}`;
}

function classLabelToAcType(classType?: string) {
	if (!classType) return 'General';
	const t = classType.toUpperCase();
	if (['1A','2A','3A','EC'].includes(t)) return 'AC';
	return 'Non-AC';
}

function App() {
	const [query, setQuery] = useState('');
	const [events, setEvents] = useState<EventDto[]>([]);
	const [loadingEvents, setLoadingEvents] = useState(false);
	const [eventsError, setEventsError] = useState<string | null>(null);
	const [selectedEvent, setSelectedEvent] = useState<EventDto | null>(null);
	const [seats, setSeats] = useState<SeatDto[]>([]);
	const [loadingSeats, setLoadingSeats] = useState(false);
	const [seatsError, setSeatsError] = useState<string | null>(null);
	const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);
	const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
	const [creating, setCreating] = useState(false);
	const [toast, setToast] = useState<string | null>(null);
	const navigate = useNavigate();

	const [source, setSource] = useState('');
	const [destination, setDestination] = useState('');
	const [classType, setClassType] = useState('');
	const [journeyDate, setJourneyDate] = useState<string>('');

	useEffect(() => {
		let active = true;
		setLoadingEvents(true);
		setEventsError(null);
		const id = setTimeout(() => {
			const params = new URLSearchParams();
			if (source && destination) {
				params.set('source', source);
				params.set('destination', destination);
			} else if (query) {
				params.set('q', query);
			}
			const qs = params.toString();
			apiGet<EventDto[]>(`/api/events${qs ? `?${qs}` : ''}`)
				.then((data) => { if (active) setEvents(data); })
				.catch((err) => { if (active) setEventsError(err.message || 'Failed to load trains'); })
				.finally(() => { if (active) setLoadingEvents(false); });
		}, 300);
		return () => { active = false; clearTimeout(id); };
	}, [query, source, destination]);

	useEffect(() => {
		if (!selectedEvent) return;
		let active = true;
		setLoadingSeats(true);
		setSeatsError(null);
		apiGet<SeatDto[]>(`/api/events/${selectedEvent.id}/seats`)
			.then((data) => { if (active) setSeats(data); })
			.catch((err) => { if (active) setSeatsError(err.message || 'Failed to load seats'); })
			.finally(() => { if (active) setLoadingSeats(false); });
		return () => { active = false; };
	}, [selectedEvent?.id]);

	const total = useMemo(() => {
		if (!selectedEvent) return 0;
		return selectedSeatIds.length * selectedEvent.seatPrice;
	}, [selectedSeatIds, selectedEvent]);

	function toggleSeat(id: number) {
		setSelectedSeatIds((prev) =>
			prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
		);
	}

	async function createBooking() {
		if (!selectedEvent || selectedSeatIds.length === 0) return;
		if (!getToken()) {
			setToast('Please login or register first');
			return;
		}
		setCreating(true);
		try {
			const resp = await apiPost<any, CreateBookingResponse>(
				'/api/bookings',
				{
					eventId: selectedEvent.id,
					seatIds: selectedSeatIds,
					customerName: customer.name,
					customerEmail: customer.email,
					customerPhone: customer.phone,
				}
			);

			await launchRazorpay(resp);
		} catch (e: any) {
			setToast(e.message || 'Failed to create booking');
		} finally {
			setCreating(false);
		}
	}

	async function launchRazorpay(data: CreateBookingResponse) {
		if (!(window as any).Razorpay) {
			await new Promise<void>((resolve, reject) => {
				const script = document.createElement('script');
				script.src = 'https://checkout.razorpay.com/v1/checkout.js';
				script.onload = () => resolve();
				script.onerror = () => reject(new Error('Failed to load Razorpay'));
				document.body.appendChild(script);
			});
		}
		const options = {
			key: data.razorpayKeyId,
			amount: Math.round(data.amount * 100),
			currency: data.currency,
			name: 'Ticket Booking',
			description: 'Seat booking',
			order_id: data.orderId,
			prefill: { name: customer.name, email: customer.email, contact: customer.phone },
			modal: { ondismiss: () => setToast('Payment dismissed') },
			handler: async (response: any) => {
				await apiPost('/api/bookings/verify', {
					bookingId: data.bookingId,
					razorpayOrderId: response.razorpay_order_id,
					razorpayPaymentId: response.razorpay_payment_id,
					razorpaySignature: response.razorpay_signature,
				});
				navigate(`/ticket/${data.bookingId}`);
			},
		};
		const rz = new (window as any).Razorpay(options);
		rz.open();
	}

	return (
		<Box>
			<Card sx={{ mb: 2 }}>
				<CardContent>
					<Typography variant="h5" fontWeight={700} gutterBottom>
						IRCTC-like Train Booking
					</Typography>
					<Stack direction={{ xs: 'column', md: 'row' }} spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
						<TextField label="From (source)" value={source} onChange={(e) => setSource(e.target.value)} sx={{ minWidth: { xs: '100%', md: 220 }, flex: 1 }} />
						<TextField label="To (destination)" value={destination} onChange={(e) => setDestination(e.target.value)} sx={{ minWidth: { xs: '100%', md: 220 }, flex: 1 }} />
						<Box sx={{ minWidth: { xs: '100%', md: 200 } }}>
							<DatePicker label="Journey date" value={journeyDate ? dayjs(journeyDate) : null} onChange={(d) => setJourneyDate(d ? d.format('YYYY-MM-DD') : '')} slotProps={{ textField: { fullWidth: true } }} />
						</Box>
						<TextField label="Class (e.g. 3A, SL)" value={classType} onChange={(e) => setClassType(e.target.value)} sx={{ minWidth: { xs: '100%', md: 160 } }} />
						<TextField label="Search trains or stations" value={query} onChange={(e) => setQuery(e.target.value)} sx={{ minWidth: { xs: '100%', md: 240 }, flex: 1 }} />
					</Stack>
				</CardContent>
			</Card>

			{loadingEvents && (
				<Stack gap={1} mb={2}>
					<Skeleton variant="rounded" height={36} />
					<Skeleton variant="rounded" height={36} width="80%" />
					<Skeleton variant="rounded" height={36} width="60%" />
				</Stack>
			)}
			{eventsError && <Alert severity="error">{eventsError}</Alert>}
			<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 2 }}>
				{events
					.filter(ev => !classType || (ev.classType || '').toUpperCase() === classType.toUpperCase())
					.map((ev) => (
						<Card key={ev.id} variant={selectedEvent?.id === ev.id ? 'outlined' : undefined} sx={{ borderColor: selectedEvent?.id === ev.id ? 'primary.main' : undefined }}>
							<CardActionArea onClick={() => setSelectedEvent(ev)}>
								<CardContent>
									<Stack gap={0.5}>
										<Typography fontWeight={700}>{ev.trainNumber ? `${ev.trainNumber} — ${ev.name}` : ev.name}</Typography>
										<Typography variant="body2" color="text.secondary">{ev.source || ev.venue} → {ev.destination || 'Destination'}</Typography>
										<Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
											<Chip size="small" label={`Dep: ${new Date(ev.startTime).toLocaleString()}`} />
											<Chip size="small" label={`Arr: ${new Date(ev.endTime).toLocaleString()}`} />
											<Chip size="small" color={classLabelToAcType(ev.classType) === 'AC' ? 'primary' : 'default'} label={`${ev.classType || 'GEN'} • ${classLabelToAcType(ev.classType)}`} />
											<Chip size="small" color="success" label={`Fare: ₹${ev.seatPrice.toFixed(2)}`} />
										</Stack>
									</Stack>
								</CardContent>
							</CardActionArea>
						</Card>
					))}
			</Box>

			{selectedEvent && (
				<Card>
					<CardContent>
						<Typography variant="h6" fontWeight={700} gutterBottom>
							{selectedEvent.trainNumber ? `${selectedEvent.trainNumber} — ${selectedEvent.name}` : selectedEvent.name}
						</Typography>
						<Typography variant="body2" color="text.secondary" gutterBottom>
							{(selectedEvent.source || selectedEvent.venue)} → {selectedEvent.destination || 'Destination'} • Class: {selectedEvent.classType || 'General'}
						</Typography>
						{selectedEvent.description && <Typography variant="body2" gutterBottom>{selectedEvent.description}</Typography>}
						<Stack direction="row" spacing={2} alignItems="center" sx={{ my: 1 }}>
							<Chip color="success" variant="outlined" label="Selected" />
							<Chip variant="outlined" label="Unavailable" />
						</Stack>
						<Typography variant="body2" sx={{ mb: 1 }}>
							Price: ₹{selectedEvent.seatPrice.toFixed(2)} | Selected: {selectedSeatIds.length} | Total: ₹{total.toFixed(2)}
						</Typography>

						{loadingSeats && (
							<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))', gap: 1 }}>
								{Array.from({ length: 24 }).map((_, i) => (
									<Skeleton key={i} variant="rounded" height={40} />
								))}
							</Box>
						)}
						{seatsError && <Alert severity="error">{seatsError}</Alert>}
						<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))', gap: 1, mb: 2 }}>
							{seats.map((s) => {
								const disabled = s.status !== 'AVAILABLE';
								const active = selectedSeatIds.includes(s.id);
								return (
									<Button
										key={s.id}
										fullWidth
										variant={active ? 'contained' : 'outlined'}
										color={active ? 'success' : 'inherit'}
										disabled={disabled}
										sx={{ minWidth: 0, px: 0 }}
										onClick={() => toggleSeat(s.id)}
									>
										{formatSeat(s)}
									</Button>
								);
							})}
						</Box>

						<Divider sx={{ my: 1 }} />

						<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
							<TextField label="Name" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} fullWidth />
							<TextField label="Email" type="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} fullWidth />
							<TextField label="Phone" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} fullWidth />
							<Button disabled={creating || selectedSeatIds.length === 0} onMouseEnter={() => setToast(selectedSeatIds.length === 0 ? 'Select at least one seat' : null)} onMouseLeave={() => setToast(null)} onClick={createBooking} variant="contained" color="success">
								{creating ? 'Creating…' : 'Pay with Razorpay'}
							</Button>
						</Stack>
					</CardContent>
				</Card>
			)}

			{toast && (
				<Box position="fixed" right={16} bottom={16}>
					<Alert severity="info" onClose={() => setToast(null)}>{toast}</Alert>
				</Box>
			)}
		</Box>
	);
}

export default App;