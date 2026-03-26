import { Outlet, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Wrench } from 'lucide-react';

export default function PublicLayout() {
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-blue-600 font-bold text-xl">
            <Wrench className="w-6 h-6" />
            WeFixIt Nepal
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-slate-600 hover:text-blue-600 font-medium">Home</Link>
            <Link to="/track" className="text-slate-600 hover:text-blue-600 font-medium">Track Repair</Link>
          </nav>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'}>
                  <Button variant="outline">Dashboard</Button>
                </Link>
                <Button variant="ghost" onClick={logout}>Logout</Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-blue-600 hover:bg-blue-700">Book Repair</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-xl mb-4">
              <Wrench className="w-6 h-6" />
              WeFixIt Nepal
            </div>
            <p className="text-sm">Professional electronic device repair services across Nepal. Fast, reliable, and transparent.</p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li><Link to="/track" className="hover:text-white">Track Repair</Link></li>
              <li><Link to="/login" className="hover:text-white">Login</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>Kathmandu, Nepal</li>
              <li>+977 9800000000</li>
              <li>support@wefixit.com.np</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
