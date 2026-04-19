'use client';

import { useState } from 'react';
import Link from 'next/link';

interface CaseCardProps {
  caseData: {
    id: string;
    title: string;
    difficulty: string;
    is_free: boolean;
    story_intro: string;
    order_index: number;
  };
  progress?: {
    case_id: string;
    status: string;
    points_remaining: number;
  } | undefined;
  isLocked: boolean;
  userId: string;
}

export default function CaseCard({ caseData, progress, isLocked }: CaseCardProps) {
  const [expanded, setExpanded] = useState(false);

  const statusLabel = isLocked
    ? 'Locked'
    : progress?.status === 'completed'
    ? 'Completed'
    : progress?.status === 'active'
    ? 'Active'
    : 'Unsolved';

  const difficultyBadge = `badge-${caseData.difficulty}` as const;

  return (
    <div
      className={`border transition-all duration-300 ${
        isLocked
          ? 'border-noir-600 bg-noir-800/30 opacity-70'
          : progress?.status === 'completed'
          ? 'border-green-800/50 bg-noir-800'
          : 'border-noir-600 bg-noir-800 hover:border-crimson-800/60'
      }`}
    >
      {/* Header row */}
      <button
        onClick={() => !isLocked && setExpanded((v) => !v)}
        className="w-full text-left px-5 py-4 flex items-center justify-between gap-4"
        disabled={isLocked}
      >
        <div className="flex items-center gap-4 min-w-0">
          <span className="font-mono text-crimson-700 text-sm tabular-nums shrink-0">
            #{String(caseData.order_index).padStart(2, '0')}
          </span>
          <h3 className="font-serif text-lg text-noir-50 truncate">{caseData.title}</h3>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`badge ${difficultyBadge}`}>{caseData.difficulty}</span>

          {isLocked ? (
            <span className="badge badge-locked">🔒 Locked</span>
          ) : progress?.status === 'completed' ? (
            <span className="badge badge-completed">Solved</span>
          ) : progress?.status === 'active' ? (
            <span className="badge badge-active">Active</span>
          ) : (
            <span className="badge badge-free">Open</span>
          )}

          {!isLocked && (
            <span className="text-noir-500 text-xs ml-1">{expanded ? '▲' : '▼'}</span>
          )}
        </div>
      </button>

      {/* Expanded details */}
      {expanded && !isLocked && (
        <div className="border-t border-noir-700 px-5 py-4 animate-fade-in">
          <p className="text-noir-300 text-sm leading-relaxed mb-4 line-clamp-3">
            {caseData.story_intro}
          </p>

          {progress?.status === 'active' && (
            <p className="font-mono text-xs text-gold-600 mb-3">
              ⚡ {progress.points_remaining} Detective Points remaining
            </p>
          )}

          <div className="flex items-center gap-3">
            {progress?.status === 'completed' ? (
              <Link
                href={`/case/${caseData.id}/investigate`}
                className="btn btn-secondary btn-sm"
              >
                Review Case
              </Link>
            ) : progress?.status === 'active' ? (
              <Link
                href={`/case/${caseData.id}/investigate`}
                className="btn btn-primary btn-sm"
              >
                Continue Investigation →
              </Link>
            ) : (
              <Link
                href={`/case/${caseData.id}`}
                className="btn btn-primary btn-sm"
              >
                Start Investigating →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Locked overlay CTA */}
      {isLocked && (
        <div className="border-t border-noir-700 px-5 py-3 flex items-center justify-between">
          <p className="text-noir-500 text-xs font-mono">
            Requires full access to unlock
          </p>
          <Link href="/payment" className="btn btn-gold btn-sm">
            Unlock
          </Link>
        </div>
      )}
    </div>
  );
}
