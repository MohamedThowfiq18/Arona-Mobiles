import React from 'react';
import { MessageSquare } from 'lucide-react';
import { getWhatsAppUrl } from '../config/business';

export const WhatsAppFloatingButton: React.FC = () => {
  const waUrl = getWhatsAppUrl("Hi ARONA MOBILES, I am browsing your website and would like to chat with a store representative.");

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-40 p-3.5 sm:p-4 rounded-full bg-emerald-500 text-white shadow-2xl shadow-emerald-500/50 hover:scale-110 hover:bg-emerald-400 transition-all duration-300 flex items-center gap-2 font-heading font-bold text-xs uppercase tracking-wider group"
      aria-label="Chat on WhatsApp"
    >
      <MessageSquare className="w-6 h-6 animate-pulse" />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap">
        Chat on WhatsApp
      </span>
    </a>
  );
};
