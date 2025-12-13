import React, { useState } from 'react';
import { X, Lock, User, LogIn, AlertCircle, HelpCircle } from 'lucide-react';

interface LoginModalProps {
  onClose: () => void;
  onLogin: (username: string, pass: string) => boolean;
  t: any;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLogin, t }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError(t.errorEmpty);
      return;
    }

    const success = onLogin(username, password);
    if (success) {
      onClose();
    } else {
      setError(t.errorInvalid);
    }
  };

  const handleForgotPassword = () => {
    alert(t.hint);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
        
        {/* Header decoration */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-600 to-purple-600"></div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 border border-gray-700 shadow-inner">
              <Lock className="w-8 h-8 text-brand-500" />
            </div>
            <h2 className="text-2xl font-bold text-white">{t.title}</h2>
            <p className="text-gray-400 text-sm mt-1">{t.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-900/20 border border-red-900/50 text-red-400 p-3 rounded-lg text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">{t.adminLabel}</label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-brand-500 transition-colors" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Fabio Pagni / Jorge Mesquita"
                  className="w-full bg-gray-800 text-white pl-10 pr-4 py-3 rounded-xl border border-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all placeholder-gray-600"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-1">
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

            <button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-brand-900/50 transition-all flex items-center justify-center gap-2 mt-4 active:scale-95"
            >
              <LogIn className="w-5 h-5" />
              {t.enter}
            </button>
          </form>
        </div>
        
        <div className="bg-gray-900/50 border-t border-gray-800 p-4 text-center">
          <p className="text-xs text-gray-600">
            {t.restricted}
          </p>
        </div>
      </div>
    </div>
  );
};