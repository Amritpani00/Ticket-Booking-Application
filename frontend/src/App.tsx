import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { Link, useNavigate } from 'react-router-dom';
import { apiGet, apiPost } from './api';
import { setToken, getToken, clearToken } from './auth';

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
	const [auth, setAuth] = useState({ email: '', password: '', name: '' });
	const [token, setTok] = useState<string | null>(() => getToken());
	const [toast, setToast] = useState<string | null>(null);
	const navigate = useNavigate();

	const [source, setSource] = useState('');
	const [destination, setDestination] = useState('');

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

	async function register() {
		try {
			const resp = await apiPost('/api/auth/register', { name: auth.name, email: auth.email, password: auth.password });
			setToken((resp as any).token);
			setTok((resp as any).token);
		} catch (e: any) {
			alert(e.message || 'Registration failed');
		}
	}

	async function login() {
		try {
			const resp = await apiPost('/api/auth/login', { email: auth.email, password: auth.password });
			setToken((resp as any).token);
			setTok((resp as any).token);
		} catch (e: any) {
			alert(e.message || 'Login failed');
		}
	}

	async function createBooking() {
		if (!selectedEvent || selectedSeatIds.length === 0) return;
		if (!token) {
			alert('Please login or register first');
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
			alert(e.message || 'Failed to create booking');
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
		<div>
			<div className="hero">
				<h1>IRCTC-like Train Booking</h1>
				<div className="search grid">
					<input placeholder="From (source)" value={source} onChange={(e) => setSource(e.target.value)} />
					<input placeholder="To (destination)" value={destination} onChange={(e) => setDestination(e.target.value)} />
					<input placeholder="Search by train or station" value={query} onChange={(e) => setQuery(e.target.value)} />
				</div>
			</div>
			{loadingEvents && (
				<div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
					<div className="skeleton" style={{ height: 36 }} />
					<div className="skeleton" style={{ height: 36, width: '80%' }} />
					<div className="skeleton" style={{ height: 36, width: '60%' }} />
				</div>
			)}
			{eventsError && <div className="error">{eventsError}</div>}
			<div className="events">
				{events.map((ev) => (
					<button
						key={ev.id}
						className={selectedEvent?.id === ev.id ? 'selected card' : 'card'}
						onClick={() => setSelectedEvent(ev)}
					>
						<div className="train-card">
							<div className="train-title">{ev.trainNumber ? `${ev.trainNumber} — ${ev.name}` : ev.name}</div>
							<div className="train-route">{ev.source || ev.venue} → {ev.destination || 'Destination'}</div>
							<div className="train-meta">Dep: {new Date(ev.startTime).toLocaleString()} • Arr: {new Date(ev.endTime).toLocaleString()} • Class: {ev.classType || 'General'} • Fare: ₹{ev.seatPrice.toFixed(2)}</div>
						</div>
					</button>
				))}
			</div>

			{selectedEvent && (
				<div className="event-details">
					<h2>{selectedEvent.trainNumber ? `${selectedEvent.trainNumber} — ${selectedEvent.name}` : selectedEvent.name}</h2>
					<p className="muted">{(selectedEvent.source || selectedEvent.venue)} → {selectedEvent.destination || 'Destination'} • Class: {selectedEvent.classType || 'General'}</p>
					<p>{selectedEvent.description}</p>
					<div className="muted" style={{ margin: '8px 0' }}>Seat legend: <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', marginRight: 4 }}></span> Selected • <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f3f4f6', marginRight: 4, border: '1px solid #ddd' }}></span> Unavailable</div>
					<p>
						Price: ₹{selectedEvent.seatPrice.toFixed(2)} | Selected: {selectedSeatIds.length} |
						Total: ₹{total.toFixed(2)}
					</p>
					{loadingSeats && (
						<div style={{ display: 'grid', gap: 6, gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))' }}>
							{Array.from({ length: 24 }).map((_, i) => (
								<div key={i} className="skeleton" style={{ height: 40 }} />
							))}
						</div>
					)}
					{seatsError && <div className="error">{seatsError}</div>}
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
						<button disabled={creating || selectedSeatIds.length === 0} onClick={createBooking} onMouseEnter={() => setToast(selectedSeatIds.length === 0 ? 'Select at least one seat' : null)} onMouseLeave={() => setToast(null)}>
							{creating ? 'Creating…' : 'Pay with Razorpay'}
						</button>
					</div>
				</div>
			)}
			{toast && <div className="toast">{toast}</div>}
		</div>
	);
}

export default App;