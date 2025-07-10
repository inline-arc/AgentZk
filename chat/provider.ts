import {
    customProvider,
    extractReasoningMiddleware,
    wrapLanguageModel,
} from "ai";
import { createOpenAI } from "@ai-sdk/openai";
//import { getBalanceTool, swapTokensTool } from '../agents/solanaAgentKit';

const openai = createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
});

export const myProvider = customProvider({
  languageModels: {
    "chat-model": openai("nousresearch/nous-capybara-7b"),
    "chat-model-reasoning": wrapLanguageModel({
      model: openai("openchat/openchat-3.5"),
      middleware: extractReasoningMiddleware({ tagName: "think" }),
    }),
    "title-model": openai("gryphe/mythomist-7b:free"),
    "artifact-model": openai("meta-llama/llama-3-70b-instruct"),
  },
});