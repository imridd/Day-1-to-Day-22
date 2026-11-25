const BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function api(
  path,
  {
    method = 'GET',
    body,
    token =
      typeof window !== 'undefined'
        ? sessionStorage.getItem('hd_token')
        : null
  } = {}
) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    cache: 'no-store'
  });

  const data = await res.json().catch(() => ({
    message: 'Unexpected server response'
  }));

  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

export function saveSession(data) {
  // Remove old shared-browser sessions.
  localStorage.removeItem('hd_token');
  localStorage.removeItem('hd_user');

  // Each tab gets its own session.
  sessionStorage.setItem('hd_token', data.token);
  sessionStorage.setItem('hd_user', JSON.stringify(data.user));
}

export function clearSession() {
  sessionStorage.removeItem('hd_token');
  sessionStorage.removeItem('hd_user');

  localStorage.removeItem('hd_token');
  localStorage.removeItem('hd_user');
}
