"use client"

import type React from "react"

import { useState, useEffect, useRef, useMemo } from "react"
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
  CheckCircle,
  TicketX,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { FileDropArea } from "@/components/file-drop-area"
import { ModelSelector } from "@/components/model-selector"
import bs58 from "bs58"
import { myProvider } from "@/chat/provider"
import { createVercelAITools } from "solana-agent-kit";
import { SolanaAgentKit } from "solana-agent-kit";
import TokenPlugin from "@solana-agent-kit/plugin-token";
import Image from "next/image"
import {
  Connection,
  PublicKey,
  sendAndConfirmRawTransaction,
  SendOptions,
  Transaction,
  TransactionSignature,
  VersionedTransaction,
} from "@solana/web3.js";
import { Base58EncodedBytes } from "@solana/kit"
import { CoreMessage, generateText } from "ai"
import { usePhantom } from "@/chat/walletprovider"

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false)
  const [selectedModel, setSelectedModel] = useState("Gemini 2.5 Flash")
  const [showFileDropArea, setShowFileDropArea] = useState(false)
  //msg 
  // Using input state instead of message state
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  //phantom 
  const { phantom, connected, publicKey, connect, disconnect } = usePhantom();
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
  }, [input])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  //solan signup setup
  const solanaTools = useMemo(() => {
    if (phantom && publicKey) {
      const agent = new SolanaAgentKit(
        {
          publicKey: new PublicKey(publicKey),
          signTransaction: async <T extends Transaction | VersionedTransaction>(
            tx: T
          ): Promise<T> => {
            console.log("sign transaction");
            if (!phantom) throw new Error("Phantom not initialized.");

            const signedTransaction = await phantom.solana.signTransaction(
              tx
            );
            return signedTransaction as T;
          },
          signMessage: async (msg:any) => {
            console.log("sign message");
            if (!phantom) throw new Error("Phantom not initialized.");

            const signedMessage = await phantom.solana.signMessage(
              msg
            );

            return signedMessage.signature;
          },
          sendTransaction: async (tx) => {
            console.log("send transaction");
            if (!phantom) throw new Error("Phantom not initialized.");
            const transactionHash = await phantom.solana.sendTransaction(tx);
            return transactionHash;

          },
          signAllTransactions: async <
            T extends Transaction | VersionedTransaction,
          >(
            txs: T[]
          ): Promise<T[]> => {
            console.log("sign all transaction");
            if (!phantom) throw new Error("Phantom not initialized.");

            const signedTransaction = await phantom.solana.signAllTransactions(
              txs
            );
            return signedTransaction as T[];
          },
          signAndSendTransaction: async <
            T extends Transaction | VersionedTransaction,
          >(
            tx: T,
            options?: SendOptions
          ): Promise<{ signature: string }> => {
            console.log("sign and send transaction");
            if (!phantom) throw new Error("Phantom not initialized.");
            const signedTx = await phantom.solana.signTransaction(tx);
            const signature = await phantom.solana.sendTransaction(signedTx);
            return { signature };
          },
        },
        process.env.NEXT_PUBLIC_RPC_URL as string,
        {}
      ).use(TokenPlugin)
      // .use(DefiPlugin)

      const tools = createVercelAITools(agent, agent.actions);
      return tools;
    }
  }, [phantom, publicKey]);

 
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: CoreMessage = { role: "user", content: input };
    const newUserMessage = { role: "user" as const, content: input };
    const updatedMessages = [...messages, newUserMessage];

    setMessages(updatedMessages);
    setInput("");

    try {
      const result = await generateText({
        model: myProvider.languageModel("chat-model"),
        messages: updatedMessages,
        system:
          `You are a helpful agent that can interact onchain using the Solana Agent Kit. You are
        empowered to interact onchain using your tools. If you need funds you can request it from the user and provide your wallet details. If there is a 5XX
        (internal) HTTP error code, ask the user to try again later. If someone asks you to do something you
        can't do with your currently available tools, you must say so, and encourage them to implement it
        themselves using the Solana Agent Kit, recommend they go to https://www.solanaagentkit.xyz for more information. Be
        concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested.
        
        Mint address for $SEND is SENDdRQtYMWaQrBroBrJ2Q53fgVuq95CV9UPGEvpCxa`,
        maxSteps: 5,
        tools: solanaTools,
      });

      console.log(result);

      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: result.text || "Sorry, I didn't quite get that.",
        },
      ]);
    } catch (error) {
      console.error("AI error:", error);
      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: "Oops! Something went wrong. lol",
        },
      ]);
    }

    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
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
          <div className="flex items-center">
            <Image src="/images/agentzk-logo.png" alt="" width={40} height={40} className="mr-3 object-contain" />
            <div className="text-purple-300 font-semibold text-lg">Agentzk</div>
          </div>
          <button
            className="ml-4 text-gray-300 bg-transparent p-1 rounded-md hover:bg-[#2d2936] transition-colors"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <PanelLeft size={18} />
          </button>
        </div>

        <div className="px-4 py-2">
          <motion.button
            className="w-full relative group overflow-hidden bg-gradient-to-r from-[#7b5cfa] to-[#9d5cfa] text-white py-3 font-medium flex items-center justify-center rounded-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            <div className="flex items-center">
              <Plus size={18} className="mr-2" />
              <span>New Chat</span>
            </div>
            <div className="absolute -inset-[1px] rounded-lg blur-md -z-10 bg-gradient-to-r from-[#7b5cfa] to-[#9d5cfa] opacity-70"></div>
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

        {/* Update the sidebar wallet section */}
        <div className="mt-auto p-4 flex items-center justify-between text-gray-300 border-t border-[#1a1625]">
          <motion.button
            className="w-full bg-[#2d2936] hover:bg-[#3a3545] text-white rounded-md py-2 font-medium flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={connected ? disconnect : connect}
          >
            {connected ? (
                <>
                  <span className="text-sm">
                    {typeof publicKey === 'string' 
                      ? `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`
                      : publicKey?.toBase58().slice(0, 4) + '...' + publicKey?.toBase58().slice(-4)}
                  </span>
                  <LogOut className="w-4 h-4" />
                </>
              ) : (
              <span className="text-sm">Connect Wallet</span>
            )}
          </motion.button>
        </div>
      </motion.div>

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
          <button className="ml-4 text-gray-400 hover:text-gray-300">
            <Settings size={20} />
          </button>
          <button className="ml-4 text-gray-400 hover:text-gray-300">
            <Sun size={20} />
          </button>
        </div>

        {/* Chat Content */}
        <div ref={chatContainerRef} className="w-full max-w-4xl flex flex-col h-[calc(100vh-24px)] mt-12 mx-auto px-4">
          <div className="flex-1 flex flex-col overflow-hidden rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
              {messages.length === 0 ? (
                <div className="flex flex-col items-start justify-start h-full px-4 pt-24">
                  <h1 className="text-4xl font-medium bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Welcome, {typeof publicKey === 'string' 
                      ? `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`
                      : publicKey ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}` : 'Guest'}
                  </h1>
                  <p className="text-lg mt-3 bg-gradient-to-r from-gray-300 to-gray-400 bg-clip-text text-transparent">
                    how can I help you?
                  </p>
                </div>
              ) : (
                messages.map((m, i) => (
                  <ChatMessage
                    key={i}
                    message={m.content}
                    role={m.role}
                    isLast={i === messages.length - 1}
                  />
                ))
              )}
            </div>
          </div>

          {/* Rest of your input section */}
          {/* Message Input */}
          <div className="p-4 border-t border-[#1a1625] bg-[#1a1625]">
            <div className="max-w-2xl mx-auto">
              <div className="relative bg-[#2d2936] rounded-lg border border-[#3a3545]">
                <textarea
                  ref={textareaRef}
                  placeholder="Ask anything"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    (e.preventDefault(), handleSend())
                  }
                  className="w-full px-4 py-3 bg-transparent border-none rounded-lg focus:outline-none text-gray-300 resize-none min-h-[48px] overflow-hidden"
                  style={{ minHeight: "48px" }}
                />
                <div className="flex items-center gap-1 px-2 py-1 border-t border-[#3a3545]">
                  <button className="p-1.5 text-gray-300 hover:bg-[#3a3545] rounded-full border border-[#3a3545]/50">
                    <Plus className="h-5 w-5" />
                  </button>
                  <button className="p-1.5 text-gray-300 hover:bg-[#3a3545] rounded-full border border-[#3a3545]/50 flex items-center gap-1">
                    <Search className="h-5 w-5" />
                    <span className="text-sm">Search</span>
                  </button>
                  <button className="p-1.5 text-gray-300 hover:bg-[#3a3545] rounded-full border border-[#3a3545]/50 flex items-center gap-1">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm">Verify</span>
                  </button>
                  <div className="ml-auto flex items-center">
                    <div
                      ref={modelButtonRef}
                      className="flex items-center mr-2 text-sm text-gray-300 hover:bg-[#3a3545] px-2 py-1 rounded-md cursor-pointer border border-[#3a3545]/50"
                      onClick={() => setIsModelSelectorOpen(!isModelSelectorOpen)}
                    >
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                        <span>{selectedModel}</span>
                      </div>
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </div>
                    <button
                      className="p-1.5 text-gray-300 hover:bg-[#3a3545] rounded-md mr-1 border border-[#3a3545]/50"
                      onClick={() => setShowFileDropArea(true)}
                    >
                      <Paperclip className="h-5 w-5" />
                    </button>
                    <motion.button
                      className={`p-1.5 rounded-md border ${
                        input.trim()
                          ? "text-white bg-purple-600 hover:bg-purple-700 border-purple-700"
                          : "text-gray-400 bg-[#3a3545] border-[#3a3545]/50"
                      }`}
                      whileHover={input.trim() ? { scale: 1.05 } : {}}
                      whileTap={input.trim() ? { scale: 0.95 } : {}}
                      disabled={!input.trim()}
                      onClick={handleSend}
                    >
                      <Send className="h-5 w-5" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Model Selector Dropdown */}
          <AnimatePresence>
            {isModelSelectorOpen && (
              <motion.div
                ref={modelSelectorRef}
                className="absolute bottom-24 right-4 md:right-[calc(50%-350px)] w-[400px] max-w-[95vw] bg-[#1e1a29] border border-[#3a3545] rounded-lg shadow-xl z-50 overflow-hidden"
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

          {/* File Drop Area */}
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
    </div>
  )
}

// Chat Message Component with glass effect and no robot SVG
function ChatMessage({ message, role, isLast }: { message: string; role: "user" | "assistant"; isLast: boolean }) {
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
          <p className="text-gray-200 whitespace-pre-wrap">{message}</p>
        )}
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