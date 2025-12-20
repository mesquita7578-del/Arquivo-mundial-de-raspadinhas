
import React from 'react';
import { X, Users, Clock, ShieldCheck, User, Sparkles, Heart, Info, Globe2 } from 'lucide-react';
import { VisitorEntry } from '../types';

interface VisitorsModalProps {
  onClose: () => void;
  visitors: VisitorEntry[];
  totalCount: number;
}

export const VisitorsModal: React.FC<VisitorsModalProps> = ({ onClose, visitors, totalCount }) => {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden flex flex-col relative max-h-[85vh]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-600 via-blue-500 to-cyan-500"></div>
        
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
           <div className="flex items-center gap-3">
              <div className="bg-brand-600/20 p-2 rounded-xl">
                 <Users className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                 <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Livro de Honra</h2>
                 <p className="text-slate-500 text-[8px] font-black uppercase tracking-widest">Acessos em Tempo Real hihi!</p>
              </div>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-all">
              <X className="w-5 h-5" />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
           
           <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-center">
                 <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">Totais</span>
                 <span className="text-2xl font-black text-white italic tracking-tighter">{totalCount}</span>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-center">
                 <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">Online</span>
                 <span className="text-2xl font-black text-cyan-400 italic tracking-tighter animate-pulse">1</span>
              </div>
           </div>

           <div className="space-y-2">
              <h3 className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2 px-1">
                 <Clock className="w-2.5 h-2.5" /> Registos Recentes
              </h3>
              
              {visitors.length === 0 ? (
                 <div className="py-6 text-center text-slate-600 italic">
                    <p className="text-[10px] uppercase font-black">Vazio, vovô...</p>
                 </div>
              ) : (
                visitors.sort((a, b) => b.timestamp - a.timestamp).slice(0, 15).map((entry, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-800/30 border border-slate-800 rounded-xl group hover:bg-slate-800 transition-all">
                    <div className="flex items-center gap-3">
                       <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${entry.isAdmin ? 'bg-amber-500 text-slate-950' : 'bg-brand-600 text-white'}`}>
                          {entry.isAdmin ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
                       </div>
                       <div className="flex flex-col">
                          <span className="text-xs font-black text-white uppercase tracking-tight">{entry.name}</span>
                          <span className="text-[7px] font-black text-slate-600 uppercase">{entry.isAdmin ? 'Admin' : 'Amigo'}</span>
                       </div>
                    </div>
                    <span className="text-[8px] font-mono text-slate-500">
                       {new Date(entry.timestamp).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
           </div>

           <div className="mt-6 bg-blue-900/10 border border-blue-500/10 p-4 rounded-2xl flex items-center gap-3">
              <Heart className="w-6 h-6 text-blue-500 fill-blue-500 shrink-0" />
              <p className="text-[9px] text-slate-400 italic leading-tight">
                 "Para ver o Fabio em Itália em tempo real, precisaríamos de uma nuvem comum! Por agora, tudo seguro consigo! hihi!"
              </p>
           </div>
        </div>

        <div className="p-4 bg-slate-950 border-t border-slate-800 shrink-0">
           <button onClick={onClose} className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all">
              Fechar Radar
           </button>
        </div>
      </div>
    </div>
  );
};
