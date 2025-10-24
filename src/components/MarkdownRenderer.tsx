import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Simple markdown parser
  const parseMarkdown = (text: string) => {
    if (!text) return '';

    let html = text;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 id="$1" class="scroll-mt-20">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 id="$1" class="scroll-mt-20">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/gim, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    html = html.replace(/_(.*?)_/gim, '<em>$1</em>');

    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/gim, (match, lang, code) => {
      return `<pre><code class="language-${lang || 'plaintext'}">${escapeHtml(code.trim())}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" />');

    // Unordered lists
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Ordered lists
    html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');
    
    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

    // Horizontal rule
    html = html.replace(/^---$/gim, '<hr />');
    html = html.replace(/^\*\*\*$/gim, '<hr />');

    // Line breaks
    html = html.replace(/\n\n/g, '</p><p>');
    html = `<p>${html}</p>`;

    return html;
  };

  const escapeHtml = (text: string) => {
    const map: { [key: string]: string } = {
      '&': '&',
      '<': '<',
      '>': '>',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  };

  return (
    <div
      className="prose prose-lg max-w-none
        prose-headings:text-gray-900
        prose-h1:text-4xl prose-h1:mb-4
        prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-200
        prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
        prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
        prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
        prose-strong:text-gray-900
        prose-code:text-pink-600 prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-6 prose-pre:rounded-xl prose-pre:overflow-x-auto
        prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
        prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6
        prose-li:text-gray-700 prose-li:mb-2
        prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-gray-600 prose-blockquote:my-6
        prose-img:rounded-xl prose-img:my-8 prose-img:shadow-lg
        prose-hr:my-12 prose-hr:border-gray-300"
      dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
    />
  );
}
