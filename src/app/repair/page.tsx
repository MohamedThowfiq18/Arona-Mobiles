'use client';

import React, { useState } from 'react';
import { 
  Wrench, 
  Smartphone, 
  Battery, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  Search, 
  CheckCircle2, 
  Zap, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useProductStore } from '@/store/useProductStore';

export default function RepairPage() {
  const addToast = useProductStore((state) => state.addToast);

  const [activeTab, setActiveTab] = useState<'book' | 'track'>('book');

  // Booking Form State
  const [selectedService, setSelectedService] = useState('Screen Replacement');
  const [brand, setBrand] = useState('Apple');
  const [model, setModel] = useState('iPhone 14 Pro');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('11:00 AM');
  const [bookedTicket, setBookedTicket] = useState<any>(null);

  // Tracker Search State
  const [trackTicketId, setTrackTicketId] = useState('');
  const [trackedStatus, setTrackedStatus] = useState<any>(null);

  const services = [
    {
      id: 'screen',
      title: 'Screen & OLED Replacement',
      icon: Smartphone,
      time: '30 - 45 Mins',
      price: '$129',
      desc: 'Genuine OEM OLED display replacement with 1-year touch calibration warranty.'
    },
    {
      id: 'battery',
      title: 'Battery Cell Replacement',
      icon: Battery,
      time: '20 Mins',
      price: '$69',
      desc: 'High capacity battery swap restoring 100% health & peak performance.'
    },
    {
      id: 'water',
      title: 'Water Damage Diagnostics',
      icon: Wrench,
      time: '60 Mins',
      price: '$89',
      desc: 'Ultrasonic board cleaning, moisture extraction, and micro-soldering inspection.'
    },
    {
      id: 'port',
      title: 'Charging Port Repair',
      icon: Zap,
      time: '25 Mins',
      price: '$59',
      desc: 'USB-C or Lightning port flex cable replacement for fast charging.'
    }
  ];

  const handleBookRepair = (e: React.FormEvent) => {
    e.preventDefault();
    const ticketId = `REP-${Math.floor(100000 + Math.random() * 900000)}`;

    const ticketData = {
      ticketId,
      customerName: name,
      email,
      phone,
      service: selectedService,
      device: `${brand} ${model}`,
      date: bookingDate || '2026-09-08',
      timeSlot,
      status: 'received',
      cost: selectedService === 'Screen Replacement' ? 129 : 69
    };

    setBookedTicket(ticketData);

    addToast({
      type: 'success',
      title: '🔧 Repair Appointment Confirmed!',
      description: `Ticket ${ticketId} created for ${bookingDate || 'upcoming date'} at ${timeSlot}.`
    });
  };

  const handleSearchTracker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackTicketId.trim()) return;

    // Simulate database lookup
    setTrackedStatus({
      ticketId: trackTicketId.toUpperCase(),
      device: 'iPhone 14 Pro',
      service: 'Screen Replacement',
      currentStage: 3, // 1: Received, 2: Diagnosing, 3: Repairing, 4: Quality Check, 5: Ready
      estimatedCompletion: 'Today at 3:30 PM',
      technician: 'Marcus V.'
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header Banner */}
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-mono font-bold border border-amber-500/30">
          <Wrench className="w-4 h-4 text-amber-400" />
          <span>EXPERT MOBILE REPAIR & CARE</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
          Same-Day Certified <span className="gradient-text-blue">Phone Repair</span>
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-sans leading-relaxed">
          Book online in 60 seconds. Genuine OEM parts, 12-month repair warranty, and express 45-minute turnaround at our Metro Plaza location.
        </p>

        {/* Tab Selector */}
        <div className="flex justify-center pt-2">
          <div className="p-1 bg-slate-900 rounded-2xl border border-slate-800 inline-flex text-xs font-mono">
            <button
              onClick={() => setActiveTab('book')}
              className={`px-5 py-2.5 rounded-xl font-bold transition-all ${
                activeTab === 'book' ? 'bg-cyan-500 text-slate-950 shadow-cyan-glow' : 'text-slate-400 hover:text-white'
              }`}
            >
              📅 Book Appointment
            </button>
            <button
              onClick={() => setActiveTab('track')}
              className={`px-5 py-2.5 rounded-xl font-bold transition-all ${
                activeTab === 'track' ? 'bg-cyan-500 text-slate-950 shadow-cyan-glow' : 'text-slate-400 hover:text-white'
              }`}
            >
              🔍 Track Live Repair Status
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'book' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Services List Column */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-base font-bold text-white font-display">Select Repair Service</h3>
            <div className="space-y-3">
              {services.map((srv) => {
                const Icon = srv.icon;
                const isSelected = selectedService === srv.title;
                return (
                  <div
                    key={srv.id}
                    onClick={() => setSelectedService(srv.title)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-400 shadow-cyan-glow'
                        : 'glass-card border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-slate-900 text-cyan-400 border border-slate-800">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">{srv.title}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">⏱️ {srv.time}</span>
                        </div>
                      </div>
                      <span className="text-sm font-bold font-mono text-cyan-400">{srv.price}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">{srv.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Booking Form Column */}
          <div className="lg:col-span-7">
            {bookedTicket ? (
              <div className="glass-panel p-8 rounded-3xl border border-emerald-500/40 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="text-xl font-bold text-white">Repair Scheduled!</h3>
                <p className="text-xs text-slate-300">
                  Your ticket <strong className="font-mono text-cyan-400">{bookedTicket.ticketId}</strong> is reserved for {bookedTicket.date} at {bookedTicket.timeSlot}.
                </p>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs space-y-1.5 font-mono">
                  <div>Device: {bookedTicket.device}</div>
                  <div>Service: {bookedTicket.service}</div>
                  <div>Customer: {bookedTicket.customerName}</div>
                  <div>Estimated Cost: ${bookedTicket.cost}</div>
                </div>
                <button
                  onClick={() => setBookedTicket(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-xs font-semibold text-white"
                >
                  Book Another Service
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookRepair} className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5">
                <h3 className="text-base font-bold text-white font-display">Schedule Date & Time</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Brand</label>
                    <select
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                    >
                      <option value="Apple">Apple</option>
                      <option value="Samsung">Samsung</option>
                      <option value="Google">Google</option>
                      <option value="OnePlus">OnePlus</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Model</label>
                    <input
                      type="text"
                      required
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="e.g. iPhone 14 Pro"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Appointment Date</label>
                    <input
                      type="date"
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Time Slot</label>
                    <select
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                    >
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:30 AM">11:30 AM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="04:30 PM">04:30 PM</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-xs shadow-glow"
                >
                  Book Appointment Now →
                </button>
              </form>
            )}
          </div>
        </div>
      ) : (
        /* Status Tracker Tab */
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-8 max-w-2xl mx-auto">
          <form onSubmit={handleSearchTracker} className="space-y-4">
            <h3 className="text-lg font-bold text-white font-display text-center">Track Your Device Repair</h3>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={trackTicketId}
                onChange={(e) => setTrackTicketId(e.target.value)}
                placeholder="Enter Ticket ID (e.g. REP-849201)..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500 uppercase font-mono"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-cyan-glow"
              >
                Track Status
              </button>
            </div>
          </form>

          {trackedStatus && (
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs">
                <div>
                  <span className="font-mono text-cyan-400 font-bold">{trackedStatus.ticketId}</span>
                  <div className="text-white font-bold mt-0.5">{trackedStatus.device} • {trackedStatus.service}</div>
                </div>
                <span className="text-[11px] font-mono text-emerald-400">Tech: {trackedStatus.technician}</span>
              </div>

              {/* 5-Stage Repair Progress Bar */}
              <div className="space-y-3">
                <div className="grid grid-cols-5 text-[10px] font-mono text-center gap-1">
                  <span className={trackedStatus.currentStage >= 1 ? 'text-cyan-400 font-bold' : 'text-slate-600'}>1. Received</span>
                  <span className={trackedStatus.currentStage >= 2 ? 'text-cyan-400 font-bold' : 'text-slate-600'}>2. Diagnosing</span>
                  <span className={trackedStatus.currentStage >= 3 ? 'text-cyan-400 font-bold' : 'text-slate-600'}>3. Repairing</span>
                  <span className={trackedStatus.currentStage >= 4 ? 'text-cyan-400 font-bold' : 'text-slate-600'}>4. QC Test</span>
                  <span className={trackedStatus.currentStage >= 5 ? 'text-emerald-400 font-bold' : 'text-slate-600'}>5. Ready</span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden flex">
                  <div className={`h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500`} style={{ width: `${(trackedStatus.currentStage / 5) * 100}%` }} />
                </div>
              </div>

              <div className="text-xs text-slate-400 text-center font-mono">
                Estimated completion: <strong className="text-white">{trackedStatus.estimatedCompletion}</strong>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
