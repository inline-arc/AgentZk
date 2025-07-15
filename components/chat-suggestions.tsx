'use client';

import { AISuggestions, AISuggestion, DEFAULT_AI_SUGGESTIONS } from './ai-suggestions';

interface ChatSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
  customSuggestions?: string[];
  className?: string;
}

export default function ChatSuggestions({
  onSuggestionClick,
  customSuggestions,
  className
}: ChatSuggestionsProps) {
  const suggestions = customSuggestions || DEFAULT_AI_SUGGESTIONS;
  
  return (
    <AISuggestions className={className}>
      {suggestions.map((suggestion) => (
        <AISuggestion
          key={suggestion}
          suggestion={suggestion}
          onClick={onSuggestionClick}
        />
      ))}
    </AISuggestions>
  );
}
