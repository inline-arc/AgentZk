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
    <div className={cn('flex flex-wrap items-center gap-2 py-2 px-1', className)}>
      {children}
    </div>
  </div>
);

export type AISuggestionProps = ComponentProps<typeof motion.button> & {
  suggestion: string;
  onClick?: (suggestion: string) => void;
};

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
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {children || suggestion}
    </motion.button>
  );
};
