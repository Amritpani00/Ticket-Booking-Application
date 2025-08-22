export const API_BASE = (import.meta as any).env?.VITE_API_BASE || '';
import { authHeaders } from './auth';

const parseError = async (res: Response, path: string) => {
	const text = await res.text().catch(() => '');
	try {
		const json = JSON.parse(text);
		const err: any = new Error(`HTTP ${res.status} on ${path}`);
		err.status = res.status;
		err.code = json.error || 'ERROR';
		err.message = json.message || err.message;
		err.details = json.details;
		throw err;
	} catch {
		const err: any = new Error(`HTTP ${res.status} ${text}`);
		err.status = res.status;
		throw err;
	}
}

export async function apiGet<T>(path: string): Promise<T> {
	const url = `${API_BASE}${path}` || path;
	const res = await fetch(url, { headers: { ...authHeaders() } });
	if (!res.ok) { await parseError(res, path); }
	return res.json() as Promise<T>;
}

export async function apiPost<TReq, TRes>(path: string, body: TReq): Promise<TRes> {
	const url = `${API_BASE}${path}` || path;
	const res = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', ...authHeaders() },
		body: JSON.stringify(body)
	});
	if (!res.ok) { await parseError(res, path); }
	return res.json() as Promise<TRes>;
}

export async function apiPut<TReq, TRes>(path: string, body: TReq): Promise<TRes> {
    const url = `${API_BASE}${path}` || path;
    const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(body)
    });
    if (!res.ok) { await parseError(res, path); }
    return res.json() as Promise<TRes>;
}

export async function apiDelete(path: string): Promise<void> {
    const url = `${API_BASE}${path}` || path;
    const res = await fetch(url, {
        method: 'DELETE',
        headers: { ...authHeaders() },
    });
    if (!res.ok) { await parseError(res, path); }
}