"use client"
// app/providers.tsx

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletProvider, ConnectionProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
//import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { useMemo } from 'react';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createPhantom } from "@phantom/browser-sdk";
import { createSolanaPlugin } from "@phantom/browser-sdk/solana";
import { PublicKey } from "@solana/web3.js";

// Import the wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface PhantomContextType {
  phantom: any;
  connected: boolean;
  publicKey: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const PhantomContext = createContext<PhantomContextType>({
  phantom: null,
  connected: false,
  publicKey: null,
  connect: async () => {},
  disconnect: async () => {},
});

export function PhantomProvider({ children }: { children: ReactNode }) {
  const [phantom, setPhantom] = useState<any>(null);
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);

  useEffect(() => {
    const initPhantom = async () => {
      try {
        const phantomInstance = createPhantom({
          chainPlugins: [createSolanaPlugin()],
        });
        setPhantom(phantomInstance);

        // Check if already connected
        try {
          const account = await phantomInstance.solana.getAccount();
          if (account) {
            setPublicKey(account);
            setConnected(true);
          }
        } catch (error) {
          console.error("Error checking connection:", error);
        }
      } catch (error) {
        console.error("Error initializing Phantom:", error);
      }
    };

    initPhantom();
  }, []);

  const connect = async () => {
    if (!phantom) return;
    try {
      const connectResult = await phantom.solana.connect();
      if (connectResult) {
        setPublicKey(connectResult);
        setConnected(true);
      }
    } catch (error) {
      console.error("Error connecting to Phantom:", error);
      throw error;
    }
  };

  const disconnect = async () => {
    if (!phantom) return;
    try {
      await phantom.solana.disconnect();
      setPublicKey(null);
      setConnected(false);
    } catch (error) {
      console.error("Error disconnecting from Phantom:", error);
      throw error;
    }
  };

  return (
    <PhantomContext.Provider value={{ phantom, connected, publicKey, connect, disconnect }}>
      {children}
    </PhantomContext.Provider>
  );
}

export const usePhantom = () => {
  const context = useContext(PhantomContext);
  if (context === undefined) {
    throw new Error('usePhantom must be used within a PhantomProvider');
  }
  return context;
};

export function Providers({ children }: { children: React.ReactNode }) {
  // Set up network and endpoint
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => 
    process.env.NEXT_PUBLIC_RPC_URL || clusterApiUrl(network), 
    [network]
  );
  
  // Set up wallets
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
  ], []);
  
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}