
import React, { useState, useEffect, useMemo } from 'react';
import { Continent } from '../types';
import { 
  BarChart3, Database, Map, PieChart, Users, Award, Ticket, 
  Coins, Crown, Star, Sparkles, Flag, Globe, Mail, 
  ShieldCheck, LayoutGrid, CheckCircle2, RotateCcw, 
  User, Zap, TrendingUp, MessageCircle, Loader2
} from 'lucide-react';
import { getChloeInsight } from '../services/geminiService';

interface StatsSectionProps {
  stats: Record<string, number>;
  categoryStats: { scratch: number; lottery: number };
  countryStats: Record<string, number>;
  stateStats: Record<string, number>;
  collectorStats: Record<string, number>;
  totalRecords: number;
  t: any;
  currentUser?: string | null;
}

export const StatsSection: React.FC<StatsSectionProps> = ({ stats, categoryStats, countryStats, stateStats, collectorStats, totalRecords, t, currentUser }) => {
  const [animate, setAnimate] = useState(false);
  const [chloeMessage, setChloeMessage] = useState<string | null>(null);
  const [isAskingChloe, setIsAskingChloe] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 150);
    return () => clearTimeout(timer);
  }, []);
  
  const maxCount = useMemo(() => {
    const vals = Object.values(stats) as number[];
    return vals.length > 0 ? Math.max(...vals) : 1;
  }, [stats]);

  const { scratchPct, lotteryPct } = useMemo(() => {
    const total = totalRecords || 1;
    return {
      scratchPct: (categoryStats.scratch / total) * 100,
      lotteryPct: (categoryStats.lottery / total) * 100
    };
  }, [categoryStats, totalRecords]);

  const handleAskChloe = async () => {
    setIsAskingChloe(true);
    try {
      const msg = await getChloeInsight({ total: totalRecords, stats, countryStats, categoryStats });
      setChloeMessage(msg);
    } catch (err) {
      setChloeMessage("Vovô, os registos estão tão bons que até me faltam as palavras azul e brancas! hihi!");
    } finally {
      setIsAskingChloe(false);
    }
  };

  const continentsConfig: { key: Continent; label: string; color: string; gradient: string }[] = [
    { key: 'Europa', label: 'Europa', color: 'bg-brand-500', gradient: 'from-brand-500 to-brand-600' },
    { key: 'América', label: 'América', color: 'bg-slate-500', gradient: 'from-slate-500 to-slate-700' },
    { key: 'Ásia', label: 'Ásia', color: 'bg-cyan-500', gradient: 'from-cyan-400 to-cyan-600' },
    { key: 'África', label: 'África', color: 'bg-indigo-500', gradient: 'from-indigo-500 to-indigo-700' },
    { key: 'Oceania', label: 'Oceania', color: 'bg-blue-400', gradient: 'from-blue-400 to-blue-600' },
  ];

  const stateDonutData = useMemo(() => {
    const vals = Object.values(stateStats) as number[];
    const total = vals.reduce((a: number, b: number) => a + b, 0) || 1;
    
    const countMint = Number(stateStats['MINT']) || 0;
    const countSC = Number(stateStats['SC']) || 0;
    const countCS = Number(stateStats['CS']) || 0;
    
    const amostraKeys = ['AMOSTRA', 'MUESTRA', 'CAMPIONE', 'SPECIMEN', 'VOID', 'MUSTER', 'ÉCHANTILLON', '样本', 'SAMPLE', 'PRØVE'];
    const countAmostra = amostraKeys.reduce((sum, key) => sum + (Number(stateStats[key]) || 0), 0);
    
    const pMint = (countMint / total) * 100;
    const pSC = (countSC / total) * 100;
    const pCS = (countCS / total) * 100;
    const pAmostra = 100 - (pMint + pSC + pCS);

    return {
      pMint, pSC, pCS, pAmostra,
      stop1: pMint,
      stop2: pMint + pSC,
      stop3: pMint + pSC + pCS,
      total
    };
  }, [stateStats]);

  const isChloe = currentUser?.toUpperCase() === 'CHLOE';

  return (
    <div className="w-full bg-[#020617] py-12 pb-32 animate-fade-in relative">
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-brand-600/10 via-transparent to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Collector Welcome Card Blue Porto */}
        <div className="mb-12 bg-slate-900/40 border border-brand-500/20 rounded-[2.5rem] p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 shadow-2xl backdrop-blur-sm overflow-hidden group relative">
           <div className="relative">
              <div className={`w-24 h-24 rounded-3xl flex items-center justify-center border-2 rotate-3 group-hover:rotate-0 transition-all duration-500 bg-brand-500/10 border-brand-500 shadow-[0_0_30px_rgba(0,168,255,0.3)]`}>
                 {isChloe ? <Sparkles className="w-10 h-10 text-white" /> : <User className="w-10 h-10 text-white" />}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-brand-400 w-6 h-6 rounded-full border-4 border-[#020617] animate-pulse"></div>
           </div>
           <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                 <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
                   {isChloe ? 'Bem-vinda, Guardiã Chloe 🐉' : `Painel do Dragão, ${currentUser || 'Curador'}`}
                 </h2>
                 <Crown className={`w-6 h-6 text-brand-400`} />
              </div>
              <p className="text-slate-400 text-sm font-black leading-relaxed max-w-xl uppercase tracking-widest">
                 O estádio mundial de raspadinhas tem <span className="text-white font-black">{totalRecords} tesouros</span> em campo. Somos Porto!
              </p>
           </div>
           <div className="flex flex-col gap-2">
              <button 
                onClick={handleAskChloe}
                disabled={isAskingChloe}
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(0,168,255,0.4)] transition-all active:scale-95 disabled:opacity-50"
              >
                {isAskingChloe ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                O que a Chloe acha? hihi!
              </button>
           </div>
        </div>

        {/* Chloe's Insight Card Neon Blue */}
        {chloeMessage && (
          <div className="mb-12 bg-gradient-to-br from-brand-600/20 via-slate-900 to-brand-500/10 border border-brand-500/30 rounded-[2.5rem] p-8 md:p-10 shadow-2xl animate-bounce-in relative overflow-hidden">
             <div className="absolute -top-10 -right-10 opacity-10 rotate-12">
                <Sparkles className="w-40 h-40 text-brand-400" />
             </div>
             <div className="flex items-start gap-6 relative z-10">
                <div className="bg-brand-500 p-3 rounded-2xl shadow-lg">
                   <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="space-y-4">
                   <h4 className="text-[10px] font-black text-brand-400 uppercase tracking-[0.4em]">Análise da Guardiã Azul e Branca</h4>
                   <p className="text-lg md:text-xl text-slate-100 font-black italic leading-relaxed uppercase tracking-tighter">
                      "{chloeMessage}"
                   </p>
                   <button onClick={() => setChloeMessage(null)} className="text-[10px] font-black text-brand-500 uppercase hover:text-white transition-colors">Fechar Parecer do Dragão</button>
                </div>
             </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
           <div>
              <div className="flex items-center gap-2 text-brand-500 mb-2">
                <BarChart3 className="w-6 h-6" />
                <h2 className="text-sm font-black uppercase tracking-[0.3em]">{t.title}</h2>
              </div>
              <h3 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter">Arquivo na Invicta</h3>
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-2 ml-1">Volume total em tons de azul</p>
           </div>
           <div className="flex items-center gap-2 bg-slate-900 border border-brand-500/20 rounded-full px-5 py-2.5 backdrop-blur-md">
              <div className="w-2.5 h-2.5 rounded-full bg-brand-400 animate-pulse shadow-[0_0_8px_rgba(0,168,255,0.6)]"></div>
              <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest">Sincronizado</span>
           </div>
        </div>

        {/* Top Cards Porto Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
           <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl group hover:border-brand-500 transition-all shadow-2xl">
              <div className="p-3 bg-brand-500/10 w-fit rounded-2xl text-brand-500 mb-6 group-hover:scale-110 transition-transform">
                 <Database className="w-6 h-6" />
              </div>
              <div className="text-5xl font-black text-white mb-2 font-mono tracking-tighter">{totalRecords}</div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{t.totalRecords}</p>
           </div>

           <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl group hover:border-brand-400 transition-all shadow-2xl">
              <div className="p-3 bg-brand-400/10 w-fit rounded-2xl text-brand-400 mb-6 group-hover:scale-110 transition-transform">
                 <Globe className="w-6 h-6" />
              </div>
              <div className="text-5xl font-black text-white mb-2 font-mono tracking-tighter">{Object.keys(countryStats).length}</div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Países Aliados</p>
           </div>

           <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl group hover:border-brand-500 transition-all shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                 <Coins className="w-6 h-6 text-brand-500" />
                 <span className="text-[9px] font-black text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20 uppercase tracking-widest">RASP.</span>
              </div>
              <div className="text-4xl font-black text-white mb-4 tracking-tighter">{categoryStats.scratch}</div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500 transition-all duration-1000 shadow-[0_0_8px_rgba(0,168,255,0.6)]" style={{ width: `${animate ? scratchPct : 0}%` }}></div>
              </div>
           </div>

           <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl group hover:border-white transition-all shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                 <Ticket className="w-6 h-6 text-white" />
                 <span className="text-[9px] font-black text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 uppercase tracking-widest">LOT.</span>
              </div>
              <div className="text-4xl font-black text-white mb-4 tracking-tighter">{categoryStats.lottery}</div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-white transition-all duration-1000" style={{ width: `${animate ? lotteryPct : 0}%` }}></div>
              </div>
           </div>
        </div>

        {/* Main Grid Charts - Only Blue & White gradients */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden flex flex-col min-h-[450px]">
            <h3 className="text-sm font-black text-slate-400 mb-16 flex items-center gap-3 uppercase tracking-[0.2em]">
               <Globe className="w-5 h-5 text-brand-500" /> Distribuição por Continente
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
                        className={`w-full max-w-[50px] rounded-t-2xl bg-gradient-to-t ${c.gradient} transition-all duration-[1200ms] ease-out relative group-hover:scale-x-110 origin-bottom group-hover:shadow-[0_0_15px_rgba(0,168,255,0.4)]`}
                        style={{ height: `${height}%` }}
                    >
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <span className="mt-6 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">{c.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-8">
             <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
                <h3 className="text-[10px] font-black text-slate-400 mb-8 flex items-center gap-2 uppercase tracking-widest">
                   <PieChart className="w-4 h-4 text-brand-500" /> Estados da Coleção
                </h3>
                <div className="flex items-center justify-between gap-8">
                   <div 
                     className={`w-28 h-28 rounded-full relative flex items-center justify-center shrink-0 border-4 border-[#020617] shadow-2xl transition-transform duration-[2000ms] ${animate ? 'rotate-0' : 'rotate-180'}`}
                     style={{ 
                        background: `conic-gradient(
                           #00a8ff 0% ${stateDonutData.stop1}%, 
                           #004797 ${stateDonutData.stop1}% ${stateDonutData.stop2}%,
                           #ffffff ${stateDonutData.stop2}% ${stateDonutData.stop3}%,
                           #1e293b ${stateDonutData.stop3}% 100%
                        )` 
                     }}
                   >
                      <div className="w-16 h-16 bg-slate-950 rounded-full flex items-center justify-center border border-slate-800/50 shadow-inner">
                         <div className="flex flex-col items-center">
                            <span className="text-[16px] font-black text-white leading-none">{stateDonutData.total}</span>
                            <span className="text-[7px] font-black text-slate-600 uppercase">Itens</span>
                         </div>
                      </div>
                   </div>
                   <div className="flex-1 space-y-3">
                      {[
                        { label: 'MINT', color: 'bg-brand-500', pct: stateDonutData.pMint },
                        { label: 'SC', color: 'bg-brand-600', pct: stateDonutData.pSC },
                        { label: 'CS', color: 'bg-white', pct: stateDonutData.pCS },
                        { label: 'Outros', color: 'bg-slate-700', pct: stateDonutData.pAmostra }
                      ].map(item => (
                        <div key={item.label} className="flex items-center justify-between group">
                           <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${item.color} group-hover:scale-150 transition-transform shadow-[0_0_5px_rgba(0,168,255,0.4)]`}></div>
                              <span className="text-[10px] font-black text-slate-400 uppercase">{item.label}</span>
                           </div>
                           <span className="text-[10px] font-mono font-black text-slate-200">{Math.round(item.pct)}%</span>
                        </div>
                      ))}
                   </div>
                </div>
             </div>

             <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl flex-1">
                <h3 className="text-[10px] font-black text-slate-400 mb-8 flex items-center gap-2 uppercase tracking-widest">
                   <Flag className="w-4 h-4 text-brand-500" /> Nações Líderes
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
                              <span className="text-brand-500">{count}</span>
                           </div>
                           <div className="w-full h-1 bg-[#020617] rounded-full overflow-hidden">
                              <div className="h-full bg-brand-500 transition-all duration-1000 shadow-[0_0_5px_rgba(0,168,255,0.4)]" style={{ width: `${animate ? pct : 0}%` }}></div>
                           </div>
                        </div>
                      );
                    })}
                </div>
             </div>
          </div>
        </div>

        <div className="mt-24 pt-12 border-t border-slate-900 flex flex-col items-center justify-center opacity-30">
            <p className="text-brand-500 text-[9px] font-black uppercase tracking-[0.4em]">
              © {new Date().getFullYear()} • Arquivo Mundial de Raspadinhas • Somos Porto! 🐉
            </p>
        </div>
      </div>
    </div>
  );
};
