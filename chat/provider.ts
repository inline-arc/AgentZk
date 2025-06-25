import {
    customProvider,
    extractReasoningMiddleware,
    wrapLanguageModel,
} from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import OpenAI from "openai";

const openai = createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    //apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
});
//console.log("OPENAI API KEY:", process.env.NEXT_PUBLIC_OPENAI_API_KEY);

export const myProvider = customProvider({
  languageModels: {
    "chat-model": openai("mistralai/mistral-small-3.2-24b-instruct:free"), // OpenRouter ID
    "chat-model-reasoning": wrapLanguageModel({
      model: openai("openchat/openchat-3.5"),
      middleware: extractReasoningMiddleware({ tagName: "think" }),
    }),
    "title-model": openai("gryphe/mythomist-7b:free"),
    "artifact-model": openai("meta-llama/llama-3-70b-instruct"),
  },
});