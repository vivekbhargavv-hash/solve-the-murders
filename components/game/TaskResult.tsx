'use client';

import type { Fact } from '@/lib/types/database';

interface Props {
  loading: boolean;
  data: {
    narrative: string;
    newFacts: Fact[];
    pointsEarned: number;
    redHerring?: string;
  } | null;
}

export default function TaskResult({ loading, data }: Props) {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-crimson-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-mono text-xs text-noir-500 uppercase tracking-widest">
            Working the case…
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex-1 overflow-y-auto p-6 animate-fade-in">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Narrative */}
        <div>
          <p className="label mb-2">Field Report</p>
          <div className="card border-noir-600">
            <p className="font-serif text-noir-200 leading-relaxed whitespace-pre-wrap">
              {data.narrative}
            </p>
          </div>
        </div>

        {/* New facts */}
        {data.newFacts.length > 0 && (
          <div>
            <p className="label mb-2">
              Facts Discovered{' '}
              {data.pointsEarned > 0 && (
                <span className="text-gold-500 normal-case">
                  +{data.pointsEarned} pts
                </span>
              )}
            </p>
            <div className="space-y-2">
              {data.newFacts.map((f) => (
                <div key={f.id} className="fact-item">
                  <p className="text-sm">{f.fact_text}</p>
                  <p className="font-mono text-xs text-noir-500 mt-0.5">
                    Source: {f.source} · Relevance:{' '}
                    <span
                      className={
                        f.relevance_score >= 0.8
                          ? 'text-crimson-400'
                          : f.relevance_score >= 0.5
                          ? 'text-gold-500'
                          : 'text-noir-400'
                      }
                    >
                      {f.relevance_score >= 0.8
                        ? 'High'
                        : f.relevance_score >= 0.5
                        ? 'Medium'
                        : 'Low'}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Red herring */}
        {data.redHerring && (
          <div className="bg-noir-800 border border-noir-600 px-4 py-3">
            <p className="font-mono text-xs text-noir-500 uppercase tracking-widest mb-1">
              Unverified Lead
            </p>
            <p className="text-noir-400 text-sm italic font-serif">{data.redHerring}</p>
          </div>
        )}
      </div>
    </div>
  );
}
