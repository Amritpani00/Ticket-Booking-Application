import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { apiGet, apiPost, API_BASE } from './api';

interface EventDto {
	id: number;
	name: string;
	venue: string;
	description?: string;
	startTime: string;
	endTime: string;
	seatPrice: number;
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

function App() {
	const [query, setQuery] = useState('');
	const [events, setEvents] = useState<EventDto[]>([]);
	const [selectedEvent, setSelectedEvent] = useState<EventDto | null>(null);
	const [seats, setSeats] = useState<SeatDto[]>([]);
	const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);
	const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
	const [creating, setCreating] = useState(false);

	useEffect(() => {
		apiGet<EventDto[]>(`/api/events?q=${encodeURIComponent(query)}`).then(setEvents);
	}, [query]);

	useEffect(() => {
		if (!selectedEvent) return;
		apiGet<SeatDto[]>(`/api/events/${selectedEvent.id}/seats`).then(setSeats);
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
			modal: { ondismiss: () => alert('Payment dismissed') },
			handler: async (response: any) => {
				await apiPost('/api/bookings/verify', {
					bookingId: data.bookingId,
					razorpayOrderId: response.razorpay_order_id,
					razorpayPaymentId: response.razorpay_payment_id,
					razorpaySignature: response.razorpay_signature,
				});
				alert('Payment successful! Booking confirmed.');
			},
		};
		const rz = new (window as any).Razorpay(options);
		rz.open();
	}

	return (
		<div className="container">
			<h1>Ticket Booking</h1>
			<div className="search">
				<input
					placeholder="Search events by name or venue"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
				/>
			</div>
			<div className="events">
				{events.map((ev) => (
					<button
						key={ev.id}
						className={selectedEvent?.id === ev.id ? 'selected' : ''}
						onClick={() => setSelectedEvent(ev)}
					>
						{ev.name} — {ev.venue}
					</button>
				))}
			</div>

			{selectedEvent && (
				<div className="event-details">
					<h2>{selectedEvent.name}</h2>
					<p>{selectedEvent.description}</p>
					<p>
						Price: ₹{selectedEvent.seatPrice.toFixed(2)} | Selected: {selectedSeatIds.length} |
						Total: ₹{total.toFixed(2)}
					</p>
					<div className="seat-grid">
						{seats.map((s) => {
							const disabled = s.status !== 'AVAILABLE';
							const active = selectedSeatIds.includes(s.id);
							return (
								<button
									key={s.id}
									disabled={disabled}
									className={`seat ${active ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
									onClick={() => toggleSeat(s.id)}
								>
									{formatSeat(s)}
								</button>
							);
						})}
					</div>

					<div className="booking-form">
						<input placeholder="Name" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
						<input placeholder="Email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} />
						<input placeholder="Phone" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} />
						<button disabled={creating || selectedSeatIds.length === 0} onClick={createBooking}>
							{creating ? 'Creating…' : 'Pay with Razorpay'}
						</button>
					</div>
				</div>
			)}
		</div>
	);
}

export default App;
