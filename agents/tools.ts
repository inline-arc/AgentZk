import { createVercelAITools } from "solana-agent-kit"
import { initSolanaAgent } from "./solanaAgentKit"
import { PublicKey } from "@solana/web3.js"

export const getSolanaTools = (phantom: any, publicKey: string | PublicKey) => {
  const agent = initSolanaAgent(phantom, publicKey)
  return createVercelAITools(agent, agent.actions)
}
