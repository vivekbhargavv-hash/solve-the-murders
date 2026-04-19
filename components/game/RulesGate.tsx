'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { INITIAL_POINTS } from '@/lib/types/game';

interface Props {
  caseData: {
    id: string;
    title: string;
    story_intro: string;
    victim_name: string;
    victim_description: string;
    setting: string;
    difficulty: string;
  };
  userId: string;
}

export default function RulesGate({ caseData }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'intro' | 'rules'>('intro');

  async function startInvestigation() {
    setLoading(true);
    try {
      const res = await fetch('/api/game/start-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId: caseData.id }),
      });
      if (!res.ok) throw new Error('Failed to start case');
      router.push(`/case/${caseData.id}/investigate`);
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="animate-slide-up">
      {step === 'intro' ? (
        <div className="card border-noir-600">
          <p className="font-mono text-xs uppercase tracking-widest text-crimson-600 mb-3">
            Case File
          </p>
          <h1 className="font-serif text-3xl text-noir-50 mb-2">{caseData.title}</h1>
          <p className="font-mono text-xs text-noir-500 mb-4">
            Setting: {caseData.setting} &nbsp;·&nbsp; Difficulty:{' '}
            <span className={`${caseData.difficulty === 'hard' ? 'text-crimson-400' : caseData.difficulty === 'medium' ? 'text-gold-500' : 'text-green-400'}`}>
              {caseData.difficulty}
            </span>
          </p>

          <div className="border-l-2 border-crimson-800 pl-4 mb-6">
            <p className="font-serif text-noir-200 leading-relaxed">
              {caseData.story_intro}
            </p>
          </div>

          <div className="bg-noir-700 border border-noir-600 p-4 mb-6">
            <p className="font-mono text-xs text-noir-400 uppercase tracking-widest mb-1">Victim</p>
            <p className="text-noir-100 font-serif text-lg">{caseData.victim_name}</p>
            <p className="text-noir-300 text-sm">{caseData.victim_description}</p>
          </div>

          <button onClick={() => setStep('rules')} className="btn btn-primary w-full">
            Proceed to Rules →
          </button>
        </div>
      ) : (
        <div className="card border-noir-600 animate-fade-in">
          <p className="font-mono text-xs uppercase tracking-widest text-crimson-600 mb-3">
            Rules of the Game
          </p>
          <h2 className="font-serif text-2xl text-noir-50 mb-6">Before You Begin</h2>

          <div className="space-y-4 mb-8">
            {[
              {
                n: '01',
                rule: `You start with ${INITIAL_POINTS} Detective Points.`,
                detail: 'Every action costs points. Manage them carefully.',
              },
              {
                n: '02',
                rule: 'Interrogating suspects can earn you points.',
                detail: 'Extracting a valid fact adds +1 point. High-relevance facts add +2.',
              },
              {
                n: '03',
                rule: 'Tasks cost points.',
                detail: 'Check alibis (–1) · Check records (–2) · Investigate scene (–3) · Tail suspect (–3)',
              },
              {
                n: '04',
                rule: 'Get Clue costs 2 points.',
                detail: "Use it when you're stuck. It won't name the killer directly.",
              },
              {
                n: '05',
                rule: 'You get ONE chance to solve the murder.',
                detail: 'Name the killer, the motive, and the method. Get it right — or the case goes cold.',
              },
              {
                n: '06',
                rule: 'If points reach zero, only the solve remains.',
                detail: 'All other actions are disabled. You must submit your answer.',
              },
            ].map(({ n, rule, detail }) => (
              <div key={n} className="flex gap-4">
                <span className="font-mono text-crimson-700 text-sm shrink-0 tabular-nums w-6">
                  {n}
                </span>
                <div>
                  <p className="text-noir-100 text-sm font-semibold">{rule}</p>
                  <p className="text-noir-400 text-xs">{detail}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-crimson-950/40 border border-crimson-900 p-3 mb-6">
            <p className="font-mono text-xs text-crimson-400 text-center">
              ⚠ This case cannot be unstarted once begun.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('intro')}
              className="btn btn-ghost flex-1"
            >
              ← Back
            </button>
            <button
              onClick={startInvestigation}
              disabled={loading}
              className="btn btn-primary flex-1"
            >
              {loading ? 'Opening case file…' : 'Start Investigating'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
