import { motion } from 'framer-motion'
import React from 'react';  
import { useState, useEffect, useContext, createContext } from 'react';

// New component for rendering markdown content with enhanced code blocks
function MarkdownContent({ text }: { text: string }) {
  // Helper function to detect and process code blocks
  const processCodeBlocks = (text: string) => {
    const codeBlockRegex = /```([a-z]*)\n([\s\S]*?)```/g;
    const segments = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before the code block
      if (match.index > lastIndex) {
        segments.push({
          type: 'text',
          content: text.slice(lastIndex, match.index)
        });
      }

      // Add the code block
      segments.push({
        type: 'code',
        language: match[1] || 'plaintext',
        content: match[2]
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text after the last code block
    if (lastIndex < text.length) {
      segments.push({
        type: 'text',
        content: text.slice(lastIndex)
      });
    }

    return segments.length > 0 ? segments : [{ type: 'text', content: text }];
  };

  const segments = processCodeBlocks(text);

  return (
    <div className="text-gray-200 markdown-content">
      {segments.map((segment, segmentIndex) => {
        if (segment.type === 'code') {
          return (
            <div key={segmentIndex} className="my-4 relative">
              <div className="flex items-center justify-between bg-[#161320] px-4 py-2 rounded-t-md border-b border-[#3a3545]">
                <span className="text-xs text-gray-400">{segment.language}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(segment.content);
                    // Optional: Add visual feedback here
                  }}
                  className="text-xs text-gray-400 hover:text-purple-300 transition-colors px-2 py-1 rounded"
                >
                  Copy
                </button>
              </div>
              <pre className="bg-[#1a1625] p-4 rounded-b-md overflow-x-auto text-sm font-mono text-purple-300">
                {segment.content}
              </pre>
            </div>
          );
        } else {
          return segment.content.split('\n').map((line, index) => {
            // Enhanced markdown support for inline elements
            if (line.startsWith('# ')) {
              return <h1 key={`${segmentIndex}-${index}`} className="text-sm font-bold mb-4 text-white">{line.slice(2)}</h1>;
            } else if (line.startsWith('## ')) {
              return <h2 key={`${segmentIndex}-${index}`} className="text-sm font-bold mb-3 text-white">{line.slice(3)}</h2>;
            } else if (line.startsWith('### ')) {
              return <h3 key={`${segmentIndex}-${index}`} className="text-sm font-bold mb-2 text-white">{line.slice(4)}</h3>;
            } else if (line.startsWith('- ')) {
              return (
                <div key={`${segmentIndex}-${index}`} className="flex items-start mb-1 ml-4 text-sm">
                  <span className="mr-2 text-purple-400">•</span>
                  <span>{line.slice(2)}</span>
                </div>
              );
            } else if (line.match(/^\d+\.\s/)) {
              const numMatch = line.match(/^(\d+)\.\s(.*)/);
              if (numMatch) {
                return (
                  <div key={`${segmentIndex}-${index}`} className="flex items-start mb-1 ml-4 text-sm">
                    <span className="mr-2 text-purple-400 min-w-[20px]">{numMatch[1]}.</span>
                    <span>{numMatch[2]}</span>
                  </div>
                );
              }
            } else if (line.startsWith('> ')) {
              return (
                <blockquote key={`${segmentIndex}-${index}`} className="border-l-4 border-purple-500 pl-4 py-1 my-2 bg-[#2a2535]/50 rounded-r-md text-sm">
                  {line.slice(2)}
                </blockquote>
              );
            } else if (line.startsWith('---')) {
              return <hr key={`${segmentIndex}-${index}`} className="my-4 border-[#3a3545]" />;
            } else if (line.includes('**') || line.includes('`') || line.includes('__')) {
              return (
                <p key={`${segmentIndex}-${index}`} className="mb-2 last:mb-0 text-sm">
                  {line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                       .replace(/__(.*?)__/g, '<strong>$1</strong>')
                       .replace(/`(.*?)`/g, '<code>$1</code>')
                       .split(/<strong>|<\/strong>|<code>|<\/code>/).map((part, i) => {
                         if (i % 4 === 1) return <strong key={i} className="text-white font-semibold">{part}</strong>;
                         if (i % 4 === 3) return <code key={i} className="bg-[#1a1625] text-purple-300 px-1 py-0.5 rounded text-sm font-mono">{part}</code>;
                         return part;
                       })}
                </p>
              );
            } else if (line === '') {
              return <div key={`${segmentIndex}-${index}`} className="h-2"></div>;
            } else {
              return <p key={`${segmentIndex}-${index}`} className="mb-2 last:mb-0 text-sm">{line}</p>;
            }
          });
        }
      })}
    </div>
  );
}

export default function ChatBox({ message, role, isLast }: { message: string; role: "user" | "assistant"; isLast: boolean }) {
  const isUser = role === "user"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-4 relative ${
          isUser
            ? "bg-gradient-to-r from-[#7b5cfa]/20 to-[#9d5cfa]/20 backdrop-blur-md"
            : "bg-[#2d2936]/80 backdrop-blur-md"
        }`}
        style={{
          clipPath: isUser
            ? "polygon(0% 0%, 100% 0%, 100% 85%, 95% 100%, 0% 100%)"
            : "polygon(0% 0%, 100% 0%, 100% 100%, 5% 100%, 0% 85%)",
        }}
      >
        {isLast && role === "assistant" ? (
          <TypewriterText text={message} />
        ) : (
          <MarkdownContent text={message} />
        )}
      </div>
    </motion.div>
  )
}

//typewriter component
function TypewriterText({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    // Reset when text changes
    setDisplayText("")
    setCurrentIndex(0)
    setIsComplete(false)
  }, [text])

  useEffect(() => {
    if (currentIndex < text.length && !isComplete) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
        
        // Mark as complete when we reach the end
        if (currentIndex + 1 >= text.length) {
          setIsComplete(true)
        }
      }, 30)
      
      return () => clearTimeout(timeout)
    }
  }, [currentIndex, text.length, isComplete, text])

  return (
    <div className="text-gray-200 text-sm">
      {displayText.split('\n').map((line, index) => (
        <p key={index} className="mb-2 last:mb-0 text-sm">
          {line.includes('`') ? (
            line.split('`').map((part, i) => 
              i % 2 === 1 ? (
                <code key={i} className="bg-[#1a1625] text-purple-300 px-1 py-0.5 rounded text-sm font-mono">
                  {part}
                </code>
              ) : (
                part
              )
            )
          ) : (
            line.includes('**') ? (
              line.split('**').map((part, i) => 
                i % 2 === 1 ? (
                  <strong key={i} className="text-white font-semibold">{part}</strong>
                ) : (
                  part
                )
              )
            ) : (
              line
            )
          )}
        </p>
      ))}
    </div>
  )
}