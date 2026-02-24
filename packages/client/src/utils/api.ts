const API_BASE = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('htf_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Erreur réseau' }));
    throw new Error(data.error || `Erreur ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Auth
  register: (data: { username: string; email: string; password: string }) =>
    request<{ token: string; user: any }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { login: string; password: string }) =>
    request<{ token: string; user: any }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  getMe: () => request<any>('/auth/me'),

  // Characters
  getCharacters: () => request<any[]>('/characters'),
  getCharacter: (id: number) => request<any>(`/characters/${id}`),
  createCharacter: (data: any) =>
    request<any>('/characters', { method: 'POST', body: JSON.stringify(data) }),
  updateCharacter: (id: number, data: any) =>
    request<any>(`/characters/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCharacter: (id: number) =>
    request<any>(`/characters/${id}`, { method: 'DELETE' }),

  // Book progress
  getBookProgress: (charId: number, book: number) =>
    request<any[]>(`/books/${charId}/${book}`),
  toggleCode: (charId: number, book: number, code: number, notes?: string) =>
    request<any[]>(`/books/${charId}/${book}/${code}`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),

  // Combat log
  saveCombatLog: (charId: number, data: any) =>
    request<any>(`/books/combat-log/${charId}`, { method: 'POST', body: JSON.stringify(data) }),
  getCombatLogs: (charId: number) => request<any[]>(`/books/combat-log/${charId}`),
};
