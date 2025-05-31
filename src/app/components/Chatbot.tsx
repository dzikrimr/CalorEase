'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Move,
} from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useChatbot } from '../context/ChatbotContext';

interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  image?: string;
}

interface NutritionInfo {
  calories: number;
  protein: number;
  fat: number;
  carbohydrates: number;
}

export interface Recipe {
  id: string;
  title: string;
  image: string;
  summary: string;
  cookingTime: number;
  servings: number;
  ingredients: Ingredient[];
  instructions: string[];
  categories: string[];
  nutrition: NutritionInfo;
  sourceUrl?: string;
  spoonacularSourceUrl?: string;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatbotProps {
  isOpen: boolean;
  onToggle: () => void;
  hasNotification?: boolean;
}

const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onToggle, hasNotification = false }) => {
  const { recipe } = useChatbot();
  const getInitialMessage = (recipe: Recipe | null) => ({
    id: '1',
    content: recipe
      ? `Halo! Saya AI Assistant Anda. Saya lihat anda sedang membuka resep ${recipe.title}. Tanyakan apa saja tentang resep ini atau lainnya!`
      : 'Halo! Saya AI Assistant Anda. Saat ini anda sedang tidak membuka resep. Tanyakan apa saja atau buka halaman detail resep untuk informasi spesifik yang ingin ditanyakan!',
    sender: 'bot' as const,
    timestamp: new Date(),
  });

  const [messages, setMessages] = useState<Message[]>([getInitialMessage(recipe)]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [quickActionsVisible, setQuickActionsVisible] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 320, height: 500 });
  const [isResizing, setIsResizing] = useState(false);
  const [maxDimensions, setMaxDimensions] = useState({
    width: 600,
    height: 800,
  });
  const defaultDimensions = { width: 320, height: 500 };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatbotRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);

  // Reset dimensions and messages when chatbot is closed
  useEffect(() => {
    if (!isOpen) {
      setDimensions(defaultDimensions);
      setMessages([getInitialMessage(recipe)]);
    }
  }, [isOpen, recipe]);

  // Calculate max dimensions based on viewport
  useEffect(() => {
    const updateMaxDimensions = () => {
      const maxWidth = Math.floor(window.innerWidth * 0.5);
      const maxHeight = Math.floor(window.innerHeight * 0.95);
      setMaxDimensions({ width: maxWidth, height: maxHeight });
    };

    updateMaxDimensions();
    window.addEventListener('resize', updateMaxDimensions);
    return () => window.removeEventListener('resize', updateMaxDimensions);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Update messages when recipe changes, but preserve existing conversation
  useEffect(() => {
    setMessages((prev) => {
      const hasWelcomeMessage = prev.some((msg) => msg.id === '1' && msg.sender === 'bot');
      if (!hasWelcomeMessage) {
        return [getInitialMessage(recipe), ...prev];
      }
      return prev.map((msg) =>
        msg.id === '1' && msg.sender === 'bot' ? getInitialMessage(recipe) : msg
      );
    });
  }, [recipe]);

  // Handle resize functionality
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !chatbotRef.current) return;

      const rect = chatbotRef.current.getBoundingClientRect();
      const newWidth = Math.max(280, rect.right - e.clientX);
      const newHeight = Math.max(300, rect.bottom - e.clientY);

      setDimensions({
        width: Math.min(newWidth, maxDimensions.width),
        height: Math.min(newHeight, maxDimensions.height),
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = 'default';
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'nw-resize';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
    };
  }, [isResizing, maxDimensions]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addMessage = (content: string, sender: 'user' | 'bot') => {
    const newMessage: Message = {
      id: generateId(),
      content,
      sender,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const formatRecipeContext = (recipe: Recipe): string => {
    const ingredients = recipe.ingredients
      .map((ing) => `- ${ing.name}: ${ing.amount} ${ing.unit}`)
      .join('\n');
    const instructions = recipe.instructions
      .map((instr, idx) => `${idx + 1}. ${instr}`)
      .join('\n');
    const nutrition = `Calories: ${recipe.nutrition.calories} kcal, Protein: ${recipe.nutrition.protein}g, Fat: ${recipe.nutrition.fat}g, Carbohydrates: ${recipe.nutrition.carbohydrates}g`;

    return `You are viewing a recipe titled "${recipe.title}". Here are the details:
- Summary: ${recipe.summary.replace(/<[^>]*>?/gm, '')}
- Cooking Time: ${recipe.cookingTime} minutes
- Servings: ${recipe.servings}
- Categories: ${recipe.categories.join(', ')}
- Ingredients:\n${ingredients}
- Instructions:\n${instructions}
- Nutrition: ${nutrition}
Please answer questions related to this recipe or any other topic.`;
  };

  const processAIResponse = (text: string): string => {
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    const lines = text.split('\n');
    const processedLines = lines.map((line) => {
      if (/^\s*\*\s+/.test(line)) {
        return line.replace(/^\s*\*\s+/, '- ');
      }
      return line;
    });
    return processedLines.join('\n');
  };

  const getGeminiResponse = async (userMessage: string): Promise<string> => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Gemini API key is missing. Please set NEXT_PUBLIC_GEMINI_API_KEY in your .env file.');
      setError('Gemini API key is missing or invalid.');
      return 'Maaf, saya tidak dapat merespons karena konfigurasi API tidak lengkap.';
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    try {
      const languageInstruction = 'Make sure the answer language matches the user language.';
      const prompt = recipe
        ? `${languageInstruction}\n\n${formatRecipeContext(recipe)}\n\nUser question: ${userMessage}`
        : `${languageInstruction}\n\nUser question: ${userMessage}`;

      const result = await model.generateContent(prompt);
      let responseText = result.response.text();
      console.log('Gemini API raw response:', responseText);

      responseText = processAIResponse(responseText);
      console.log('Processed response:', responseText);
      return responseText;
    } catch (error: any) {
      console.error('Error fetching Gemini response:', error);
      if (error.message.includes('Quota')) {
        setError('Batas kuota API gratis telah tercapai. Silakan coba lagi nanti.');
        return 'Maaf, batas kuota API gratis telah tercapai. Silakan coba lagi nanti.';
      }
      setError('Gagal mendapatkan respons dari AI. Silakan coba lagi.');
      return 'Maaf, terjadi kesalahan. Silakan coba lagi nanti.';
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    addMessage(inputMessage, 'user');
    const userMsg = inputMessage;
    setInputMessage('');
    setError(null);

    setIsTyping(true);
    try {
      const botResponse = await getGeminiResponse(userMsg);
      addMessage(botResponse, 'bot');
    } catch (err) {
      setError('Gagal mendapatkan respons dari AI. Coba lagi nanti.');
      console.error('Error in handleSendMessage:', err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickMessage = async (message: string) => {
    addMessage(message, 'user');
    setError(null);

    setIsTyping(true);
    try {
      const botResponse = await getGeminiResponse(message);
      addMessage(botResponse, 'bot');
    } catch (err) {
      setError('Gagal mendapatkan respons dari AI. Coba lagi nanti.');
      console.error('Error in handleQuickMessage:', err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const TypingIndicator = () => (
    <div className="flex items-start gap-3 mb-4 animate-fadeIn">
      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-teal-200 to-teal-300 rounded-full flex items-center justify-center text-sm">
        🤖
      </div>
      <div className="bg-gradient-to-r from-teal-50 to-teal-100 rounded-2xl rounded-bl-md px-4 py-3 max-w-[80%]">
        <div className="flex gap-1">
          <div
            className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"
            style={{ animationDelay: '0ms' }}
          ></div>
          <div
            className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"
            style={{ animationDelay: '150ms' }}
          ></div>
          <div
            className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"
            style={{ animationDelay: '300ms' }}
          ></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={onToggle}
          className="relative w-14 h-14 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center group"
        >
          <MessageCircle
            size={24}
            className="group-hover:scale-110 transition-transform"
          />
          {hasNotification && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
          )}
        </button>
      ) : (
        <div
          ref={chatbotRef}
          className="bg-white rounded-2xl shadow-2xl flex flex-col animate-slideInUp border border-teal-100 relative z-50"
          style={{
            width: `${dimensions.width}px`,
            height: `${dimensions.height}px`,
            minWidth: '280px',
            maxWidth: `${maxDimensions.width}px`,
            minHeight: '300px',
            maxHeight: `${maxDimensions.height}px`,
          }}
        >
          <div
            ref={resizeRef}
            onMouseDown={handleResizeStart}
            className="absolute -top-2 -left-2 w-6 h-6 bg-teal-600 hover:bg-teal-700 rounded-full shadow-lg cursor-nw-resize flex items-center justify-center group transition-all duration-200 hover:scale-110 z-10"
            title="Drag to resize"
          >
            <Move
              size={12}
              className="text-white group-hover:scale-110 transition-transform"
            />
          </div>

          <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white p-6 rounded-t-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-10 animate-pulse"></div>
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-200 bg-opacity-30 rounded-full flex items-center justify-center animate-pulse">
                  🤖
                </div>
                <div>
                  <h3 className="font-semibold text-lg">AI Assistant</h3>
                  <div className="flex items-center gap-2 text-sm opacity-90">
                    <div className="w-2 h-2 bg-teal-200 rounded-full animate-pulse"></div>
                    <span>Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onToggle}
                className="text-white hover:bg-teal-200 hover:bg-opacity-20 rounded-full p-2 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white to-teal-50">
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-2xl text-sm text-center">
                {error}
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === 'user' ? 'justify-end items-center' : 'items-start gap-3'
                } animate-fadeIn`}
              >
                {message.sender === 'bot' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-teal-200 to-teal-300 rounded-full flex items-center justify-center text-sm">
                    🤖
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-br-md'
                      : 'bg-gradient-to-r from-teal-50 to-teal-100 text-teal-900 rounded-bl-md'
                  }`}
                >
                  <div dangerouslySetInnerHTML={{ __html: message.content }} />
                </div>
              </div>
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-teal-100 bg-teal-50 bg-opacity-50">
            <div
              className="flex items-center justify-between px-6 py-3 cursor-pointer hover:bg-teal-100 hover:bg-opacity-50 transition-colors"
              onClick={() => setQuickActionsVisible(!quickActionsVisible)}
            >
              <span className="text-sm font-medium text-teal-800">Aksi Cepat</span>
              {quickActionsVisible ? (
                <ChevronUp size={16} className="text-teal-600" />
              ) : (
                <ChevronDown size={16} className="text-teal-600" />
              )}
            </div>
            <div
              className={`px-6 pb-3 transition-all duration-300 overflow-hidden ${
                quickActionsVisible ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handleQuickMessage('Apa saja bahan untuk resep ini?')}
                  className="px-3 py-2 bg-teal-100 hover:bg-gradient-to-r hover:from-teal-200 hover:to-teal-300 text-teal-800 rounded-full text-xs font-medium transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5"
                >
                  🥕 Bahan
                </button>
                <button
                  onClick={() => handleQuickMessage('Berapa kalori resep ini?')}
                  className="px-3 py-2 bg-teal-100 hover:bg-gradient-to-r hover:from-teal-200 hover:to-teal-300 text-teal-800 rounded-full text-xs font-medium transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5"
                >
                  🔥 Kalori
                </button>
                <button
                  onClick={() => handleQuickMessage('Bagaimana langkah-langkah membuat resep ini?')}
                  className="px-3 py-2 bg-teal-100 hover:bg-gradient-to-r hover:from-teal-200 hover:to-teal-300 text-teal-800 rounded-full text-xs font-medium transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5"
                >
                  👨‍🍳 Langkah
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-b-2xl border-t border-teal-100">
            <div className="flex gap-3 items-end bg-teal-50 rounded-full border border-teal-200 focus-within:border-teal-400 focus-within:shadow-lg transition-all duration-200">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ketik pesan Anda..."
                className="flex-1 bg-transparent px-4 py-3 text-sm text-teal-900 placeholder-teal-500 outline-none"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="m-1 w-10 h-10 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 disabled:from-gray-300 disabled:to-gray-400 text-white rounded Ded rounded-full flex items-center justify-center transition-all duration-200 hover:shadow-lg transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideInUp {
          animation: slideInUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Chatbot;