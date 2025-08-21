export function setToken(token: string) {
	localStorage.setItem('token', token);
}

export function getToken(): string | null {
	return localStorage.getItem('token');
}

export function authHeaders() {
	const t = getToken();
	return t ? { Authorization: `Bearer ${t}` } : {};
}

export function clearToken() {
	localStorage.removeItem('token');
}

export function getRole(): 'ADMIN' | 'USER' | null {
  const t = getToken();
  if (!t) return null;
  const payload = t.split('.')[1];
  try {
    const json = JSON.parse(atob(payload));
    return (json.role as 'ADMIN' | 'USER') || null;
  } catch {
    return null;
  }
}