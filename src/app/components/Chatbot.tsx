"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Send, ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface ChatbotProps {
  isOpen: boolean;
  onToggle: () => void;
  hasNotification?: boolean;
}

const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onToggle, hasNotification = false }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Halo! Saya AI Assistant Anda. Ada yang bisa saya bantu hari ini?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [quickActionsVisible, setQuickActionsVisible] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Gemini API key is missing. Please set NEXT_PUBLIC_GEMINI_API_KEY in your .env file.");
  }
  const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
  const model = genAI ? genAI.getGenerativeModel({ model: "gemini-1.5-flash" }) : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addMessage = (content: string, sender: "user" | "bot") => {
    const newMessage: Message = {
      id: generateId(),
      content,
      sender,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const getGeminiResponse = async (userMessage: string): Promise<string> => {
    if (!genAI || !model) {
      setError("Gemini API key is missing or invalid.");
      return "Maaf, saya tidak dapat merespons karena konfigurasi API tidak lengkap.";
    }

    try {
      const result = await model.generateContent(userMessage);
      const responseText = result.response.text();
      console.log("Gemini API response:", responseText);
      return responseText;
    } catch (error: any) {
      console.error("Error fetching Gemini response:", error);
      if (error.message.includes("Quota")) {
        setError("Batas kuota API gratis telah tercapai. Silakan coba lagi nanti.");
        return "Maaf, batas kuota API gratis telah tercapai. Silakan coba lagi nanti.";
      }
      setError("Gagal mendapatkan respons dari AI. Silakan coba lagi.");
      return "Maaf, terjadi kesalahan. Silakan coba lagi nanti.";
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    addMessage(inputMessage, "user");
    const userMsg = inputMessage;
    setInputMessage("");
    setError(null);

    setIsTyping(true);
    const botResponse = await getGeminiResponse(userMsg);
    setIsTyping(false);
    addMessage(botResponse, "bot");
  };

  const handleQuickMessage = async (message: string) => {
    addMessage(message, "user");
    setError(null);

    setIsTyping(true);
    const botResponse = await getGeminiResponse(message);
    setIsTyping(false);
    addMessage(botResponse, "bot");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const TypingIndicator = () => (
    <div className="flex items-start gap-3 mb-4 animate-fadeIn">
      <div className="bg-gradient-to-r from-teal-50 to-teal-100 rounded-2xl rounded-bl-md px-4 py-3 max-w-xs">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={onToggle}
          className="relative w-14 h-14 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center group"
        >
          <MessageCircle size={24} className="group-hover:scale-110 transition-transform" />
          {hasNotification && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-red-500 to-red-400 text-white rounded-full flex items-center justify-center text-xs font-bold animate-bounce">
              3
            </div>
          )}
        </button>
      )}

      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-80 h-[500px] flex flex-col animate-slideInUp border border-teal-100">
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
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
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
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} animate-fadeIn`} // Adjusted alignment
              >
                <div
                  className={`max-w-xs px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                    message.sender === "user"
                      ? "bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-br-md"
                      : "bg-gradient-to-r from-teal-50 to-teal-100 text-teal-900 rounded-bl-md"
                  }`}
                >
                  {message.content}
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
                quickActionsVisible ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handleQuickMessage("Bantuan")}
                  className="px-3 py-2 bg-teal-100 hover:bg-gradient-to-r hover:from-teal-200 hover:to-teal-300 text-teal-800 rounded-full text-xs font-medium transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5"
                >
                  💡 Bantuan
                </button>
                <button
                  onClick={() => handleQuickMessage("Info Produk")}
                  className="px-3 py-2 bg-teal-100 hover:bg-gradient-to-r hover:from-teal-200 hover:to-teal-300 text-teal-800 rounded-full text-xs font-medium transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5"
                >
                  📦 Produk
                </button>
                <button
                  onClick={() => handleQuickMessage("Kontak")}
                  className="px-3 py-2 bg-teal-100 hover:bg-gradient-to-r hover:from-teal-200 hover:to-teal-300 text-teal-800 rounded-full text-xs font-medium transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5"
                >
                  📞 Kontak
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
                className="m-1 w-10 h-10 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:shadow-lg transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;