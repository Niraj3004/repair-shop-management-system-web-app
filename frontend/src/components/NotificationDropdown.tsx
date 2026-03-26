import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'SYSTEM' | 'BOOKING' | 'PROMO' | 'ALERT';
  isRead: boolean;
  createdAt: string;
}

export default function NotificationDropdown() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: notifications } = useQuery<Notification[]>({
    queryKey: ['my-notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await api.put('/notifications/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-notifications'] });
      toast.success('All notifications marked as read');
    },
    onError: () => toast.error('Failed to mark notifications as read'),
  });

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white ring-2 ring-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="p-4 border-b flex items-center justify-between">
          <DropdownMenuLabel className="p-0 font-semibold">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto p-0 text-xs text-blue-600 hover:bg-transparent"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[350px]">
          {notifications && notifications.length > 0 ? (
            <div className="flex flex-col">
              {notifications.slice(0, 10).map((n) => (
                <DropdownMenuItem
                  key={n._id}
                  className={`p-4 flex flex-col items-start gap-1 cursor-pointer border-b last:border-0 ${
                    !n.isRead ? 'bg-blue-50/50' : ''
                  }`}
                  onClick={() => navigate('/dashboard/notifications')}
                >
                  <div className="flex items-center justify-between w-full gap-2">
                    <span className={`text-sm font-medium ${!n.isRead ? 'text-blue-900' : 'text-slate-700'}`}>
                      {n.title}
                    </span>
                    {!n.isRead && <Badge className="h-1.5 w-1.5 rounded-full bg-blue-600 p-0" />}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{n.message}</p>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-sm">
              No new notifications
            </div>
          )}
        </ScrollArea>
        <DropdownMenuSeparator className="m-0" />
        <Button
          variant="ghost"
          className="w-full text-sm font-medium text-blue-600 rounded-none h-11 hover:text-blue-700 hover:bg-slate-50"
          onClick={() => navigate('/dashboard/notifications')}
        >
          View all notifications
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
