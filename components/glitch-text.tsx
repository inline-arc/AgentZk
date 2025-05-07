"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface GlitchTextProps {
  text: string
  interval?: number
  duration?: number
}

export function GlitchText({ text, interval = 3000, duration = 1500 }: GlitchTextProps) {
  const [isGlitching, setIsGlitching] = useState(false)
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  const [displayText, setDisplayText] = useState(text)

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsGlitching(true)

      let iterations = 0
      const maxIterations = 10
      const iterationInterval = duration / maxIterations

      const glitchIntervalId = setInterval(() => {
        setDisplayText((prevText) => {
          return prevText
            .split("")
            .map((char, idx) => {
              // Keep spaces as they are
              if (char === " ") return " "

              // As iterations increase, more characters return to original
              if (iterations / maxIterations > Math.random() || idx < (iterations * text.length) / maxIterations) {
                return text[idx]
              }

              // Replace with random character
              return characters.charAt(Math.floor(Math.random() * characters.length))
            })
            .join("")
        })

        iterations++

        if (iterations >= maxIterations) {
          clearInterval(glitchIntervalId)
          setDisplayText(text)
          setIsGlitching(false)
        }
      }, iterationInterval)

      return () => clearInterval(glitchIntervalId)
    }, interval)

    return () => clearInterval(intervalId)
  }, [text, interval, duration])

  return (
    <motion.span
      className={isGlitching ? "text-purple-400" : ""}
      animate={{
        x: isGlitching ? [0, -2, 3, -1, 0] : 0,
      }}
      transition={{ duration: 0.2, repeat: isGlitching ? 2 : 0 }}
    >
      {displayText}
    </motion.span>
  )
}
