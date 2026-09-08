import { request, numericId } from '@/lib/api-client';
import { projectFromApi } from '@/lib/api-adapters';
import type { ApiProject } from '@/lib/api-contracts';
import type { ProjectInput } from '@/types';
export async function getProjects(signal?: AbortSignal) { return (await request<ApiProject[]>('/projects', { signal })).map(projectFromApi); }
export async function getProject(id: string, signal?: AbortSignal) { return projectFromApi(await request<ApiProject>(`/projects/${numericId(id)}`, { signal })); }
export async function createProject(data: ProjectInput) { return projectFromApi(await request<ApiProject>('/projects', { method: 'POST', body: JSON.stringify(data) })); }
export async function updateProject(id: string, data: ProjectInput) { return projectFromApi(await request<ApiProject>(`/projects/${numericId(id)}`, { method: 'PATCH', body: JSON.stringify(data) })); }
export function deleteProject(id: string) { return request<void>(`/projects/${numericId(id)}`, { method: 'DELETE' }); }
export async function assignProjectMembers(id: string, userIds: string[]) { return projectFromApi(await request<ApiProject>(`/projects/${numericId(id)}/members`, { method: 'PUT', body: JSON.stringify({ user_ids: [...new Set(userIds)].map(numericId) }) })); }
