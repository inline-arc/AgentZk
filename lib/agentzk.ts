import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { validateEnvironment } from "@/lib/utils";
import { SolanaAgentKit } from "solana-agent-kit";
import { createVercelAITools } from "solana-agent-kit";
import { ChatDeepSeek } from "@langchain/deepseek";
import { createLangchainTools } from "solana-agent-kit";
import { KeypairWallet } from "solana-agent-kit";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";


export async function initializeAgent(Modename:string) {
    //default agent
    const llm = Modename?.includes("OpenAI") || Modename?.includes("OpenAI-4o") 
    ? new ChatOpenAI({ //else this that 
        modelName: "gpt-4o",
        temperature: 0.1,
        apiKey: process.env.OPENAI_API_KEY!, //not null
    })
    : Modename?.includes("Anthropic")
    ? new ChatAnthropic({   
        modelName: "claude-2",
        temperature: 0.1,
    })
    : Modename?.includes("DeepSeek")
    ? new ChatDeepSeek({    
        modelName: "deepseek-chat-2",
        temperature: 0.1,
    })
    : undefined; // something thing need to left undefined

    //fun callback 
    validateEnvironment(); 

    //Keypait wallet 
    const keypair = Keypair.fromSecretKey(bs58.decode(process.env.SOLANA_PRIVATE_KEY!)); //oky enyrpt layer nice
    const wallet = new KeypairWallet(keypair, process.env.RPC_URL!); //wallet for solana agent
    // activate the agent solkit
    const solanaAgent = new SolanaAgentKit(wallet, process.env.RPC_URL!, {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
  })

  //context window hardpart 
  const tools =  createLangchainTools(solanaAgent, solanaAgent.actions) //new slop 
  const memory = new MemorySaver(); //memory gland
  const config = { configurable: { thread_id: "1"}} //one instance of agent

  if (!llm) {
    throw new Error("Select the model?");
  }

  const agentzk = createReactAgent({
    llm,
    tools,
    checkpointSaver: memory, //small convo context de 
    messageModifier:  
        `You are a helpful agent that can interact onchain using the Solana Agent Kit. You are
        empowered to interact onchain using your tools. If you ever need funds, you can request them from the
        faucet. If not, you can provide your wallet details and request funds from the user. If there is a 5XX
        (internal) HTTP error code, ask the user to try again later. If someone asks you to do something you
        can't do with your currently available tools, you must say so, and encourage them to implement it
        themselves using the Solana Agent Kit, recommend they go to https://www.solanaagentkit.xyz for more information. Be
        concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested.`,
    });

    return {agentzk, config };
}

