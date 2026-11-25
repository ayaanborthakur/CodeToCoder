import React, { useEffect, useState } from 'react';
import { CheckCircle2, GraduationCap, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { registerSchool, submitSchoolRequest, type SchoolRequestInput } from '../services/schoolService';
import { Button, Field, inputClass } from './ui';

const ROLES: { value: SchoolRequestInput['role']; label: string }[] = [
    { value: 'teacher', label: 'Teacher' },
    { value: 'administrator', label: 'School administrator' },
    { value: 'it', label: 'IT / technology staff' },
    { value: 'other', label: 'Something else' },
];

/**
 * "Register your school" popup for the landing page. Anyone can send it;
 * a signed-in teacher registers the school straight away (they'll approve
 * students who ask to join), everyone else sends a request we follow up on.
 */
export const RegisterSchoolDialog: React.FC<{ onClose: () => void }> = ({ onClose }) => {
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

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !saving) onClose(); };
        window.addEventListener('keydown', onKey);
        const overflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = overflow; };
    }, [onClose, saving]);

    const set = <K extends keyof SchoolRequestInput>(k: K) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm(f => ({ ...f, [k]: e.target.value }));

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!form.schoolName.trim()) { setError('Enter your school’s name.'); return; }
        if (!isTeacher) {
            if (!form.contactName.trim()) { setError('Enter your name.'); return; }
            if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) { setError('Enter a valid email address so we can reach you.'); return; }
        }
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

    return (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onMouseDown={(e) => { if (e.target === e.currentTarget && !saving) onClose(); }}>
            <div role="dialog" aria-modal="true" aria-labelledby="register-school-title" className="w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
                <div className="relative px-6 pt-6 pb-5 bg-gradient-to-br from-cyan-600 via-sky-600 to-indigo-600 text-white">
                    <button onClick={onClose} disabled={saving} className="no-hover absolute top-4 right-4 p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15" aria-label="Close"><X className="w-5 h-5" /></button>
                    <span className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center mb-3"><GraduationCap className="w-6 h-6" /></span>
                    <h2 id="register-school-title" className="text-2xl font-bold">Bring Code2Coder to your school</h2>
                    <p className="mt-1 text-cyan-50/90">Free for every school. Tell us a little about yours and we’ll get you set up.</p>
                </div>

                {done ? (
                    <div className="p-8 text-center">
                        <CheckCircle2 className="w-12 h-12 mx-auto text-green-600" />
                        <h3 className="mt-3 text-xl font-bold text-gray-900 dark:text-white">{isTeacher ? 'School registered' : 'Thanks! We got it.'}</h3>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            {isTeacher
                                ? 'We’ll review it shortly. Once it’s approved, students can find your school and ask to join, and you approve them.'
                                : <>We’ll email <span className="font-semibold text-gray-900 dark:text-white">{form.email.trim()}</span> within a few days to set up {form.schoolName.trim()}.</>}
                        </p>
                        <Button variant="primary" className="mt-6" onClick={onClose}>Done</Button>
                    </div>
                ) : (
                    <form onSubmit={submit} className="flex-1 overflow-y-auto p-6 space-y-4" noValidate>
                        {!isTeacher && (
                            <div className="grid sm:grid-cols-2 gap-4">
                                <Field label="Your name" htmlFor="rs-name">
                                    <input id="rs-name" className={inputClass} value={form.contactName} onChange={set('contactName')} autoComplete="name" maxLength={100} autoFocus />
                                </Field>
                                <Field label="Email" htmlFor="rs-email">
                                    <input id="rs-email" type="email" className={inputClass} value={form.email} onChange={set('email')} autoComplete="email" maxLength={200} placeholder="you@school.edu" />
                                </Field>
                            </div>
                        )}
                        {!isTeacher && (
                            <Field label="Your role" htmlFor="rs-role">
                                <select id="rs-role" className={inputClass} value={form.role} onChange={set('role')}>
                                    {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                </select>
                            </Field>
                        )}
                        <Field label="School name" htmlFor="rs-school">
                            <input id="rs-school" className={inputClass} value={form.schoolName} onChange={set('schoolName')} maxLength={150} placeholder="e.g. Lincoln High School" autoFocus={isTeacher} />
                        </Field>
                        <div className="grid sm:grid-cols-3 gap-4">
                            <Field label="City" htmlFor="rs-city"><input id="rs-city" className={inputClass} value={form.city} onChange={set('city')} maxLength={100} /></Field>
                            <Field label="State / region" htmlFor="rs-region"><input id="rs-region" className={inputClass} value={form.region} onChange={set('region')} maxLength={100} /></Field>
                            <Field label="Country" htmlFor="rs-country"><input id="rs-country" className={inputClass} value={form.country} onChange={set('country')} maxLength={100} /></Field>
                        </div>
                        {!isTeacher && (
                            <Field label="About how many students? (optional)" htmlFor="rs-students">
                                <select id="rs-students" className={inputClass} value={form.students} onChange={set('students')}>
                                    <option value="">Not sure</option>
                                    <option>Under 30</option>
                                    <option>30–100</option>
                                    <option>100–500</option>
                                    <option>500+</option>
                                </select>
                            </Field>
                        )}
                        <Field label="Anything else? (optional)" htmlFor="rs-message">
                            <textarea id="rs-message" className={`${inputClass} min-h-[80px]`} value={form.message} onChange={set('message')} maxLength={2000} placeholder="Which classes or grades, when you'd like to start, questions…" />
                        </Field>
                        <div className="hidden" aria-hidden="true">
                            <label htmlFor="rs-website">Website</label>
                            <input id="rs-website" tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} />
                        </div>
                        {error && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
                        <div className="flex items-center justify-end gap-2 pt-2">
                            <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
                            <Button type="submit" variant="primary" loading={saving}>{isTeacher ? 'Register school' : 'Send'}</Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
