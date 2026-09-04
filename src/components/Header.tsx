'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  Layers, 
  Smartphone, 
  Wrench, 
  Repeat, 
  ShieldCheck, 
  Shield, 
  X, 
  Sparkles, 
  ChevronRight,
  User,
  SlidersHorizontal,
  Clock,
  Trash2
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useCompareStore } from '@/store/useCompareStore';
import { useProductStore } from '@/store/useProductStore';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'iPhone 15 Pro',
    'Galaxy S24',
    'Pre-Owned Grade A',
    'MagSafe'
  ]);

  const { toggleCart, getItemCount } = useCartStore();
  const wishlistItems = useWishlistStore((state) => state.items);
  const compareItems = useCompareStore((state) => state.items);
  const { openCompareModal } = useCompareStore();
  const { searchQuery, setSearchQuery, products } = useProductStore();

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (!recentSearches.includes(searchQuery.trim())) {
      setRecentSearches([searchQuery.trim(), ...recentSearches.slice(0, 4)]);
    }

    router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
  };

  const handleSelectRecentSearch = (term: string) => {
    setSearchQuery(term);
    router.push(`/shop?q=${encodeURIComponent(term)}`);
    setSearchOpen(false);
  };

  const removeRecentSearch = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches(recentSearches.filter((s) => s !== term));
  };

  const filteredSuggestions = searchQuery.trim()
    ? products.filter(
        (p) =>
          p.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop All' },
    { href: '/pre-owned', label: 'Certified Pre-Owned', badge: '8-Point Check' },
    { href: '/trade-in', label: 'Instant Trade-In', badge: 'Get Credit' },
    { href: '/repair', label: 'Repair & Care' },
    { href: '/contact', label: 'Store Locator' },
  ];

  const cartCount = getItemCount();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-blue-900/60 via-slate-900 to-cyan-900/60 text-xs py-1.5 px-4 text-center text-slate-300 flex items-center justify-center gap-2 border-b border-blue-500/20">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
        <span>⚡ <strong>LIVE REALTIME INVENTORY SYNC ACTIVE</strong> — Verified 12-Month Warranty on all Certified Pre-Owned devices!</span>
        <Link href="/pre-owned" className="underline font-semibold text-cyan-400 hover:text-cyan-300 ml-1 hidden sm:inline">
          Explore Inspection Process →
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-emerald-400 p-0.5 shadow-glow group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold font-display tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                ARONA <span className="text-blue-500">MOBILES</span>
              </span>
              <span className="block text-[10px] text-slate-400 tracking-wider font-mono">
                SMARTER. BOLDER. CONNECTED.
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 font-medium text-sm">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'text-cyan-400 bg-blue-500/10 border border-blue-500/20 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {link.label}
                  {link.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action Icons Right */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-cyan-400 transition-all flex items-center gap-2 group"
              title="Search devices..."
            >
              <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-xs text-slate-400 hidden xl:inline">Search phones & specs...</span>
              <kbd className="hidden xl:inline text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Compare Dock Trigger */}
            <button
              onClick={openCompareModal}
              className="relative p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-cyan-400 transition-all"
              title="Compare Devices"
            >
              <Layers className="w-4 h-4" />
              {compareItems.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-bold flex items-center justify-center shadow-cyan-glow">
                  {compareItems.length}
                </span>
              )}
            </button>

            {/* Wishlist Link */}
            <Link
              href="/account?tab=wishlist"
              className="relative p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-pink-400 transition-all"
              title="Saved Items"
            >
              <Heart className="w-4 h-4" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart Drawer Trigger */}
            <button
              onClick={toggleCart}
              className="relative px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-glow transition-all flex items-center gap-2 group"
            >
              <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Cart</span>
              <span className="w-5 h-5 rounded-full bg-slate-950 text-cyan-400 text-[10px] font-bold flex items-center justify-center border border-cyan-500/40">
                {cartCount}
              </span>
            </button>

            {/* Admin Dashboard Portal Link */}
            <Link
              href="/admin"
              className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-400 hover:bg-amber-500/10 transition-all hidden sm:flex items-center gap-1.5 text-xs font-mono"
              title="Admin Portal"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-slate-800 lg:hidden text-slate-300 hover:text-white"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950/95 border-b border-slate-800 px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center justify-between"
            >
              <span>{link.label}</span>
              {link.badge && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2.5 rounded-lg text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 font-mono"
          >
            🛡️ Admin Management Dashboard
          </Link>
        </div>
      )}

      {/* Search Modal Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-start justify-center pt-16 px-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center border-b border-slate-800 px-4 py-3.5">
              <Search className="w-5 h-5 text-slate-400 mr-3" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search models (e.g., iPhone 15 Pro, S24 Ultra, Pre-Owned)..."
                className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none text-base font-sans"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} className="p-1 text-slate-400 hover:text-white mr-2">
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
              >
                ESC
              </button>
            </form>

            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4">
              
              {/* Autocomplete Suggestions */}
              {searchQuery.trim() && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                    Product Matches ({filteredSuggestions.length})
                  </h4>
                  {filteredSuggestions.length > 0 ? (
                    <div className="space-y-1">
                      {filteredSuggestions.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            router.push(`/product/${item.id}`);
                            setSearchOpen(false);
                          }}
                          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 cursor-pointer group transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <img src={item.images[0]} alt={item.model} className="w-10 h-10 object-cover rounded-lg bg-slate-800" />
                            <div>
                              <div className="text-sm font-semibold text-white group-hover:text-cyan-400">
                                {item.brand} {item.model}
                              </div>
                              <div className="text-xs text-slate-400">
                                {item.condition === 'preowned' ? `Pre-Owned (${item.gradeIfPreowned})` : 'Brand New'} • {item.specs.display.split(',')[0]}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold font-mono text-cyan-400">${item.price}</div>
                            <span className="text-[10px] text-slate-500">View Specs →</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-slate-500 py-4 text-center">
                      No exact phone models found for "{searchQuery}". Press Enter to view all search results.
                    </div>
                  )}
                </div>
              )}

              {/* Recent Searches */}
              {recentSearches.length > 0 && !searchQuery && (
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                    <span>Recent Searches</span>
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <div
                        key={term}
                        onClick={() => handleSelectRecentSearch(term)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-xs text-slate-300 flex items-center gap-2 cursor-pointer hover:border-cyan-500/40"
                      >
                        <span>{term}</span>
                        <X
                          className="w-3 h-3 text-slate-500 hover:text-rose-400"
                          onClick={(e) => removeRecentSearch(term, e)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Categories */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                  Quick Navigation
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/pre-owned"
                    onClick={() => setSearchOpen(false)}
                    className="p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 flex items-center justify-between text-xs text-slate-200"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                      Certified Pre-Owned
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </Link>
                  <Link
                    href="/trade-in"
                    onClick={() => setSearchOpen(false)}
                    className="p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 flex items-center justify-between text-xs text-slate-200"
                  >
                    <span className="flex items-center gap-2">
                      <Repeat className="w-4 h-4 text-emerald-400" />
                      Instant Trade-In Calculator
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
