import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, X, Send, MinusCircle, MessageSquare, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

interface Message {
  _id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export default function ClientChatWidget() {
  const { user, token, isAuthenticated } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Only show for logged-in clients
  if (!isAuthenticated || user?.role === 'admin') return null;

  // Fetch chat history
  useEffect(() => {
    if (!isOpen) return;
    const fetchHistory = async () => {
      try {
        const res = await api.get('/chatbot/history');
        if (res.data?.success) {
          setMessages(res.data.data);
          scrollToBottom();
        }
      } catch (error) {
        console.error('Failed to fetch AI history', error);
      }
    };
    fetchHistory();
  }, [isOpen]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading) return;

    const trimmed = newMessage.trim();
    setNewMessage('');

    // Optimistic update
    const userMsg: Message = {
      _id: `temp-${Date.now()}`,
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, userMsg]);
    scrollToBottom();
    setIsLoading(true);

    try {
      const res = await api.post('/chatbot/query', { message: trimmed });
      const reply: Message = {
        _id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.data.data?.reply || res.data.message || 'Sorry, I could not understand that.',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, reply]);
      scrollToBottom();
    } catch (err: any) {
      console.error('AI Query failed', err);
      const errorMsg: Message = {
        _id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I\'m having trouble. Please try again later!',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      scrollToBottom();
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-blue-600 hover:bg-blue-700 z-50 transition-transform active:scale-95 group overflow-hidden"
      >
        <Bot className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      </Button>
    );
  }

  return (
    <Card className={`fixed bottom-6 right-6 w-96 shadow-2xl z-50 flex flex-col transition-all duration-300 ease-in-out border-slate-200 overflow-hidden rounded-3xl ${isMinimized ? 'h-16' : 'h-[500px]'}`}>
      <CardHeader 
        className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white flex flex-row items-center justify-between space-y-0 cursor-pointer shadow-md" 
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold tracking-tight">WeFixIt AI Assistant</CardTitle>
            <CardDescription className="text-[10px] text-blue-100 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Ask me anything
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 rounded-full" onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}>
            <MinusCircle className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 rounded-full" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      {!isMinimized && (
        <>
          <CardContent className="flex-1 p-0 overflow-hidden bg-slate-50 flex flex-col">
            <ScrollArea className="flex-1 px-4 py-4">
              <div className="space-y-2.5">
                {messages.length === 0 && !isLoading && (
                  <div className="text-center py-10 space-y-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600 shadow-sm">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-800">Hi {user?.firstName}!</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed max-w-[200px] mx-auto">
                      I can help you with repair status, pricing, and general questions.
                    </p>
                  </div>
                )}
                
                {messages.map((msg, idx) => {
                  const isMe = msg.role === 'user';
                  return (
                    <div key={msg._id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-1 duration-200 px-0.5`}>
                      <div
                        className={`max-w-[85%] p-2 px-3.5 rounded-2xl text-[12px] shadow-sm transition-all ${
                          isMe 
                            ? 'bg-blue-600 text-white rounded-tr-none' 
                            : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'
                        }`}
                      >
                        <p className="leading-snug font-medium whitespace-pre-wrap">{msg.content}</p>
                        <p className={`text-[9px] mt-0.5 font-bold opacity-60 text-right ${isMe ? 'text-blue-50' : 'text-slate-400'}`}>
                          {format(new Date(msg.createdAt), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex justify-start animate-in fade-in duration-300">
                    <div className="bg-white border p-3 rounded-2xl rounded-tl-none shadow-sm">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0ms]" />
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]" />
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            <div className="p-4 bg-white border-t border-slate-100">
              <form onSubmit={handleSendMessage} className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 focus-within:border-blue-400 transition-all">
                <Input
                  placeholder="Ask me anything..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e as any);
                    }
                  }}
                  className="flex-1 bg-transparent border-0 focus-visible:ring-0 text-[13px] h-9"
                />
                <Button type="submit" size="icon" className="h-9 w-9 bg-blue-600 hover:bg-blue-700 rounded-xl transition-transform active:scale-95 shadow-md" disabled={!newMessage.trim() || isLoading}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </>
      )}
    </Card>
  );
}
