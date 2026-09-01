import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Smartphone, Search, MessageSquare, Menu, X, ShieldCheck, RefreshCw, Sparkles, UserCheck } from 'lucide-react';
import { BUSINESS_CONFIG, getWhatsAppUrl } from '../config/business';

interface NavbarProps {
  onSearchOpen: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearchOpen }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const generalWhatsAppUrl = getWhatsAppUrl("Hi ARONA MOBILES, I am visiting your official website and would like to inquire about phone models and best prices.");

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200 py-3.5 shadow-sm' : 'bg-white py-5 border-b border-slate-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3.5 group text-left">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-600 p-[1px] shadow-md shadow-blue-500/30 group-hover:scale-105 transition-transform flex-shrink-0">
            <div className="w-full h-full bg-blue-600 rounded-[11px] flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <div className="font-heading font-black text-2xl sm:text-3xl tracking-tight text-slate-900 flex items-center gap-1.5 leading-none">
              ARONA <span className="text-blue-600 font-extrabold">MOBILES</span>
            </div>
            <div className="text-[11px] tracking-widest text-slate-500 uppercase font-mono font-bold mt-1">
              SMARTER. BOLDER.
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-full border border-slate-200">
          <NavLink 
            to="/" 
            end
            className={({ isActive }) => `px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
              isActive ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Home
          </NavLink>

          <NavLink 
            to="/new-mobiles" 
            className={({ isActive }) => `px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all flex items-center gap-1 ${
              isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            New Mobiles
          </NavLink>

          <NavLink 
            to="/pre-owned" 
            className={({ isActive }) => `px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all flex items-center gap-1 ${
              isActive ? 'bg-purple-600 text-white shadow-sm' : 'text-purple-700 hover:text-purple-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
            Pre-Owned
          </NavLink>

          <NavLink 
            to="/exchange" 
            className={({ isActive }) => `px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all flex items-center gap-1 ${
              isActive ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
            Exchange
          </NavLink>

          <NavLink 
            to="/accessories" 
            className={({ isActive }) => `px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
              isActive ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Accessories
          </NavLink>

          <NavLink 
            to="/services" 
            className={({ isActive }) => `px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
              isActive ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Care & Repair
          </NavLink>

          <NavLink 
            to="/store" 
            className={({ isActive }) => `px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
              isActive ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Store
          </NavLink>
        </nav>

        {/* Right CTA Actions (Desktop) */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-100 border border-slate-200 text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-all text-xs font-semibold"
            title="Owner Management Portal"
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Owner Portal</span>
          </Link>

          <button 
            onClick={onSearchOpen}
            className="p-2.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200 transition-all"
            aria-label="Search mobiles"
          >
            <Search className="w-4 h-4" />
          </button>

          <a 
            href={generalWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition-all text-xs font-bold tracking-wider uppercase shadow-md shadow-emerald-600/20"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp Us</span>
          </a>
        </div>

        {/* Mobile & Tablet Hamburger Menu Toggle */}
        <div className="flex lg:hidden items-center gap-2">
          <button 
            onClick={onSearchOpen}
            className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-700"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-700"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[65px] bg-white border-b border-slate-200 p-6 shadow-xl flex flex-col gap-2 animate-in fade-in duration-200 text-left">
          <Link 
            to="/" 
            onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-3 rounded-xl bg-slate-50 font-heading font-bold text-slate-900"
          >
            Home
          </Link>
          
          <Link 
            to="/new-mobiles" 
            onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-3 rounded-xl bg-blue-50 text-blue-900 font-heading font-bold flex items-center justify-between"
          >
            <span>Brand New Mobiles</span>
            <Sparkles className="w-4 h-4 text-blue-600" />
          </Link>

          <Link 
            to="/pre-owned" 
            onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-3 rounded-xl bg-purple-50 text-purple-900 font-heading font-bold flex items-center justify-between"
          >
            <span>Certified Pre-Owned Mobiles</span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </Link>

          <Link 
            to="/exchange" 
            onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-3 rounded-xl bg-emerald-50 text-emerald-900 font-heading font-bold flex items-center justify-between"
          >
            <span>Exchange & Trade-In</span>
            <RefreshCw className="w-4 h-4 text-emerald-600" />
          </Link>

          <Link 
            to="/accessories" 
            onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-3 rounded-xl bg-slate-50 text-slate-800 font-heading font-semibold"
          >
            Mobile Accessories
          </Link>

          <Link 
            to="/services" 
            onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-3 rounded-xl bg-slate-50 text-slate-800 font-heading font-semibold"
          >
            Arona Care Repair & Services
          </Link>

          <Link 
            to="/store" 
            onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-3 rounded-xl bg-slate-50 text-slate-800 font-heading font-semibold"
          >
            Store Address & Hours
          </Link>

          <Link 
            to="/admin" 
            onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-3 rounded-xl bg-slate-900 text-white font-heading font-bold flex items-center justify-between"
          >
            <span>🔐 Owner Portal (Upload Mobiles)</span>
            <UserCheck className="w-4 h-4 text-blue-400" />
          </Link>

          <a 
            href={generalWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 py-3.5 rounded-xl bg-emerald-600 text-white font-heading font-bold text-center flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
          >
            <MessageSquare className="w-5 h-5" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      )}
    </header>
  );
};
