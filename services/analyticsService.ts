import { logEvent } from 'firebase/analytics';
import { analytics } from './firebase';

// Authentication Events
export const logSignUp = (method: 'email' | 'anonymous') => {
    try {
        logEvent(analytics, 'sign_up', {
            method
        });
    } catch (error) {
        console.error('Failed to log sign_up event:', error);
    }
};

export const logLogin = (method: 'email' | 'anonymous') => {
    try {
        logEvent(analytics, 'login', {
            method
        });
    } catch (error) {
        console.error('Failed to log login event:', error);
    }
};

export const logLogout = () => {
    try {
        logEvent(analytics, 'logout');
    } catch (error) {
        console.error('Failed to log logout event:', error);
    }
};

export const logAccountDelete = () => {
    try {
        logEvent(analytics, 'account_delete');
    } catch (error) {
        console.error('Failed to log account_delete event:', error);
    }
};

// Learning Events
export const logLessonStart = (lessonId: string, lessonTitle: string) => {
    try {
        logEvent(analytics, 'lesson_start', {
            lesson_id: lessonId,
            lesson_title: lessonTitle
        });
    } catch (error) {
        console.error('Failed to log lesson_start event:', error);
    }
};

export const logLessonComplete = (lessonId: string, lessonTitle: string) => {
    try {
        logEvent(analytics, 'lesson_complete', {
            lesson_id: lessonId,
            lesson_title: lessonTitle
        });
    } catch (error) {
        console.error('Failed to log lesson_complete event:', error);
    }
};

export const logQuizStart = (quizId: string, quizTitle: string) => {
    try {
        logEvent(analytics, 'quiz_start', {
            quiz_id: quizId,
            quiz_title: quizTitle
        });
    } catch (error) {
        console.error('Failed to log quiz_start event:', error);
    }
};

export const logQuizComplete = (quizId: string, quizTitle: string, score?: number) => {
    try {
        logEvent(analytics, 'quiz_complete', {
            quiz_id: quizId,
            quiz_title: quizTitle,
            score
        });
    } catch (error) {
        console.error('Failed to log quiz_complete event:', error);
    }
};

// Practice Events
export const logPracticeStart = (itemId: string, itemTitle: string, itemType: string) => {
    try {
        logEvent(analytics, 'practice_start', {
            item_id: itemId,
            item_title: itemTitle,
            item_type: itemType
        });
    } catch (error) {
        console.error('Failed to log practice_start event:', error);
    }
};

export const logPracticeComplete = (itemId: string, itemTitle: string, itemType: string) => {
    try {
        logEvent(analytics, 'practice_complete', {
            item_id: itemId,
            item_title: itemTitle,
            item_type: itemType
        });
    } catch (error) {
        console.error('Failed to log practice_complete event:', error);
    }
};

// Playground Events
export const logPlaygroundCreate = (fileName: string) => {
    try {
        logEvent(analytics, 'playground_create', {
            file_name: fileName
        });
    } catch (error) {
        console.error('Failed to log playground_create event:', error);
    }
};

export const logPlaygroundRun = () => {
    try {
        logEvent(analytics, 'playground_run');
    } catch (error) {
        console.error('Failed to log playground_run event:', error);
    }
};

export const logCodeExport = (source: 'playground' | 'classroom' | 'practice') => {
    try {
        logEvent(analytics, 'code_export', {
            source
        });
    } catch (error) {
        console.error('Failed to log code_export event:', error);
    }
};

// Navigation Events
export const logPageView = (pageName: string) => {
    try {
        logEvent(analytics, 'page_view', {
            page_name: pageName
        });
    } catch (error) {
        console.error('Failed to log page_view event:', error);
    }
};
