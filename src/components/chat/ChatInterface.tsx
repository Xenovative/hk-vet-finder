"use client";

import { useState, useEffect } from "react";
import { MessageSquare, X, Send, User, Bot, Sparkles } from "lucide-react";
import { Vet } from "@/types/vet";
import { VetCard } from "../vet/VetCard";
import { cn } from "@/lib/utils";

import { useTranslation } from "@/lib/i18n";

import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "bot";
  content: string;
  recommendations?: Vet[];
}

interface ChatInterfaceProps {
  petType: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  initialMessage?: string;
}

export function ChatInterface({ petType, isOpen, setIsOpen, initialMessage }: ChatInterfaceProps) {
  const { t, language } = useTranslation();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize chat when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      if (initialMessage) {
        setMessages([{ role: "user", content: initialMessage }]);
        // Automatically trigger AI response for initial message
        handleAutoResponse(initialMessage);
      } else {
        setMessages([
          { 
            role: "bot", 
            content: language === 'en' 
              ? `Hi! I'm your HK Vet Assistant. I see you have a ${petType}. Tell me what kind of vet you're looking for.` 
              : `你好！我是您的香港獸醫助手。看到您有一隻${petType === 'dog' ? '狗狗' : petType === 'cat' ? '貓貓' : '特殊動物'}。請告訴我您正在尋找什麼樣的獸醫。`
          }
        ]);
      }
    }
  }, [isOpen]);

  const handleAutoResponse = async (msg: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: msg,
          petType,
          language
        }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, { 
        role: "bot", 
        content: data.text,
        recommendations: data.recommendations 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: "bot", 
        content: language === 'en' ? "Sorry, I'm having trouble connecting right now." : "抱歉，目前連線出現問題。" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMessage,
          petType,
          language
        }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, { 
        role: "bot", 
        content: data.text,
        recommendations: data.recommendations 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: "bot", 
        content: language === 'en' ? "Sorry, I'm having trouble connecting right now." : "抱歉，目前連線出現問題。" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:bg-blue-700 transition-all hover:scale-110 active:scale-95 group z-50"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {t('ask_ai_finder')}
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-8 right-8 w-[calc(100vw-2rem)] sm:w-96 max-h-[600px] h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-50">
      {/* Header */}
      <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
          <div className="bg-blue-500 p-1.5 rounded-lg">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold">Smart Vet Finder</h3>
            <p className="text-[10px] text-slate-400">
              {process.env.NEXT_PUBLIC_AI_POWERED === 'true' ? 'Powered by Advanced AI' : 'AI-Powered Recommendations'}
            </p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-lg transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((m, i) => (
          <div key={i} className={cn("flex flex-col gap-2", m.role === "user" ? "items-end" : "items-start")}>
            <div className={cn(
              "max-w-[85%] p-3 rounded-2xl text-sm shadow-sm",
              m.role === "user" ? "bg-blue-600 text-white" : "bg-white text-slate-900 border border-slate-200"
            )}>
              <div className="prose prose-sm prose-slate dark:prose-invert max-w-none">
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
            </div>
            {m.recommendations && m.recommendations.length > 0 && (
              <div className="w-full space-y-2 mt-2">
                {m.recommendations.map(vet => (
                  <div key={vet["註 冊 編 號"]} className="scale-95 origin-left">
                    <VetCard vet={vet} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 italic text-xs px-2">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
            {language === 'en' ? 'AI is thinking...' : 'AI 正在思考...'}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="relative">
          <input
            type="text"
            placeholder={language === 'en' ? "Ask anything..." : "請問任何問題..."}
            className="w-full pl-4 pr-12 py-3 bg-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
