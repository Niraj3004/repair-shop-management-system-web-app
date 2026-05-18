import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { io, Socket } from 'socket.io-client';
import { api } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageSquare, User, Clock, Check, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';

interface Message {
  _id: string;
  senderId: any;
  receiverId: string;
  content: string;
  createdAt: string;
  isRead?: boolean;
}

export default function Support() {
  const { user, token } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [isAdminOnline, setIsAdminOnline] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();
  const markReadMutation = useMutation({
    mutationFn: (partnerId: string) => api.put(`/chat/${partnerId}/read`),
    onSuccess: (_, partnerId) => {
      queryClient.invalidateQueries({ queryKey: ['unread-chat-count'] });
      // Emit socket event for real-time seen status
      if (socket) {
        socket.emit('markMessagesRead', { partnerId });
      }
    }
  });

  // Fetch initial data
  useEffect(() => {
    if (!user || !token) return;

    const fetchInitialData = async () => {
      try {
        const adminRes = await api.get('/users/admin');
        const aId = adminRes.data.data?._id;
        if (aId) {
          setAdminId(aId);
          const res = await api.get(`/chat/${aId}`);
          if (res.data?.success) {
            setMessages(res.data.data);
            scrollToBottom();
            markReadMutation.mutate(aId);
          }
        }
      } catch (error) {
        console.error('Failed to fetch support data', error);
      }
    };

    fetchInitialData();
  }, [user, token]);

  // Handle Socket connection
  useEffect(() => {
    if (!user || !token) return;

    const socketUrl = (import.meta as any).env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';
    
    const newSocket = io(socketUrl, {
      query: { userId: user._id },
      transports: ['websocket'],
    });

    setSocket(newSocket);

    newSocket.on('getOnlineUsers', (onlineUsers: string[]) => {
      if (adminId) {
        setIsAdminOnline(onlineUsers.includes(adminId));
      }
    });

    newSocket.on('newMessage', (message: Message) => {
      setMessages((prev) => {
        if (prev.some(m => m._id === message._id)) return prev;
        // Remove optimistic message if it matches this incoming one
        const filteredPrev = prev.filter(m => !(m._id.startsWith('temp-') && m.content === message.content));
        return [...filteredPrev, message];
      });
      scrollToBottom();
      if (adminId) markReadMutation.mutate(adminId);
    });

    newSocket.on('messagesRead', (data: { readerId: string }) => {
      // If the partner (admin) read my messages, update local messages to isRead: true
      setMessages((prev) => prev.map(msg => {
        const senderId = typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId;
        if (senderId === user._id) {
          return { ...msg, isRead: true };
        }
        return msg;
      }));
    });

    return () => {
      newSocket.close();
    };
  }, [user, token, adminId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !adminId) return;

    if (!socket.connected) {
      socket.connect();
      return;
    }

    try {
      const messageData = {
        receiverId: adminId,
        content: newMessage,
      };

      socket.emit('sendMessage', messageData);
      setNewMessage('');
      // Note: We don't do optimistic update here because the backend 
      // explicitly emits 'newMessage' back to the sender.
      // Doing optimistic update causes duplicate message bugs.
    } catch (err) {
      console.error('Failed to emit message:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 px-4 h-[calc(100vh-8rem)] flex flex-col">
      <Card className="flex-1 flex flex-col overflow-hidden border-slate-200 shadow-xl bg-white rounded-2xl">
        <CardHeader className="p-4 px-6 border-b bg-white flex flex-row items-center justify-between sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold uppercase shadow-sm">
                WS
              </div>
              <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${isAdminOnline ? 'bg-green-500' : 'bg-slate-300'}`}></span>
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-slate-900 leading-none">WeFixIt Support</CardTitle>
              <CardDescription className="text-[10px] flex items-center gap-1 font-medium mt-1">
                {isAdminOnline ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span>
                    Online
                  </span>
                ) : (
                  <span className="text-slate-400">Offline</span>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden p-0 flex flex-col bg-[#f0f2f5]/30">
          <ScrollArea className="flex-1 h-full">
            <div className="px-6 py-4 space-y-3">
              <div className="flex justify-center mb-2">
                <span className="px-3 py-1 bg-white/80 backdrop-blur-sm border border-slate-100 rounded-full text-[10px] text-slate-400 shadow-sm font-medium">
                  {format(new Date(), 'MMM d, yyyy')}
                </span>
              </div>

              {messages.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-slate-400 space-y-3 mt-10">
                  <MessageSquare className="w-8 h-8 opacity-20" />
                  <p className="text-xs font-medium italic">No messages yet. Say hi! 👋</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const senderId = typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId;
                  const isMe = senderId === user?._id;
                  
                  return (
                    <div key={msg._id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-1 duration-200`}>
                      <div className={`max-w-[80%] p-2.5 px-3.5 rounded-2xl text-[13px] shadow-sm transition-all ${
                        isMe 
                          ? 'bg-blue-600 text-white rounded-tr-none' 
                          : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                      }`}>
                        <p className="leading-snug font-medium">{msg.content}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <p className={`text-[9px] font-bold opacity-70 ${isMe ? 'text-blue-50' : 'text-slate-400'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {isMe && (
                            <span className="flex">
                              {msg.isRead ? (
                                <CheckCheck className="w-3.5 h-3.5 text-blue-300" />
                              ) : (
                                <Check className="w-3.5 h-3.5 text-blue-100/50" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>

        {/* Message Input */}
        <div className="p-4 bg-white border-t">
          <form onSubmit={handleSendMessage} className="flex gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e as any);
                }
              }}
              className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm h-10"
            />
            <Button 
                type="submit" 
                size="icon" 
                className="bg-blue-600 hover:bg-blue-700 shadow-md shrink-0 rounded-xl w-10 h-10 transition-transform active:scale-90" 
                disabled={!newMessage.trim() || !adminId}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
