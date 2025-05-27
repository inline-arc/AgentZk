import { SolanaAgentKit, createVercelAITools, KeypairWallet } from "solana-agent-kit";
import TokenPlugin from "@solana-agent-kit/plugin-token";
import NFTPlugin from "@solana-agent-kit/plugin-nft";
import DefiPlugin from "@solana-agent-kit/plugin-defi";
import MiscPlugin from "@solana-agent-kit/plugin-misc";
import BlinksPlugin from "@solana-agent-kit/plugin-blinks";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { config } from "dotenv";
config(); 

// Load environment variables from .env file
// Ensure you have a .env file with OPENAI_API_KEY and other necessary variables
// Example .env file content:
// OPENAI_API_KEY=your_openai_api_key 

const keyPair = Keypair.fromSecretKey(bs58.decode("YOUR_SECRET_KEY"));
const wallet = new KeypairWallet(keyPair, "YOUR_RPC_URL");
  

const agent = new SolanaAgentKit(
  wallet,
  "",
   {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
   }
) 
  .use(TokenPlugin)
  .use(DefiPlugin)
  .use(NFTPlugin)
  .use(MiscPlugin)
  .use(BlinksPlugin);

const tools = createVercelAITools(agent, agent.actions);