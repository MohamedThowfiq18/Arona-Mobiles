import React, { useState, useEffect } from 'react';
import { RotateCw, Sparkles, ShieldCheck, Zap, Camera, Layers, CheckCircle2 } from 'lucide-react';

interface AngleSpec {
  angle: number;
  label: string;
  image: string;
  badge: string;
  highlight: string;
}

const ANGLES: AngleSpec[] = [
  {
    angle: 0,
    label: 'Front Display (0°)',
    image: '/iphone17_front.jpg',
    badge: '6.9" Super Retina XDR OLED',
    highlight: 'Bezel-less ProMotion 120Hz'
  },
  {
    angle: 45,
    label: '3D Angle (45°)',
    image: '/iphone17_angle45.jpg',
    badge: 'Cosmic Titanium Orange',
    highlight: 'Aerospace Titanium Frame'
  },
  {
    angle: 90,
    label: 'Side Profile (90°)',
    image: '/iphone17_side.jpg',
    badge: 'Action Button & Camera Control',
    highlight: 'Ultra-slim 8.2mm Profile'
  },
  {
    angle: 180,
    label: 'Back 3D Camera (180°)',
    image: '/iphone17_back.jpg',
    badge: '48MP ProFusion Triple Lens',
    highlight: '5x Optical Telephoto Zoom'
  }
];

export const Phone360Viewer: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(1); // Default to 45° angle view
  const [isAutoSpinning, setIsAutoSpinning] = useState(false);
  const [activeColor, setActiveColor] = useState('Cosmic Orange');

  // Auto-spin interval
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAutoSpinning) {
      timer = setInterval(() => {
        setCurrentIdx(prev => (prev + 1) % ANGLES.length);
      }, 1500);
    }
    return () => clearInterval(timer);
  }, [isAutoSpinning]);

  const currentAngle = ANGLES[currentIdx];

  return (
    <div className="relative w-full max-w-md bg-slate-900/90 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-2xl space-y-4 mobile-3d-card text-left">
      
      {/* Top Floating Badge Bar */}
      <div className="flex items-center justify-between z-10">
        <span className="px-3.5 py-1.5 rounded-full bg-orange-500/25 border border-orange-400/40 text-orange-200 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
          <Sparkles className="w-4 h-4 text-orange-400" />
          iPhone 17 Pro Max 3D
        </span>

        {/* 360 Auto Spin Button */}
        <button
          onClick={() => setIsAutoSpinning(!isAutoSpinning)}
          className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md ${
            isAutoSpinning 
              ? 'bg-orange-500 text-white shadow-orange-500/40 animate-pulse' 
              : 'bg-slate-800 text-slate-300 border border-slate-700 hover:text-white'
          }`}
        >
          <RotateCw className={`w-3.5 h-3.5 ${isAutoSpinning ? 'animate-spin' : ''}`} />
          <span>{isAutoSpinning ? '360° Live Spinning' : '360° Spin Mode'}</span>
        </button>
      </div>

      {/* Main 3D Live Phone Stage */}
      <div className="relative my-auto py-2 flex flex-col items-center justify-center min-h-[340px]">
        
        {/* Glow Backlight */}
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-600/30 via-amber-500/20 to-purple-600/20 rounded-full blur-3xl scale-95 pointer-events-none" />

        {/* Live Phone Picture */}
        <div className="relative w-full h-[320px] flex items-center justify-center transition-all duration-700">
          <img 
            src={currentAngle.image} 
            alt={currentAngle.label} 
            className="max-h-full max-w-full object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.85)] rounded-2xl transform hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Interactive Floating Hotspot Chip */}
        <div className="absolute top-4 left-2 bg-slate-950/90 border border-orange-500/40 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-xl text-left flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-orange-400 flex-shrink-0" />
          <div>
            <div className="text-[9px] text-slate-400 font-mono uppercase">Apple Reference Angle</div>
            <div className="text-xs font-bold text-orange-300">{currentAngle.badge}</div>
          </div>
        </div>

      </div>

      {/* Apple.com Style 360 Angle Selector Bar */}
      <div className="space-y-2 border-t border-white/10 pt-3">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>SELECT 360° ANGLE:</span>
          <span className="text-orange-400 font-bold">{currentAngle.label}</span>
        </div>

        <div className="grid grid-cols-4 gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
          {ANGLES.map((ang, idx) => (
            <button
              key={ang.angle}
              onClick={() => {
                setIsAutoSpinning(false);
                setCurrentIdx(idx);
              }}
              className={`py-1.5 rounded-xl text-[10px] font-mono font-bold transition-all ${
                currentIdx === idx
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30 scale-105'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {ang.angle === 0 ? 'Front' : ang.angle === 45 ? '3D 45°' : ang.angle === 90 ? 'Side' : 'Back'}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Specs Summary */}
      <div className="bg-slate-950/90 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 space-y-1.5 text-left">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-[10px] font-mono text-orange-400 uppercase font-semibold">IPHONE 17 PRO MAX</div>
            <div className="font-heading font-extrabold text-base text-white">Cosmic Orange Titanium</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400 line-through">₹ 1,44,900</div>
            <div className="font-heading font-extrabold text-emerald-400 text-lg">₹ 1,34,900</div>
          </div>
        </div>
        <div className="text-xs text-slate-300 flex items-center justify-between border-t border-white/10 pt-2 font-mono">
          <span className="text-slate-300">{currentAngle.highlight}</span>
          <span className="text-orange-400 font-bold">5G Dual SIM</span>
        </div>
      </div>

    </div>
  );
};
