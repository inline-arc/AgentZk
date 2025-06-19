"use client"

import { Search, ArrowUp, Paperclip, ChevronDown } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export function ChatUI() {
  const [message, setMessage] = useState("")

  return (
    <>
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-3xl mx-auto">{/* Empty chat state - no messages yet */}</div>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-[#2a2235]">
        <div className="max-w-3xl mx-auto">
          <div className="relative bg-[#2a2235] rounded-lg border border-[#3a3245]">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="w-full px-4 py-3 bg-transparent border-none rounded-lg focus:outline-none text-gray-300"
            />
            <div className="absolute right-2 bottom-2 flex items-center">
              <div className="flex items-center mr-2 text-sm text-purple-300">
                <span>Gemini 2.5 Flash</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </div>
              <button className="p-1 text-purple-300 bg-transparent rounded-md hover:bg-[#3a3245]">
                <Search className="h-5 w-5" />
              </button>
              <button className="p-1 text-purple-300 bg-transparent rounded-md hover:bg-[#3a3245]">
                <Paperclip className="h-5 w-5" />
              </button>
              <button
                className={`p-1 rounded-md ${message.trim() ? "text-white bg-purple-500 hover:bg-purple-600" : "text-white bg-purple-400/30"}`}
                disabled={!message.trim()}
              >
                <ArrowUp className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="text-center text-xs text-gray-500 mt-4">
            Make sure you agree to our{" "}
            <Link href="#" className="text-purple-400 hover:underline">
              Terms
            </Link>{" "}
            and our{" "}
            <Link href="#" className="text-purple-400 hover:underline">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
