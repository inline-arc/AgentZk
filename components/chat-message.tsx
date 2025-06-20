"use client"

import { motion } from "framer-motion"
import Image from "next/image"

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
      className="flex items-start justify-start"
    >
      <div className="flex-shrink-0 mr-3">
        <div
          className={`${
            isUser ? "bg-[#2658DD]" : "bg-white"
          } rounded-lg flex items-center justify-center w-8 h-8`}
        >
          {isUser ? (
            <img src="/icons/user-icon.png" alt="User" className="object-contain w-6 h-6" />
          ) : (
            <Image src="/sendai.jpg" alt="Sendai Logo" width={32} height={32} className="rounded-lg" />
          )}
        </div>
      </div>
      <div className="flex-1">
        <div
          className={`rounded-lg p-4 ${
            isUser
              ? "bg-[#2658DD]/10 border border-[#2658DD]/30"
              : "bg-white/10 border border-white/30"
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
