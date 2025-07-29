'use client';

import type { ComponentProps } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type AISuggestionsProps = ComponentProps<'div'>;

export const AISuggestions = ({
  className,
  children,
  ...props
}: AISuggestionsProps) => (
  <div className="w-full" {...props}>
    <div className={cn('flex flex-wrap items-center gap-2 py-2 px-2', className)}>
      {children}
    </div>
  </div>
);

export type AISuggestionProps = ComponentProps<typeof motion.button> & {
  suggestion: string;
  onClick?: (suggestion: string) => void;
};

// Default suggestions that can be used throughout the app
export const DEFAULT_AI_SUGGESTIONS = [
  'Pump Fun stake',
  'Check my SOL balance',
  'Send 0.1 SOL to...',
  'Create a token',
  'What tokens do I own?',
  'Stake SOL to validator',
  'Swap SOL to USDC using JUP',
  'Show me NFT collections',
  'How to create an SPL token?',
];

export const AISuggestion = ({
  suggestion,
  onClick,
  className,
  children,
  ...props
}: AISuggestionProps) => {
  const handleClick = () => {
    onClick?.(suggestion);
  };

  return (
    <motion.button
      className={cn(
        'cursor-pointer rounded-full px-4 py-1 text-xs bg-[#2d2936] text-gray-300 border border-[#3a3545]/50 hover:bg-[#3a3545] transition-colors',
        className
      )}
      onClick={handleClick}
      type="button"
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {children || suggestion}
    </motion.button>
  );
};
