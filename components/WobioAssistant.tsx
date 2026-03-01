import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { generateSupportResponse } from '../services/geminiService';
import { ChatMessage } from '../types';

export const WobioAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Hi! I\'m your WOBIO assistant. How can I help you today?', timestamp: new Date() }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const responseText = await generateSupportResponse(input);
    
    const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText, timestamp: new Date() };
    setMessages(prev => [...prev, aiMsg]);
    setLoading(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-50 bg-wobio-600 text-white p-3 rounded-full shadow-lg shadow-wobio-600/30 dark:shadow-none hover:bg-wobio-700 transition-all"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
      {/* Header */}
      <div className="bg-wobio-600 p-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          <span className="font-semibold">WOBIO Support</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 rounded-full p-1">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 p-4 h-80 overflow-y-auto bg-slate-50 dark:bg-slate-950 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              msg.role === 'user' 
                ? 'bg-wobio-600 text-white rounded-br-none' 
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-bl-none shadow-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-bl-none shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question..." 
          className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-wobio-500 placeholder:text-slate-500"
        />
        <button 
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="bg-wobio-600 text-white p-2 rounded-full hover:bg-wobio-700 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};