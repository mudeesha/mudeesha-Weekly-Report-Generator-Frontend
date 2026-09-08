/** Real HTTP only. No local data store, fake responses, or role overrides. */
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1').replace(/\/$/, '');
const TOKEN_KEY = 'workreport.access_token';
export const AUTH_EXPIRED_EVENT = 'workreport:authentication-expired';
let memoryToken: string | null = null;

export class ApiError extends Error {
  constructor(message: string, public status: number, public details?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

export function getToken(): string | null {
  try {
    return memoryToken ?? (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(TOKEN_KEY) : null);
  } catch {
    return memoryToken;
  }
}

export function setToken(token: string | null): void {
  memoryToken = token;
  try {
    if (typeof sessionStorage === 'undefined') return;
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* In-memory auth still works when storage is unavailable. */
  }
}

export function endSession(): void {
  setToken(null);
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

function responseMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== 'object' || !('detail' in body)) return fallback;
  const detail = (body as { detail: unknown }).detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map(item => {
      if (!item || typeof item !== 'object') return 'Invalid request.';
      const value = item as { loc?: unknown[]; msg?: string };
      const field = value.loc?.filter(part => part !== 'body' && part !== 'query').join('.');
      return `${field ? field + ': ' : ''}${value.msg || 'Invalid value.'}`;
    }).join(' ');
  }
  return fallback;
}

export async function request<T>(path: string, options: RequestInit & { public?: boolean; timeoutMs?: number } = {}): Promise<T> {
  const { public: isPublic = false, timeoutMs = 20000, signal: parentSignal, ...init } = options;
  const token = isPublic ? null : getToken();
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('Content-Type') && typeof init.body === 'string') headers.set('Content-Type', 'application/json');

  const controller = new AbortController();
  const abort = () => controller.abort();
  if (parentSignal?.aborted) controller.abort();
  parentSignal?.addEventListener('abort', abort, { once: true });
  const timeout = globalThis.setTimeout(abort, timeoutMs);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers, credentials: 'omit', signal: controller.signal });
    if (response.status === 204) return undefined as T;

    const text = await response.text();
    let body: unknown;
    try { body = text ? JSON.parse(text) : null; } catch { body = null; }

    if (!response.ok) {
      const message = responseMessage(body, `The server returned HTTP ${response.status}. Please try again.`);
      if (!isPublic && token === getToken() && (response.status === 401 || (response.status === 403 && message === 'This account is inactive.'))) endSession();
      throw new ApiError(message, response.status, body);
    }

    if (body === null) throw new ApiError('The API did not return JSON. Check NEXT_PUBLIC_API_BASE_URL and the FastAPI connection.', response.status);
    return body as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (parentSignal?.aborted) throw new DOMException('Request cancelled', 'AbortError');
    throw new ApiError(controller.signal.aborted ? 'The request timed out. Please retry.' : 'Cannot reach the backend. Check that FastAPI is running and the API address is correct.', 0);
  } finally {
    globalThis.clearTimeout(timeout);
    parentSignal?.removeEventListener('abort', abort);
  }
}

export function queryString(values: Record<string, string | number | undefined | null>): string {
  const query = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'ALL') query.set(key, String(value));
  });
  return query.size ? `?${query}` : '';
}

export function numericId(id: string): number {
  const value = Number(id);
  if (!Number.isSafeInteger(value) || value < 1) throw new ApiError('Invalid record ID.', 422);
  return value;
}
