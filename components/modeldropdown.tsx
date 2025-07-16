import { ModelSelector } from "./model-selector"
import { motion } from "framer-motion"
import { Dispatch, SetStateAction } from "react"
import { updateModelProvider } from "@/chat/provider"

interface ModelDropdownProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  selectedModel: string;
  setSelectedModel: Dispatch<SetStateAction<string>>;
  modelSelectorRef: React.RefObject<HTMLDivElement>;
}

export const ModelDropdown = ({ 
  isOpen, 
  setIsOpen, 
  selectedModel, 
  setSelectedModel, 
  modelSelectorRef 
}: ModelDropdownProps) => {
  const handleSelectModel = (model: string) => {
    // Update the selected model
    setSelectedModel(model)
    
    // Close the dropdown
    setIsOpen(false)
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setIsOpen(false)}>
          <div 
            ref={modelSelectorRef}
            className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ModelSelector onSelect={handleSelectModel} currentModel={selectedModel} />
            </motion.div>
          </div>
        </div>
      )}
    </>
  )
}