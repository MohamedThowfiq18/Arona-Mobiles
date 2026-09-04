'use client';

import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  MessageSquare, 
  Send, 
  ShieldCheck, 
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { useProductStore } from '@/store/useProductStore';

export default function ContactPage() {
  const addToast = useProductStore((state) => state.addToast);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({
      type: 'success',
      title: '✉️ Message Sent!',
      description: 'Our customer support team will reply within 2 business hours.'
    });
    setName('');
    setEmail('');
    setMessage('');
  };

  const faqs = [
    {
      q: 'What is covered under the 12-Month Certified Pre-Owned Warranty?',
      a: 'Our warranty covers all hardware defects, touch digitizer anomalies, battery degradation below 80%, camera sensor failures, and speaker issues. It includes hassle-free 14-day returns.'
    },
    {
      q: 'How does the instant Trade-In process work?',
      a: 'Calculate your value online, schedule a free home courier pickup or store drop-off. Once verified, instant cash or store credit is transferred to your account.'
    },
    {
      q: 'Are repair parts official OEM components?',
      a: 'Yes, all screen, battery, and camera replacements use genuine original equipment manufacturer (OEM) parts calibrated with factory diagnostic software.'
    },
    {
      q: 'How does Supabase Realtime sync work on the site?',
      a: 'When our inventory manager updates price or stock in the admin dashboard, every active visitor sees live updates and notifications automatically without page refresh.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Header */}
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono font-bold border border-cyan-500/30">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <span>VISIT OUR FLAGSHIP LOCATION</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
          Get in Touch with <span className="gradient-text-blue">ARONA MOBILES</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 font-sans">
          Have questions about a phone, warranty coverage, trade-ins, or repair appointments? We are here to assist 7 days a week.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Contact Info & Hours */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-5">
            <h3 className="text-base font-bold text-white font-display">Store Information</h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Metro Plaza Flagship Store</h4>
                  <p className="text-slate-400 mt-0.5">104 Tech Boulevard, Metro Plaza, Suite 400</p>
                  <p className="text-slate-400">Downtown Tech District, NY 10001</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Customer Support Hotline</h4>
                  <p className="text-slate-400 font-mono mt-0.5">+1 (800) 555-ARONA (2766)</p>
                  <p className="text-slate-400 font-mono">WhatsApp: +1 (555) 019-2831</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Operating Hours</h4>
                  <p className="text-slate-400 mt-0.5 font-mono">Mon - Sat: 9:00 AM - 9:00 PM</p>
                  <p className="text-slate-400 font-mono">Sunday: 10:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Map Embed Card */}
          <div className="glass-card p-4 rounded-3xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Store Location Map</h4>
            <div className="w-full h-48 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 text-xs font-mono relative overflow-hidden">
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="relative z-10 text-center p-4">
                <MapPin className="w-8 h-8 text-cyan-400 mx-auto animate-bounce mb-2" />
                <div className="text-white font-bold">104 Tech Boulevard, Metro Plaza</div>
                <span className="text-[10px] text-slate-400">Open in Maps App →</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleContactSubmit} className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white font-display">Send Support Inquiry</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Topic / Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="General Inquiry">General Inquiry</option>
                <option value="Pre-Owned Hardware Grade">Pre-Owned Hardware Grade Question</option>
                <option value="Trade-In Quote">Trade-In Quote Status</option>
                <option value="Repair Appointment">Repair Appointment Question</option>
                <option value="Order & Delivery">Order & Delivery Tracking</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Message Detail</label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can our customer service team help you today?"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-500 text-white font-bold text-xs shadow-glow flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Send Message →</span>
            </button>
          </form>
        </div>

      </div>

      {/* FAQ Accordion */}
      <div className="space-y-6 pt-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold font-display text-white">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-400">Everything you need to know about our warranties, trade-ins & repairs</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs font-bold text-white hover:text-cyan-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-cyan-400' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-300 border-t border-slate-800/60 pt-3 leading-relaxed font-sans">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
