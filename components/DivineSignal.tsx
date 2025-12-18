
import React, { useEffect, useState } from 'react';
import { Sparkles, Zap, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export type SignalType = 'success' | 'divine' | 'info' | 'warning';

export interface Signal {
  id: string;
  message: string;
  type: SignalType;
}

interface DivineSignalProps {
  signals: Signal[];
  onRemove: (id: string) => void;
}

export const DivineSignal: React.FC<DivineSignalProps> = ({ signals, onRemove }) => {
  return (
    <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[10001] flex flex-col gap-3 pointer-events-none w-full max-w-xs px-4">
      {signals.map((signal) => (
        <SignalItem key={signal.id} signal={signal} onRemove={onRemove} />
      ))}
    </div>
  );
};

// Fixed: Explicitly defining SignalItem as a React.FC to resolve the 'key' prop assignment error
const SignalItem: React.FC<{ signal: Signal; onRemove: (id: string) => void }> = ({ signal, onRemove }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onRemove(signal.id), 500);
    }, 4000);
    return () => clearTimeout(timer);
  }, [signal.id, onRemove]);

  const configs: Record<SignalType, { icon: any; color: string; border: string; glow: string; label: string }> = {
    divine: { 
      icon: Sparkles, 
      color: 'bg-gradient-to-r from-brand-600 to-purple-600', 
      border: 'border-brand-400/50', 
      glow: 'shadow-[0_0_20px_rgba(225,29,72,0.4)]',
      label: 'Sinal Divino'
    },
    success: { 
      icon: CheckCircle2, 
      color: 'bg-slate-900', 
      border: 'border-emerald-500/50', 
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]',
      label: 'Arquivado'
    },
    info: { 
      icon: Info, 
      color: 'bg-slate-900', 
      border: 'border-blue-500/50', 
      glow: 'shadow-[0_0_20px_rgba(59,130,246,0.2)]',
      label: 'Arquivo'
    },
    warning: { 
      icon: AlertTriangle, 
      color: 'bg-slate-900', 
      border: 'border-yellow-500/50', 
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]',
      label: 'Aviso'
    }
  };

  const config = configs[signal.type];
  const Icon = config.icon;

  return (
    <div className={`pointer-events-auto flex flex-col gap-1 transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
      <div className={`${config.color} ${config.border} ${config.glow} border p-4 rounded-2xl flex items-center gap-4 backdrop-blur-xl animate-bounce-in relative overflow-hidden group`}>
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        
        <div className="bg-black/20 p-2 rounded-xl">
           <Icon className={`w-5 h-5 ${signal.type === 'divine' ? 'text-white' : 'text-cyan-400'}`} />
        </div>
        
        <div className="flex flex-col flex-1 min-w-0">
           <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/50">{config.label}</span>
           <p className="text-white text-xs font-black uppercase tracking-tight truncate leading-tight">{signal.message}</p>
        </div>

        <button onClick={() => onRemove(signal.id)} className="text-white/30 hover:text-white transition-colors p-1">
           <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
