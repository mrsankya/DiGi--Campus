import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, User as UserIcon, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export const DiGiBotModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: '👋 Hey there! I am DiGi Bot, your AI Campus Assistant. Ask me about upcoming events, hackathons, RSVPs, or how to generate certificates!',
      timestamp: new Date()
    }
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const response = await api.askDiGiBot(query);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: response.answer || 'Sorry, I couldn\'t process that question right now.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: '⚠️ Unable to connect to DiGi AI Bot service. Please check your backend connection.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button Shifted Up Above Mobile Bottom Navigation Bar */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Ask DiGi AI Bot"
        className={`fixed bottom-24 sm:bottom-6 right-4 sm:right-6 z-40 p-3.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group cursor-pointer ${
          isOpen ? 'hidden' : 'flex'
        }`}
      >
        <div className="relative flex items-center justify-center">
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 fill-amber-300 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white animate-ping" />
        </div>
        <span className="text-xs font-black pr-1 hidden sm:inline">Ask DiGi Bot</span>
      </button>

      {/* Responsive AI Chat Drawer Modal */}
      {isOpen && (
        <div className="fixed inset-x-3 bottom-20 top-20 sm:top-auto sm:bottom-6 sm:right-6 sm:inset-x-auto z-50 w-auto sm:w-[400px] h-auto sm:h-[530px] bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-fade-in transition-colors">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-black text-sm leading-tight flex items-center gap-1.5 font-heading">
                  DiGi Bot <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                </h3>
                <p className="text-[10px] text-blue-100 font-medium">Campus AI Assistant • Online 24/7</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close AI Chat"
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages List */}
          <div className="p-4 overflow-y-auto flex-1 space-y-3 bg-slate-50/70 dark:bg-slate-900/80">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 text-xs ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] p-3 rounded-2xl ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none shadow-sm font-semibold'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none shadow-xs whitespace-pre-line leading-relaxed font-medium'
                  }`}
                >
                  {m.text}
                </div>

                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 text-xs items-center text-slate-500 dark:text-slate-400">
                <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-none shadow-xs flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600 dark:text-blue-400" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">DiGi Bot is thinking...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompt Presets */}
          <div className="p-2 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-1.5 overflow-x-auto">
            <button
              onClick={() => handleSendMessage('Upcoming AI & Tech Events')}
              className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-600 hover:text-white text-[11px] font-bold shrink-0 transition-colors cursor-pointer"
            >
              🚀 Tech Events
            </button>
            <button
              onClick={() => handleSendMessage('How to get my certificate')}
              className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-600 hover:text-white text-[11px] font-bold shrink-0 transition-colors cursor-pointer"
            >
              📜 Certificates
            </button>
            <button
              onClick={() => handleSendMessage('Campus Venues & Auditoriums')}
              className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-600 hover:text-white text-[11px] font-bold shrink-0 transition-colors cursor-pointer"
            >
              📍 Venues
            </button>
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask DiGi Bot about campus events..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white placeholder-slate-400"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 transition-all shadow-md cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
