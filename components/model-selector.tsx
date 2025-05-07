"use client"

import { useState } from "react"
import { Eye, Globe, FileText, Brain, ChevronDown, ChevronUp, SlidersHorizontal, Info } from "lucide-react"
import { motion } from "framer-motion"

type ModelType = {
  name: string
  capabilities: ("vision" | "web" | "document" | "reasoning")[]
  disabled?: boolean
}

const models: ModelType[] = [
  {
    name: "ChatGPT o4-mini",
    capabilities: ["vision", "web", "document"],
  },
  {
    name: "Gemini 2.5 Flash",
    capabilities: ["vision", "web", "document"],
  },
  {
    name: "Gemini 2.5 Flash (Thinking)",
    capabilities: ["vision", "web", "document"],
    disabled: true,
  },
  {
    name: "Reclaimv2 A2A",
    capabilities: ["vision", "web", "document", "reasoning"],
    disabled: true,
  },
  {
    name: "GPT ImageGen",
    capabilities: ["vision"],
    disabled: true,
  },
  {
    name: "GPT-4.1",
    capabilities: ["vision"],
    disabled: true,
  },
  {
    name: "GPT-4.1 Mini",
    capabilities: ["vision"],
    disabled: true,
  },
  {
    name: "GPT-4.1 Nano",
    capabilities: ["vision"],
    disabled: true,
  },
  {
    name: "e3-mini",
    capabilities: ["reasoning"],
    disabled: true,
  },
]

interface ModelSelectorProps {
  onSelect: (model: string) => void
  currentModel: string
}

export function ModelSelector({ onSelect, currentModel }: ModelSelectorProps) {
  const [showAll, setShowAll] = useState(false)

  const displayedModels = showAll ? models : models.slice(0, 5)

  return (
    <div className="flex flex-col w-full glass">
      {/* Pricing Header */}
      <div className="p-4 border-b border-[#3a3567]">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-white font-semibold text-lg">Unlock all models + higher limits</h3>
            <div className="flex items-center mt-1">
              <span className="text-pink-500 text-2xl font-bold">$8</span>
              <span className="text-gray-400 ml-1">/month</span>
            </div>
          </div>
          <motion.button
            className="bg-[#8e24aa] hover:bg-[#9c27b0] text-white px-4 py-2 rounded-md text-sm font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Upgrade now</span>
          </motion.button>
        </div>
      </div>

      {/* Models List */}
      <div className="max-h-[400px] overflow-y-auto py-1">
        {displayedModels.map((model, index) => (
          <motion.div
            key={model.name}
            className={`flex items-center justify-between p-3 hover:bg-[#2d2936] cursor-pointer ${
              model.disabled ? "opacity-50" : ""
            } ${currentModel === model.name ? "bg-[#2d2936]" : ""}`}
            whileHover={{ backgroundColor: model.disabled ? "" : "rgba(45, 41, 54, 0.8)" }}
            onClick={() => !model.disabled && onSelect(model.name)}
          >
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
              <span className={`text-sm ${model.disabled ? "text-gray-500" : "text-gray-300"}`}>{model.name}</span>
              <Info className="h-4 w-4 ml-2 text-gray-500" />
            </div>
            <div className="flex items-center space-x-2">
              {model.capabilities.includes("vision") && (
                <div className="p-1 bg-[#2d2936] rounded-md">
                  <Eye className="h-4 w-4 text-gray-400" />
                </div>
              )}
              {model.capabilities.includes("web") && (
                <div className="p-1 bg-[#2d2936] rounded-md">
                  <Globe className="h-4 w-4 text-gray-400" />
                </div>
              )}
              {model.capabilities.includes("document") && (
                <div className="p-1 bg-[#2d2936] rounded-md">
                  <FileText className="h-4 w-4 text-gray-400" />
                </div>
              )}
              {model.capabilities.includes("reasoning") && (
                <div className="p-1 bg-[#2d2936] rounded-md">
                  <Brain className="h-4 w-4 text-gray-400" />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Show All Toggle */}
      <div
        className="p-3 border-t border-[#3a3545] flex items-center justify-between cursor-pointer hover:bg-[#2d2936]"
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
