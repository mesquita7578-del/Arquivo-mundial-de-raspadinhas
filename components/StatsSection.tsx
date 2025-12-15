import React, { useMemo, useState, useEffect } from 'react';
import { Continent } from '../types';
import { BarChart3, Database, Globe, Mail, Ticket, Coins } from 'lucide-react';

interface StatsSectionProps {
  stats: Record<string, number>;
  categoryStats: { scratch: number; lottery: number };
  totalRecords: number;
  t: any;
}

export const StatsSection: React.FC<StatsSectionProps> = ({ stats, categoryStats, totalRecords, t }) => {
  const [animate, setAnimate] = useState(false);

  // Trigger animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  // Find the max value to calculate bar height percentage relative to the highest bar
  const maxCount = Math.max(...(Object.values(stats) as number[]), 1); // Avoid division by zero

  const continentsConfig: { key: Continent; label: string; color: string }[] = [
    { key: 'Europa', label: 'Eur', color: 'bg-blue-500' },
    { key: 'América', label: 'Ame', color: 'bg-red-500' },
    { key: 'Ásia', label: 'Asi', color: 'bg-yellow-500' },
    { key: 'África', label: 'Afr', color: 'bg-green-500' },
    { key: 'Oceania', label: 'Oce', color: 'bg-purple-500' },
  ];

  // Calculate percentages for the category bar
  const totalCats = categoryStats.scratch + categoryStats.lottery;
  // If no records, show neutral 50/50 split
  const scratchPct = totalCats > 0 ? Math.round((categoryStats.scratch / totalCats) * 100) : 50;
  const lotteryPct = totalCats > 0 ? 100 - scratchPct : 50;

  return (
    <div className="w-full bg-slate-900/50 border-t border-slate-800 py-12 mt-12 pb-20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="flex items-center gap-2 mb-8 text-brand-400">
          <BarChart3 className="w-6 h-6" />
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">{t.title}</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Bar Chart (2/3 width) */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Globe className="w-32 h-32 text-slate-500" />
            </div>
            
            <h3 className="text-sm font-bold text-slate-400 uppercase mb-6">{t.distribution}</h3>
            
            <div className="flex items-end justify-between h-48 gap-4 px-2">
              {continentsConfig.map((c) => {
                const count = stats[c.key as string] || 0;
                // Calculate height percentage (min 10% to show bar exists)
                const targetHeight = count === 0 ? 5 : (count / maxCount) * 100;
                const currentHeight = animate ? targetHeight : 5; // Start at 5% then grow
                
                return (
                  <div key={c.key} className="flex flex-col items-center flex-1 group">
                    <div className="relative w-full flex items-end justify-center h-full">
                      <div 
                        className={`w-full max-w-[60px] rounded-t-lg transition-all duration-[1500ms] cubic-bezier(0.4, 0, 0.2, 1) relative group-hover:brightness-110 shadow-lg shadow-black/50 ${c.color}`}
                        style={{ height: `${currentHeight}%`, opacity: 0.9 }}
                      >
                         {/* Count tooltip - visible on hover or if it fits */}
                         <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-white font-bold text-lg opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md">
                           {count}
                         </div>
                      </div>
                    </div>
                    <div className="mt-3 text-center z-10">
                      <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">{c.label}</span>
                      <span className="block text-xs text-slate-500 font-mono mt-1 opacity-100 group-hover:text-white transition-colors">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Total Card (1/3 width) */}
          <div className="bg-gradient-to-br from-brand-900 to-slate-900 border border-brand-800 rounded-2xl p-8 flex flex-col justify-between items-center shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-brand-500/20 blur-[60px] rounded-full"></div>
            
            <div className="flex flex-col items-center relative z-10">
                <Database className="w-10 h-10 text-brand-400 mb-2 group-hover:scale-110 transition-transform duration-500" />
                <h3 className="text-slate-300 font-medium uppercase tracking-widest text-xs mb-1 text-center">{t.totalRecords}</h3>
                <div className="text-5xl sm:text-6xl font-black text-white font-mono tracking-tighter drop-shadow-xl mb-4">
                  {totalRecords}
                </div>
            </div>

            {/* Category Breakdown */}
            <div className="w-full bg-slate-900/50 rounded-xl p-3 border border-slate-700/50 backdrop-blur-sm relative z-10">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2 uppercase">
                   <span className="flex items-center gap-1 text-brand-400"><Coins className="w-3 h-3" /> Rasp.</span>
                   <span className="flex items-center gap-1 text-purple-400">Lotaria <Ticket className="w-3 h-3" /></span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex mb-2">
                    <div className="h-full bg-brand-500 transition-all duration-1000" style={{ width: `${scratchPct}%` }}></div>
                    <div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: `${lotteryPct}%` }}></div>
                </div>

                <div className="flex items-center justify-between font-mono text-sm text-white">
                   <span>{categoryStats.scratch}</span>
                   <span className="text-slate-500 text-[10px]">vs</span>
                   <span>{categoryStats.lottery}</span>
                </div>
            </div>
            
            <div className="mt-4 px-4 py-1 bg-brand-500/20 border border-brand-500/30 rounded-full text-brand-300 text-[10px] font-bold animate-pulse-slow flex items-center gap-2 z-10">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-ping"></span>
              {t.liveUpdate}
            </div>
          </div>

        </div>

        {/* FOOTER / SIGNATURE */}
        <div className="mt-24 pt-8 border-t border-slate-800/50 flex flex-col items-center justify-center text-center space-y-3 opacity-70 hover:opacity-100 transition-opacity duration-500">
            <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em]">
              © Copyright {new Date().getFullYear()} • Arquivo Mundial
            </p>
            
            <h4 className="text-slate-300 font-bold text-sm md:text-base flex items-center gap-1.5">
              Jorge Mesquita & Fabio Pagni <span className="text-[10px] text-slate-500 align-top -mt-2">®</span>
            </h4>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2 items-center">
              <a 
                href="mailto:mesquita757@hotmail.com" 
                className="flex items-center gap-2 text-brand-500 hover:text-brand-400 text-xs transition-colors bg-brand-900/10 px-4 py-1.5 rounded-full border border-brand-500/20 hover:border-brand-500/50"
              >
                 <Mail className="w-3.5 h-3.5" />
                 mesquita757@hotmail.com
              </a>
              <a 
                href="mailto:fabio.pagni@libero.it" 
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-xs transition-colors bg-blue-900/10 px-4 py-1.5 rounded-full border border-blue-500/20 hover:border-blue-500/50"
              >
                 <Mail className="w-3.5 h-3.5" />
                 fabio.pagni@libero.it
              </a>
            </div>
        </div>

      </div>
    </div>
  );
};