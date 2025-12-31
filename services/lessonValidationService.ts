import { GoogleGenAI } from '@google/genai';
import type { Lesson } from '../types';
import { PRO_MODEL } from './geminiService';

const API_KEY = import.meta.env.VITE_API_KEY || '';

let genAI: GoogleGenAI | null = null;

const getGenAI = () => {
    if (!genAI && API_KEY) {
        genAI = new GoogleGenAI({ apiKey: API_KEY });
    }
    return genAI;
};

/**
 * Validates if the actual terminal output EXACTLY matches the expected output.
 * If lesson has expectedOutput defined, performs exact string match.
 * Falls back to AI inference if no expectedOutput is defined.
 */
export async function validateOutput(actualOutput: string, lesson: Lesson): Promise<boolean> {
    // Heuristic check: Empty output is always invalid
    if (!actualOutput || !actualOutput.trim()) {
        return false;
    }

    // If lesson has explicit expectedOutput, do exact match
    if (lesson.expectedOutput !== undefined) {
        const normalizedActual = actualOutput.trim();
        const normalizedExpected = lesson.expectedOutput.trim();

        const isMatch = normalizedActual === normalizedExpected;

        if (!isMatch) {
            console.log('[Validation] Output mismatch:');
            console.log('  Expected:', JSON.stringify(normalizedExpected));
            console.log('  Actual:  ', JSON.stringify(normalizedActual));
        } else {
            console.log('[Validation] Output matched exactly!');
        }

        return isMatch;
    }

    // Fallback: Use AI inference for lessons without explicit expectedOutput
    // (e.g., random lessons, input-based lessons)
    try {
        const ai = getGenAI();
        if (!ai) {
            console.warn('Gemini API not configured, skipping output validation');
            return true; // Fallback to permissive if no API
        }

        const prompt = `You are validating Python lesson completion output.

Lesson Goal: ${lesson.goal}
Lesson Objective: ${lesson.objective}

Actual Terminal Output:
${actualOutput.trim()}

Task: Determine if the actual output satisfies the lesson requirements.
Rules:
1. If the lesson asks for specific text (e.g. "print exactly"), be strict about case and punctuation.
2. If the lesson is general (e.g. "print the result"), accept any valid representation.
3. Ignore leading/trailing whitespace.
4. If the output is empty, error, or completely unrelated, it is INVALID.

Respond with ONLY "VALID" or "INVALID" followed by a brief reason.`;

        const result = await ai.models.generateContent({
            model: PRO_MODEL,
            contents: prompt,
            config: { temperature: 0 }
        });

        const response = (result.text || '').trim();

        const isValid = response.toUpperCase().startsWith('VALID');

        if (!isValid) {
            console.log('[Validation] AI output check:', response);
        }

        return isValid;
    } catch (error) {
        console.error('Output validation error:', error);
        return true; // Fallback to permissive on error
    }
}

/**
 * Validates if the user's code uses the correct methodology/approach as specified in the lesson.
 * This is a LENIENT check - it allows creativity in variable names, formatting, etc.
 * Only fails if the code fundamentally ignores the lesson's core concept.
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
        const ai = getGenAI();
        if (!ai) {
            console.warn('Gemini API not configured, skipping methodology validation');
            return { isValid: true }; // Fallback to permissive
        }

        const prompt = `You are an expert Python tutor validating a student's code.

Lesson Title: ${lesson.title}
Lesson Objective: ${lesson.objective}
Lesson Goal: ${lesson.goal}

User's Code:
\`\`\`python
${code}
\`\`\`

Context:
- Duration: ${durationSeconds || 'unknown'} seconds
- Attempts: ${attempts || 'unknown'}

Task: 
1. Analyze if the code correctly implements the lesson's core concept.
2. Rate the user's proficiency (0-100) in the following categories based ONLY on this specific submission and context:
   - logic: Complexity and flow control.
   - syntax: Correct use of Python rules and style.
   - algorithms: Problem-solving approach.
   - debugging: Code cleanliness and error-handling (or likelihood of errors).
   - efficiency: How concise and direct the solution is.
   - creativity: Originality or going beyond the basics.

Respond with ONLY a JSON object in this format:
{
  "isValid": boolean,
  "reason": "string (brief explanation)",
  "skillRatings": {
    "logic": number,
    "syntax": number,
    "algorithms": number,
    "debugging": number,
    "efficiency": number,
    "creativity": number
  }
}`;

        const result = await ai.models.generateContent({
            model: PRO_MODEL,
            contents: prompt,
            config: { 
                temperature: 0,
                response_mime_type: "application/json"
            }
        });

        const responseText = (result.text ?? '').trim();
        let jsonResponse;
        try {
            jsonResponse = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse AI JSON response:', responseText);
            return { isValid: true }; // Permissive fallback
        }

        if (!jsonResponse.isValid) {
            console.log('[Validation] Methodology issue:', jsonResponse.reason);
        } else {
            console.log('[Validation] Methodology passed!');
        }

        return jsonResponse;
    } catch (error) {
        console.error('Methodology validation error:', error);
        return { isValid: true }; // Fallback to permissive on error
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

