import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Bell, CheckCheck, AlertCircle, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'SYSTEM' | 'BOOKING' | 'PROMO' | 'ALERT';
  isRead: boolean;
  createdAt: string;
}

const typeConfig: Record<string, { icon: React.ReactNode; className: string }> = {
  SYSTEM: { icon: <Info className="w-5 h-5 text-blue-500" />, className: 'border-blue-100 bg-blue-50' },
  BOOKING: { icon: <CheckCircle2 className="w-5 h-5 text-green-500" />, className: 'border-green-100 bg-green-50' },
  PROMO: { icon: <Bell className="w-5 h-5 text-purple-500" />, className: 'border-purple-100 bg-purple-50' },
  ALERT: { icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />, className: 'border-yellow-100 bg-yellow-50' },
};

export default function Notifications() {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading, isError } = useQuery<Notification[]>({
    queryKey: ['my-notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data.data;
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.put(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-notifications'] });
    },
    onError: () => toast.error('Failed to mark notification as read'),
  });

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            Notifications
            {unreadCount > 0 && (
              <Badge className="bg-blue-600 text-white">{unreadCount} new</Badge>
            )}
          </h2>
          <p className="text-slate-500">Stay informed about your repair updates and alerts.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <CardTitle>All Notifications</CardTitle>
          </div>
          <CardDescription>Click "Mark as Read" to dismiss a notification.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center py-8 text-slate-500">
              <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
              <p>Failed to load notifications.</p>
            </div>
          ) : !notifications || notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">You have no notifications yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => {
                const config = typeConfig[notif.type] || typeConfig.info;
                return (
                  <div
                    key={notif._id}
                    className={`border rounded-lg p-4 flex gap-3 items-start transition-opacity ${
                      notif.isRead ? 'opacity-60' : ''
                    } ${config.className}`}
                  >
                    <div className="mt-0.5 flex-shrink-0">{config.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`font-medium text-slate-900 ${!notif.isRead ? 'font-semibold' : ''}`}>
                          {notif.title}
                        </p>
                        {!notif.isRead && (
                          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mt-0.5">{notif.message}</p>
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-xs text-slate-400">
                          {new Date(notif.createdAt).toLocaleString()}
                        </p>
                        {!notif.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7 px-2 text-blue-600 hover:text-blue-700"
                            onClick={() => markReadMutation.mutate(notif._id)}
                            disabled={markReadMutation.isPending}
                          >
                            <CheckCheck className="w-3 h-3 mr-1" />
                            Mark as Read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
