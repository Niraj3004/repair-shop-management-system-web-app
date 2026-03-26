import React, { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, User, Zap, Sparkles, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

interface Message {
  _id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

const SUGGESTED_QUERIES = [
  'How do I track my repair?',
  'What are the repair statuses?',
  'How long does a screen repair take?',
  'How do I pay an invoice?',
];

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch history on mount
  useEffect(() => {
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
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const trimmed = text.trim();
    setInput('');

    // Optimistic user message
    const userMsg: Message = {
      _id: `temp-${Date.now()}`,
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
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
    } catch (err: any) {
      const errorMsg: Message = {
        _id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: err.response?.data?.message || 'Sorry, I\'m having trouble connecting to my brain. Please try again later!',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 px-4 h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2 text-slate-900">
            <div className="p-1.5 bg-blue-600 rounded-lg shadow-md shadow-blue-200">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            AI Assistant
          </h2>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-slate-200 shadow-xl bg-white rounded-2xl">
        <CardHeader className="p-3 px-6 border-b bg-white flex flex-row items-center justify-between sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm border border-blue-200">
                <Bot className="w-4 h-4" />
              </div>
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full border-2 border-white bg-green-500 animate-pulse"></span>
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-slate-900 leading-none">WeFixIt AI Bot</CardTitle>
              <CardDescription className="text-[10px] font-medium text-green-600 mt-0.5">Active</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden p-0 flex flex-col bg-[#f0f2f5]/30">
          <ScrollArea className="flex-1 h-full">
            <div className="px-6 py-4 space-y-3">
              {/* Welcome Message if no history */}
              {messages.length === 0 && !isLoading && (
                <div className="flex justify-center flex-col items-center space-y-4 mt-10">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                    <Bot className="w-8 h-8 text-blue-500 opacity-40" />
                  </div>
                  <div className="text-center max-w-sm">
                    <h3 className="text-sm font-bold text-slate-900">Hello! I'm your AI assistant</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      I can help you with tracking repairs, pricing, and general inquiries. Try asking one of the questions below!
                    </p>
                  </div>
                </div>
              )}

              {messages.map((msg, idx) => {
                const isMe = msg.role === 'user';
                return (
                  <div key={msg._id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-1 duration-200`}>
                    <div className={`max-w-[80%] p-2.5 px-3.5 rounded-2xl text-[13px] shadow-sm transition-all ${
                      isMe 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                    }`}>
                      <p className="leading-snug font-medium whitespace-pre-wrap">{msg.content}</p>
                      <p className={`text-[9px] mt-1 font-bold opacity-70 ${isMe ? 'text-blue-50' : 'text-slate-400'}`}>
                        {format(new Date(msg.createdAt), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex justify-start animate-in fade-in duration-300">
                  <div className="bg-white text-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm">
                    <div className="flex gap-1.5 items-center">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
        </CardContent>

        {/* Suggested Queries */}
        {!isLoading && (
          <div className="px-6 py-4 bg-white border-t border-slate-50">
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUERIES.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-[11px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 px-3.5 py-2 rounded-full transition-all active:scale-95 shadow-sm"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="p-4 bg-white border-t">
          <form 
            onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} 
            className="flex gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all"
          >
            <Input
              placeholder="Type your question here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm h-10"
            />
            <Button 
                type="submit" 
                size="icon" 
                className="bg-blue-600 hover:bg-blue-700 shadow-md shrink-0 rounded-xl w-10 h-10 transition-transform active:scale-95" 
                disabled={isLoading || !input.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
