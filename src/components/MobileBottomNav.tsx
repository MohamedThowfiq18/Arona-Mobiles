import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Sparkles, ShieldCheck, UserCheck, MapPin } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-1 py-2 shadow-2xl">
      <div className="flex items-center justify-around max-w-md mx-auto">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-all ${
              isActive ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-500 font-medium hover:text-slate-900'
            }`
          }
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Home</span>
        </NavLink>

        <NavLink
          to="/new-mobiles"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-all ${
              isActive ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-500 font-medium hover:text-slate-900'
            }`
          }
        >
          <Sparkles className="w-5 h-5 text-blue-600" />
          <span className="text-[10px] tracking-tight">New</span>
        </NavLink>

        <NavLink
          to="/pre-owned"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-all ${
              isActive ? 'text-purple-600 font-bold bg-purple-50' : 'text-slate-500 font-medium hover:text-slate-900'
            }`
          }
        >
          <ShieldCheck className="w-5 h-5 text-purple-600" />
          <span className="text-[10px] tracking-tight">Pre-Owned</span>
        </NavLink>

        <NavLink
          to="/store"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-all ${
              isActive ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-500 font-medium hover:text-slate-900'
            }`
          }
        >
          <MapPin className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Store</span>
        </NavLink>

        <NavLink
          to="/admin"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-all ${
              isActive ? 'text-blue-600 font-bold bg-blue-100' : 'text-slate-600 font-medium hover:text-slate-900'
            }`
          }
        >
          <UserCheck className="w-5 h-5 text-blue-600" />
          <span className="text-[10px] tracking-tight font-bold">Owner</span>
        </NavLink>
      </div>
    </div>
  );
};
