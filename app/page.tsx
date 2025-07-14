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
import { DotFlow } from "@/components/gsap/dot-flow"
import WalletButton from "@/components/walletbutton"
import Chatbox from "@/components/chatbox"
import { ChatMessage } from "@/components/chat-message"
import Sidebar from "@/components/sidebar"
import { ModelDropdown } from "@/components/modeldropdown"
import ChatInput from "@/components/chatinput"
//import { createBalanceTools, registerBalanceMethods } from "@/agents/getBalance"
//import { anthropic } from "@ai-sdk/anthropic"


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
  const modelSelectorRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>
  const modelButtonRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [processingCallback, setProcessingCallback] = useState<(() => Promise<void>) | null>(null);

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
      try {
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
            signMessage: async (msg: Uint8Array) => {
              console.log("sign message");
              if (!phantom) throw new Error("Phantom not initialized.");

              const signedMessage = await phantom.solana.signMessage(
                msg
              );

              return signedMessage.signature;
            },
            sendTransaction: async (tx: Transaction | VersionedTransaction) => {
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
        ).use(TokenPlugin);
        
        console.log("Agent created, available actions:", Object.keys(agent.actions || {}));
        console.log("Agent methods:", Object.keys(agent.methods || {}));
        
        const tools = createVercelAITools(agent, agent.actions);
        console.log("Tools created successfully:", Object.keys(tools));
        console.log("Tools structure:", tools);
        return tools;
      } catch (error) {
        console.error("Error initializing Solana Agent Kit:", error);
        return {};
      }
    }
    return {};
  }, [phantom, publicKey]);

 
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: CoreMessage = { role: "user", content: input };
    const newUserMessage = { role: "user" as const, content: input };
    const updatedMessages = [...messages, newUserMessage];

    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

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
          ]);
          setIsLoading(false);
          return;
        }

        // Ensure we have valid tools
        if (!solanaTools || Object.keys(solanaTools).length === 0) {
          setMessages([
            ...updatedMessages,
            {
              role: "assistant",
              content: "Solana tools are not properly initialized. Please refresh the page and try again.",
            },
          ]);
          setIsLoading(false);
          return;
        }

        console.log("Calling AI with tools:", Object.keys(solanaTools));
        console.log("User input:", input);
        
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
        });

        console.log("AI Response - Full result:", result);
        console.log("AI Response - Text:", result.text);
        console.log("AI Response - Steps:", result.steps);
        console.log("AI Response - Tool calls:", result.toolCalls);
        console.log("AI Response - Tool results:", result.toolResults);

        // Improved content extraction with fallbacks
        let responseContent = "";

        // First, try to get the main text response
        if (result.text && result.text.trim()) {
          responseContent = result.text.trim();
        }

        // If no main text, check steps for content
        if (!responseContent && result.steps && result.steps.length > 0) {
          for (const step of result.steps) {
            if (step.text && step.text.trim()) {
              responseContent = step.text.trim();
              break;
            }
            
            if (step.toolResults && step.toolResults.length > 0) {
              const toolResults = step.toolResults
                .map((toolResult: any) => {
                  if (toolResult.result) {
                    return typeof toolResult.result === 'string' 
                      ? toolResult.result 
                      : JSON.stringify(toolResult.result, null, 2);
                  }
                  return "";
                })
                .filter(Boolean)
                .join("\n\n");
              
              if (toolResults) {
                responseContent = toolResults;
                break;
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
                  : JSON.stringify(toolResult.result, null, 2);
              }
              return "";
            })
            .filter(Boolean)
            .join("\n\n");
          
          if (toolResults) {
            responseContent = toolResults;
          }
        }

        // If still no content, fallback message
        if (!responseContent) {
          responseContent = "I received your request but couldn't generate a proper response. Please try again.";
        }


        console.log("Final response content:", responseContent);

        setMessages([
          ...updatedMessages,
          {
            role: "assistant",
            content: responseContent,
          },
        ]);
      } catch (error: any) {
        console.error("AI error:", error);
        
        let errorMessage = "I encountered an error while processing your request.";
        
        // Handle specific error types
        if (error?.message) {
          if (error.message.includes("500") || error.message.includes("Internal Server Error")) {
            errorMessage = "The AI service is experiencing high load. Please try again in a moment.";
          } else if (error.message.includes("Type validation failed")) {
            errorMessage = "The AI service returned an unexpected response format. Please try again.";
          } else if (error.message.includes("Invalid JSON")) {
            errorMessage = "The AI service is currently unavailable. Please try again later.";
          } else if (error.message.includes("wallet")) {
            errorMessage = "There was an issue with your wallet connection. Please ensure your wallet is connected and try again.";
          } else if (error.message.includes("network")) {
            errorMessage = "Network connection issue. Please check your internet connection and try again.";
          } else if (error.message.includes("insufficient")) {
            errorMessage = "Insufficient funds for this transaction. Please check your wallet balance.";
          }
        }
        
        // Check for provider-specific errors
        if (error?.code === 500 || error?.status === 500) {
          errorMessage = "The AI service is temporarily unavailable (Error 500). Please try again in a few moments.";
        } else if (error?.code === 429) {
          errorMessage = "Too many requests. Please wait a moment before trying again.";
        } else if (error?.code === 503) {
          errorMessage = "The AI service is temporarily down for maintenance. Please try again later.";
        }
        
        setMessages([
          ...updatedMessages,
          {
            role: "assistant",
            content: errorMessage,
          },
        ]);
      }

      setIsLoading(false);
    };

    setProcessingCallback(() => processAIResponse);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Test function to directly check agent capabilities
  const testAgentDirectly = async () => {
    if (!phantom || !publicKey) {
      console.log("Wallet not connected");
      return;
    }

    try {
      console.log("Creating agent for direct testing...");
      const agent = new SolanaAgentKit(
        {
          publicKey: new PublicKey(publicKey),
          signTransaction: async <T extends Transaction | VersionedTransaction>(tx: T): Promise<T> => {
            const signedTransaction = await phantom.solana.signTransaction(tx);
            return signedTransaction as T;
          },
          signMessage: async (msg: Uint8Array) => {
            const signedMessage = await phantom.solana.signMessage(msg);
            return signedMessage.signature;
          },
          sendTransaction: async (tx: Transaction | VersionedTransaction) => {
            return await phantom.solana.sendTransaction(tx);
          },
          signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> => {
            return await phantom.solana.signAllTransactions(txs) as T[];
          },
          signAndSendTransaction: async <T extends Transaction | VersionedTransaction>(tx: T): Promise<{ signature: string }> => {
            const signedTx = await phantom.solana.signTransaction(tx);
            const signature = await phantom.solana.sendTransaction(signedTx);
            return { signature };
          },
        },
        process.env.NEXT_PUBLIC_RPC_URL as string,
        {}
      ).use(TokenPlugin);

      console.log("Direct agent created successfully");
      console.log("Agent methods available:", Object.keys(agent.methods || {}));
      console.log("Agent actions available:", Object.keys(agent.actions || {}));

      // Try to use the get_token_balance method
      if (agent.methods && agent.methods.get_token_balance) {
        console.log("Found get_token_balance method, calling it...");
        const balances = await agent.methods.get_token_balance(agent);
        console.log("SOL Balance:", balances.sol);
        console.log("Token Balances:", balances.tokens);
      } else {
        console.log("get_token_balance method not found");
        console.log("Available methods:", Object.keys(agent.methods || {}));
      }

      // Also try other potential balance methods
      if (agent.methods && agent.methods.getBalance) {
        console.log("Found getBalance method, calling it...");
        const solBalance = await agent.methods.getBalance();
        console.log("SOL Balance via getBalance:", solBalance);
      }

    } catch (error) {
      console.error("Error testing agent directly:", error);
    }
  };

if (!mounted) return null

  // Update the handleFileDropAreaClose function to properly close the file drop area
  const handleFileDropAreaClose = () => {
    setShowFileDropArea(false);
  };

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
                <>
                  {messages.map((m, i) => (
                    <ChatMessage
                      key={i}
                      message={m.content}
                      role={m.role}
                      isLast={i === messages.length - 1}
                    />
                  ))}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex justify-start"
                    >
                      <DotFlow 
                        isPlaying={true} 
                        className="ml-11" 
                        onComplete={() => {
                          if (processingCallback) {
                            processingCallback();
                            setProcessingCallback(null);
                          }
                        }}
                      />
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Message Input */}
          <ChatInput 
            onSend={async (message) => {
              // Set the input and call handleSend
              setInput(message);
              await handleSend();
            }} 
            isLoading={isLoading} 
            selectedModel={selectedModel} 
            setIsModelSelectorOpen={setIsModelSelectorOpen} 
            isModelSelectorOpen={isModelSelectorOpen} 
            setShowFileDropArea={setShowFileDropArea} 
            modelButtonRef={modelButtonRef}
          />

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
    </div>
  )
}

// Chat Message Component with glass effect and markdown support
<Chatbox message={""} role={"user"} isLast={false}/>