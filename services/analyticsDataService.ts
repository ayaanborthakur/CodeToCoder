import {
    addDoc,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    updateDoc,
    increment,
    Timestamp,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';
import { userPaths } from './firestorePathHelper';
import type { UserActivity, DailyActivitySummary } from '../types';

// Callable function for AI skill assessment
const aiSkillRadarFn = httpsCallable(functions, 'aiSkillRadar');

/**
 * Log a user activity (Lesson, Quiz, Practice, Project)
 */
// Activity docs auto-delete after this window once you've enabled a Firestore
// TTL policy on the 'expiresAt' field in the Firebase console:
//   Firestore → TTL → Add policy → users/{uid}/Activity → field 'expiresAt'.
// No code changes needed to start cleaning up old docs.
const ACTIVITY_TTL_DAYS = 90;

export const logUserActivity = async (
    userId: string,
    activity: Omit<UserActivity, 'id' | 'userId'>
): Promise<string> => {
    try {
        const now = Date.now();
        const activityData = {
            ...activity,
            userId,
            timestamp: now,
            // Firestore TTL field — actual deletion happens after a TTL policy
            // is enabled in the console; the field itself is free to write.
            expiresAt: Timestamp.fromMillis(now + ACTIVITY_TTL_DAYS * 24 * 60 * 60 * 1000),
        };
        const activityRef = userPaths.activity(userId);
        const docRef = await addDoc(activityRef, activityData);

        // Auto-enroll completed items into the SRS Review queue. The Review tab
        // queries users/{uid}/Reviews where nextReviewDate <= now — without this
        // call no items ever get added, which is why Review was always empty.
        if (activity.completed && activity.itemId && activity.itemTitle) {
            try {
                const { logReviewAttempt } = await import('./learningService');
                const topic = activity.type
                    ? activity.type.charAt(0).toUpperCase() + activity.type.slice(1)
                    : 'Other';
                await logReviewAttempt(
                    userId,
                    activity.itemId,
                    activity.itemTitle,
                    topic,
                    typeof activity.score === 'number' ? activity.score : 100,
                    { moduleId: activity.moduleId, category: activity.category },
                );
            } catch (srsError) {
                console.error('Failed to enroll in SRS:', srsError);
            }
        }

        return docRef.id;
    } catch (error) {
        console.error('Failed to log user activity:', error);
        return '';
    }
};


/**
 * Update user's focus stats (incremental)
 */
export const updateFocusStats = async (
    userId: string, 
    stats: { 
        starsLost?: number; 
        starsEarned?: number; 
        minutes?: number 
    }
): Promise<void> => {
    try {
        const userRef = userPaths.root(userId);
        
        // Construct the update object using dot notation for nested fields
        const updates: any = {};
        
        if (stats.starsLost) {
            updates['focusStats.totalStarsLost'] = increment(stats.starsLost);
        }
        if (stats.starsEarned) {
            updates['focusStats.totalStarsEarned'] = increment(stats.starsEarned);
        }
        if (stats.minutes) {
            updates['focusStats.totalFocusMinutes'] = increment(stats.minutes);
        }
        
        await updateDoc(userRef, updates);
        console.log('[Analytics] Updated focus stats successfully');
        
    } catch (error) {
        console.error('Failed to update focus stats:', error);
    }
};

/**
 * Get recent user activity
 */
export const getRecentActivity = async (
    userId: string, 
    count: number = 50
): Promise<UserActivity[]> => {
    try {
        const activityRef = userPaths.activity(userId);
        const q = query(
            activityRef, 
            orderBy('timestamp', 'desc'), 
            limit(count)
        );
        
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as UserActivity));
    } catch (error) {
        console.error('Failed to get recent activity:', error);
        return [];
    }
};

/**
 * Get daily activity summary for the last X days
 * Aggregates on the client side for now (scale appropriate for single user dashboard)
 */
export const getDailyActivityStats = async (
    userId: string,
    days: number = 14
): Promise<DailyActivitySummary[]> => {
    const { dailyStats } = await getActivityStatsAndRecent(userId, days, 0);
    return dailyStats;
};

/**
 * Combined: fetches activities in the window ONCE, then derives the daily
 * aggregation AND the most-recent slice client-side. Saves a Firestore query
 * (and the read budget that came with it) compared to calling getDailyActivityStats
 * + getRecentActivity separately for the same window.
 */
export const getActivityStatsAndRecent = async (
    userId: string,
    days: number,
    recentLimit: number,
): Promise<{ dailyStats: DailyActivitySummary[]; recent: UserActivity[] }> => {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const activityRef = userPaths.activity(userId);
        const q = query(
            activityRef,
            where('timestamp', '>=', startDate.getTime())
        );

        const snapshot = await getDocs(q);
        const toLocalDateString = (ts: number | Date) => {
            const d = new Date(ts);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const activities: UserActivity[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as UserActivity));
        // Ascending for aggregation
        const ascending = [...activities].sort((a, b) => a.timestamp - b.timestamp);

        // Aggregate by date
        const activityMap = new Map<string, DailyActivitySummary>();
        for (let i = 0; i <= days; i++) {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);
            const dateStr = toLocalDateString(d);
            activityMap.set(dateStr, {
                date: dateStr,
                lessonsCompleted: 0,
                practiceCompleted: 0,
                timeSpentSeconds: 0,
                starsEarned: 0
            });
        }
        ascending.forEach(act => {
            const date = toLocalDateString(act.timestamp);
            const summary = activityMap.get(date);
            if (!summary) return;
            if (act.type === 'lesson') summary.lessonsCompleted++;
            else if (act.type === 'practice' || act.type === 'project' || act.type === 'quiz') summary.practiceCompleted++;
            summary.timeSpentSeconds += act.durationSeconds || 0;
        });

        // Most-recent slice (descending). recentLimit=0 means "skip".
        const recent = recentLimit > 0
            ? [...activities].sort((a, b) => b.timestamp - a.timestamp).slice(0, recentLimit)
            : [];

        return { dailyStats: Array.from(activityMap.values()), recent };
    } catch (error) {
        console.error('Failed to get activity stats + recent:', error);
        return { dailyStats: [], recent: [] };
    }
};

/**
 * Get category distribution stats (Time spent per category as percentages)
 */
export const getCategoryStats = async (userId: string): Promise<{name: string, value: number}[]> => {
    try {
        // Fetch recent enough history to be relevant (e.g. last 100 items)
        // or fetch all if we want total stats
        const activityRef = userPaths.activity(userId);
        const q = query(activityRef, orderBy('timestamp', 'desc'), limit(100)); // Limit to last 100 for perf
        
        const snapshot = await getDocs(q);
        const activities = snapshot.docs.map(doc => doc.data() as UserActivity);
        
        const categories = {
            lesson: 0,
            practice: 0,
            quiz: 0,
            project: 0,
            focus: 0
        };
        
        activities.forEach(act => {
            if (categories[act.type] !== undefined) {
                categories[act.type] += (act.durationSeconds || 0);
            }
        });
        
        // Calculate total time
        const totalTime = categories.lesson + categories.practice + categories.quiz + categories.project + categories.focus;
        
        // If no time recorded, return empty
        if (totalTime === 0) {
            return [];
        }
        
        // Convert to percentages
        return [
            { name: 'Lessons', value: Math.round((categories.lesson / totalTime) * 100) },
            { name: 'Practice', value: Math.round((categories.practice / totalTime) * 100) },
            { name: 'Quizzes', value: Math.round((categories.quiz / totalTime) * 100) },
            { name: 'Projects', value: Math.round((categories.project / totalTime) * 100) },
            { name: 'Focus', value: Math.round((categories.focus / totalTime) * 100) },
        ].filter(item => item.value > 0);
        
    } catch (error) {
        console.error('Failed to get category stats:', error);
        return [];
    }
};

/**
 * Get productivity by hour (0-23)
 */
export const getProductivityByHour = async (userId: string): Promise<{hour: number, count: number}[]> => {
    try {
        const activityRef = userPaths.activity(userId);
        // Get last 200 activities for significant pattern
        const q = query(activityRef, orderBy('timestamp', 'desc'), limit(200));
        
        const snapshot = await getDocs(q);
        const hours = new Array(24).fill(0);
        
        snapshot.docs.forEach(doc => {
            const data = doc.data() as UserActivity;
            const hour = new Date(data.timestamp).getHours();
            hours[hour]++;
        });
        
        return hours.map((count, hour) => ({ hour, count }));
    } catch (error) {
        console.error('Failed to get hour stats:', error);
        return [];
    }
}; 

/**
 * Get accuracy and effort stats
 */
export const getAccuracyStats = async (userId: string): Promise<{
    averageQuizScore: number;
    perfectScores: number;
    averageCodeRuns: number;
}> => {
    try {
        const activityRef = userPaths.activity(userId);
        const q = query(activityRef, orderBy('timestamp', 'desc'), limit(100));
        
        const snapshot = await getDocs(q);
        const activities = snapshot.docs.map(doc => doc.data() as UserActivity);
        
        let totalQuizScore = 0;
        let quizCount = 0;
        let perfectScores = 0;
        
        let totalCodeRuns = 0;
        let lessonCount = 0;
        
        activities.forEach(act => {
            if (act.type === 'quiz' && act.score !== undefined) {
                totalQuizScore += act.score;
                quizCount++;
                if (act.score === 100) perfectScores++;
            }
            
            if (act.type === 'lesson' && act.attempts !== undefined) {
                totalCodeRuns += act.attempts;
                lessonCount++;
            }
        });
        
        return {
            averageQuizScore: quizCount > 0 ? Math.round(totalQuizScore / quizCount) : 0,
            perfectScores,
            averageCodeRuns: lessonCount > 0 ? Math.round((totalCodeRuns / lessonCount) * 10) / 10 : 0
        };
        
    } catch (error) {
        console.error('Failed to get accuracy stats:', error);
        return { averageQuizScore: 0, perfectScores: 0, averageCodeRuns: 0 };
    }
}; 

/**
 * Get activity heatmap data (last 365 days)
 * Returns array of { date: 'YYYY-MM-DD', count: number, level: 0-4 }
 */
export const getActivityHeatmap = async (userId: string): Promise<{date: string, count: number, level: number}[]> => {
    try {
        const startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        
        const activityRef = userPaths.activity(userId);
        const q = query(
            activityRef,
            where('timestamp', '>=', startDate.getTime())
        );
        
        const snapshot = await getDocs(q);
        const toLocalDateString = (ts: number | Date) => {
            const d = new Date(ts);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const activities = snapshot.docs.map(doc => doc.data() as UserActivity)
            .sort((a, b) => a.timestamp - b.timestamp);
        
        const activityMap = new Map<string, number>();
        activities.forEach(act => {
             const date = toLocalDateString(act.timestamp);
             activityMap.set(date, (activityMap.get(date) || 0) + 1);
        });
        
        const heatmapData = [];
        const days = 365;
        for (let i = 0; i <= days; i++) {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);
            const dateStr = toLocalDateString(d);
            const count = activityMap.get(dateStr) || 0;
            
            // Calculate level (0-4) based on count
            let level = 0;
            if (count > 0) level = 1;
            if (count > 2) level = 2;
            if (count > 5) level = 3;
            if (count > 8) level = 4;
            
            heatmapData.push({ date: dateStr, count, level });
        }
        
        return heatmapData;
        
    } catch (error) {
        console.error('Failed to get activity heatmap:', error);
        return [];
    }
};

/**
 * Get skill radar data using AI-based holistic assessment
 * Analyzes all collected activity data to provide comprehensive skill ratings (1-100)
 */
export const getSkillRadarData = async (userId: string): Promise<{subject: string, A: number, fullMark: number}[]> => {
    // Default skill data (starting proficiency)
    const defaultSkills = [
        { subject: 'Logic', A: 20, fullMark: 100 },
        { subject: 'Syntax', A: 20, fullMark: 100 },
        { subject: 'Algorithms', A: 20, fullMark: 100 },
        { subject: 'Debugging', A: 20, fullMark: 100 },
        { subject: 'Efficiency', A: 20, fullMark: 100 },
        { subject: 'Creativity', A: 20, fullMark: 100 }
    ];
    
    try {
        const activityRef = userPaths.activity(userId);
        const q = query(activityRef, orderBy('timestamp', 'desc'), limit(100)); 
        const snapshot = await getDocs(q);
        const activities = snapshot.docs.map(doc => doc.data() as UserActivity);
        
        // If no activities, return default skills
        if (activities.length === 0) {
            return defaultSkills;
        }
        
        // Aggregate performance metrics for AI assessment
        const metrics = {
            totalActivities: activities.length,
            lessonsCompleted: 0,
            practiceCompleted: 0,
            quizzesCompleted: 0,
            projectsCompleted: 0,
            averageQuizScore: 0,
            totalTimeSpentMinutes: 0,
            averageAttemptsPerLesson: 0,
            perfectScores: 0,
            existingRatings: {
                logic: [] as number[],
                syntax: [] as number[],
                algorithms: [] as number[],
                debugging: [] as number[],
                efficiency: [] as number[],
                creativity: [] as number[]
            },
            lessonTitles: [] as string[]
        };
        
        let quizScoreTotal = 0;
        let quizCount = 0;
        let attemptsTotal = 0;
        let lessonCount = 0;
        
        activities.forEach(act => {
            metrics.lessonTitles.push(act.itemTitle);
            metrics.totalTimeSpentMinutes += (act.durationSeconds || 0) / 60;
            
            if (act.type === 'lesson') {
                metrics.lessonsCompleted++;
                if (act.attempts !== undefined) {
                    attemptsTotal += act.attempts;
                    lessonCount++;
                }
            } else if (act.type === 'practice') {
                metrics.practiceCompleted++;
            } else if (act.type === 'quiz') {
                metrics.quizzesCompleted++;
                if (act.score !== undefined) {
                    quizScoreTotal += act.score;
                    quizCount++;
                    if (act.score === 100) metrics.perfectScores++;
                }
            } else if (act.type === 'project') {
                metrics.projectsCompleted++;
            }
            
            // Collect existing AI ratings
            if (act.skillRatings) {
                if (act.skillRatings.logic) metrics.existingRatings.logic.push(act.skillRatings.logic);
                if (act.skillRatings.syntax) metrics.existingRatings.syntax.push(act.skillRatings.syntax);
                if (act.skillRatings.algorithms) metrics.existingRatings.algorithms.push(act.skillRatings.algorithms);
                if (act.skillRatings.debugging) metrics.existingRatings.debugging.push(act.skillRatings.debugging);
                if (act.skillRatings.efficiency) metrics.existingRatings.efficiency.push(act.skillRatings.efficiency);
                if (act.skillRatings.creativity) metrics.existingRatings.creativity.push(act.skillRatings.creativity);
            }
        });
        
        metrics.averageQuizScore = quizCount > 0 ? Math.round(quizScoreTotal / quizCount) : 0;
        metrics.averageAttemptsPerLesson = lessonCount > 0 ? Math.round((attemptsTotal / lessonCount) * 10) / 10 : 0;
        metrics.totalTimeSpentMinutes = Math.round(metrics.totalTimeSpentMinutes);
        
        // Call Cloud Function for AI assessment
        try {
            const result = await aiSkillRadarFn({ metrics });
            const jsonResponse = result.data as {
                logic: number;
                syntax: number;
                algorithms: number;
                debugging: number;
                efficiency: number;
                creativity: number;
            };
            
            return [
                { subject: 'Logic', A: Math.min(100, Math.max(1, jsonResponse.logic || 20)), fullMark: 100 },
                { subject: 'Syntax', A: Math.min(100, Math.max(1, jsonResponse.syntax || 20)), fullMark: 100 },
                { subject: 'Algorithms', A: Math.min(100, Math.max(1, jsonResponse.algorithms || 20)), fullMark: 100 },
                { subject: 'Debugging', A: Math.min(100, Math.max(1, jsonResponse.debugging || 20)), fullMark: 100 },
                { subject: 'Efficiency', A: Math.min(100, Math.max(1, jsonResponse.efficiency || 20)), fullMark: 100 },
                { subject: 'Creativity', A: Math.min(100, Math.max(1, jsonResponse.creativity || 20)), fullMark: 100 }
            ];
        } catch {
            // Fallback to averaging existing ratings if Cloud Function fails
            return getSkillAveragesFromRatings(metrics.existingRatings);
        }
        
    } catch (error) {
        console.error('Failed to get skill radar:', error);
        return defaultSkills;
    }
};

/**
 * Helper function to calculate skill averages from existing ratings
 */
function getSkillAveragesFromRatings(ratings: Record<string, number[]>): {subject: string, A: number, fullMark: number}[] {
    const calculateAverage = (arr: number[]) => arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 20;
    
    return [
        { subject: 'Logic', A: calculateAverage(ratings.logic), fullMark: 100 },
        { subject: 'Syntax', A: calculateAverage(ratings.syntax), fullMark: 100 },
        { subject: 'Algorithms', A: calculateAverage(ratings.algorithms), fullMark: 100 },
        { subject: 'Debugging', A: calculateAverage(ratings.debugging), fullMark: 100 },
        { subject: 'Efficiency', A: calculateAverage(ratings.efficiency), fullMark: 100 },
        { subject: 'Creativity', A: calculateAverage(ratings.creativity), fullMark: 100 }
    ];
} 
