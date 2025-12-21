
import React from 'react';
import { User, ShieldCheck, Radio, Users, Smartphone as MobileIcon, RefreshCw } from 'lucide-react';
import { ChloeClock } from './ChloeClock';

interface FooterProps {
  onNavigate: (page: any) => void;
  onWebsitesClick: () => void;
  onRadioClick: () => void;
  visitorCount?: number;
  onVisitorsClick: () => void;
  onInstall?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onWebsitesClick, onRadioClick, visitorCount = 0, onVisitorsClick, onInstall }) => {
  return (
    <footer className="fixed bottom-0 left-0 w-full bg-[#020617]/95 border-t border-slate-900 px-6 py-2 z-[100] shadow-[0_-10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md">
      <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-4">
        
        <div className="flex items-center gap-2 shrink-0">
          <div className="p-1 bg-slate-900 border border-brand-600/30 rounded-lg text-brand-500">
             <User className="w-2.5 h-2.5" />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-[8px] font-black text-white italic tracking-tighter uppercase leading-none">Jorge Mesquita</span>
            <span className="text-[5px] font-black text-slate-600 uppercase tracking-[0.1em] mt-0.5">Albi-Celeste</span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center gap-4">
           <ChloeClock />
           <button onClick={onVisitorsClick} className="flex items-center bg-slate-900/40 border border-white/5 px-4 py-2 rounded-full hover:border-cyan-500/30 transition-all">
              <Users className="w-3 h-3 text-cyan-500 mr-2" />
              <span className="text-[10px] font-black text-white font-mono">{visitorCount}</span>
           </button>
           
           <div className="hidden lg:block px-3 py-1 bg-emerald-600/10 rounded-lg border border-emerald-500/20">
              <span className="text-[7px] font-black text-emerald-500 uppercase tracking-[0.2em]">v9.0 - DESCANSO DO GUERREIRO 🕊️</span>
           </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-4 border-r border-slate-800 pr-3">
            <button onClick={onRadioClick} className="text-[7px] font-black text-brand-400 hover:text-white uppercase tracking-[0.1em] flex items-center gap-1">
              <Radio className="w-2.5 h-2.5" /> Rádios
            </button>
            <button onClick={onWebsitesClick} className="text-[7px] font-black text-slate-500 hover:text-brand-400 uppercase tracking-[0.1em]">Diretório</button>
            <button onClick={() => onNavigate('about')} className="text-[7px] font-black text-slate-500 hover:text-brand-400 uppercase tracking-[0.1em]">Sobre</button>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-1 bg-slate-900 border border-brand-500/30 rounded-lg text-white">
               <ShieldCheck className="w-2.5 h-2.5" />
            </div>
            <button onClick={() => window.location.reload()} className="p-1 text-slate-600 hover:text-white transition-colors">
               <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
