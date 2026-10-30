import React, { useRef, useState, useEffect } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
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
    onToggleAutocomplete?: () => void;
}

import { 
    Play, 
    Loader2, 
    HelpCircle, 
    RotateCw, 
    Download, 
    Upload, 
    ArrowLeft, 
    Check, 
    Settings 
} from 'lucide-react';

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
    enableAutocomplete = false,
    onToggleAutocomplete
}) => {
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<Monaco | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Detect dark mode from document
    useEffect(() => {
        const checkDarkMode = () => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        };
        
        checkDarkMode();
        
        // Watch for theme changes
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });
        
        return () => observer.disconnect();
    }, []);

    // Handle editor mount
    const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;

        // Force update value if it doesn't match prop (fixes race condition on mount)
        if (code && editor.getValue() !== code) {
            editor.setValue(code);
        }

        // Configure editor options
        editor.updateOptions({
            fontSize: 14,
            fontFamily: '"JetBrains Mono", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", monospace',
            lineHeight: 24,
            tabSize: 4,
            insertSpaces: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'off',
            automaticLayout: true,
            quickSuggestions: enableAutocomplete,
            suggestOnTriggerCharacters: enableAutocomplete,
            acceptSuggestionOnCommitCharacter: enableAutocomplete,
            tabCompletion: enableAutocomplete ? 'on' : 'off',
            parameterHints: { enabled: enableAutocomplete },
            suggest: {
                showKeywords: enableAutocomplete,
                showSnippets: enableAutocomplete,
            }
        });

        // Focus the editor
        editor.focus();
    };

    // Update lint markers when lintIssues change
    useEffect(() => {
        if (editorRef.current && monacoRef.current) {
            const model = editorRef.current.getModel();
            if (model) {
                const markers: monaco.editor.IMarkerData[] = lintIssues.map(issue => ({
                    severity: issue.type === 'error' 
                        ? monacoRef.current!.MarkerSeverity.Error 
                        : monacoRef.current!.MarkerSeverity.Warning,
                    startLineNumber: issue.line,
                    startColumn: 1,
                    endLineNumber: issue.line,
                    endColumn: model.getLineMaxColumn(issue.line),
                    message: issue.message,
                }));
                
                monacoRef.current.editor.setModelMarkers(model, 'linter', markers);
            }
        }
    }, [lintIssues]);

    // Update autocomplete settings
    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.updateOptions({
                quickSuggestions: enableAutocomplete,
                suggestOnTriggerCharacters: enableAutocomplete,
                acceptSuggestionOnCommitCharacter: enableAutocomplete,
                tabCompletion: enableAutocomplete ? 'on' : 'off',
                parameterHints: { enabled: enableAutocomplete },
                suggest: {
                    showKeywords: enableAutocomplete,
                    showSnippets: enableAutocomplete,
                }
            });
        }
    }, [enableAutocomplete]);

    // Handle code changes from parent (e.g., Reset, Import, Concept-to-Code)
    useEffect(() => {
        if (editorRef.current) {
            const currentValue = editorRef.current.getValue();
            // Directly compare strings to avoid unnecessary updates, but ensure update if different
            if (currentValue !== code) {
                // Use executeEdits to preserve undo stack if desired, or setValue for complete replacement
                // For "Concept-to-Code" replacement, setValue is safer to ensure exact match.
                editorRef.current.setValue(code);
            }
        }
    }, [code]); // Dependency on 'code' ensures this runs whenever parent updates prop

    const handleEditorChange = (value: string | undefined) => {
        if (value !== undefined) {
            setCode(value);
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="h-12 px-2 sm:px-4 flex justify-between items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 flex-shrink-0 z-10">
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
                                    <ArrowLeft className="w-5 h-5" />
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
                                <Check className="w-3 h-3" />
                                Saved
                            </div>
                        )}

                        <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block"></div>

                        {onToggleAutocomplete && (
                            <div className="relative">
                                <IconButton
                                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                                    disabled={isLoading}
                                    title="IDE Settings"
                                    icon={<Settings className="w-4 h-4" />}
                                    label=""
                                    variant="secondary"
                                    className="hidden sm:flex"
                                />
                                {isSettingsOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setIsSettingsOpen(false)}
                                        />
                                        <div className="absolute right-0 top-full mt-2 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 min-w-[200px]">
                                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">IDE Settings</h3>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-700 dark:text-gray-300">Auto Suggest</span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onToggleAutocomplete();
                                                    }}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enableAutocomplete ? 'bg-cyan-600' : 'bg-gray-300 dark:bg-gray-600'
                                                        }`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enableAutocomplete ? 'translate-x-6' : 'translate-x-1'
                                                            }`}
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        <IconButton
                            onClick={onGetHelp}
                            disabled={isLoading}
                            title="Ask AI for help"
                            icon={<HelpCircle className="w-4 h-4" />}
                            label="Help"
                            variant="secondary"
                            className="hidden sm:flex"
                        />
                        <IconButton
                            onClick={onGetHelp}
                            disabled={isLoading}
                            title="Ask AI for help"
                            icon={<HelpCircle className="w-4 h-4" />}
                            label=""
                            variant="secondary"
                            className="sm:hidden px-2"
                        />

                        {onExportCode && (
                            <IconButton
                                onClick={onExportCode}
                                disabled={isLoading}
                                title="Export code"
                                icon={<Download className="w-4 h-4" />}
                                label=""
                                className="hidden sm:flex"
                            />
                        )}

                        {onImportCode && (
                            <IconButton
                                onClick={onImportCode}
                                disabled={isLoading}
                                title="Import code"
                                icon={<Upload className="w-4 h-4" />}
                                label=""
                                className="hidden sm:flex"
                            />
                        )}

                        <IconButton
                            onClick={onResetCode}
                            disabled={isLoading}
                            title={`${resetButtonLabel} code`}
                            icon={<RotateCw className="w-4 h-4" />}
                            label={resetButtonLabel}
                            className="hidden sm:flex"
                        />
                        <IconButton
                            onClick={onResetCode}
                            disabled={isLoading}
                            title={`${resetButtonLabel} code`}
                            icon={<RotateCw className="w-4 h-4" />}
                            label=""
                            className="sm:hidden px-2"
                        />

                        <IconButton
                            onClick={onRunCode}
                            disabled={isLoading}
                            icon={isLoading ? <Loader2 className="animate-spin h-4 w-4 text-white" /> : <Play className="w-5 h-5" />}
                            label={isLoading ? '...' : 'Run'}
                            variant="primary"
                        />
                    </div>
                )}
            </div>
            {!isCollapsed && (
                <div className="flex-1 overflow-hidden relative">
                    <div className="absolute inset-0">
                        <Editor
                            height="100%"
                            defaultLanguage="python"
                            value={code}
                            onChange={handleEditorChange}
                            onMount={handleEditorDidMount}
                            theme={isDarkMode ? 'vs-dark' : 'vs-light'}
                            options={{
                                fontSize: 14,
                                fontFamily: '"JetBrains Mono", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", monospace',
                                lineHeight: 24,
                                tabSize: 4,
                                insertSpaces: true,
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                wordWrap: 'off',
                                automaticLayout: true,
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
