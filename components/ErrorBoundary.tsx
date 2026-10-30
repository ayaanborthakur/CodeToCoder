import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
    children: React.ReactNode;
    /** Changing this (e.g. the open lesson id) clears a previous error. */
    resetKey?: string | null;
}

interface State { error: Error | null }

/**
 * Keeps a rendering error inside one area of the screen instead of
 * unmounting the whole app to a blank page.
 */
export class ErrorBoundary extends React.Component<Props, State> {
    state: State = { error: null };

    static getDerivedStateFromError(error: Error): State {
        return { error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('[ErrorBoundary]', error, info.componentStack);
    }

    componentDidUpdate(prev: Props) {
        if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null });
    }

    render() {
        if (!this.state.error) return this.props.children;
        return (
            <div className="h-full w-full flex items-center justify-center p-6">
                <div className="max-w-sm text-center">
                    <AlertTriangle className="w-8 h-8 mx-auto text-amber-500" aria-hidden="true" />
                    <p className="mt-3 font-semibold text-gray-900 dark:text-white">This part of the page didn't load.</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Your work is saved. Try again, or reload the page if it keeps happening.</p>
                    <button
                        onClick={() => this.setState({ error: null })}
                        className="mt-4 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-500"
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }
}
