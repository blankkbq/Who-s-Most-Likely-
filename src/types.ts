import { CategoryId, Question } from './game/questions';
import { Player, VoteTally } from './game/rules';

export interface RoomClientState {
  code: string;
  hostId: string;
  category: CategoryId | 'random';
  timerDuration: number;
  status: 'lobby' | 'voting' | 'results' | 'ended';
  players: Player[];
  currentQuestionIndex: number;
  currentQuestion: Question | null;
  totalQuestions: number;
  votedPlayerIds: string[];
  votes: Record<string, string>; // voterId -> targetPlayerId (present in results)
  lastTally: VoteTally | null;
  commentary: string | null;
  roundEndTime: number | null;
}

export type ViewScreen =
  | 'landing'
  | 'lobby'
  | 'voting'
  | 'results'
  | 'quickplay'
  | 'categories'
  | 'rules'
  | 'privacy'
  | 'terms'
  | 'contact';

export const EMOJI_AVATARS = [
  '😎', '🦄', '🚀', '👑', '🍕', '🦊', '🥑', '🎧', 
  '🌮', '🦁', '🔥', '👾', '🌈', '🐼', '⚡', '🧁', 
  '🐱', '🐶', '🎯', '🎸', '🌟', '🍩', '🐵', '💎'
];
