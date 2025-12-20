
import React, { useState, useEffect, useMemo } from 'react';
import { Continent, ScratchcardData } from '../types';
import { 
  BarChart3, Database, Map, PieChart, Users, Award, Ticket, 
  Coins, Crown, Star, Sparkles, Flag, Globe, Mail, 
  ShieldCheck, LayoutGrid, CheckCircle2, RotateCcw, 
  User, Zap, TrendingUp, MessageCircle, Loader2, Banknote
} from 'lucide-react';
import { getChloeInsight } from '../services/geminiService';

interface StatsSectionProps {
  images: ScratchcardData[];
  stats: Record<string, number>;
  categoryStats: { scratch: number; lottery: number };
  countryStats: Record<string, number>;
  stateStats: Record<string, number>;
  collectorStats: Record<string, number>;
  totalRecords: number;
  t: any;
  currentUser?: string | null;
}

export const StatsSection: React.FC<StatsSectionProps> = ({ images, stats, categoryStats, countryStats, stateStats, collectorStats, totalRecords, t, currentUser }) => {
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

  // Cálculo Refinado: APENAS itens MINT
  const mintSummary = useMemo(() => {
    let count = 0;
    const totalValue = images.reduce((acc, img) => {
      // Filtro rigoroso: Tem de ser MINT e ter preço definido
      if (img.state === 'MINT' && img.price) {
        // Limpar a string (remover símbolos de moeda e espaços, converter vírgulas em pontos)
        const cleanPrice = img.price.replace(/[^\d,.]/g, '').replace(',', '.');
        const val = parseFloat(cleanPrice);
        if (!isNaN(val)) {
          count++;
          return acc + val;
        }
      }
      return acc;
    }, 0);
    
    return { value: totalValue, count };
  }, [images]);

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
    const total = totalRecords || 1;
    
    const countMint = Number(stateStats['MINT']) || 0;
    const countSC = Number(stateStats['SC']) || 0;
    const countCS = Number(stateStats['CS']) || 0;
    
    const sampleKeys = ['AMOSTRA', 'VOID', 'SAMPLE', 'MUESTRA', 'CAMPIONE', '样本', 'MUSTER', 'PRØVE'];
    const countSamples = sampleKeys.reduce((acc, key) => acc + (Number(stateStats[key]) || 0), 0);
    
    const pMint = (countMint / total) * 100;
    const pSC = (countSC / total) * 100;
    const pCS = (countCS / total) * 100;
    const pSamples = (countSamples / total) * 100;

    return {
      pMint, pSC, pCS, pSamples,
      total
    };
  }, [stateStats, totalRecords]);

  const isChloe = currentUser?.toUpperCase() === 'CHLOE';

  return (
    <div className="w-full bg-[#020617] py-4 pb-20 animate-fade-in relative">
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        
        {/* Welcome Card */}
        <div className="mb-6 bg-slate-900/40 border border-brand-500/20 rounded-2xl p-4 flex items-center gap-4 shadow-xl backdrop-blur-sm">
           <div className={`w-12 h-12 rounded-xl flex items-center justify-center border bg-brand-500/10 border-brand-500 shadow-lg shrink-0`}>
              {isChloe ? <Sparkles className="w-6 h-6 text-white" /> : <User className="w-6 h-6 text-white" />}
           </div>
           <div className="flex-1">
              <h2 className="text-lg font-black text-white italic uppercase tracking-tighter leading-none">
                {isChloe ? 'Guardiã Chloe' : `Comandante ${currentUser || 'Curador'}`}
              </h2>
              <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mt-1">
                 {totalRecords} itens no arquivo hihi!
              </p>
           </div>
           <button 
             onClick={handleAskChloe}
             disabled={isAskingChloe}
             className="flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all active:scale-95"
           >
             {isAskingChloe ? <Loader2 className="w-3 h-3 animate-spin" /> : <MessageCircle className="w-3 h-3" />}
             Visão
           </button>
        </div>

        {/* Insight */}
        {chloeMessage && (
          <div className="mb-6 bg-brand-600/10 border border-brand-500/30 rounded-2xl p-4 animate-bounce-in">
             <div className="flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-brand-400 shrink-0" />
                <p className="text-sm text-slate-100 font-bold italic leading-tight tracking-tight uppercase">
                   "{chloeMessage}"
                </p>
             </div>
          </div>
        )}

        {/* Info Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
           {[
             { label: t.totalRecords, val: totalRecords, icon: Database, color: 'text-brand-500' },
             { label: 'Nações', val: Object.keys(countryStats).length, icon: Globe, color: 'text-cyan-500' },
             { label: 'Raspadinhas', val: categoryStats.scratch, icon: Coins, color: 'text-amber-500' },
             { 
                label: 'Tesouro MINT', 
                val: `${mintSummary.value.toFixed(2)}€`, 
                icon: Banknote, 
                color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]',
                sub: `${mintSummary.count} exemplares MINT`
             },
             { label: 'Lotarias', val: categoryStats.lottery, icon: Ticket, color: 'text-white' }
           ].map((card, i) => (
             <div key={i} className={`bg-slate-900 border ${card.color.includes('border') ? card.color : 'border-slate-800'} p-4 rounded-xl flex flex-col justify-between`}>
                <div className="flex justify-between items-center mb-1">
                   <card.icon className={`w-4 h-4 ${card.color.split(' ')[0]}`} />
                   <span className="text-[14px] font-black text-white font-mono">{card.val}</span>
                </div>
                <div className="mt-1">
                   <p className="text-[7px] text-slate-500 font-black uppercase tracking-widest">{card.label}</p>
                   {'sub' in card && <p className="text-[5px] text-emerald-500/70 font-black uppercase tracking-tighter mt-0.5">{card.sub}</p>}
                </div>
             </div>
           ))}
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 min-h-[220px] flex flex-col">
            <h3 className="text-[8px] font-black text-slate-500 mb-6 uppercase tracking-widest flex items-center gap-2">
               <Globe className="w-3 h-3 text-brand-500" /> Distribuição Mundial
            </h3>
            
            <div className="flex-1 flex items-end justify-around gap-2 pb-2">
              {continentsConfig.map((c) => {
                const count = Number(stats[c.key as string]) || 0;
                const percentage = (count / maxCount) * 100;
                const height = animate ? Math.max(percentage, 10) : 5;
                return (
                  <div key={c.key} className="flex flex-col items-center flex-1 h-full justify-end">
                    <div className="text-[8px] font-black text-brand-400 mb-1">{count}</div>
                    <div className={`w-full max-w-[24px] rounded-t-md bg-gradient-to-t ${c.gradient} transition-all duration-1000`} style={{ height: `${height}%` }}></div>
                    <span className="mt-2 text-[7px] font-black text-slate-600 uppercase tracking-tighter truncate w-full text-center">{c.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
             <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div className="shrink-0 w-16 h-16 rounded-full border-4 border-brand-500/20 flex items-center justify-center relative overflow-hidden">
                   <div className="absolute inset-0 bg-brand-500/10 animate-pulse"></div>
                   <span className="text-xs font-black text-white relative z-10">{stateDonutData.total}</span>
                </div>
                <div className="flex-1 pl-4 space-y-1">
                   <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">Estados Físicos</span>
                   <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[8px] font-black uppercase">
                         <span className="text-slate-400">MINT</span>
                         <span className="text-brand-500">{Math.round(stateDonutData.pMint)}%</span>
                      </div>
                      <div className="flex justify-between items-center text-[8px] font-black uppercase">
                         <span className="text-slate-400">SC</span>
                         <span className="text-brand-500">{Math.round(stateDonutData.pSC)}%</span>
                      </div>
                      <div className="flex justify-between items-center text-[8px] font-black uppercase">
                         <span className="text-slate-400">CS</span>
                         <span className="text-brand-500">{Math.round(stateDonutData.pCS)}%</span>
                      </div>
                      <div className="flex justify-between items-center text-[8px] font-black uppercase p-1 bg-purple-500/10 rounded border border-purple-500/20">
                         <span className="text-purple-400">Amostras</span>
                         <span className="text-purple-400">{Math.round(stateDonutData.pSamples)}%</span>
                      </div>
                   </div>
                </div>
             </div>

             <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-3">Ranking Nações</span>
                <div className="space-y-2">
                   {(Object.entries(countryStats) as [string, number][]).sort((a,b) => b[1] - a[1]).slice(0, 3).map(([c, v], idx) => (
                      <div key={c} className="flex items-center justify-between group">
                         <span className="text-[9px] font-black text-slate-300 uppercase truncate max-w-[80px]">{idx+1}. {c}</span>
                         <span className="text-[9px] font-black text-brand-500">{v}</span>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        </div>

        <div className="mt-10 text-center opacity-20">
            <p className="text-[7px] font-black uppercase tracking-[0.4em]">Visionary Archive • Porto 🐉</p>
        </div>
      </div>
    </div>
  );
};
