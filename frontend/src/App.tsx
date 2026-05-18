import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

// Public Pages
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import VerifyOTP from '@/pages/VerifyOTP';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import TrackRepair from '@/pages/TrackRepair';
import PublicBooking from '@/pages/PublicBooking';
import AboutUs from '@/pages/AboutUs';
import ContactUs from '@/pages/ContactUs';

// Client Dashboard Pages
import Dashboard from '@/pages/dashboard/Dashboard';
import BookRepair from '@/pages/dashboard/BookRepair';
import RepairDetails from '@/pages/dashboard/RepairDetails';
import Profile from '@/pages/dashboard/Profile';
import Invoices from '@/pages/dashboard/Invoices';
import Notifications from '@/pages/dashboard/Notifications';
import AIAssistant from '@/pages/dashboard/AIAssistant';
import ClientSupport from '@/pages/dashboard/Support';
import SubmitTestimonial from '@/pages/dashboard/Testimonials';

// Admin Pages
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminUsers from '@/pages/admin/Users';
import AdminBookings from '@/pages/admin/Bookings';
import AdminBookingDetails from '@/pages/admin/BookingDetails';
import AdminSupport from '@/pages/admin/Support';
import AdminInvoices from '@/pages/admin/Invoices';
import SendNotification from '@/pages/admin/SendNotification';
import APITestPage from '@/pages/admin/APITestPage';
import WalkInBooking from '@/pages/admin/WalkInBooking';
import AdminTestimonials from '@/pages/admin/Testimonials';

// Layouts
import PublicLayout from '@/layouts/PublicLayout';
import ClientLayout from '@/layouts/ClientLayout';
import AdminLayout from '@/layouts/AdminLayout';

const queryClient = new QueryClient();

export default function App() {
  const { logout } = useAuthStore();

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      window.location.href = '/login';
    };
    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth-unauthorized', handleUnauthorized);
  }, [logout]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/track" element={<TrackRepair />} />
            <Route path="/public-booking" element={<PublicBooking />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
          </Route>

          {/* Client Dashboard Routes */}
          <Route element={<ClientLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/book-repair" element={<BookRepair />} />
            <Route path="/dashboard/repairs/:id" element={<RepairDetails />} />
            <Route path="/dashboard/profile" element={<Profile />} />
            <Route path="/dashboard/invoices" element={<Invoices />} />
            <Route path="/dashboard/notifications" element={<Notifications />} />
            <Route path="/dashboard/support" element={<ClientSupport />} />
            <Route path="/dashboard/ai-assistant" element={<AIAssistant />} />
            <Route path="/dashboard/testimonials" element={<SubmitTestimonial />} />
          </Route>

          {/* Admin Dashboard Routes */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/admin/bookings/:id" element={<AdminBookingDetails />} />
            <Route path="/admin/support" element={<AdminSupport />} />
            <Route path="/admin/invoices" element={<AdminInvoices />} />
            <Route path="/admin/send-notification" element={<SendNotification />} />
            <Route path="/admin/api-tester" element={<APITestPage />} />
            <Route path="/admin/walk-in-booking" element={<WalkInBooking />} />
            <Route path="/admin/testimonials" element={<AdminTestimonials />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}
