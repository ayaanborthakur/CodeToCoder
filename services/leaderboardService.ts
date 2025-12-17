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
            console.log('Leaderboard empty, falling back to direct user query');
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
        }

        const entries: LeaderboardEntry[] = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            entries.push({
                userId: doc.id,
                name: data.name,
                avatar: data.avatar,
                net_value: data.net_value || 0,
                rank: data.rank // Use the pre-calculated rank
            });
        });

        return entries;
    } catch (error) {
        console.error('Failed to fetch leaderboard data:', error);
        return [];
    }
};
