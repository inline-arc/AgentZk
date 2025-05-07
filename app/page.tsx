"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import {
  Search,
  Sun,
  Settings,
  Code,
  BookOpen,
  Sparkles,
  FileText,
  Paperclip,
  ChevronDown,
  PanelLeft,
  Send,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { FileDropArea } from "@/components/file-drop-area"
import { ModelSelector } from "@/components/model-selector"
import { ChatMessage } from "@/components/chat-message"

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false)
  const [selectedModel, setSelectedModel] = useState("Gemini 2.5 Flash")
  const [showFileDropArea, setShowFileDropArea] = useState(false)
  const [message, setMessage] = useState("")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [chatStarted, setChatStarted] = useState(false)
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([])
  const modelSelectorRef = useRef<HTMLDivElement>(null)
  const modelButtonRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)

    const handleClickOutside = (event: MouseEvent) => {
      if (
        modelSelectorRef.current &&
        modelButtonRef.current &&
        !modelSelectorRef.current.contains(event.target as Node) &&
        !modelButtonRef.current.contains(event.target as Node)
      ) {
        setIsModelSelectorOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "48px"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [message])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = () => {
    if (!message.trim()) return

    // Add user message
    const newMessages = [...messages, { role: "user", content: message }]
    setMessages(newMessages)
    setChatStarted(true)
    setMessage("")

    // Simulate assistant response after a delay
    setTimeout(() => {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: `This is a simulated response to: "${message}"`,
        },
      ])
    }, 1000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!mounted) return null

  return (
    <div className="flex h-screen bg-[#1a1625]">
      {/* Sidebar */}
      <motion.div
        className="fixed md:relative z-40 h-full flex flex-col border-r border-[#2d2936] bg-[#1a1625]"
        initial={{ width: 250, x: 0 }}
        animate={{
          width: sidebarCollapsed ? 0 : 250,
          x: sidebarCollapsed ? -250 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="p-6 flex items-center">
          <div className="text-purple-300 font-semibold text-lg">Sniffzk</div>
        </div>

        <div className="px-4 py-2">
          <motion.button
            className="w-full bg-[#8e24aa] hover:bg-[#9c27b0] text-white rounded-md py-3 font-medium flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={18} />
            <span>New Chat</span>
          </motion.button>
        </div>

        <div className="px-4 py-2 relative">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search your threads..."
              className="w-full pl-9 pr-3 py-2 bg-[#2d2936] border-none rounded-md text-sm focus:outline-none text-gray-300"
            />
          </div>
        </div>

        <div className="px-4 py-3 text-sm text-purple-300 font-medium">Today</div>

        <div className="px-4 py-1">
          <div className="px-3 py-2 hover:bg-[#2d2936] rounded-md text-sm text-gray-300 cursor-pointer truncate">
            LLM for A2A Agents with Cha...
          </div>
        </div>

        <div className="mt-auto p-4 flex items-center justify-between text-gray-300 border-t border-[#2d2936]">
          <motion.button
            className="w-full bg-[#2d2936] hover:bg-[#3a3545] text-white rounded-md py-2 font-medium flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-sm">Connect Wallet</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {/* Sidebar Toggle Button - Positioned to not overlap with logo */}
        <button
          className="absolute left-4 top-4 z-50 text-gray-300 bg-transparent p-2 rounded-md hover:bg-[#2d2936]"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={{ left: sidebarCollapsed ? "16px" : "266px" }}
        >
          <PanelLeft size={20} />
        </button>

        {/* Top Bar */}
        <div className="flex justify-end items-center p-4">
          <button className="ml-4 text-gray-400 hover:text-gray-300">
            <Settings size={20} />
          </button>
          <button className="ml-4 text-gray-400 hover:text-gray-300">
            <Sun size={20} />
          </button>
        </div>

        {/* Chat Content */}
        <div ref={chatContainerRef} className="flex-1 overflow-auto px-4 pb-4">
          <AnimatePresence mode="wait">
            {!chatStarted ? (
              <motion.div
                key="welcome"
                className="max-w-3xl mx-auto pt-16 pb-24"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-3xl font-bold text-white text-center mb-8"
                >
                  How can I help you?
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="flex flex-wrap justify-center gap-2 mb-12"
                >
                  <Button
                    variant="outline"
                    className="bg-[#2d2936] hover:bg-[#3a3545] text-gray-200 border-[#3a3545] rounded-full px-4 py-2 h-auto flex items-center gap-2"
                  >
                    <Sparkles size={16} className="text-purple-400" />
                    <span>Create</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-[#2d2936] hover:bg-[#3a3545] text-gray-200 border-[#3a3545] rounded-full px-4 py-2 h-auto flex items-center gap-2"
                  >
                    <FileText size={16} className="text-purple-400" />
                    <span>Docs</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-[#2d2936] hover:bg-[#3a3545] text-gray-200 border-[#3a3545] rounded-full px-4 py-2 h-auto flex items-center gap-2"
                  >
                    <Code size={16} className="text-purple-400" />
                    <span>Test</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-[#2d2936] hover:bg-[#3a3545] text-gray-200 border-[#3a3545] rounded-full px-4 py-2 h-auto flex items-center gap-2"
                  >
                    <BookOpen size={16} className="text-purple-400" />
                    <span>Learn</span>
                  </Button>
                </motion.div>

                <motion.div
                  className="flex flex-col gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {[
                    "How does AI work?",
                    "Are black holes real?",
                    'How many Rs are in the word "strawberry"?',
                    "What is the meaning of life?",
                  ].map((question, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                      className="p-3 bg-[#2d2936] hover:bg-[#3a3545] rounded-md text-gray-300 cursor-pointer transition-colors"
                      onClick={() => {
                        setMessage(question)
                        if (textareaRef.current) {
                          textareaRef.current.style.height = "48px"
                          textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
                        }
                      }}
                    >
                      {question}
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                className="max-w-3xl mx-auto pt-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col gap-6">
                  {messages.map((msg, index) => (
                    <ChatMessage
                      key={index}
                      message={msg.content}
                      role={msg.role}
                      isLast={index === messages.length - 1}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-[#2d2936] bg-[#1a1625]">
          <div className="max-w-3xl mx-auto">
            <div className="relative bg-[#2d2936] rounded-lg border border-[#3a3545]">
              <textarea
                ref={textareaRef}
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-4 py-3 bg-transparent border-none rounded-lg focus:outline-none text-gray-300 resize-none min-h-[48px] overflow-hidden"
                style={{ minHeight: "48px" }}
              />
              <div className="absolute right-2 bottom-2 flex items-center">
                <div
                  ref={modelButtonRef}
                  className="flex items-center mr-2 text-sm text-gray-300 hover:bg-[#3a3545] px-2 py-1 rounded-md cursor-pointer"
                  onClick={() => setIsModelSelectorOpen(!isModelSelectorOpen)}
                >
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                    <span>{selectedModel}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </div>
                <button className="p-1.5 text-gray-300 hover:bg-[#3a3545] rounded-md mr-1">
                  <Search className="h-5 w-5" />
                </button>
                <button
                  className="p-1.5 text-gray-300 hover:bg-[#3a3545] rounded-md mr-1"
                  onClick={() => setShowFileDropArea(true)}
                >
                  <Paperclip className="h-5 w-5" />
                </button>
                <motion.button
                  className={`p-1.5 rounded-md ${
                    message.trim() ? "text-white bg-purple-600 hover:bg-purple-700" : "text-gray-400 bg-[#3a3545]"
                  }`}
                  whileHover={message.trim() ? { scale: 1.05 } : {}}
                  whileTap={message.trim() ? { scale: 0.95 } : {}}
                  disabled={!message.trim()}
                  onClick={handleSendMessage}
                >
                  <Send className="h-5 w-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Model Selector Dropdown */}
        <AnimatePresence>
          {isModelSelectorOpen && (
            <motion.div
              ref={modelSelectorRef}
              className="absolute bottom-16 right-4 md:right-[calc(50%-350px)] w-[400px] max-w-[95vw] bg-[#1e1a29] border border-[#3a3545] rounded-lg shadow-xl z-50 overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <ModelSelector
                onSelect={(model) => {
                  setSelectedModel(model)
                  setIsModelSelectorOpen(false)
                }}
                currentModel={selectedModel}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Centered File Drop Area with Glass Effect */}
        <AnimatePresence>
          {showFileDropArea && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowFileDropArea(false)
              }}
            >
              <motion.div
                className="w-full max-w-md bg-[#1e1a29]/90 backdrop-blur-md rounded-lg shadow-xl border border-[#3a3545] overflow-hidden"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
              >
                <FileDropArea onClose={() => setShowFileDropArea(false)} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
