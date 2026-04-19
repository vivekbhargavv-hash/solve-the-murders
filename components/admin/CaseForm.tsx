'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Case } from '@/lib/types/database';

interface Props {
  initialData?: Partial<Case>;
}

export default function CaseForm({ initialData }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: initialData?.title ?? '',
    difficulty: initialData?.difficulty ?? 'easy',
    is_free: initialData?.is_free ?? true,
    order_index: initialData?.order_index ?? 1,
    setting: initialData?.setting ?? '',
    victim_name: initialData?.victim_name ?? '',
    victim_description: initialData?.victim_description ?? '',
    story_intro: initialData?.story_intro ?? '',
    solution_killer: initialData?.solution_killer ?? '',
    solution_motive: initialData?.solution_motive ?? '',
    solution_method: initialData?.solution_method ?? '',
  });

  function set(field: string, value: string | boolean | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const url = initialData?.id ? `/api/admin/cases/${initialData.id}` : '/api/admin/cases';
    const method = initialData?.id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? 'Failed to save');
      setLoading(false);
      return;
    }

    router.push('/admin/cases');
    router.refresh();
  }

  const fields: { key: keyof typeof form; label: string; type?: string; rows?: number }[] = [
    { key: 'title', label: 'Case Title' },
    { key: 'setting', label: 'Setting / Location' },
    { key: 'victim_name', label: 'Victim Name' },
    { key: 'victim_description', label: 'Victim Description', rows: 2 },
    { key: 'story_intro', label: 'Story Introduction', rows: 5 },
    { key: 'solution_killer', label: '🔒 Solution: Killer Name' },
    { key: 'solution_motive', label: '🔒 Solution: Motive', rows: 2 },
    { key: 'solution_method', label: '🔒 Solution: Method / Weapon', rows: 2 },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      {error && (
        <div className="bg-crimson-950/50 border border-crimson-800 text-crimson-300 px-3 py-2 text-sm font-mono">
          {error}
        </div>
      )}

      {fields.map(({ key, label, rows }) => (
        <div key={key}>
          <label className="label">{label}</label>
          {rows ? (
            <textarea
              value={String(form[key])}
              onChange={(e) => set(key, e.target.value)}
              rows={rows}
              className="input resize-y"
              required
            />
          ) : (
            <input
              type="text"
              value={String(form[key])}
              onChange={(e) => set(key, e.target.value)}
              className="input"
              required
            />
          )}
        </div>
      ))}

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="label">Difficulty</label>
          <select
            value={form.difficulty}
            onChange={(e) => set('difficulty', e.target.value)}
            className="input"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div>
          <label className="label">Order Index</label>
          <input
            type="number"
            value={form.order_index}
            onChange={(e) => set('order_index', parseInt(e.target.value))}
            min={1}
            className="input"
          />
        </div>

        <div>
          <label className="label">Access</label>
          <select
            value={form.is_free ? 'free' : 'premium'}
            onChange={(e) => set('is_free', e.target.value === 'free')}
            className="input"
          >
            <option value="free">Free</option>
            <option value="premium">Premium</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn btn-ghost"
        >
          Cancel
        </button>
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Saving…' : initialData?.id ? 'Update Case' : 'Create Case'}
        </button>
      </div>
    </form>
  );
}
