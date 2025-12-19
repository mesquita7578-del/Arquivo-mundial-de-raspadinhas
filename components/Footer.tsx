
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
    <footer className="bg-slate-950 border-t border-slate-900 px-6 py-6 mt-auto relative overflow-hidden">
      {/* Luz de fundo subtil */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-brand-500/20 to-transparent"></div>
      
      <div className="max-w-[1800px] mx-auto flex flex-col gap-6">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Jorge Mesquita Section */}
          <div className="flex items-center gap-4 order-2 md:order-1 flex-1 justify-end">
            <div className="flex flex-col items-end">
              <span className="text-sm font-black text-white italic tracking-tighter uppercase whitespace-nowrap">Jorge Mesquita</span>
            </div>
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-blue-500">
               <User className="w-4 h-4" />
            </div>
          </div>

          {/* O Relógio "Espetáculo" da Chloe (Centro) */}
          <div className="order-1 md:order-2 flex-shrink-0">
             <ChloeClock />
          </div>

          {/* Fabio Pagni Section */}
          <div className="flex items-center gap-4 order-3 flex-1 justify-start">
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-brand-500">
               <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-black text-white italic tracking-tighter uppercase whitespace-nowrap">Fabio Pagni</span>
            </div>
          </div>
        </div>

        {/* Linha Final Inferior */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-white/5 gap-4">
          <div className="flex items-center gap-6">
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">
              © {currentYear} ARQUIVO MUNDIAL
            </span>
            <button 
              onClick={onWebsitesClick}
              className="text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-[0.2em] transition-colors border-l border-slate-800 pl-6"
            >
              Diretório Mundial
            </button>
          </div>

          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 group cursor-default">
               <Heart className="w-3 h-3 text-pink-500 fill-pink-500 animate-pulse" />
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover:text-pink-400 transition-colors">
                  Dedicado à Chloe
               </span>
            </div>
            <button 
              className="flex items-center gap-2 bg-slate-900/50 hover:bg-slate-900 px-3 py-1.5 rounded-full border border-white/5 transition-all text-slate-500 hover:text-white" 
              onClick={() => window.location.reload()}
            >
               <RefreshCw className="w-2.5 h-2.5" />
               <span className="text-[8px] font-black uppercase">Recarregar</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
