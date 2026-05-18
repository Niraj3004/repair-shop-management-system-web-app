import React, { useEffect, useState } from 'react';
import { ShieldCheck, Clock, Wrench, ArrowRight, Award, Zap, CheckCircle2, ChevronRight } from 'lucide-react';

const stats = [
  { label: 'Repairs Completed', value: '15k+' },
  { label: 'Happy Customers', value: '14k+' },
  { label: 'Expert Technicians', value: '45+' },
  { label: 'Years of Experience', value: '12+' },
];

const features = [
  {
    icon: <Wrench />,
    title: 'Precision Diagnostics',
    description: 'We don’t just guess. Our certified technicians use advanced microscopic and software diagnostics to find the exact root cause of your device’s issue.',
  },
  {
    icon: <Zap />,
    title: 'Lightning Fast',
    description: 'Time is money. 85% of our standard repairs are completed within the same day, keeping you connected when it matters most.',
  },
  {
    icon: <ShieldCheck />,
    title: 'OEM Quality Parts',
    description: 'We absolutely refuse to compromise on quality. Every replacement part goes through a rigorous 5-point quality check before installation.',
  },
  {
    icon: <Award />,
    title: 'Ironclad Warranty',
    description: 'We stand firmly behind our work. Every repair is backed by an industry-leading 180-day comprehensive warranty for your total peace of mind.',
  },
];

export default function AboutUs() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-500/30 font-sans text-slate-600">
      {/* Hero Section - Premium Light Mode */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
        {/* Advanced Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-blue-100/50 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-100/50 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="container relative z-10 mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-10">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-medium text-sm transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              Elevating Tech Repair in Nepal
            </div>
            
            <h1 className={`text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-slate-900 leading-[1.1] transition-all duration-1000 delay-100 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              We breathe life back into your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">devices.</span>
            </h1>
            
            <p className={`text-lg md:text-2xl text-slate-600 leading-relaxed max-w-3xl mx-auto transition-all duration-1000 delay-200 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              Beyond simple fixes, we deliver engineered restoration. A premium repair experience built on uncompromising quality, radical transparency, and unmatched technical expertise.
            </p>
          </div>
        </div>
      </section>

      {/* Floating Stats Bar */}
      <section className={`relative z-20 -mt-12 transition-all duration-1000 delay-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-5xl mx-auto bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-3xl p-8 md:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-100">
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center px-4">
                  <h3 className="text-4xl md:text-5xl font-black text-blue-600 mb-2 tracking-tight">{stat.value}</h3>
                  <p className="text-sm md:text-base font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Brand Story - Minimalist Split */}
      <section className="py-32 lg:py-48 relative">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                Craftsmanship meets modern technology.
              </h2>
              <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
                <p>
                  WeFixIt was born from a singular obsession: to elevate the standard of electronic repair. We saw an industry plagued by shortcuts, cheap components, and a lack of accountability, and we knew we could build something radically better.
                </p>
                <p>
                  Today, we operate a state-of-the-art facility equipped with precision diagnostic tools. Our team consists exclusively of Tier-3 certified technicians who treat every motherboard, every screen, and every battery replacement as a piece of engineering art.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-6 pt-8 border-t border-slate-200">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-slate-900 font-bold mb-1">Zero Hidden Costs</h4>
                    <p className="text-sm text-slate-500">Total upfront transparency.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-slate-900 font-bold mb-1">Data Privacy</h4>
                    <p className="text-sm text-slate-500">Military-grade protocols.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Premium Image Container */}
            <div className="relative group perspective-1000">
              <div className="absolute -inset-4 bg-gradient-to-tr from-blue-200 to-purple-200 rounded-[2.5rem] opacity-50 blur-2xl group-hover:opacity-70 transition-opacity duration-700" />
              <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-2xl transform transition-transform duration-700 hover:rotate-y-2 hover:rotate-x-2">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent z-10" />
                <img 
                  src="https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=1200&q=80" 
                  alt="Engineering lab" 
                  className="w-full h-[600px] object-cover scale-105 group-hover:scale-100 transition-transform duration-1000"
                />
                <div className="absolute bottom-8 left-8 z-20">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/40 text-white font-medium shadow-lg">
                    <Wrench className="w-4 h-4" /> ISO 9001:2015 Certified Lab
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us - Bento Grid Style */}
      <section className="py-24 lg:py-32 bg-white relative border-t border-slate-100">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-20 space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900">The WeFixIt Advantage</h2>
            <p className="text-xl text-slate-600">Engineered for excellence. Designed for peace of mind. Here is why premium matters.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {features.map((feature, idx) => (
              <div 
                key={idx} 
                className="group relative bg-slate-50 p-8 rounded-3xl border border-slate-200 hover:border-blue-200 hover:shadow-xl transition-all duration-500 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-8 border border-blue-200 group-hover:scale-110 group-hover:bg-blue-600 transition-all duration-500">
                    {React.cloneElement(feature.icon, { className: 'w-8 h-8 text-blue-600 group-hover:text-white transition-colors duration-500' })}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Ready to resurrect your device?</h2>
          <button className="inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-900 font-bold rounded-full text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
            Book a Repair Now <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
}
