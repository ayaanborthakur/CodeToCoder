import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
    ArrowRight, BarChart3, BookOpen, CalendarDays, Check, ChevronDown, ClipboardCheck, Code2, Gauge, Laptop,
    Lock, Mail, MessageSquareText, Radio, ShieldCheck, Users,
} from 'lucide-react';
import { INQUIRIES_EMAIL, RegisterSchoolForm } from './RegisterSchoolDialog';
import { ViewState } from './Header';
import FooterLogo from '../assets/FooterLogo.svg?react';

interface MissionPageProps {
    onStart: () => void;
    onNavigate: (view: ViewState) => void;
}

/** Scroll to a section of the landing page by id. */
const scrollToSection = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

const FACTS = [
    { value: '140', label: 'lessons with runnable code' },
    { value: '20', label: 'modules, from print() to algorithms' },
    { value: '0', label: 'installs: it runs in the browser' },
    { value: '$0', label: 'for students, teachers and schools' },
];

const STUDENT_FEATURES = [
    { icon: <Laptop className="w-5 h-5" />, title: 'Runs on any school device', body: 'Python runs inside the browser, so Chromebooks and shared lab computers work with nothing to install or approve.' },
    { icon: <MessageSquareText className="w-5 h-5" />, title: 'A tutor that gives hints, not answers', body: 'Stuck students get a nudge about their own code and error message. The full solution is never handed over.' },
    { icon: <Code2 className="w-5 h-5" />, title: 'Learn by writing real code', body: 'Every lesson has code to run and an automatic check, plus quizzes, coding problems and mini projects for practice.' },
    { icon: <Gauge className="w-5 h-5" />, title: 'Progress that saves itself', body: 'Work is saved as students go, so they can pick up where they left off at school or at home.' },
];

const TEACHER_FEATURES = [
    { icon: <BookOpen className="w-5 h-5" />, title: 'Assign lessons in bulk', body: 'Tick whole modules, set one due date or space them out, and assign to the class or a few students.' },
    { icon: <ClipboardCheck className="w-5 h-5" />, title: 'Grade in one queue', body: 'See every submission with the student’s code, output and automatic check. Give full credit to passing work in one click.' },
    { icon: <BarChart3 className="w-5 h-5" />, title: 'A gradebook you can export', body: 'Color-coded status for every student and assignment, filtered by module, with CSV export for your school system.' },
    { icon: <Radio className="w-5 h-5" />, title: 'Live activity', body: 'See who is working right now and what was just handed in, without walking the room.' },
    { icon: <CalendarDays className="w-5 h-5" />, title: 'Calendar and pacing', body: 'Due dates across all your classes in one calendar. Lock modules your class hasn’t reached yet.' },
    { icon: <Lock className="w-5 h-5" />, title: 'Your late-work policy', body: 'Accept late work or close it at the due date, with an optional percentage penalty applied for you.' },
];

const MODULES = [
    'Python Basics', 'Variables & Data Types', 'Operators & Expressions', 'Control Flow Basics', 'Checkpoint A',
    'Loops', 'Functions', 'Lists', 'Dictionaries', 'Checkpoint B',
    'Advanced Functions', 'String Methods', 'File I/O', 'Error Handling', 'Checkpoint C',
    'Object-Oriented Programming', 'Modules & Packages', 'Comprehensions', 'Algorithms', 'Checkpoint D',
];
const NEXT_COURSES = ['Data Structures', 'Object-Oriented Programming', 'File Handling & Databases', 'Algorithms & Recursion'];

const FAQS: { q: string; a: React.ReactNode }[] = [
    { q: 'Is Code2Coder really free?', a: 'Yes. Code2Coder is a free, student-run project. There is no paid tier, no trial and no ads, for students, teachers or schools.' },
    { q: 'What devices does it work on?', a: 'Any recent Chrome, Edge, Safari or Firefox browser, including school Chromebooks. Python runs in the browser itself, so there is nothing to install and nothing for IT to approve.' },
    { q: 'What grades is it for?', a: 'The course is written for middle and high school students with no coding experience. Lessons start with printing text and build up to functions, data structures, objects and algorithms.' },
    { q: 'How does the AI tutor work?', a: 'When a student asks for help or gets an error, the tutor sees the lesson, their code and their question, and replies with a hint. It is told not to give the full answer. Daily limits keep it from replacing the student’s own thinking.' },
    { q: 'How do I use it with my class?', a: 'Sign up as a teacher, create a class and share the six-letter join code. Then assign lessons or practice problems, and grade what students hand in from your gradebook.' },
    { q: 'What student data do you collect?', a: <>Only what the app needs to work: name, email, username, progress and the code students write. We never sell data or show ads. Read the details in our <Link to="/privacy">privacy policy</Link>.</> },
    { q: 'Can my school or district get set up together?', a: <>Yes. Use the form below to register your school, or email <a href={`mailto:${INQUIRIES_EMAIL}`}>{INQUIRIES_EMAIL}</a>.</> },
];

const Eyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="text-sm font-semibold uppercase tracking-[0.08em] text-cyan-700 dark:text-cyan-400 mb-3">{children}</div>
);

const SectionHeading: React.FC<{ eyebrow: string; title: string; body?: string; center?: boolean }> = ({ eyebrow, title, body, center }) => (
    <div className={center ? 'max-w-3xl mx-auto text-center' : 'max-w-3xl'}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h2>
        {body && <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">{body}</p>}
    </div>
);

export const MissionPage: React.FC<MissionPageProps> = ({ onStart, onNavigate }) => {
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    // Arriving from another page via a link like /#faq.
    useEffect(() => {
        const id = window.location.hash.slice(1);
        if (id) window.setTimeout(() => scrollToSection(id), 50);
    }, []);

    return (
        <div className="min-h-full bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans antialiased">
            <Helmet>
                <title>Code2Coder: free Python course and classroom tools for schools</title>
                <meta name="description" content="A free, complete Python course that runs in the browser, with an AI tutor that gives hints instead of answers and classroom tools for teachers: assignments, grading and a gradebook." />
                <meta property="og:title" content="Code2Coder: free Python course and classroom tools for schools" />
                <meta property="og:description" content="Free Python lessons that run in any browser, with an AI tutor and teacher tools for assignments, grading and a gradebook." />
                <meta property="og:type" content="website" />
                <link rel="canonical" href="https://code2coder.org" />
            </Helmet>

            {/* Hero */}
            <section className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-center">
                    <div>
                        <Eyebrow>Free Python curriculum for grades 6–12</Eyebrow>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.05]">
                            Teach and learn Python, right in the browser.
                        </h1>
                        <p className="mt-6 text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                            A complete beginner Python course with runnable lessons, an AI tutor that gives hints instead of answers, and the classroom tools teachers need to assign, grade and track it.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <button onClick={onStart} className="no-hover inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white font-semibold">
                                Start learning free <ArrowRight className="w-5 h-5" />
                            </button>
                            <button onClick={() => scrollToSection('teachers')} className="no-hover inline-flex items-center gap-2 px-6 py-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800">
                                I’m a teacher
                            </button>
                        </div>
                        <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-slate-600 dark:text-slate-400">
                            {['No installs', 'Works on Chromebooks', 'No ads, ever'].map(t => (
                                <li key={t} className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-700 dark:text-cyan-400" />{t}</li>
                            ))}
                        </ul>
                    </div>
                    <ProductPreview />
                </div>
            </section>

            {/* Facts */}
            <section className="border-b border-slate-200 dark:border-slate-800">
                <dl className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {FACTS.map(f => (
                        <div key={f.label}>
                            <dt className="sr-only">{f.label}</dt>
                            <dd className="text-4xl font-bold text-slate-900 dark:text-white tabular-nums">{f.value}</dd>
                            <dd className="mt-1 text-slate-600 dark:text-slate-400">{f.label}</dd>
                        </div>
                    ))}
                </dl>
            </section>

            {/* Students */}
            <section id="students" className="scroll-mt-20 max-w-7xl mx-auto px-6 py-20 md:py-24">
                <SectionHeading eyebrow="For students" title="Write real Python from the first lesson" body="Short lessons explain one idea at a time, then students write and run code to try it. Every exercise checks the result automatically, so they know when they’ve got it." />
                <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {STUDENT_FEATURES.map(f => <Feature key={f.title} {...f} />)}
                </div>
            </section>

            {/* Teachers */}
            <section id="teachers" className="scroll-mt-20 bg-slate-900 dark:bg-slate-900 text-white">
                <div className="max-w-7xl mx-auto px-6 py-20 md:py-24">
                    <div className="max-w-3xl">
                        <div className="text-sm font-semibold uppercase tracking-[0.08em] text-cyan-400 mb-3">For teachers</div>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Run a coding class without a CS background</h2>
                        <p className="mt-4 text-lg text-slate-300 leading-relaxed">The curriculum is written and the exercises check themselves. You decide the pacing, assign the work and see exactly where each student is.</p>
                    </div>
                    <div className="mt-12 grid lg:grid-cols-[1fr_1.05fr] gap-12 items-start">
                        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-8">
                            {TEACHER_FEATURES.map(f => (
                                <div key={f.title}>
                                    <span className="w-10 h-10 rounded-lg bg-cyan-500/15 text-cyan-300 flex items-center justify-center">{f.icon}</span>
                                    <h3 className="mt-4 font-semibold text-lg">{f.title}</h3>
                                    <p className="mt-1.5 text-slate-300 leading-relaxed">{f.body}</p>
                                </div>
                            ))}
                        </div>
                        <GradebookPreview />
                    </div>
                    <div className="mt-12">
                        <button onClick={onStart} className="no-hover inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold">
                            Create a teacher account <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Curriculum */}
            <section id="curriculum" className="scroll-mt-20 max-w-7xl mx-auto px-6 py-20 md:py-24">
                <div className="grid lg:grid-cols-[1fr_1.5fr] gap-12 items-start">
                    <div>
                        <SectionHeading eyebrow="Curriculum" title="Python Basics: 20 modules, 140 lessons" body="Each module mixes reading lessons, coding exercises, quizzes and a project. Four checkpoints review everything before students move on." />
                        <div className="mt-8 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
                            <h3 className="font-semibold text-slate-900 dark:text-white">Coming next</h3>
                            <ul className="mt-3 space-y-2 text-slate-600 dark:text-slate-400">
                                {NEXT_COURSES.map(c => <li key={c} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-cyan-600" />{c}</li>)}
                            </ul>
                        </div>
                    </div>
                    <ol className="grid sm:grid-cols-2 gap-x-6 border-t border-slate-200 dark:border-slate-800">
                        {MODULES.map((m, i) => (
                            <li key={m} className="flex items-center gap-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
                                <span className="w-8 text-sm font-mono font-semibold text-cyan-700 dark:text-cyan-400 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                                <span className={m.startsWith('Checkpoint') ? 'text-slate-500 dark:text-slate-400' : 'font-medium text-slate-900 dark:text-white'}>{m}</span>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* Privacy */}
            <section id="privacy" className="scroll-mt-20 border-y border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                <div className="max-w-7xl mx-auto px-6 py-20 md:py-24 grid lg:grid-cols-[1fr_1.3fr] gap-12 items-start">
                    <SectionHeading eyebrow="Privacy and safety" title="Built for students, so built carefully" body="Schools trust us with students’ work. Here is exactly what we do with it." />
                    <ul className="grid sm:grid-cols-2 gap-6">
                        {[
                            ['No ads, no selling data', 'We don’t show ads and we never sell or rent student information.'],
                            ['Only what the app needs', 'Name, email, username, progress and the code students write. Nothing else is required.'],
                            ['Clear AI use', 'The tutor sees only the lesson, the student’s code and their question, sent through our own server.'],
                            ['Delete any time', 'Students can delete their account from their profile, and teachers can remove students from a class.'],
                        ].map(([t, b]) => (
                            <li key={t} className="flex gap-3">
                                <ShieldCheck className="w-6 h-6 text-cyan-700 dark:text-cyan-400 flex-shrink-0" />
                                <span>
                                    <span className="block font-semibold text-slate-900 dark:text-white">{t}</span>
                                    <span className="block mt-1 text-slate-600 dark:text-slate-400">{b}</span>
                                </span>
                            </li>
                        ))}
                        <li className="sm:col-span-2">
                            <Link to="/privacy" className="inline-flex items-center gap-1.5 font-semibold text-cyan-700 dark:text-cyan-400 hover:underline">Read the full privacy policy <ArrowRight className="w-4 h-4" /></Link>
                        </li>
                    </ul>
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="scroll-mt-20 max-w-4xl mx-auto px-6 py-20 md:py-24">
                <SectionHeading eyebrow="FAQ" title="Common questions" center />
                <div className="mt-10 divide-y divide-slate-200 dark:divide-slate-800 border-y border-slate-200 dark:border-slate-800">
                    {FAQS.map((f, i) => {
                        const open = openFaq === i;
                        return (
                            <div key={f.q}>
                                <button onClick={() => setOpenFaq(open ? null : i)} aria-expanded={open} className="no-hover w-full flex items-center justify-between gap-4 py-5 text-left">
                                    <span className="text-lg font-semibold text-slate-900 dark:text-white">{f.q}</span>
                                    <ChevronDown className={`w-5 h-5 text-slate-500 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
                                </button>
                                {open && <div className="pb-5 -mt-1 text-slate-600 dark:text-slate-400 leading-relaxed">{f.a}</div>}
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Register your school */}
            <section id="register-school" className="scroll-mt-20 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                <div className="max-w-6xl mx-auto px-6 py-20 md:py-24 grid md:grid-cols-[1fr_1.3fr] gap-12 md:gap-16 items-start">
                    <div>
                        <SectionHeading eyebrow="For schools" title="Register your school" body="Code2Coder is free for every school. Tell us about yours and we’ll help you get teachers and students set up." />
                        <div className="mt-8 flex items-start gap-3">
                            <span className="w-10 h-10 rounded-lg bg-cyan-700/10 dark:bg-cyan-400/10 text-cyan-700 dark:text-cyan-400 flex items-center justify-center flex-shrink-0">
                                <Mail className="w-5 h-5" />
                            </span>
                            <div>
                                <div className="text-sm font-semibold text-slate-900 dark:text-white">For inquiries</div>
                                <a href={`mailto:${INQUIRIES_EMAIL}`} className="font-medium text-cyan-700 dark:text-cyan-400 hover:underline">{INQUIRIES_EMAIL}</a>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 md:p-8">
                        <RegisterSchoolForm compact />
                    </div>
                </div>
            </section>

            {/* Closing call to action */}
            <section className="bg-slate-900 text-white">
                <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Write your first line of Python today.</h2>
                        <p className="mt-2 text-slate-300 text-lg">Free, in the browser, no download.</p>
                    </div>
                    <button onClick={onStart} className="no-hover inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold self-start md:self-auto">
                        Get started <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </section>

            <SiteFooter onNavigate={onNavigate} />
        </div>
    );
};

const Feature: React.FC<{ icon: React.ReactNode; title: string; body: string }> = ({ icon, title, body }) => (
    <div>
        <span className="w-10 h-10 rounded-lg bg-cyan-700/10 dark:bg-cyan-400/10 text-cyan-700 dark:text-cyan-400 flex items-center justify-center">{icon}</span>
        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
        <p className="mt-1.5 text-slate-600 dark:text-slate-400 leading-relaxed">{body}</p>
    </div>
);

/** A still picture of the lesson workspace, drawn in HTML so it stays sharp and themed. */
const ProductPreview: React.FC = () => (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 shadow-xl overflow-hidden" aria-label="Preview of a Code2Coder lesson" role="img">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" /><span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" /><span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span className="ml-3 text-xs font-medium text-slate-500">Loops · Lesson 3 of 7</span>
        </div>
        <div className="grid sm:grid-cols-[0.9fr_1.1fr]">
            <div className="p-5 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800">
                <div className="text-xs font-semibold text-cyan-700 dark:text-cyan-400">Your task</div>
                <div className="mt-1 font-semibold text-slate-900 dark:text-white">Count down with a while loop</div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Print the numbers from 5 down to 1, then print <code className="font-mono text-[0.85em] px-1 rounded bg-slate-100 dark:bg-slate-800">Liftoff!</code></p>
                <div className="mt-4 rounded-lg border border-cyan-200 dark:border-cyan-900 bg-cyan-50 dark:bg-cyan-950/40 p-3 text-sm">
                    <div className="font-semibold text-cyan-900 dark:text-cyan-200">Your tutor</div>
                    <p className="mt-1 text-cyan-900/80 dark:text-cyan-200/80">Nice work. Try starting at 10 instead: which line do you need to change?</p>
                </div>
            </div>
            <div className="bg-slate-900 text-slate-100 font-mono text-[13px] leading-6">
                <pre className="p-4"><span className="text-slate-500">1</span>  n = <span className="text-amber-300">5</span>{'\n'}<span className="text-slate-500">2</span>  <span className="text-cyan-300">while</span> n &gt; <span className="text-amber-300">0</span>:{'\n'}<span className="text-slate-500">3</span>      <span className="text-sky-300">print</span>(n){'\n'}<span className="text-slate-500">4</span>      n = n - <span className="text-amber-300">1</span>{'\n'}<span className="text-slate-500">5</span>  <span className="text-sky-300">print</span>(<span className="text-emerald-300">"Liftoff!"</span>)</pre>
                <div className="border-t border-slate-700 px-4 py-3">
                    <div className="text-[11px] uppercase tracking-wider text-slate-400">Output</div>
                    <div className="mt-1 text-slate-200">5 4 3 2 1 Liftoff!</div>
                    <div className="mt-2 inline-flex items-center gap-1.5 text-emerald-300 font-sans text-sm font-semibold"><Check className="w-4 h-4" /> Check passed</div>
                </div>
            </div>
        </div>
    </div>
);

const GRADEBOOK_ROWS: { name: string; cells: [string, string][] }[] = [
    { name: 'Ava P.', cells: [['10/10', 'g'], ['9/10', 'g'], ['To grade', 's']] },
    { name: 'Leo K.', cells: [['10/10', 'g'], ['Late', 'l'], ['—', 'n']] },
    { name: 'Mia L.', cells: [['8/10', 'g'], ['10/10', 'g'], ['To grade', 's']] },
    { name: 'Noah S.', cells: [['Missing', 'm'], ['7/10', 'g'], ['—', 'n']] },
];
const CELL: Record<string, string> = {
    g: 'bg-emerald-500/15 text-emerald-200',
    s: 'bg-cyan-500/15 text-cyan-200',
    l: 'bg-amber-500/15 text-amber-200',
    m: 'bg-red-500/15 text-red-200',
    n: 'text-slate-500',
};

const GradebookPreview: React.FC = () => (
    <div className="rounded-xl border border-slate-700 bg-slate-950 overflow-hidden" role="img" aria-label="Preview of the Code2Coder gradebook">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <span className="font-semibold flex items-center gap-2"><Users className="w-4 h-4 text-cyan-300" />Period 2 · Gradebook</span>
            <span className="text-xs text-slate-400">Export CSV</span>
        </div>
        <table className="w-full text-sm">
            <thead>
                <tr className="text-left text-slate-400">
                    <th className="px-4 py-2.5 font-medium">Student</th>
                    <th className="px-2 py-2.5 font-medium">Loops</th>
                    <th className="px-2 py-2.5 font-medium">Functions</th>
                    <th className="px-2 py-2.5 font-medium">Lists</th>
                </tr>
            </thead>
            <tbody>
                {GRADEBOOK_ROWS.map(r => (
                    <tr key={r.name} className="border-t border-slate-800">
                        <td className="px-4 py-2.5 font-medium text-slate-100">{r.name}</td>
                        {r.cells.map(([v, k], i) => (
                            <td key={i} className="px-2 py-1.5"><span className={`inline-block w-full rounded px-2 py-1 text-xs font-semibold ${CELL[k]}`}>{v}</span></td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

/** Shared footer for the landing page and the public info pages. */
export const SiteFooter: React.FC<{ onNavigate: (view: ViewState) => void }> = ({ onNavigate }) => {
    const linkClass = 'text-slate-600 dark:text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-400';
    const onLanding = typeof window !== 'undefined' && window.location.pathname === '/';
    const section = (id: string) => onLanding ? scrollToSection(id) : (window.location.href = `/#${id}`);
    return (
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <div className="max-w-7xl mx-auto px-6 pt-14 pb-10">
                <div className="grid sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] gap-10">
                    <div>
                        <div className="flex items-center gap-3">
                            <FooterLogo className="h-8 w-auto" />
                            <span className="font-semibold text-lg text-slate-900 dark:text-white">Code2Coder</span>
                        </div>
                        <p className="mt-4 text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">Free Python education for every student and every school. Built by students at Bellarmine College Preparatory in San Jose, California.</p>
                        <a href={`mailto:${INQUIRIES_EMAIL}`} className="mt-4 inline-block font-medium text-cyan-700 dark:text-cyan-400 hover:underline">{INQUIRIES_EMAIL}</a>
                    </div>
                    <FooterColumn title="Product">
                        <button onClick={() => section('students')} className={`no-hover ${linkClass}`}>For students</button>
                        <button onClick={() => section('teachers')} className={`no-hover ${linkClass}`}>For teachers</button>
                        <button onClick={() => section('curriculum')} className={`no-hover ${linkClass}`}>Curriculum</button>
                        <button onClick={() => section('faq')} className={`no-hover ${linkClass}`}>FAQ</button>
                    </FooterColumn>
                    <FooterColumn title="Schools">
                        <button onClick={() => section('register-school')} className={`no-hover ${linkClass}`}>Register your school</button>
                        <button onClick={() => onNavigate('schools')} className={`no-hover ${linkClass}`}>Schools using Code2Coder</button>
                        <button onClick={() => onNavigate('about')} className={`no-hover ${linkClass}`}>About the team</button>
                    </FooterColumn>
                    <FooterColumn title="Legal">
                        <Link to="/privacy" className={`no-hover ${linkClass}`}>Privacy policy</Link>
                        <Link to="/terms" className={`no-hover ${linkClass}`}>Terms of use</Link>
                    </FooterColumn>
                </div>
                <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-2 text-sm text-slate-500">
                    <p>© {new Date().getFullYear()} Code2Coder</p>
                    <p>San Jose, California</p>
                </div>
            </div>
        </footer>
    );
};

const FooterColumn: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <nav aria-label={title}>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
        <div className="mt-4 flex flex-col items-start gap-3">{children}</div>
    </nav>
);
