import React from 'react';
import { ShieldCheck, Award, CreditCard, RefreshCw, Wrench, HeartHandshake } from 'lucide-react';
import { BUSINESS_CONFIG } from '../config/business';

export const TrustSection: React.FC = () => {
  return (
    <section className="py-20 relative bg-[#08090d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
          <h2 className="font-heading font-black text-4xl sm:text-5xl text-white">
            BUILT ON <span className="text-blue-500">TRUST.</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Why technology enthusiasts and smart buyers choose {BUSINESS_CONFIG.name}.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {[
            { num: '01', title: '100% GENUINE PRODUCTS', desc: 'Brand-new phones with official manufacturer warranty and original seal.', icon: Award },
            { num: '02', title: 'CERTIFIED PRE-OWNED', desc: 'Every used phone undergoes 8-point technical testing with transparent battery report.', icon: ShieldCheck },
            { num: '03', title: 'FAIR TRADE-IN VALUES', desc: 'Get competitive instant exchange estimates for your existing smartphone.', icon: RefreshCw },
            { num: '04', title: 'EASY EMI OPTIONS', desc: 'Hassle-free monthly installment solutions available directly in store.', icon: CreditCard },
            { num: '05', title: 'EXPRESS SERVICE CARE', desc: 'On-site screen, battery, and motherboard repairs by expert technicians.', icon: Wrench },
            { num: '06', title: 'AFTER-SALES SUPPORT', desc: 'Dedicated customer support for device setup, data migration, and warranty claims.', icon: HeartHandshake }
          ].map((item, idx) => (
            <div key={idx} className="glass-panel p-8 rounded-3xl border-white/10 relative space-y-4 hover:border-blue-500/40 transition-all group">
              <div className="flex items-center justify-between">
                <div className="font-heading font-black text-3xl text-blue-500/40 group-hover:text-blue-400 transition-colors">
                  {item.num}
                </div>
                <item.icon className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-heading font-bold text-lg text-white">{item.title}</h3>
              <p className="text-slate-400 text-xs sm:text-sm">{item.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
