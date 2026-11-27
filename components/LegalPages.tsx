import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { INQUIRIES_EMAIL } from './RegisterSchoolDialog';
import { SiteFooter } from './MissionPage';
import type { ViewState } from './Header';

const LAST_UPDATED = 'November 26, 2026';

const Doc: React.FC<{ title: string; intro: string; onNavigate: (v: ViewState) => void; children: React.ReactNode }> = ({ title, intro, onNavigate, children }) => (
    <div className="min-h-full bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200">
        <Helmet><title>{`${title} | Code2Coder`}</title></Helmet>
        <article className="max-w-3xl mx-auto px-6 py-14">
            <Link to="/" className="no-hover inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-400">
                <ArrowLeft className="w-4 h-4" /> Code2Coder home
            </Link>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
            <p className="mt-2 text-sm text-slate-500">Last updated {LAST_UPDATED}</p>
            <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">{intro}</p>
            <div className="mt-10 space-y-10 legal-body">{children}</div>
            <p className="mt-12 text-slate-600 dark:text-slate-400">Questions? Email <a href={`mailto:${INQUIRIES_EMAIL}`} className="text-cyan-700 dark:text-cyan-400 font-medium">{INQUIRIES_EMAIL}</a>.</p>
        </article>
        <SiteFooter onNavigate={onNavigate} />
    </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{title}</h2>
        <div className="mt-3 space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_strong]:text-slate-900 dark:[&_strong]:text-white">{children}</div>
    </section>
);

export const PrivacyPage: React.FC<{ onNavigate: (v: ViewState) => void }> = ({ onNavigate }) => (
    <Doc
        title="Privacy policy"
        intro="Code2Coder is a free learning platform used by students and teachers, many of them in schools. This policy explains what information we collect, why, who it is shared with, and how to have it deleted."
        onNavigate={onNavigate}
    >
        <Section title="What we collect">
            <ul>
                <li><strong>Account details:</strong> name, email address, username and, if you choose, a profile picture. If you sign in with Google, we receive your name, email and Google profile picture from Google.</li>
                <li><strong>Role and class:</strong> whether you are a student or teacher, and the classes or school you join.</li>
                <li><strong>Learning activity:</strong> lessons and practice items completed, code you write and run, quiz answers, assignments you hand in, and the grades and feedback teachers give.</li>
                <li><strong>Messages to the AI tutor:</strong> the questions you ask and the code and lesson they relate to.</li>
                <li><strong>Basic usage events:</strong> sign-ups, sign-ins and sign-outs, recorded with Google Analytics for Firebase so we can tell whether the service is working.</li>
            </ul>
            <p>We do not ask for phone numbers, home addresses, dates of birth or payment details.</p>
        </Section>

        <Section title="How we use it">
            <ul>
                <li>To run your account and save your progress.</li>
                <li>To let teachers see the work, progress and activity of students in their classes, and to show students their teacher’s grades and feedback.</li>
                <li>To give AI tutor hints and feedback on your code.</li>
                <li>To keep the service secure, prevent abuse and fix problems.</li>
            </ul>
            <p><strong>We never sell or rent personal information, never show ads, and never use student information to build advertising profiles.</strong></p>
        </Section>

        <Section title="The AI tutor">
            <p>When you ask the tutor for help, the lesson, your code and your question are sent from our server to Google’s Gemini service to generate a hint. Your request is not sent with your name or email. The tutor is instructed to give hints rather than full solutions, and each account has a daily limit on tutor requests.</p>
            <p>When you choose a username, it is also checked automatically by the same AI service so that inappropriate names are blocked.</p>
            <p>To save cost, we may keep a copy of a hint for a common error in a given lesson so the next student with the same error gets it faster. These saved hints are not linked to any student.</p>
        </Section>

        <Section title="Who can see your information">
            <ul>
                <li><strong>Your teacher:</strong> if you join a class, its teacher can see your name, username, progress, submitted code, grades and recent activity.</li>
                <li><strong>Other students:</strong> your username, profile picture and points may appear on the leaderboard. Your code and grades are never shown to other students.</li>
                <li><strong>Service providers:</strong> we use Google Firebase and Google Cloud to store data and run the service, and Google Gemini for the AI tutor. They process data only to provide those services to us.</li>
                <li><strong>When required by law:</strong> we may disclose information if a valid legal process requires it.</li>
            </ul>
        </Section>

        <Section title="Where data is stored and how it is protected">
            <p>Data is stored in Google Cloud. Access is limited by security rules: students can read and change only their own work, and teachers can see only the students in their own classes. Connections to Code2Coder are encrypted.</p>
        </Section>

        <Section title="Students and schools">
            <p>Code2Coder is designed to be used by students, including in classrooms. When a school or teacher uses Code2Coder with students, we use student information only to provide the educational service to that school, and the school can ask us to delete its students’ data at any time. Students under 13 should use Code2Coder through a teacher’s class or with a parent’s permission.</p>
        </Section>

        <Section title="Keeping and deleting data">
            <ul>
                <li>You can delete your account at any time from your profile page. This removes your sign-in, profile, progress, code, stars and other saved data, and takes you out of your class. Deleting a teacher account also deletes the classes that teacher runs.</li>
                <li>Work a student has handed in to a class stays with that class, like a paper handed in at school, until the teacher deletes it or the class. Teachers can remove students and delete classes, which deletes the class’s assignments, submissions and grades.</li>
                <li>Parents, students and schools can also email us to ask for data to be viewed, corrected or deleted, and we will respond within 30 days.</li>
            </ul>
        </Section>

        <Section title="Changes to this policy">
            <p>If we change this policy in a way that affects how student information is used, we will update the date above and post a notice in the app before the change takes effect.</p>
        </Section>
    </Doc>
);

export const TermsPage: React.FC<{ onNavigate: (v: ViewState) => void }> = ({ onNavigate }) => (
    <Doc
        title="Terms of use"
        intro="These terms are the rules for using Code2Coder. By creating an account or using the site, you agree to them. If you are using Code2Coder through your school, your school’s own technology rules also apply."
        onNavigate={onNavigate}
    >
        <Section title="The service">
            <p>Code2Coder provides free Python lessons, practice, a code playground, an AI tutor and classroom tools for teachers. It is provided free of charge and “as is”. We work to keep it available and accurate but cannot promise it will always be error-free or uninterrupted.</p>
        </Section>

        <Section title="Your account">
            <ul>
                <li>Keep your sign-in details private and tell us if you think someone else has used your account.</li>
                <li>Use your real name or the name your school uses, and choose a username that is appropriate for a school setting.</li>
                <li>Teacher accounts are for educators running classes. Please don’t create a teacher account to see other students’ work.</li>
            </ul>
        </Section>

        <Section title="Acceptable use">
            <p>Please don’t:</p>
            <ul>
                <li>Hand in work that isn’t yours, or use the AI tutor to get around your teacher’s rules on academic honesty.</li>
                <li>Write or run code meant to attack, overload or get unauthorized access to Code2Coder or anyone else.</li>
                <li>Post or submit anything harassing, hateful, sexual or otherwise inappropriate for school.</li>
                <li>Try to read or change another person’s account, code or grades.</li>
            </ul>
            <p>We may suspend accounts that break these rules, and we may share information with a student’s school when needed to keep students safe.</p>
        </Section>

        <Section title="Your work">
            <p>Code you write belongs to you. You let us store and display it so the service works, for example so your teacher can see and grade it. Lesson content, exercises and the Code2Coder name and logo belong to Code2Coder.</p>
        </Section>

        <Section title="The AI tutor">
            <p>The tutor’s hints are generated automatically and can be wrong. Treat them as suggestions, check them against the lesson, and ask your teacher when unsure.</p>
        </Section>

        <Section title="Changes and contact">
            <p>We may update these terms as the service changes and will update the date above when we do. Our <Link to="/privacy" className="text-cyan-700 dark:text-cyan-400 font-medium">privacy policy</Link> explains how we handle personal information.</p>
        </Section>
    </Doc>
);
