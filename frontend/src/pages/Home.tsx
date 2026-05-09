import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Smartphone, Laptop, Tablet, ShieldCheck, Clock, Wrench } from 'lucide-react';
import ChatbotWidget from '@/components/ChatbotWidget';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-20 px-4">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Fast & Reliable <br /> Device Repair in Nepal
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-xl">
              From cracked screens to battery replacements, our expert technicians fix your devices quickly with genuine parts.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/public-booking">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100 font-semibold text-lg px-8">
                  Book as Guest
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-blue-700 font-semibold text-lg px-8">
                  Create Account
                </Button>
              </Link>
              <Link to="/track">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-blue-700 font-semibold text-lg px-8">
                  Track Status
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex-1 w-full max-w-md">
            <div className="bg-white/10 p-8 rounded-3xl backdrop-blur-sm border border-white/20">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-2xl text-center text-slate-800 shadow-lg">
                  <Smartphone className="w-10 h-10 mx-auto text-blue-600 mb-2" />
                  <h3 className="font-semibold">Phones</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl text-center text-slate-800 shadow-lg">
                  <Laptop className="w-10 h-10 mx-auto text-blue-600 mb-2" />
                  <h3 className="font-semibold">Laptops</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl text-center text-slate-800 shadow-lg">
                  <Tablet className="w-10 h-10 mx-auto text-blue-600 mb-2" />
                  <h3 className="font-semibold">Tablets</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl text-center text-slate-800 shadow-lg">
                  <Wrench className="w-10 h-10 mx-auto text-blue-600 mb-2" />
                  <h3 className="font-semibold">Others</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Choose WeFixIt?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">We provide the best repair services with a focus on quality, speed, and customer satisfaction.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Genuine Parts</h3>
              <p className="text-slate-600">We use only high-quality, genuine replacement parts to ensure your device works perfectly.</p>
            </div>
            
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Fast Turnaround</h3>
              <p className="text-slate-600">Most common repairs are completed within 24 hours so you can get back to your life.</p>
            </div>
            
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <ArrowRight className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Live Tracking</h3>
              <p className="text-slate-600">Track your repair status in real-time through our portal with your unique tracking ID.</p>
            </div>
          </div>
        </div>
      </section>

      <ChatbotWidget />
    </div>
  );
}
