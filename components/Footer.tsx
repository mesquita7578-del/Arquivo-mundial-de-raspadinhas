
import React from 'react';
import { User, ShieldCheck, Radio, Users, Smartphone as MobileIcon, RefreshCw } from 'lucide-react';
import { ChloeClock } from './ChloeClock';

interface FooterProps {
  onNavigate: (page: any) => void;
  onWebsitesClick: () => void;
  onRadioClick: () => void;
  onInstall?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onWebsitesClick, onRadioClick }) => {
  return (
    <footer className="fixed bottom-0 left-0 w-full bg-[#020617]/98 border-t border-white/5 px-6 py-1.5 z-[1000] shadow-[0_-15px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl">
      <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-4">
        
        {/* Jorge */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-1.5 bg-slate-900 border border-brand-600/30 rounded-xl text-brand-500">
             <User className="w-3.5 h-4" />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-[10px] font-black text-white italic tracking-tighter uppercase leading-none">Jorge Mesquita</span>
            <span className="text-[7px] font-black text-slate-600 uppercase tracking-[0.1em] mt-1">Albi-Celeste 🐉</span>
          </div>
        </div>

        {/* Centro */}
        <div className="flex-1 flex items-center justify-center gap-6">
           <ChloeClock />
        </div>

        {/* Fabio & Ações */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden md:flex items-center gap-5 border-r border-slate-800 pr-5">
            <button onClick={onRadioClick} className="text-[9px] font-black text-brand-400 hover:text-white uppercase tracking-[0.15em] flex items-center gap-2 transition-colors">
              <Radio className="w-4 h-4" /> Rádios & TV
            </button>
            <button onClick={onWebsitesClick} className="text-[9px] font-black text-slate-500 hover:text-brand-400 uppercase tracking-[0.15em] transition-colors">Diretório</button>
            <button onClick={() => onNavigate('about')} className="text-[9px] font-black text-slate-500 hover:text-brand-400 uppercase tracking-[0.15em] transition-colors">Sobre</button>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end leading-none mr-1">
               <span className="text-[10px] font-black text-white italic uppercase tracking-tighter">Fabio Pagni</span>
               <span className="text-[7px] font-black text-slate-600 uppercase tracking-[0.1em] mt-1">Sócio do Arquivo</span>
            </div>
            <div className="p-1.5 bg-slate-900 border border-brand-500/30 rounded-xl text-white shadow-lg">
               <ShieldCheck className="w-3.5 h-4" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
