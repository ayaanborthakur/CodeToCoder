import { 
    addDoc, 
    query, 
    where, 
    orderBy, 
    limit, 
    getDocs,
    updateDoc,
    increment,
    getDoc,
    doc
} from 'firebase/firestore';
import { userPaths } from './firestorePathHelper';
import type { UserActivity, DailyActivitySummary } from '../types';
import { GoogleGenAI } from '@google/genai';
import { PRO_MODEL } from './geminiService';

const API_KEY = import.meta.env.VITE_API_KEY || '';

let genAI: GoogleGenAI | null = null;

const getGenAI = () => {
    if (!genAI && API_KEY) {
        genAI = new GoogleGenAI({ apiKey: API_KEY });
    }
    return genAI;
};

/**
 * Log a user activity (Lesson, Quiz, Practice, Project)
 */
export const logUserActivity = async (
    userId: string, 
    activity: Omit<UserActivity, 'id' | 'userId'>
): Promise<string> => {
    try {
        const activityData = {
            ...activity,
            userId,
            timestamp: Date.now()
        };
        console.warn('[AnalyticsService] Logging activity:', activityData.itemTitle, activityData.type);
        const activityRef = userPaths.activity(userId);
        const docRef = await addDoc(activityRef, activityData);
        console.warn('[AnalyticsService] Logged successfully, ID:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Failed to log user activity:', error);
        // Don't throw, just log error so it doesn't break app flow
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
        console.warn(`[AnalyticsService] Fetched ${snapshot.docs.length} recent activities`);
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
            where('timestamp', '>=', startDate.getTime())
        );
        
        const snapshot = await getDocs(q);
        console.warn(`[AnalyticsService] Fetched ${snapshot.docs.length} activities for daily stats`);
        const toLocalDateString = (ts: number | Date) => {
            const d = new Date(ts);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const activities = snapshot.docs.map(doc => doc.data() as UserActivity)
            .sort((a, b) => a.timestamp - b.timestamp);
        
        // Aggregate by date
        const activityMap = new Map<string, DailyActivitySummary>();
        
        // Initialize map with all dates in range (including today)
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
        
        activities.forEach(act => {
            const date = toLocalDateString(act.timestamp);
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
        
        // Try AI assessment
        const ai = getGenAI();
        if (!ai) {
            // Fallback to averaging existing ratings
            return getSkillAveragesFromRatings(metrics.existingRatings);
        }
        
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
- Topics Covered: ${[...new Set(metrics.lessonTitles)].slice(0, 20).join(', ')}

EXISTING PER-ACTIVITY AI RATINGS (averages from individual assessments):
- Logic: ${metrics.existingRatings.logic.length > 0 ? Math.round(metrics.existingRatings.logic.reduce((a, b) => a + b, 0) / metrics.existingRatings.logic.length) : 'No data'}
- Syntax: ${metrics.existingRatings.syntax.length > 0 ? Math.round(metrics.existingRatings.syntax.reduce((a, b) => a + b, 0) / metrics.existingRatings.syntax.length) : 'No data'}
- Algorithms: ${metrics.existingRatings.algorithms.length > 0 ? Math.round(metrics.existingRatings.algorithms.reduce((a, b) => a + b, 0) / metrics.existingRatings.algorithms.length) : 'No data'}
- Debugging: ${metrics.existingRatings.debugging.length > 0 ? Math.round(metrics.existingRatings.debugging.reduce((a, b) => a + b, 0) / metrics.existingRatings.debugging.length) : 'No data'}
- Efficiency: ${metrics.existingRatings.efficiency.length > 0 ? Math.round(metrics.existingRatings.efficiency.reduce((a, b) => a + b, 0) / metrics.existingRatings.efficiency.length) : 'No data'}
- Creativity: ${metrics.existingRatings.creativity.length > 0 ? Math.round(metrics.existingRatings.creativity.reduce((a, b) => a + b, 0) / metrics.existingRatings.creativity.length) : 'No data'}

ASSESSMENT CRITERIA:
- Logic (1-100): Ability to think through problems, control flow, conditionals
- Syntax (1-100): Correct use of Python syntax, style, conventions
- Algorithms (1-100): Problem-solving approach, data structure usage
- Debugging (1-100): Code cleanliness, error handling, ability to fix issues (fewer attempts = better)
- Efficiency (1-100): Conciseness, performance awareness, time management
- Creativity (1-100): Going beyond basics, original solutions, exploration

Consider:
- More activities = more experience
- Higher quiz scores = better understanding
- Fewer attempts = stronger debugging skills
- Existing ratings should heavily influence your assessment
- If no data exists for a skill, start at 20 as a baseline for beginners

Respond with ONLY a JSON object:
{
  "logic": number,
  "syntax": number,
  "algorithms": number,
  "debugging": number,
  "efficiency": number,
  "creativity": number
}`;

        const result = await ai.models.generateContent({
            model: PRO_MODEL,
            contents: prompt,
            config: { 
                temperature: 0.1,
                responseMimeType: "application/json"
            }
        });

        const responseText = (result.text ?? '').trim();
        let jsonResponse;
        
        try {
            jsonResponse = JSON.parse(responseText);
        } catch {
            console.error('Failed to parse AI skill assessment response:', responseText);
            // Fallback to averaging existing ratings
            return getSkillAveragesFromRatings(metrics.existingRatings);
        }
        
        return [
            { subject: 'Logic', A: Math.min(100, Math.max(1, jsonResponse.logic || 20)), fullMark: 100 },
            { subject: 'Syntax', A: Math.min(100, Math.max(1, jsonResponse.syntax || 20)), fullMark: 100 },
            { subject: 'Algorithms', A: Math.min(100, Math.max(1, jsonResponse.algorithms || 20)), fullMark: 100 },
            { subject: 'Debugging', A: Math.min(100, Math.max(1, jsonResponse.debugging || 20)), fullMark: 100 },
            { subject: 'Efficiency', A: Math.min(100, Math.max(1, jsonResponse.efficiency || 20)), fullMark: 100 },
            { subject: 'Creativity', A: Math.min(100, Math.max(1, jsonResponse.creativity || 20)), fullMark: 100 }
        ];
        
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
