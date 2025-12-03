import { Quiz } from './quiz';
import { PlayerScore } from './nostr';

export interface GameSession {
  id: string;
  quiz: Quiz;
  pin: string;
  hostPubkey: string;
  players: Player[];
  currentQuestionIndex: number;
  status: GameStatus;
  startedAt?: Date;
  endedAt?: Date;
}

export interface Player {
  id: string;
  nickname: string;
  pubkey?: string;
  joinedAt: Date;
  totalScore: number;
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
  | "lobby"      // waiting for players to join
  | "starting"   // host clicked start, transitioning
  | "question"   // showing a question
  | "reveal"     // showing answer/scores for current question
  | "finished";  // game completed

export interface GameState {
  session?: GameSession;
  currentPlayer?: Player;
  timeLeft: number;
  leaderboard: PlayerScore[];
}