
import React from 'react';
import { Heart, RefreshCw, User, ShieldCheck, Smartphone, Download } from 'lucide-react';
import { ChloeClock } from './ChloeClock';

interface FooterProps {
  onNavigate: (page: any) => void;
  onWebsitesClick: () => void;
  onInstall?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onWebsitesClick, onInstall }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#020617] border-t border-slate-900 px-6 py-10 w-full shadow-[0_-10px_30px_rgba(0,0,0,0.5)] mt-auto">
      <div className="max-w-[1800px] mx-auto flex flex-col gap-6">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3 order-2 md:order-1 flex-1 justify-end group cursor-default">
            <div className="flex flex-col items-end">
              <span className="text-[11px] font-black text-white italic tracking-tighter uppercase whitespace-nowrap group-hover:text-brand-400 transition-colors">Jorge Mesquita</span>
              <span className="text-[7px] font-black text-slate-600 uppercase tracking-[0.1em]">Albi-Celeste</span>
            </div>
            <div className="p-1.5 bg-slate-900 border border-brand-600/30 rounded-lg text-brand-500 group-hover:bg-brand-600 group-hover:text-white transition-all">
               <User className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="order-1 md:order-2 flex-shrink-0 scale-90 md:scale-100 neon-glow-blue rounded-full">
             <ChloeClock />
          </div>

          <div className="flex items-center gap-3 order-3 flex-1 justify-start group cursor-default">
            <div className="p-1.5 bg-slate-900 border border-brand-500/30 rounded-lg text-white group-hover:bg-white group-hover:text-brand-600 transition-all">
               <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[11px] font-black text-white italic tracking-tighter uppercase whitespace-nowrap group-hover:text-brand-400 transition-colors">Fabio Pagni</span>
              <span className="text-[7px] font-black text-slate-600 uppercase tracking-[0.1em]">Socio do Arquivo</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-white/5 gap-4">
          <div className="flex items-center gap-4">
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">
              © {currentYear} ARQUIVO MUNDIAL • PORTO É NAÇÃO 🐉
            </span>
            <div className="flex items-center border-l border-slate-800 pl-4 gap-4">
              <button 
                onClick={onWebsitesClick}
                className="text-[9px] font-black text-slate-500 hover:text-brand-400 uppercase tracking-[0.1em] transition-colors"
              >
                Diretório
              </button>
              <button 
                onClick={() => onNavigate('about')}
                className="text-[9px] font-black text-slate-500 hover:text-brand-400 uppercase tracking-[0.1em] transition-colors"
              >
                Sobre o Projeto
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1.5 group cursor-default">
               <Heart className="w-3 h-3 text-brand-500 fill-brand-500 animate-pulse" />
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover:text-brand-400 transition-colors">
                  Dedicado à Chloe 💙
               </span>
            </div>
            <button 
              className="flex items-center gap-1.5 bg-slate-900/50 hover:bg-brand-600 px-3 py-1.5 rounded-full border border-white/5 transition-all text-slate-500 hover:text-white" 
              onClick={() => window.location.reload()}
            >
               <RefreshCw className="w-3 h-3" />
               <span className="text-[8px] font-black uppercase">Recarregar</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
