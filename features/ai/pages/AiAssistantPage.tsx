'use client';

import { useRef, useState } from 'react';
import { LoaderCircle, MessageSquareText, SendHorizontal, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/primitives';
import * as aiApi from '@/services/ai.service';
import { errorMessage } from '@/lib/api-client';
import type { ApiAIChatMessage } from '@/lib/api-contracts';
import { cn } from '@/lib/format';

interface ChatEntry extends ApiAIChatMessage {
  id: number;
  reportsUsed?: number;
  periodStart?: string;
  periodEnd?: string;
}

const quickPrompts = [
  { label: 'Completed work', prompt: 'Summarize the completed work from the available reports.' },
  { label: 'Main blockers', prompt: 'What are the main blockers that need attention?' },
  { label: 'Workload overview', prompt: 'Summarize the reported workload and any visible imbalance.' },
  { label: 'Project activity', prompt: 'Which projects had the most reported activity?' },
];

export function AiAssistantPage() {
  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nextId = useRef(1);

  const send = async (value: string = message) => {
    const trimmed = value.trim();
    if (!trimmed || sending) return;

    const history: ApiAIChatMessage[] = messages.slice(-8).map(item => ({ role: item.role, content: item.content }));
    const userEntry: ChatEntry = { id: nextId.current++, role: 'user', content: trimmed };

    setMessages(current => [...current, userEntry]);
    setMessage('');
    setError(null);
    setSending(true);

    try {
      const response = await aiApi.chat(trimmed, history);
      setMessages(current => [
        ...current,
        {
          id: nextId.current++,
          role: 'assistant',
          content: response.answer,
          reportsUsed: response.reports_used,
          periodStart: response.period_start,
          periodEnd: response.period_end,
        },
      ]);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <PageHeader
        title="AI Assistant"
        subtitle="Ask management questions about submitted team reports, blockers and workload."
        crumbs={[{ label: 'AI Assistant' }]}
      />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#e7e5eb] px-4 py-4 sm:px-5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-[7px] bg-[#f0eef8] text-[#594dba]">
              <MessageSquareText className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-[14px] font-semibold text-[#3c3374]">Team reporting assistant</h2>
              <p className="mt-1 max-w-2xl text-[11px] leading-5 text-[#887f9d]">Answers are generated from submitted report versions available to managers and administrators.</p>
            </div>
          </div>

          {messages.length > 0 && (
            <button
              type="button"
              onClick={() => { setMessages([]); setError(null); }}
              disabled={sending}
              className="inline-flex h-8 items-center gap-1.5 rounded-[6px] border border-[#dedbe8] bg-white px-2.5 text-[11px] font-medium text-[#6e6687] transition hover:bg-[#f7f5fb] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
        </div>

        <div className="border-b border-[#ece9f0] bg-[#faf9fd] px-4 py-3 sm:px-5">
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map(item => (
              <button
                key={item.label}
                type="button"
                onClick={() => void send(item.prompt)}
                disabled={sending}
                className="h-8 rounded-[6px] border border-[#dedbe8] bg-white px-2.5 text-[11px] font-medium text-[#655e79] transition hover:border-[#c8c2d8] hover:bg-[#f5f2fa] hover:text-[#4b418f] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="wr-scroll min-h-[390px] max-h-[calc(100vh-370px)] overflow-y-auto px-4 py-5 sm:px-5">
          {messages.length === 0 ? (
            <div className="flex min-h-[340px] items-center justify-center">
              <div className="max-w-md text-center">
                <MessageSquareText className="mx-auto h-6 w-6 text-[#a39cb6]" />
                <h3 className="mt-3 text-[13px] font-semibold text-[#4e4769]">Ask about your team reports</h3>
                <p className="mt-1 text-[11px] leading-5 text-[#887f9d]">Try a team summary, blockers, workload overview, project activity, or a question about a specific member.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map(entry => (
                <div key={entry.id} className={cn('flex', entry.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div className={cn(
                    'max-w-[88%] rounded-[8px] border px-3.5 py-3 sm:max-w-[76%]',
                    entry.role === 'user'
                      ? 'border-[#d9d3ed] bg-[#f0eef8] text-[#4d4669]'
                      : 'border-[#e7e5eb] bg-white text-[#554e6f]',
                  )}>
                    <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[.03em] text-[#8a839a]">
                      {entry.role === 'user' ? 'You' : 'Assistant'}
                    </div>
                    {entry.role === 'assistant' ? (
                      <div className="text-[12px] leading-5">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h3: ({ children }) => <h3 className="mb-1.5 mt-3 text-[12px] font-semibold text-[#3c3374] first:mt-0">{children}</h3>,
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            strong: ({ children }) => <strong className="font-semibold text-[#4e4769]">{children}</strong>,
                            ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-4 last:mb-0">{children}</ul>,
                            li: ({ children }) => <li>{children}</li>,
                          }}
                        >
                          {entry.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap text-[12px] leading-5">{entry.content}</p>
                    )}
                    {entry.role === 'assistant' && entry.reportsUsed !== undefined && (
                      <p className="mt-2 border-t border-[#ece9f0] pt-2 text-[10px] text-[#938ca2]">
                        {entry.reportsUsed} {entry.reportsUsed === 1 ? 'report' : 'reports'} used
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {sending && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-[8px] border border-[#e7e5eb] bg-white px-3.5 py-3 text-[11px] text-[#817a92]">
                    <LoaderCircle className="h-3.5 w-3.5 animate-spin text-[#594dba]" />
                    Reviewing submitted reports…
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-[#e7e5eb] bg-white px-4 py-4 sm:px-5">
          {error && <div className="mb-2.5 rounded-[6px] border border-[#f2d6da] bg-[#fff7f8] px-3 py-2 text-[11px] text-[#c34d5c]">{error}</div>}

          <div className="flex items-end gap-2">
            <textarea
              value={message}
              onChange={event => setMessage(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  void send();
                }
              }}
              rows={1}
              maxLength={2000}
              disabled={sending}
              placeholder="Ask about team activity, blockers, workload or projects…"
              aria-label="Ask the AI assistant"
              className="min-h-[38px] max-h-28 flex-1 resize-y rounded-[7px] border border-[#d9d8e0] bg-white px-3 py-2.5 text-[12px] leading-5 text-[#4e4769] outline-none transition placeholder:text-[#aaa4b6] focus:border-[#8878c1] focus:ring-2 focus:ring-[#8878c1]/10 disabled:bg-[#f7f6f9]"
            />
            <button
              type="button"
              onClick={() => void send()}
              disabled={sending || !message.trim()}
              aria-label="Send message"
              title="Send"
              className="inline-flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[7px] border border-[#594dba] bg-[#594dba] text-white transition hover:bg-[#463c98] disabled:cursor-not-allowed disabled:border-[#c5c0d5] disabled:bg-[#c5c0d5]"
            >
              {sending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-2 text-[10px] text-[#9b95a8]">Enter sends · Shift+Enter adds a new line · Submitted report data only</p>
        </div>
      </Card>
    </>
  );
}
