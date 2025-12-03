export type QuestionType = "multiple_choice" | "true_false";

export interface Quiz {
  id: string;              // deterministic ID, may map from Nostr/Formstr IDs
  title: string;
  description: string;
  language: string;        // ISO code, e.g. "en", "nl"
  questions: Question[];
  settings?: QuizSettings;
}

export interface Question {
  index: number;           // 0-based index in quiz
  text: string;
  type: QuestionType;
  options: string[];       // for true_false: ["True", "False"]
  correctIndex: number;    // 0-based index into options
  timeLimitSeconds: number;
  points: number;
}

export interface QuizSettings {
  revealMode: "manual" | "timed"; // host-controlled vs automatic timing
  defaultTimePerQuestion?: number;
  quizType: "free" | "deposit";
  depositSats?: number;          // if quizType=deposit
  payoutPerCorrect?: number;     // sats per correct answer
  hostFeePercent?: number;       // percentage of deposits that goes to host
}