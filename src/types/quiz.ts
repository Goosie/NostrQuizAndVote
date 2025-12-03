export type QuestionType = "multiple_choice" | "true_false";

export interface Quiz {
  id: string;              // deterministic ID, may map from Nostr/Formstr IDs
  title: string;
  description: string;
  language?: string;       // ISO code, e.g. "en", "nl"
  questions: Question[];
  settings?: QuizSettings;
  createdAt: string;
  createdBy: string;       // pubkey of creator
  formstr_event_id?: string | string[]; // Optional Formstr form ID reference
  nostr_event_id?: string; // Optional Nostr event ID reference
}

export interface Question {
  id: string;              // unique question ID
  index?: number;          // 0-based index in quiz
  text: string;
  type?: QuestionType;
  options: string[];       // for true_false: ["True", "False"]
  correctAnswer: number;   // 0-based index into options (renamed from correctIndex)
  timeLimit: number;       // seconds (renamed from timeLimitSeconds)
  points: number;
}

export interface QuizSettings {
  revealMode?: "manual" | "timed"; // host-controlled vs automatic timing
  timePerQuestion: number;         // default time per question
  showCorrectAnswer: boolean;      // show correct answer after each question
  allowMultipleAttempts: boolean;  // allow players to retry
  requireDeposit: boolean;         // require deposit to join
  depositAmount: number;           // sats required as deposit
  quizType?: "free" | "deposit";
  payoutPerCorrect?: number;       // sats per correct answer
  hostFeePercent?: number;         // percentage of deposits that goes to host
}