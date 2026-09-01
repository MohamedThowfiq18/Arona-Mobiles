import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { getWhatsAppUrl } from '../config/business';

export const ContactSection: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [requirement, setRequirement] = useState('New Mobile Enquiry');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    setSubmitted(true);
    setTimeout(() => {
      setName('');
      setPhone('');
      setMessage('');
      setSubmitted(false);
    }, 4000);
  };

  const waUrl = getWhatsAppUrl(`Hi ARONA MOBILES, I am ${name || 'Customer'}. Requirement: ${requirement}. Message: ${message || 'I want to inquire about phone availability and pricing.'}`);

  return (
    <section id="contact" className="py-20 relative bg-[#08090d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-4xl mx-auto glass-panel p-8 sm:p-12 rounded-3xl border-white/10 text-left shadow-2xl">
          
          <div className="text-center space-y-3 mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono font-semibold uppercase tracking-wider">
              <Mail className="w-3.5 h-3.5" />
              <span>DIRECT ENQUIRY</span>
            </div>
            <h2 className="font-heading font-black text-4xl text-white">LET'S TALK TECH.</h2>
            <p className="text-slate-400 text-sm max-w-lg mx-auto">
              Have a question about a phone model, trade-in estimate, or service? Send us a message or chat with us on WhatsApp.
            </p>
          </div>

          {submitted ? (
            <div className="py-12 text-center space-y-3 text-emerald-400">
              <CheckCircle2 className="w-12 h-12 mx-auto" />
              <h3 className="font-heading font-bold text-2xl text-white">Thank You! Enquiry Received</h3>
              <p className="text-slate-300 text-xs">Our store team will contact you back shortly on your mobile number.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-mono font-semibold text-slate-300 uppercase">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono font-semibold text-slate-300 uppercase">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono font-semibold text-slate-300 uppercase">Requirement Category</label>
                <select
                  value={requirement}
                  onChange={(e) => setRequirement(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="New Mobile Enquiry" className="bg-[#08090d]">Brand New Mobile Purchase</option>
                  <option value="Pre-Owned Mobile Enquiry" className="bg-[#08090d]">Certified Pre-Owned Mobile</option>
                  <option value="Exchange Valuation" className="bg-[#08090d]">Phone Exchange & Upgrade</option>
                  <option value="Accessory Inquiry" className="bg-[#08090d]">Accessories & Chargers</option>
                  <option value="Arona Care Service" className="bg-[#08090d]">Repair & Service Booking</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono font-semibold text-slate-300 uppercase">Message / Device Details</label>
                <textarea
                  rows={3}
                  placeholder="Tell us what model or service you are interested in..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-blue-600 text-white font-heading font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>SEND ENQUIRY</span>
                </button>

                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-heading font-bold text-xs uppercase tracking-wider hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WHATSAPP US INSTEAD</span>
                </a>
              </div>

            </form>
          )}

        </div>

      </div>
    </section>
  );
};
