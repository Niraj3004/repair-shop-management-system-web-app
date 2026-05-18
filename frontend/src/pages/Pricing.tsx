import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { 
  Search, Tag, Smartphone, Laptop, Tablet, Watch, Clock, ChevronRight, 
  ShieldCheck, Zap, Sparkles, HelpCircle, ArrowRight, Star, HeartHandshake, CheckCircle2,
  GitCompare, X, Award, Check, Layers
} from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function Pricing() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isVisible, setIsVisible] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [compareList, setCompareList] = useState<any[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [pricingTier, setPricingTier] = useState<'standard' | 'premium'>('standard');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Fetch prices with category and search filters
  const { data: response, isLoading } = useQuery({
    queryKey: ['public-pricing', selectedCategory, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);
      
      const res = await api.get(`/pricing/public?${params.toString()}`);
      return res.data;
    },
  });

  const prices = response?.data || [];
  const categories = response?.categories || ['All', 'Smartphone', 'Laptop', 'Tablet'];

  const getCategoryIcon = (category: string, className = "w-5 h-5") => {
    switch (category.toLowerCase()) {
      case 'mobile':
      case 'smartphone':
        return <Smartphone className={className} />;
      case 'laptop':
        return <Laptop className={className} />;
      case 'tablet':
        return <Tablet className={className} />;
      default:
        return <Watch className={className} />;
    }
  };

  // Helper for text highlighting in searches
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-100 text-slate-900 font-extrabold px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const handleCompareSelect = (price: any) => {
    if (compareList.some(item => item._id === price._id)) {
      setCompareList(compareList.filter(item => item._id !== price._id));
    } else {
      if (compareList.length >= 3) {
        return; // Limit comparison to 3 items
      }
      setCompareList([...compareList, price]);
    }
  };

  const faqs = [
    {
      q: "Do you use original (OEM) parts for repairs?",
      a: "Yes, WeFixIt Nepal uses premium OEM-grade parts that match the exact technical specifications of your manufacturer. All screens, batteries, and internal chips undergo rigorous diagnostic testing before installation."
    },
    {
      q: "Does WeFixIt Nepal offer a warranty on repairs?",
      a: "Absolutely! We provide an industry-leading 6-Month Warranty on all screen and component replacements. If you experience any issues related to the repair parts during this period, we will fix it completely free of cost."
    },
    {
      q: "What is your diagnostic fee?",
      a: "We believe in transparency. If you choose to go ahead with our recommended repair solution, the diagnostic fee is completely waived! For stand-alone diagnostics, there is a flat rate of NPR 500."
    },
    {
      q: "How long does a typical repair take?",
      a: "Most smartphone screen and battery replacements are completed in under 2 hours. More complex repairs, like motherboard chip-level micro-soldering or water damage restoration, can take between 24 to 48 hours."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] selection:bg-blue-600/20 font-sans text-slate-600 overflow-hidden relative">
      
      {/* Dynamic Background Accents */}
      <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-gradient-to-tr from-blue-100/40 to-indigo-100/30 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[800px] left-[-200px] w-[700px] h-[700px] bg-gradient-to-tr from-purple-100/30 to-pink-100/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Hero Header */}
      <section className="relative pt-36 pb-24 overflow-hidden">
        <div className="container relative z-10 mx-auto px-4 lg:px-8 text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50/80 backdrop-blur-md border border-blue-100 text-blue-700 font-bold text-xs uppercase tracking-wider mb-8 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
            Transparent Pricing Engine
          </div>
          <h1 className={`text-5xl md:text-7xl font-black tracking-tight text-slate-900 mb-6 leading-tight transition-all duration-1000 delay-100 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            High-Grade Repairs. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">Zero Guesswork.</span>
          </h1>
          <p className={`text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed transition-all duration-1000 delay-200 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            Search over dozens of certified repair rates. Premium diagnostics, upfront estimates, and standard 6-month warranties included.
          </p>

          {/* Pricing Model Tier Toggle */}
          <div className="flex justify-center mt-10">
            <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60 flex items-center shadow-inner gap-1">
              <button
                onClick={() => setPricingTier('standard')}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
                  pricingTier === 'standard' 
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/40' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Award className="w-4 h-4 text-blue-500" /> Standard Parts
              </button>
              <button
                onClick={() => setPricingTier('premium')}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
                  pricingTier === 'premium' 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Zap className="w-4 h-4 animate-bounce" /> OEM Genuine Parts (+25%)
              </button>
            </div>
          </div>

          {/* Quick Value Stats */}
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-12 transition-all duration-1000 delay-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xl font-extrabold text-slate-900">6 Months</span>
              <span className="text-xs text-slate-400 mt-1">Full Warranty</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-3">
                <Clock className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="text-xl font-extrabold text-slate-900">Under 2h</span>
              <span className="text-xs text-slate-400 mt-1">Average Repair Time</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-xl font-extrabold text-slate-900">Free</span>
              <span className="text-xs text-slate-400 mt-1">Diagnostics Cover</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mb-3">
                <HeartHandshake className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-xl font-extrabold text-slate-900">10k+</span>
              <span className="text-xs text-slate-400 mt-1">Happy Devices</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Repair Cost Estimator */}
      <section className="pb-16 relative z-30 -mt-10">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <InteractiveEstimator pricingTier={pricingTier} />
        </div>
      </section>

      {/* Pricing Filters & Catalog */}
      <section className="pb-24 relative z-20">
        <div className="container mx-auto px-4 lg:px-8">
          
          {/* Advanced Search & Filtering Bar */}
          <div className={`max-w-4xl mx-auto bg-white/80 backdrop-blur-xl p-4 md:p-5 rounded-3xl shadow-xl shadow-slate-100/80 border border-slate-200/80 mb-16 flex flex-col md:flex-row gap-4 transition-all duration-1000 delay-400 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input 
                type="text"
                placeholder="Search device (e.g. iPhone 14, MacBook Pro...)"
                className="w-full h-14 pl-12 bg-slate-50/50 border-slate-200 focus-visible:ring-blue-600 rounded-2xl text-slate-900 text-lg placeholder:text-slate-400/80 transition-all font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
              {categories.map((category: string) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all duration-300 ${
                    selectedCategory === category 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 border-transparent' 
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {category !== 'All' && getCategoryIcon(category, "w-4 h-4")}
                    {category}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Grid */}
          {isLoading ? (
             <div className="flex justify-center items-center h-64">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
             </div>
          ) : prices.length === 0 ? (
             <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-4xl mx-auto">
                <Tag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Device Not Found?</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-6">Don't worry! We repair almost everything. Get an instant diagnostic estimate over WhatsApp or call us directly.</p>
                <div className="flex justify-center gap-3">
                  <a href="/contact" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-md">
                    Contact Us
                  </a>
                  <a href="https://wa.me/9779800000000" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-md flex items-center gap-2">
                    Chat on WhatsApp <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto animate-fade-in">
              {prices.map((price: any, idx: number) => {
                const isSelected = compareList.some(item => item._id === price._id);
                const activePrice = pricingTier === 'premium' ? Math.round(price.price * 1.25) : price.price;

                return (
                  <div 
                    key={price._id} 
                    className={`group bg-white p-8 rounded-3xl border transition-all duration-500 relative flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 ${
                      isSelected 
                        ? 'border-blue-500 ring-2 ring-blue-500/10' 
                        : 'border-slate-200/80 hover:border-blue-300'
                    }`}
                    style={{ animationDelay: `${idx * 80}ms` }}
                  >
                    {/* Subtle Background Radial */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50/50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div>
                      {/* Compare Checkbox & Header */}
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-200 bg-slate-50/80 shadow-sm p-1 group-hover:scale-105 transition-transform duration-300">
                          {price.image ? (
                            <img src={price.image} alt={price.deviceName} className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            <div className="w-full h-full bg-blue-50/80 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 rounded-xl">
                              {getCategoryIcon(price.category, "w-8 h-8")}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-end gap-1.5">
                          <button
                            onClick={() => handleCompareSelect(price)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                              isSelected
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                            }`}
                          >
                            <GitCompare className="w-3.5 h-3.5" />
                            {isSelected ? 'Selected' : 'Compare'}
                          </button>
                          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-400 text-[10px] font-bold rounded-full uppercase tracking-wider border border-slate-200/40 mt-1">
                            {price.category}
                          </span>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <h3 className="text-2xl font-extrabold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                        {highlightText(price.deviceName, searchTerm)}
                      </h3>
                      <p className="text-slate-500 font-medium mb-6 flex items-center gap-1.5">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        {price.serviceType}
                      </p>
                    </div>

                    {/* Pricing Details */}
                    <div className="pt-6 border-t border-slate-100">
                      <div className="flex justify-between items-end mb-6">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            {pricingTier === 'premium' ? 'OEM Genuine Est.' : 'Guaranteed Price'}
                          </p>
                          <p className="text-4xl font-black text-slate-900 tracking-tight">
                            <span className="text-sm text-slate-400 font-bold mr-1">NPR</span>
                            {activePrice.toLocaleString()}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200/50 px-2.5 py-1.5 rounded-xl shadow-inner">
                          <Clock className="w-3.5 h-3.5 text-indigo-500" />
                          {price.estimatedTime}
                        </div>
                      </div>

                      {/* Booking/Contact Call to Actions */}
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <Link 
                          to={`/public-booking?device=${encodeURIComponent(price.deviceName)}&service=${encodeURIComponent(price.serviceType)}`}
                          className="py-3.5 px-4 bg-slate-900 hover:bg-blue-600 text-white text-center font-bold text-sm rounded-2xl transition-all duration-300 flex items-center justify-center gap-1.5 shadow-md shadow-slate-900/5 hover:shadow-blue-500/10"
                        >
                          Book Now
                        </Link>
                        <a 
                          href={`https://wa.me/9779800000000?text=${encodeURIComponent(`Hi, I would like to book a repair for my ${price.deviceName} (${price.serviceType}) priced at NPR ${activePrice.toLocaleString()}.`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="py-3.5 px-4 bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 text-slate-600 text-center font-bold text-sm rounded-2xl transition-all duration-300 flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Floating Compare Bottom Bar */}
      {compareList.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-4 rounded-full border border-slate-800 shadow-2xl flex items-center gap-6 animate-slide-up max-w-[90%] md:max-w-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-black">
              {compareList.length}
            </div>
            <span className="text-sm font-bold tracking-wide hidden md:inline">
              Devices Selected for Comparison
            </span>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden md:block" />

          <div className="flex items-center gap-2">
            {compareList.map((item) => (
              <div key={item._id} className="relative group w-10 h-10 rounded-xl overflow-hidden border border-slate-800 bg-slate-800 shrink-0">
                {item.image ? (
                  <img src={item.image} alt={item.deviceName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-blue-500 font-extrabold">
                    {item.deviceName.charAt(0)}
                  </div>
                )}
                <button 
                  onClick={() => handleCompareSelect(item)}
                  className="absolute inset-0 bg-red-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowCompareModal(true)}
              disabled={compareList.length < 2}
              className={`px-5 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-widest flex items-center gap-2 transition-all ${
                compareList.length < 2 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20'
              }`}
            >
              Compare <GitCompare className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setCompareList([])}
              className="p-2.5 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Comparison Modal Backdrop */}
      {showCompareModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-zoom-in">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <GitCompare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xl text-slate-900">Direct Comparison Analysis</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Side-by-side estimate evaluation</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCompareModal(false)}
                className="w-10 h-10 rounded-xl hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Table content */}
            <div className="p-6 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="py-4 font-bold text-slate-400 text-xs uppercase tracking-wider w-1/4">Metric</th>
                    {compareList.map((item) => (
                      <th key={item._id} className="py-4 px-4 font-extrabold text-slate-900 text-lg w-1/3">
                        <div className="flex items-center gap-3">
                          {item.image && (
                            <img src={item.image} alt={item.deviceName} className="w-8 h-8 rounded-lg object-cover border border-slate-200" />
                          )}
                          {item.deviceName}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {/* Category */}
                  <tr>
                    <td className="py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Device Category</td>
                    {compareList.map((item) => (
                      <td key={item._id} className="py-4 px-4 text-slate-700 font-bold">{item.category}</td>
                    ))}
                  </tr>
                  {/* Service Type */}
                  <tr>
                    <td className="py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Service Required</td>
                    {compareList.map((item) => (
                      <td key={item._id} className="py-4 px-4 text-slate-900 font-semibold">{item.serviceType}</td>
                    ))}
                  </tr>
                  {/* Price */}
                  <tr>
                    <td className="py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Estimated Cost</td>
                    {compareList.map((item) => {
                      const activePrice = pricingTier === 'premium' ? Math.round(item.price * 1.25) : item.price;
                      return (
                        <td key={item._id} className="py-4 px-4 text-slate-900 text-2xl font-black">
                          <span className="text-xs text-slate-400 font-bold mr-0.5">NPR</span>
                          {activePrice.toLocaleString()}
                        </td>
                      );
                    })}
                  </tr>
                  {/* Turnaround */}
                  <tr>
                    <td className="py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Estimated Time</td>
                    {compareList.map((item) => (
                      <td key={item._id} className="py-4 px-4 text-slate-600 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-indigo-500" />
                          {item.estimatedTime}
                        </div>
                      </td>
                    ))}
                  </tr>
                  {/* Warranty */}
                  <tr>
                    <td className="py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Parts Quality Guarantee</td>
                    {compareList.map((item) => (
                      <td key={item._id} className="py-4 px-4 text-slate-600">
                        <div className="flex items-center gap-1.5 text-blue-600 font-bold">
                          <ShieldCheck className="w-4 h-4" />
                          6-Month Warranty
                        </div>
                      </td>
                    ))}
                  </tr>
                  {/* Actions */}
                  <tr>
                    <td className="py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Booking Option</td>
                    {compareList.map((item) => {
                      const activePrice = pricingTier === 'premium' ? Math.round(item.price * 1.25) : item.price;
                      return (
                        <td key={item._id} className="py-4 px-4">
                          <div className="flex flex-col gap-2">
                            <Link 
                              to={`/public-booking?device=${encodeURIComponent(item.deviceName)}&service=${encodeURIComponent(item.serviceType)}`}
                              className="py-2.5 px-4 bg-slate-950 hover:bg-blue-600 text-white text-center font-bold text-xs rounded-xl transition-colors shadow-sm"
                            >
                              Book Now
                            </Link>
                            <a 
                              href={`https://wa.me/9779800000000?text=${encodeURIComponent(`Hi, I would like to book a repair for my ${item.deviceName} (${item.serviceType}) priced at NPR ${activePrice.toLocaleString()}.`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="py-2 px-4 border border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600 text-center font-bold text-xs rounded-xl transition-all"
                            >
                              WhatsApp
                            </a>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
              <span>* Estimates comparison excludes standard physical diagnostic diagnostics, which are 100% waived upon successful repair completion.</span>
              <button 
                onClick={() => setCompareList([])}
                className="text-red-500 hover:text-red-600 font-bold hover:underline transition-colors uppercase tracking-wider"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warranty & Guarantee Features Section */}
      <section className="py-24 bg-white border-t border-b border-slate-200/60 relative">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">We Make Repairs Stress-Free</h2>
            <p className="text-slate-500">Every price is backed by our customer protection policies to ensure you get the absolute best service in Nepal.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 shadow-sm border border-blue-100 text-blue-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">6-Month Warranty</h3>
                <p className="text-slate-500 text-sm leading-relaxed">No worries about parts. If any replaced screen, battery, or modular component fails, we will swap it out free.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 shadow-sm border border-indigo-100 text-indigo-600">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Express 2-Hour Service</h3>
                <p className="text-slate-500 text-sm leading-relaxed">We respect your time. Most screen and battery replacements are done on the spot while you wait.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center shrink-0 shadow-sm border border-purple-100 text-purple-600">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">OEM-Grade Parts</h3>
                <p className="text-slate-500 text-sm leading-relaxed">We source premium, original-grade components tested for peak visual contrast, touch sensitivity, and battery lifecycle.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing FAQs Section */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-500 font-bold text-xs uppercase tracking-wider mb-4 border border-slate-200">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              Got Questions?
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Pricing & Process FAQ</h2>
            <p className="text-slate-500">Find answers to general questions about our repair rates, policies, and standard procedures.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all duration-300"
              >
                <button 
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full p-6 text-left font-bold text-lg text-slate-900 flex justify-between items-center hover:bg-slate-50/50 transition-colors"
                >
                  {faq.q}
                  <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${activeFaq === index ? 'rotate-90 text-blue-600' : ''}`} />
                </button>
                
                <div 
                  className={`transition-all duration-300 ease-in-out ${
                    activeFaq === index ? 'max-h-[300px] border-t border-slate-100 p-6' : 'max-h-0 opacity-0 pointer-events-none'
                  }`}
                >
                  <p className="text-slate-500 text-sm leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Diagnostic Note */}
          <div className="mt-16 text-center text-slate-400 text-xs">
            * All listed prices are estimates and subject to change based on custom device variations. 13% VAT is applicable on all physical invoices.
          </div>
        </div>
      </section>
    </div>
  );
}

// ==========================================
// Interactive Repair Cost Estimator Component
// ==========================================
interface EstimatorProps {
  pricingTier: 'standard' | 'premium';
}

function InteractiveEstimator({ pricingTier }: EstimatorProps) {
  const [category, setCategory] = useState('Smartphone');
  const [issue, setIssue] = useState('Screen Damage');
  const [estimate, setEstimate] = useState<{ min: number; max: number; time: string } | null>(null);

  const issuesList = [
    { name: 'Screen Damage', label: 'Screen Replacement / Glass Fix' },
    { name: 'Battery Replacement', label: 'Battery Lifespan / Dead Battery' },
    { name: 'Charging Port / Power', label: 'Charging Connector / Hard Boot Fix' },
    { name: 'Water Damage', label: 'Spill & Liquid Intrusion Treatment' },
    { name: 'Motherboard / Chip-Level', label: 'Micro-soldering & Power IC Repair' },
  ];

  const calculateEstimate = () => {
    let min = 1500;
    let max = 4500;
    let time = '1-2 Hours';

    if (category === 'Smartphone') {
      if (issue === 'Screen Damage') { min = 3500; max = 18000; time = '1 Hour'; }
      else if (issue === 'Battery Replacement') { min = 2000; max = 6500; time = '45 Mins'; }
      else if (issue === 'Charging Port / Power') { min = 1500; max = 4000; time = '1 Hour'; }
      else if (issue === 'Water Damage') { min = 2500; max = 8000; time = '24-48 Hours'; }
      else if (issue === 'Motherboard / Chip-Level') { min = 4000; max = 12000; time = '1-2 Days'; }
    } else if (category === 'Laptop') {
      if (issue === 'Screen Damage') { min = 8500; max = 35000; time = '2-4 Hours'; }
      else if (issue === 'Battery Replacement') { min = 4500; max = 12000; time = '1 Hour'; }
      else if (issue === 'Charging Port / Power') { min = 3000; max = 9500; time = '2 Hours'; }
      else if (issue === 'Water Damage') { min = 5000; max = 15000; time = '24-48 Hours'; }
      else if (issue === 'Motherboard / Chip-Level') { min = 6000; max = 22000; time = '2-3 Days'; }
    } else if (category === 'Tablet') {
      if (issue === 'Screen Damage') { min = 6000; max = 25000; time = '2 Hours'; }
      else if (issue === 'Battery Replacement') { min = 3500; max = 8500; time = '1 Hour'; }
      else if (issue === 'Charging Port / Power') { min = 2500; max = 6000; time = '2 Hours'; }
      else if (issue === 'Water Damage') { min = 4000; max = 12000; time = '24-48 Hours'; }
      else if (issue === 'Motherboard / Chip-Level') { min = 5000; max = 16000; time = '1-2 Days'; }
    } else { // Smartwatch / Other
      if (issue === 'Screen Damage') { min = 4500; max = 14000; time = '2 Hours'; }
      else if (issue === 'Battery Replacement') { min = 2500; max = 5500; time = '1 Hour'; }
      else if (issue === 'Charging Port / Power') { min = 2000; max = 4500; time = '2 Hours'; }
      else if (issue === 'Water Damage') { min = 3000; max = 7500; time = '24-48 Hours'; }
      else if (issue === 'Motherboard / Chip-Level') { min = 4000; max = 9500; time = '1-2 Days'; }
    }

    if (pricingTier === 'premium') {
      min = Math.round(min * 1.25);
      max = Math.round(max * 1.25);
    }

    setEstimate({ min, max, time });
  };

  useEffect(() => {
    calculateEstimate();
  }, [category, issue, pricingTier]);

  return (
    <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-100/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-extrabold text-xl text-slate-900 leading-none">Instant Repair Estimator</h3>
          <p className="text-slate-400 text-xs mt-1">Get a quick cost range projection instantly</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Device Category</label>
          <div className="grid grid-cols-2 gap-2">
            {['Smartphone', 'Laptop', 'Tablet', 'Smartwatch'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`py-3 px-4 rounded-xl text-sm font-bold border transition-all ${
                  category === cat
                    ? 'bg-blue-50 border-blue-500/50 text-blue-700 shadow-sm'
                    : 'bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Describe the Issue</label>
          <select
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            {issuesList.map((iss) => (
              <option key={iss.name} value={iss.name}>
                {iss.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {estimate && (
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl text-white flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">
              Projected Cost Range ({pricingTier === 'premium' ? 'OEM Genuine' : 'Standard'})
            </span>
            <p className="text-3xl font-black tracking-tight">
              <span className="text-lg font-bold text-slate-400 mr-1">NPR</span>
              {estimate.min.toLocaleString()} - {estimate.max.toLocaleString()}
            </p>
            <p className="text-xs text-slate-400">
              *Turnaround projection: <span className="text-indigo-300 font-bold">{estimate.time}</span>. Free Diagnostics included.
            </p>
          </div>

          <Link
            to={`/public-booking?device=${encodeURIComponent(`Generic ${category}`)}&service=${encodeURIComponent(issue)}`}
            className="w-full md:w-auto py-3.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all whitespace-nowrap"
          >
            Book with this Estimate
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
