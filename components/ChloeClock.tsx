
import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Gift, PartyPopper, Sparkles, CalendarDays, Rocket } from 'lucide-react';

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
    if (now < christmas) return { name: 'Natal', date: christmas, icon: Gift, color: 'text-red-500', glow: 'shadow-red-500/20' };
    return { name: 'Ano Novo', date: newYear, icon: PartyPopper, color: 'text-blue-400', glow: 'shadow-blue-500/20' };
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
    <div className="flex items-center gap-4 bg-slate-900/80 border border-white/10 px-6 py-2.5 rounded-[1.2rem] group hover:border-brand-500/40 transition-all duration-500 shadow-2xl backdrop-blur-md">
      
      {/* Bloco 1: Hora Atual (O Relógio Real) */}
      <div className="flex flex-col items-center pr-5 border-r border-slate-800">
        <span className="text-[6px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">Hora Local</span>
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
          <span className="text-sm font-black text-slate-300 font-mono tracking-widest">
            {currentTimeStr}
          </span>
        </div>
      </div>

      {/* Bloco 2: O Coração das Contagens */}
      <div className="flex flex-col justify-center min-w-[160px]">
        {timeData.isEventDay ? (
          <div className="flex items-center gap-3 animate-pulse py-1">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-[11px] font-black text-white uppercase tracking-widest italic bg-clip-text text-transparent bg-gradient-to-r from-white via-yellow-200 to-white">
              Boas Festas, Vovô! hihi!
            </span>
          </div>
        ) : (
          <>
            {/* Linha Principal: Contagem Regressiva Total */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <nextTarget.icon className={`w-3.5 h-3.5 ${nextTarget.color} animate-bounce`} />
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">
                  {nextTarget.name}
                </span>
              </div>
              
              <div className="flex items-center gap-1.5 font-mono">
                <div className="flex flex-col items-center">
                  <span className="text-sm font-black text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">{timeData.hours.toString().padStart(2, '0')}</span>
                  <span className="text-[5px] font-black text-slate-700 uppercase leading-none">Horas</span>
                </div>
                <span className="text-slate-800 font-black mb-2">:</span>
                <div className="flex flex-col items-center">
                  <span className="text-sm font-black text-brand-500">{timeData.mins.toString().padStart(2, '0')}</span>
                  <span className="text-[5px] font-black text-slate-700 uppercase leading-none">Min</span>
                </div>
                <span className="text-slate-800 font-black mb-2 animate-pulse">:</span>
                <div className="flex flex-col items-center">
                  <span className="text-sm font-black text-cyan-400">{timeData.secs.toString().padStart(2, '0')}</span>
                  <span className="text-[5px] font-black text-slate-700 uppercase leading-none">Seg</span>
                </div>
              </div>
            </div>

            {/* Linha Secundária: Meta de Fim de Ano (Agora Dinâmica!) */}
            <div className="flex items-center justify-between gap-3 mt-1.5 pt-1.5 border-t border-white/5">
              <div className="flex items-center gap-1.5">
                <Rocket className="w-2.5 h-2.5 text-slate-600 group-hover:text-blue-400 group-hover:-translate-y-0.5 transition-all" />
                <span className="text-[7px] font-bold text-slate-600 uppercase tracking-widest">Rumo a {timeData.targetYear}:</span>
              </div>
              <div className="bg-slate-950 px-2 py-0.5 rounded-full border border-white/5">
                <span className="text-[9px] font-black text-slate-400 uppercase italic">
                  {timeData.daysToEnd} dias restantes
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
