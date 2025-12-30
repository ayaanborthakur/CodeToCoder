import { 
    addDoc, 
    query, 
    where, 
    orderBy, 
    limit, 
    getDocs
} from 'firebase/firestore';
import { userPaths } from './firestorePathHelper';
import type { UserActivity, DailyActivitySummary } from '../types';

/**
 * Log a user activity (Lesson, Quiz, Practice, Project)
 */
export const logUserActivity = async (
    userId: string, 
    activity: Omit<UserActivity, 'id' | 'userId'>
): Promise<string> => {
    try {
        const activityRef = userPaths.activity(userId);
        const docRef = await addDoc(activityRef, {
            ...activity,
            userId,
            timestamp: Date.now()
        });
        return docRef.id;
    } catch (error) {
        console.error('Failed to log user activity:', error);
        // Don't throw, just log error so it doesn't break app flow
        return '';
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
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        const activityRef = userPaths.activity(userId);
        const q = query(
            activityRef,
            where('timestamp', '>=', startDate.getTime()),
            orderBy('timestamp', 'asc')
        );
        
        const snapshot = await getDocs(q);
        const activities = snapshot.docs.map(doc => doc.data() as UserActivity);
        
        // Aggregate by date
        const activityMap = new Map<string, DailyActivitySummary>();
        
        // Initialize map with all dates in range
        for (let i = 0; i < days; i++) {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            activityMap.set(dateStr, {
                date: dateStr,
                lessonsCompleted: 0,
                practiceCompleted: 0,
                timeSpentSeconds: 0,
                starsEarned: 0
            });
        }
        
        activities.forEach(act => {
            const date = new Date(act.timestamp).toISOString().split('T')[0];
            const summary = activityMap.get(date);
            
            if (summary) {
                if (act.type === 'lesson') {
                    summary.lessonsCompleted++;
                } else if (act.type === 'practice' || act.type === 'project' || act.type === 'quiz') {
                    summary.practiceCompleted++;
                }
                
                summary.timeSpentSeconds += act.durationSeconds || 0;
            }
        });
        
        return Array.from(activityMap.values());
        
    } catch (error) {
        console.error('Failed to get daily activity stats:', error);
        return [];
    }
};

/**
 * Get category distribution stats (Time spent per category)
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
            project: 0
        };
        
        activities.forEach(act => {
            if (categories[act.type] !== undefined) {
                categories[act.type] += (act.durationSeconds || 0);
            }
        });
        
        // Convert to minutes
        return [
            { name: 'Lessons', value: Math.round(categories.lesson / 60) },
            { name: 'Practice', value: Math.round(categories.practice / 60) },
            { name: 'Quizzes', value: Math.round(categories.quiz / 60) },
            { name: 'Projects', value: Math.round(categories.project / 60) },
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
            where('timestamp', '>=', startDate.getTime()),
            orderBy('timestamp', 'asc')
        );
        
        const snapshot = await getDocs(q);
        const activities = snapshot.docs.map(doc => doc.data() as UserActivity);
        
        const activityMap = new Map<string, number>();
        activities.forEach(act => {
             const date = new Date(act.timestamp).toISOString().split('T')[0];
             activityMap.set(date, (activityMap.get(date) || 0) + 1);
        });
        
        const heatmapData = [];
        const days = 365;
        for (let i = 0; i < days; i++) {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
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
 * Get skill radar data
 * Aggregates based on module/concept tags (inferred from title for now)
 */
export const getSkillRadarData = async (userId: string): Promise<{subject: string, A: number, fullMark: number}[]> => {
    try {
        // Fetch specific recent activity to determine skills
        const activityRef = userPaths.activity(userId);
        const q = query(activityRef, orderBy('timestamp', 'desc'), limit(500)); 
        const snapshot = await getDocs(q);
        const activities = snapshot.docs.map(doc => doc.data() as UserActivity);
        
        const skills: Record<string, number> = {
            'Logic': 10, // Base stats
            'Syntax': 10,
            'Algorithms': 10,
            'Debugging': 10,
            'Efficiency': 10,
            'Creativity': 10
        };
        
        // Simple heuristic mapping - in a real app this would use tags
        activities.forEach(act => {
            const title = act.itemTitle.toLowerCase();
            
            if (act.completed) {
                // Determine skills based on keywords
                if (title.includes('loop') || title.includes('condition')) skills['Logic'] += 5;
                if (title.includes('variable') || title.includes('print') || title.includes('input')) skills['Syntax'] += 5;
                if (title.includes('project')) skills['Creativity'] += 10;
                if (title.includes('quiz')) skills['Algorithms'] += 5; // Quizzes test generic knowledge
                
                // Add points for perseverance
                if (act.attempts && act.attempts > 3) skills['Debugging'] += 2;
                
                // Add points for efficiency (fast completion)
                if (act.durationSeconds > 60 && act.durationSeconds < 300) skills['Efficiency'] += 2;
            }
        });
        
        // Normalize to 100 max
        const data = Object.keys(skills).map(key => ({
            subject: key,
            A: Math.min(skills[key], 100),
            fullMark: 100
        }));
        
        return data;
        
    } catch (error) {
        console.error('Failed to get skill radar:', error);
        return [];
    }
}; 
