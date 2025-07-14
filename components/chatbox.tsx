import { motion } from 'framer-motion'
import React from 'react';  
import { useState, useEffect, useContext, createContext } from 'react';

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
            ? "bg-gradient-to-r from-[#7b5cfa]/20 to-[#9d5cfa]/20 backdrop-blur-md border border-[#7b5cfa]/30"
            : "bg-[#2d2936]/80 backdrop-blur-md border border-[#3a3545]/50"
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
          <div className="text-gray-200">
            {message.split('\n').map((line, index) => (
              <p key={index} className="mb-2 last:mb-0">
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
    <div className="text-gray-200">
      {displayText.split('\n').map((line, index) => (
        <p key={index} className="mb-2 last:mb-0">
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
      {!isComplete && (
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 0.8 }}
          className="inline-block w-1 h-4 ml-0.5 bg-gray-300 align-middle"
        />
      )}
    </div>
  )
}