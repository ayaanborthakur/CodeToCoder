import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, ChevronDown, Users } from 'lucide-react';
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

// The Python Basics course, grouped the way it is taught: four units, each
// closed by a checkpoint. Module and project names are the real ones.
const UNITS = [
    {
        name: 'Foundations',
        summary: 'From a first print() to programs that take input and make decisions.',
        outcomes: [
            'Write, run and comment a Python program',
            'Store values in variables and convert between types',
            'Do math and build strings with operators',
            'Branch with if, elif and else, including nested logic',
        ],
        modules: [
            ['Python Basics', 'Personal Profile Generator'],
            ['Variables & Data Types', 'Mad Libs Game'],
            ['Operators & Expressions', 'Simple Calculator'],
            ['Control Flow Basics', 'Adventure Game Decision Tree'],
        ],
        checkpoint: 'Checkpoint A: Foundations Review',
    },
    {
        name: 'Loops, functions and data',
        summary: 'Repeat work, break programs into functions and organize data.',
        outcomes: [
            'Use for and while loops, with break and continue',
            'Define functions with parameters, return values and scope',
            'Build, change and search lists',
            'Model real records with dictionaries',
        ],
        modules: [
            ['Loops', 'Interactive Menu Calculator'],
            ['Functions', 'Grade Calculator'],
            ['Lists', 'Student Gradebook'],
            ['Dictionaries', 'Contact Book'],
        ],
        checkpoint: 'Checkpoint B: Data Structures Review',
    },
    {
        name: 'Real-world programs',
        summary: 'Work with text and files, and write programs that don’t crash.',
        outcomes: [
            'Use lambdas, recursion and higher-order functions',
            'Format, search and transform text',
            'Read and write files to save data between runs',
            'Catch and raise exceptions to handle bad input',
        ],
        modules: [
            ['Advanced Functions', 'Data Pipeline'],
            ['String Methods', 'Text Processor'],
            ['File I/O', 'Note Taking App'],
            ['Error Handling', 'Robust App'],
        ],
        checkpoint: 'Checkpoint C: Advanced Concepts Review',
    },
    {
        name: 'Structuring bigger programs',
        summary: 'Classes, the standard library and the basics of algorithms.',
        outcomes: [
            'Design classes with inheritance and encapsulation',
            'Import modules and use the standard library',
            'Write list, dictionary and set comprehensions and generators',
            'Search and sort, and compare approaches with Big O',
        ],
        modules: [
            ['Object-Oriented Programming', 'Library System'],
            ['Modules & Packages', 'Roll & Record'],
            ['Comprehensions', 'Log Data Processor'],
            ['Algorithms', 'The Duplicate Finder'],
        ],
        checkpoint: 'Checkpoint D: Comprehensive Review',
    },
];
const NEXT_COURSES = 'Data Structures, Object-Oriented Programming, File Handling & Databases, and Algorithms & Recursion';

const LESSON_STEPS = [
    ['Read', 'A short explanation of one idea, with examples you can run.'],
    ['Write', 'Code in a real editor with syntax highlighting, right next to the instructions.'],
    ['Run and check', 'Python runs in the browser, and an automatic check says whether the program does what the task asks.'],
    ['Get unstuck', 'Ask the tutor. It reads your code and error and points you in the right direction, without writing the answer for you.'],
];

const TEACHER_TOOLS = [
    ['Assign in bulk', 'Pick lessons or whole modules, set one due date or space them out, and assign to the class or a few students.'],
    ['Grade from one queue', 'Every submission shows the student’s code, output and check result. Passing work can get full credit in one click.'],
    ['Gradebook', 'Status for every student and assignment at a glance, filtered by module, with CSV export.'],
    ['Live activity', 'Who is working right now, and what was just handed in.'],
    ['Pacing', 'Lock modules your class hasn’t reached, and see every due date on a calendar.'],
    ['Late work', 'Accept it, close it at the due date, or take off a percentage automatically.'],
];

const FAQS: { q: string; a: React.ReactNode }[] = [
    { q: 'Is it really free?', a: 'Yes, for students, teachers and schools. There is no paid plan, no trial and no advertising.' },
    { q: 'Who is it for?', a: 'Anyone learning to code for the first time, at any age. Lessons assume no experience, so it works for a middle or high school class, a college intro course, a club, or learning on your own.' },
    { q: 'What do we need to run it?', a: 'A recent Chrome, Edge, Safari or Firefox browser. Python runs in the browser itself, so there is nothing to install and school Chromebooks work.' },
    { q: 'How does the AI tutor work?', a: 'When a student asks for help, the tutor sees the lesson, their code and their question, and replies with a hint. It is instructed not to give full solutions, and each account has a daily limit.' },
    { q: 'How do I set up a class?', a: 'Sign up as a teacher, create a class and share its six-letter join code. Then assign lessons and grade what students hand in.' },
    { q: 'What student data do you keep?', a: <>Only what the app needs: name, email, username, progress and the code students write. We never sell data or show ads. See the <Link to="/privacy" className="text-cyan-700 dark:text-cyan-400 underline underline-offset-2">privacy policy</Link>.</> },
];

export const MissionPage: React.FC<MissionPageProps> = ({ onStart, onNavigate }) => {
    const [unit, setUnit] = useState(0);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    // Arriving from another page via a link like /#faq.
    useEffect(() => {
        const id = window.location.hash.slice(1);
        if (id) window.setTimeout(() => scrollToSection(id), 50);
    }, []);

    const u = UNITS[unit];

    return (
        <div className="min-h-full bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans antialiased">
            <Helmet>
                <title>Code2Coder: a free Python course with classroom tools</title>
                <meta name="description" content="A free Python course that runs in the browser: 140 lessons and 20 projects, an AI tutor that gives hints instead of answers, and tools for teachers to assign and grade." />
                <meta property="og:title" content="Code2Coder: a free Python course with classroom tools" />
                <meta property="og:description" content="Free Python lessons and projects that run in any browser, with an AI tutor and teacher tools for assigning and grading." />
                <meta property="og:type" content="website" />
                <link rel="canonical" href="https://code2coder.org" />
            </Helmet>

            {/* Hero */}
            <section className="max-w-7xl mx-auto px-6 pt-14 pb-16 md:pt-20 md:pb-24 grid lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-16 items-center">
                <div>
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                        Learn Python by writing it.
                    </h1>
                    <p className="mt-5 text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                        Code2Coder is a free Python course that runs in the browser. Students write and run real programs from the first lesson, get hints from an AI tutor when they’re stuck, and teachers assign and grade it all in one place.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <button onClick={onStart} className="no-hover inline-flex items-center gap-2 px-5 py-3 rounded-md bg-cyan-700 hover:bg-cyan-800 text-white font-semibold">
                            Start learning <ArrowRight className="w-4 h-4" />
                        </button>
                        <button onClick={() => scrollToSection('teachers')} className="no-hover inline-flex items-center px-5 py-3 rounded-md border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold hover:bg-slate-50 dark:hover:bg-slate-900">
                            Set up a class
                        </button>
                    </div>
                    <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">Free for everyone · No installs · Works on Chromebooks</p>
                </div>
                <ProductPreview />
            </section>

            {/* How a lesson works */}
            <section className="border-t border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-6 py-16 md:py-20 grid lg:grid-cols-[1fr_2fr] gap-10">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Every lesson ends in code that runs</h2>
                        <p className="mt-3 text-slate-600 dark:text-slate-400 leading-relaxed">No videos to sit through. Each lesson teaches one idea and has students use it straight away.</p>
                    </div>
                    <ol className="grid sm:grid-cols-2 gap-x-10 gap-y-8">
                        {LESSON_STEPS.map(([t, b], i) => (
                            <li key={t} className="border-t-2 border-slate-900 dark:border-slate-200 pt-4">
                                <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 tabular-nums">Step {i + 1}</div>
                                <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{t}</h3>
                                <p className="mt-1.5 text-slate-600 dark:text-slate-400 leading-relaxed">{b}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* Curriculum */}
            <section id="curriculum" className="scroll-mt-20 bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
                    <div className="max-w-3xl">
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">What students learn</h2>
                        <p className="mt-3 text-slate-600 dark:text-slate-400 leading-relaxed">
                            Python Basics takes a complete beginner from <code className="font-mono text-[0.9em]">print()</code> to classes and algorithms in four units. Every module has three short readings, three coding exercises and a project. Each unit closes with a checkpoint of quizzes, problems and two projects.
                        </p>
                    </div>

                    <div className="mt-10 grid lg:grid-cols-[18rem_1fr] gap-6">
                        <div role="tablist" aria-label="Units" className="flex lg:flex-col gap-2 overflow-x-auto [scrollbar-width:none]">
                            {UNITS.map((x, i) => (
                                <button
                                    key={x.name}
                                    role="tab"
                                    aria-selected={unit === i}
                                    onClick={() => setUnit(i)}
                                    className={`no-hover flex-shrink-0 text-left rounded-md px-4 py-3 border ${unit === i
                                        ? 'bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 shadow-sm'
                                        : 'border-transparent hover:bg-white/70 dark:hover:bg-slate-800/60'}`}
                                >
                                    <span className="block text-sm text-slate-500 dark:text-slate-400">Unit {i + 1}</span>
                                    <span className={`block font-semibold ${unit === i ? 'text-cyan-800 dark:text-cyan-300' : 'text-slate-800 dark:text-slate-200'}`}>{x.name}</span>
                                </button>
                            ))}
                        </div>

                        <div role="tabpanel" className="rounded-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 md:p-8">
                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Unit {unit + 1}: {u.name}</h3>
                                <span className="text-sm text-slate-500">5 modules · 35 lessons</span>
                            </div>
                            <p className="mt-1 text-slate-600 dark:text-slate-400">{u.summary}</p>
                            <div className="mt-6 grid md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">By the end, students can</h4>
                                    <ul className="mt-3 space-y-2.5">
                                        {u.outcomes.map(o => (
                                            <li key={o} className="flex gap-2.5 text-slate-700 dark:text-slate-300">
                                                <Check className="w-4 h-4 mt-1 flex-shrink-0 text-cyan-700 dark:text-cyan-400" />{o}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Modules and what students build</h4>
                                    <table className="mt-3 w-full text-left">
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                            {u.modules.map(([m, p]) => (
                                                <tr key={m}>
                                                    <td className="py-2.5 pr-3 font-medium text-slate-900 dark:text-white align-top">{m}</td>
                                                    <td className="py-2.5 text-slate-600 dark:text-slate-400 align-top">{p}</td>
                                                </tr>
                                            ))}
                                            <tr>
                                                <td className="py-2.5 pr-3 text-slate-500 align-top" colSpan={2}>{u.checkpoint}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">Courses in development: {NEXT_COURSES}.</p>
                </div>
            </section>

            {/* Teachers */}
            <section id="teachers" className="scroll-mt-20">
                <div className="max-w-7xl mx-auto px-6 py-16 md:py-20 grid lg:grid-cols-[1fr_1.1fr] gap-12 items-start">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Run a coding class, even if you’re new to coding</h2>
                        <p className="mt-3 text-slate-600 dark:text-slate-400 leading-relaxed">The lessons are written and the exercises check themselves. You set the pace, assign the work and see where every student is.</p>
                        <dl className="mt-8 grid sm:grid-cols-2 gap-x-8 gap-y-6">
                            {TEACHER_TOOLS.map(([t, b]) => (
                                <div key={t}>
                                    <dt className="font-semibold text-slate-900 dark:text-white">{t}</dt>
                                    <dd className="mt-1 text-slate-600 dark:text-slate-400 leading-relaxed">{b}</dd>
                                </div>
                            ))}
                        </dl>
                        <button onClick={onStart} className="no-hover mt-8 inline-flex items-center gap-2 px-5 py-3 rounded-md bg-cyan-700 hover:bg-cyan-800 text-white font-semibold">
                            Create a teacher account <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                    <GradebookPreview />
                </div>
            </section>

            {/* About and privacy */}
            <section className="border-t border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-6 py-16 md:py-20 grid md:grid-cols-2 gap-12">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Who makes Code2Coder</h2>
                        <p className="mt-3 text-slate-600 dark:text-slate-400 leading-relaxed">
                            Code2Coder is built by students at Bellarmine College Preparatory in San Jose, California. We wanted a Python course any school could use for free, on the computers it already has.
                        </p>
                        <button onClick={() => onNavigate('about')} className="no-hover mt-3 font-semibold text-cyan-700 dark:text-cyan-400 hover:underline underline-offset-2">Meet the team</button>
                    </div>
                    <div id="privacy" className="scroll-mt-20">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">How we handle student data</h2>
                        <p className="mt-3 text-slate-600 dark:text-slate-400 leading-relaxed">
                            We collect only what the app needs to work: name, email, username, progress and the code students write. We don’t show ads and never sell data. The AI tutor sees only the lesson, the student’s code and their question. Students can delete their account, and its data, at any time.
                        </p>
                        <Link to="/privacy" className="no-hover mt-3 inline-block font-semibold text-cyan-700 dark:text-cyan-400 hover:underline underline-offset-2">Read the privacy policy</Link>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="scroll-mt-20 border-t border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-6 py-16 md:py-20 grid lg:grid-cols-[1fr_2fr] gap-10">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Questions</h2>
                        <p className="mt-3 text-slate-600 dark:text-slate-400">Anything else? Email <a href={`mailto:${INQUIRIES_EMAIL}`} className="text-cyan-700 dark:text-cyan-400 underline underline-offset-2">{INQUIRIES_EMAIL}</a>.</p>
                    </div>
                    <div className="divide-y divide-slate-200 dark:divide-slate-800 border-y border-slate-200 dark:border-slate-800">
                        {FAQS.map((f, i) => {
                            const open = openFaq === i;
                            return (
                                <div key={f.q}>
                                    <button onClick={() => setOpenFaq(open ? null : i)} aria-expanded={open} className="no-hover w-full flex items-center justify-between gap-4 py-4 text-left">
                                        <span className="font-semibold text-slate-900 dark:text-white">{f.q}</span>
                                        <ChevronDown className={`w-5 h-5 text-slate-500 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
                                    </button>
                                    {open && <div className="pb-4 text-slate-600 dark:text-slate-400 leading-relaxed">{f.a}</div>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Register your school */}
            <section id="register-school" className="scroll-mt-20 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-6 py-16 md:py-20 grid lg:grid-cols-[1fr_2fr] gap-10 items-start">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Register your school</h2>
                        <p className="mt-3 text-slate-600 dark:text-slate-400 leading-relaxed">Bringing Code2Coder to several classes or a whole school? Tell us about it and we’ll help you get set up.</p>
                        <p className="mt-4 text-slate-600 dark:text-slate-400">Inquiries: <a href={`mailto:${INQUIRIES_EMAIL}`} className="text-cyan-700 dark:text-cyan-400 underline underline-offset-2">{INQUIRIES_EMAIL}</a></p>
                    </div>
                    <div className="rounded-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 md:p-8">
                        <RegisterSchoolForm compact />
                    </div>
                </div>
            </section>

            <SiteFooter onNavigate={onNavigate} />
        </div>
    );
};

/** A still picture of the lesson workspace, drawn in HTML so it stays sharp and themed. */
const ProductPreview: React.FC = () => (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 shadow-lg overflow-hidden" aria-label="Preview of a Code2Coder lesson" role="img">
        <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Loops · Lesson 5 of 7</span>
            <span className="text-xs font-semibold text-slate-500">Run ▸</span>
        </div>
        <div className="grid sm:grid-cols-[0.9fr_1.1fr]">
            <div className="p-5 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800">
                <div className="font-semibold text-slate-900 dark:text-white">Password Validator</div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Keep asking for a password until it has at least 8 characters, then print <code className="font-mono text-[0.85em] px-1 rounded bg-slate-100 dark:bg-slate-800">Saved!</code></p>
                <div className="mt-4 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3 text-sm">
                    <div className="font-semibold text-slate-900 dark:text-white">Tutor</div>
                    <p className="mt-1 text-slate-600 dark:text-slate-400">That works. Next challenge: also require at least one number. Which string method could help?</p>
                </div>
            </div>
            <div className="bg-slate-900 text-slate-100 font-mono text-[13px] leading-6">
                <pre className="p-4 overflow-hidden"><span className="text-slate-500">1</span>  pw = <span className="text-sky-300">input</span>(<span className="text-emerald-300">"Password: "</span>){'\n'}<span className="text-slate-500">2</span>  <span className="text-cyan-300">while</span> <span className="text-sky-300">len</span>(pw) &lt; <span className="text-amber-300">8</span>:{'\n'}<span className="text-slate-500">3</span>      <span className="text-sky-300">print</span>(<span className="text-emerald-300">"Too short"</span>){'\n'}<span className="text-slate-500">4</span>      pw = <span className="text-sky-300">input</span>(<span className="text-emerald-300">"Password: "</span>){'\n'}<span className="text-slate-500">5</span>  <span className="text-sky-300">print</span>(<span className="text-emerald-300">"Saved!"</span>)</pre>
                <div className="border-t border-slate-700 px-4 py-3">
                    <div className="text-[11px] text-slate-400">Output</div>
                    <div className="mt-1 text-slate-300">Password: cat</div>
                    <div className="text-slate-300">Too short</div>
                    <div className="text-slate-300">Password: pythonista</div>
                    <div className="text-slate-300">Saved!</div>
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
    { name: 'Zara A.', cells: [['10/10', 'g'], ['10/10', 'g'], ['9/10', 'g']] },
];
const CELL: Record<string, string> = {
    g: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200',
    s: 'bg-cyan-50 text-cyan-800 dark:bg-cyan-500/15 dark:text-cyan-200',
    l: 'bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200',
    m: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-200',
    n: 'text-slate-400',
};

const GradebookPreview: React.FC = () => (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 shadow-lg overflow-hidden" role="img" aria-label="Preview of the Code2Coder gradebook">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
            <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-2"><Users className="w-4 h-4 text-slate-500" />Period 2 · Gradebook</span>
            <span className="text-xs text-slate-500">Export CSV</span>
        </div>
        <table className="w-full text-sm">
            <thead>
                <tr className="text-left text-slate-500">
                    <th className="px-4 py-2.5 font-medium">Student</th>
                    <th className="px-2 py-2.5 font-medium">Loops</th>
                    <th className="px-2 py-2.5 font-medium">Functions</th>
                    <th className="px-2 py-2.5 font-medium">Lists</th>
                </tr>
            </thead>
            <tbody>
                {GRADEBOOK_ROWS.map(r => (
                    <tr key={r.name} className="border-t border-slate-100 dark:border-slate-800">
                        <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-slate-100">{r.name}</td>
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
            <div className="max-w-7xl mx-auto px-6 pt-12 pb-10">
                <div className="grid sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] gap-10">
                    <div>
                        <div className="flex items-center gap-3">
                            <FooterLogo className="h-8 w-auto" />
                            <span className="font-semibold text-lg text-slate-900 dark:text-white">Code2Coder</span>
                        </div>
                        <p className="mt-4 text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">A free Python course with classroom tools. Built by students in San Jose, California.</p>
                        <a href={`mailto:${INQUIRIES_EMAIL}`} className="mt-4 inline-block text-cyan-700 dark:text-cyan-400 hover:underline underline-offset-2">{INQUIRIES_EMAIL}</a>
                    </div>
                    <FooterColumn title="Course">
                        <button onClick={() => section('curriculum')} className={`no-hover ${linkClass}`}>Curriculum</button>
                        <button onClick={() => section('teachers')} className={`no-hover ${linkClass}`}>For teachers</button>
                        <button onClick={() => section('faq')} className={`no-hover ${linkClass}`}>Questions</button>
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
                <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-500">
                    © {new Date().getFullYear()} Code2Coder
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
