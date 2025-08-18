export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
import { authHeaders } from './auth';

export async function apiGet<T>(path: string): Promise<T> {
	const res = await fetch(`${API_BASE}${path}`, { headers: { ...authHeaders() } });
	if (!res.ok) {
		const text = await res.text().catch(() => '');
		throw new Error(`GET ${path} failed: ${res.status} ${text}`);
	}
	return res.json();
}

export async function apiPost<TReq, TRes>(path: string, body: TReq): Promise<TRes> {
	const res = await fetch(`${API_BASE}${path}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', ...authHeaders() },
		body: JSON.stringify(body)
	});
	if (!res.ok) {
		const text = await res.text().catch(() => '');
		throw new Error(`POST ${path} failed: ${res.status} ${text}`);
	}
	return res.json();
}