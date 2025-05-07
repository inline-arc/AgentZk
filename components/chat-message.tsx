"use client"

import { motion } from "framer-motion"
import { User, Bot } from "lucide-react"

interface ChatMessageProps {
  message: string
  role: "user" | "assistant"
  isLast: boolean
}

export function ChatMessage({ message, role, isLast }: ChatMessageProps) {
  const isUser = role === "user"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className={`flex max-w-[80%] ${isUser ? "flex-row-reverse" : "flex-row"} items-start gap-3`}>
        <div
          className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md ${
            isUser ? "bg-purple-600" : "bg-[#3a3545]"
          }`}
        >
          {isUser ? <User className="h-5 w-5 text-white" /> : <Bot className="h-5 w-5 text-white" />}
        </div>
        <div
          className={`glass-message rounded-lg p-4 ${
            isUser
              ? "bg-purple-600/20 backdrop-blur-md border border-purple-600/30"
              : "bg-[#2d2936]/80 backdrop-blur-md border border-[#3a3545]"
          }`}
        >
          {isLast && role === "assistant" ? (
            <TypewriterText text={message} />
          ) : (
            <p className="text-gray-200 whitespace-pre-wrap">{message}</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Typewriter effect for the last assistant message
function TypewriterText({ text }: { text: string }) {
  return (
    <motion.p className="text-gray-200 whitespace-pre-wrap" initial={{ opacity: 1 }} animate={{ opacity: 1 }}>
      <motion.span
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{ duration: 0.05 * text.length, ease: "linear" }}
        style={{ display: "inline-block", whiteSpace: "pre-wrap" }}
      >
        {text}
      </motion.span>
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 0.8 }}
        className="inline-block w-1 h-4 ml-0.5 bg-gray-300 align-middle"
      />
    </motion.p>
  )
}
