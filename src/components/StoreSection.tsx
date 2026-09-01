import React from 'react';
import { MapPin, Clock, Phone, Navigation, MessageSquare } from 'lucide-react';
import { BUSINESS_CONFIG, getWhatsAppUrl } from '../config/business';

export const StoreSection: React.FC = () => {
  const waUrl = getWhatsAppUrl("Hi ARONA MOBILES, I am planning to visit your store today. Please share store location and parking details.");

  return (
    <section id="store" className="py-20 relative bg-[#0a0c12]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border-white/10 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left">
          
          {/* Left Store Info */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono font-semibold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5" />
              <span>STORE EXPERIENCE</span>
            </div>

            <h2 className="font-heading font-black text-4xl sm:text-5xl text-white">
              COME EXPERIENCE <br />
              <span className="text-blue-500">ARONA MOBILES.</span>
            </h2>

            <p className="text-slate-300 text-sm sm:text-base">
              Touch and try the latest smartphones, inspect certified pre-owned devices in hand, or get instant device setup and trade-in valuations at our flagship store.
            </p>

            <div className="space-y-4 pt-2 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-heading font-bold text-white">Store Address</div>
                  <div className="text-slate-400 text-xs">{BUSINESS_CONFIG.address} ({BUSINESS_CONFIG.landmark})</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 flex-shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-heading font-bold text-white">Opening Hours</div>
                  <div className="text-slate-400 text-xs">
                    Mon – Fri: {BUSINESS_CONFIG.openingHours.weekdays} <br />
                    Sat – Sun: {BUSINESS_CONFIG.openingHours.weekends} ({BUSINESS_CONFIG.openingHours.openDays})
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 flex-shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-heading font-bold text-white">Direct Phone & WhatsApp</div>
                  <div className="text-slate-400 text-xs">{BUSINESS_CONFIG.phone}</div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <a
                href={BUSINESS_CONFIG.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-6 rounded-full bg-blue-600 text-white font-heading font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all"
              >
                <Navigation className="w-4 h-4" />
                <span>GET DIRECTIONS</span>
              </a>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-heading font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-emerald-500 hover:text-white transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>CHAT WITH STORE TEAM</span>
              </a>
            </div>

          </div>

          {/* Right Store Visual Mockup */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl group">
              <img
                src="https://images.unsplash.com/photo-1556742049-0a679149226a?auto=format&fit=crop&w=1000&q=80"
                alt="ARONA MOBILES Flagship Store"
                className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
                <div className="text-left space-y-1">
                  <div className="font-heading font-extrabold text-xl text-white">ARONA Flagship Tech Store</div>
                  <div className="text-xs text-slate-300">Live Device Demos • Certified Used Corner • Express Service Desk</div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
