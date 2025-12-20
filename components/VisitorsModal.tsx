
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
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-600 via-blue-500 to-cyan-500"></div>
        
        <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
           <div className="flex items-center gap-4">
              <div className="bg-brand-600/20 p-3 rounded-2xl">
                 <Users className="w-6 h-6 text-brand-400" />
              </div>
              <div>
                 <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Livro de Honra</h2>
                 <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mt-0.5">Radar Local em Tempo Real hihi!</p>
              </div>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-all">
              <X className="w-6 h-6" />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
           
           <div className="mb-6 bg-blue-900/20 border border-blue-500/20 p-4 rounded-2xl flex gap-3">
              <Info className="w-5 h-5 text-blue-400 shrink-0" />
              <p className="text-[9px] text-blue-300 font-bold uppercase leading-relaxed tracking-wide">
                 Vovô Jorge: Este arquivo é privado e seguro. O radar deteta acessos em tempo real neste aparelho e sincroniza entre todas as abas abertas! hihi!
              </p>
           </div>

           <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl text-center group hover:border-brand-500 transition-all">
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Acessos Totais</span>
                 <span className="text-4xl font-black text-white italic tracking-tighter">{totalCount}</span>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl text-center group hover:border-cyan-500 transition-all">
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Ativos Local</span>
                 <span className="text-4xl font-black text-cyan-400 italic tracking-tighter animate-pulse">1</span>
              </div>
           </div>

           <div className="space-y-3">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                 <Clock className="w-3 h-3" /> Registos da Sessão
              </h3>
              
              {visitors.length === 0 ? (
                 <div className="py-10 text-center text-slate-600 italic">
                    <p className="text-xs uppercase font-black">Ninguém assinou o livro hoje vovô...</p>
                 </div>
              ) : (
                visitors.sort((a, b) => b.timestamp - a.timestamp).map((entry, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-800/30 border border-slate-800 rounded-2xl group hover:bg-slate-800 transition-all">
                    <div className="flex items-center gap-4">
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${entry.isAdmin ? 'bg-amber-500 text-slate-950' : 'bg-brand-600 text-white shadow-lg'}`}>
                          {entry.isAdmin ? <ShieldCheck className="w-5 h-5" /> : <User className="w-5 h-5" />}
                       </div>
                       <div className="flex flex-col">
                          <span className="text-sm font-black text-white uppercase tracking-tight">{entry.name}</span>
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{entry.isAdmin ? 'Administrador' : 'Visitante Amigo'}</span>
                       </div>
                    </div>
                    <div className="text-right">
                       <span className="text-[9px] font-mono text-slate-500 bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                          {new Date(entry.timestamp).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                       </span>
                    </div>
                  </div>
                ))
              )}
           </div>

           <div className="mt-8 bg-brand-900/20 border border-brand-500/20 p-6 rounded-[2rem] flex items-center gap-4">
              <Heart className="w-8 h-8 text-brand-500 fill-brand-500 animate-pulse" />
              <p className="text-xs text-slate-400 italic leading-relaxed">
                 "Para ligar com o Fabio em Itália em tempo real, precisaríamos de uma nuvem comum! Por agora, o nosso cofre está seguro e privado aqui consigo! hihi!"
              </p>
           </div>
        </div>

        <div className="p-6 bg-slate-950 border-t border-slate-800 text-center shrink-0">
           <button onClick={onClose} className="px-10 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all active:scale-95">
              Voltar ao Comando
           </button>
        </div>
      </div>
    </div>
  );
};
