"use client"

import type React from "react"
import { useState, useEffect, useRef, useMemo } from "react"
import {
  Sun,
  Settings,
  PanelLeft,
} from "lucide-react"
import { motion } from "framer-motion"
import { FileDropArea } from "@/components/file-drop-area"
import { myProvider } from "@/chat/provider"
import { createVercelAITools } from "solana-agent-kit"
import { SolanaAgentKit } from "solana-agent-kit"
import TokenPlugin from "@solana-agent-kit/plugin-token"
import Image from "next/image"
import {
  PublicKey,
  SendOptions,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js"
import { CoreMessage, generateText } from "ai"
import { usePhantom } from "@/chat/walletprovider"
import { DotFlow } from "@/components/gsap/dot-flow"
import WalletButton from "@/components/walletbutton"
import Chatbox from "@/components/chatbox"
import Sidebar from "@/components/sidebar"
import { ModelDropdown } from "@/components/modeldropdown"
import ChatInput from "@/components/chatinput"
import ChatContent from "@/components/chatcontent"

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false)
  const [selectedModel, setSelectedModel] = useState("Open AI GPT-4")
  const [showFileDropArea, setShowFileDropArea] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const { phantom, connected, publicKey } = usePhantom()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([])
  const modelSelectorRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>
  const modelButtonRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [processingCallback, setProcessingCallback] = useState<(() => Promise<void>) | null>(null)

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
  }, [textareaRef.current?.value])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  // Solana tools setup
  const solanaTools = useMemo(() => {
    if (phantom && publicKey) {
      try {
        const agent = new SolanaAgentKit(
          {
            publicKey: new PublicKey(publicKey),
            signTransaction: async <T extends Transaction | VersionedTransaction>(
              tx: T
            ): Promise<T> => {
              if (!phantom) throw new Error("Phantom not initialized.")
              return await phantom.solana.signTransaction(tx) as T
            },
            signMessage: async (msg: Uint8Array) => {
              if (!phantom) throw new Error("Phantom not initialized.")
              const signedMessage = await phantom.solana.signMessage(msg)
              return signedMessage.signature
            },
            sendTransaction: async (tx: Transaction | VersionedTransaction) => {
              if (!phantom) throw new Error("Phantom not initialized.")
              return await phantom.solana.sendTransaction(tx)
            },
            signAllTransactions: async <T extends Transaction | VersionedTransaction>(
              txs: T[]
            ): Promise<T[]> => {
              if (!phantom) throw new Error("Phantom not initialized.")
              return await phantom.solana.signAllTransactions(txs) as T[]
            },
            signAndSendTransaction: async <T extends Transaction | VersionedTransaction>(
              tx: T,
              options?: SendOptions
            ): Promise<{ signature: string }> => {
              if (!phantom) throw new Error("Phantom not initialized.")
              const signedTx = await phantom.solana.signTransaction(tx)
              const signature = await phantom.solana.sendTransaction(signedTx)
              return { signature }
            },
          },
          process.env.NEXT_PUBLIC_RPC_URL as string,
          {}
        ).use(TokenPlugin)
        
        return createVercelAITools(agent, agent.actions)
      } catch (error) {
        console.error("Error initializing Solana Agent Kit:", error)
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

    // Create processing function that will be called after loading stages complete
    const processAIResponse = async () => {
      try {
        // Check if wallet is connected for blockchain operations
        if (!connected || !publicKey) {
          setMessages([
            ...updatedMessages,
            {
              role: "assistant",
              content: "Please connect your wallet first to interact with the Solana blockchain. Click the 'Connect Wallet' button in the sidebar to get started.",
            },
          ])
          setIsLoading(false)
          return
        }

        // Ensure we have valid tools
        if (!solanaTools || Object.keys(solanaTools).length === 0) {
          setMessages([
            ...updatedMessages,
            {
              role: "assistant",
              content: "Solana tools are not properly initialized. Please refresh the page and try again.",
            },
          ])
          setIsLoading(false)
          return
        }
        
        const result = await generateText({
          model: myProvider.languageModel("chat-model"),
          tools: solanaTools,
          messages: updatedMessages as CoreMessage[],
          system: `You are a helpful Solana blockchain agent powered by the Solana Agent Kit. You can interact with the Solana blockchain using your available tools.

**Key Capabilities:**
- Check SOL and SPL token balances for any wallet
- Send SOL and SPL tokens 
- Create and manage tokens
- Interact with DeFi protocols
- Execute onchain transactions

**Available Tools:**
${Object.keys(solanaTools).length > 0 ? Object.keys(solanaTools).join(', ') : 'No tools available'}

**Response Guidelines:**
- Always provide a helpful response
- If you can't use tools, explain what you would do
- Be conversational and informative
- If asked about balance, explain the process even if tools aren't working

Your connected wallet: ${typeof publicKey === 'string' ? publicKey : publicKey?.toBase58() || 'Not connected'}`,
          maxSteps: 5,
        })

        // Extract response content with fallbacks
        let responseContent = ""

        // First, try to get the main text response
        if (result.text && result.text.trim()) {
          responseContent = result.text.trim()
        }

        // If no main text, check steps for content
        if (!responseContent && result.steps && result.steps.length > 0) {
          for (const step of result.steps) {
            if (step.text && step.text.trim()) {
              responseContent = step.text.trim()
              break
            }
            
            if (step.toolResults && step.toolResults.length > 0) {
              const toolResults = step.toolResults
                .map((toolResult: any) => {
                  if (toolResult.result) {
                    return typeof toolResult.result === 'string' 
                      ? toolResult.result 
                      : JSON.stringify(toolResult.result, null, 2)
                  }
                  return ""
                })
                .filter(Boolean)
                .join("\n\n")
              
              if (toolResults) {
                responseContent = toolResults
                break
              }
            }
          }
        }

        // If still no content, check direct tool results
        if (!responseContent && result.toolResults && result.toolResults.length > 0) {
          const toolResults = result.toolResults
            .map((toolResult: any) => {
              if (toolResult.result) {
                return typeof toolResult.result === 'string' 
                  ? toolResult.result 
                  : JSON.stringify(toolResult.result, null, 2)
              }
              return ""
            })
            .filter(Boolean)
            .join("\n\n")
          
          if (toolResults) {
            responseContent = toolResults
          }
        }

        // If still no content, fallback message
        if (!responseContent) {
          responseContent = "I received your request but couldn't generate a proper response. Please try again."
        }

        setMessages([
          ...updatedMessages,
          {
            role: "assistant",
            content: responseContent,
          },
        ])
      } catch (error: any) {
        console.error("AI error:", error)
        
        let errorMessage = "I encountered an error while processing your request."
        
        // Handle specific error types
        if (error?.message) {
          if (error.message.includes("500") || error.message.includes("Internal Server Error")) {
            errorMessage = "The AI service is experiencing high load. Please try again in a moment."
          } else if (error.message.includes("Type validation failed")) {
            errorMessage = "The AI service returned an unexpected response format. Please try again."
          } else if (error.message.includes("Invalid JSON")) {
            errorMessage = "The AI service is currently unavailable. Please try again later."
          } else if (error.message.includes("wallet")) {
            errorMessage = "There was an issue with your wallet connection. Please ensure your wallet is connected and try again."
          } else if (error.message.includes("network")) {
            errorMessage = "Network connection issue. Please check your internet connection and try again."
          } else if (error.message.includes("insufficient")) {
            errorMessage = "Insufficient funds for this transaction. Please check your wallet balance."
          }
        }
        
        // Check for provider-specific errors
        if (error?.code === 500 || error?.status === 500) {
          errorMessage = "The AI service is temporarily unavailable (Error 500). Please try again in a few moments."
        } else if (error?.code === 429) {
          errorMessage = "Too many requests. Please wait a moment before trying again."
        } else if (error?.code === 503) {
          errorMessage = "The AI service is temporarily down for maintenance. Please try again later."
        }
        
        setMessages([
          ...updatedMessages,
          {
            role: "assistant",
            content: errorMessage,
          },
        ])
      }

      setIsLoading(false)
    }

    setProcessingCallback(() => processAIResponse)
  }

  // Test function to directly check agent capabilities
  const testAgentDirectly = async () => {
    if (!phantom || !publicKey) {
      console.log("Wallet not connected")
      return
    }

    try {
      const agent = new SolanaAgentKit(
        {
          publicKey: new PublicKey(publicKey),
          signTransaction: async <T extends Transaction | VersionedTransaction>(tx: T): Promise<T> => {
            return await phantom.solana.signTransaction(tx) as T
          },
          signMessage: async (msg: Uint8Array) => {
            const signedMessage = await phantom.solana.signMessage(msg)
            return signedMessage.signature
          },
          sendTransaction: async (tx: Transaction | VersionedTransaction) => {
            return await phantom.solana.sendTransaction(tx)
          },
          signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> => {
            return await phantom.solana.signAllTransactions(txs) as T[]
          },
          signAndSendTransaction: async <T extends Transaction | VersionedTransaction>(tx: T): Promise<{ signature: string }> => {
            const signedTx = await phantom.solana.signTransaction(tx)
            const signature = await phantom.solana.sendTransaction(signedTx)
            return { signature }
          },
        },
        process.env.NEXT_PUBLIC_RPC_URL as string,
        {}
      ).use(TokenPlugin)

      // Try to use the get_token_balance method
      if (agent.methods && agent.methods.get_token_balance) {
        const balances = await agent.methods.get_token_balance(agent)
        console.log("SOL Balance:", balances.sol)
        console.log("Token Balances:", balances.tokens)
      } else if (agent.methods && agent.methods.getBalance) {
        const solBalance = await agent.methods.getBalance()
        console.log("SOL Balance via getBalance:", solBalance)
      }
    } catch (error) {
      console.error("Error testing agent directly:", error)
    }
  }

  if (!mounted) return null

  // Update the handleFileDropAreaClose function to properly close the file drop area
  const handleFileDropAreaClose = () => {
    setShowFileDropArea(false)
  }

  return (
    <div className="flex h-screen bg-[#14121a] text-gray-300 overflow-hidden">
      <Sidebar/>
        {/* Main Content */}
        <div className="flex-1 flex flex-col relative">
          {/* Sidebar Toggle Button - Fixed position when sidebar is collapsed */}
          {sidebarCollapsed && (
            <button
              className="absolute top-6 left-6 z-50 text-gray-300 bg-[#2d2936] p-2 rounded-md hover:bg-[#3a3545] transition-colors flex items-center gap-2"
              onClick={() => setSidebarCollapsed(false)}
            >
              <Image src="/images/agentzk-logo.png" alt="Agentzk Logo" width={28} height={28} className="object-contain" />
              <PanelLeft size={18} />
            </button>
          )}

          {/* Top Bar */}
          <div className="flex justify-end items-center p-4">
            {/* Add test button */}
            {connected && (
              <button 
                className="mr-4 text-gray-400 hover:text-gray-300 px-3 py-1 rounded border border-gray-600 text-sm"
                onClick={testAgentDirectly}
              >
                Test Agent
              </button>
            )}
            <button className="ml-4 text-gray-400 hover:text-gray-300">
              <Settings size={20} />
            </button>
            <button className="ml-4 text-gray-400 hover:text-gray-300">
              <Sun size={20} />
            </button>
          </div>

        {/* Chat Content */}
        <ChatContent 
          messages={messages}
          isLoading={isLoading}
          chatContainerRef={chatContainerRef}
          publicKey={publicKey}
          processingCallback={processingCallback}
        />

        {/* Sticky Input Section */}
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

        {/* Model Selector Dropdown */}
        <ModelDropdown 
          isOpen={isModelSelectorOpen}
          setIsOpen={setIsModelSelectorOpen}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          modelSelectorRef={modelSelectorRef}
        />

        {/* File Drop Area */}
        {showFileDropArea && (
          <FileDropArea onClose={handleFileDropAreaClose} />
        )}
        
      </div>
    </div>
  )
}