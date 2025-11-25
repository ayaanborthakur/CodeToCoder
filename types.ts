
export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  startingCode: string;
  objective: string;
  goal: string;
  type?: 'coding' | 'quiz';
  quizQuestions?: QuizQuestion[];
  commonMistakes?: string;
}

export interface Module {
  id: string;
  title:string;
  lessons: Lesson[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface LintIssue {
  line: number;
  message: string;
  type: 'error' | 'warning';
}

export interface PlaygroundFile {
  id: string;
  name: string;
  content: string;
  terminalOutput: string;
  chatHistory: ChatMessage[];
  lastModified: number;
}

export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type PracticeType = 'quiz' | 'problem' | 'project';

export interface PracticeItem {
  id: string;
  title: string;
  description: string;
  type: PracticeType;
  difficulty: Difficulty;
  content?: string; // Instructions for problems/projects
  startingCode?: string;
  objective?: string;
  quizQuestions?: QuizQuestion[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  joinedAt: number;
}
