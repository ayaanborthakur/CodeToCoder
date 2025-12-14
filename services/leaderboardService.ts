import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from './firebase';

export interface LeaderboardEntry {
    userId: string;
    name: string;
    avatar?: string;
    net_value: number;
    rank: number;
}

/**
 * Fetch leaderboard data sorted by net_value
 */
export const getLeaderboardData = async (limitCount: number = 50): Promise<LeaderboardEntry[]> => {
    try {
        const usersRef = collection(db, 'users');

        // Query for users with net_value > 0 and sort by net_value descending
        // NOTE: This requires a composite index in Firestore if combined with other where clauses.
        // Typically 'where net_value > 0' + 'orderBy net_value' works with single field index.
        const q = query(
            usersRef,
            where('net_value', '>', 0),
            orderBy('net_value', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);

        const entries: LeaderboardEntry[] = [];
        let rank = 1;

        snapshot.forEach((doc) => {
            const data = doc.data();
            // Basic validation to ensure it's a "real" user with a name
            // We can also filter locally for lastActive if we want to be stricter,
            // but the database query is more efficient.
            if (data.name) {
                entries.push({
                    userId: doc.id,
                    name: data.name,
                    avatar: data.avatar,
                    net_value: data.net_value || 0,
                    rank: rank++
                });
            }
        });

        return entries;
    } catch (error) {
        console.error('Failed to fetch leaderboard data:', error);
        // If index errors occur, they will be logged
        return [];
    }
};
