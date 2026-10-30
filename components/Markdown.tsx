import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

const remarkPlugins = [remarkGfm];
const rehypePlugins = [rehypeHighlight];

/**
 * Renders lesson and chat markdown. react-markdown never injects raw HTML, so
 * AI replies and lesson text can't run script in the page.
 */
export const Markdown: React.FC<{ children: string; className?: string }> = ({ children, className }) => (
    <div className={className}>
        <ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins}>
            {children}
        </ReactMarkdown>
    </div>
);
