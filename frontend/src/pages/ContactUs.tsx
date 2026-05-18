import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

import { api } from '@/lib/api';

export default function ContactUs() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message'),
    };

    try {
      // 1. Send Email to Admin via Backend API
      await api.post('/contact', data);
      
      toast.success('Message sent successfully! We will get back to you shortly.');
      
      // 2. Redirect to WhatsApp with pre-filled message
      const whatsappNumber = '9779800000000'; // Replace with actual WhatsApp number
      const whatsappMessage = `Hello WeFixIt!\n\nName: ${data.firstName} ${data.lastName}\nEmail: ${data.email}\nSubject: ${data.subject}\n\nMessage: ${data.message}`;
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
      
      window.open(whatsappUrl, '_blank');
      
      form.reset();
    } catch (error: any) {
      console.error('Failed to send message:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.errors?.[0]?.message || 'Failed to send message. Please try again or contact us directly.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-500/30 font-sans text-slate-600">
      {/* Hero Header */}
      <section className="relative pt-32 pb-24 overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-100/50 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-purple-100/50 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="container relative z-10 mx-auto px-4 lg:px-8 text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-slate-600 font-medium text-sm mb-8 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <MessageSquare className="w-4 h-4 text-blue-600" />
            We are here to help
          </div>
          <h1 className={`text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 transition-all duration-1000 delay-100 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            Let's start a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">conversation.</span>
          </h1>
          <p className={`text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed transition-all duration-1000 delay-200 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            Whether you need emergency repair support, have a question about pricing, or just want to explore partnership opportunities, our team is standing by.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
            
            {/* Contact Info Column */}
            <div className={`lg:col-span-2 space-y-8 transition-all duration-1000 delay-300 transform ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-12 opacity-0'}`}>
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Direct Contact</h2>
                <p className="text-slate-600 leading-relaxed">
                  Connect with us directly through any of these channels. We aim to respond to all inquiries within 2 hours during business operations.
                </p>
              </div>

              <div className="space-y-4">
                <div className="group flex items-start gap-5 p-6 bg-white rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all duration-500">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 border border-blue-100">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 mb-1">Service Center</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">123 Tech Avenue, Kathmandu<br />Bagmati Province, Nepal 44600</p>
                  </div>
                </div>

                <div className="group flex items-start gap-5 p-6 bg-white rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all duration-500">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 border border-blue-100">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 mb-1">Hotline</h4>
                    <p className="text-slate-600 text-sm mb-1">+977 980-000-0000</p>
                    <p className="text-slate-600 text-sm">+977 01-4000000</p>
                  </div>
                </div>

                <div className="group flex items-start gap-5 p-6 bg-white rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all duration-500">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 border border-blue-100">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 mb-1">Email Connect</h4>
                    <p className="text-slate-600 text-sm mb-1">support@wefixit.com.np</p>
                    <p className="text-slate-600 text-sm">info@wefixit.com.np</p>
                  </div>
                </div>

                <div className="group flex items-start gap-5 p-6 bg-white rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all duration-500">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 border border-blue-100">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 mb-1">Operating Hours</h4>
                    <p className="text-slate-600 text-sm mb-1">Sun - Fri: 9:00 AM - 6:00 PM</p>
                    <p className="text-blue-600 text-sm font-medium">Saturday: Closed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Column - Glassmorphic Premium Form */}
            <div className={`lg:col-span-3 transition-all duration-1000 delay-400 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-200 to-purple-200 rounded-[2rem] blur-xl group-hover:blur-2xl transition-all duration-700 opacity-50" />
                <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl p-8 md:p-12 border border-slate-200 shadow-2xl">
                  
                  <div className="mb-10">
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Send an Inquiry</h3>
                    <p className="text-slate-600 text-sm">Fill out the form below and we will automatically connect with you via email and WhatsApp.</p>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">First Name</label>
                        <Input required name="firstName" placeholder="John" className="h-14 bg-slate-50 border-slate-200 focus-visible:ring-blue-500 focus-visible:border-blue-500 rounded-xl text-slate-900 placeholder:text-slate-400 transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Last Name</label>
                        <Input required name="lastName" placeholder="Doe" className="h-14 bg-slate-50 border-slate-200 focus-visible:ring-blue-500 focus-visible:border-blue-500 rounded-xl text-slate-900 placeholder:text-slate-400 transition-all" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                      <Input required type="email" name="email" placeholder="john@example.com" className="h-14 bg-slate-50 border-slate-200 focus-visible:ring-blue-500 focus-visible:border-blue-500 rounded-xl text-slate-900 placeholder:text-slate-400 transition-all" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subject</label>
                      <Input required name="subject" placeholder="How can we help?" className="h-14 bg-slate-50 border-slate-200 focus-visible:ring-blue-500 focus-visible:border-blue-500 rounded-xl text-slate-900 placeholder:text-slate-400 transition-all" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Message</label>
                      <textarea 
                        required
                        name="message"
                        rows={5} 
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all p-4 text-slate-900 placeholder:text-slate-400 resize-none"
                        placeholder="Write your message here..."
                      ></textarea>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-14 text-base font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 border-0 transition-all hover:scale-[1.02]"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-3">
                          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Send Secure Message <Send className="w-4 h-4 ml-1" />
                        </span>
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>
      
      {/* Map Section */}
      <section className="h-[500px] w-full relative border-t border-slate-200">
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d56516.27689222485!2d85.2849328227652!3d27.708955944111384!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb198a307baabf%3A0xb5137c1bf18db1ea!2sKathmandu%2044600!5e0!3m2!1sen!2snp!4v1709212000000!5m2!1sen!2snp" 
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
          title="Location Map"
          className="transition-all duration-1000 opacity-90 hover:opacity-100"
        />
      </section>
    </div>
  );
}
