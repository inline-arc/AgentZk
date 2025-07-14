"use client";

import type React from "react";

import { motion } from "framer-motion";
import { useState } from "react";
import { Upload, X } from "lucide-react";

interface FileDropAreaProps {
  onClose: () => void;
}

export function FileDropArea({ onClose }: FileDropAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-[#1e1a29] w-full max-w-xl rounded-lg p-6 shadow-2xl"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-200">Upload Files</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging ? "border-purple-500 bg-purple-500/10" : "border-gray-600"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-10 w-10 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-300 mb-2">Drag files here or click to upload</p>
          <p className="text-gray-500 text-sm mb-4">
            Supported files: PDF, TXT, CSV, JSON, JPG, PNG
          </p>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            multiple
            onChange={handleFileSelect}
          />
          <label
            htmlFor="file-upload"
            className="inline-block bg-[#2d2936] hover:bg-[#3a3545] text-gray-300 px-4 py-2 rounded-md cursor-pointer transition-colors"
          >
            Select Files
          </label>
        </div>

        {files.length > 0 && (
          <div className="mt-4">
            <h4 className="text-gray-300 mb-2">Selected Files ({files.length})</h4>
            <div className="max-h-40 overflow-y-auto">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-[#2d2936] p-2 rounded mb-2"
                >
                  <div className="text-gray-300 text-sm truncate flex-1">
                    {file.name}
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-gray-400 hover:text-gray-200 ml-2"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end mt-4 gap-2">
          <button
            onClick={onClose}
            className="bg-[#2d2936] hover:bg-[#3a3545] text-gray-300 px-4 py-2 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-md transition-colors ${
              files.length > 0
                ? "bg-purple-600 hover:bg-purple-700 text-white"
                : "bg-[#3a3545] text-gray-400 cursor-not-allowed"
            }`}
            disabled={files.length === 0}
          >
            Upload
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
