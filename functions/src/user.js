/**
 * User Cloud Functions
 * 
 * Handles user-related server-side logic including username availability checks.
 */

const {onCall, HttpsError} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

// Initialize Admin SDK if not already done (shared instance)
if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();

/**
 * Check if a username is available.
 * Uses Admin SDK to bypass client-side rules that might block
 * new users from querying the users collection.
 */
exports.checkUsernameAvailability = onCall({
  maxInstances: 10,
  timeoutSeconds: 15,
}, async (request) => {
  // Authentication check (optional: could allow unauth for check, but better to require auth)
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

  try {
    // Query users collection
    const usersRef = db.collection('users');
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
