
import React, { useRef, useMemo, useLayoutEffect, useState, useEffect, useCallback } from 'react';
import { CollapseIcon } from './CollapseIcon';
import { IconButton } from './IconButton';
import type { LintIssue } from '../types';

interface IdePanelProps {
    code: string;
    setCode: (code: string) => void;
    onRunCode: () => void;
    isLoading: boolean;
    onResetCode: () => void;
    onGetHelp: () => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    onExportCode?: () => void;
    onImportCode?: () => void;
    resetButtonLabel?: string;
    lintIssues?: LintIssue[];
    saveStatus?: 'saved' | 'saving' | 'unsaved';
    fileName?: string;
    onFileNameChange?: (newName: string) => void;
    onBackToDashboard?: () => void;
    backButtonLabel?: string;
    enableAutocomplete?: boolean;
}

declare global {
    interface Window {
        Prism: any;
    }
}

const KEYWORDS = [
    'print', 'input', 'len', 'range', 'return', 'def', 'class', 'import', 'from',
    'if', 'else', 'elif', 'while', 'for', 'in', 'not', 'and', 'or', 'True', 'False', 'None',
    'break', 'continue', 'pass', 'try', 'except', 'finally', 'raise', 'with', 'as', 'global',
    'lambda', 'yield', 'async', 'await', 'int', 'str', 'float', 'list', 'dict', 'set', 'bool',
    'random', 'math', 'append', 'pop', 'remove', 'sort', 'split', 'join', 'lower', 'upper',
    'sum', 'max', 'min', 'abs', 'round', 'enumerate', 'zip', 'map', 'filter'
];

import PlayIcon from '../assets/icons/IdePlayIcon.svg?react';
import SpinnerIcon from '../assets/icons/SpinnerIcon.svg?react';
import HelpIcon from '../assets/icons/HelpIcon.svg?react';
import ResetIcon from '../assets/icons/ResetIcon.svg?react';
import ExportIcon from '../assets/icons/ExportIcon.svg?react';
import ImportIcon from '../assets/icons/ImportIcon.svg?react';
import BackIcon from '../assets/icons/BackIcon.svg?react';
import CheckIcon from '../assets/icons/CheckIcon.svg?react';

const editorTypography: React.CSSProperties = {
    fontFamily: '"JetBrains Mono", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", monospace',
    fontSize: '14px',
    lineHeight: '24px',
    tabSize: 4,
    MozTabSize: 4,
};

const FileNameEditor: React.FC<{ name: string; onChange: (newName: string) => void; }> = ({ name, onChange }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(name);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setValue(name);
    }, [name]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleConfirm = () => {
        if (value.trim() && value.trim() !== name) {
            onChange(value.trim());
        }
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={handleConfirm}
                onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold text-sm rounded-md px-2 py-0.5 -ml-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
        );
    }

    return (
        <button onClick={() => setIsEditing(true)} className="font-semibold text-gray-700 dark:text-gray-300 text-sm rounded-md px-2 py-0.5 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors truncate" title="Rename file">
            {name}
        </button>
    );
};


export const IdePanel: React.FC<IdePanelProps> = ({
    code,
    setCode,
    onRunCode,
    isLoading,
    onResetCode,
    onGetHelp,
    isCollapsed,
    onToggleCollapse,
    onExportCode,
    onImportCode,
    resetButtonLabel = "Reset",
    lintIssues = [],
    saveStatus,
    fileName,
    onFileNameChange,
    onBackToDashboard,
    backButtonLabel,
    enableAutocomplete = false
}) => {
    const lineNumbersRef = useRef<HTMLPreElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const preRef = useRef<HTMLPreElement>(null);
    const errorLayerRef = useRef<HTMLDivElement>(null);
    const measureRef = useRef<HTMLSpanElement>(null);
    const cursorRequestRef = useRef<number | null>(null);

    const [hoveredIssue, setHoveredIssue] = useState<{ x: number, y: number, issue: LintIssue } | null>(null);

    // Autocomplete State
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [suggestionPos, setSuggestionPos] = useState<{ top: number, left: number } | null>(null);
    const [charWidth, setCharWidth] = useState(0);

    const lineCount = useMemo(() => code.split('\n').length, [code]);
    const lineNumbers = useMemo(() =>
        Array.from({ length: lineCount }, (_, i) => i + 1).join('\n'),
        [lineCount]
    );

    const highlightedCode = useMemo(() => {
        if (typeof window !== 'undefined' && window.Prism && window.Prism.languages.python) {
            return window.Prism.highlight(code, window.Prism.languages.python, 'python');
        }
        return code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }, [code]);

    // Measure character width for fallback
    useEffect(() => {
        if (measureRef.current) {
            const rect = measureRef.current.getBoundingClientRect();
            if (rect.width > 0) {
                setCharWidth(rect.width);
            }
        }
    }, []);

    // Extract User Identifiers for Smart Autocomplete
    const userIdentifiers = useMemo(() => {
        if (!enableAutocomplete) return [];

        const identifiers = new Set<string>();
        const add = (str: string) => {
            if (!str || /^\d+$/.test(str)) return;
            identifiers.add(str);
        };

        const assignmentRegex = /(?:^|[\n;]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*=(?!=)/g;
        const defRegex = /def\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
        const classRegex = /class\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
        const forRegex = /for\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+in/g;
        const importRegex = /import\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
        const fromImportRegex = /from\s+[\w.]+\s+import\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
        const argScopeRegex = /def\s+[a-zA-Z0-9_]*\s*\(([^)]+)\)/g;

        let match;
        while ((match = assignmentRegex.exec(code)) !== null) add(match[1]);
        while ((match = defRegex.exec(code)) !== null) add(match[1]);
        while ((match = classRegex.exec(code)) !== null) add(match[1]);
        while ((match = forRegex.exec(code)) !== null) add(match[1]);
        while ((match = importRegex.exec(code)) !== null) add(match[1]);
        while ((match = fromImportRegex.exec(code)) !== null) add(match[1]);

        while ((match = argScopeRegex.exec(code)) !== null) {
            const argsStr = match[1];
            const args = argsStr.split(',');
            args.forEach(arg => {
                let clean = arg.replace(/^[\s*]+/, '');
                clean = clean.split(/[:=]/)[0].trim();
                if (clean && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(clean)) {
                    add(clean);
                }
            });
        }

        return Array.from(identifiers).filter(id => !KEYWORDS.includes(id));
    }, [code, enableAutocomplete]);

    const suggestionsList = useMemo(() => {
        return [...userIdentifiers, ...KEYWORDS];
    }, [userIdentifiers]);

    // Synchronize scrolling
    const syncScroll = (scrollTop: number, scrollLeft: number) => {
        if (lineNumbersRef.current) lineNumbersRef.current.scrollTop = scrollTop;
        if (preRef.current) {
            preRef.current.scrollTop = scrollTop;
            preRef.current.scrollLeft = scrollLeft;
        }
        if (errorLayerRef.current) {
            errorLayerRef.current.scrollTop = scrollTop;
            errorLayerRef.current.scrollLeft = scrollLeft;
        }
    };

    useLayoutEffect(() => {
        if (textareaRef.current) {
            const { scrollTop, scrollLeft } = textareaRef.current;
            syncScroll(scrollTop, scrollLeft);
        }
    }, [code, lintIssues]);

    const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
        const { scrollTop, scrollLeft } = e.currentTarget;
        syncScroll(scrollTop, scrollLeft);
        setHoveredIssue(null);
        setSuggestionPos(null); // Close autocomplete on scroll
        setSuggestions([]);
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        const cursorStart = e.target.selectionStart;
        setCode(newValue);

        if (!enableAutocomplete) {
            setSuggestions([]);
            return;
        }

        const textBeforeCursor = newValue.slice(0, cursorStart);
        // Match the last word boundary
        const match = textBeforeCursor.match(/\b([a-zA-Z_][a-zA-Z0-9_]*)$/);

        if (match) {
            const word = match[1];
            // Minimum 1 character to trigger
            if (word.length < 1) {
                setSuggestions([]);
                setSuggestionPos(null);
                return;
            }

            const matches = suggestionsList.filter(k => k.startsWith(word) && k !== word);

            if (matches.length > 0) {
                // Calculate precise position
                const lines = textBeforeCursor.split('\n');
                const row = lines.length - 1;
                const currentLineText = lines[lines.length - 1];

                // Measure text width precisely
                let leftOffset = 0;
                if (measureRef.current) {
                    measureRef.current.textContent = currentLineText;
                    leftOffset = measureRef.current.getBoundingClientRect().width;
                } else {
                    leftOffset = currentLineText.length * charWidth;
                }

                const lineHeight = 24;
                const topOffset = (row + 1) * lineHeight + 16; // 16px padding top

                // Account for scroll
                const scrollTop = textareaRef.current?.scrollTop || 0;
                const scrollLeft = textareaRef.current?.scrollLeft || 0;

                setSuggestions(matches.slice(0, 5)); // Limit to top 5
                setSelectedIndex(0);
                setSuggestionPos({
                    top: topOffset - scrollTop,
                    left: leftOffset + 16 - scrollLeft // 16px padding left
                });
                return;
            }
        }

        setSuggestions([]);
        setSuggestionPos(null);
    };

    const acceptSuggestion = useCallback((index: number) => {
        if (suggestions.length === 0 || !textareaRef.current) return;

        const suggestion = suggestions[index];
        const cursor = textareaRef.current.selectionStart;
        const textBeforeCursor = code.slice(0, cursor);
        const match = textBeforeCursor.match(/\b([a-zA-Z_][a-zA-Z0-9_]*)$/);

        if (match) {
            const word = match[1];
            const newValue = code.slice(0, cursor - word.length) + suggestion + code.slice(cursor);
            setCode(newValue);
            cursorRequestRef.current = cursor - word.length + suggestion.length;
            setSuggestions([]);
            setSuggestionPos(null);
        }
    }, [code, suggestions, setCode]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Autocomplete handling
        if (suggestions.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % suggestions.length);
                return;
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
                return;
            }
            if (e.key === 'Tab' || e.key === 'Enter') {
                e.preventDefault();
                acceptSuggestion(selectedIndex);
                return;
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                setSuggestions([]);
                setSuggestionPos(null);
                return;
            }
        }

        // Editor shortcuts and typing enhancements
        const textarea = e.currentTarget;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const value = textarea.value;

        if (e.key === 'Tab') {
            e.preventDefault();

            if (e.shiftKey) {
                // Unindent current line
                const lineStart = value.lastIndexOf('\n', start - 1) + 1;
                const lineEnd = value.indexOf('\n', start);
                // Handle last line case
                const actualLineEnd = lineEnd === -1 ? value.length : lineEnd;
                const lineContent = value.substring(lineStart, actualLineEnd);

                if (lineContent.startsWith("    ")) {
                    const newValue = value.substring(0, lineStart) + lineContent.substring(4) + value.substring(actualLineEnd);
                    setCode(newValue);
                    // Try to preserve relative cursor position, but don't go before line start
                    cursorRequestRef.current = Math.max(lineStart, start - 4);
                }
            } else {
                // Tab: Insert 4 spaces (Standard Python Indent)
                const newValue = value.substring(0, start) + "    " + value.substring(end);
                setCode(newValue);
                cursorRequestRef.current = start + 4;
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();

            // Auto-indentation logic
            const lineStart = value.lastIndexOf('\n', start - 1) + 1;
            const currentLine = value.substring(lineStart, start);

            // Get current indentation
            const match = currentLine.match(/^(\s*)/);
            let indent = match ? match[1] : "";

            // Increase indent if line ends with colon
            if (currentLine.trim().endsWith(':')) {
                indent += "    ";
            }

            const newValue = value.substring(0, start) + "\n" + indent + value.substring(end);
            setCode(newValue);
            cursorRequestRef.current = start + 1 + indent.length;
        } else if (e.key === 'Backspace') {
            // Smart Backspace: Delete 4 spaces at once if at indentation
            if (start === end) {
                const lineStart = value.lastIndexOf('\n', start - 1) + 1;
                const textBefore = value.substring(lineStart, start);

                // Check if we are in the indentation zone (only whitespace before cursor on this line)
                // and if there are at least 4 spaces before the cursor
                if (/^\s+$/.test(textBefore) && textBefore.endsWith("    ")) {
                    e.preventDefault();
                    const newValue = value.substring(0, start - 4) + value.substring(end);
                    setCode(newValue);
                    cursorRequestRef.current = start - 4;
                }
            }
        }
    };

    // Update cursor position after autocomplete or shortcuts
    useEffect(() => {
        if (cursorRequestRef.current !== null && textareaRef.current) {
            textareaRef.current.setSelectionRange(cursorRequestRef.current, cursorRequestRef.current);
            cursorRequestRef.current = null;
        }
    }, [code]);

    const handleMouseMove = (e: React.MouseEvent<HTMLTextAreaElement>) => {
        if (lintIssues.length === 0) return;

        const textarea = e.currentTarget;
        const rect = textarea.getBoundingClientRect();
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        const relativeY = mouseY - rect.top + textarea.scrollTop - 16;

        if (relativeY < 0) {
            setHoveredIssue(null);
            return;
        }

        const lineHeight = 24;
        const lineIndex = Math.floor(relativeY / lineHeight);
        const issue = lintIssues.find(i => i.line === lineIndex + 1);

        if (issue) {
            setHoveredIssue({ x: mouseX, y: mouseY + 20, issue });
        } else {
            setHoveredIssue(null);
        }
    };

    const handleMouseLeave = () => {
        setHoveredIssue(null);
    };

    return (
        <div className="flex flex-col h-full w-full bg-white dark:bg-gray-800">
            {/* Hidden span to measure character width for auto-suggest alignment */}
            <span
                ref={measureRef}
                style={{ ...editorTypography, position: 'absolute', visibility: 'hidden', whiteSpace: 'pre' }}
                aria-hidden="true"
            >
                M
            </span>

            <div className="h-12 px-2 sm:px-4 flex justify-between items-center bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
                <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
                    <button
                        onClick={onToggleCollapse}
                        className="p-1 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white transition-colors"
                        aria-label={isCollapsed ? "Expand IDE panel" : "Collapse IDE panel"}
                    >
                        <CollapseIcon isCollapsed={isCollapsed} />
                    </button>
                    {!isCollapsed && (
                        <div className="flex items-center gap-2 overflow-hidden">
                            {onBackToDashboard && (
                                <button
                                    onClick={onBackToDashboard}
                                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-cyan-600 transition-colors"
                                    title={backButtonLabel ? `Back to ${backButtonLabel}` : "Back"}
                                >
                                    <BackIcon className="w-5 h-5" />
                                    {backButtonLabel && <span className="text-xs font-medium hidden sm:inline">{backButtonLabel}</span>}
                                </button>
                            )}
                            {fileName && onFileNameChange ? (
                                <FileNameEditor name={fileName} onChange={onFileNameChange} />
                            ) : (
                                <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm whitespace-nowrap">
                                    {fileName || "Python Editor"}
                                </h3>
                            )}
                        </div>
                    )}
                </div>
                {!isCollapsed && (
                    <div className="flex items-center gap-1 sm:gap-2">
                        {saveStatus && saveStatus === 'unsaved' && (
                            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-amber-600 dark:text-amber-500 animate-pulse">
                                <div className="w-2 h-2 bg-amber-500 rounded-full" />
                                Unsaved
                            </div>
                        )}
                        {saveStatus && saveStatus === 'saving' && (
                            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-medium text-gray-500 dark:text-gray-400">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-ping" />
                                Saving...
                            </div>
                        )}
                        {saveStatus && saveStatus === 'saved' && (
                            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-gray-400 dark:text-gray-500 transition-opacity duration-500">
                                <CheckIcon className="w-3 h-3" />
                                Saved
                            </div>
                        )}

                        <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block"></div>

                        <IconButton
                            onClick={onGetHelp}
                            disabled={isLoading}
                            title="Ask AI for help"
                            icon={<HelpIcon className="w-4 h-4" />}
                            label="Help"
                            variant="secondary"
                            className="hidden sm:flex"
                        />
                        <IconButton
                            onClick={onGetHelp}
                            disabled={isLoading}
                            title="Ask AI for help"
                            icon={<HelpIcon className="w-4 h-4" />}
                            label=""
                            variant="secondary"
                            className="sm:hidden px-2"
                        />

                        {onExportCode && (
                            <IconButton
                                onClick={onExportCode}
                                disabled={isLoading}
                                title="Export code"
                                icon={<ExportIcon className="w-4 h-4" />}
                                label=""
                                className="hidden sm:flex"
                            />
                        )}

                        {onImportCode && (
                            <IconButton
                                onClick={onImportCode}
                                disabled={isLoading}
                                title="Import code"
                                icon={<ImportIcon className="w-4 h-4" />}
                                label=""
                                className="hidden sm:flex"
                            />
                        )}

                        <IconButton
                            onClick={onResetCode}
                            disabled={isLoading}
                            title={`${resetButtonLabel} code`}
                            icon={<ResetIcon className="w-4 h-4" />}
                            label={resetButtonLabel}
                            className="hidden sm:flex"
                        />
                        <IconButton
                            onClick={onResetCode}
                            disabled={isLoading}
                            title={`${resetButtonLabel} code`}
                            icon={<ResetIcon className="w-4 h-4" />}
                            label=""
                            className="sm:hidden px-2"
                        />

                        <IconButton
                            onClick={onRunCode}
                            disabled={isLoading}
                            icon={isLoading ? <SpinnerIcon className="animate-spin h-4 w-4 text-white" /> : <PlayIcon className="w-5 h-5" />}
                            label={isLoading ? '...' : 'Run'}
                            variant="primary"
                        />
                    </div>
                )}
            </div>
            {!isCollapsed && (
                <div className="flex-1 flex overflow-hidden p-2 relative">
                    {/* Hover Tooltip */}
                    {hoveredIssue && (
                        <div
                            className={`fixed z-50 px-3 py-2 bg-gray-900 text-white text-xs rounded shadow-lg border-l-4 max-w-xs animate-fade-in pointer-events-none ${hoveredIssue.issue.type === 'warning' ? 'border-blue-500' : 'border-red-500'}`}
                            style={{ left: hoveredIssue.x, top: hoveredIssue.y }}
                        >
                            <p className={`font-bold mb-1 ${hoveredIssue.issue.type === 'warning' ? 'text-blue-300' : 'text-red-300'}`}>
                                {hoveredIssue.issue.type === 'error' ? 'Syntax Error' : 'Warning'}
                            </p>
                            <p>{hoveredIssue.issue.message}</p>
                        </div>
                    )}

                    <div className="flex-1 flex overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm relative">
                        {/* Line Numbers */}
                        <pre
                            ref={lineNumbersRef}
                            className="py-4 pr-3 pl-4 text-right text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 select-none overflow-hidden border-r border-gray-200 dark:border-gray-700 font-mono hidden sm:block"
                            style={editorTypography}
                            aria-hidden="true"
                        >
                            {lineNumbers}
                        </pre>

                        {/* Editor Container */}
                        <div className="relative flex-1 overflow-hidden h-full bg-white dark:bg-gray-900">
                            {/* Wrapper for absolute positioning to work with scrolling content */}
                            <div className="min-w-full min-h-full relative">
                                {/* Error Marker Layer (Below text) */}
                                <div
                                    ref={errorLayerRef}
                                    className="absolute inset-0 m-0 py-4 pl-4 pr-4 whitespace-pre pointer-events-none font-mono z-0"
                                    style={editorTypography}
                                    aria-hidden="true"
                                >
                                    {lintIssues.map((issue, i) => {
                                        const lines = code.split('\n');
                                        const lineContent = lines[issue.line - 1] || '';
                                        const width = `${lineContent.length || 1}ch`;
                                        return (
                                            <div
                                                key={`${issue.line}-${i}`}
                                                className={`absolute border-b-2 border-dashed opacity-80 ${issue.type === 'warning' ? 'border-blue-500' : 'border-red-500'}`}
                                                style={{
                                                    top: `${(issue.line - 1) * 24 + 16 + 20}px`,
                                                    left: '16px',
                                                    width: width,
                                                    height: '2px'
                                                }}
                                            />
                                        );
                                    })}
                                </div>

                                {/* Syntax Highlighting Layer */}
                                <pre
                                    ref={preRef}
                                    className="absolute inset-0 m-0 py-4 pl-4 pr-4 whitespace-pre pointer-events-none select-none font-mono z-10"
                                    style={editorTypography}
                                    aria-hidden="true"
                                >
                                    <code
                                        className="language-python"
                                        style={{ ...editorTypography, fontFamily: 'inherit' }}
                                        dangerouslySetInnerHTML={{ __html: highlightedCode }}
                                    />
                                </pre>

                                {/* Input Layer */}
                                <textarea
                                    ref={textareaRef}
                                    value={code}
                                    onChange={handleChange}
                                    onKeyDown={handleKeyDown}
                                    onScroll={handleScroll}
                                    onMouseMove={handleMouseMove}
                                    onMouseLeave={handleMouseLeave}
                                    className="absolute inset-0 w-full h-full py-4 pl-4 pr-4 bg-transparent text-transparent caret-gray-900 dark:caret-white resize-none outline-none whitespace-pre overflow-hidden z-30 font-mono"
                                    style={editorTypography}
                                    spellCheck="false"
                                    autoCapitalize="off"
                                    autoComplete="off"
                                    autoCorrect="off"
                                />

                                {/* Dropdown Suggestions Layer (Z-index higher than textarea to float on top) */}
                                {suggestions.length > 0 && suggestionPos && (
                                    <ul
                                        className="absolute z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg overflow-hidden min-w-[150px]"
                                        style={{
                                            top: suggestionPos.top,
                                            left: suggestionPos.left
                                        }}
                                    >
                                        {suggestions.map((suggestion, index) => (
                                            <li
                                                key={suggestion}
                                                onClick={() => acceptSuggestion(index)}
                                                className={`px-3 py-1 text-sm font-mono cursor-pointer flex justify-between items-center ${index === selectedIndex
                                                    ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                    }`}
                                            >
                                                <span>{suggestion}</span>
                                                {index === selectedIndex && <span className="text-[10px] opacity-50 ml-2">Tab</span>}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
