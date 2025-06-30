import { Connection, PublicKey } from "@solana/web3.js";
import { getAccount, getAssociatedTokenAddress, getMint } from "@solana/spl-token";
import { z } from "zod";

export function createBalanceTools(connection: Connection, walletPubkey: PublicKey) {
  console.log("Creating standalone balance tools...");

  // Create balance checking tools that are compatible with Vercel AI Tools
  const getBalanceTool = {
    description: `Check SOL or SPL token balance for your own wallet. 
    
    Usage:
    - Without tokenAddress parameter: Returns SOL balance in SOL units
    - With tokenAddress parameter: Returns SPL token balance in token units
    
    Common token addresses:
    - USDC: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
    - USDT: Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB
    - BONK: DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263
    - RAY: 4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R
    - SRM: SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRv6`,
    parameters: z.object({
      tokenAddress: z.string().optional().describe("Token mint address (omit for SOL balance)")
    }),
    execute: async (params: { tokenAddress?: string }) => {
      try {
        console.log("Getting balance for wallet:", walletPubkey.toBase58());
        
        if (!params.tokenAddress) {
          // Get SOL balance
          const lamports = await connection.getBalance(walletPubkey);
          const solBalance = lamports / 1e9;
          console.log("SOL balance retrieved:", solBalance);
          return `Your SOL balance: ${solBalance.toFixed(4)} SOL\nWallet: ${walletPubkey.toBase58()}`;
        } else {
          // Get SPL token balance
          console.log("Getting token balance for:", params.tokenAddress);
          
          try {
            const mint = new PublicKey(params.tokenAddress);
            const ata = await getAssociatedTokenAddress(mint, walletPubkey);
            
            console.log("Associated token address:", ata.toBase58());
            
            // Get mint info to determine correct decimals
            const mintInfo = await getMint(connection, mint);
            const decimals = mintInfo.decimals;
            
            console.log("Token decimals:", decimals);
            
            const account = await getAccount(connection, ata);
            const balance = Number(account.amount) / Math.pow(10, decimals);
            
            console.log("Token balance retrieved:", balance);
            
            // Get token symbol if it's a known token
            const tokenSymbol = getTokenSymbol(params.tokenAddress);
            const displaySymbol = tokenSymbol ? ` ${tokenSymbol}` : ' tokens';
            
            return `Your token balance: ${balance.toLocaleString()}${displaySymbol}\nToken: ${params.tokenAddress}\nWallet: ${walletPubkey.toBase58()}`;
          } catch (tokenError: any) {
            console.log("Token account error:", tokenError?.message);
            if (tokenError?.message?.includes("could not find account")) {
              const tokenSymbol = getTokenSymbol(params.tokenAddress);
              const displaySymbol = tokenSymbol ? ` ${tokenSymbol}` : ' tokens';
              return `No token account found for this token. Balance: 0${displaySymbol}\nToken: ${params.tokenAddress}\nWallet: ${walletPubkey.toBase58()}`;
            }
            return `Token error: ${tokenError?.message || 'Unknown token error'}`;
          }
        }
      } catch (error: any) {
        console.error("Balance check error:", error);
        return `Error retrieving balance: ${error?.message || 'Unknown error occurred'}`;
      }
    }
  };

  const getBalanceOtherTool = {
    description: `Check SOL or SPL token balance for any other wallet address.
    
    Usage:
    - Without tokenAddress parameter: Returns SOL balance in SOL units
    - With tokenAddress parameter: Returns SPL token balance in token units
    
    Use this to check balances of other wallets, not your own.
    
    Example wallet addresses for testing:
    - Solana Foundation: 3FFaheyqtyAXZSYxDzsr5CVKvJuvZD1WE1VEsBtDbRqB
    - Phantom Treasury: GDEkQF7UMr7RLv1KQKMtm8E2w3iafxJLtyXu3HVQZnME`,
    parameters: z.object({
      walletAddress: z.string().describe("The wallet address to check balance for"),
      tokenAddress: z.string().optional().describe("Token mint address (omit for SOL balance)")
    }),
    execute: async (params: { walletAddress: string; tokenAddress?: string }) => {
      try {
        console.log("Getting balance for other wallet:", params.walletAddress);
        
        // Validate wallet address
        let wallet: PublicKey;
        try {
          wallet = new PublicKey(params.walletAddress);
        } catch (e) {
          return `Invalid wallet address: ${params.walletAddress}`;
        }
        
        if (!params.tokenAddress) {
          // Get SOL balance
          const lamports = await connection.getBalance(wallet);
          const solBalance = lamports / 1e9;
          console.log("Other wallet SOL balance:", solBalance);
          return `Wallet SOL balance: ${solBalance.toFixed(4)} SOL\nWallet: ${params.walletAddress}`;
        } else {
          // Get SPL token balance
          try {
            const mint = new PublicKey(params.tokenAddress);
            const ata = await getAssociatedTokenAddress(mint, wallet);
            
            // Get mint info to determine correct decimals
            const mintInfo = await getMint(connection, mint);
            const decimals = mintInfo.decimals;
            
            const account = await getAccount(connection, ata);
            const balance = Number(account.amount) / Math.pow(10, decimals);
            
            console.log("Other wallet token balance:", balance);
            
            // Get token symbol if it's a known token
            const tokenSymbol = getTokenSymbol(params.tokenAddress);
            const displaySymbol = tokenSymbol ? ` ${tokenSymbol}` : ' tokens';
            
            return `Wallet token balance: ${balance.toLocaleString()}${displaySymbol}\nToken: ${params.tokenAddress}\nWallet: ${params.walletAddress}`;
          } catch (tokenError: any) {
            console.log("Other wallet token error:", tokenError?.message);
            if (tokenError?.message?.includes("could not find account")) {
              const tokenSymbol = getTokenSymbol(params.tokenAddress);
              const displaySymbol = tokenSymbol ? ` ${tokenSymbol}` : ' tokens';
              return `Wallet has no token account - balance is 0${displaySymbol}\nToken: ${params.tokenAddress}\nWallet: ${params.walletAddress}`;
            }
            return `Token error for wallet: ${tokenError?.message || 'Unknown error'}\nWallet: ${params.walletAddress}`;
          }
        }
      } catch (error: any) {
        console.error("Other wallet balance check error:", error);
        return `Error retrieving balance: ${error?.message || 'Unknown error occurred'}`;
      }
    }
  };

  console.log("Balance tools created successfully");
  return {
    get_balance: getBalanceTool,
    get_balance_other: getBalanceOtherTool
  };
}

// Helper function to get token symbols for known tokens
function getTokenSymbol(tokenAddress?: string): string | null {
  if (!tokenAddress) return null;
  
  const tokenMap: { [key: string]: string } = {
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'USDT',
    'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': 'BONK',
    '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R': 'RAY',
    'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRv6': 'SRM',
    'SENDdRQtYMWaQrBroBrJ2Q53fgVuq95CV9UPGEvpCxa': 'SEND'
  };
  
  return tokenMap[tokenAddress] || null;
}

// Simplified registration function that doesn't interfere with createVercelAITools
export function registerBalanceMethods(agent: any, connection: Connection, walletPubkey: PublicKey) {
  console.log("registerBalanceMethods called - adding methods only");
  
  // Only add methods, don't modify actions to avoid createVercelAITools conflicts
  agent.methods = agent.methods || {};
  
  // Add the traditional methods for backward compatibility
  agent.methods.getBalance = async (mint?: PublicKey): Promise<number> => {
    try {
      if (!mint) {
        const lamports = await connection.getBalance(walletPubkey);
        return lamports / 1e9; // Convert to SOL
      } else {
        const ata = await getAssociatedTokenAddress(mint, walletPubkey);
        const account = await getAccount(connection, ata);
        const mintInfo = await getMint(connection, mint);
        return Number(account.amount) / Math.pow(10, mintInfo.decimals);
      }
    } catch (error) {
      console.error("getBalance error:", error);
      return 0;
    }
  };

  agent.methods.getBalanceOther = async (wallet: PublicKey, mint?: PublicKey): Promise<number> => {
    try {
      if (!mint) {
        const lamports = await connection.getBalance(wallet);
        return lamports / 1e9; // Convert to SOL
      } else {
        const ata = await getAssociatedTokenAddress(mint, wallet);
        const account = await getAccount(connection, ata);
        const mintInfo = await getMint(connection, mint);
        return Number(account.amount) / Math.pow(10, mintInfo.decimals);
      }
    } catch (error) {
      console.error("getBalanceOther error:", error);
      return 0;
    }
  };

  console.log("Balance methods registered successfully");
  
  // Return the standalone tools for manual integration
  return createBalanceTools(connection, walletPubkey);
}

// Export individual functions for direct use
export async function checkSolBalance(connection: Connection, wallet: PublicKey): Promise<number> {
  const lamports = await connection.getBalance(wallet);
  return lamports / 1e9;
}

export async function checkTokenBalance(
  connection: Connection, 
  wallet: PublicKey, 
  mint: PublicKey
): Promise<number> {
  try {
    const ata = await getAssociatedTokenAddress(mint, wallet);
    const account = await getAccount(connection, ata);
    const mintInfo = await getMint(connection, mint);
    return Number(account.amount) / Math.pow(10, mintInfo.decimals);
  } catch (error) {
    return 0;
  }
}

// Example usage function for testing
export async function checkBalances(agent: any) {
  // Check own balances using the methods
  const mySolBalance = await agent.methods.getBalance();
  console.log("My SOL balance:", mySolBalance);

  const myUsdcBalance = await agent.methods.getBalance(
    new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")
  );
  console.log("My USDC balance:", myUsdcBalance);

  // Check other wallet's balances
  const otherWallet = new PublicKey("GDEkQF7UMr7RLv1KQKMtm8E2w3iafxJLtyXu3HVQZnME");
  
  const otherSolBalance = await agent.methods.getBalanceOther(otherWallet);
  console.log("Other wallet SOL balance:", otherSolBalance);

  const otherUsdcBalance = await agent.methods.getBalanceOther(
    otherWallet,
    new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")
  );
  console.log("Other wallet USDC balance:", otherUsdcBalance);
}