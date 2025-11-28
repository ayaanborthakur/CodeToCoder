import { DailyChallenge } from '../types';

export const DAILY_CHALLENGES: DailyChallenge[] = [
    {
        id: 'dc_lesson_1',
        title: 'Learning Spree',
        description: 'Complete 1 lesson today',
        requirement: {
            type: 'lesson',
            count: 1
        },
        reward: 25,
        completed: false,
        progress: 0
    },
    {
        id: 'dc_lesson_3',
        title: 'Knowledge Hunter',
        description: 'Complete 3 lessons today',
        requirement: {
            type: 'lesson',
            count: 3
        },
        reward: 50,
        completed: false,
        progress: 0
    },
    {
        id: 'dc_practice_2',
        title: 'Practice Makes Perfect',
        description: 'Complete 2 practice problems',
        requirement: {
            type: 'practice',
            count: 2
        },
        reward: 30,
        completed: false,
        progress: 0
    },
    {
        id: 'dc_practice_5',
        title: 'Code Warrior',
        description: 'Complete 5 practice problems',
        requirement: {
            type: 'practice',
            count: 5
        },
        reward: 60,
        completed: false,
        progress: 0
    },
    {
        id: 'dc_quiz_1',
        title: 'Quiz Whiz',
        description: 'Complete 1 quiz with a perfect score',
        requirement: {
            type: 'quiz',
            count: 1
        },
        reward: 40,
        completed: false,
        progress: 0
    }
];
