/**
 * Leaderboard Cloud Function
 * 
 * Scheduled function that runs daily to update the leaderboard.
 */

const {setGlobalOptions} = require("firebase-functions");
const {onSchedule} = require("firebase-functions/v2/scheduler");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

// Initialize only if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();

// For cost control, we limit max instances.
setGlobalOptions({ maxInstances: 10 });

/**
 * Scheduled function that runs daily at 12:00 AM (America/Los_Angeles).
 * It calculates the leaderboard by querying the top users by net_value,
 * assigns them a rank, and updates the 'leaderboard' collection.
 */
exports.updateLeaderboard = onSchedule({
  schedule: "0 0 * * *",
  timeZone: "America/Los_Angeles",
}, async (event) => {
  logger.info("Starting scheduled leaderboard update");

  try {
    // 1. Fetch all users with net_value > 0
    const usersSnapshot = await db.collection("users")
        .where("net_value", ">", 0)
        .where("shown", "==", true)
        .orderBy("net_value", "desc")
        .limit(100)
        .get();

    logger.info(`Found ${usersSnapshot.size} users for leaderboard`);

    if (usersSnapshot.empty) {
      logger.info("No users found for leaderboard.");
      return;
    }

    const batch = db.batch();
    const leaderboardRef = db.collection("leaderboard");

    // 2. Clear existing leaderboard
    const existingLeaderboard = await leaderboardRef.get();
    existingLeaderboard.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // 3. Populate new leaderboard
    let rank = 1;
    usersSnapshot.docs.forEach((userDoc) => {
      const userData = userDoc.data();
      const leaderboardEntryRef = leaderboardRef.doc(userDoc.id);

      const username = userData.username || null;
      
      // Skip users without a username
      if (!username) {
        return;
      }

      batch.set(leaderboardEntryRef, {
        username: username,
        avatar: userData.avatar || null,
        net_value: userData.net_value || 0,
        rank: rank++,
        createdAt: userData.createdAt || null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      logger.debug(`Adding user to leaderboard: ${userDoc.id} -> @${username}`);
    });

    await batch.commit();
    logger.info("Leaderboard updated successfully");
  } catch (error) {
    logger.error("Error updating leaderboard", error);
  }
});
