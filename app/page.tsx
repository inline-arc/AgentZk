"use client"

import React, { useState, useEffect, useRef, useMemo } from "react"
import { Sun, Settings, PanelLeft } from "lucide-react"
import { PublicKey } from "@solana/web3.js"
import { CoreMessage, generateText } from "ai"
import Image from "next/image"
import { usePhantom } from "@/chat/walletprovider"
import { DotFlow } from "@/components/gsap/dot-flow"
import WalletButton from "@/components/walletbutton"
import Chatbox from "@/components/chatbox"
import Sidebar from "@/components/sidebar"
import { ModelDropdown } from "@/components/modeldropdown"
import ChatInput from "@/components/chatinput"
import ChatContent from "@/components/chatcontent"
import { FileDropArea } from "@/components/file-drop-area"
import SplashScreen from "@/components/SplashScreen"
import { AnimatePresence } from "framer-motion"
import { myProvider } from "@/chat/provider"
import { getSolanaTools } from "@/agents/tools"
import { getSystemPrompt } from "@/agents/contextprompt"
import { Analytics } from "@vercel/analytics/next"

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false)
  const [selectedModel, setSelectedModel] = useState("Google Gemma 3n")
  const [showFileDropArea, setShowFileDropArea] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([])
  const [processingCallback, setProcessingCallback] = useState<(() => Promise<void>) | null>(null)

  const modelSelectorRef = useRef<HTMLDivElement>(null!) // Using non-null assertion to match expected type
  const modelButtonRef = useRef<HTMLDivElement>(null!) // Using non-null assertion to match expected type
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null!)

  const { phantom, connected, publicKey } = usePhantom()

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
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "48px"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [textareaRef.current?.value])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  const solanaTools = useMemo(() => {
    if (phantom && publicKey) {
      try {
        return getSolanaTools(phantom, publicKey)
      } catch (error) {
        console.error("Failed to initialize tools:", error)
        return {}
      }
    }
    return {}
  }, [phantom, publicKey])

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return

    const newUserMessage = { role: "user" as const, content: message }
    const updatedMessages = [...messages, newUserMessage]

    setMessages(updatedMessages)
    setIsLoading(true)

    const processAIResponse = async () => {
      try {
        if (!connected || !publicKey) {
          setMessages([
            ...updatedMessages,
            {
              role: "assistant",
              content: "Please connect your wallet first to interact with the Solana blockchain.",
            },
          ])
          setIsLoading(false)
          return
        }

        if (!solanaTools || Object.keys(solanaTools).length === 0) {
          setMessages([
            ...updatedMessages,
            {
              role: "assistant",
              content: "Solana tools are not properly initialized.",
            },
          ])
          setIsLoading(false)
          return
        }

        const result = await generateText({
          model: myProvider.languageModel("chat-model"),
          tools: solanaTools,
          messages: updatedMessages as CoreMessage[],
          system: getSystemPrompt(publicKey),
          maxSteps: 5,
        })

        let responseContent = result.text?.trim() || ""

        if (!responseContent && result.toolResults?.length) {
          responseContent = result.toolResults
            .map(res => {
              const toolResult = res as { result: unknown };
              return typeof toolResult.result === "string"
                ? toolResult.result
                : JSON.stringify(toolResult.result, null, 2);
            })
            .filter(Boolean)
            .join("\n\n")
        }

        if (!responseContent) {
          responseContent = "No valid response received. Please try again."
        }

        setMessages([...updatedMessages, { role: "assistant", content: responseContent }])
      } catch (err: any) {
        console.error("AI Error:", err)
        setMessages([
          ...updatedMessages,
          {
            role: "assistant",
            content: err.message || "An error occurred while processing your request.",
          },
        ])
      }
      setIsLoading(false)
    }

    setProcessingCallback(() => processAIResponse)
  }

  const handleFileDropAreaClose = () => setShowFileDropArea(false)
  const handleSplashFinish = () => setShowSplash(false)

  if (!mounted) return null

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      </AnimatePresence>
      
      <div className="flex h-screen bg-[#14121a] text-gray-300 overflow-hidden">
        <Sidebar />

        <div className="flex-1 flex flex-col relative">
          {sidebarCollapsed && (
            <button
              className="absolute top-6 left-6 z-50 text-gray-300 bg-[#2d2936] p-2 rounded-md hover:bg-[#3a3545] transition-colors flex items-center gap-2"
              onClick={() => setSidebarCollapsed(false)}
            >
              <Image src="/images/agentzk-logo.png" alt="Logo" width={28} height={28} />
              <PanelLeft size={18} />
            </button>
          )}

          <div className="flex justify-end items-center p-4">
            <button className="ml-4 text-gray-400 hover:text-gray-300">
              <Settings size={20} />
            </button>
            <button className="ml-4 text-gray-400 hover:text-gray-300">
              <Sun size={20} />
            </button>
          </div>

          <ChatContent
            messages={messages}
            isLoading={isLoading}
            chatContainerRef={chatContainerRef}
            publicKey={publicKey}
            processingCallback={processingCallback}
            onSendMessage={handleSendMessage}
          />

          <div className="sticky bottom-0 z-10">
            <ChatInput
              onSend={handleSendMessage}
              isLoading={isLoading}
              selectedModel={selectedModel}
              setIsModelSelectorOpen={setIsModelSelectorOpen}
              isModelSelectorOpen={isModelSelectorOpen}
              setShowFileDropArea={setShowFileDropArea}
              modelButtonRef={modelButtonRef}
            />
          </div>

          <ModelDropdown
            isOpen={isModelSelectorOpen}
            setIsOpen={setIsModelSelectorOpen}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            modelSelectorRef={modelSelectorRef}
          />

          {showFileDropArea && <FileDropArea onClose={handleFileDropAreaClose} />}
          <Analytics />
        </div>
      </div>
    </>
  )
}
