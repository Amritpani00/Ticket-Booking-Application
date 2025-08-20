import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getToken } from '../auth';
import { apiGet } from '../api';

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
    <div>
      <div className="card" style={{ marginBottom: 12 }}>
        <h1>Dashboard</h1>
        <p>Welcome! Browse trains or continue booking.</p>
      </div>
      {loading && <div className="loading">Loading…</div>}
      {error && <div className="error">{error}</div>}
      <div className="events">
        {events.map(ev => (
          <Link key={ev.id} to={`/`} className="card" style={{ textDecoration: 'none' }}>{ev.name} — {ev.venue} (₹{ev.seatPrice.toFixed(2)})</Link>
        ))}
      </div>
      <div className="card" style={{ marginTop: 12, textAlign: 'left' }}>
        <h2>Your Bookings</h2>
        {bookings.length === 0 && <p className="muted">No bookings yet.</p>}
        {bookings.map(b => (
          <div key={b.bookingId} style={{ padding: 8, borderBottom: '1px solid #eee' }}>
            <div style={{ fontWeight: 600 }}>{b.trainNumber ? `${b.trainNumber} — ${b.trainName}` : b.trainName}</div>
            <div className="muted">{b.source} → {b.destination} • ₹{b.totalAmount.toFixed(2)} • {b.status} • {new Date(b.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

