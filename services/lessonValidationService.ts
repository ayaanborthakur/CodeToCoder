/**
 * Lesson Validation Service - Frontend API Client
 * 
 * Calls Cloud Functions for AI-powered lesson validation.
 */

import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';
import type { Lesson, PracticeItem } from '../types';

// Callable function references
const validateOutputFn = httpsCallable(functions, 'aiValidateOutput');
const validateMethodologyFn = httpsCallable(functions, 'aiValidateMethodology');
const validateProjectFn = httpsCallable(functions, 'aiValidateProject');

// A printed set of strings, e.g. {'PARIS', 'LONDON'}. Python's set order
// changes between runs, so its items are sorted before comparing.
const SET_LINE = /^\{\s*'[^']*'(\s*,\s*'[^']*')*\s*\}$/;

const sortSetLine = (line: string): string =>
  SET_LINE.test(line)
    ? '{' + (line.slice(1, -1).match(/'[^']*'/g) ?? []).sort().join(', ') + '}'
    : line;

/**
 * Normalizes program output for comparison: unifies line endings, drops
 * trailing whitespace on each line and surrounding blank lines, and orders
 * printed sets. Case matters: lessons like "Hello World!" say so explicitly.
 */
export function normalizeOutput(text: string): string {
  return text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map(line => sortSetLine(line.trimEnd()))
    .join('\n')
    .trim();
}

// Many lessons store a *description* of the result in expectedOutput
// ("Working menu-driven todo list…", "Varies based on input",
// "Expected output (to be filled)") rather than the literal text the program
// prints. Exact-matching those makes the lesson impossible to pass, so they are
// judged against the description instead.
const DESCRIPTIVE_OUTPUT = /to be filled|varies|example|approx|\b(if input is|working|complete|full-featured|accurate|correct|detailed|professional|robust|summary|showing|statistics|result|results|validators?|calculator|interactive|safe|timed|current date|with)\b/i;

export function isLiteralExpectedOutput(expected: string | undefined): expected is string {
  if (expected === undefined || !expected.trim()) return false;
  return !DESCRIPTIVE_OUTPUT.test(expected);
}

/**
 * Validates if the actual terminal output matches expected output.
 * Literal expected output is compared exactly (after normalization). A
 * descriptive or missing expectedOutput is judged by AI against the lesson.
 */
export async function validateOutput(actualOutput: string, lesson: Lesson): Promise<boolean> {
  // Heuristic check: Empty output is always invalid
  if (!actualOutput || !actualOutput.trim()) {
    return false;
  }

  // Literal expected output → exact match ONLY, no AI fallback. Calling AI
  // here was generating unnecessary paid API calls for every failed run.
  if (isLiteralExpectedOutput(lesson.expectedOutput)) {
    const matched = normalizeOutput(actualOutput) === normalizeOutput(lesson.expectedOutput);
    console.log('[Validation] Exact output match:', matched);
    return matched;
  }

  try {
    const result = await validateOutputFn({ actualOutput, lesson });
    const data = result.data as { isValid: boolean };
    return data.isValid;
  } catch (error) {
    console.error('Output validation error:', error);
    return true; // Permissive fallback — never block students on a network error
  }
}

/**
 * Validates if the user's code uses the correct methodology/approach.
 */
export async function validateCodeMethodology(
  code: string,
  lesson: Lesson,
  durationSeconds?: number,
  attempts?: number
): Promise<{ 
  isValid: boolean; 
  reason?: string; 
  skillRatings?: {
    logic: number;
    syntax: number;
    algorithms: number;
    debugging: number;
    efficiency: number;
    creativity: number;
  }
}> {
  // Heuristic check: Empty code is always invalid
  if (!code || !code.trim()) {
    return { isValid: false, reason: 'Code is empty' };
  }

  try {
    const result = await validateMethodologyFn({ 
      code, 
      lesson, 
      durationSeconds, 
      attempts 
    });
    return result.data as {
      isValid: boolean;
      reason?: string;
      skillRatings?: {
        logic: number;
        syntax: number;
        algorithms: number;
        debugging: number;
        efficiency: number;
        creativity: number;
      };
    };
  } catch (error) {
    console.error('Methodology validation error:', error);
    return { isValid: true }; // Fallback to permissive on error
  }
}

/**
 * Validates if a FINAL PROJECT meets the requirements.
 */
export async function validateProjectRequirements(
  code: string,
  output: string,
  lesson: Lesson,
  durationSeconds?: number
): Promise<{
  isValid: boolean;
  reason?: string;
  skillRatings?: {
    logic: number;
    syntax: number;
    algorithms: number;
    debugging: number;
    efficiency: number;
    creativity: number;
  }
}> {
  // Heuristic check: Empty code is always invalid
  if (!code || !code.trim()) {
    return { isValid: false, reason: 'Project code is empty' };
  }

  try {
    const result = await validateProjectFn({ 
      code, 
      output, 
      lesson, 
      durationSeconds 
    });
    return result.data as {
      isValid: boolean;
      reason?: string;
      skillRatings?: {
        logic: number;
        syntax: number;
        algorithms: number;
        debugging: number;
        efficiency: number;
        creativity: number;
      };
    };
  } catch (error) {
    console.error('Project validation error:', error);
    return { isValid: true }; // Fallback
  }
}

/**
 * Orchestrates both output and methodology validation for lesson completion.
 * BOTH checks must pass for a lesson to be marked complete.
 */
export async function validateLessonCompletion(
  code: string,
  output: string,
  lesson: Lesson,
  durationSeconds?: number,
  attempts?: number
): Promise<{
  passed: boolean;
  outputMatch: boolean;
  methodologyMatch: boolean;
  reason?: string;
  skillRatings?: {
    logic: number;
    syntax: number;
    algorithms: number;
    debugging: number;
    efficiency: number;
    creativity: number;
  }
}> {
  console.log('[Validation] Starting lesson validation for:', lesson.id);
  
  // Special handling for Final Projects
  if (lesson.type === 'project') {
    console.log('[Validation] Validating as FINAL PROJECT (Req. Check)');
    const projectResult = await validateProjectRequirements(code, output, lesson, durationSeconds);
    
    return {
      passed: projectResult.isValid,
      outputMatch: projectResult.isValid,
      methodologyMatch: projectResult.isValid,
      reason: projectResult.reason,
      skillRatings: projectResult.skillRatings
    };
  }

  // Output first: if it's wrong there is no point paying for a methodology
  // review, and the student gets one clear reason to fix.
  if (!output || !output.trim()) {
    return {
      passed: false,
      outputMatch: false,
      methodologyMatch: false,
      reason: "Your program didn't print anything. Use print() to show your result."
    };
  }

  const outputValid = await validateOutput(output, lesson);
  if (!outputValid) {
    return {
      passed: false,
      outputMatch: false,
      methodologyMatch: false,
      reason: isLiteralExpectedOutput(lesson.expectedOutput)
        ? `Your output doesn't match what the lesson expects:\n${lesson.expectedOutput.trim()}`
        : "Your output doesn't do what the lesson asks yet. Re-read the task and try again."
    };
  }

  const methodologyResult = await validateCodeMethodology(code, lesson, durationSeconds, attempts);
  const passed = methodologyResult.isValid;

  console.log('[Validation] Results - Output:', outputValid, 'Methodology:', methodologyResult.isValid);

  const reason = passed ? undefined : (methodologyResult.reason || 'Incorrect methodology');

  return {
    passed,
    outputMatch: outputValid,
    methodologyMatch: methodologyResult.isValid,
    reason,
    skillRatings: methodologyResult.skillRatings
  };
}

/**
 * Validates a practice problem or project. These have no expected output, so
 * the code and its output are reviewed against the item's instructions.
 */
export async function validatePracticeItem(
  code: string,
  output: string,
  item: PracticeItem,
  durationSeconds?: number
): Promise<{ passed: boolean; reason?: string }> {
  const asLesson = {
    id: item.id,
    title: item.title,
    content: item.content || item.description,
    goal: item.description,
    objective: item.objective,
  } as Lesson;
  const result = await validateProjectRequirements(code, output, asLesson, durationSeconds);
  return { passed: result.isValid, reason: result.reason };
}
