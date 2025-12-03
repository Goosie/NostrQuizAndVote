import { PlayerScore } from './nostr';

export interface GameSession {
  id: string;
  quizId: string;
  pin: string;
  hostPubkey: string;
  players: Player[];
  currentQuestionIndex: number;
  status: GameStatus;
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
}

export interface Player {
  id: string;
  nickname: string;
  pubkey?: string | null;
  joinedAt: Date;
  score: number;
  answers: PlayerAnswer[];
}

export interface PlayerAnswer {
  questionIndex: number;
  answerIndex: number;
  timeMs: number;
  isCorrect: boolean;
  points: number;
}

export type GameStatus = 
  | "waiting"    // waiting for players to join
  | "active"     // game is active
  | "finished";  // game completed

export interface GameState {
  session?: GameSession;
  currentPlayer?: Player;
  timeLeft: number;
  leaderboard: PlayerScore[];
}