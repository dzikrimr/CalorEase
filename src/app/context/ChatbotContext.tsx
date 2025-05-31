'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Recipe } from '../components/Chatbot'; // Import Recipe type

interface ChatbotContextType {
  isOpen: boolean;
  toggleChatbot: () => void;
  setRecipe: (recipe: Recipe | null) => void;
  recipe: Recipe | null;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export const ChatbotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  const toggleChatbot = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <ChatbotContext.Provider value={{ isOpen, toggleChatbot, setRecipe, recipe }}>
      {children}
    </ChatbotContext.Provider>
  );
};

export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
};