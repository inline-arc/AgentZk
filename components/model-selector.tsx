"use client"

import { useState, useEffect } from "react"
import { Eye, Globe, FileText, Brain, ChevronDown, ChevronUp, SlidersHorizontal, Info } from "lucide-react"
import { motion } from "framer-motion"
import { updateModelProvider } from "@/chat/provider"

type ModelType = {
  name: string
  capabilities: ("vision" | "web" | "document" | "reasoning")[]
  modelId: string
  disabled?: boolean
  free?: boolean
}

const models: ModelType[] = [
  {
    name: "Google Gemma 3n",
    capabilities: ["document", "reasoning"],
    modelId: "google/gemma-3n-e2b-it:free",
    free: true
  },
  {
    name: "Mistral 7B Instruct",
    capabilities: ["document"],
    modelId: "mistralai/mistral-7b-instruct:free",
    free: true
  },
  {
    name: "Nous Hermes 2 Yi",
    capabilities: ["document", "reasoning"],
    modelId: "nousresearch/nous-hermes-2-yi-9b:free",
    free: true
  },
  {
    name: "OpenChat 3.5",
    capabilities: ["document", "reasoning"],
    modelId: "openchat/openchat-3.5:free",
    free: true
  },
  {
    name: "Mythomist 7B",
    capabilities: ["document"],
    modelId: "gryphe/mythomist-7b:free",
    free: true
  },
  {
    name: "MBLIP",
    capabilities: ["vision"],
    modelId: "jondurbin/mblip:free",
    free: true
  },
  {
    name: "Llama-3 8B Instruct",
    capabilities: ["document"],
    modelId: "meta-llama/llama-3-8b-instruct:free",
    free: true
  },
  {
    name: "Qwen 1.5 0.5B",
    capabilities: ["document"],
    modelId: "qwen/qwen1.5-0.5b-chat:free",
    free: true
  },
  {
    name: "Gemini 2.5 Flash",
    capabilities: ["document", "reasoning"],
    modelId: "google/gemini-2.5-flash",
    free: false

  },
  {
    name: "OpenAI GPT-4",
    capabilities: ["document", "reasoning"],
    modelId: "openai/gpt-4",
    //disabled: true, // OpenAI models are not available in the dropdown
    free: false
  },
  {
    name: "Meta llama 4",
    capabilities: ["document", "reasoning"],
    modelId: "meta-llama/llama-4-maverick:free",
    free: true
  },
  {
    name: "Moonshotai kimi",
    capabilities: ["vision", "document", "reasoning"],
    modelId: "moonshotai/kimi-vl-a3b-thinking:free",
    free: true
  }
]

interface ModelSelectorProps {
  onSelect: (model: string) => void
  currentModel: string
}

export function ModelSelector({ onSelect, currentModel }: ModelSelectorProps) {
  const [showAll, setShowAll] = useState(false)
  const [showTooltip, setShowTooltip] = useState<number | null>(null)

  const displayedModels = showAll ? models : models.slice(0, 5)

  // Set default model on first render if none is selected or if it's not one of our models
  useEffect(() => {
    // Find Google Gemma 3n model
    const defaultModel = models.find(model => model.name === "Google Gemma 3n") || models[0];
    
    // Check if current model is not in our models list or if it's one of the OpenAI defaults
    const isCurrentModelInList = models.some(model => model.name === currentModel);
    const isOpenAIDefault = currentModel.includes("OpenAI") || currentModel.includes("GPT");
    
    if (!currentModel || !isCurrentModelInList || isOpenAIDefault) {
      console.log("Setting default model to:", defaultModel.name);
      updateModelProvider(defaultModel.name);
      onSelect(defaultModel.name);
    }
  }, []);  // Only run on mount, not on every currentModel change

  // Handle model selection with OpenRouter model updating
  const handleModelSelect = (model: ModelType) => {
    if (model.disabled) return;
    
    // Update the provider with the new model
    updateModelProvider(model.name);
    
    // Call the parent component's onSelect
    onSelect(model.name);
  };

  return (
    <div className="flex flex-col w-full bg-[#1e1a29]/90 backdrop-blur-md rounded-lg border border-[#3a3545]/50 overflow-hidden">

      {/* Pricing Header */}
      <div className="p-4 border-b border-[#3a3545]">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-white font-semibold text-lg">Unlock all models + higher limits</h3>
            <div className="flex items-center mt-1">
              <span className="text-pink-500 text-2xl font-bold">$20</span>
              <span className="text-gray-400 ml-1">/month</span>
            </div>
          </div>
          <motion.button
            className="bg-gradient-to-r from-[#7b5cfa] to-[#9d5cfa] hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm font-medium relative overflow-hidden border border-[#9d5cfa]/50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10">Upgrade now</span>
          </motion.button>
        </div>
      </div>

      {/* Models List */}
      <div className="max-h-[400px] overflow-y-auto py-1">
        {displayedModels.map((model, index) => (
          <motion.div
            key={model.name}
            className={`flex items-center justify-between p-3 hover:bg-[#2d2936]/70 cursor-pointer relative ${
              model.disabled ? "opacity-50" : ""
            } ${currentModel === model.name ? "bg-[#2d2936]/70" : ""}`}
            whileHover={{ backgroundColor: model.disabled ? "" : "rgba(45, 41, 54, 0.7)" }}
            onClick={() => !model.disabled && handleModelSelect(model)}
          >
            <div className="flex items-center">
              <div className={`w-3 h-3 ${model.free ? "bg-purple-500" : "bg-purple-500"} rounded-full mr-2`}></div>
              <span className={`text-sm ${model.disabled ? "text-gray-500" : "text-gray-300"}`}>{model.name}</span>
              
              {/* Free tag */}
              {model.free && (
                <span className="ml-2 px-1.5 py-0.5 text-xs rounded bg-green-900/30 text-green-400 border border-green-800/50">
                  Free
                </span>
              )}
              
              {/* Info icon with tooltip */}
              <div 
                className="relative ml-2"
                onMouseEnter={() => setShowTooltip(index)}
                onMouseLeave={() => setShowTooltip(null)}
              >
                <Info className="h-4 w-4 text-gray-500" />
                {showTooltip === index && model.modelId && (
                  <div className="absolute left-0 top-6 bg-[#2d2936] text-xs p-2 rounded-md border border-[#3a3545] shadow-lg z-10 whitespace-nowrap">
                    <span>OpenRouter model: {model.modelId}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {model.capabilities.includes("vision") && (
                <div className="p-1 bg-[#2d2936] rounded-md border border-[#3a3545]/50">
                  <Eye className="h-4 w-4 text-gray-400" />
                </div>
              )}
              {model.capabilities.includes("web") && (
                <div className="p-1 bg-[#2d2936] rounded-md border border-[#3a3545]/50">
                  <Globe className="h-4 w-4 text-gray-400" />
                </div>
              )}
              {model.capabilities.includes("document") && (
                <div className="p-1 bg-[#2d2936] rounded-md border border-[#3a3545]/50">
                  <FileText className="h-4 w-4 text-gray-400" />
                </div>
              )}
              {model.capabilities.includes("reasoning") && (
                <div className="p-1 bg-[#2d2936] rounded-md border border-[#3a3545]/50">
                  <Brain className="h-4 w-4 text-gray-400" />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Show All Toggle */}
      <div
        className="p-3 border-t border-[#3a3545] flex items-center justify-between cursor-pointer hover:bg-[#2d2936]/70"
        onClick={() => setShowAll(!showAll)}
      >
        <div className="flex items-center text-gray-300 text-sm">
          <span>{showAll ? "Show less" : "Show all"}</span>
          {showAll ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
        </div>
        <SlidersHorizontal className="h-4 w-4 text-gray-400" />
      </div>
    </div>
  )
}