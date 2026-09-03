import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Phone, Navigation, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { getBusinessConfig, getWhatsAppUrl } from '../config/business';

export const StorePage: React.FC = () => {
  const [biz, setBiz] = useState(getBusinessConfig);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const handleUpdate = () => setBiz(getBusinessConfig());
    window.addEventListener('arona_business_updated', handleUpdate);
    window.addEventListener('arona_master_data_updated', handleUpdate);
    return () => {
      window.removeEventListener('arona_business_updated', handleUpdate);
      window.removeEventListener('arona_master_data_updated', handleUpdate);
    };
  }, []);

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

  const waUrl = getWhatsAppUrl(`Hi ARONA MOBILES, I am planning to visit your store. Please confirm location and stock.`);

  return (
    <div className="pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-left">
      
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-mono font-bold uppercase">
          <MapPin className="w-3.5 h-3.5 text-blue-600" />
          <span>FLAGSHIP STORE & CONTACT</span>
        </div>
        <h1 className="font-heading font-black text-4xl sm:text-5xl text-slate-900">
          VISIT ARONA MOBILES
        </h1>
        <p className="text-slate-600 text-sm max-w-2xl">
          Experience smartphones in hand, get certified pre-owned inspections, and instant trade-in appraisals at our flagship store.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Store Info */}
        <div className="lg:col-span-6 space-y-6">
          <div className="clean-card p-8 rounded-3xl space-y-6">
            <h2 className="font-heading font-bold text-2xl text-slate-900">Store Information</h2>

            <div className="space-y-4 text-sm text-slate-700">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">Address</div>
                  <div className="text-xs text-slate-600">{biz.address} {biz.landmark ? `(${biz.landmark})` : ''}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">Working Hours</div>
                  <div className="text-xs text-slate-600">
                    Weekdays: {biz.openingHours?.weekdays || '10:00 AM – 9:30 PM'} <br />
                    Weekends: {biz.openingHours?.weekends || '10:00 AM – 10:00 PM'}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">Call Support</div>
                  <div className="text-xs text-slate-600">{biz.phone}</div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-3">
              <a
                href={biz.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-xl bg-blue-600 text-white font-heading font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-blue-700 transition-all shadow-sm"
              >
                <Navigation className="w-4 h-4" />
                <span>GET DIRECTIONS ON MAPS</span>
              </a>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-6 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-heading font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-emerald-600 hover:text-white transition-all"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>CHAT ON WHATSAPP</span>
              </a>
            </div>
          </div>

          <div className="clean-card rounded-3xl overflow-hidden shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1556742049-0a679149226a?auto=format&fit=crop&w=1000&q=80"
              alt="Store Interior"
              className="w-full h-64 object-cover"
            />
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-6 clean-card p-8 rounded-3xl space-y-6">
          <h2 className="font-heading font-bold text-2xl text-slate-900">Send an Enquiry</h2>
          
          {submitted ? (
            <div className="py-12 text-center space-y-2 text-emerald-600">
              <CheckCircle2 className="w-12 h-12 mx-auto" />
              <h3 className="font-heading font-bold text-xl text-slate-900">Enquiry Submitted</h3>
              <p className="text-xs text-slate-500">Our store team will contact you back on your mobile number shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono font-semibold text-slate-700 uppercase">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-semibold text-slate-700 uppercase">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-semibold text-slate-700 uppercase">Message</label>
                <textarea
                  rows={4}
                  placeholder="Tell us what smartphone or service you need..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-heading font-bold text-xs uppercase tracking-wider hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span>SUBMIT ENQUIRY</span>
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
};
