import { request, numericId } from '@/lib/api-client';
import { userFromApi } from '@/lib/api-adapters';
import type { ApiUser } from '@/lib/api-contracts';
import type { UserRole } from '@/types';
export async function getUsers(signal?: AbortSignal) { return (await request<ApiUser[]>('/users', { signal })).map(userFromApi); }
export async function getUser(id: string, signal?: AbortSignal) { return userFromApi(await request<ApiUser>(`/users/${numericId(id)}`, { signal })); }
export async function updateUserRole(id: string, role: UserRole) { return userFromApi(await request<ApiUser>(`/users/${numericId(id)}/role`, { method: 'PATCH', body: JSON.stringify({ role }) })); }
export async function deactivateUser(id: string) { return userFromApi(await request<ApiUser>(`/users/${numericId(id)}`, { method: 'DELETE' })); }
export async function createUser(name: string, email: string, password: string, role: UserRole) {
  return userFromApi(await request<ApiUser>('/users', { method: 'POST', body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password, role }) }));
}
