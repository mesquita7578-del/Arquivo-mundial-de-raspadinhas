import React from 'react';
import { Heart, ShieldCheck, Zap, X } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: any) => void;
  onWebsitesClick: () => void;
}

export const Footer: React.FC<FooterProps> = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 border-t border-slate-900 px-6 py-4 mt-auto">
      <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Lado Esquerdo: Copyright e Créditos */}
        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
          <span>© {currentYear} ARQUIVO MUNDIAL</span>
          <span className="text-slate-800">|</span>
          <span className="hover:text-slate-300 transition-colors cursor-default">Jorge Mesquita & Fabio Pagni</span>
        </div>

        {/* Lado Direito: Alertas e Chloe */}
        <div className="flex items-center gap-6">
          
          {/* Alerta de Sistema (conforme screenshot) */}
          <div className="hidden sm:flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-full pl-3 pr-2 py-1 shadow-lg">
             <div className="flex flex-col">
                <span className="text-[9px] font-black text-white leading-none uppercase tracking-tighter">Alerta de Sistema</span>
                <span className="text-[8px] font-bold text-brand-500 leading-none uppercase">App Atualizada</span>
             </div>
             <button className="text-slate-600 hover:text-white transition-colors">
                <X className="w-3 h-3" />
             </button>
          </div>

          {/* Futura Guardiã Chloe (conforme screenshot) */}
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