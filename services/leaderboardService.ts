import { collection, query, orderBy, limit, getDocs, where, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface LeaderboardEntry {
    userId: string;
    username: string; // Required username for display
    avatar?: string;
    net_value: number;
    rank: number;
    joinedAt?: number;
}

/**
 * Fetch leaderboard data sorted by net_value
 */
export const getLeaderboardData = async (limitCount: number = 50): Promise<LeaderboardEntry[]> => {
    try {
        const leaderboardRef = collection(db, 'leaderboard');

        // Query the pre-calculated leaderboard collection
        const q = query(
            leaderboardRef,
            orderBy('rank', 'asc'),
            limit(limitCount)
        );

        let snapshot = await getDocs(q);

        // FALLBACK: If leaderboard is empty (scheduled function hasn't run yet),
        // query the users collection directly to ensure data is shown.
        if (snapshot.empty) {
            console.warn('Leaderboard empty, falling back to direct user query');
            const usersRef = collection(db, 'users');
            const userQuery = query(
                usersRef,
                where('net_value', '>', 0),
                orderBy('net_value', 'desc'),
                limit(limitCount)
            );
            snapshot = await getDocs(userQuery);
            
            const entries: LeaderboardEntry[] = [];
            let rank = 1;

            snapshot.forEach((doc) => {
                const data = doc.data();
                // Only include users with a username
                if (data.username) {
                    entries.push({
                        userId: doc.id,
                        username: data.username,
                        avatar: data.avatar,
                        net_value: data.net_value || 0,
                        rank: rank++,
                        joinedAt: data.joinedAt || data.createdAt
                    });
                }
            });
            return entries;
        }

        const entries: LeaderboardEntry[] = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            // Only include entries with a username
            if (data.username) {
                entries.push({
                    userId: doc.id,
                    username: data.username,
                    avatar: data.avatar,
                    net_value: data.net_value || 0,
                    rank: data.rank, // Use the pre-calculated rank
                    joinedAt: data.joinedAt || data.createdAt
                });
            }
        });

        return entries;
    } catch (error) {
        console.error('Failed to fetch leaderboard data:', error);
        return [];
    }
};

/**
 * Class-scoped leaderboard. Pulls every classmate's user doc, ranks by
 * net_value, returns ordered entries. Reads are gated by the
 * users/{uid} 'classmates can read each other' Firestore rule.
 *
 * For classes that grow beyond ~30 students, this issues one read per
 * student. That's fine for typical class sizes; consider an aggregate
 * pre-computed doc if classes grow into the hundreds.
 */
export const getClassLeaderboardData = async (classId: string): Promise<LeaderboardEntry[]> => {
    try {
        const classroomSnap = await getDoc(doc(db, 'classrooms', classId));
        if (!classroomSnap.exists()) return [];
        const studentIds: string[] = classroomSnap.data().studentIds ?? [];
        if (studentIds.length === 0) return [];

        const userSnaps = await Promise.all(
            studentIds.map(uid => getDoc(doc(db, 'users', uid)).catch(() => null))
        );

        const entries: LeaderboardEntry[] = [];
        for (const snap of userSnaps) {
            if (!snap || !snap.exists()) continue;
            const data = snap.data();
            if (!data.username) continue;
            entries.push({
                userId: snap.id,
                username: data.username,
                avatar: data.avatar,
                net_value: data.net_value ?? 0,
                rank: 0,
                joinedAt: data.joinedAt ?? data.createdAt,
            });
        }

        entries.sort((a, b) => b.net_value - a.net_value);
        entries.forEach((e, i) => { e.rank = i + 1; });
        return entries;
    } catch (error) {
        console.error('Failed to fetch class leaderboard:', error);
        return [];
    }
};
