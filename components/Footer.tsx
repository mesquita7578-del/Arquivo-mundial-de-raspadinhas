
import React from 'react';
import { Heart, RefreshCw, User, ShieldCheck, Smartphone, Download, Radio, Users } from 'lucide-react';
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
    <footer className="fixed bottom-0 left-0 w-full bg-[#020617]/90 border-t border-slate-900 px-6 py-1.5 z-[100] shadow-[0_-10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md">
      <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-4">
        
        {/* Lado Esquerdo: Jorge & Info */}
        <div className="flex items-center gap-2 group cursor-default shrink-0">
          <div className="p-1 bg-slate-900 border border-brand-600/30 rounded-lg text-brand-500 group-hover:bg-brand-600 group-hover:text-white transition-all">
             <User className="w-2.5 h-2.5" />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-[8px] font-black text-white italic tracking-tighter uppercase whitespace-nowrap group-hover:text-brand-400 transition-colors leading-none">Jorge Mesquita</span>
            <span className="text-[5px] font-black text-slate-600 uppercase tracking-[0.1em] leading-none mt-0.5">Albi-Celeste</span>
          </div>
        </div>

        {/* Centro: Relógio da Chloe e Contador de Visitas */}
        <div className="flex-1 flex items-center justify-center gap-4 scale-75 sm:scale-90 origin-center">
           <ChloeClock />
           
           <button 
             onClick={onVisitorsClick}
             className="flex items-center bg-slate-900/40 border border-white/5 px-4 py-2 rounded-full group hover:border-cyan-500/30 transition-all backdrop-blur-sm"
           >
              <Users className="w-3 h-3 text-cyan-500 mr-2 group-hover:animate-bounce" />
              <div className="flex flex-col items-start">
                 <span className="text-[6px] font-black text-slate-600 uppercase tracking-widest leading-none">Acessos</span>
                 <span className="text-[10px] font-black text-white font-mono leading-tight">{visitorCount}</span>
              </div>
           </button>
        </div>

        {/* Lado Direito: Fabio & Ações */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-3 border-r border-slate-800 pr-3">
            <button 
              onClick={onRadioClick}
              className="flex items-center gap-1.5 text-[7px] font-black text-brand-400 hover:text-white uppercase tracking-[0.1em] transition-colors"
            >
              <Radio className="w-2 h-2" /> Rádios & TV
            </button>
            <button 
              onClick={onWebsitesClick}
              className="text-[7px] font-black text-slate-500 hover:text-brand-400 uppercase tracking-[0.1em] transition-colors"
            >
              Diretório
            </button>
            <button 
              onClick={() => onNavigate('about')}
              className="text-[7px] font-black text-slate-500 hover:text-brand-400 uppercase tracking-[0.1em] transition-colors"
            >
              Sobre
            </button>
          </div>

          <div className="flex items-center gap-2 group cursor-default">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[8px] font-black text-white italic tracking-tighter uppercase whitespace-nowrap group-hover:text-brand-400 transition-colors leading-none">Fabio Pagni</span>
              <span className="text-[5px] font-black text-slate-600 uppercase tracking-[0.1em] leading-none mt-0.5">Socio do Arquivo</span>
            </div>
            <div className="p-1 bg-slate-900 border border-brand-500/30 rounded-lg text-white group-hover:bg-white group-hover:text-brand-600 transition-all">
               <ShieldCheck className="w-2.5 h-2.5" />
            </div>
          </div>

          <button 
            className="p-1 bg-slate-900/50 hover:bg-brand-600 rounded-lg border border-white/5 transition-all text-slate-500 hover:text-white" 
            onClick={() => window.location.reload()}
            title="Recarregar"
          >
             <RefreshCw className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
