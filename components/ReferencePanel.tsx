
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReferenceTopic } from '../types';
import { contentService } from '../services/contentService';
import { generateReference } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';
import { saveReferenceMaterial, loadReferenceMaterials } from '../services/userDataService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

declare global {
    interface Window {
        Prism: any;
    }
}

const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-4 h-4"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
);

const BookIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
);

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-4 h-4"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);

const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
);

const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-4 h-4"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

const GENERATOR_TOPIC_ID = 'custom-generator-ui';

type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';
type SizeLevel = 'Small' | 'Medium' | 'Large';

interface ReferencePanelProps {
    embedded?: boolean;
}

export const ReferencePanel: React.FC<ReferencePanelProps> = ({ embedded = false }) => {
    const { itemId } = useParams();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTopic, setSelectedTopic] = useState<ReferenceTopic | null>(null);
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
    const { user } = useAuth();

    const [references, setReferences] = useState<ReferenceTopic[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadRefs = async () => {
            try {
                const data = await contentService.getReferences();
                setReferences(data);
            } catch (error) {
                console.error("Failed to load references:", error);
            } finally {
                setLoading(false);
            }
        };
        loadRefs();
    }, []);

    // Custom Generator State
    const [customTopics, setCustomTopics] = useState<ReferenceTopic[]>([]);
    const [generatorInput, setGeneratorInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [difficulty, setDifficulty] = useState<DifficultyLevel>('Medium');
    const [size, setSize] = useState<SizeLevel>('Medium');

    // Initial Generator Option
    const generatorOption: ReferenceTopic = {
        id: GENERATOR_TOPIC_ID,
        title: '✨ Create New Guide',
        category: 'Custom',
        content: '' // Special handling in render
    };

    // Combine standard data with custom data
    const allReferenceData = useMemo(() => {
        return [...references, generatorOption, ...customTopics];
    }, [references, customTopics]);

    // Group data by category
    const categories = useMemo<Record<string, ReferenceTopic[]>>(() => {
        const groups: Record<string, ReferenceTopic[]> = {};
        allReferenceData.forEach(topic => {
            if (!groups[topic.category]) groups[topic.category] = [];
            groups[topic.category].push(topic);
        });
        // Ensure "Custom" is always at the top or specific place?
        // Let's reorder keys to put Custom first
        const orderedGroups: Record<string, ReferenceTopic[]> = {};
        if (groups['Custom']) {
            orderedGroups['Custom'] = groups['Custom'];
            delete groups['Custom'];
        }
        return { ...orderedGroups, ...groups };
    }, [allReferenceData]);

    // Initialize all categories as open initially
    useEffect(() => {
        if (loading) return; // Wait for loading

        const initialOpen: Record<string, boolean> = {};
        Object.keys(categories).forEach(cat => initialOpen[cat] = true);
        setOpenCategories(prev => ({ ...initialOpen, ...prev })); // Merge to keep user state if possible

        // Select first topic by default if none selected
        if (references.length > 0 && !selectedTopic && !itemId) {
            setSelectedTopic(references[0]);
        }
    }, [categories.length, loading, references]); 

    // Sync selection with URL
    useEffect(() => {
        if (embedded || loading) return;

        if (itemId) {
            const topic = allReferenceData.find(t => t.id === itemId);
            if (topic) {
                setSelectedTopic(topic);
            }
        } else if (references.length > 0 && !selectedTopic) {
            // Default to first if no ID and no selection
            setSelectedTopic(references[0]);
        }
    }, [itemId, allReferenceData, embedded, loading, references]);

    // Load custom references on mount
    useEffect(() => {
        if (user) {
            loadReferenceMaterials(user.id).then(materials => {
                const topics: ReferenceTopic[] = materials.map(m => ({
                    id: m.id,
                    title: m.title,
                    category: m.category || 'Custom',
                    content: m.content
                }));
                setCustomTopics(topics);
            });
        }
    }, [user]);

    const toggleCategory = (category: string) => {
        setOpenCategories(prev => ({ ...prev, [category]: !prev[category] }));
    };

    const filteredData = useMemo<Record<string, ReferenceTopic[]>>(() => {
        if (!searchQuery) return categories;

        const filtered: Record<string, ReferenceTopic[]> = {};
        Object.entries(categories).forEach(([cat, topics]) => {
            const matchingTopics = (topics as ReferenceTopic[]).filter(t =>
                t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.content.toLowerCase().includes(searchQuery.toLowerCase())
            );
            if (matchingTopics.length > 0) {
                filtered[cat] = matchingTopics;
            }
        });
        return filtered;
    }, [categories, searchQuery]);

    // Highlight code when topic changes
    useEffect(() => {
        if (typeof window !== 'undefined' && window.Prism && selectedTopic?.id !== GENERATOR_TOPIC_ID) {
            setTimeout(() => window.Prism.highlightAll(), 0);
        }
    }, [selectedTopic, customTopics]);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!generatorInput.trim() || isGenerating) return;

        setIsGenerating(true);
        try {
            const result = await generateReference(generatorInput, difficulty, size);

            const newTopic: ReferenceTopic = {
                id: `custom-${Date.now()}`,
                title: result.title,
                category: 'Custom',
                content: result.content
            };

            if (user) {
                saveReferenceMaterial(user.id, {
                    id: newTopic.id,
                    title: newTopic.title,
                    content: newTopic.content,
                    category: 'Custom',
                    createdAt: Date.now()
                });
            }

            setCustomTopics(prev => [newTopic, ...prev]);
            if (embedded) {
                setSelectedTopic(newTopic);
            } else {
                navigate(`/reference/${newTopic.id}`);
            }
            setGeneratorInput('');
        } catch (error) {
            console.error("Generation failed", error);
        } finally {
            setIsGenerating(false);
        }
    };



    return (
        <div className="flex h-full w-full bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 overflow-hidden">
            {/* Sidebar */}
            <div className="w-72 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col flex-shrink-0">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search docs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {Object.entries(filteredData).map(([category, topics]) => (
                        <div key={category}>
                            <button
                                onClick={() => toggleCategory(category)}
                                className="w-full flex justify-between items-center mb-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                            >
                                {category}
                                <ChevronDownIcon className={`transition-transform duration-200 w-4 h-4 ${openCategories[category] ? '' : '-rotate-90'}`} />
                            </button>

                            {openCategories[category] && (
                                <ul className="space-y-1 pl-1 border-l-2 border-gray-200 dark:border-gray-800 ml-1">
                                    {(topics as ReferenceTopic[]).map(topic => (
                                        <li key={topic.id}>
                                            <button
                                                onClick={() => {
                                                    if (embedded) {
                                                        setSelectedTopic(topic);
                                                    } else {
                                                        navigate(`/reference/${topic.id}`);
                                                    }
                                                }}
                                                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${selectedTopic?.id === topic.id
                                                    ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 font-medium'
                                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                                                    }`}
                                            >
                                                {topic.id === GENERATOR_TOPIC_ID && <SparklesIcon className="w-4 h-4 text-cyan-500" />}
                                                <span className="truncate">{topic.title}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                    {Object.keys(filteredData).length === 0 && (
                        <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-8">
                            No topics found.
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-white dark:bg-gray-900">
                {selectedTopic?.id === GENERATOR_TOPIC_ID ? (
                    <div className="max-w-2xl mx-auto animate-fade-in">
                        <div className="text-center mb-12">
                            <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                <SparklesIcon className="w-10 h-10 text-white" />
                            </div>
                            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                                Custom Guide Generator
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-300">
                                Describe any Python topic, library, or concept, and AI will write a custom reference guide for you.
                            </p>
                        </div>

                        <form onSubmit={handleGenerate} className="space-y-6 bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    What do you want to learn?
                                </label>
                                <input
                                    type="text"
                                    value={generatorInput}
                                    onChange={(e) => setGeneratorInput(e.target.value)}
                                    placeholder="e.g., How to use regular expressions, Python decorators explained..."
                                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-gray-900 dark:text-white"
                                    disabled={isGenerating}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Difficulty
                                    </label>
                                    <select
                                        value={difficulty}
                                        onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-gray-900 dark:text-white appearance-none cursor-pointer"
                                        disabled={isGenerating}
                                    >
                                        <option value="Easy">Easy (Beginner)</option>
                                        <option value="Medium">Medium (Standard)</option>
                                        <option value="Hard">Hard (Advanced)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Size
                                    </label>
                                    <select
                                        value={size}
                                        onChange={(e) => setSize(e.target.value as SizeLevel)}
                                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-gray-900 dark:text-white appearance-none cursor-pointer"
                                        disabled={isGenerating}
                                    >
                                        <option value="Small">Small (Concise)</option>
                                        <option value="Medium">Medium (Standard)</option>
                                        <option value="Large">Large (In-Depth)</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={!generatorInput.trim() || isGenerating}
                                className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Generating Guide...
                                    </>
                                ) : (
                                    <>
                                        <PlusIcon className="w-5 h-5" />
                                        Generate Guide
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center text-sm text-gray-400">
                            <p>Generates a persistent guide in your "Custom" sidebar category.</p>
                        </div>
                    </div>
                ) : selectedTopic ? (
                    <div className="max-w-4xl mx-auto animate-fade-in">
                        <div className="mb-8 pb-4 border-b border-gray-200 dark:border-gray-800">
                            <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-2 block">
                                {selectedTopic.category}
                            </span>
                            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">{selectedTopic.title}</h1>
                        </div>
                        <div
                            className="prose prose-lg max-w-none dark:prose-invert 
                                       prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
                                       prose-p:text-gray-600 dark:prose-p:text-gray-300
                                       prose-code:text-cyan-700 dark:prose-code:text-cyan-300 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded"
                        >
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {selectedTopic.content}
                            </ReactMarkdown>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                        <BookIcon className="w-10 h-10 mb-4 opacity-50" />
                        <p className="text-lg">Select a topic to start reading</p>
                    </div>
                )}
            </div>
        </div>
    );
};
