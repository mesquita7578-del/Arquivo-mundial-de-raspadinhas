
import React, { useState, useEffect } from 'react';
import { Continent } from '../types';
import { BarChart3, Database, Map, PieChart, Users, Award, Ticket, Coins, Crown, Star, Sparkles, Flag, Globe, Mail, ShieldCheck, LayoutGrid, CheckCircle2 } from 'lucide-react';

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
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  // Continent Bar Chart Data
  const maxCount = Math.max(...(Object.values(stats) as number[]), 1);
  const continentsConfig: { key: Continent; label: string; color: string; gradient: string }[] = [
    { key: 'Europa', label: 'Europa', color: 'bg-blue-500', gradient: 'from-blue-500 to-indigo-600' },
    { key: 'América', label: 'América', color: 'bg-red-500', gradient: 'from-red-500 to-pink-600' },
    { key: 'Ásia', label: 'Ásia', color: 'bg-yellow-500', gradient: 'from-yellow-400 to-orange-500' },
    { key: 'África', label: 'África', color: 'bg-green-500', gradient: 'from-green-500 to-emerald-600' },
    { key: 'Oceania', label: 'Oceania', color: 'bg-purple-500', gradient: 'from-purple-500 to-violet-600' },
  ];

  // Top Countries Data
  const topCountries = Object.entries(countryStats)
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    .slice(0, 5);
  const maxCountryCount = topCountries.length > 0 ? Number(topCountries[0][1]) : 1;

  // Collector Leaderboard Logic
  const guardians = Object.entries(collectorStats)
    .sort((a, b) => Number(b[1]) - Number(a[1]));

  const getCollectorBadge = (name: string) => {
     const lower = name.toLowerCase();
     if (lower.includes('jorge')) return { color: 'bg-blue-500', text: 'JM', icon: <Crown className="w-3 h-3 text-yellow-400 fill-yellow-400" /> };
     if (lower.includes('fabio') || lower.includes('fábio')) return { color: 'bg-green-500', text: 'FP', icon: <Star className="w-3 h-3 text-white fill-white" /> };
     if (lower.includes('chloe')) return { color: 'bg-pink-500', text: 'CH', icon: <Crown className="w-3 h-3 text-pink-200 fill-pink-200" /> };
     if (lower.includes('pedro') || lower.includes('rodrigo')) return { color: 'bg-orange-500', text: 'PR', icon: <ShieldCheck className="w-3 h-3 text-white fill-white" /> };
     if (lower.includes('ia') || lower.includes('system') || lower.includes('guardiã')) return { color: 'bg-purple-600', text: 'IA', icon: <Sparkles className="w-3 h-3 text-cyan-300 fill-cyan-300" /> };
     return { color: 'bg-slate-600', text: name.substring(0, 2).toUpperCase(), icon: null };
  };

  // State Distribution Data (Donut)
  const totalStateCount = (Object.values(stateStats) as number[]).reduce((a, b) => a + b, 0);
  
  const countMint = Number(stateStats['MINT']) || 0;
  const countSC = Number(stateStats['SC']) || 0;
  const countCS = Number(stateStats['CS']) || 0;
  const amostraKeys = [
    'AMOSTRA', 'MUESTRA', 'CAMPIONE', 'SPECIMEN', 'VOID', 
    'MUSTER', 'ÉCHANTILLON', '견본', 'STEEKPROEF', 'PRØVE', 
    'PROV', '样本'
  ];
  const countAmostra = amostraKeys.reduce((sum, key) => sum + (Number(stateStats[key]) || 0), 0);

  const pctMint = totalStateCount > 0 ? (countMint / totalStateCount) * 100 : 0;
  const pctSC = totalStateCount > 0 ? (countSC / totalStateCount) * 100 : 0;
  const pctCS = totalStateCount > 0 ? (countCS / totalStateCount) * 100 : 0;
  const pctAmostra = totalStateCount > 0 ? (countAmostra / totalStateCount) * 100 : 0;

  const stopMint = pctMint;
  const stopSC = stopMint + pctSC;
  const stopCS = stopSC + pctCS;

  const safeTotal = totalRecords || 1;
  const scratchCount = categoryStats.scratch || 0;
  const lotteryCount = categoryStats.lottery || 0;
  const scratchPct = (scratchCount / safeTotal) * 100;
  const lotteryPct = (lotteryCount / safeTotal) * 100;

  return (
    <div className="w-full bg-slate-950 border-t border-slate-900 py-12 pb-32 animate-fade-in relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-brand-900/10 to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
           <div>
              <div className="flex items-center gap-2 text-brand-500 mb-2">
                <BarChart3 className="w-6 h-6" />
                <h2 className="text-sm font-bold uppercase tracking-widest">{t.title}</h2>
              </div>
              <h3 className="text-3xl md:text-4xl font-black text-white italic">Dashboard do Colecionador</h3>
           </div>
           <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-full px-4 py-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.liveUpdate}</span>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
           
           <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-brand-500/30 transition-colors">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-brand-500/10 rounded-full blur-2xl group-hover:bg-brand-500/20 transition-colors"></div>
              <div className="flex justify-between items-start mb-4">
                 <div className="p-3 bg-brand-500/10 rounded-xl text-brand-500">
                    <Database className="w-6 h-6" />
                 </div>
              </div>
              <div className="text-4xl font-black text-white mb-1 font-mono tracking-tight">{totalRecords}</div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{t.totalRecords}</p>
           </div>

           <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-blue-500/30 transition-colors">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors"></div>
              <div className="flex justify-between items-start mb-4">
                 <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                    <Map className="w-6 h-6" />
                 </div>
              </div>
              <div className="text-4xl font-black text-white mb-1 font-mono tracking-tight">{Object.keys(countryStats).length}</div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Países Representados</p>
           </div>

           {/* Gráfico 1: Raspadinhas */}
           <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-brand-500/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                 <div className="p-2.5 bg-brand-500/10 rounded-xl text-brand-500">
                    <Coins className="w-6 h-6" />
                 </div>
                 <span className="text-[10px] font-black text-brand-400 bg-brand-900/20 px-2 py-0.5 rounded-full border border-brand-500/30 uppercase">Raspadinhas</span>
              </div>
              <div className="flex items-baseline gap-2 mb-4">
                <div className="text-4xl font-black text-white font-mono tracking-tighter">{scratchCount}</div>
                <div className="text-xs font-bold text-slate-500">{Math.round(scratchPct)}% do arquivo</div>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                <div 
                  className="h-full bg-gradient-to-r from-brand-600 to-brand-400 shadow-[0_0_15px_rgba(244,63,94,0.4)] transition-all duration-1000 ease-out" 
                  style={{ width: `${animate ? scratchPct : 0}%` }}
                ></div>
              </div>
           </div>

           {/* Gráfico 2: Lotarias */}
           <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-purple-500/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                 <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400">
                    <Ticket className="w-6 h-6" />
                 </div>
                 <span className="text-[10px] font-black text-purple-400 bg-purple-900/20 px-2 py-0.5 rounded-full border border-purple-500/30 uppercase">Lotarias</span>
              </div>
              <div className="flex items-baseline gap-2 mb-4">
                <div className="text-4xl font-black text-white font-mono tracking-tighter">{lotteryCount}</div>
                <div className="text-xs font-bold text-slate-500">{Math.round(lotteryPct)}% do arquivo</div>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                <div 
                  className="h-full bg-gradient-to-r from-purple-600 to-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all duration-1000 ease-out" 
                  style={{ width: `${animate ? lotteryPct : 0}%` }}
                ></div>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <h3 className="text-lg font-bold text-white mb-12 flex items-center gap-2">
               <Globe className="w-5 h-5 text-slate-400" />
               Itens por Continente
            </h3>
            
            <div className="flex items-end justify-around h-64 gap-2 md:gap-6 relative z-10 px-2 md:px-8">
              {continentsConfig.map((c) => {
                const count = Number(stats[c.key as string]) || 0;
                const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                const height = animate ? Math.max(percentage, 5) : 5;
                
                return (
                  <div key={c.key} className="flex flex-col items-center flex-1 group h-full justify-end">
                    <div 
                        className={`mb-3 bg-slate-800 text-white text-xs md:text-sm font-bold py-1 px-2 md:px-3 rounded-lg border border-slate-700 shadow-xl transition-all duration-700 transform ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                        style={{ transitionDelay: '300ms' }}
                    >
                        {count}
                    </div>
                    <div className="w-full max-w-[60px] relative flex flex-col justify-end group-hover:scale-105 transition-transform duration-300">
                        <div 
                            className={`w-full rounded-t-xl bg-gradient-to-t ${c.gradient} shadow-[0_0_20px_rgba(0,0,0,0.3)] transition-all duration-[1500ms] cubic-bezier(0.34, 1.56, 0.64, 1) relative overflow-hidden`}
                            style={{ height: `${height}%` }}
                        >
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent translate-y-full group-hover:-translate-y-full transition-transform duration-1000"></div>
                        </div>
                        <div 
                            className={`w-full h-4 bg-gradient-to-b ${c.gradient} opacity-20 blur-md rounded-b-xl transform scale-y-[-0.5]`}
                            style={{ display: count > 0 ? 'block' : 'none' }}
                        ></div>
                    </div>
                    <span className="mt-4 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider text-center">{c.label}</span>
                  </div>
                );
              })}
            </div>
            <div className="absolute inset-0 px-8 py-20 pointer-events-none flex flex-col justify-between opacity-10">
               <div className="w-full h-px bg-white"></div>
               <div className="w-full h-px bg-white"></div>
               <div className="w-full h-px bg-white"></div>
               <div className="w-full h-px bg-white"></div>
               <div className="w-full h-px bg-white"></div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
             <div className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/50 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                   <Users className="w-32 h-32 text-white" />
                </div>
                <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-wider relative z-10">
                   <Award className="w-4 h-4 text-yellow-500" />
                   Guardiões do Arquivo
                </h3>
                <div className="space-y-4 relative z-10">
                   {guardians.length > 0 ? guardians.map(([name, count], index) => {
                      const badge = getCollectorBadge(name);
                      const percentage = (Number(count) / totalRecords) * 100;
                      return (
                         <div key={name} className="group">
                            <div className="flex items-center justify-between mb-2">
                               <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full ${badge.color} flex items-center justify-center text-xs font-bold text-white shadow-lg border border-white/10`}>
                                     {badge.icon ? badge.icon : badge.text}
                                  </div>
                                  <div>
                                     <div className="text-xs font-bold text-white flex items-center gap-1">
                                        {name}
                                        {index === 0 && <Crown className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                                     </div>
                                     <div className="text-[10px] text-slate-400 font-mono">{count} registos</div>
                                  </div>
                               </div>
                               <span className="text-xs font-bold text-slate-500">{Math.round(percentage)}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                               <div 
                                  className={`h-full rounded-full ${badge.color.replace('bg-', 'bg-gradient-to-r from-').replace('500', '400')} to-white/50 transition-all duration-1000`} 
                                  style={{ width: `${animate ? percentage : 0}%` }}
                               ></div>
                            </div>
                         </div>
                      );
                   }) : (
                      <div className="text-center py-4 text-xs text-slate-500 italic">Nenhum guardião detetado ancora.</div>
                   )}
                </div>
             </div>

             <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-wider">
                   <Flag className="w-4 h-4 text-blue-500" />
                   Top 5 Países
                </h3>
                <div className="space-y-5">
                   {topCountries.map(([country, count], index) => (
                      <div key={country} className="relative">
                         <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5 z-10 relative">
                            <span className="flex items-center gap-2">
                               <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${index === 0 ? 'bg-yellow-500 text-black' : index === 1 ? 'bg-slate-400 text-black' : index === 2 ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                  {index + 1}
                               </span>
                               {country}
                            </span>
                            <span className="font-mono">{count}</span>
                         </div>
                         <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                               className={`h-full rounded-full ${index === 0 ? 'bg-yellow-500' : 'bg-slate-600'} transition-all duration-1000`} 
                               style={{ width: `${animate ? (Number(count) / maxCountryCount) * 100 : 0}%` }}
                            ></div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>

             <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-center relative overflow-hidden">
                <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-wider">
                   <PieChart className="w-4 h-4 text-brand-500" />
                   Estado
                </h3>
                <div className="flex items-center justify-between gap-4">
                   <div 
                     className="w-24 h-24 rounded-full relative flex items-center justify-center shrink-0"
                     style={{ 
                        background: `conic-gradient(
                           #22c55e 0% ${stopMint}%, 
                           #3b82f6 ${stopMint}% ${stopSC}%,
                           #f59e0b ${stopSC}% ${stopCS}%,
                           #ec4899 ${stopCS}% 100%
                        )` 
                     }}
                   >
                      <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800">
                         <span className="text-[10px] font-bold text-slate-500 italic">Estado</span>
                      </div>
                   </div>
                   <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between text-[10px]">
                         <span className="flex items-center gap-2 text-slate-300"><span className="w-2 h-2 rounded-full bg-green-500"></span> MINT</span>
                         <span className="font-mono text-white font-bold">{Math.round(pctMint)}%</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                         <span className="flex items-center gap-2 text-slate-300"><span className="w-2 h-2 rounded-full bg-blue-500"></span> SC</span>
                         <span className="font-mono text-white font-bold">{Math.round(pctSC)}%</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                         <span className="flex items-center gap-2 text-slate-300"><span className="w-2 h-2 rounded-full bg-orange-500"></span> CS</span>
                         <span className="font-mono text-white font-bold">{Math.round(pctCS)}%</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                         <span className="flex items-center gap-2 text-slate-300"><span className="w-2 h-2 rounded-full bg-pink-500"></span> Outros</span>
                         <span className="font-mono text-white font-bold">{Math.round(pctAmostra)}%</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div className="mt-24 pt-8 border-t border-slate-900 flex flex-col items-center justify-center text-center space-y-3 opacity-50 hover:opacity-100 transition-opacity duration-500">
            <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em]">
              © {new Date().getFullYear()} • Arquivo Mundial
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2 items-center">
              <a href="mailto:mesquita757@hotmail.com" className="flex items-center gap-2 text-slate-600 hover:text-white text-xs transition-colors">
                 <Mail className="w-3.5 h-3.5" /> Jorge Mesquita
              </a>
              <span className="hidden sm:inline text-slate-700">|</span>
              <a href="mailto:fabio.pagni@libero.it" className="flex items-center gap-2 text-slate-600 hover:text-white text-xs transition-colors">
                 <Mail className="w-3.5 h-3.5" /> Fabio Pagni
              </a>
            </div>
        </div>
      </div>
    </div>
  );
};
