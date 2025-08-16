export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

export async function apiGet<T>(path: string): Promise<T> {
	const res = await fetch(`${API_BASE}${path}`);
	if (!res.ok) throw new Error(`GET ${path} failed`);
	return res.json();
}

export async function apiPost<TReq, TRes>(path: string, body: TReq): Promise<TRes> {
	const res = await fetch(`${API_BASE}${path}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`POST ${path} failed`);
	return res.json();
}