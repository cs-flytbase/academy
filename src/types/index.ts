export interface Question {
  id: string;
  text: string;
  options?: {
    id: string;
    text: string;
  }[];
  type: "multiple-choice" | "short-answer" | "essay";
  correctAnswer?: string | string[];
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  timeLimit: number; // in minutes
  questions: Question[];
  dueDate?: string;
  category?: string;
  difficulty?: "easy" | "medium" | "hard";
  thumbnail?: string;
}

export interface TestState {
  assignmentId: string | null;
  isActive: boolean;
  startTime: number | null;
  remainingTime: number | null;
  answers: Record<string, string | string[]>;
  completed: boolean;
  submitted: boolean;
  timeUp: boolean;
}

export type TestContextType = {
  testState: TestState;
  startTest: (assignmentId: string, timeLimit: number) => void;
  endTest: () => void;
  pauseTest: () => void;
  resumeTest: () => void;
  setAnswer: (questionId: string, answer: string | string[]) => void;
  submitTest: () => void;
  clearTest: () => void;
  isTimerActive: boolean;
};
