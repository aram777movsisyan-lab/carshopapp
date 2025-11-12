'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';

interface ConversationSummary {
  id: string;
  title: string;
  preview: string;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

interface MessagesClientProps {
  conversations: ConversationSummary[];
  initialConversationId?: string | null;
}

export function MessagesClient({ conversations, initialConversationId }: MessagesClientProps) {
  const [activeId, setActiveId] = useState<string | null>(initialConversationId ?? conversations[0]?.id ?? null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const activeConversation = useMemo(() => conversations.find((c) => c.id === activeId) ?? null, [activeId, conversations]);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    async function loadMessages() {
      const response = await fetch(`/api/conversations/${activeId}/messages`, { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      if (!cancelled) {
        setMessages(data.data?.messages ?? data.messages ?? []);
      }
    }
    loadMessages();
    return () => {
      cancelled = true;
    };
  }, [activeId]);

  async function sendMessage() {
    if (!input.trim() || !activeId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/conversations/${activeId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: input.trim() })
      });
      const data = await response.json();
      if (response.ok) {
        setMessages((prev) => [...prev, data.data?.message ?? data.message]);
        setInput('');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-6">
      <aside className="w-64 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900">Conversations</h2>
        <ul className="mt-3 space-y-2 text-sm text-gray-600">
          {conversations.length === 0 && <li>No conversations yet.</li>}
          {conversations.map((conversation) => (
            <li key={conversation.id}>
              <button
                type="button"
                onClick={() => setActiveId(conversation.id)}
                className={`w-full rounded-lg px-3 py-2 text-left transition ${
                  activeId === conversation.id ? 'bg-brand-50 text-brand-700' : 'hover:bg-gray-100'
                }`}
              >
                <p className="font-semibold text-gray-900">{conversation.title}</p>
                <p className="text-xs text-gray-500 line-clamp-2">{conversation.preview}</p>
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <section className="flex-1 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {activeConversation ? (
          <div className="flex h-full flex-col">
            <h2 className="text-lg font-semibold text-gray-900">{activeConversation.title}</h2>
            <div className="mt-4 flex-1 space-y-4 overflow-y-auto border border-gray-100 p-4">
              {messages.length === 0 && <p className="text-sm text-gray-500">No messages yet.</p>}
              {messages.map((message) => (
                <div key={message.id} className="rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
                  <p>{message.content}</p>
                  <p className="mt-1 text-xs text-gray-400">{new Date(message.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <textarea
                className="flex-1"
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Write a message"
              />
              <Button onClick={sendMessage} loading={loading}>
                Send
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-600">Select a conversation to start messaging.</p>
        )}
      </section>
    </div>
  );
}
