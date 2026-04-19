'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  caseId: string;
}

export default function SuspectForm({ caseId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    role: '',
    description: '',
    personality: '',
    is_killer: false,
    knowledge_base: '{\n  "alibi": "",\n  "relationship_to_victim": "",\n  "timeline": ""\n}',
    hidden_truths: '{\n  "secret": ""\n}',
    reveal_conditions: '{\n  "leverage_required": "3+ relevant facts"\n}',
  });

  function set(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Validate JSON fields
    for (const key of ['knowledge_base', 'hidden_truths', 'reveal_conditions'] as const) {
      try {
        JSON.parse(form[key]);
      } catch {
        setError(`Invalid JSON in ${key}`);
        return;
      }
    }

    setLoading(true);

    const res = await fetch('/api/admin/suspects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        case_id: caseId,
        knowledge_base: JSON.parse(form.knowledge_base),
        hidden_truths: JSON.parse(form.hidden_truths),
        reveal_conditions: JSON.parse(form.reveal_conditions),
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? 'Failed to save');
      setLoading(false);
      return;
    }

    router.refresh();
    setForm({
      name: '',
      role: '',
      description: '',
      personality: '',
      is_killer: false,
      knowledge_base: '{\n  "alibi": "",\n  "relationship_to_victim": "",\n  "timeline": ""\n}',
      hidden_truths: '{\n  "secret": ""\n}',
      reveal_conditions: '{\n  "leverage_required": "3+ relevant facts"\n}',
    });
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      {error && (
        <div className="bg-crimson-950/50 border border-crimson-800 text-crimson-300 px-3 py-2 text-sm font-mono">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            className="input"
            required
          />
        </div>
        <div>
          <label className="label">Role</label>
          <input
            type="text"
            value={form.role}
            onChange={(e) => set('role', e.target.value)}
            className="input"
            placeholder="e.g. Business Partner, Police Officer"
            required
          />
        </div>
      </div>

      <div>
        <label className="label">Description (shown to player)</label>
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          rows={2}
          className="input resize-y"
          required
        />
      </div>

      <div>
        <label className="label">Personality (AI guidance)</label>
        <textarea
          value={form.personality}
          onChange={(e) => set('personality', e.target.value)}
          rows={2}
          className="input resize-y"
          placeholder="e.g. Nervous, evasive, speaks in short sentences..."
          required
        />
      </div>

      <div>
        <label className="label">Knowledge Base (JSON)</label>
        <textarea
          value={form.knowledge_base}
          onChange={(e) => set('knowledge_base', e.target.value)}
          rows={6}
          className="input font-mono text-xs resize-y"
          required
        />
      </div>

      <div>
        <label className="label">Hidden Truths (JSON — server-only context)</label>
        <textarea
          value={form.hidden_truths}
          onChange={(e) => set('hidden_truths', e.target.value)}
          rows={4}
          className="input font-mono text-xs resize-y"
          required
        />
      </div>

      <div>
        <label className="label">Reveal Conditions (JSON)</label>
        <textarea
          value={form.reveal_conditions}
          onChange={(e) => set('reveal_conditions', e.target.value)}
          rows={3}
          className="input font-mono text-xs resize-y"
          required
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          id="is_killer"
          type="checkbox"
          checked={form.is_killer}
          onChange={(e) => set('is_killer', e.target.checked)}
          className="w-4 h-4 accent-crimson-600"
        />
        <label htmlFor="is_killer" className="font-mono text-sm text-crimson-400 uppercase tracking-wider">
          This character IS the killer
        </label>
      </div>

      <button type="submit" disabled={loading} className="btn btn-primary">
        {loading ? 'Saving…' : 'Add Character'}
      </button>
    </form>
  );
}
