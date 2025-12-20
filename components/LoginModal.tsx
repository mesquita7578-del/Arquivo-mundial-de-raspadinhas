
import React, { useState } from 'react';
import { X, Lock, User, LogIn, AlertCircle, HelpCircle, ShieldCheck, Heart } from 'lucide-react';

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

    if (activeTab === 'admin') {
       if (!username || !password) {
         setError(t.errorEmpty);
         return;
       }
       const success = onLogin(username, password, 'admin');
       if (success) {
         onClose();
       } else {
         setError(t.errorInvalid);
       }
    } else {
       // Visitor Logic
       if (!username) {
          setError("Por favor, diga-nos o seu nome.");
          return;
       }
       const success = onLogin(username, null, 'visitor');
       if (success) {
          onClose();
       } else {
          setError("Erro ao entrar.");
       }
    }
  };

  const handleForgotPassword = () => {
    alert(t.hint);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md shadow-[0_30px_100px_rgba(0,0,0,0.9)] relative overflow-hidden flex flex-col scale-110">
        
        {/* Header decoration */}
        <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${activeTab === 'visitor' ? 'from-blue-500 to-cyan-500' : 'from-brand-600 to-purple-600'}`}></div>

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors z-10 p-2"
        >
          <X className="w-6 h-6" />
        </button>

        {/* TABS */}
        <div className="flex border-b border-gray-800 bg-gray-900/50 mt-1">
           <button 
             onClick={() => setActiveTab('visitor')}
             className={`flex-1 py-5 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-colors relative ${activeTab === 'visitor' ? 'text-blue-400 bg-slate-800/50' : 'text-gray-500 hover:text-gray-300'}`}
           >
              <Heart className="w-5 h-5" />
              Colecionador
              {activeTab === 'visitor' && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500"></div>}
           </button>
           <button 
             onClick={() => setActiveTab('admin')}
             className={`flex-1 py-5 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-colors relative ${activeTab === 'admin' ? 'text-brand-400 bg-slate-800/50' : 'text-gray-500 hover:text-gray-300'}`}
           >
              <ShieldCheck className="w-5 h-5" />
              Admin
              {activeTab === 'admin' && <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-500"></div>}
           </button>
        </div>

        <div className="p-10 flex-1">
          
          <div className="text-center mb-10">
             {activeTab === 'visitor' ? (
                <>
                   <h2 className="text-3xl font-black text-white mb-3 italic tracking-tighter uppercase">Bem-vindo, vovô!</h2>
                   <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">
                      Diga-nos o seu nome para entrar no arquivo mundial.
                   </p>
                </>
             ) : (
                <>
                   <h2 className="text-3xl font-black text-white mb-3 italic tracking-tighter uppercase">Área do Comandante</h2>
                   <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">
                      Acesso restrito para gestão de dados e backup.
                   </p>
                </>
             )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-900/30 border border-red-500/50 text-red-400 p-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-start gap-3 animate-bounce-in">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">
                 {activeTab === 'visitor' ? "O Seu Nome" : "Utilizador"}
              </label>
              <div className="relative group">
                <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${activeTab === 'visitor' ? 'text-blue-500' : 'text-gray-500 group-focus-within:text-brand-500'}`} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={activeTab === 'visitor' ? "Ex: Vovô Jorge" : "Comandante"}
                  className={`w-full bg-slate-950 text-white pl-12 pr-5 py-4 rounded-2xl border transition-all focus:outline-none focus:ring-2 placeholder-gray-700 font-bold ${activeTab === 'visitor' ? 'border-slate-800 focus:border-blue-500 focus:ring-blue-500/20' : 'border-slate-800 focus:border-brand-500 focus:ring-brand-500/20'}`}
                  autoFocus
                />
              </div>
            </div>

            {activeTab === 'admin' && (
               <div className="space-y-2 animate-fade-in">
                 <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Palavra-Passe</label>
                 <div className="relative group">
                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-brand-500 transition-colors" />
                   <input
                     type="password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     placeholder="••••••••"
                     className="w-full bg-slate-950 text-white pl-12 pr-5 py-4 rounded-2xl border border-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all placeholder-gray-700"
                   />
                 </div>
               </div>
            )}

            {activeTab === 'admin' && (
               <div className="flex justify-end">
                 <button 
                   type="button"
                   onClick={handleForgotPassword}
                   className="text-[10px] font-black text-brand-400 hover:text-brand-300 flex items-center gap-2 transition-colors uppercase tracking-widest"
                 >
                   <HelpCircle className="w-4 h-4" />
                   Esqueceu a senha?
                 </button>
               </div>
            )}

            <button
              type="submit"
              className={`w-full font-black py-4 rounded-2xl shadow-2xl transition-all flex items-center justify-center gap-3 mt-8 active:scale-95 uppercase tracking-[0.2em] text-xs ${activeTab === 'visitor' ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/50' : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-900/50'}`}
            >
              <LogIn className="w-5 h-5" />
              {activeTab === 'visitor' ? "Entrar no Arquivo" : "Iniciar Sessão"}
            </button>
          </form>
        </div>
        
        <div className="bg-slate-950/50 border-t border-slate-800 p-5 text-center">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
            Arquivo Mundial • Protegido pela Chloe hihi!
          </p>
        </div>
      </div>
    </div>
  );
};
