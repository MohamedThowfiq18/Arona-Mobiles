import React from 'react';
import { ShieldCheck, Smartphone, BatteryCharging, Wrench, Clock, CheckCircle2, MessageSquare } from 'lucide-react';
import { SAMPLE_SERVICES } from '../data/services';
import { getWhatsAppUrl } from '../config/business';

export const ServicesSection: React.FC = () => {
  return (
    <section id="services" className="py-20 relative bg-gradient-to-b from-[#08090d] via-[#0c0e18] to-[#08090d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ARONA CARE SERVICES</span>
          </div>
          <h2 className="font-heading font-black text-4xl sm:text-5xl text-white">
            WE DON'T JUST SELL IT. <br />
            <span className="text-purple-400">WE TAKE CARE OF IT.</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Express screen replacement, genuine battery installation, chip-level motherboard repair, and software support backed by store warranty.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {SAMPLE_SERVICES.map((srv) => {
            const waUrl = getWhatsAppUrl(`Hi ARONA MOBILES, I need assistance with ${srv.title}. Please provide diagnostic appointment and repair estimate.`);

            return (
              <div key={srv.id} className="glass-panel p-8 rounded-3xl border-purple-500/20 hover:border-purple-500/50 transition-all flex flex-col justify-between space-y-6 group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      {srv.iconName === 'Smartphone' && <Smartphone className="w-6 h-6" />}
                      {srv.iconName === 'BatteryCharging' && <BatteryCharging className="w-6 h-6" />}
                      {srv.iconName === 'Wrench' && <Wrench className="w-6 h-6" />}
                      {srv.iconName === 'ShieldCheck' && <ShieldCheck className="w-6 h-6" />}
                    </div>

                    <span className="text-xs font-mono text-purple-300 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/30 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-purple-400" />
                      {srv.turnaroundTime}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-xl text-white">{srv.title}</h3>
                  <p className="text-slate-300 text-sm">{srv.description}</p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Starting From</div>
                    <div className="font-heading font-black text-2xl text-purple-300">{srv.startingPrice}</div>
                  </div>

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-5 rounded-xl bg-purple-500 text-white font-heading font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-500/20 hover:bg-purple-400 transition-all"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>BOOK SERVICE</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
