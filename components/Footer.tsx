
import React from 'react';
import { Heart, RefreshCw, User, ShieldCheck } from 'lucide-react';
import { ChloeClock } from './ChloeClock';

interface FooterProps {
  onNavigate: (page: any) => void;
  onWebsitesClick: () => void;
  onInstall?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onWebsitesClick }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 border-t border-slate-900 px-6 py-3 mt-auto relative overflow-hidden shrink-0">
      {/* Luz de fundo subtil */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-brand-500/10 to-transparent"></div>
      
      <div className="max-w-[1800px] mx-auto flex flex-col gap-3">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Jorge Mesquita Section */}
          <div className="flex items-center gap-3 order-2 md:order-1 flex-1 justify-end">
            <div className="flex flex-col items-end">
              <span className="text-[11px] font-black text-white italic tracking-tighter uppercase whitespace-nowrap">Jorge Mesquita</span>
            </div>
            <div className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-blue-500">
               <User className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* O Relógio "Espetáculo" da Chloe (Centro) */}
          <div className="order-1 md:order-2 flex-shrink-0 scale-90 md:scale-100">
             <ChloeClock />
          </div>

          {/* Fabio Pagni Section */}
          <div className="flex items-center gap-3 order-3 flex-1 justify-start">
            <div className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-brand-500">
               <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[11px] font-black text-white italic tracking-tighter uppercase whitespace-nowrap">Fabio Pagni</span>
            </div>
          </div>
        </div>

        {/* Linha Final Inferior */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-2 border-t border-white/5 gap-3">
          <div className="flex items-center gap-4">
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">
              © {currentYear} ARQUIVO MUNDIAL
            </span>
            <button 
              onClick={onWebsitesClick}
              className="text-[8px] font-black text-slate-500 hover:text-white uppercase tracking-[0.1em] transition-colors border-l border-slate-800 pl-4"
            >
              Diretório Mundial
            </button>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1.5 group cursor-default">
               <Heart className="w-2.5 h-2.5 text-pink-500 fill-pink-500 animate-pulse" />
               <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest group-hover:text-pink-400 transition-colors">
                  Dedicado à Chloe
               </span>
            </div>
            <button 
              className="flex items-center gap-1.5 bg-slate-900/50 hover:bg-slate-900 px-2.5 py-1 rounded-full border border-white/5 transition-all text-slate-500 hover:text-white" 
              onClick={() => window.location.reload()}
            >
               <RefreshCw className="w-2 h-2" />
               <span className="text-[7px] font-black uppercase">Recarregar</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
