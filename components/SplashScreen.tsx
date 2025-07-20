import React, { useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    // Automatically hide splash screen after 10 seconds
    const timer = setTimeout(() => {
      onFinish();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated dark overlay that fades away to reveal content */}
      <motion.div 
        className="absolute inset-0 bg-black"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 1 }}
        className="flex flex-col items-center relative z-10"
      >
        <motion.div 
          className="flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 1.2 }}
        >
          <Image
            src="/images/agentzk-logo.png"
            alt="AgentZk Logo"
            width={100}
            height={100}
            className="mb-6"
          />
          
          <div className="ml-4">
            <Image 
              src="/images/agent-zk-text.png" 
              alt="AgentZk"
              sizes='full-width'
              width={250}
              height={40}
              className="mb-6"
            />
          </div>
        </motion.div>
        
        {/* <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 2, duration: 1.5 }}
          style={{ transformOrigin: "left" }}
        >
          <div className="w-48 h-2 bg-gray-700 overflow-hidden">
            <motion.div
              className="h-full bg-purple-500"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 4, ease: "easeInOut", delay: 2.5 }}
            />
          </div>
        </motion.div> */}
      </motion.div>
    </motion.div>
  );
};

// Add this to your splash screen component file
// This helps ensure images are available immediately
export function preloadSplashImages() {
  const imageLoader = new Image();
  imageLoader.src = '/images/agentzk-logo.png';
  
  const textLoader = new Image();
  textLoader.src = '/images/agent-zk-text.png';
}

export default SplashScreen;
