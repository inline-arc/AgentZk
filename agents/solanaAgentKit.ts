"use client"

import { SolanaAgentKit } from "solana-agent-kit"
import TokenPlugin from "@solana-agent-kit/plugin-token"
import DeFiPlugin from "@solana-agent-kit/plugin-defi"
import { Transaction, VersionedTransaction, SendOptions, PublicKey } from "@solana/web3.js"


export const initSolanaAgent = (phantom: any, publicKey: string | PublicKey) => {
  if (!phantom || !publicKey) throw new Error("Phantom or publicKey missing")

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
      signAndSendTransaction: async <T extends Transaction | VersionedTransaction>(
        tx: T,
        options?: SendOptions
      ): Promise<{ signature: string }> => {
        const signedTx = await phantom.solana.signTransaction(tx)
        const signature = await phantom.solana.sendTransaction(signedTx)
        return { signature }
      },
    },
    process.env.NEXT_PUBLIC_RPC_URL as string,
    {}
  ).use(TokenPlugin)

  return agent
}
