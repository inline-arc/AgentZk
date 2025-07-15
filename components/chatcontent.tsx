import React from "react";
import { motion } from "framer-motion";
import { ChatMessage } from "@/components/chat-message";
import { DotFlow } from "@/components/gsap/dot-flow";

interface ChatContentProps {
  messages: { role: "user" | "assistant"; content: string }[];
  isLoading: boolean;
  chatContainerRef: React.RefObject<HTMLDivElement>;
  publicKey: any;
  processingCallback: (() => Promise<void>) | null;
}

export default function ChatContent({
  messages,
  isLoading,
  chatContainerRef,
  publicKey,
  processingCallback
}: ChatContentProps) {
  return (
    <div className="w-full max-w-5xl flex flex-col h-[calc(100vh-8rem)] mx-auto px-4 relative">
      <div className="flex-1 flex flex-col overflow-hidden rounded-t-2xl p-6 backdrop-blur-sm">
        <div 
          ref={chatContainerRef} 
          className="flex-1 overflow-y-auto scrollbar-hide px-2 py-4 space-y-6"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-start justify-start h-full px-20 pt-24">
              <h1 className="text-4xl mr-10 font-medium bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
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
                      }
                    }}
                  />
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}