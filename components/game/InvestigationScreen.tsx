'use client';

import { useState, useCallback } from 'react';
import type { UserCaseProgress, Fact } from '@/lib/types/database';
import type { TaskType, QuestionTarget } from '@/lib/types/game';
import { TASK_CONFIGS, QUESTION_TARGETS } from '@/lib/types/game';
import ChatInterface from './ChatInterface';
import TaskResult from './TaskResult';
import FactsPanel from './FactsPanel';
import SuspectsList from './SuspectsList';
import SolveModal from './SolveModal';
import PointsDisplay from './PointsDisplay';

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
  progress: UserCaseProgress;
  suspects: { id: string; name: string; role: string; description: string }[];
  facts: Fact[];
  userId: string;
}

type PanelView = 'facts' | 'people' | null;
type MainView = 'chat' | 'task' | null;

export default function InvestigationScreen({
  caseData,
  progress: initialProgress,
  suspects,
  facts: initialFacts,
  userId,
}: Props) {
  const [progress, setProgress] = useState(initialProgress);
  const [facts, setFacts] = useState(initialFacts);
  const [selectedTask, setSelectedTask] = useState<TaskType | ''>('');
  const [selectedTarget, setSelectedTarget] = useState<QuestionTarget | ''>('');
  const [selectedSuspectId, setSelectedSuspectId] = useState('');
  const [sidePanel, setSidePanel] = useState<PanelView>(null);
  const [mainView, setMainView] = useState<MainView>(null);
  const [taskLoading, setTaskLoading] = useState(false);
  const [taskResultData, setTaskResultData] = useState<{
    narrative: string;
    newFacts: Fact[];
    pointsEarned: number;
    redHerring?: string;
  } | null>(null);
  const [clueLoading, setClueLoading] = useState(false);
  const [clueText, setClueText] = useState('');
  const [showSolve, setShowSolve] = useState(false);
  const [error, setError] = useState('');

  const isCompleted = progress.status === 'completed';
  const isGameOver = progress.points_remaining <= 0;

  // Current interrogation character name
  const activeSuspect = suspects.find((s) => s.id === selectedSuspectId);
  const activeCharacterName =
    selectedTarget === 'suspect' && activeSuspect
      ? activeSuspect.name
      : selectedTarget
      ? QUESTION_TARGETS[selectedTarget]?.label ?? ''
      : '';

  const handleRunTask = useCallback(async () => {
    if (!selectedTask || selectedTask === 'question_suspects') return;
    setError('');
    setTaskLoading(true);
    setMainView('task');

    try {
      const res = await fetch('/api/game/run-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: caseData.id,
          taskType: selectedTask,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Task failed');

      setTaskResultData({
        narrative: data.narrative,
        newFacts: data.newFacts ?? [],
        pointsEarned: data.pointsEarned ?? 0,
        redHerring: data.redHerring,
      });

      setProgress((p) => ({ ...p, points_remaining: data.pointsRemaining }));
      if (data.newFacts?.length) {
        setFacts((prev) => [...data.newFacts, ...prev]);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setTaskLoading(false);
    }
  }, [selectedTask, caseData.id]);

  const handleGetClue = useCallback(async () => {
    setError('');
    setClueLoading(true);

    try {
      const res = await fetch('/api/game/get-clue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId: caseData.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to get clue');

      setClueText(data.hint);
      setProgress((p) => ({ ...p, points_remaining: data.pointsRemaining }));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setClueLoading(false);
    }
  }, [caseData.id]);

  const handleStartInterrogation = () => {
    if (!selectedTarget) return;
    if (selectedTarget === 'suspect' && !selectedSuspectId) return;
    setMainView('chat');
    setSidePanel(null);
  };

  const taskCost = selectedTask ? TASK_CONFIGS[selectedTask as TaskType]?.pointCost ?? 0 : 0;
  const canAffordTask = progress.points_remaining >= taskCost;

  return (
    <div className="h-[calc(100vh-56px)] flex overflow-hidden relative">
      {/* ── LEFT PANEL ──────────────────────────────────── */}
      <aside className="w-64 shrink-0 border-r border-noir-700 bg-noir-800 flex flex-col overflow-y-auto">
        <div className="p-4 border-b border-noir-700">
          <p className="font-mono text-xs uppercase tracking-widest text-crimson-600 mb-1">
            Case
          </p>
          <h2 className="font-serif text-sm text-noir-100 leading-snug">{caseData.title}</h2>
          <p className="font-mono text-xs text-noir-500 mt-0.5">
            Victim: {caseData.victim_name}
          </p>
        </div>

        {/* Side panel toggles */}
        <div className="p-3 border-b border-noir-700 space-y-2">
          <button
            onClick={() => setSidePanel(sidePanel === 'facts' ? null : 'facts')}
            className={`btn btn-secondary w-full btn-sm ${sidePanel === 'facts' ? 'border-crimson-600 text-crimson-400' : ''}`}
          >
            📋 Facts ({facts.length})
          </button>
          <button
            onClick={() => setSidePanel(sidePanel === 'people' ? null : 'people')}
            className={`btn btn-secondary w-full btn-sm ${sidePanel === 'people' ? 'border-crimson-600 text-crimson-400' : ''}`}
          >
            👥 Key People ({suspects.length})
          </button>
        </div>

        {/* Task selection */}
        <div className="p-3 border-b border-noir-700 space-y-3">
          <p className="label">Task</p>

          <select
            value={selectedTask}
            onChange={(e) => {
              setSelectedTask(e.target.value as TaskType | '');
              setSelectedTarget('');
              setSelectedSuspectId('');
              setMainView(null);
              setTaskResultData(null);
            }}
            disabled={isCompleted || isGameOver}
            className="input text-xs"
          >
            <option value="">— Select task —</option>
            {Object.values(TASK_CONFIGS).map((t) => (
              <option key={t.type} value={t.type}>
                {t.label} {t.pointCost > 0 ? `(−${t.pointCost})` : '(interrogate)'}
              </option>
            ))}
          </select>

          {/* Sub-dropdown for interrogation */}
          {selectedTask === 'question_suspects' && (
            <>
              <select
                value={selectedTarget}
                onChange={(e) => {
                  setSelectedTarget(e.target.value as QuestionTarget);
                  setSelectedSuspectId('');
                }}
                className="input text-xs"
              >
                <option value="">— Select person —</option>
                {Object.entries(QUESTION_TARGETS).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>

              {selectedTarget === 'suspect' && (
                <select
                  value={selectedSuspectId}
                  onChange={(e) => setSelectedSuspectId(e.target.value)}
                  className="input text-xs"
                >
                  <option value="">— Select suspect —</option>
                  {suspects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              )}

              <button
                onClick={handleStartInterrogation}
                disabled={
                  !selectedTarget ||
                  (selectedTarget === 'suspect' && !selectedSuspectId) ||
                  isCompleted
                }
                className="btn btn-secondary w-full btn-sm"
              >
                Begin Interrogation →
              </button>
            </>
          )}

          {selectedTask && selectedTask !== 'question_suspects' && (
            <button
              onClick={handleRunTask}
              disabled={taskLoading || !canAffordTask || isCompleted || isGameOver}
              className="btn btn-secondary w-full btn-sm"
            >
              {taskLoading
                ? 'Working…'
                : !canAffordTask
                ? `Need ${taskCost} pts`
                : `Run Task (−${taskCost} pts)`}
            </button>
          )}
        </div>

        {/* Get Clue */}
        <div className="p-3 border-b border-noir-700">
          <button
            onClick={handleGetClue}
            disabled={clueLoading || progress.points_remaining < 2 || isCompleted}
            className="btn btn-ghost w-full btn-sm text-gold-500 hover:text-gold-400"
          >
            {clueLoading ? 'Thinking…' : '💡 Get Clue (−2 pts)'}
          </button>

          {clueText && (
            <div className="mt-2 bg-gold-900/20 border border-gold-800/40 p-2 text-xs text-gold-300 font-serif italic">
              "{clueText}"
            </div>
          )}
        </div>

        {/* Points display */}
        <div className="p-3 mt-auto border-t border-noir-700">
          <PointsDisplay points={progress.points_remaining} />
        </div>

        {/* Solve button */}
        <div className="p-3 border-t border-noir-700">
          <button
            onClick={() => setShowSolve(true)}
            disabled={isCompleted && progress.attempts_used > 0}
            className={`btn w-full btn-sm ${isGameOver || isCompleted ? 'btn-primary' : 'btn-secondary'}`}
          >
            {isCompleted ? '📁 Case Closed' : '⚖ Solve the Murder'}
          </button>
        </div>
      </aside>

      {/* ── MAIN PANEL ──────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden bg-noir-900">
        {/* Error banner */}
        {error && (
          <div className="bg-crimson-950/60 border-b border-crimson-800 px-4 py-2 text-crimson-300 text-xs font-mono flex items-center justify-between">
            {error}
            <button onClick={() => setError('')} className="text-crimson-500 hover:text-crimson-300">✕</button>
          </div>
        )}

        {/* Side panel overlay */}
        {sidePanel === 'facts' && (
          <FactsPanel facts={facts} onClose={() => setSidePanel(null)} />
        )}
        {sidePanel === 'people' && (
          <SuspectsList suspects={suspects} onClose={() => setSidePanel(null)} />
        )}

        {/* Main content */}
        {mainView === 'chat' && activeCharacterName && (
          <ChatInterface
            caseId={caseData.id}
            character={activeCharacterName}
            characterId={selectedTarget === 'suspect' ? selectedSuspectId : selectedTarget}
            userId={userId}
            onPointsUpdate={(pts) => setProgress((p) => ({ ...p, points_remaining: pts }))}
            onNewFact={(fact) => setFacts((prev) => [fact, ...prev])}
          />
        )}

        {mainView === 'task' && (
          <TaskResult
            loading={taskLoading}
            data={taskResultData}
          />
        )}

        {mainView === null && (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <div className="text-5xl mb-4 opacity-20">🔍</div>
            <p className="font-mono text-xs uppercase tracking-widest text-noir-600 mb-2">
              Investigation Room
            </p>
            <p className="text-noir-500 text-sm max-w-sm">
              Select a task from the left panel to begin gathering evidence,
              or choose a person to interrogate.
            </p>
            {isGameOver && (
              <div className="mt-6 bg-crimson-950/50 border border-crimson-800 px-6 py-4 max-w-sm">
                <p className="text-crimson-300 font-mono text-sm text-center">
                  ⚠ Detective Points exhausted. Submit your solution or the case goes cold.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Solve modal */}
      {showSolve && (
        <SolveModal
          caseId={caseData.id}
          progressId={progress.id}
          suspects={suspects}
          existingResult={progress.solve_result as Record<string, unknown> | null}
          isCompleted={isCompleted}
          onClose={() => setShowSolve(false)}
        />
      )}
    </div>
  );
}
