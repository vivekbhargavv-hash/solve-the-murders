'use client';

import { useState } from 'react';
import type { SolveResult } from '@/lib/types/game';

interface Props {
  caseId: string;
  progressId: string;
  suspects: { id: string; name: string; role: string }[];
  existingResult: Record<string, unknown> | null;
  isCompleted: boolean;
  onClose: () => void;
}

export default function SolveModal({
  caseId,
  progressId,
  suspects,
  existingResult,
  isCompleted,
  onClose,
}: Props) {
  const [killerId, setKillerId] = useState('');
  const [motive, setMotive] = useState('');
  const [method, setMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SolveResult | null>(
    existingResult ? (existingResult as unknown as SolveResult) : null
  );
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmed) {
      setConfirmed(true);
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/game/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId,
          progressId,
          killerSuspectId: killerId,
          motive,
          method,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to submit solution');

      setResult(data.result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Submission failed');
      setConfirmed(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-noir-950/90 backdrop-blur-sm"
        onClick={!result ? onClose : undefined}
      />

      <div className="relative z-10 w-full max-w-lg card border-noir-500 shadow-glow-red animate-slide-up">
        {/* Header */}
        <div className="border-b border-noir-700 pb-4 mb-5">
          <p className="font-mono text-xs uppercase tracking-widest text-crimson-600 mb-1">
            Final Accusation
          </p>
          <h2 className="font-serif text-2xl text-noir-50">Solve the Murder</h2>
          {!result && !isCompleted && (
            <p className="text-noir-400 text-sm mt-1">
              You have <span className="text-crimson-400 font-semibold">one chance</span> to name the killer.
            </p>
          )}
        </div>

        {/* Result display */}
        {result ? (
          <div className="space-y-4 animate-fade-in">
            <div
              className={`text-center py-4 border ${
                result.correct
                  ? 'border-green-700 bg-green-900/20'
                  : 'border-crimson-800 bg-crimson-950/30'
              }`}
            >
              <p className="text-3xl mb-2">{result.correct ? '✅' : '❌'}</p>
              <p className="font-serif text-xl text-noir-50">
                {result.correct ? 'Case Solved' : 'Wrong Accusation'}
              </p>
            </div>

            <div className="space-y-2">
              {[
                { label: 'Killer', correct: result.killer_correct },
                { label: 'Motive', correct: result.motive_correct },
                { label: 'Method', correct: result.method_correct },
              ].map(({ label, correct }) => (
                <div key={label} className="flex items-center justify-between px-3 py-1.5 bg-noir-700 border border-noir-600">
                  <span className="font-mono text-xs text-noir-300">{label}</span>
                  <span className={`font-mono text-xs ${correct ? 'text-green-400' : 'text-crimson-400'}`}>
                    {correct ? '✓ Correct' : '✗ Incorrect'}
                  </span>
                </div>
              ))}
            </div>

            {result.explanation && (
              <div className="border-l-2 border-crimson-800 pl-4">
                <p className="font-serif text-noir-200 text-sm leading-relaxed italic">
                  "{result.explanation}"
                </p>
              </div>
            )}

            <button onClick={onClose} className="btn btn-secondary w-full">
              Close Case File
            </button>
          </div>
        ) : isCompleted ? (
          <div className="text-center py-6">
            <p className="text-noir-400 text-sm">This case has already been closed.</p>
            <button onClick={onClose} className="btn btn-secondary mt-4">Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-crimson-950/50 border border-crimson-800 text-crimson-300 px-3 py-2 text-sm font-mono">
                {error}
              </div>
            )}

            <div>
              <label className="label">The Killer</label>
              <select
                value={killerId}
                onChange={(e) => setKillerId(e.target.value)}
                required
                className="input"
              >
                <option value="">— Select the murderer —</option>
                {suspects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.role}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">The Motive</label>
              <textarea
                value={motive}
                onChange={(e) => setMotive(e.target.value)}
                required
                rows={2}
                maxLength={300}
                className="input resize-none"
                placeholder="Why did they do it?"
              />
            </div>

            <div>
              <label className="label">The Method / Weapon</label>
              <textarea
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                required
                rows={2}
                maxLength={300}
                className="input resize-none"
                placeholder="How was the victim killed?"
              />
            </div>

            {confirmed && (
              <div className="bg-crimson-950/50 border border-crimson-800 p-3 text-center">
                <p className="text-crimson-300 text-sm font-mono">
                  ⚠ This is your only attempt. Confirm to submit.
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              {!confirmed && (
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-ghost flex-1"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={loading || !killerId || !motive || !method}
                className={`btn flex-1 ${confirmed ? 'btn-primary' : 'btn-secondary'}`}
              >
                {loading
                  ? 'Evaluating…'
                  : confirmed
                  ? '⚖ Submit Final Answer'
                  : 'Make Accusation →'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
