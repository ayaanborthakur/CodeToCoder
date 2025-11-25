
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { CollapseIcon } from './CollapseIcon';

declare var marked: { parse: (markdown: string) => string } | undefined;

declare global {
  interface Window {
    Prism: any;
    marked: any;
  }
}

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const SparklesIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
);

const PaperAirplaneIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className || "w-5 h-5"}>
      <path d="M3.105 2.289a.75.75 0 0 0-.826.95l1.414 4.949a.75.75 0 0 0 .95.826L11.25 9.25v1.5L4.642 12.02a.75.75 0 0 0-.826.95l1.414 4.949a.75.75 0 0 0 .95.826L16.25 12l-13.145-9.711Z" />
    </svg>
);

const parseMarkdown = (content: string) => {
    if (typeof window !== 'undefined' && window.marked && window.marked.parse) {
        return window.marked.parse(content);
    }
    return content;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, isLoading, isCollapsed, onToggleCollapse }) => {
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isCollapsed) {
        scrollToBottom();
    }
    if (typeof window !== 'undefined' && window.Prism) {
        setTimeout(() => {
             window.Prism.highlightAll();
        }, 0);
    }
  }, [messages, isLoading, isCollapsed, isInputOpen]);

  useEffect(() => {
      if(isInputOpen && inputRef.current) {
          inputRef.current.focus();
      }
  }, [isInputOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
      setIsInputOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSubmit(e);
      }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className={`h-12 px-4 flex items-center border-b border-gray-200 dark:border-gray-800 ${isCollapsed ? 'justify-end' : 'justify-between'} flex-shrink-0`}>
        {!isCollapsed && (
             <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">AI Guidance</h3>
        )}
        <button 
            onClick={onToggleCollapse} 
            className="p-1 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white transition-colors"
            aria-label={isCollapsed ? "Expand AI assistant panel" : "Collapse AI assistant panel"}
        >
            <CollapseIcon isCollapsed={isCollapsed} />
        </button>
      </div>

      {!isCollapsed && (
        <>
            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {messages.map((msg, index) => (
                <div key={index} className="animate-fade-in">
                    {msg.role === 'user' ? (
                        <div className="mb-2 pb-2 border-b border-gray-200 dark:border-gray-800">
                             <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 block mb-1">You Asked</span>
                             <p className="text-gray-800 dark:text-gray-200 font-medium">{msg.content}</p>
                        </div>
                    ) : (
                        <div className="prose prose-sm max-w-none dark:prose-invert text-gray-600 dark:text-gray-300 leading-relaxed prose-code:text-cyan-600 dark:prose-code:text-cyan-400 prose-code:bg-white dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-medium prose-code:before:content-none prose-code:after:content-none">
                             <div dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }} />
                        </div>
                    )}
                </div>
                ))}
                
                {isLoading && (
                    <div className="flex items-center gap-3 text-gray-400 italic animate-pulse">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                        <span>Thinking...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Footer Action Area */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                {!isInputOpen ? (
                     <button
                        onClick={() => setIsInputOpen(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm text-gray-700 dark:text-gray-200 font-semibold hover:border-cyan-500 dark:hover:border-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all group"
                     >
                        <SparklesIcon className="w-5 h-5 text-gray-400 group-hover:text-cyan-500 transition-colors" />
                        <span>Ask a Question</span>
                     </button>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3 animate-slide-up">
                        <div className="relative">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type your question here..."
                                className="w-full p-4 pr-12 bg-gray-50 dark:bg-gray-800 border border-cyan-500 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none shadow-md resize-none min-h-[100px]"
                            />
                            <button 
                                type="button" 
                                onClick={() => setIsInputOpen(false)}
                                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                                aria-label="Cancel question"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-400 hidden sm:inline">Press Enter to send</span>
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="w-full sm:w-auto bg-cyan-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-cyan-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
                            >
                                <PaperAirplaneIcon />
                                <span>{isLoading ? 'Sending...' : 'Send'}</span>
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </>
      )}
    </div>
  );
};
