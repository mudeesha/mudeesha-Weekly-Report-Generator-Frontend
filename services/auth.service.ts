import { request, setToken } from '@/lib/api-client';
import { userFromApi } from '@/lib/api-adapters';
import type { ApiUser, TokenResponse } from '@/lib/api-contracts';
export async function login(email: string, password: string) {
  const result = await request<TokenResponse>('/auth/login', { method: 'POST', public: true, headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ username: email.trim().toLowerCase(), password }) });
  if (result.token_type.toLowerCase() !== 'bearer' || !result.access_token)
    throw new Error('Invalid login response.');
  setToken(result.access_token);
  try {
    return await me();
  }
  catch (error) {
    setToken(null);
    throw error;
  }
}
export async function me(signal?: AbortSignal) { return userFromApi(await request<ApiUser>('/auth/me', { signal })); }
export async function register(name: string, email: string, password: string) { return userFromApi(await request<ApiUser>('/auth/register', { method: 'POST', public: true, body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password }) })); }
