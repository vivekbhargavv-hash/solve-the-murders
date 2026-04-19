'use client';

import type { Fact } from '@/lib/types/database';

interface Props {
  facts: Fact[];
  onClose: () => void;
}

export default function FactsPanel({ facts, onClose }: Props) {
  return (
    <div className="flex-1 overflow-y-auto p-5 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-xl text-noir-50">Discovered Facts</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm">✕ Close</button>
        </div>

        {facts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-noir-500 text-sm font-serif italic">
              No facts discovered yet. Interrogate witnesses and run tasks to uncover evidence.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {facts.map((f) => (
              <div key={f.id} className="fact-item">
                <p className="text-sm text-noir-100">{f.fact_text}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="font-mono text-xs text-noir-500">
                    Source: {f.source}
                  </span>
                  <span
                    className={`font-mono text-xs ${
                      f.relevance_score >= 0.8
                        ? 'text-crimson-400'
                        : f.relevance_score >= 0.5
                        ? 'text-gold-500'
                        : 'text-noir-400'
                    }`}
                  >
                    {f.relevance_score >= 0.8
                      ? '★★ High'
                      : f.relevance_score >= 0.5
                      ? '★ Medium'
                      : '○ Low'} relevance
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
