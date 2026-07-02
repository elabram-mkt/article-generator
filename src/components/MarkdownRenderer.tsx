import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  // Split content into blocks by double line breaks
  const blocks = content.split(/\n\s*\n/);

  return (
    <div className="markdown-body space-y-4">
      {blocks.map((block, index) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Header 2 (## Heading)
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={index} className="text-xl font-bold font-display text-gray-900 mt-6 mb-3 tracking-tight">
              {parseInlineMarkdown(trimmed.substring(3))}
            </h2>
          );
        }

        // Header 3 (### Heading)
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={index} className="text-lg font-semibold font-display text-gray-800 mt-4 mb-2 tracking-tight">
              {parseInlineMarkdown(trimmed.substring(4))}
            </h3>
          );
        }

        // Blockquote (> text)
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote key={index} className="border-l-4 border-indigo-500 pl-4 py-1 my-4 italic text-gray-600 bg-indigo-50/30 rounded-r-md">
              {parseInlineMarkdown(trimmed.substring(2))}
            </blockquote>
          );
        }

        // Bulleted lists
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const items = trimmed.split(/\n[-*]\s+/).map(item => {
            // Remove leading bullet if it exists (for the first item)
            if (item.startsWith('- ') || item.startsWith('* ')) {
              return item.substring(2);
            }
            return item;
          });

          return (
            <ul key={index} className="list-disc pl-5 space-y-2 my-3 text-gray-700">
              {items.map((item, itemIdx) => (
                <li key={itemIdx}>{parseInlineMarkdown(item)}</li>
              ))}
            </ul>
          );
        }

        // Numbered lists
        if (/^\d+\.\s+/.test(trimmed)) {
          const items = trimmed.split(/\n\d+\.\s+/).map(item => {
            return item.replace(/^\d+\.\s+/, '');
          });

          return (
            <ol key={index} className="list-decimal pl-5 space-y-2 my-3 text-gray-700">
              {items.map((item, itemIdx) => (
                <li key={itemIdx}>{parseInlineMarkdown(item)}</li>
              ))}
            </ol>
          );
        }

        // Standard Paragraph
        return (
          <p key={index} className="text-gray-700 leading-relaxed">
            {parseInlineMarkdown(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

// Simple inline markdown parsing for bold (**text** or *text*)
function parseInlineMarkdown(text: string): React.ReactNode[] {
  // Regex to split on bold segments (**text**)
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);
      return <strong key={index} className="font-semibold text-gray-950">{boldText}</strong>;
    }
    
    // Support simple single asterisks (*text*)
    const italicParts = part.split(/(\*[^*]+\*)/g);
    if (italicParts.length > 1) {
      return (
        <span key={index}>
          {italicParts.map((ip, i) => {
            if (ip.startsWith('*') && ip.endsWith('*')) {
              return <em key={i} className="italic text-gray-800">{ip.slice(1, -1)}</em>;
            }
            return ip;
          })}
        </span>
      );
    }

    return part;
  });
}
