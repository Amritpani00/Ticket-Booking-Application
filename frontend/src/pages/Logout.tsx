import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearToken } from '../auth';

export default function Logout() {
	const navigate = useNavigate();

	useEffect(() => {
		clearToken();
		navigate('/', { replace: true });
	}, [navigate]);

	return (
		<div className="container" style={{ maxWidth: 440 }}>
			<div className="card">
				<h1>Logging out…</h1>
				<p>You are being redirected to home.</p>
			</div>
		</div>
	);
}

