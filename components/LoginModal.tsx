
import React, { useState } from 'react';
import { X, Lock, User, LogIn, AlertCircle, HelpCircle, ShieldCheck, Heart, UserPlus, Sparkles } from 'lucide-react';

interface LoginModalProps {
  onClose: () => void;
  onLogin: (username: string, pass: string | null, type: 'admin' | 'visitor') => boolean;
  t: any;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLogin, t }) => {
  const [activeTab, setActiveTab] = useState<'visitor' | 'admin'>('visitor');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedUser = username.trim();
    if (!trimmedUser) {
      setError("Por favor, introduza o seu nome.");
      return;
    }

    if (activeTab === 'admin') {
       if (!password) {
         setError("Introduza a palavra-passe de Administrador.");
         return;
       }
       const success = onLogin(trimmedUser, password, 'admin');
       if (success) {
         onClose();
       } else {
         setError(t.errorInvalid || "Credenciais de Administrador incorretas.");
       }
    } else {
       // Visitor Logic - Always treat as success to "register" or login
       const success = onLogin(trimmedUser, null, 'visitor');
       if (success) {
          onClose();
       } else {
          setError("Ocorreu um erro ao registar o seu acesso.");
       }
    }
  };

  const handleForgotPassword = () => {
    alert(t.hint || "Palavra-passe padrão: 123456");
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-white/10 rounded-[3rem] w-full max-w-lg shadow-[0_30px_100px_rgba(0,0,0,0.9)] relative overflow-hidden flex flex-col transform md:scale-105">
        
        {/* Header decoration */}
        <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${activeTab === 'visitor' ? 'from-blue-500 via-brand-600 to-cyan-500' : 'from-amber-500 to-orange-600'}`}></div>

        <button 
          onClick={onClose}
          className="absolute top-8 right-8 text-gray-400 hover:text-white transition-colors z-10 p-2 bg-slate-800 rounded-full"
        >
          <X className="w-6 h-6" />
        </button>

        {/* TABS */}
        <div className="flex border-b border-white/5 bg-slate-900/50 mt-2">
           <button 
             onClick={() => setActiveTab('visitor')}
             className={`flex-1 py-6 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all relative ${activeTab === 'visitor' ? 'text-blue-400 bg-slate-800/50' : 'text-gray-500 hover:text-gray-300'}`}
           >
              <Heart className="w-4 h-4" />
              Sou Colecionador
              {activeTab === 'visitor' && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500"></div>}
           </button>
           <button 
             onClick={() => setActiveTab('admin')}
             className={`flex-1 py-6 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all relative ${activeTab === 'admin' ? 'text-amber-400 bg-slate-800/50' : 'text-gray-500 hover:text-gray-300'}`}
           >
              <ShieldCheck className="w-4 h-4" />
              Administrador
              {activeTab === 'admin' && <div className="absolute bottom-0 left-0 w-full h-1 bg-amber-500"></div>}
           </button>
        </div>

        <div className="p-12 flex-1">
          
          <div className="text-center mb-10 space-y-2">
             {activeTab === 'visitor' ? (
                <>
                   <div className="bg-blue-600/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border border-blue-500/20 mb-4">
                      <UserPlus className="w-8 h-8 text-blue-500" />
                   </div>
                   <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">Bem-vindo, vovô!</h2>
                   <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                      Identifique-se para entrar no seu Arquivo Mundial hihi!
                   </p>
                </>
             ) : (
                <>
                   <div className="bg-amber-600/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/20 mb-4">
                      <Lock className="w-8 h-8 text-amber-500" />
                   </div>
                   <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">Área Privada</h2>
                   <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                      Acesso restrito para gestão e backup de dados.
                   </p>
                </>
             )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-900/30 border border-red-500/30 text-red-400 p-4 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-3 animate-bounce-in">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-3">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">
                 O Seu Nome de Colecionador
              </label>
              <div className="relative group">
                <User className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${activeTab === 'visitor' ? 'text-blue-500' : 'text-amber-500'}`} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={activeTab === 'visitor' ? "Ex: Vovô Jorge" : "Identificador Admin"}
                  className={`w-full bg-slate-950 text-white pl-14 pr-6 py-5 rounded-2xl border transition-all focus:outline-none focus:ring-4 placeholder-slate-700 font-black uppercase text-sm ${activeTab === 'visitor' ? 'border-white/5 focus:border-blue-500 focus:ring-blue-500/10' : 'border-white/5 focus:border-amber-500 focus:ring-amber-500/10'}`}
                  autoFocus
                />
              </div>
            </div>

            {activeTab === 'admin' && (
               <div className="space-y-3 animate-fade-in">
                 <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Palavra-Passe</label>
                 <div className="relative group">
                   <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500" />
                   <input
                     type="password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     placeholder="••••••••"
                     className="w-full bg-slate-950 text-white pl-14 pr-6 py-5 rounded-2xl border border-white/5 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all placeholder-slate-700 font-black text-sm"
                   />
                 </div>
               </div>
            )}

            <div className="flex items-center justify-between px-2">
               <div className="flex items-center gap-2">
                  <input type="checkbox" id="remember" defaultChecked className="w-4 h-4 rounded border-slate-700 bg-slate-800" />
                  <label htmlFor="remember" className="text-[8px] font-black text-slate-500 uppercase tracking-widest cursor-pointer">Lembrar no tablet</label>
               </div>
               {activeTab === 'admin' && (
                 <button 
                   type="button"
                   onClick={handleForgotPassword}
                   className="text-[8px] font-black text-amber-500 hover:text-amber-400 flex items-center gap-1 transition-colors uppercase tracking-widest"
                 >
                   <HelpCircle className="w-3 h-3" /> Ajuda
                 </button>
               )}
            </div>

            <button
              type="submit"
              className={`w-full font-black py-5 rounded-2xl shadow-2xl transition-all flex items-center justify-center gap-3 mt-4 active:scale-95 uppercase tracking-[0.2em] text-xs ${activeTab === 'visitor' ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30' : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/30'}`}
            >
              {activeTab === 'visitor' ? <Sparkles className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
              {activeTab === 'visitor' ? "Registar e Entrar" : "Validar Acesso"}
            </button>
          </form>
        </div>
        
        <div className="bg-slate-950/50 border-t border-white/5 p-6 text-center">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest flex items-center justify-center gap-2">
            <ShieldCheck className="w-3 h-3" /> Arquivo Mundial • Visionary Portal 🐉
          </p>
        </div>
      </div>
    </div>
  );
};
