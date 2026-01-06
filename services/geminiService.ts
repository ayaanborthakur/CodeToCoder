/**
 * Gemini Service - Frontend API Client
 * 
 * Calls Cloud Functions that proxy to Vertex AI.
 */

import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';
import type { ChatMessage, Lesson, LintIssue, PracticeItem, Difficulty } from '../types';

// Callable function references
const aiChatFn = httpsCallable(functions, 'aiChat');
const aiFeedbackFn = httpsCallable(functions, 'aiFeedback');
const aiLintFn = httpsCallable(functions, 'aiLint');
const aiReferenceFn = httpsCallable(functions, 'aiReference');
const aiQuizFn = httpsCallable(functions, 'aiQuiz');
const aiFlowchartFn = httpsCallable(functions, 'aiFlowchart');
const aiUsernameCheckFn = httpsCallable(functions, 'aiUsernameCheck');

// Export model names for reference (used by other services)
export const PRO_MODEL = 'gemini-2.5-pro';
export const LITE_MODEL = 'gemini-2.5-flash-lite';

/**
 * Get chat response from AI tutor
 */
export const getChatResponse = async (
  history: ChatMessage[], 
  lesson: Lesson | null, 
  code: string = '', 
  isHardMode: boolean = false
): Promise<string> => {
  try {
    const result = await aiChatFn({ history, lesson, code, isHardMode });
    const data = result.data as { response: string };
    return data.response;
  } catch (error: unknown) {
    console.error("Error fetching chat response:", error);
    const err = error as { code?: string };
    if (err.code === 'functions/resource-exhausted') {
      return "I'm receiving too many requests right now. Please try again in a few seconds.";
    }
    return "I encountered an error while trying to think. Please check your internet connection.";
  }
};

export interface RunCodeResult {
  success: boolean;
  output: string;
  explanation: string;
}

/**
 * Get feedback on code execution
 */
export const getFeedback = async (
  code: string, 
  output: string, 
  objective?: string, 
  isHardMode: boolean = false
): Promise<string | null> => {
  if (isHardMode) return null;
  
  try {
    const result = await aiFeedbackFn({ code, output, objective, isHardMode });
    const data = result.data as { feedback: string | null };
    return data.feedback;
  } catch (error) {
    console.error("Error getting feedback:", error);
    return null;
  }
};

// DEPRECATED: Kept for reference but should be replaced by pyodideService + getFeedback
export const runCodeWithAI = async (
  _code: string, 
  _objective?: string, 
  _isHardMode: boolean = false
): Promise<RunCodeResult> => {
  return {
    success: false,
    output: "Please refresh the page to use the new execution engine.",
    explanation: "System update required."
  };
};

/**
 * Lint code with AI
 */
export const lintCodeWithAI = async (code: string): Promise<LintIssue[]> => {
  try {
    const result = await aiLintFn({ code });
    const data = result.data as { issues: LintIssue[] };
    return data.issues || [];
  } catch (error) {
    console.error("Error linting code:", error);
    return [];
  }
};

/**
 * Generate reference documentation
 */
export const generateReference = async (
  query: string, 
  difficulty: 'Easy' | 'Medium' | 'Hard', 
  size: 'Small' | 'Medium' | 'Large'
): Promise<{ title: string; content: string }> => {
  try {
    const result = await aiReferenceFn({ query, difficulty, size });
    return result.data as { title: string; content: string };
  } catch (error) {
    console.error("Error generating reference:", error);
    return {
      title: "Error",
      content: "An error occurred while connecting to the AI service."
    };
  }
};

/**
 * Generate practice quiz
 */
export const generatePracticeQuiz = async (
  topic: string, 
  difficulty: Difficulty
): Promise<PracticeItem | null> => {
  try {
    const result = await aiQuizFn({ topic, difficulty });
    return result.data as PracticeItem | null;
  } catch (error) {
    console.error("Error generating quiz:", error);
    return null;
  }
};

/**
 * Generate code from flowchart
 */
export const generateCodeFromFlowchart = async (
  flowchart: import('../types').FlowchartData
): Promise<string | null> => {
  try {
    const result = await aiFlowchartFn({ flowchart });
    const data = result.data as { code: string | null };
    return data.code;
  } catch (error) {
    console.error("Error generating code from flowchart:", error);
    return null;
  }
};

/**
 * Check if a username is safe (not profane/offensive)
 */
export const checkUsernameSafety = async (
  username: string
): Promise<{ isSafe: boolean; reason?: string }> => {
  try {
    const result = await aiUsernameCheckFn({ username });
    return result.data as { isSafe: boolean; reason?: string };
  } catch (error) {
    console.error("Error checking username safety:", error);
    // Fail open - allow username if AI check fails
    return { isSafe: true };
  }
};
