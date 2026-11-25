import React, { useEffect, useState } from 'react';
import { CheckCircle2, GraduationCap, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { registerSchool, submitSchoolRequest, type SchoolRequestInput } from '../services/schoolService';
import { Button, Field, inputClass } from './ui';

export const INQUIRIES_EMAIL = 'info.code2coder@gmail.com';

const ROLES: { value: SchoolRequestInput['role']; label: string }[] = [
    { value: 'teacher', label: 'Teacher' },
    { value: 'administrator', label: 'School administrator' },
    { value: 'it', label: 'IT / technology staff' },
    { value: 'other', label: 'Something else' },
];

/**
 * The register-your-school form. Anyone can send it: a signed-in teacher
 * registers the school straight away (they'll approve students who ask to
 * join), everyone else sends a request we follow up on by email.
 */
export const RegisterSchoolForm: React.FC<{ onDone?: () => void; compact?: boolean }> = ({ onDone, compact = false }) => {
    const { user } = useAuth();
    const isTeacher = user?.role === 'teacher';
    const [form, setForm] = useState<SchoolRequestInput>({
        contactName: user?.name ?? '', email: user?.email ?? '', role: 'teacher', schoolName: '',
        city: '', region: '', country: '', students: '', message: '',
    });
    // Bots fill every field; people never see this one.
    const [website, setWebsite] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [done, setDone] = useState(false);

    const set = <K extends keyof SchoolRequestInput>(k: K) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm(f => ({ ...f, [k]: e.target.value }));

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!isTeacher) {
            if (!form.contactName.trim()) { setError('Enter your name.'); return; }
            if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) { setError('Enter a valid email address so we can reach you.'); return; }
        }
        if (!form.schoolName.trim()) { setError('Enter your school’s name.'); return; }
        if (website) { setDone(true); return; }
        setSaving(true);
        try {
            if (isTeacher && user) {
                await registerSchool(user.id, user.name, {
                    name: form.schoolName, city: form.city, state: form.region, country: form.country, notes: form.message,
                });
            } else {
                await submitSchoolRequest(form);
            }
            setDone(true);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (done) {
        return (
            <div className="py-8 text-center" role="status">
                <CheckCircle2 className="w-12 h-12 mx-auto text-green-600" />
                <h3 className="mt-3 text-xl font-bold text-gray-900 dark:text-white">{isTeacher ? 'School registered' : 'Thanks! We got it.'}</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    {isTeacher
                        ? 'We’ll review it shortly. Once it’s approved, students can find your school and ask to join, and you approve them.'
                        : <>We’ll email <span className="font-semibold text-gray-900 dark:text-white">{form.email.trim()}</span> within a few days to set up {form.schoolName.trim()}.</>}
                </p>
                {onDone && <Button variant="primary" className="mt-6" onClick={onDone}>Done</Button>}
            </div>
        );
    }

    return (
        <form onSubmit={submit} className="space-y-4" noValidate>
            {!isTeacher && (
                <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Your name" htmlFor="rs-name">
                        <input id="rs-name" className={inputClass} value={form.contactName} onChange={set('contactName')} autoComplete="name" maxLength={100} />
                    </Field>
                    <Field label="Email" htmlFor="rs-email">
                        <input id="rs-email" type="email" className={inputClass} value={form.email} onChange={set('email')} autoComplete="email" maxLength={200} placeholder="you@school.edu" />
                    </Field>
                </div>
            )}
            <div className={isTeacher ? '' : 'grid sm:grid-cols-2 gap-4'}>
                <Field label="School name" htmlFor="rs-school">
                    <input id="rs-school" className={inputClass} value={form.schoolName} onChange={set('schoolName')} maxLength={150} placeholder="e.g. Lincoln High School" />
                </Field>
                {!isTeacher && (
                    <Field label="Your role" htmlFor="rs-role">
                        <select id="rs-role" className={inputClass} value={form.role} onChange={set('role')}>
                            {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                    </Field>
                )}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Field label="City" htmlFor="rs-city"><input id="rs-city" className={inputClass} value={form.city} onChange={set('city')} maxLength={100} /></Field>
                <Field label="Country" htmlFor="rs-country"><input id="rs-country" className={inputClass} value={form.country} onChange={set('country')} maxLength={100} /></Field>
            </div>
            <Field label="Message (optional)" htmlFor="rs-message">
                <textarea id="rs-message" className={`${inputClass} ${compact ? 'min-h-[72px]' : 'min-h-[96px]'}`} value={form.message} onChange={set('message')} maxLength={2000} placeholder="Which classes or grades, when you'd like to start, questions…" />
            </Field>
            <div className="hidden" aria-hidden="true">
                <label htmlFor="rs-website">Website</label>
                <input id="rs-website" tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} />
            </div>
            {error && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
            <Button type="submit" variant="primary" loading={saving} className="w-full sm:w-auto">{isTeacher ? 'Register school' : 'Send'}</Button>
        </form>
    );
};

/** The same form in a popup, for the Schools page. */
export const RegisterSchoolDialog: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        const overflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = overflow; };
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div role="dialog" aria-modal="true" aria-labelledby="register-school-title" className="w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
                <div className="flex items-start gap-3 px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                    <span className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300 flex items-center justify-center flex-shrink-0"><GraduationCap className="w-5 h-5" /></span>
                    <div className="flex-1 min-w-0">
                        <h2 id="register-school-title" className="text-xl font-bold text-gray-900 dark:text-white">Register your school</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Free for every school. Questions? <a href={`mailto:${INQUIRIES_EMAIL}`}>{INQUIRIES_EMAIL}</a></p>
                    </div>
                    <button onClick={onClose} className="no-hover p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Close"><X className="w-5 h-5" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    <RegisterSchoolForm onDone={onClose} />
                </div>
            </div>
        </div>
    );
};
