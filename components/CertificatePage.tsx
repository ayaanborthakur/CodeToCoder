import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Lock, Printer } from 'lucide-react';
import type { Module } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { COURSES, getCourseProgress, resolveCourseModuleIds } from '../data/coursesData';
import { Button, EmptyState, Page } from './ui';
import Logo from '../assets/logo.svg?react';

/**
 * A printable certificate for a finished course. It only appears once every
 * lesson in the course is complete, and prints on one landscape page.
 */
export const CertificatePage: React.FC<{ modules: Module[]; completedLessons: Set<string> }> = ({ modules, completedLessons }) => {
    const { courseId } = useParams<{ courseId: string }>();
    const { user } = useAuth();
    const course = COURSES.find(c => c.id === courseId);

    const progress = useMemo(() => {
        if (!course) return null;
        const ids = modules.map(m => m.id);
        const byId = new Map(modules.map(m => [m.id, m] as const));
        return getCourseProgress(course.id, ids, byId, completedLessons);
    }, [course, modules, completedLessons]);

    if (!course || !progress) {
        return <Page><EmptyState title="Course not found" action={<Link to="/lessons">All courses</Link>} /></Page>;
    }
    const finished = progress.total > 0 && progress.completed === progress.total;
    if (!finished) {
        return (
            <Page>
                <EmptyState
                    icon={<Lock className="w-5 h-5" />}
                    title="Finish the course to get your certificate"
                    description={`You’ve done ${progress.completed} of ${progress.total} lessons in ${course.title}.`}
                    action={<Link to={`/courses/${course.id}`} className="font-semibold">Back to the course</Link>}
                />
            </Page>
        );
    }

    const issued = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    const allIds = new Set(modules.map(m => m.id));
    const moduleCount = resolveCourseModuleIds(course.id, [...allIds]).filter(id => allIds.has(id)).length;

    return (
        <Page width="wide">
            <Helmet><title>{`${course.title} certificate`}</title></Helmet>
            <div className="print:hidden flex flex-wrap items-center justify-between gap-3 mb-6">
                <Link to={`/courses/${course.id}`} className="no-hover inline-flex items-center gap-1.5 font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                    <ArrowLeft className="w-4 h-4" /> {course.title}
                </Link>
                <Button variant="primary" icon={<Printer className="w-4 h-4" />} onClick={() => window.print()}>Print or save as PDF</Button>
            </div>

            <div className="certificate mx-auto max-w-4xl aspect-[11/8.5] bg-white text-slate-900 border border-slate-200 shadow-sm print:shadow-none print:border-0 p-3">
                <div className="h-full border-[3px] border-slate-900 p-2">
                    <div className="h-full border border-cyan-700 flex flex-col items-center justify-between text-center px-8 py-10 sm:px-16 sm:py-12">
                        <div className="flex items-center gap-3">
                            <Logo className="h-9 w-auto" />
                            <span className="text-xl font-bold tracking-tight">Code2Coder</span>
                        </div>
                        <div>
                            <div className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-700">Certificate of completion</div>
                            <div className="mt-6 text-base text-slate-600">This certifies that</div>
                            <div className="mt-2 text-3xl sm:text-5xl font-bold tracking-tight">{user?.name ?? 'Student'}</div>
                            <div className="mx-auto mt-3 h-px w-2/3 bg-slate-300" />
                            <div className="mt-5 text-base text-slate-600">has completed every lesson in</div>
                            <div className="mt-2 text-2xl sm:text-3xl font-semibold">{course.title}</div>
                            <div className="mt-3 text-slate-600">{progress.total} lessons{moduleCount ? ` across ${moduleCount} modules` : ''} of hands-on Python</div>
                        </div>
                        <div className="w-full grid grid-cols-2 gap-8 text-sm">
                            <div>
                                <div className="font-semibold">{issued}</div>
                                <div className="mt-1 border-t border-slate-300 pt-1 text-slate-500">Date issued</div>
                            </div>
                            <div>
                                <div className="font-semibold">code2coder.org</div>
                                <div className="mt-1 border-t border-slate-300 pt-1 text-slate-500">Free Python education for every student</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Page>
    );
};
