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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden flex flex-col">
        
        {/* Header decoration */}
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${activeTab === 'visitor' ? 'from-blue-500 to-cyan-500' : 'from-brand-600 to-purple-600'}`}></div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* TABS */}
        <div className="flex border-b border-gray-800 bg-gray-900/50 mt-1">
           <button 
             onClick={() => setActiveTab('visitor')}
             className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors relative ${activeTab === 'visitor' ? 'text-blue-400 bg-gray-800/50' : 'text-gray-500 hover:text-gray-300'}`}
           >
              <Heart className="w-4 h-4" />
              Sou Colecionador
              {activeTab === 'visitor' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500"></div>}
           </button>
           <button 
             onClick={() => setActiveTab('admin')}
             className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors relative ${activeTab === 'admin' ? 'text-brand-400 bg-gray-800/50' : 'text-gray-500 hover:text-gray-300'}`}
           >
              <ShieldCheck className="w-4 h-4" />
              Administração
              {activeTab === 'admin' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-500"></div>}
           </button>
        </div>

        <div className="p-8 flex-1">
          
          <div className="text-center mb-8">
             {activeTab === 'visitor' ? (
                <>
                   <h2 className="text-2xl font-bold text-white mb-2">Bem-vindo ao Arquivo!</h2>
                   <p className="text-gray-400 text-sm">
                      Registe o seu nome para criar listas, marcar o que já tem e fazer parte da história.
                   </p>
                </>
             ) : (
                <>
                   <h2 className="text-2xl font-bold text-white mb-2">Área Restrita</h2>
                   <p className="text-gray-400 text-sm">
                      Acesso reservado aos gestores do Arquivo Mundial.
                   </p>
                </>
             )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-900/20 border border-red-900/50 text-red-400 p-3 rounded-lg text-sm flex items-start gap-2 animate-bounce-in">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                 {activeTab === 'visitor' ? "O Seu Nome" : t.adminLabel}
              </label>
              <div className="relative group">
                <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${activeTab === 'visitor' ? 'text-blue-500' : 'text-gray-500 group-focus-within:text-brand-500'}`} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={activeTab === 'visitor' ? "Ex: Mario Silva" : "Fabio Pagni / Jorge Mesquita"}
                  className={`w-full bg-gray-800 text-white pl-10 pr-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-1 placeholder-gray-600 ${activeTab === 'visitor' ? 'border-gray-700 focus:border-blue-500 focus:ring-blue-500' : 'border-gray-700 focus:border-brand-500 focus:ring-brand-500'}`}
                  autoFocus
                />
              </div>
            </div>

            {activeTab === 'admin' && (
               <div className="space-y-1 animate-fade-in">
                 <label className="text-xs font-bold text-gray-500 uppercase ml-1">{t.passLabel}</label>
                 <div className="relative group">
                   <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-brand-500 transition-colors" />
                   <input
                     type="password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     placeholder="••••••••"
                     className="w-full bg-gray-800 text-white pl-10 pr-4 py-3 rounded-xl border border-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all placeholder-gray-600"
                   />
                 </div>
               </div>
            )}

            {activeTab === 'admin' && (
               <div className="flex justify-end">
                 <button 
                   type="button"
                   onClick={handleForgotPassword}
                   className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
                 >
                   <HelpCircle className="w-3 h-3" />
                   {t.forgot}
                 </button>
               </div>
            )}

            <button
              type="submit"
              className={`w-full font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-6 active:scale-95 ${activeTab === 'visitor' ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/50' : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-900/50'}`}
            >
              <LogIn className="w-5 h-5" />
              {activeTab === 'visitor' ? "Começar a Coleção" : t.enter}
            </button>
          </form>
        </div>
        
        <div className="bg-gray-900/50 border-t border-gray-800 p-4 text-center">
          <p className="text-[10px] text-gray-600">
            {activeTab === 'visitor' ? "Modo Visitante: Apenas leitura e marcação pessoal." : t.restricted}
          </p>
        </div>
      </div>
    </div>
  );
};