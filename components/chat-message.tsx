"use client"

import { motion } from "framer-motion"
import { useState, useEffect, createContext, useContext, memo } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatMessageProps {
  message: string
  role: "user" | "assistant"
  isLast: boolean
}

// AI Reasoning Context
type AIReasoningContextValue = {
  isStreaming: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  duration: number;
};

const AIReasoningContext = createContext<AIReasoningContextValue | null>(null);

const useAIReasoning = () => {
  const context = useContext(AIReasoningContext);
  if (!context) {
    throw new Error('AIReasoning components must be used within AIReasoning');
  }
  return context;
};

export function ChatMessage({ message, role, isLast }: ChatMessageProps) {
  const isUser = role === "user"
  const [isOpen, setIsOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(isLast && role === "assistant");
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [hasAutoClosed, setHasAutoClosed] = useState(false);

  // Track duration when streaming starts and ends
  useEffect(() => {
    if (isStreaming) {
      if (startTime === null) {
        setStartTime(Date.now());
      }
    } else if (startTime !== null) {
      setDuration(Math.round((Date.now() - startTime) / 1000));
      setStartTime(null);
    }
  }, [isStreaming, startTime]);

  // Auto-open when streaming starts, auto-close when streaming ends
  useEffect(() => {
    if (isStreaming && !isOpen) {
      setIsOpen(true);
    } else if (!isStreaming && isOpen && !hasAutoClosed && isLast) {
      const timer = setTimeout(() => {
        setIsOpen(false);
        setHasAutoClosed(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isStreaming, isOpen, hasAutoClosed, isLast]);

  // End streaming effect after animation completes
  useEffect(() => {
    if (isLast && role === "assistant") {
      const timer = setTimeout(() => {
        setIsStreaming(false);
      }, message.length * 50); // Roughly based on typewriter speed
      return () => clearTimeout(timer);
    }
  }, [isLast, role, message.length]);

  return (
    <AIReasoningContext.Provider value={{ isStreaming, isOpen, setIsOpen, duration }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex ${isUser ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`max-w-[80%] rounded-lg p-4 relative ${
            isUser
              ? "bg-gradient-to-r from-[#7b5cfa]/20 to-[#9d5cfa]/20 backdrop-blur-md border border-[#7b5cfa]/30"
              : "bg-[#2d2936]/80 backdrop-blur-md border border-[#3a3545]/50"
          }`}
        >
          {isLast && role === "assistant" ? (
            <>
              <TypewriterText text={message} />
              
            </>
          ) : (
            <p className="text-gray-200 whitespace-pre-wrap">{message}</p>
          )}
        </div>
      </motion.div>
    </AIReasoningContext.Provider>
  )
}

// Typewriter effect for the last assistant message with enhanced markdown support
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

  const segments = processCodeBlocks(displayText);

  return (
    <div className="text-gray-200 markdown-content">
      {segments.map((segment, segmentIndex) => {
        if (segment.type === 'code') {
          return (
            <div key={segmentIndex} className="my-4 relative">
              <div className="flex items-center justify-between bg-[#161320] px-4 py-2 rounded-t-md">
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
              return <h1 key={`${segmentIndex}-${index}`} className="text-2xl font-bold mb-4 text-white">{line.slice(2)}</h1>;
            } else if (line.startsWith('## ')) {
              return <h2 key={`${segmentIndex}-${index}`} className="text-xl font-bold mb-3 text-white">{line.slice(3)}</h2>;
            } else if (line.startsWith('### ')) {
              return <h3 key={`${segmentIndex}-${index}`} className="text-lg font-bold mb-2 text-white">{line.slice(4)}</h3>;
            } else if (line.startsWith('- ')) {
              return (
                <div key={`${segmentIndex}-${index}`} className="flex items-start mb-1 ml-4">
                  <span className="mr-2 text-purple-400">•</span>
                  <span>{line.slice(2)}</span>
                </div>
              );
            } else if (line.match(/^\d+\.\s/)) {
              const numMatch = line.match(/^(\d+)\.\s(.*)/);
              if (numMatch) {
                return (
                  <div key={`${segmentIndex}-${index}`} className="flex items-start mb-1 ml-4">
                    <span className="mr-2 text-purple-400 min-w-[20px]">{numMatch[1]}.</span>
                    <span>{numMatch[2]}</span>
                  </div>
                );
              }
            } else if (line.startsWith('> ')) {
              return (
                <blockquote key={`${segmentIndex}-${index}`} className="border-l-4 border-purple-500 pl-4 py-1 my-2 bg-[#2a2535]/50 rounded-r-md">
                  {line.slice(2)}
                </blockquote>
              );
            } else if (line.startsWith('---')) {
              return <hr key={`${segmentIndex}-${index}`} className="my-4 border-[#3a3545]" />;
            } else if (line.includes('**') || line.includes('`') || line.includes('__')) {
              return (
                <p key={`${segmentIndex}-${index}`} className="mb-2 last:mb-0">
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
              return <p key={`${segmentIndex}-${index}`} className="mb-2 last:mb-0">{line}</p>;
            }
          });
        }
      })}
    </div>
  );
}
