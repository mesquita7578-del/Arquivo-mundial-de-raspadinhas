
import React from 'react';
import { 
  Sparkles, Dog, Gift, Trophy, Coins, Rocket, 
  Car, Palette, Landmark, TreePine, Heart, Star, LayoutGrid, ChevronRight,
  Film, Gamepad2, Zap
} from 'lucide-react';
import { ScratchcardData } from '../types';

interface ThemesPageProps {
  onThemeSelect: (theme: string) => void;
  images: ScratchcardData[];
}

interface ThemeCard {
  id: string;
  name: string;
  icon: any;
  color: string;
  glowColor: string;
  description: string;
  bgGradient: string;
}

const THEMES: ThemeCard[] = [
  { id: 'animais', name: 'Animais', icon: Dog, color: 'text-emerald-400', glowColor: 'shadow-emerald-500/50 border-emerald-500/50', description: 'Mundo Selvagem', bgGradient: 'from-emerald-500/10' },
  { id: 'natal', name: 'Natal', icon: Gift, color: 'text-red-500', glowColor: 'shadow-red-600/50 border-red-600/50', description: 'Magia de Inverno', bgGradient: 'from-red-600/10' },
  { id: 'filmes', name: 'Filmes', icon: Film, color: 'text-amber-500', glowColor: 'shadow-amber-500/50 border-amber-500/50', description: 'Sétima Arte', bgGradient: 'from-amber-500/10' },
  { id: 'desenhos', name: 'Desenhos', icon: Gamepad2, color: 'text-pink-400', glowColor: 'shadow-pink-500/50 border-pink-500/50', description: 'Animação & Kids', bgGradient: 'from-pink-500/10' },
  { id: 'desporto', name: 'Desporto', icon: Trophy, color: 'text-blue-400', glowColor: 'shadow-blue-500/50 border-blue-500/50', description: 'Arena Digital', bgGradient: 'from-blue-500/10' },
  { id: 'ouro', name: 'Ouro', icon: Coins, color: 'text-yellow-400', glowColor: 'shadow-yellow-400/50 border-yellow-400/50', description: 'Tesouros de Luxo', bgGradient: 'from-yellow-400/10' },
  { id: 'espaco', name: 'Espaço', icon: Rocket, color: 'text-purple-400', glowColor: 'shadow-purple-500/50 border-purple-500/50', description: 'Cosmos Infinito', bgGradient: 'from-purple-500/10' },
  { id: 'automoveis', name: 'Motores', icon: Car, color: 'text-cyan-400', glowColor: 'shadow-cyan-400/50 border-cyan-400/50', description: 'Velocidade Máxima', bgGradient: 'from-cyan-400/10' },
  { id: 'natureza', name: 'Natureza', icon: TreePine, color: 'text-lime-400', glowColor: 'shadow-lime-400/50 border-lime-400/50', description: 'Eco-Arquivo', bgGradient: 'from-lime-400/10' },
  { id: 'artes', name: 'Artes', icon: Palette, color: 'text-rose-400', glowColor: 'shadow-rose-400/50 border-rose-400/50', description: 'Pinceladas Finas', bgGradient: 'from-rose-400/10' },
  { id: 'historia', name: 'História', icon: Landmark, color: 'text-slate-300', glowColor: 'shadow-slate-400/50 border-slate-400/50', description: 'Passado Eterno', bgGradient: 'from-slate-400/10' },
  { id: 'amor', name: 'Amor', icon: Heart, color: 'text-rose-600', glowColor: 'shadow-rose-600/50 border-rose-600/50', description: 'Coração Valente', bgGradient: 'from-rose-600/10' },
];

export const ThemesPage: React.FC<ThemesPageProps> = ({ onThemeSelect, images }) => {
  const getThemeCount = (themeId: string) => {
    return images.filter(img => img.theme?.toLowerCase() === themeId.toLowerCase()).length;
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-10 py-12 animate-fade-in">
      <style>{`
        @keyframes neonPulse {
          0%, 100% { opacity: 1; filter: brightness(1); }
          50% { opacity: 0.8; filter: brightness(1.5); }
        }
        .neon-card-pulse {
          animation: neonPulse 2s infinite ease-in-out;
        }
        .theme-card-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        @media (min-width: 640px) { .theme-card-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
        @media (min-width: 1024px) { .theme-card-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
        @media (min-width: 1280px) { .theme-card-grid { grid-template-columns: repeat(6, minmax(0, 1fr)); } }
      `}</style>

      <div className="text-center mb-20 space-y-4">
        <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/30 px-6 py-2 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.2)]">
           <Zap className="w-4 h-4 text-brand-400 animate-pulse" />
           <span className="text-[10px] font-black text-brand-400 uppercase tracking-[0.3em]">Curadoria Neon • Edição de Gala</span>
        </div>
        <h2 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-none">
          Salas de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-pink-500 to-yellow-500">Exposição</span>
        </h2>
        <p className="text-slate-500 text-xs max-w-xl mx-auto font-black uppercase tracking-widest">
          "Vovô, o arquivo agora brilha mais que as luzes do estádio! hihi! Escolha uma galeria para explorar."
        </p>
      </div>

      <div className="theme-card-grid gap-4 md:gap-6">
        {THEMES.map((theme) => {
          const count = getThemeCount(theme.id);
          const Icon = theme.icon;
          return (
            <button
              key={theme.id}
              onClick={() => onThemeSelect(theme.id)}
              className={`group relative bg-slate-950 border-2 rounded-[2rem] p-6 text-center transition-all duration-500 hover:-translate-y-3 overflow-hidden flex flex-col items-center justify-between min-h-[280px] shadow-lg ${theme.glowColor} neon-card-pulse`}
              style={{ animationDelay: `${Math.random() * 2}s` }}
            >
              {/* Background Glow */}
              <div className={`absolute inset-0 bg-gradient-to-b ${theme.bgGradient} to-transparent opacity-20 group-hover:opacity-40 transition-opacity`}></div>
              
              {/* Top Slot: Count */}
              <div className="relative z-10 w-full flex justify-end">
                <div className="bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 rounded-full flex items-center gap-1.5 shadow-xl">
                   <div className={`w-1.5 h-1.5 rounded-full ${theme.color} shadow-[0_0_8px_currentColor] animate-pulse`}></div>
                   <span className="text-[10px] font-black text-white font-mono">{count}</span>
                </div>
              </div>

              {/* Center Slot: Icon */}
              <div className="relative z-10 my-4">
                <div className={`p-5 rounded-full bg-slate-900 border-2 border-white/5 group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 shadow-inner ${theme.color}`}>
                   <Icon className="w-10 h-10 drop-shadow-[0_0_12px_currentColor]" />
                </div>
              </div>

              {/* Bottom Slot: Info */}
              <div className="relative z-10 space-y-1">
                <h4 className={`text-xl font-black uppercase italic tracking-tighter group-hover:scale-110 transition-transform ${theme.color}`}>
                  {theme.name}
                </h4>
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] leading-tight">
                  {theme.description}
                </p>
                
                <div className="pt-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-500">
                   <div className={`flex items-center gap-1.5 px-4 py-1 rounded-full bg-white text-black text-[9px] font-black uppercase shadow-2xl`}>
                      Explorar <ChevronRight className="w-3 h-3" />
                   </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-24 p-10 bg-slate-900/30 border border-slate-800 rounded-[4rem] text-center relative overflow-hidden group">
         <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-pink-500/5 to-yellow-500/5 animate-shimmer neon-shimmer"></div>
         <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] relative z-10 flex items-center justify-center gap-4">
           <Star className="w-3 h-3 text-brand-500" /> 
           Visionary Archive High-Performance Display 🐉 
           <Star className="w-3 h-3 text-brand-500" />
         </p>
      </div>
    </div>
  );
};
