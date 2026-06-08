#!/usr/bin/env node
/**
 * Grant (or revoke) the Code2Coder platform-admin custom claim.
 *
 * Platform admins vet school registrations (see firestore.rules → isAdmin()).
 * The flag lives on the user's Firebase Auth token as a custom claim, NOT in
 * Firestore, so it can't be self-granted by writing a user doc. Setting a
 * custom claim requires the Admin SDK + privileged credentials, which is why
 * this is a manual, run-it-yourself script rather than anything in the app.
 *
 * ─── Usage ─────────────────────────────────────────────────────────────────
 *   # 1. Get a service-account key (one time):
 *   #    Firebase console → Project settings → Service accounts →
 *   #    "Generate new private key". Save the JSON SOMEWHERE OUTSIDE THIS REPO
 *   #    (it's a secret — never commit it).
 *   #
 *   # 2. Point the SDK at it and run:
 *   GOOGLE_APPLICATION_CREDENTIALS=/abs/path/to/serviceAccount.json \
 *     node scripts/grantAdmin.mjs you@example.com
 *
 *   # Revoke:
 *   GOOGLE_APPLICATION_CREDENTIALS=/abs/path/to/serviceAccount.json \
 *     node scripts/grantAdmin.mjs you@example.com --revoke
 *
 * Alternatively, if you've run `gcloud auth application-default login` for the
 * code2coder-a324f project, you can omit GOOGLE_APPLICATION_CREDENTIALS and the
 * SDK will use Application Default Credentials.
 *
 * NOTE: custom claims only take effect on the user's NEXT token refresh. Have
 * the user log out and back in (or wait up to an hour) after granting.
 */

import admin from 'firebase-admin';

const args = process.argv.slice(2);
const revoke = args.includes('--revoke');
const email = args.find(a => !a.startsWith('--'));

if (!email) {
    console.error('Usage: node scripts/grantAdmin.mjs <email> [--revoke]');
    process.exit(1);
}

try {
    admin.initializeApp({
        // applicationDefault() honours GOOGLE_APPLICATION_CREDENTIALS or
        // `gcloud auth application-default login`.
        credential: admin.credential.applicationDefault(),
    });
} catch (e) {
    console.error('\nFailed to initialise the Admin SDK.');
    console.error('Set GOOGLE_APPLICATION_CREDENTIALS to a service-account key,');
    console.error('or run `gcloud auth application-default login` first.\n');
    console.error(e.message);
    process.exit(1);
}

const run = async () => {
    const userRecord = await admin.auth().getUserByEmail(email);
    const existing = userRecord.customClaims || {};

    const nextClaims = { ...existing };
    if (revoke) {
        delete nextClaims.admin;
    } else {
        nextClaims.admin = true;
    }

    await admin.auth().setCustomUserClaims(userRecord.uid, nextClaims);

    console.log(
        `\n${revoke ? 'Revoked' : 'Granted'} admin for ${email} (uid: ${userRecord.uid}).`,
    );
    console.log('Current claims:', JSON.stringify(nextClaims));
    console.log('\nThe user must log out and back in for this to take effect.\n');
};

run()
    .then(() => process.exit(0))
    .catch(err => {
        if (err.code === 'auth/user-not-found') {
            console.error(`\nNo Firebase user found with email "${email}".`);
            console.error('They need to sign in to Code2Coder at least once first.\n');
        } else {
            console.error('\nFailed to set admin claim:', err.message, '\n');
        }
        process.exit(1);
    });
