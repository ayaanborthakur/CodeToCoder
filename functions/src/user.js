/**
 * User Cloud Functions
 * 
 * Handles user-related server-side logic including username availability checks.
 */

const {onCall, HttpsError} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

let _admin = null;
function getAdmin() {
  if (!_admin) {
    const admin = require("firebase-admin");
    if (admin.apps.length === 0) admin.initializeApp();
    _admin = admin;
  }
  return _admin;
}

let _db = null;
function getDb() {
  if (!_db) {
    const { getFirestore } = require("firebase-admin/firestore");
    getAdmin();
    _db = getFirestore("code2coder-india");
  }
  return _db;
}

let _ai = null;
function getAI() {
  if (!_ai) {
    const { GoogleGenAI } = require("@google/genai");
    _ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return _ai;
}

function getType() {
  return require("@google/genai").Type;
}

/**
 * Check if a username is available AND safe (combines availability + profanity check).
 * Uses Admin SDK to bypass client-side rules that might block
 * new users from querying the users collection.
 */
exports.checkUsernameAvailability = onCall({
  region: "asia-south1",
  maxInstances: 10,
  timeoutSeconds: 20,
  secrets: ["GEMINI_API_KEY"]
}, async (request) => {
  // Authentication check
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated to check username');
  }

  const { username } = request.data;
  
  if (!username || typeof username !== 'string') {
    throw new HttpsError('invalid-argument', 'Username must be a valid string');
  }

  const normalizedUsername = username.trim().toLowerCase();

  // Basic validation (length etc should also be checked on client)
  if (normalizedUsername.length < 3 || normalizedUsername.length > 20) {
    return { available: false, reason: 'Invalid length' };
  }

  // Check for alphanumeric + underscore only
  if (!/^[a-z0-9_]+$/.test(normalizedUsername)) {
    return { available: false, reason: 'Only letters, numbers, and underscores allowed' };
  }

  // Reserved usernames
  const reserved = ['admin', 'administrator', 'moderator', 'mod', 'system', 'code2coder', 'support', 'help', 'guest', 'anonymous', 'user', 'null', 'undefined'];
  if (reserved.includes(normalizedUsername)) {
    return { available: false, reason: 'Username is reserved' };
  }

  try {
    // 1. Check profanity using AI
    const safetyResult = await checkUsernameSafety(normalizedUsername);
    if (!safetyResult.isSafe) {
      return { available: false, reason: safetyResult.reason || 'Username contains inappropriate content' };
    }

    // 2. Query users collection for availability
    const usersRef = getDb().collection('users');
    const snapshot = await usersRef
      .where('username', '==', normalizedUsername)
      .limit(1)
      .get();

    if (!snapshot.empty) {
      // Check if it belongs to the current user
      const doc = snapshot.docs[0];
      if (doc.id === request.auth.uid) {
        return { available: true }; // It's their own username
      }
      return { available: false, reason: 'Username taken' };
    }

    return { available: true };
  } catch (error) {
    logger.error("Error checking username availability:", error);
    throw new HttpsError('internal', 'Database error checking availability');
  }
});

/**
 * Helper function to check username safety using AI
 */
async function checkUsernameSafety(username) {
  try {
    const prompt = `Analyze the username: "${username}".
Check if it contains profanity, hate speech, sexually explicit references, or harmful content.
Respond with JSON: { "isSafe": boolean, "reason": "optional string" }`;

    const response = await getAI().models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: getType().OBJECT,
          properties: {
            isSafe: { type: getType().BOOLEAN },
            reason: { type: getType().STRING }
          },
          required: ['isSafe']
        }
      }
    });

    const text = response.text;
    if (!text) return { isSafe: true };
    return JSON.parse(text.trim());
  } catch (error) {
    logger.warn("AI safety check failed, defaulting to safe:", error);
    return { isSafe: true }; // Fail open
  }
}

