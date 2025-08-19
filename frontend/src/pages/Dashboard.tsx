import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getToken } from '../auth';
import { apiGet } from '../api';

interface EventItem { id: number; name: string; venue: string; seatPrice: number; }

export default function Dashboard() {
  const navigate = useNavigate();
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    setLoading(true);
    setError(null);
    apiGet<EventItem[]>('/api/events')
      .then(setEvents)
      .catch((e) => setError(e.message || 'Failed to load data'))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome! Browse events or continue booking.</p>
      {loading && <div className="loading">Loading…</div>}
      {error && <div className="error">{error}</div>}
      <div className="events">
        {events.map(ev => (
          <Link key={ev.id} to={`/`} className="link">{ev.name} — {ev.venue} (₹{ev.seatPrice.toFixed(2)})</Link>
        ))}
      </div>
    </div>
  );
}

