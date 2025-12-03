// Nostr Event Types for NostrQuizAndVote

// Quiz Definition – kind 35000
export interface QuizDefinitionEvent {
  quiz_id: string;
  title: string;
  description: string;
  language: string;
  question_count: number;
}

// Game Session – kind 35001
export interface GameSessionEvent {
  quiz_id: string;
  pin: string;
  settings: {
    time_per_question: number;
    quiz_type: "free" | "deposit";
    deposit_sats?: number;
    payout_per_correct?: number;
    host_fee_percent?: number;
  };
}

// Player Join – kind 35002
export interface PlayerJoinEvent {
  session_id: string;
  nickname: string;
}

// Answer – kind 35003
export interface AnswerEvent {
  session_id: string;
  question_index: number;
  answer_index: number;
  time_ms: number;
}

// Score Update / Leaderboard – kind 35004
export interface ScoreUpdateEvent {
  session_id: string;
  question_index: number;
  scores: PlayerScore[];
}

export interface PlayerScore {
  player_id: string;
  nickname: string;
  total_score: number;
}

// Event kinds
export const EVENT_KINDS = {
  QUIZ_DEFINITION: 35000,
  GAME_SESSION: 35001,
  PLAYER_JOIN: 35002,
  ANSWER: 35003,
  SCORE_UPDATE: 35004,
} as const;