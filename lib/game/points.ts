import type { TaskType } from '@/lib/types/game';
import { TASK_CONFIGS, CLUE_COST, INITIAL_POINTS } from '@/lib/types/game';

export function getTaskCost(taskType: TaskType): number {
  return TASK_CONFIGS[taskType]?.pointCost ?? 0;
}

export function canAffordTask(points: number, taskType: TaskType): boolean {
  return points >= getTaskCost(taskType);
}

export function canAffordClue(points: number): boolean {
  return points >= CLUE_COST;
}

export function isGameOver(points: number): boolean {
  return points <= 0;
}

export function calculateFactBonus(relevanceScore: number): number {
  if (relevanceScore >= 0.8) return 2;
  if (relevanceScore >= 0.5) return 1;
  return 0;
}

export function applyTaskCost(currentPoints: number, taskType: TaskType): number {
  return Math.max(0, currentPoints - getTaskCost(taskType));
}

export function applyFactBonus(currentPoints: number, relevanceScore: number): number {
  return currentPoints + calculateFactBonus(relevanceScore);
}

export function applyInterrogationFactBonus(currentPoints: number, factsCount: number): number {
  return currentPoints + factsCount;
}

export { INITIAL_POINTS, CLUE_COST };
