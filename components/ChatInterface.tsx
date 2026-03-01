import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Phone, User, AlertCircle, Video } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'ME' | 'THEM' | 'SYSTEM';
  timestamp: Date;
}

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  peerName: string;
  peerImage?: string | null;
  currentUserRole: 'RIDER' | 'DRIVER';
  isChatActive: boolean; // Controls if input is enabled (Trip Not Started)
  onVoiceCall?: () => void;
  onVideoCall?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  isOpen,
  onClose,
  peerName,
  peerImage,
  currentUserRole,
  isChatActive,
  onVoiceCall,
  onVideoCall
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize Chat Session
  useEffect(() => {
    if (isOpen) {
      // Mock initial history or system message
      setMessages([
        {
          id: 'sys-1',
          text: `Driver has accepted your request. Chat is active.`,
          sender: 'SYSTEM',
          timestamp: new Date()
        },
        {
          id: 'sys-2',
          text: 'For your safety, chat will be disabled once the trip begins.',
          sender: 'SYSTEM',
          timestamp: new Date()
        }
      ]);
    }
  }, [isOpen]);

  // Monitor Activity Status for System Alerts
  useEffect(() => {
    if (!isChatActive && isOpen) {
        setMessages(prev => [
            ...prev,
            {
                id: `sys-${Date.now()}`,
                text: 'Trip has started. Chat is now closed. Please speak with your driver directly.',
                sender: 'SYSTEM',
                timestamp: new Date()
            }
        ]);
    }
  }, [isChatActive, isOpen]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim() || !isChatActive) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'ME',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    // Simulate Reply
    setTimeout(() => {
        if (!isChatActive) return;
        setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            text: currentUserRole === 'RIDER' ? "I'm on my way!" : "I'll be there in 2 mins.",
            sender: 'THEM',
            timestamp: new Date()
        }]);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-slate-50 dark:bg-slate-950 flex flex-col animate-in slide-in-from-right duration-300">
      
      {/* A. Header Section (V3 Cube Style - Blue) */}
      <div className="bg-wobio-600 px-4 py-4 flex items-center shadow-md z-10 text-white">
        <button onClick={onClose} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <div className="flex-1 ml-2 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border border-white/30">
                {peerImage ? (
                    <img src={peerImage} alt={peerName} className="w-full h-full object-cover" />
                ) : (
                    <User className="w-6 h-6 text-white" />
                )}
            </div>
            <div>
                <h2 className="font-bold text-lg leading-none">{peerName}</h2>
                <span className="text-xs text-wobio-100 font-medium">
                    {isChatActive ? 'Active Now' : 'Chat Closed'}
                </span>
            </div>
        </div>

        <div className="flex gap-2">
            {isChatActive && onVideoCall && (
                <button onClick={onVideoCall} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                    <Video className="w-5 h-5" />
                </button>
            )}
            {isChatActive && onVoiceCall && (
                <button onClick={onVoiceCall} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                    <Phone className="w-5 h-5" />
                </button>
            )}
        </div>
      </div>

      {/* B. Message Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#e5ddd5] dark:bg-slate-900" ref={scrollRef}>
        {messages.map((msg) => {
            if (msg.sender === 'SYSTEM') {
                return (
                    <div key={msg.id} className="flex justify-center my-4">
                        <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs px-3 py-1.5 rounded-lg shadow-sm font-medium flex items-center gap-1.5 max-w-[80%] text-center">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            {msg.text}
                        </div>
                    </div>
                );
            }

            const isMe = msg.sender === 'ME';
            return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-4 py-2.5 rounded-xl shadow-sm relative text-sm leading-relaxed ${
                        isMe 
                        ? 'bg-wobio-500 text-white rounded-tr-none' 
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-tl-none'
                    }`}>
                        {msg.text}
                        <div className={`text-[10px] mt-1 text-right opacity-70 ${isMe ? 'text-wobio-100' : 'text-slate-400'}`}>
                            {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                    </div>
                </div>
            );
        })}
      </div>

      {/* C. Input Area */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-safe">
        {isChatActive ? (
            <div className="flex items-center gap-2">
                <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-full px-5 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-wobio-500 focus:outline-none"
                    autoFocus
                />
                <button 
                    onClick={handleSend}
                    disabled={!inputText.trim()}
                    className="w-12 h-12 bg-wobio-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-wobio-700 disabled:opacity-50 disabled:shadow-none transition-all"
                >
                    <Send className="w-5 h-5 ml-0.5" />
                </button>
            </div>
        ) : (
            <div className="text-center p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 text-sm font-medium">
                Chat is disabled because the trip has started.
            </div>
        )}
      </div>
    </div>
  );
};