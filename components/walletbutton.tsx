"use client";

import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { usePhantom } from '@/chat/walletprovider';

export default function WalletButton() {
  const { connected, publicKey, connect, disconnect } = usePhantom();
  
  return (
    <>
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
                    {publicKey 
                      ? `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`
                      : ''}
                  </span>
                  <LogOut className="w-4 h-4" />
                </>
              ) : (
              <span className="text-sm">Connect Wallet</span>
            )}
          </motion.button>
    </div>
    </>
  );
}