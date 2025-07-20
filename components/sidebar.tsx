import { motion } from 'framer-motion';
import Image from 'next/image';
import { SidebarProvider, useSidebar } from './sidebarprovider';
import WalletButton from './walletbutton';
import { PanelLeft, Plus, Search } from 'lucide-react';
import { useState } from 'react';


export default function Sidebar() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  return (
    <>
        <div className="flex h-screen bg-[#1a1625]">
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

            <div className="px-4 py-3 text-sm text-purple-300 font-medium">Tasks</div>

            <div className="px-4 py-1">
              <div className="px-3 py-2 hover:bg-[#2d2936] rounded-md text-sm text-gray-300 cursor-pointer truncate">
                LLM for A2A Agents with Cha...
              </div>
            </div>

            <WalletButton/>
          </motion.div>
        </div>
    </>
  );
}