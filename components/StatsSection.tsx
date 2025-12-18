
import React, { useState, useEffect, useMemo } from 'react';
import { Continent } from '../types';
import { BarChart3, Database, Map, PieChart, Users, Award, Ticket, Coins, Crown, Star, Sparkles, Flag, Globe, Mail, ShieldCheck, LayoutGrid, CheckCircle2, RotateCcw } from 'lucide-react';

interface StatsSectionProps {
  stats: Record<string, number>;
  categoryStats: { scratch: number; lottery: number };
  countryStats: Record<string, number>;
  stateStats: Record<string, number>;
  collectorStats: Record<string, number>;
  totalRecords: number;
  t: any;
}

export const StatsSection: React.FC<StatsSectionProps> = ({ stats, categoryStats, countryStats, stateStats, collectorStats, totalRecords, t }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 150);
    return () => clearTimeout(timer);
  }, []);
  
  // Continent Bar Chart Data
  const maxCount = useMemo(() => {
    const vals = Object.values(stats) as number[];
    return vals.length > 0 ? Math.max(...vals) : 1;
  }, [stats]);

  const continentsConfig: { key: Continent; label: string; color: string; gradient: string }[] = [
    { key: 'Europa', label: 'Europa', color: 'bg-blue-500', gradient: 'from-blue-500 to-indigo-600' },
    { key: 'América', label: 'América', color: 'bg-red-500', gradient: 'from-red-500 to-pink-600' },
    { key: 'Ásia', label: 'Ásia', color: 'bg-yellow-500', gradient: 'from-yellow-400 to-orange-500' },
    { key: 'África', label: 'África', color: 'bg-green-500', gradient: 'from-green-500 to-emerald-600' },
    { key: 'Oceania', label: 'Oceania', color: 'bg-purple-500', gradient: 'from-purple-500 to-violet-600' },
  ];

  // Donut Chart Logic - Refined for "Circulation"
  const stateDonutData = useMemo(() => {
    // Fix: Explicitly cast Object.values to number[] to ensure type safety in division operations
    const vals = Object.values(stateStats) as number[];
    const total = vals.reduce((a: number, b: number) => a + b, 0) || 1;
    
    const countMint = Number(stateStats['MINT']) || 0;
    const countSC = Number(stateStats['SC']) || 0;
    const countCS = Number(stateStats['CS']) || 0;
    
    const amostraKeys = ['AMOSTRA', 'MUESTRA', 'CAMPIONE', 'SPECIMEN', 'VOID', 'MUSTER', 'ÉCHANTILLON', '样本', 'SAMPLE', 'PRØVE'];
    const countAmostra = amostraKeys.reduce((sum, key) => sum + (Number(stateStats[key]) || 0), 0);
    
    // Fix: Arithmetic operations now have typed operands through inferred and explicit number types
    const pMint = (countMint / total) * 100;
    const pSC = (countSC / total) * 100;
    const pCS = (countCS / total) * 100;
    const pAmostra = 100 - (pMint + pSC + pCS); // Garante 100% total matemático

    return {
      pMint, pSC, pCS, pAmostra,
      stop1: pMint,
      stop2: pMint + pSC,
      stop3: pMint + pSC + pCS,
      total
    };
  }, [stateStats]);

  const getCollectorBadge = (name: string) => {
     const lower = name.toLowerCase().trim();
     if (lower.includes('jorge') || lower === 'j' || lower === 'jj') {
       return { color: 'bg-blue-600', text: 'JM', icon: <Crown className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /> };
     }
     if (lower.includes('fabio') || lower.includes('fábio')) {
       return { color: 'bg-green-600', text: 'FP', icon: <Star className="w-3.5 h-3.5 text-white fill-white" /> };
     }
     if (lower.includes('chloe')) {
       return { color: 'bg-pink-600', text: 'CH', icon: <Crown className="w-3.5 h-3.5 text-pink-200 fill-pink-200" /> };
     }
     return { color: 'bg-slate-700', text: name.substring(0, 2).toUpperCase(), icon: null };
  };

  const safeTotal = totalRecords || 1;
  const scratchPct = ((categoryStats.scratch || 0) / safeTotal) * 100;
  const lotteryPct = ((categoryStats.lottery || 0) / safeTotal) * 100;

  return (
    <div className="flex-1 w-full bg-slate-950 border-t border-slate-900 py-12 pb-32 animate-fade-in relative overflow-y-auto custom-scrollbar">
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-blue-900/5 via-transparent to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
           <div>
              <div className="flex items-center gap-2 text-brand-500 mb-2">
                <BarChart3 className="w-6 h-6" />
                <h2 className="text-sm font-black uppercase tracking-[0.3em]">{t.title}</h2>
              </div>
              <h3 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter">Fluxo do Arquivo</h3>
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-2 ml-1">Análise volumétrica global em tempo real</p>
           </div>
           <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-full px-5 py-2.5 backdrop-blur-md">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sincronizado</span>
           </div>
        </div>

        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
           <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl group hover:border-brand-500/40 transition-all shadow-2xl">
              <div className="p-3 bg-brand-500/10 w-fit rounded-2xl text-brand-500 mb-6 group-hover:scale-110 transition-transform">
                 <Database className="w-6 h-6" />
              </div>
              <div className="text-5xl font-black text-white mb-2 font-mono tracking-tighter">{totalRecords}</div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{t.totalRecords}</p>
           </div>

           <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl group hover:border-blue-500/40 transition-all shadow-2xl">
              <div className="p-3 bg-blue-500/10 w-fit rounded-2xl text-blue-500 mb-6 group-hover:scale-110 transition-transform">
                 <Map className="w-6 h-6" />
              </div>
              <div className="text-5xl font-black text-white mb-2 font-mono tracking-tighter">{Object.keys(countryStats).length}</div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Nações Unidas</p>
           </div>

           <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl group hover:border-brand-500/40 transition-all shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                 <Coins className="w-6 h-6 text-brand-500" />
                 <span className="text-[9px] font-black text-brand-400 bg-brand-900/30 px-2 py-0.5 rounded border border-brand-500/20">RASP.</span>
              </div>
              <div className="text-4xl font-black text-white mb-4 tracking-tighter">{categoryStats.scratch}</div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500 transition-all duration-1000" style={{ width: `${animate ? scratchPct : 0}%` }}></div>
              </div>
           </div>

           <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl group hover:border-purple-500/40 transition-all shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                 <Ticket className="w-6 h-6 text-purple-500" />
                 <span className="text-[9px] font-black text-purple-400 bg-purple-900/30 px-2 py-0.5 rounded border border-purple-500/20">LOT.</span>
              </div>
              <div className="text-4xl font-black text-white mb-4 tracking-tighter">{categoryStats.lottery}</div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: `${animate ? lotteryPct : 0}%` }}></div>
              </div>
           </div>
        </div>

        {/* Main Grid Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Continents Bar Chart */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-[2rem] p-10 shadow-2xl relative overflow-hidden flex flex-col min-h-[450px]">
            <h3 className="text-sm font-black text-slate-400 mb-16 flex items-center gap-3 uppercase tracking-[0.2em]">
               <Globe className="w-5 h-5" /> Distribuição Continental
            </h3>
            
            <div className="flex-1 flex items-end justify-around gap-2 md:gap-8 relative z-10">
              {continentsConfig.map((c) => {
                const count = Number(stats[c.key as string]) || 0;
                const percentage = (count / maxCount) * 100;
                const height = animate ? Math.max(percentage, 5) : 2;
                
                return (
                  <div key={c.key} className="flex flex-col items-center flex-1 h-full justify-end group">
                    <div className={`mb-4 bg-slate-800 text-white text-[10px] font-black py-1.5 px-3 rounded-lg border border-slate-700 shadow-2xl transition-all duration-700 ${animate ? 'opacity-100' : 'opacity-0 translate-y-2'}`}>
                        {count}
                    </div>
                    <div 
                        className={`w-full max-w-[50px] rounded-t-2xl bg-gradient-to-t ${c.gradient} transition-all duration-[1200ms] ease-out relative group-hover:scale-x-110 origin-bottom`}
                        style={{ height: `${height}%` }}
                    >
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <span className="mt-6 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">{c.label}</span>
                  </div>
                );
              })}
            </div>
            {/* Grid Lines Overlay */}
            <div className="absolute inset-0 px-10 py-24 pointer-events-none flex flex-col justify-between opacity-[0.03]">
               <div className="w-full h-px bg-white"></div>
               <div className="w-full h-px bg-white"></div>
               <div className="w-full h-px bg-white"></div>
               <div className="w-full h-px bg-white"></div>
            </div>
          </div>

          <div className="flex flex-col gap-8">
             {/* Donut Chart - The "Circulation" Fix */}
             <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 shadow-2xl">
                <h3 className="text-[10px] font-black text-slate-400 mb-8 flex items-center gap-2 uppercase tracking-widest">
                   <PieChart className="w-4 h-4 text-brand-500" /> Estados Físicos
                </h3>
                <div className="flex items-center justify-between gap-8">
                   <div 
                     className={`w-28 h-28 rounded-full relative flex items-center justify-center shrink-0 border-4 border-slate-950 shadow-2xl transition-transform duration-[2000ms] ${animate ? 'rotate-0' : 'rotate-180'}`}
                     style={{ 
                        background: `conic-gradient(
                           #22c55e 0% ${stateDonutData.stop1}%, 
                           #3b82f6 ${stateDonutData.stop1}% ${stateDonutData.stop2}%,
                           #f59e0b ${stateDonutData.stop2}% ${stateDonutData.stop3}%,
                           #ec4899 ${stateDonutData.stop3}% 100%
                        )` 
                     }}
                   >
                      <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800/50 shadow-inner">
                         <div className="flex flex-col items-center">
                            <span className="text-[16px] font-black text-white leading-none">{stateDonutData.total}</span>
                            <span className="text-[7px] font-black text-slate-600 uppercase">Total</span>
                         </div>
                      </div>
                   </div>
                   <div className="flex-1 space-y-3">
                      {[
                        { label: 'MINT', color: 'bg-green-500', pct: stateDonutData.pMint },
                        { label: 'SC', color: 'bg-blue-500', pct: stateDonutData.pSC },
                        { label: 'CS', color: 'bg-orange-500', pct: stateDonutData.pCS },
                        { label: 'Outros', color: 'bg-pink-500', pct: stateDonutData.pAmostra }
                      ].map(item => (
                        <div key={item.label} className="flex items-center justify-between group">
                           <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${item.color} group-hover:scale-125 transition-transform`}></div>
                              <span className="text-[10px] font-black text-slate-400 uppercase">{item.label}</span>
                           </div>
                           <span className="text-[10px] font-mono font-black text-slate-200">{Math.round(item.pct)}%</span>
                        </div>
                      ))}
                   </div>
                </div>
             </div>

             {/* Top Countries */}
             <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 shadow-2xl flex-1">
                <h3 className="text-[10px] font-black text-slate-400 mb-8 flex items-center gap-2 uppercase tracking-widest">
                   <Flag className="w-4 h-4 text-blue-500" /> Principais Nações
                </h3>
                <div className="space-y-5">
                   {Object.entries(countryStats)
                    .sort((a, b) => Number(b[1]) - Number(a[1]))
                    .slice(0, 5)
                    .map(([country, count], i) => {
                      const maxC = Math.max(...(Object.values(countryStats) as number[]), 1);
                      const pct = (Number(count) / maxC) * 100;
                      return (
                        <div key={country} className="space-y-2">
                           <div className="flex justify-between text-[10px] font-black text-slate-300 uppercase tracking-tighter">
                              <span>{i + 1}. {country}</span>
                              <span className="text-blue-500">{count}</span>
                           </div>
                           <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${animate ? pct : 0}%` }}></div>
                           </div>
                        </div>
                      );
                    })}
                </div>
             </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-24 pt-12 border-t border-slate-900 flex flex-col items-center justify-center opacity-30">
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.4em]">
              © {new Date().getFullYear()} • Arquivo Mundial de Raspadinhas
            </p>
        </div>
      </div>
    </div>
  );
};
