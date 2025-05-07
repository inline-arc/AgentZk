"use client"

import type React from "react"

import { useState, useRef } from "react"
import { X, Upload, FileText } from "lucide-react"
import { motion } from "framer-motion"

interface FileDropAreaProps {
  onClose: () => void
}

export function FileDropArea({ onClose }: FileDropAreaProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files)
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  return (
    <div className="p-4 glass">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-medium">Upload files</h3>
        <motion.button
          onClick={onClose}
          className="text-gray-400 hover:text-white p-1 rounded-full"
          whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }}
          whileTap={{ scale: 0.9 }}
        >
          <X size={20} />
        </motion.button>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          isDragging ? "border-purple-500 bg-[#2d2936]/50" : "border-[#3a3545]"
        } transition-colors duration-200`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2, ease: "easeInOut" }}
        >
          <Upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
        </motion.div>
        <p className="text-gray-300 mb-1">Drag and drop files here, or click to select files</p>
        <p className="text-gray-500 text-sm">Supports images, documents, and more</p>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-white font-medium mb-2">Selected files</h4>
          {files.map((file, index) => (
            <motion.div
              key={index}
              className="flex items-center justify-between bg-[#2d2936]/80 backdrop-blur-sm p-2 rounded-md"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-[#3a3545] rounded-md flex items-center justify-center mr-3">
                  <FileText className="h-4 w-4 text-gray-300" />
                </div>
                <div className="truncate">
                  <p className="text-gray-300 text-sm truncate">{file.name}</p>
                  <p className="text-gray-500 text-xs">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <motion.button
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile(index)
                }}
                className="text-gray-400 hover:text-white p-1 rounded-full"
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={16} />
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
