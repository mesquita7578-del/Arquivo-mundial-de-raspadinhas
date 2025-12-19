
import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Gift, PartyPopper, Sparkles, Rocket } from 'lucide-react';

export const ChloeClock: React.FC = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Hora Atual formatada
  const currentTimeStr = now.toLocaleTimeString('pt-PT', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });

  const year = now.getFullYear();
  const christmas = new Date(year, 11, 25, 0, 0, 0);
  const newYear = new Date(year + 1, 0, 1, 0, 0, 0);

  // Lógica para o Próximo Evento (Natal ou Ano Novo)
  const nextTarget = useMemo(() => {
    if (now < christmas) return { name: 'Natal', date: christmas, icon: Gift, color: 'text-red-500' };
    return { name: 'Ano Novo', date: newYear, icon: PartyPopper, color: 'text-blue-400' };
  }, [now, christmas, newYear]);

  // Cálculos de Tempo
  const timeData = useMemo(() => {
    const diffNext = nextTarget.date.getTime() - now.getTime();
    const diffYearEnd = newYear.getTime() - now.getTime();

    const totalHoursNext = Math.floor(diffNext / (1000 * 60 * 60));
    const minsNext = Math.floor((diffNext / (1000 * 60)) % 60);
    const secsNext = Math.floor((diffNext / 1000) % 60);

    const daysToYearEnd = Math.floor(diffYearEnd / (1000 * 60 * 60 * 24));

    return {
      hours: totalHoursNext,
      mins: minsNext,
      secs: secsNext,
      daysToEnd: daysToYearEnd,
      targetYear: newYear.getFullYear(),
      isEventDay: (now.getMonth() === 11 && now.getDate() === 25) || (now.getMonth() === 0 && now.getDate() === 1)
    };
  }, [now, nextTarget, newYear]);

  return (
    <div className="flex items-center bg-slate-900/40 border border-white/5 px-6 py-2 rounded-full group hover:border-brand-500/20 transition-all duration-700 backdrop-blur-sm">
      
      {/* 1. HORA LOCAL */}
      <div className="flex items-center gap-2.5 pr-4 border-r border-white/5">
        <Clock className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
        <span className="text-[11px] font-black text-slate-300 font-mono tracking-widest">
          {currentTimeStr}
        </span>
      </div>

      {/* 2. CONTAGEM EVENTO (LINHA ÚNICA) */}
      <div className="flex items-center gap-4 px-4 border-r border-white/5 min-w-[140px]">
        {timeData.isEventDay ? (
          <div className="flex items-center gap-2 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-[9px] font-black text-white uppercase tracking-widest italic">Festas Felizes!</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
               <nextTarget.icon className={`w-3.5 h-3.5 ${nextTarget.color} animate-bounce`} />
               <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">{nextTarget.name}</span>
            </div>
            
            <div className="flex items-center gap-1 font-mono">
              <span className="text-xs font-black text-white">{timeData.hours.toString().padStart(2, '0')}</span>
              <span className="text-[10px] text-slate-700 font-black">:</span>
              <span className="text-xs font-black text-brand-500">{timeData.mins.toString().padStart(2, '0')}</span>
              <span className="text-[10px] text-slate-700 font-black animate-pulse">:</span>
              <span className="text-xs font-black text-cyan-400">{timeData.secs.toString().padStart(2, '0')}</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. META FINAL DE ANO */}
      <div className="flex items-center gap-3 pl-4">
        <Rocket className="w-3 h-3 text-slate-600 group-hover:text-blue-400 transition-all" />
        <div className="flex items-center gap-1.5">
           <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">{timeData.targetYear}:</span>
           <span className="text-[10px] font-black text-slate-400 uppercase italic">
             {timeData.daysToEnd}d restantes
           </span>
        </div>
      </div>
      
    </div>
  );
};
