/**
 * AI Proxy Cloud Function
 * 
 * Proxies AI requests to Vertex AI (Google Cloud) for the Code2Coder frontend.
 * This enables enterprise Vertex AI features while keeping authentication secure.
 */

const {onCall, HttpsError} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const {GoogleGenAI, Type} = require("@google/genai");

// Initialize Firebase Admin if not already done
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Get project ID from environment (automatically set in Cloud Functions)
const PROJECT_ID = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || "code2coder-a324f";
const LOCATION = "us-central1";

// Initialize Vertex AI client with explicit project and location
const ai = new GoogleGenAI({ 
  vertexai: true,
  project: PROJECT_ID,
  location: LOCATION
});

// Model constants
const PRO_MODEL = 'gemini-2.5-pro';
const LITE_MODEL = 'gemini-2.5-flash-lite';

/**
 * Verify that the caller is authenticated
 */
function verifyAuth(request) {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }
  return request.auth.uid;
}

/**
 * AI Chat - Tutor mode for lessons or playground
 */
exports.aiChat = onCall({
  maxInstances: 20,
  memory: "512MiB",
  timeoutSeconds: 60,
}, async (request) => {
  verifyAuth(request);
  const { history, lesson, code, isHardMode } = request.data;

  let systemInstruction = '';
  const codeContext = code ? `\n\nCURRENT USER CODE:\n\`\`\`python\n${code}\n\`\`\`` : '\n\nCURRENT USER CODE: (None provided)';

  if (lesson) {
    const commonMistakesContext = lesson.commonMistakes ? `\nCommon Mistakes to watch out for:\n${lesson.commonMistakes}` : '';

    systemInstruction = isHardMode
      ? `You are Code2Coder AI, a strict code reviewer. The user is in HARD MODE.
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
         ${commonMistakesContext}
         ${codeContext}`
      : `You are Code2Coder AI, a supportive Socratic Tutor for Python beginners. 
         
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
         ${commonMistakesContext}
         ${codeContext}`;
  } else {
    // Playground Mode
    systemInstruction = `You are Code2Coder AI, an expert Python assistant in Playground Mode.
      The user is experimenting with Python code freely.
      - Answer questions about Python syntax, libraries, and best practices.
      - Help debug code snippets provided by the user.
      - Provide code examples and explanations using Markdown.
      - Always use python code blocks for code snippets.
      - Be helpful, encouraging, and concise.
      
      ${codeContext}`;
  }

  try {
    const validHistory = (history || []).filter(h => h.content && h.content.trim() !== '');
    if (validHistory.length === 0) {
      return { response: "I'm listening. What's on your mind?" };
    }

    const lastMessage = validHistory[validHistory.length - 1];
    const historyForApi = validHistory.slice(0, -1).map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));

    if (historyForApi.length > 0 && historyForApi[0].role === 'model') {
      historyForApi.shift();
    }

    const chat = ai.chats.create({
      model: PRO_MODEL,
      config: { systemInstruction },
      history: historyForApi
    });

    const result = await chat.sendMessage({ message: lastMessage.content });
    return { response: result.text ?? "I'm not sure how to respond to that." };

  } catch (error) {
    logger.error("AI Chat error:", error);
    throw new HttpsError('internal', 'AI service error');
  }
});

/**
 * AI Feedback - Code execution feedback
 */
exports.aiFeedback = onCall({
  maxInstances: 20,
  memory: "256MiB",
  timeoutSeconds: 30,
}, async (request) => {
  verifyAuth(request);
  const { code, output, objective, isHardMode } = request.data;

  if (isHardMode) return { feedback: null };

  const finalObjective = objective || "The user is exploring freely.";

  const prompt = `
    You are a Python tutor. The user has run some code.
    
    **User's Code:**
    \`\`\`python
    ${code}
    \`\`\`
    
    **Execution Output:**
    \`\`\`text
    ${output}
    \`\`\`
    
    **Objective:** ${finalObjective}
    
    **Task:**
    Provide brief, helpful feedback.
    1. If the code failed (error in output), explain *why* it failed in simple terms.
    2. If the code succeeded but didn't meet the objective, give a hint.
    3. If it succeeded and met the objective, say "Great job!" and maybe a small tip.
    
    **Constraints:**
    - MAX 2-3 sentences.
    - NO direct code solutions.
    - Be encouraging.
    `;

  try {
    const response = await ai.models.generateContent({
      model: LITE_MODEL,
      contents: prompt,
    });
    return { feedback: response.text || null };
  } catch (error) {
    logger.error("AI Feedback error:", error);
    return { feedback: null };
  }
});

/**
 * AI Lint - Code linting
 */
exports.aiLint = onCall({
  maxInstances: 20,
  memory: "256MiB",
  timeoutSeconds: 30,
}, async (request) => {
  verifyAuth(request);
  const { code } = request.data;

  const prompt = `
You are a helpful Python linter. Your task is to analyze the provided Python code for syntax errors and major logical bugs.

**Rules:**
1.  **Analyze:** Check for invalid syntax, undefined variables, indentation errors (that break execution), and infinite loops.
2.  **Noise Reduction:** Do NOT report minor PEP8 style issues unless they significantly affect readability.
3.  **Return JSON:** Respond with a JSON object containing a list of issues.

**Python Code to Lint:**
\`\`\`python
${code}
\`\`\`
`;

  try {
    const response = await ai.models.generateContent({
      model: LITE_MODEL,
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

    const text = response.text;
    if (!text) return { issues: [] };
    const data = JSON.parse(text.trim());
    return { issues: data.issues || [] };
  } catch (error) {
    logger.error("AI Lint error:", error);
    return { issues: [] };
  }
});

/**
 * AI Reference - Generate reference documentation
 */
exports.aiReference = onCall({
  maxInstances: 10,
  memory: "512MiB",
  timeoutSeconds: 60,
}, async (request) => {
  verifyAuth(request);
  const { query, difficulty, size } = request.data;

  let sizeInstruction = '';
  switch (size) {
    case 'Small': sizeInstruction = 'Keep it concise. Focus on a quick summary and 1 simple example. Maximum 300 words.'; break;
    case 'Medium': sizeInstruction = 'Provide a standard reference guide. Include introduction, syntax, usage, and 2-3 examples. Approx 600 words.'; break;
    case 'Large': sizeInstruction = 'Provide an in-depth, comprehensive tutorial. Approx 1000+ words.'; break;
  }

  let difficultyInstruction = '';
  switch (difficulty) {
    case 'Easy': difficultyInstruction = 'Explain like the user is 10 years old.'; break;
    case 'Medium': difficultyInstruction = 'Write for a beginner-to-intermediate developer.'; break;
    case 'Hard': difficultyInstruction = 'Write for an advanced engineer.'; break;
  }

  const prompt = `
    You are an expert technical documentation writer for Python.
    Create a custom reference guide for: "${query}".
    
    **Configuration:**
    - **Difficulty:** ${difficulty}. ${difficultyInstruction}
    - **Length:** ${size}. ${sizeInstruction}
    
    Respond with JSON: { "title": "string", "content": "markdown string" }
    `;

  try {
    const response = await ai.models.generateContent({
      model: LITE_MODEL,
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

    const text = response.text;
    if (!text) throw new Error("Empty response");
    return JSON.parse(text.trim());
  } catch (error) {
    logger.error("AI Reference error:", error);
    return { title: "Error", content: "Failed to generate reference." };
  }
});

/**
 * AI Quiz - Generate practice quiz
 */
exports.aiQuiz = onCall({
  maxInstances: 10,
  memory: "512MiB",
  timeoutSeconds: 60,
}, async (request) => {
  verifyAuth(request);
  const { topic, difficulty } = request.data;

  const prompt = `
    Create a Python practice quiz on the topic: "${topic}".
    Difficulty Level: ${difficulty}.
    Generate 5 distinct multiple-choice questions with 4 options each.
    `;

  try {
    const response = await ai.models.generateContent({
      model: LITE_MODEL,
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

    const text = response.text;
    if (!text) return null;
    const data = JSON.parse(text.trim());

    return {
      id: `custom-quiz-${Date.now()}`,
      title: data.title,
      description: data.description,
      type: 'quiz',
      difficulty: difficulty,
      quizQuestions: data.quizQuestions.map((q, idx) => ({
        id: `q-${Date.now()}-${idx}`,
        text: q.text,
        options: q.options,
        correctAnswerIndex: q.correctAnswerIndex
      }))
    };
  } catch (error) {
    logger.error("AI Quiz error:", error);
    return null;
  }
});

/**
 * AI Flowchart - Generate code from flowchart
 */
exports.aiFlowchart = onCall({
  maxInstances: 10,
  memory: "512MiB",
  timeoutSeconds: 60,
}, async (request) => {
  verifyAuth(request);
  const { flowchart } = request.data;

  // Build description from flowchart
  let description = "Generate Python code based on this flowchart:\n\n";
  const nodeMap = new Map(flowchart.nodes.map(n => [n.id, n]));
  
  flowchart.nodes.forEach((node, index) => {
    description += `${index + 1}. `;
    
    switch (node.type) {
      case 'start': description += "Start of program\n"; break;
      case 'end': description += "End of program\n"; break;
      case 'variable':
        if (node.data.variableName) {
          description += `Create variable '${node.data.variableName}' = ${node.data.variableValue || 'None'}\n`;
        } else {
          description += `Variable assignment (${node.data.label})\n`;
        }
        break;
      case 'conditional':
        if (node.data.condition) {
          description += `If ${node.data.condition}:\n`;
        } else {
          description += `Conditional check (${node.data.label})\n`;
        }
        break;
      case 'loop':
        if (node.data.loopType && node.data.loopCondition) {
          description += `${node.data.loopType} loop: ${node.data.loopCondition}\n`;
        } else {
          description += `Loop (${node.data.label})\n`;
        }
        break;
      case 'function':
        if (node.data.functionName) {
          description += `Call function ${node.data.functionName}(${node.data.functionArgs || ''})\n`;
        } else {
          description += `Function call (${node.data.label})\n`;
        }
        break;
      case 'output':
        if (node.data.outputExpression) {
          description += `Print: ${node.data.outputExpression}\n`;
        } else {
          description += `Output (${node.data.label})\n`;
        }
        break;
    }
  });

  description += "\n\nOutput ONLY valid, executable Python code. No markdown, no explanation.";

  try {
    const response = await ai.models.generateContent({
      model: PRO_MODEL,
      contents: description,
    });

    let code = response.text;
    if (!code) return { code: null };

    // Clean up response
    code = code.trim()
      .replace(/^```python\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/i, '');

    return { code };
  } catch (error) {
    logger.error("AI Flowchart error:", error);
    return { code: null };
  }
});

/**
 * AI Username Check - Check if username is safe
 */
exports.aiUsernameCheck = onCall({
  maxInstances: 10,
  memory: "256MiB",
  timeoutSeconds: 15,
}, async (request) => {
  verifyAuth(request);
  const { username } = request.data;

  const prompt = `
    Analyze the username: "${username}".
    Check if it contains profanity, hate speech, sexually explicit references, or harmful content.
    Respond with JSON: { "isSafe": boolean, "reason": "optional string" }
    `;

  try {
    const response = await ai.models.generateContent({
      model: LITE_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isSafe: { type: Type.BOOLEAN },
            reason: { type: Type.STRING }
          },
          required: ['isSafe']
        }
      }
    });

    const text = response.text;
    if (!text) return { isSafe: true };
    return JSON.parse(text.trim());
  } catch (error) {
    logger.error("AI Username Check error:", error);
    return { isSafe: true }; // Fail open
  }
});

/**
 * AI Validate Output - Validate lesson output
 */
exports.aiValidateOutput = onCall({
  maxInstances: 20,
  memory: "512MiB",
  timeoutSeconds: 30,
}, async (request) => {
  verifyAuth(request);
  const { actualOutput, lesson } = request.data;

  if (!actualOutput || !actualOutput.trim()) {
    return { isValid: false };
  }

  // Exact match first
  if (lesson.expectedOutput !== undefined) {
    const normalizedActual = actualOutput.trim().toLowerCase();
    const normalizedExpected = lesson.expectedOutput.trim().toLowerCase();
    if (normalizedActual === normalizedExpected) {
      return { isValid: true };
    }
  }

  // AI fallback
  const prompt = `You are validating Python lesson completion output.

Lesson Goal: ${lesson.goal}
Lesson Objective: ${lesson.objective}

Actual Terminal Output:
${actualOutput.trim()}

Determine if the output satisfies the lesson requirements.
Respond with ONLY "VALID" or "INVALID" followed by a brief reason.`;

  try {
    const result = await ai.models.generateContent({
      model: PRO_MODEL,
      contents: prompt,
      config: { temperature: 0 }
    });

    const response = (result.text || '').trim();
    return { isValid: response.toUpperCase().startsWith('VALID') };
  } catch (error) {
    logger.error("AI Validate Output error:", error);
    return { isValid: true }; // Permissive fallback
  }
});

/**
 * AI Validate Methodology - Validate code methodology
 */
exports.aiValidateMethodology = onCall({
  maxInstances: 20,
  memory: "512MiB",
  timeoutSeconds: 45,
}, async (request) => {
  verifyAuth(request);
  const { code, lesson, durationSeconds, attempts } = request.data;

  if (!code || !code.trim()) {
    return { isValid: false, reason: 'Code is empty' };
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
1. Identify core concepts required by the lesson.
2. Verify the code actually uses these concepts.
3. Reject if it just hardcodes the expected output.
4. Rate proficiency (0-100) in: logic, syntax, algorithms, debugging, efficiency, creativity.

Respond with JSON:
{
  "isValid": boolean,
  "reason": "string",
  "skillRatings": { "logic": number, "syntax": number, "algorithms": number, "debugging": number, "efficiency": number, "creativity": number }
}`;

  try {
    const result = await ai.models.generateContent({
      model: PRO_MODEL,
      contents: prompt,
      config: { temperature: 0, responseMimeType: "application/json" }
    });

    const responseText = (result.text ?? '').trim();
    return JSON.parse(responseText);
  } catch (error) {
    logger.error("AI Validate Methodology error:", error);
    return { isValid: true };
  }
});

/**
 * AI Validate Project - Validate final project
 */
exports.aiValidateProject = onCall({
  maxInstances: 10,
  memory: "512MiB",
  timeoutSeconds: 60,
}, async (request) => {
  verifyAuth(request);
  const { code, output, lesson, durationSeconds } = request.data;

  if (!code || !code.trim()) {
    return { isValid: false, reason: 'Project code is empty' };
  }

  const prompt = `You are evaluating a student's Final Project for a Python course.

Project Title: ${lesson.title}
Requirements: ${lesson.content}
${lesson.goal ? `Goal: ${lesson.goal}` : ''}
${lesson.objective ? `Objective: ${lesson.objective}` : ''}

Student's Code:
\`\`\`python
${code}
\`\`\`

Execution Output:
${output}

Context:
- Duration: ${durationSeconds || 'unknown'} seconds

Determine if the project meets core requirements. Be flexible with implementation details but strict on functionality.

Respond with JSON:
{
  "isValid": boolean,
  "reason": "string",
  "skillRatings": { "logic": number, "syntax": number, "algorithms": number, "debugging": number, "efficiency": number, "creativity": number }
}`;

  try {
    const result = await ai.models.generateContent({
      model: PRO_MODEL,
      contents: prompt,
      config: { temperature: 0.1, responseMimeType: "application/json" }
    });

    return JSON.parse((result.text ?? '').trim());
  } catch (error) {
    logger.error("AI Validate Project error:", error);
    return { isValid: true };
  }
});

/**
 * AI Skill Radar - Get AI skill assessment
 */
exports.aiSkillRadar = onCall({
  maxInstances: 10,
  memory: "512MiB",
  timeoutSeconds: 60,
}, async (request) => {
  verifyAuth(request);
  const { metrics } = request.data;

  const prompt = `You are an expert coding skills assessor. Based on the following student performance data, provide a holistic skill assessment rating each skill from 1-100.

STUDENT PERFORMANCE DATA:
- Total Activities Completed: ${metrics.totalActivities}
- Lessons Completed: ${metrics.lessonsCompleted}
- Practice Exercises Completed: ${metrics.practiceCompleted}
- Quizzes Completed: ${metrics.quizzesCompleted}
- Projects Completed: ${metrics.projectsCompleted}
- Average Quiz Score: ${metrics.averageQuizScore}%
- Perfect Scores (100%): ${metrics.perfectScores}
- Total Time Spent: ${metrics.totalTimeSpentMinutes} minutes
- Average Attempts Per Lesson: ${metrics.averageAttemptsPerLesson}

Respond with JSON:
{
  "logic": number,
  "syntax": number,
  "algorithms": number,
  "debugging": number,
  "efficiency": number,
  "creativity": number
}`;

  try {
    const result = await ai.models.generateContent({
      model: PRO_MODEL,
      contents: prompt,
      config: { temperature: 0.1, responseMimeType: "application/json" }
    });

    return JSON.parse((result.text ?? '').trim());
  } catch (error) {
    logger.error("AI Skill Radar error:", error);
    return {
      logic: 20, syntax: 20, algorithms: 20,
      debugging: 20, efficiency: 20, creativity: 20
    };
  }
});
