import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { io, Socket } from 'socket.io-client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Send, User, MessageSquare, Check, CheckCheck } from 'lucide-react';

interface ChatUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  isRead?: boolean;
}

export default function AdminSupport() {
  const { user, token } = useAuthStore();
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();
  const markReadMutation = useMutation({
    mutationFn: (partnerId: string) => api.put(`/chat/${partnerId}/read`),
    onSuccess: (_, partnerId) => {
      queryClient.invalidateQueries({ queryKey: ['unread-chat-count'] });
      queryClient.invalidateQueries({ queryKey: ['unread-chat-grouped'] });
      if (socket) {
        socket.emit('markMessagesRead', { partnerId });
      }
    },
  });

  // Fetch all users to chat with
  const { data: users, isLoading: usersLoading } = useQuery<any[]>({
    queryKey: ['admin-users-chat'],
    queryFn: async () => {
      const res = await api.get('/admin/users');
      return res.data.data.filter((u: any) => u.role !== 'admin');
    },
  });

  const { data: unreadCounts } = useQuery<Record<string, number>>({
    queryKey: ['unread-chat-grouped'],
    queryFn: async () => {
      const res = await api.get('/chat/unread/grouped');
      return res.data.data;
    },
    refetchInterval: 10000,
  });

  // Fetch chat history when a user is selected
  useEffect(() => {
    if (!selectedUser) return;

    const fetchHistory = async () => {
      try {
        const res = await api.get(`/chat/${selectedUser._id}`);
        if (res.data?.success) {
          setMessages(res.data.data);
          scrollToBottom();
          markReadMutation.mutate(selectedUser._id);
        }
      } catch (error) {
        console.error('Failed to fetch chat history', error);
      }
    };

    fetchHistory();
  }, [selectedUser]);

  // Handle Socket connection
  useEffect(() => {
    if (!user || !token) return;

    const socketUrl = (import.meta as any).env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';
    const newSocket = io(socketUrl, {
      query: { userId: user._id },
      transports: ['websocket'],
    });

    setSocket(newSocket);

    newSocket.on('getOnlineUsers', (users: string[]) => {
      setOnlineUsers(users);
    });

    newSocket.on('newMessage', (message: Message) => {
      // If message is from the currently selected user, add it and mark as read
      const senderId = typeof message.senderId === 'object' ? (message.senderId as any)._id : message.senderId;
      
      if (selectedUser?._id === senderId || message.senderId === user._id) {
        setMessages((prev) => {
          if (prev.some(m => m._id === message._id)) return prev;
          return [...prev, message];
        });
        scrollToBottom();
        
        if (selectedUser?._id === senderId) {
          markReadMutation.mutate(selectedUser._id);
        }
      } else {
        // Just invalidate the grouped unread counts to show badge
        queryClient.invalidateQueries({ queryKey: ['unread-chat-grouped'] });
      }
    });

    newSocket.on('messagesRead', (data: { readerId: string }) => {
      if (selectedUser?._id === data.readerId) {
        setMessages((prev) => prev.map(msg => ({ ...msg, isRead: true })));
      }
    });

    return () => {
      newSocket.close();
    };
  }, [user, token, selectedUser]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !selectedUser) return;

    if (!socket.connected) {
      socket.connect();
      return;
    }

    try {
      const messageData = {
        receiverId: selectedUser._id,
        content: newMessage,
      };

      socket.emit('sendMessage', messageData);
      
      const optimisticMsg: Message = {
        _id: `temp-${Date.now()}`,
        senderId: user!._id,
        receiverId: selectedUser._id,
        content: newMessage,
        createdAt: new Date().toISOString(),
        isRead: false
      };
      
      setMessages((prev) => [...prev, optimisticMsg]);
      setNewMessage('');
      scrollToBottom();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const filteredUsers = users?.filter(u => 
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6 overflow-hidden">
      {/* Users List Sidebar */}
      <Card className="w-80 flex flex-col overflow-hidden border-slate-200 shadow-sm bg-white rounded-2xl">
        <div className="p-5 border-b bg-white">
          <h3 className="text-lg font-bold text-slate-900 mb-4 tracking-tight">Support Inbox</h3>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search clients..."
              className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-1.5">
            {filteredUsers.map((u) => (
              <button
                key={u._id}
                onClick={() => setSelectedUser(u)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                  selectedUser?._id === u._id 
                    ? 'bg-blue-50 text-blue-900 shadow-sm' 
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="relative shrink-0">
                    <Avatar className="w-11 h-11 border-2 border-white shadow-sm">
                      <AvatarFallback className={`${selectedUser?._id === u._id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'} font-bold`}>
                        {u.firstName[0]}{u.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    {onlineUsers.includes(u._id) && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full ring-1 ring-green-100"></span>
                    )}
                  </div>
                  <div className="flex-1 text-left overflow-hidden">
                    <p className={`text-sm font-bold truncate ${selectedUser?._id === u._id ? 'text-blue-900' : 'text-slate-900'}`}>
                      {u.firstName} {u.lastName}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {onlineUsers.includes(u._id) ? 'Online' : 'Client'}
                    </p>
                  </div>
                </div>
                {unreadCounts?.[u._id] && unreadCounts[u._id] > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {unreadCounts[u._id]}
                  </span>
                )}
              </button>
            ))}
            {filteredUsers.length === 0 && !usersLoading && (
              <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
                <Search className="w-8 h-8 opacity-20" />
                <p className="text-xs font-medium">No clients found</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col overflow-hidden border-slate-200 shadow-sm bg-white rounded-2xl">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-3 px-6 border-b bg-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <Avatar className="w-9 h-9 border border-slate-100 shadow-sm">
                  <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-xs">
                    {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-none">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  <div className="text-[10px] flex items-center gap-1.5 font-medium mt-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${onlineUsers.includes(selectedUser._id) ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                    <span className={onlineUsers.includes(selectedUser._id) ? 'text-green-600' : 'text-slate-400'}>
                      {onlineUsers.includes(selectedUser._id) ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-0 bg-[#f0f2f5]/30 h-full">
              <div className="px-6 py-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 mt-20">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <MessageSquare className="w-8 h-8 opacity-20" />
                    </div>
                    <p className="text-sm font-medium">No messages yet</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const senderId = typeof msg.senderId === 'object' ? (msg.senderId as any)._id : msg.senderId;
                    const isMe = senderId === user?._id;
                    return (
                      <div key={msg._id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-1 duration-200`}>
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
                <Button type="submit" size="icon" className="bg-blue-600 hover:bg-blue-700 shadow-md shrink-0 rounded-xl w-10 h-10 transition-transform active:scale-95" disabled={!newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shadow-inner">
              <MessageSquare className="w-10 h-10 opacity-20" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">Select a client</h3>
              <p className="text-sm">Choose a conversation to start messaging</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
