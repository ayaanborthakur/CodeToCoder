import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, Clock, Play, Trophy } from 'lucide-react';

export interface LessonCompleteInfo {
    lessonTitle: string;
    /** How many times the student ran their code before passing. */
    runs: number;
    seconds: number;
    /** The lesson that comes next, or null at the end of the course. */
    next: { title: string; moduleTitle: string } | null;
    /** Set when passing this lesson finished a module. */
    finishedModule: string | null;
}

const AUTO_ADVANCE_SECONDS = 6;

const formatDuration = (s: number) => {
    if (s < 60) return `${Math.max(1, s)}s`;
    const m = Math.floor(s / 60);
    return m < 60 ? `${m}m ${s % 60}s` : `${Math.floor(m / 60)}h ${m % 60}m`;
};

/**
 * Celebrates a passed lesson over the editor and moves on to the next one.
 * Counts down before advancing so students see they passed; hovering the
 * card pauses it, "Stay here" cancels it, Enter goes now.
 */
export const LessonCompleteCard: React.FC<{
    info: LessonCompleteInfo;
    onNext: () => void;
    onStay: () => void;
}> = ({ info, onNext, onStay }) => {
    const [remaining, setRemaining] = useState(AUTO_ADVANCE_SECONDS);
    const [paused, setPaused] = useState(false);
    const nextButton = useRef<HTMLButtonElement>(null);
    const autoAdvance = !!info.next;

    useEffect(() => { nextButton.current?.focus({ preventScroll: true }); }, []);

    useEffect(() => {
        if (!autoAdvance || paused) return;
        if (remaining <= 0) { onNext(); return; }
        const t = setTimeout(() => setRemaining(r => r - 1), 1000);
        return () => clearTimeout(t);
    }, [autoAdvance, paused, remaining, onNext]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onStay(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onStay]);

    const ring = 2 * Math.PI * 18;
    const progress = autoAdvance ? (AUTO_ADVANCE_SECONDS - remaining) / AUTO_ADVANCE_SECONDS : 1;
    const headline = !info.next ? 'Course complete!' : info.finishedModule ? 'Module complete!' : 'Lesson complete!';

    return (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-[2px] animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="lesson-complete-title">
            <div
                className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden animate-slide-up"
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
            >
                <div className="px-6 pt-6 pb-5 text-center">
                    <div className="mx-auto mb-3 w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                        {info.next ? <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" aria-hidden="true" /> : <Trophy className="w-8 h-8 text-amber-500" aria-hidden="true" />}
                    </div>
                    <h2 id="lesson-complete-title" className="text-xl font-bold text-gray-900 dark:text-white">{headline}</h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                        {info.finishedModule
                            ? <>You finished <span className="font-semibold">{info.finishedModule}</span>.</>
                            : <>You passed <span className="font-semibold">{info.lessonTitle}</span>.</>}
                    </p>
                    <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="inline-flex items-center gap-1"><Play className="w-3.5 h-3.5" aria-hidden="true" />{info.runs} {info.runs === 1 ? 'run' : 'runs'}</span>
                        <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" aria-hidden="true" />{formatDuration(info.seconds)}</span>
                    </div>
                </div>

                {info.next && (
                    <div className="mx-6 mb-5 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 px-4 py-3 text-left">
                        <div className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">{info.finishedModule ? `Up next · ${info.next.moduleTitle}` : 'Up next'}</div>
                        <div className="mt-0.5 font-semibold text-gray-900 dark:text-white truncate">{info.next.title}</div>
                    </div>
                )}

                <div className="flex items-center gap-3 px-6 pb-6">
                    <button
                        onClick={onStay}
                        className="no-hover flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        {info.next ? 'Stay here' : 'Keep coding'}
                    </button>
                    <button
                        ref={nextButton}
                        onClick={onNext}
                        className="no-hover flex-1 relative inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-500"
                    >
                        {autoAdvance && !paused && (
                            <svg className="w-5 h-5 -ml-1 -rotate-90" viewBox="0 0 40 40" aria-hidden="true">
                                <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeOpacity="0.3" strokeWidth="4" />
                                <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"
                                    strokeDasharray={ring} strokeDashoffset={ring * (1 - progress)} style={{ transition: 'stroke-dashoffset 1s linear' }} />
                            </svg>
                        )}
                        {info.next ? (info.finishedModule ? 'Start next module' : 'Next lesson') : 'Back to course'}
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                </div>
                {autoAdvance && (
                    <p className="pb-4 -mt-2 text-center text-xs text-gray-500 dark:text-gray-400" aria-live="polite">
                        {paused ? 'Paused. Press Next when you are ready.' : `Moving on in ${remaining}s…`}
                    </p>
                )}
            </div>
        </div>
    );
};
