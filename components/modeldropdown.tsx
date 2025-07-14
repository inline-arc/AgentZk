import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import { ModelSelector } from "./model-selector";
import { RefObject } from "react";

interface ModelDropdownProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  modelSelectorRef: RefObject<HTMLDivElement>;
}

export function ModelDropdown({
  isOpen,
  setIsOpen,
  selectedModel,
  setSelectedModel,
  modelSelectorRef
}: ModelDropdownProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={modelSelectorRef}
          className="absolute bottom-24 right-4 md:right-[calc(50%-350px)] w-[400px] max-w-[95vw] bg-[#1e1a29] border border-[#3a3545] rounded-lg shadow-xl z-50 overflow-hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
        >
          <ModelSelector
            onSelect={(model) => {
              setSelectedModel(model);
              setIsOpen(false);
            }}
            currentModel={selectedModel}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}