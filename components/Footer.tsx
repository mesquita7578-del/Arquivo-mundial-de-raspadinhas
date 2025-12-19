
import React from 'react';
import { Heart, RefreshCw } from 'lucide-react';
import { ChloeClock } from './ChloeClock';

interface FooterProps {
  onNavigate: (page: any) => void;
  onWebsitesClick: () => void;
  onInstall?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onWebsitesClick }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 border-t border-slate-900 px-6 py-4 mt-auto">
      <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
          <span>© {currentYear} ARQUIVO MUNDIAL</span>
          <span className="text-slate-800">|</span>
          <span className="hover:text-slate-300 transition-colors cursor-default">Jorge Mesquita & Fabio Pagni</span>
        </div>

        {/* Relógio Centralizado no Rodapé */}
        <div className="flex items-center gap-4">
           <ChloeClock />
           <div className="hidden sm:flex items-center gap-3 bg-slate-900/40 border border-slate-800/50 rounded-2xl pl-3 pr-2 py-1">
             <div className="flex flex-col">
                <span className="text-[8px] font-black text-white leading-none uppercase tracking-tighter">Arquivo</span>
                <span className="text-[7px] font-bold text-brand-500 leading-none uppercase">Ativo</span>
             </div>
             <button className="text-slate-700 hover:text-white transition-colors" onClick={() => window.location.reload()}>
                <RefreshCw className="w-3 h-3" />
             </button>
          </div>
        </div>

        <div className="flex items-center flex-wrap justify-center gap-6">
          <div className="flex items-center gap-2 group cursor-default">
             <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500 animate-pulse" />
             <span className="text-[10px] font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500 uppercase tracking-widest">
                Futura Guardiã Chloe
             </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
