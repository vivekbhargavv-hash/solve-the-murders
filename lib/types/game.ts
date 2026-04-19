import type { Case, Suspect, Fact, ChatLog, UserCaseProgress } from './database';

export type TaskType =
  | 'question_suspects'
  | 'check_alibis'
  | 'check_records'
  | 'investigate_scene'
  | 'tail_suspect';

export type QuestionTarget =
  | 'first_witness'
  | 'police'
  | 'coroner'
  | 'ballistics'
  | 'suspect';

export interface TaskConfig {
  type: TaskType;
  label: string;
  pointCost: number;
  description: string;
}

export const TASK_CONFIGS: Record<TaskType, TaskConfig> = {
  question_suspects: {
    type: 'question_suspects',
    label: 'Question Suspects & Police',
    pointCost: 0,
    description: 'Interrogate witnesses and persons of interest.',
  },
  check_alibis: {
    type: 'check_alibis',
    label: 'Check Alibis',
    pointCost: 1,
    description: 'Verify the whereabouts of suspects.',
  },
  check_records: {
    type: 'check_records',
    label: 'Check Records',
    pointCost: 2,
    description: 'Search public records, financial documents, or prior offences.',
  },
  investigate_scene: {
    type: 'investigate_scene',
    label: 'Investigate the Scene',
    pointCost: 3,
    description: 'Conduct a detailed sweep of the crime scene.',
  },
  tail_suspect: {
    type: 'tail_suspect',
    label: 'Tail a Suspect',
    pointCost: 3,
    description: 'Follow a suspect covertly to gather intelligence.',
  },
};

export const QUESTION_TARGETS: Record<QuestionTarget, { label: string; isSpecific: boolean }> = {
  first_witness: { label: 'First Witness', isSpecific: false },
  police: { label: 'Police', isSpecific: false },
  coroner: { label: 'Coroner', isSpecific: false },
  ballistics: { label: 'Ballistics Expert', isSpecific: false },
  suspect: { label: 'Suspect', isSpecific: true },
};

export const INITIAL_POINTS = 25;
export const CLUE_COST = 2;

export interface GameState {
  progress: UserCaseProgress;
  caseData: Case;
  suspects: Suspect[];
  facts: Fact[];
  chatHistory: ChatLog[];
}

export interface ChatMessage {
  role: 'user' | 'ai';
  message: string;
  character: string;
}

export interface TaskResult {
  narrative: string;
  facts: ExtractedFact[];
  pointsEarned: number;
  redHerring?: string;
}

export interface ExtractedFact {
  fact_text: string;
  source: string;
  relevance_score: number;
}

export interface SolveSubmission {
  killer_suspect_id: string;
  motive: string;
  method: string;
}

export interface SolveResult {
  correct: boolean;
  killer_correct: boolean;
  motive_correct: boolean;
  method_correct: boolean;
  explanation: string;
  points_earned?: number;
}

export interface ClueResult {
  hint: string;
  category: 'suspect' | 'motive' | 'method' | 'timeline' | 'location';
}

// Structured interrogation context passed to AI
export interface InterrogationContext {
  caseTitle: string;
  caseIntro: string;
  victimName: string;
  victimDescription: string;
  character: {
    name: string;
    role: string;
    personality: string;
    knowledgeBase: Record<string, unknown>;
    hiddenTruths: Record<string, unknown>;
    revealConditions: Record<string, unknown>;
    isKiller: boolean;
  };
  discoveredFacts: string[];
  chatHistory: { role: 'user' | 'assistant'; content: string }[];
  userQuestion: string;
}
