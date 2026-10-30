/**
 * Shared building blocks for app pages. Every screen should be assembled from
 * these so spacing, type and colour stay consistent across the product.
 * Colours follow the original palette: cyan accent on gray surfaces.
 */
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

// ─── Page layout ─────────────────────────────────────────────────────────────

const PAGE_WIDTHS = {
    narrow: 'max-w-3xl',
    default: 'max-w-5xl',
    wide: 'max-w-7xl',
} as const;

/** Scrollable page body with a centred, width-capped column. */
export const Page: React.FC<{
    width?: keyof typeof PAGE_WIDTHS;
    children: React.ReactNode;
    className?: string;
}> = ({ width = 'default', children, className }) => (
    <div className="h-full w-full overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-gray-900">
        <div className={cx(PAGE_WIDTHS[width], 'mx-auto px-4 sm:px-6 py-6 sm:py-8', className)}>{children}</div>
    </div>
);

/** Title row for a page: optional back link, title, description, actions. */
export const PageHeader: React.FC<{
    title: React.ReactNode;
    description?: React.ReactNode;
    eyebrow?: React.ReactNode;
    actions?: React.ReactNode;
    back?: { to: string; label: string };
}> = ({ title, description, eyebrow, actions, back }) => (
    <header className="mb-6">
        {back && (
            <Link
                to={back.to}
                className="no-hover inline-flex items-center gap-1.5 mb-3 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                {back.label}
            </Link>
        )}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="min-w-0">
                {eyebrow && <div className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 mb-1">{eyebrow}</div>}
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white truncate">{title}</h1>
                {description && <p className="mt-1 text-sm sm:text-base text-gray-600 dark:text-gray-400">{description}</p>}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2 flex-shrink-0">{actions}</div>}
        </div>
    </header>
);

/** A titled block of content inside a page. */
export const Section: React.FC<{
    title?: React.ReactNode;
    action?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}> = ({ title, action, children, className }) => (
    <section className={cx('mb-8 last:mb-0', className)}>
        {(title || action) && (
            <div className="flex items-center justify-between gap-3 mb-3">
                {title && <h2 className="text-base font-bold text-gray-900 dark:text-white">{title}</h2>}
                {action}
            </div>
        )}
        {children}
    </section>
);

// ─── Surfaces ────────────────────────────────────────────────────────────────

export const Card: React.FC<{ children: React.ReactNode; className?: string; padded?: boolean }> = ({
    children,
    className,
    padded = true,
}) => (
    <div className={cx('bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700', padded && 'p-5', className)}>
        {children}
    </div>
);

/** A bordered list where each row is separated by a divider. */
export const List: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <ul className={cx('bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden', className)}>
        {children}
    </ul>
);

// ─── Actions ─────────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
    primary: 'bg-cyan-600 hover:bg-cyan-500 text-white border-transparent',
    secondary: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
    ghost: 'bg-transparent text-gray-600 dark:text-gray-300 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800',
    danger: 'bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-900/20',
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
    sm: 'px-2.5 py-1.5 text-xs gap-1.5',
    md: 'px-3.5 py-2 text-sm gap-2',
};

const buttonClass = (variant: ButtonVariant, size: ButtonSize, className?: string) =>
    cx(
        'inline-flex items-center justify-center font-semibold rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed',
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        className,
    );

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    icon?: React.ReactNode;
    loading?: boolean;
}> = ({ variant = 'secondary', size = 'md', icon, loading, children, className, disabled, type = 'button', ...rest }) => (
    <button type={type} className={buttonClass(variant, size, className)} disabled={disabled || loading} {...rest}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : icon}
        {children}
    </button>
);

/** A router link styled as a button. */
export const LinkButton: React.FC<{
    to: string;
    variant?: ButtonVariant;
    size?: ButtonSize;
    icon?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}> = ({ to, variant = 'secondary', size = 'md', icon, children, className }) => (
    <Link to={to} className={cx('no-hover', buttonClass(variant, size, className))}>
        {icon}
        {children}
    </Link>
);

// ─── Navigation ──────────────────────────────────────────────────────────────

/** Tabs backed by URLs, so each tab can be linked to and survives reloads. */
export const RouteTabs: React.FC<{
    tabs: { to: string; label: string; count?: number; end?: boolean }[];
    className?: string;
}> = ({ tabs, className }) => (
    <nav className={cx('flex gap-1 border-b border-gray-200 dark:border-gray-800 overflow-x-auto overflow-y-hidden [scrollbar-width:none]', className)} aria-label="Sections">
        {tabs.map(tab => (
            <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) => cx(
                    'no-hover relative px-3 sm:px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px',
                    isActive
                        ? 'text-cyan-700 dark:text-cyan-400 border-cyan-500'
                        : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-800 dark:hover:text-gray-200',
                )}
            >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                    <span className="ml-1.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                        {tab.count}
                    </span>
                )}
            </NavLink>
        ))}
    </nav>
);

// ─── Data display ────────────────────────────────────────────────────────────

export type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

const TONES: Record<Tone, string> = {
    neutral: 'bg-gray-100 text-gray-700 dark:bg-gray-700/60 dark:text-gray-300',
    info: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    success: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    danger: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export const Pill: React.FC<{ tone?: Tone; children: React.ReactNode; icon?: React.ReactNode; className?: string }> = ({
    tone = 'neutral',
    children,
    icon,
    className,
}) => (
    <span className={cx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap', TONES[tone], className)}>
        {icon}
        {children}
    </span>
);

export const Stat: React.FC<{ label: string; value: React.ReactNode; hint?: React.ReactNode; tone?: 'default' | 'danger' }> = ({
    label,
    value,
    hint,
    tone = 'default',
}) => (
    <Card className="!p-4">
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</div>
        <div className={cx('mt-1 text-2xl font-bold tabular-nums', tone === 'danger' ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white')}>
            {value}
        </div>
        {hint && <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{hint}</div>}
    </Card>
);

export const ProgressBar: React.FC<{ value: number; max: number; tone?: 'accent' | 'success'; className?: string; label?: string }> = ({
    value,
    max,
    tone = 'accent',
    className,
    label,
}) => {
    const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
    return (
        <div
            className={cx('h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden', className)}
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={max}
            aria-label={label}
        >
            <div className={cx('h-full rounded-full', tone === 'success' ? 'bg-green-500' : 'bg-cyan-500')} style={{ width: `${pct}%` }} />
        </div>
    );
};

export const Avatar: React.FC<{ name: string; src?: string; size?: 'sm' | 'md' | 'lg' }> = ({ name, src, size = 'md' }) => {
    const dims = size === 'sm' ? 'w-7 h-7 text-xs' : size === 'lg' ? 'w-12 h-12 text-lg' : 'w-9 h-9 text-sm';
    return src ? (
        <img src={src} alt="" className={cx(dims, 'rounded-full object-cover flex-shrink-0')} />
    ) : (
        <span className={cx(dims, 'rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-white font-bold flex items-center justify-center flex-shrink-0')} aria-hidden="true">
            {(name || '?').charAt(0).toUpperCase()}
        </span>
    );
};

// ─── Feedback ────────────────────────────────────────────────────────────────

/** What to show when a list has nothing in it: say why, and offer the next step. */
export const EmptyState: React.FC<{
    icon?: React.ReactNode;
    title: string;
    description?: React.ReactNode;
    action?: React.ReactNode;
}> = ({ icon, title, description, action }) => (
    <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 px-6 py-10 text-center">
        {icon && <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 flex items-center justify-center">{icon}</div>}
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{title}</p>
        {description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">{description}</p>}
        {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
);

export const Alert: React.FC<{ tone?: Exclude<Tone, 'neutral'>; icon?: React.ReactNode; children: React.ReactNode; className?: string }> = ({
    tone = 'info',
    icon,
    children,
    className,
}) => (
    <div className={cx('flex items-start gap-3 rounded-lg px-4 py-3 text-sm', TONES[tone], className)} role={tone === 'danger' ? 'alert' : undefined}>
        {icon && <span className="mt-0.5 flex-shrink-0">{icon}</span>}
        <div className="min-w-0 flex-1">{children}</div>
    </div>
);

export const Spinner: React.FC<{ label?: string }> = ({ label = 'Loading' }) => (
    <div className="flex items-center justify-center py-16 text-gray-500 dark:text-gray-400" role="status">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-500" aria-hidden="true" />
        <span className="sr-only">{label}</span>
    </div>
);

// ─── Forms ───────────────────────────────────────────────────────────────────

export const inputClass =
    'w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500';

export const Field: React.FC<{ label: string; htmlFor: string; hint?: React.ReactNode; children: React.ReactNode }> = ({
    label,
    htmlFor,
    hint,
    children,
}) => (
    <div>
        <label htmlFor={htmlFor} className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
        {children}
        {hint && <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
    </div>
);
