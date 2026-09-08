import { request } from '@/lib/api-client';
import type { ApiAIChatMessage, ApiAIChatResponse } from '@/lib/api-contracts';

export async function chat(message: string, history: ApiAIChatMessage[] = []): Promise<ApiAIChatResponse> {
  const trimmedMessage = message.trim();
  return request<ApiAIChatResponse>('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({
      message: trimmedMessage,
      history: history.slice(-8).map(item => ({ role: item.role, content: item.content.trim() })),
    }),
    timeoutMs: 45000,
  });
}
