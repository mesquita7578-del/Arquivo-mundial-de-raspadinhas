
import React, { useState, useEffect, useMemo } from 'react';
import { Gift, PartyPopper, Sparkles } from 'lucide-react';

export const ChloeClock: React.FC = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const targets = useMemo(() => {
    const year = now.getFullYear();
    const christmas = new Date(year, 11, 25);
    const newYear = new Date(year + 1, 0, 1);
    
    if (now > christmas && now < new Date(year, 11, 26)) {
        return { name: 'Natal', date: christmas };
    }
    
    const nextEvent = now < christmas ? { name: 'Natal', date: christmas } : { name: 'Ano Novo', date: newYear };
    return { ...nextEvent };
  }, [now]);

  const timeLeft = useMemo(() => {
    const diff = targets.date.getTime() - now.getTime();
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };

    return {
      d: Math.floor(diff / (1000 * 60 * 60 * 24)),
      h: Math.floor((diff / (1000 * 60 * 60)) % 24),
      m: Math.floor((diff / (1000 * 60)) % 60),
      s: Math.floor((diff / 1000) % 60)
    };
  }, [now, targets]);

  return (
    <div className="flex items-center gap-4 bg-slate-900/50 border border-white/5 px-4 py-1.5 rounded-2xl group hover:border-brand-500/30 transition-all duration-500">
      <div className="flex items-center gap-2">
          {targets.name === 'Natal' ? (
              <Gift className="w-3.5 h-3.5 text-red-500 animate-bounce" />
          ) : (
              <PartyPopper className="w-3.5 h-3.5 text-blue-400 animate-spin-slow" />
          )}
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest hidden sm:inline">
              <span className="text-slate-300 italic">{targets.name}</span>:
          </span>
      </div>

      <div className="flex items-center gap-2 font-mono">
          <div className="flex items-baseline gap-0.5">
              <span className="text-xs font-black text-white">{timeLeft.d.toString().padStart(2, '0')}</span>
              <span className="text-[7px] text-slate-600 font-bold uppercase">d</span>
          </div>
          <span className="text-slate-800 font-black text-[10px]">:</span>
          <div className="flex items-baseline gap-0.5">
              <span className="text-xs font-black text-white">{timeLeft.h.toString().padStart(2, '0')}</span>
              <span className="text-[7px] text-slate-600 font-bold uppercase">h</span>
          </div>
          <span className="text-slate-800 font-black text-[10px]">:</span>
          <div className="flex items-baseline gap-0.5">
              <span className="text-xs font-black text-brand-500">{timeLeft.m.toString().padStart(2, '0')}</span>
              <span className="text-[7px] text-slate-600 font-bold uppercase">m</span>
          </div>
          <span className="text-slate-800 font-black text-[10px] animate-pulse">:</span>
          <div className="flex items-baseline gap-0.5">
              <span className="text-xs font-black text-cyan-400">{timeLeft.s.toString().padStart(2, '0')}</span>
              <span className="text-[7px] text-slate-600 font-bold uppercase">s</span>
          </div>
      </div>
    </div>
  );
};
