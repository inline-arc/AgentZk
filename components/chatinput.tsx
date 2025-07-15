import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Send, Plus, Search, Paperclip, CheckCircle, ChevronDown, ArrowUp, Globe } from 'lucide-react';
import { AISuggestions, AISuggestion } from './ai-suggestions';

interface ChatInputProps {
  onSend: (message: string) => Promise<void>;
  isLoading: boolean;
  selectedModel: string;
  setIsModelSelectorOpen: (isOpen: boolean) => void;
  isModelSelectorOpen: boolean;
  setShowFileDropArea: (show: boolean) => void;
  modelButtonRef: React.RefObject<HTMLDivElement>;
}

export default function ChatInput({
  onSend,
  isLoading,
  selectedModel,
  setIsModelSelectorOpen,
  isModelSelectorOpen,
  setShowFileDropArea,
  modelButtonRef
}: ChatInputProps) {
  // Add the necessary state variables
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Add a state to track if user has typed anything
  const [hasTyped, setHasTyped] = useState(false);
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "48px";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  // Add the necessary handler functions
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    try {
      // Pass the message to the parent component and clear the input
      await onSend(input);
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Limited set of suggestions
  const suggestions = [
    "What's my SOL balance?",
    "Send 0.1 SOL",
    "Show tokens Balance",
    "Top Up the Chat"
  ];

  // Modify the input change handler to track if user has typed
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (!hasTyped && e.target.value.trim()) {
      setHasTyped(true);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setHasTyped(true); // Mark as typed when a suggestion is clicked
    // Focus the textarea
    textareaRef.current?.focus();
  };

  return (
    <>
      <div className="p-2 bg-[#14121a] rounded-b-2xl">
        <div className="max-w-3xl mx-auto">
          {/* Only show suggestions when input is empty */}
          {!hasTyped && (
            <div className="mb-3">
              <AISuggestions>
                {suggestions.map((suggestion) => (
                  <AISuggestion 
                    key={suggestion} 
                    suggestion={suggestion} 
                    onClick={() => handleSuggestionClick(suggestion)}
                  />
                ))}
              </AISuggestions>
            </div>
          )}
          
          <div className="relative bg-[#2d2936] rounded-lg">
            <textarea
              ref={textareaRef}
              placeholder="Ask anything"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-transparent border-none rounded-lg focus:outline-none text-gray-300 resize-none min-h-[48px] overflow-hidden disabled:opacity-50"
              style={{ minHeight: "48px" }}
            />
            <div className="flex items-center gap-1 px-2 py-1 border-t border-[#3a3545]">
              <button className="p-1.5 text-gray-300 hover:bg-[#3a3545] rounded-full border border-[#3a3545]/50">
                <Plus className="h-5 w-5" />
              </button>
              <button className="p-1.5 text-gray-300 hover:bg-[#3a3545] rounded-full border border-[#3a3545]/50 flex items-center gap-1">
                <Globe className="h-5 w-5" />
                <span className="text-sm">Search</span>
              </button>
              {/* <button className="p-1.5 text-gray-300 hover:bg-[#3a3545] rounded-full border border-[#3a3545]/50 flex items-center gap-1">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm">Verify</span>
              </button> */}
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
                    input.trim() && !isLoading
                      ? "text-white bg-purple-600 hover:bg-purple-700 border-purple-700"
                      : "text-gray-400 bg-[#3a3545] border-[#3a3545]/50"
                  }`}
                  whileHover={input.trim() && !isLoading ? { scale: 1.05 } : {}}
                  whileTap={input.trim() && !isLoading ? { scale: 0.95 } : {}}
                  disabled={!input.trim() || isLoading}
                  onClick={handleSend}
                >
                  <ArrowUp className="h-5 w-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}