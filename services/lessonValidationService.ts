/**
 * Lesson Validation Service - Frontend API Client
 * 
 * Calls Cloud Functions for AI-powered lesson validation.
 */

import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';
import type { Lesson } from '../types';

// Callable function references
const validateOutputFn = httpsCallable(functions, 'aiValidateOutput');
const validateMethodologyFn = httpsCallable(functions, 'aiValidateMethodology');
const validateProjectFn = httpsCallable(functions, 'aiValidateProject');

/**
 * Validates if the actual terminal output matches expected output.
 * Falls back to AI inference if no expectedOutput is defined.
 */
export async function validateOutput(actualOutput: string, lesson: Lesson): Promise<boolean> {
  // Heuristic check: Empty output is always invalid
  if (!actualOutput || !actualOutput.trim()) {
    return false;
  }

  // If lesson has explicit expectedOutput, use exact match ONLY — no AI fallback.
  // If the output doesn't match exactly, it's wrong. Calling AI as a fallback
  // here was generating unnecessary paid API calls for every failed run.
  if (lesson.expectedOutput !== undefined) {
    const normalizedActual = actualOutput.trim().toLowerCase();
    const normalizedExpected = lesson.expectedOutput.trim().toLowerCase();
    const matched = normalizedActual === normalizedExpected;
    console.log('[Validation] Exact output match:', matched);
    return matched;
  }

  // No expectedOutput defined → use AI inference (open-ended lessons/projects)
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

  console.log('[Validation] Has expectedOutput:', lesson.expectedOutput !== undefined);

  // Run both validations in parallel
  const [outputValid, methodologyResult] = await Promise.all([
    validateOutput(output, lesson),
    validateCodeMethodology(code, lesson, durationSeconds, attempts)
  ]);

  const passed = outputValid && methodologyResult.isValid;

  console.log('[Validation] Results - Output:', outputValid, 'Methodology:', methodologyResult.isValid);

  let reason: string | undefined;
  if (!passed) {
    if (!outputValid && !methodologyResult.isValid) {
      reason = 'Output mismatch and incorrect methodology';
    } else if (!outputValid) {
      reason = 'Output does not match expected result';
    } else {
      reason = methodologyResult.reason || 'Incorrect methodology';
    }
  }

  return {
    passed,
    outputMatch: outputValid,
    methodologyMatch: methodologyResult.isValid,
    reason,
    skillRatings: methodologyResult.skillRatings
  };
}
