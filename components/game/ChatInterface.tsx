'use client';

import { useState, useEffect, useRef } from 'react';
import type { Fact } from '@/lib/types/database';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

interface Props {
  caseId: string;
  character: string;
  characterId: string;
  userId: string;
  onPointsUpdate: (pts: number) => void;
  onNewFact: (fact: Fact) => void;
}

export default function ChatInterface({
  caseId,
  character,
  characterId,
  onPointsUpdate,
  onNewFact,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load chat history when character changes
  useEffect(() => {
    setMessages([]);
    setLoadingHistory(true);

    fetch(`/api/game/chat-history?caseId=${caseId}&character=${encodeURIComponent(character)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.messages) {
          setMessages(
            data.messages.map((m: { role: string; message: string }) => ({
              role: m.role as 'user' | 'ai',
              content: m.message,
            }))
          );
        }
      })
      .finally(() => setLoadingHistory(false));
  }, [caseId, character]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setLoading(true);

    try {
      const res = await fetch('/api/game/interrogate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId,
          characterId,
          character,
          message: text,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Interrogation failed');

      setMessages((prev) => [...prev, { role: 'ai', content: data.response }]);
      onPointsUpdate(data.pointsRemaining);

      if (data.newFacts?.length) {
        data.newFacts.forEach((f: Fact) => onNewFact(f));
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: '[No response — the witness has gone silent.]' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-noir-700 px-5 py-3 bg-noir-800/50 shrink-0">
        <p className="font-mono text-xs uppercase tracking-widest text-crimson-600">
          Interrogating
        </p>
        <h3 className="font-serif text-lg text-noir-50">{character}</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {loadingHistory ? (
          <p className="text-noir-500 text-xs font-mono text-center pt-8">
            Loading conversation…
          </p>
        ) : messages.length === 0 ? (
          <div className="text-center pt-12">
            <p className="text-noir-500 text-sm font-serif italic">
              Ask {character} about the case…
            </p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}
              >
                {msg.role === 'ai' && (
                  <p className="font-mono text-xs text-crimson-600 mb-1">{character}</p>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="chat-bubble-ai">
              <p className="font-mono text-xs text-crimson-600 mb-1">{character}</p>
              <div className="flex gap-1 py-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 bg-noir-400 rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="border-t border-noir-700 p-4 flex gap-3 bg-noir-800/50 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask ${character} about the case…`}
          className="input flex-1"
          disabled={loading}
          maxLength={500}
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="btn btn-primary shrink-0"
        >
          Ask
        </button>
      </form>
    </div>
  );
}
