import {
    customProvider,
    extractReasoningMiddleware,
    wrapLanguageModel,
} from "ai";
import { createOpenAI } from "@ai-sdk/openai";


const openai = createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
});

// Define model mappings for OpenRouter
const modelMappings: Record<string, string> = {
  "Google Gemma 3n": "google/gemma-3n-e2b-it:free",
  "Mistral 7B Instruct": "mistralai/mistral-7b-instruct:free",
  "Nous Hermes 2 Yi": "nousresearch/nous-hermes-2-yi-9b:free",
  "OpenChat 3.5": "openchat/openchat-3.5:free",
  "Mythomist 7B": "mistralai/mistral-7b-instruct:free",
  "MBLIP": "jondurbin/mblip:free",
  "Llama-3 8B Instruct": "meta-llama/llama-3-8b-instruct:free",
  "Phi-3 Mini": "microsoft/phi-3-mini-4k-instruct:free",
  "Qwen 1.5 0.5B": "qwen/qwen1.5-0.5b-chat:free",
  "Gemini 2.5 Flash": "google/gemini-2.5-flash",
  "OpenAI GPT-4": "openai/gpt-4",
  "Meta llama 4": "meta-llama/llama-4-maverick:free",
  "Moonshotai kimi": "moonshotai/kimi-k2:free",
  "Qwen3 4B": "qwen/qwen3-4b:free",
  "Deepseek v3 0324": "deepseek/deepseek-chat-v3-0324:free",

  // // Default model if none of the above match
  // "default": "mistralai/mistral-7b-instruct:free"
};
let currentModelName = "Mistral 7B Instruct";

const getModelId = (modelName: string): string => {
  return modelMappings[modelName] || modelMappings.default;
};

export let myProvider = customProvider({
  languageModels: {
    "chat-model": openai(getModelId(currentModelName)),
    "chat-model-reasoning": wrapLanguageModel({
      model: openai("openchat/openchat-3.5"),
      middleware: extractReasoningMiddleware({ tagName: "think" }),
    }),
    "title-model": openai("gryphe/mythomist-7b:free"),
    "artifact-model": openai("meta-llama/llama-3-70b-instruct"),
  },
});

// Function to update the provider with a new model
export const updateModelProvider = (modelName: string) => {
  currentModelName = modelName;
  
  // Create a new provider with the updated model
  myProvider = customProvider({
    languageModels: {
      "chat-model": openai(getModelId(modelName)),
      "chat-model-reasoning": wrapLanguageModel({
        model: openai("openchat/openchat-3.5"),
        middleware: extractReasoningMiddleware({ tagName: "think" }),
      }),
      "title-model": openai("gryphe/mythomist-7b:free"),
      "artifact-model": openai("meta-llama/llama-3-70b-instruct"),
    },
  });
  
  console.log(`Model switched to: ${modelName} (using ${getModelId(modelName)})`);
  return myProvider;
};