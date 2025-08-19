import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearToken, getToken } from '../auth';

export default function Navbar() {
	const navigate = useNavigate();
	const [token, setToken] = useState<string | null>(() => getToken());

	useEffect(() => {
		function onStorage(e: StorageEvent) {
			if (e.key === 'token') setToken(getToken());
		}
		window.addEventListener('storage', onStorage);
		return () => window.removeEventListener('storage', onStorage);
	}, []);

	return (
		<nav className="navbar">
			<Link to="/" className="brand">Ticket Booking</Link>
			<div className="nav-actions">
				<Link className="link" to="/">Home</Link>
				{token ? (
					<>
						<button className="link" onClick={() => navigate('/dashboard')}>Dashboard</button>
						<button className="link" onClick={() => { clearToken(); setToken(null); navigate('/'); }}>Logout</button>
					</>
				) : (
					<>
						<Link className="link" to="/login">Login</Link>
						<Link className="link" to="/register">Register</Link>
					</>
				)}
			</div>
		</nav>
	);
}

