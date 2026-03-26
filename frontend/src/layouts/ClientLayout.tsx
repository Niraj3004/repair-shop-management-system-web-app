import React from 'react';
import { Navigate, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Wrench, 
  Bell, 
  LogOut, 
  User, 
  Menu,
  MessageSquare,
  FileText,
  Bot
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ClientChatWidget from '@/components/ClientChatWidget';
import NotificationDropdown from '@/components/NotificationDropdown';

export default function ClientLayout() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  const { data: unreadChatCount } = useQuery<number>({
    queryKey: ['unread-chat-count'],
    queryFn: async () => {
      const res = await api.get('/chat/unread/count');
      return res.data.data;
    },
    refetchInterval: 10000, // Poll every 10 seconds
  });

  const navItems = [
    { name: 'My Repairs', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Book a Repair', path: '/dashboard/book-repair', icon: <PlusCircle className="w-5 h-5" /> },
    { name: 'Invoices', path: '/dashboard/invoices', icon: <FileText className="w-5 h-5" /> },
    { name: 'AI Assistant', path: '/dashboard/ai-assistant', icon: <Bot className="w-5 h-5" /> },
    { name: 'Notifications', path: '/dashboard/notifications', icon: <Bell className="w-5 h-5" /> },
    { 
      name: 'Support Chat', 
      path: '/dashboard/support', 
      icon: <MessageSquare className="w-5 h-5" />,
      badge: unreadChatCount && unreadChatCount > 0 ? unreadChatCount : null
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 hidden md:flex flex-col border-r border-slate-800/50">
        <div className="h-16 flex items-center px-6 bg-slate-950 text-white font-bold text-xl gap-2 tracking-tight">
          <Wrench className="w-6 h-6 text-blue-500" />
          WeFixIt
        </div>
        <nav className="flex-1 py-8 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                location.pathname === item.path
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                  : 'hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="font-medium text-sm">{item.name}</span>
              </div>
              {item.badge && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center shadow-sm animate-pulse">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold uppercase">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4 md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
            <div className="font-bold text-xl text-blue-600 flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              WeFixIt
            </div>
          </div>
          
          <div className="hidden md:block">
            <h1 className="text-xl font-semibold text-slate-800">
              {navItems.find(item => item.path === location.pathname)?.name || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <NotificationDropdown />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 cursor-pointer group hover:bg-slate-50 p-1.5 rounded-full transition-all border border-transparent hover:border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold uppercase shadow-sm">
                    {user?.firstName?.[0]}
                  </div>
                  <div className="hidden lg:block text-left mr-1">
                    <p className="text-sm font-semibold text-slate-700 leading-none">{user?.firstName} {user?.lastName}</p>
                    <p className="text-[10px] text-slate-500 mt-1">Customer Account</p>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2">
                <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-lg mb-2">
                  <p className="text-sm font-bold text-slate-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/dashboard/profile')} className="py-2.5 cursor-pointer">
                  <User className="mr-3 h-4 w-4 text-slate-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Manage Account</span>
                    <span className="text-[10px] text-slate-400">Update your personal details</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/dashboard')} className="py-2.5 cursor-pointer">
                  <LayoutDashboard className="mr-3 h-4 w-4 text-slate-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Dashboard</span>
                    <span className="text-[10px] text-slate-400">View your active repairs</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600 py-2.5 cursor-pointer bg-red-50/50 hover:bg-red-50 focus:bg-red-50">
                  <LogOut className="mr-3 h-4 w-4" />
                  <span className="text-sm font-bold">Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-8 overflow-auto">
          <Outlet />
        </div>
      </main>
      
      {/* Floating Chat Widget for Clients */}
      <ClientChatWidget />
    </div>
  );
}
