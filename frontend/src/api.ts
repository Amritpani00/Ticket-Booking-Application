export const API_BASE = (import.meta as any).env?.VITE_API_BASE || '';
import { authHeaders } from './auth';

export async function apiGet<T>(path: string): Promise<T> {
	const url = `${API_BASE}${path}` || path;
	const res = await fetch(url, { headers: { ...authHeaders() } });
	if (!res.ok) {
		const text = await res.text().catch(() => '');
		throw new Error(`GET ${path} failed: ${res.status} ${text}`);
	}
	return res.json();
}

export async function apiPost<TReq, TRes>(path: string, body: TReq): Promise<TRes> {
	const url = `${API_BASE}${path}` || path;
	const res = await fetch(url, {
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