import React, { useState, useEffect } from 'react';
import { ShieldCheck, Smartphone, BatteryCharging, Wrench, Clock, MessageSquare } from 'lucide-react';
import { getStoredServices } from '../data/masterStore';
import { getWhatsAppUrl } from '../config/business';
import { ServiceItem } from '../types';

export const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>(getStoredServices);

  useEffect(() => {
    const handleUpdate = () => setServices(getStoredServices());
    window.addEventListener('arona_services_updated', handleUpdate);
    window.addEventListener('arona_master_data_updated', handleUpdate);
    return () => {
      window.removeEventListener('arona_services_updated', handleUpdate);
      window.removeEventListener('arona_master_data_updated', handleUpdate);
    };
  }, []);

  return (
    <div className="pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      <div className="text-left space-y-2 border-b border-slate-200 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-mono font-bold uppercase">
          <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
          <span>ARONA CARE REPAIR SERVICES</span>
        </div>
        <h1 className="font-heading font-black text-4xl sm:text-5xl text-slate-900">
          MOBILE REPAIR & CARE
        </h1>
        <p className="text-slate-600 text-sm max-w-2xl">
          Express display replacement, original battery installation, water damage chip repair, and software support.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
        {services.map(srv => {
          const waUrl = getWhatsAppUrl(`Hi ARONA MOBILES, I need assistance with ${srv.title}. Please provide diagnostic appointment.`);

          return (
            <div key={srv.id} className="clean-card p-8 rounded-3xl space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    {srv.iconName === 'Smartphone' && <Smartphone className="w-6 h-6" />}
                    {srv.iconName === 'BatteryCharging' && <BatteryCharging className="w-6 h-6" />}
                    {srv.iconName === 'Wrench' && <Wrench className="w-6 h-6" />}
                    {srv.iconName === 'ShieldCheck' && <ShieldCheck className="w-6 h-6" />}
                  </div>

                  <span className="text-xs font-mono text-purple-800 bg-purple-50 px-3 py-1 rounded-full border border-purple-200 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-purple-600" /> {srv.turnaroundTime}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-xl text-slate-900">{srv.title}</h3>
                <p className="text-slate-600 text-sm">{srv.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-slate-500 uppercase">Starting From</div>
                  <div className="font-heading font-black text-2xl text-slate-900">{srv.startingPrice}</div>
                </div>

                <a
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-5 rounded-xl bg-purple-600 text-white font-heading font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-purple-700 transition-all shadow-sm"
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
  );
};
