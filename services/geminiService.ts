
import { GoogleGenAI, Type } from "@google/genai";
import type { ChatMessage, Lesson, LintIssue, PracticeItem, Difficulty, QuizQuestion } from '../types';

// Helper to get or create the AI client
const getAiClient = (): GoogleGenAI => {
    // Use Vite's import.meta.env for client-side environment variables
    return new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
};

// FIX: Updated model to the latest stable version.
const model = 'gemini-2.5-flash';

// Rate Limiting: Hard cap of 6 requests per minute.
// 60 seconds / 6 requests = 10 seconds per request.
const MIN_REQUEST_DELAY = 10000;
const RATE_LIMIT_KEY = 'codetocoder_next_allowed_req_time';

let requestQueue: Promise<any> = Promise.resolve();

const rateLimit = async <T>(operation: () => Promise<T>): Promise<T> => {
    // Chain requests to ensure strict serialization within this instance
    const nextRequest = requestQueue.then(async () => {
        const now = Date.now();
        let nextAllowedTime = 0;

        try {
            const stored = localStorage.getItem(RATE_LIMIT_KEY);
            if (stored) nextAllowedTime = parseInt(stored, 10);
        } catch (e) { /* Ignore storage errors */ }

        // If next allowed time is invalid or way in the past, reset to now
        if (isNaN(nextAllowedTime) || nextAllowedTime < now - 60000) {
            nextAllowedTime = now;
        }

        // Ensure we don't schedule in the past
        if (nextAllowedTime < now) {
            nextAllowedTime = now;
        }

        const waitDuration = nextAllowedTime - now;

        // Reserve the slot immediately for the *next* request
        // This effectively books the 10s window starting from nextAllowedTime
        const newNextTime = nextAllowedTime + MIN_REQUEST_DELAY;
        try {
            localStorage.setItem(RATE_LIMIT_KEY, newNextTime.toString());
        } catch (e) { /* Ignore */ }

        if (waitDuration > 0) {
            await new Promise(resolve => setTimeout(resolve, waitDuration));
        }

        return await operation();
    });

    // Advance the queue without breaking on errors
    requestQueue = nextRequest.catch(() => { });
    return nextRequest;
};

// Helper for retrying operations
const retryOperation = async <T>(operation: () => Promise<T>, retries = 1, delay = 2000): Promise<T> => {
    try {
        return await rateLimit(operation);
    } catch (error: any) {
        const isQuotaError = error?.status === 429 ||
            error?.code === 429 ||
            error?.message?.includes('429') ||
            error?.toString().includes('429') ||
            error?.message?.includes('quota') ||
            error?.error?.code === 429;

        if (retries > 0 && isQuotaError) {
            console.warn(`Quota limit reached. Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return retryOperation(operation, retries - 1, delay * 2);
        }
        throw error;
    }
};

export const getChatResponse = async (history: ChatMessage[], lesson: Lesson | null, isHardMode: boolean = false): Promise<string> => {
    let systemInstruction = '';

    if (lesson) {
        const commonMistakesContext = lesson.commonMistakes ? `\nCommon Mistakes to watch out for:\n${lesson.commonMistakes}` : '';

        // Updated System Instruction: Tutor Mode (No Direct Answers)
        systemInstruction = isHardMode
            ? `You are CodeToCoder AI, a strict code reviewer. The user is in HARD MODE.
           - CRITICAL: Do NOT give direct answers or complete code solutions.
           - Do NOT explain concepts in detail unless specifically asked.
           - Only provide small, cryptic hints or point out the general area of the mistake.
           - Encourage the user to read the error messages and debug themselves.
           - Keep responses concise and professional.
           
           Current Lesson: "${lesson.title}"
           Lesson Objective: ${lesson.objective}
           Lesson Content:
           ---
           ${lesson.content}
           ---
           ${commonMistakesContext}`
            : `You are CodeToCoder AI, a supportive Socratic Tutor for Python beginners. 
           
           YOUR GOAL: Guide the user to the solution, but NEVER provide the full code answer directly.
           
           RULES:
           1. **No Direct Solutions**: If the user asks "How do I do this?", do not write the code for them. Instead, explain the concept or provide a similar (but different) example.
           2. **Socratic Method**: Ask guiding questions to help the user figure it out. e.g., "What happens if you try using the print function here?"
           3. **Error Debugging**: If they have an error, explain *why* the error is happening, don't just fix it.
           4. **Encouragement**: Be patient and encouraging. 
           
           FORMATTING:
           - Use Markdown.
           - Always use python code blocks for examples.
           - Use inline code for variable names.

           Current Lesson: "${lesson.title}"
           Lesson Objective: ${lesson.objective}
           Lesson Content:
           ---
           ${lesson.content}
           ---
           ${commonMistakesContext}`;
    } else {
        // Playground Mode
        systemInstruction = `You are CodeToCoder AI, an expert Python assistant in Playground Mode.
      The user is experimenting with Python code freely.
      - Answer questions about Python syntax, libraries, and best practices.
      - Help debug code snippets provided by the user.
      - Provide code examples and explanations using Markdown.
      - Always use python code blocks for code snippets.
      - Be helpful, encouraging, and concise.`;
    }

    try {
        const client = getAiClient();

        const validHistory = history.filter(h => h.content && h.content.trim() !== '');
        if (validHistory.length === 0) {
            return "I'm listening. What's on your mind?";
        }

        const lastMessage = validHistory[validHistory.length - 1];
        let historyForApi = validHistory.slice(0, -1).map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }]
        }));

        if (historyForApi.length > 0 && historyForApi[0].role === 'model') {
            historyForApi.shift();
        }

        return await retryOperation(async () => {
            const chat = client.chats.create({
                model,
                config: { systemInstruction },
                history: historyForApi
            });

            const result = await chat.sendMessage({ message: lastMessage.content });
            return result.text ?? "I'm not sure how to respond to that.";
        });

    } catch (error: any) {
        console.error("Error fetching chat response:", error);
        const isQuota = error?.status === 429 || error?.code === 429 || error?.message?.includes('429') || error?.toString().includes('429');
        if (isQuota) {
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

export const runCodeWithAI = async (code: string, objective?: string, isHardMode: boolean = false): Promise<RunCodeResult> => {
    const isPlayground = !objective;
    const finalObjective = objective || "Execute the provided Python code and display the output. The user is exploring freely.";

    // Updated Feedback Rules: Focus on hints, not fixes.
    const explanationRules = isHardMode && !isPlayground
        ? `*   \`explanation\`: Provide exactly 1 sentence of feedback. Be brief. State what failed but do NOT give the solution.`
        : `*   \`explanation\`: Provide exactly 3 sentences of feedback. 
            *   Sentence 1: Pass/Fail status.
            *   Sentence 2: A specific hint about the logic or error (without giving the code answer).
            *   Sentence 3: A conceptual tip or encouragement.`;

    const prompt = `
You are a Python interpreter and code evaluator. Your task is to execute a Python code snippet and determine if it meets a specific objective.

**Rules:**
1.  **Execute the Code:** Analyze and "run" the provided Python code.
2.  **Evaluate Against Objective:** Determine if the code's behavior and output successfully achieve the user's objective.
3.  **Return JSON:** You MUST respond with a JSON object with the following structure:
    \`\`\`json
    {
      "success": boolean,
      "output": "string",
      "explanation": "string"
    }
    \`\`\`
4.  **Field Explanations:**
    *   \`success\`: \`true\` if the code correctly meets the objective, \`false\` otherwise. (In playground mode, return true if code runs without error).
    *   \`output\`: The text that would be printed to a terminal. If there is an error, this should be the Python error message. If there's no output but the code is valid, state that. E.g., "> Code executed successfully with no output."
    ${explanationRules}
    *   **CRITICAL:** Any time you reference specific code, output, or variable names, you MUST use a markdown code block with python syntax highlighting for clarity. 
    *   Example format: "Your code printed \`\`\`python "Hello" \`\`\` which is correct." or "You defined the variable \`\`\`python x = 10 \`\`\` correctly."

**User's Objective:** ${finalObjective}

**Python Code to Execute:**
\`\`\`python
${code}
\`\`\`
`;

    try {
        const client = getAiClient();
        return await retryOperation(async () => {
            const response = await client.models.generateContent({
                model,
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            success: { type: Type.BOOLEAN },
                            output: { type: Type.STRING },
                            explanation: { type: Type.STRING },
                        },
                        required: ['success', 'output', 'explanation'],
                    }
                }
            });

            try {
                const text = response.text;
                if (!text) throw new Error("Empty response text");
                return JSON.parse(text.trim());
            } catch (e) {
                console.error("Failed to parse AI response as JSON:", response.text, e);
                return {
                    success: false,
                    output: '> An unexpected error occurred while evaluating the code.',
                    explanation: 'Sorry, I had trouble interpreting the result from the code execution.'
                };
            }
        });
    } catch (error) {
        console.error("Error running code:", error);
        return {
            success: false,
            output: '> Error connecting to AI service.',
            explanation: 'Please check your internet connection or API key configuration.'
        };
    }
};

// Deduplication for linting
let latestLintCode: string | null = null;

export const lintCodeWithAI = async (code: string): Promise<LintIssue[]> => {
    latestLintCode = code;

    const prompt = `
You are a helpful Python linter. Your task is to analyze the provided Python code for syntax errors and major logical bugs.

**Rules:**
1.  **Analyze:** Check for invalid syntax, undefined variables, indentation errors (that break execution), and infinite loops.
2.  **Noise Reduction:** Do NOT report minor PEP8 style issues (like missing whitespace around operators, blank lines, or variable naming conventions) unless they significantly affect readability. Focus on things that will likely cause the code to crash or behave incorrectly.
3.  **Return JSON:** You MUST respond with a JSON object which contains a list of issues.
    \`\`\`json
    {
        "issues": [
            {
                "line": number,
                "message": "string",
                "type": "error" | "warning"
            }
        ]
    }
    \`\`\`
4.  **Details:**
    *   \`line\`: The 1-based line number where the issue occurs.
    *   \`message\`: A short, concise description of the error (e.g., "Missing colon", "Indentation error", "Undefined variable 'x'").
    *   \`type\`: "error" for things that break code (syntax errors), "warning" for logical bugs or critical bad practices.
    *   If the code is clean or issues are minor, return an empty array for "issues".

**Python Code to Lint:**
\`\`\`python
${code}
\`\`\`
`;

    try {
        const client = getAiClient();
        // Linting is background, we limit it via rateLimit, but return empty on error instead of throwing
        const result = await rateLimit(async () => {
            // Deduplication: If this request is not for the latest code, skip it to save tokens/quota
            if (code !== latestLintCode) {
                return [];
            }

            const response = await client.models.generateContent({
                model,
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            issues: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        line: { type: Type.INTEGER },
                                        message: { type: Type.STRING },
                                        type: { type: Type.STRING, enum: ["error", "warning"] }
                                    },
                                    required: ["line", "message", "type"]
                                }
                            }
                        },
                        required: ['issues'],
                    }
                }
            });

            try {
                const text = response.text;
                if (!text) throw new Error("Empty response text");
                const data = JSON.parse(text.trim());
                return data.issues || [];
            } catch (e) {
                return [];
            }
        });
        return result;

    } catch (error: any) {
        // Suppress errors for background linting
        return [];
    }
};

export const generateLessonVideo = async (title: string, contentSnippet: string): Promise<string | null> => {
    // API Key Selection for Veo
    if ((window as any).aistudio) {
        const aistudio = (window as any).aistudio;
        if (aistudio.hasSelectedApiKey && aistudio.openSelectKey) {
            const hasKey = await aistudio.hasSelectedApiKey();
            if (!hasKey) {
                await aistudio.openSelectKey();
            }
        }
    }

    // Create a fresh client with the potentially updated API key (if re-selected)
    const client = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

    const prompt = `Create a futuristic, high-quality 3D educational visualization for a Python programming lesson titled "${title}". 
    The video should abstractly represent this concept: "${contentSnippet.slice(0, 200)}...". 
    Style: Tech, Cyberpunk, Glowing Data Streams, Educational.`;

    // Helper to check for 404/Not Found errors specifically
    const isNotFoundError = (e: any) => {
        return e.status === 404 ||
            e.message?.includes("404") ||
            e.message?.includes("Requested entity was not found") ||
            e.error?.code === 404 ||
            e.error?.status === 'NOT_FOUND';
    };

    const handleKeyReset = async () => {
        console.error("Video entity or model not found. Resetting key selection.");
        if ((window as any).aistudio?.openSelectKey) {
            await (window as any).aistudio.openSelectKey();
        }
    };

    try {
        let operation = await client.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt,
            config: {
                numberOfVideos: 1,
                resolution: '1080p',
                aspectRatio: '16:9'
            }
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await client.operations.getVideosOperation({ operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) return null;

        // The response.body contains the MP4 bytes. You must append an API key when fetching from the download link.
        const response = await fetch(`${downloadLink}&key=${import.meta.env.VITE_API_KEY}`);
        if (!response.ok) return null;

        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (e: any) {
        if (isNotFoundError(e)) {
            await handleKeyReset();
        }
        console.error("Video generation failed", e);
        return null;
    }
};

export const generateReference = async (query: string, difficulty: 'Easy' | 'Medium' | 'Hard', size: 'Small' | 'Medium' | 'Large'): Promise<{ title: string; content: string }> => {

    let sizeInstruction = '';
    switch (size) {
        case 'Small': sizeInstruction = 'Keep it concise. Focus on a quick summary and 1 simple example. Maximum 300 words.'; break;
        case 'Medium': sizeInstruction = 'Provide a standard reference guide. Include introduction, syntax, usage, and 2-3 examples. Approx 600 words.'; break;
        case 'Large': sizeInstruction = 'Provide an in-depth, comprehensive tutorial. deeply explain concepts, edge cases, best practices, and provide 4+ complex examples. Approx 1000+ words.'; break;
    }

    let difficultyInstruction = '';
    switch (difficulty) {
        case 'Easy': difficultyInstruction = 'Explain like the user is 10 years old. Use simple analogies, avoid jargon, and focus on the basics.'; break;
        case 'Medium': difficultyInstruction = 'Write for a beginner-to-intermediate developer. Use standard technical terms but explain them clearly.'; break;
        case 'Hard': difficultyInstruction = 'Write for an advanced engineer. Dive into memory management, performance implications, and advanced nuances. Assume high technical proficiency.'; break;
    }

    const prompt = `
    You are an expert technical documentation writer for Python.
    Your task is to create a custom reference guide for the following topic or question: "${query}".

    **Configuration:**
    - **Difficulty Level:** ${difficulty}. ${difficultyInstruction}
    - **Length/Depth:** ${size}. ${sizeInstruction}

    **Content Guidelines:**
    1.  **Title:** Provide a short, clear, professional title for the topic (e.g., "Understanding Recursion", "Using the Requests Library").
    2.  **Structure:**
        -   **Introduction:** Briefly explain what the concept is and why it's useful.
        -   **Syntax/Usage:** Show the basic syntax.
        -   **Detailed Explanation:** Break down how it works.
        -   **Code Examples:** Provide multiple distinct Python code examples according to the size parameter. Use standard markdown code blocks (\`\`\`python).
        -   **Best Practices:** Mention common pitfalls or tips.
    3.  **Tone:** Educational, encouraging, and precise.
    4.  **Format:** You must return a JSON object.

    **Response Schema:**
    \`\`\`json
    {
        "title": "The generated title",
        "content": "The full markdown content string..."
    }
    \`\`\`
    `;

    try {
        const client = getAiClient();
        return await retryOperation(async () => {
            const response = await client.models.generateContent({
                model,
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            content: { type: Type.STRING }
                        },
                        required: ['title', 'content']
                    }
                }
            });

            try {
                const text = response.text;
                if (!text) throw new Error("Empty response text");
                return JSON.parse(text.trim());
            } catch (e) {
                console.error("Failed to parse AI response as JSON:", response.text, e);
                return {
                    title: "Generation Failed",
                    content: "Sorry, I couldn't generate a guide for that topic. Please try again."
                };
            }
        });
    } catch (error) {
        console.error("Error generating reference:", error);
        return {
            title: "Error",
            content: "An error occurred while connecting to the AI service."
        };
    }
};

export const generatePracticeQuiz = async (topic: string, difficulty: Difficulty): Promise<PracticeItem | null> => {
    const prompt = `
    Create a Python practice quiz on the topic: "${topic}".
    Difficulty Level: ${difficulty}.

    **Requirements:**
    1.  Generate 5 distinct multiple-choice questions.
    2.  Each question must have 4 options.
    3.  Indicate the correct answer index (0-3).
    4.  Provide a catchy title and a short description for the quiz.

    **Response Schema:**
    \`\`\`json
    {
      "title": "string",
      "description": "string",
      "quizQuestions": [
        {
          "text": "string",
          "options": ["string"],
          "correctAnswerIndex": number
        }
      ]
    }
    \`\`\`
    `;

    try {
        const client = getAiClient();
        return await retryOperation(async () => {
            const response = await client.models.generateContent({
                model,
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            quizQuestions: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        text: { type: Type.STRING },
                                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                        correctAnswerIndex: { type: Type.INTEGER }
                                    },
                                    required: ['text', 'options', 'correctAnswerIndex']
                                }
                            }
                        },
                        required: ['title', 'description', 'quizQuestions']
                    }
                }
            });

            try {
                const text = response.text;
                if (!text) throw new Error("Empty response text");
                const data = JSON.parse(text.trim());

                // Add required PracticeItem fields
                const newQuiz: PracticeItem = {
                    id: `custom-quiz-${Date.now()}`,
                    title: data.title,
                    description: data.description,
                    type: 'quiz',
                    difficulty: difficulty,
                    quizQuestions: data.quizQuestions.map((q: any, idx: number) => ({
                        id: `q-${Date.now()}-${idx}`,
                        text: q.text,
                        options: q.options,
                        correctAnswerIndex: q.correctAnswerIndex
                    }))
                };
                return newQuiz;
            } catch (e) {
                console.error("Failed to parse AI quiz response:", response.text, e);
                return null;
            }
        });
    } catch (error) {
        console.error("Error generating quiz:", error);
        return null;
    }
};
