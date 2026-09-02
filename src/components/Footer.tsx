import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, MessageSquare, Instagram, Facebook, Youtube, MapPin, Phone } from 'lucide-react';
import { BUSINESS_CONFIG, getWhatsAppUrl } from '../config/business';

export const Footer: React.FC = () => {
  const waUrl = getWhatsAppUrl("Hi ARONA MOBILES, I am contacting you from your website footer.");

  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-12 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-12">
          
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20 flex-shrink-0">
                <Smartphone className="w-6 h-6" />
              </div>
              <div className="font-heading font-black text-3xl sm:text-4xl tracking-tight text-slate-900 leading-none">
                ARONA <span className="text-blue-600 font-extrabold">MOBILES</span>
              </div>
            </div>

            <p className="text-slate-500 text-xs font-mono tracking-wider text-blue-600 font-bold uppercase">
              {BUSINESS_CONFIG.tagline}
            </p>

            <p className="text-slate-600 text-xs leading-relaxed max-w-sm">
              {BUSINESS_CONFIG.subtext}
            </p>

            <div className="pt-2 flex items-center gap-2">
              {BUSINESS_CONFIG.socials.instagram && (
                <a href={BUSINESS_CONFIG.socials.instagram} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition-all">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              <a href={waUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-emerald-100 border border-emerald-200 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all">
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Shop Column */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-900">SHOP</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><Link to="/new-mobiles" className="hover:text-blue-600 transition-colors">New Mobiles</Link></li>
              <li><Link to="/pre-owned" className="hover:text-purple-600 transition-colors">Pre-Owned Mobiles</Link></li>
              <li><Link to="/accessories" className="hover:text-slate-900 transition-colors">Accessories</Link></li>
              <li><Link to="/exchange" className="hover:text-emerald-600 transition-colors">Exchange Offers</Link></li>
              <li><Link to="/admin" className="hover:text-blue-600 transition-colors font-bold text-blue-700">🔐 Owner Portal</Link></li>
            </ul>
          </div>

          {/* Services Column */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-900">SERVICES</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><Link to="/services" className="hover:text-purple-600 transition-colors">Mobile Repair</Link></li>
              <li><Link to="/exchange" className="hover:text-emerald-600 transition-colors">Phone Exchange</Link></li>
              <li><Link to="/services" className="hover:text-purple-600 transition-colors">Battery Replacement</Link></li>
              <li><Link to="/services" className="hover:text-purple-600 transition-colors">Screen Protection</Link></li>
            </ul>
          </div>

          {/* Location Column */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-900">FLAGSHIP STORE</h4>
            <div className="text-xs text-slate-600 space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>{BUSINESS_CONFIG.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{BUSINESS_CONFIG.phone}</span>
              </div>
              <div className="pt-1 text-[11px] text-slate-500 font-mono">
                Store Hours: {BUSINESS_CONFIG.openingHours.weekdays}
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} {BUSINESS_CONFIG.name}. All Rights Reserved.
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>100% Genuine Certified</span>
            <span>•</span>
            <span>Transparent Pre-Owned Inspection</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
