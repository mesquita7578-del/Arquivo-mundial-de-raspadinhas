
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
  { id: 'natal', name: 'Natal', icon: Gift, color: 'text-red-500', glowColor: 'shadow-red-600/50 border-red-600/50', description: 'Magia Inverno', bgGradient: 'from-red-600/10' },
  { id: 'filmes', name: 'Filmes', icon: Film, color: 'text-amber-500', glowColor: 'shadow-amber-500/50 border-amber-500/50', description: 'Sétima Arte', bgGradient: 'from-amber-500/10' },
  { id: 'desenhos', name: 'Desenhos', icon: Gamepad2, color: 'text-pink-400', glowColor: 'shadow-pink-500/50 border-pink-500/50', description: 'Animação', bgGradient: 'from-pink-500/10' },
  { id: 'desporto', name: 'Desporto', icon: Trophy, color: 'text-blue-400', glowColor: 'shadow-blue-500/50 border-blue-500/50', description: 'Arena Digital', bgGradient: 'from-blue-500/10' },
  { id: 'ouro', name: 'Ouro', icon: Coins, color: 'text-yellow-400', glowColor: 'shadow-yellow-400/50 border-yellow-400/50', description: 'Tesouros Luxo', bgGradient: 'from-yellow-400/10' },
  { id: 'espaco', name: 'Espaço', icon: Rocket, color: 'text-purple-400', glowColor: 'shadow-purple-500/50 border-purple-500/50', description: 'Cosmos', bgGradient: 'from-purple-500/10' },
  { id: 'automoveis', name: 'Motores', icon: Car, color: 'text-cyan-400', glowColor: 'shadow-cyan-400/50 border-cyan-400/50', description: 'Velocidade', bgGradient: 'from-cyan-400/10' },
  { id: 'natureza', name: 'Natureza', icon: TreePine, color: 'text-lime-400', glowColor: 'shadow-lime-400/50 border-lime-400/50', description: 'Eco-Arquivo', bgGradient: 'from-lime-400/10' },
  { id: 'artes', name: 'Artes', icon: Palette, color: 'text-rose-400', glowColor: 'shadow-rose-400/50 border-rose-400/50', description: 'Pinceladas', bgGradient: 'from-rose-400/10' },
  { id: 'historia', name: 'História', icon: Landmark, color: 'text-slate-300', glowColor: 'shadow-slate-400/50 border-slate-400/50', description: 'Passado', bgGradient: 'from-slate-400/10' },
  { id: 'amor', name: 'Amor', icon: Heart, color: 'text-rose-600', glowColor: 'shadow-rose-600/50 border-rose-600/50', description: 'Afetos', bgGradient: 'from-rose-600/10' },
];

export const ThemesPage: React.FC<ThemesPageProps> = ({ onThemeSelect, images }) => {
  const getThemeCount = (themeId: string) => {
    return images.filter(img => img.theme?.toLowerCase() === themeId.toLowerCase()).length;
  };

  return (
    <div className="w-full max-w-[1800px] mx-auto px-4 md:px-8 py-6 md:py-10 animate-fade-in">
      <style>{`
        @keyframes neonPulse {
          0%, 100% { opacity: 1; filter: brightness(1); }
          50% { opacity: 0.8; filter: brightness(1.4); }
        }
        .neon-card-pulse {
          animation: neonPulse 2.5s infinite ease-in-out;
        }
        .theme-card-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
        @media (min-width: 768px) { .theme-card-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
        @media (min-width: 1024px) { .theme-card-grid { grid-template-columns: repeat(6, minmax(0, 1fr)); } }
        @media (min-width: 1440px) { .theme-card-grid { grid-template-columns: repeat(8, minmax(0, 1fr)); } }
      `}</style>

      {/* Cabeçalho mais pequeno e direto */}
      <div className="text-center mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 px-4 py-1 rounded-full">
           <Zap className="w-3 h-3 text-brand-400 animate-pulse" />
           <span className="text-[8px] font-black text-brand-400 uppercase tracking-[0.2em]">Exposição Temática</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
          Temas do <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-pink-500 to-yellow-500">Arquivo</span>
        </h2>
        <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">
           Selecione uma galeria • {THEMES.length} Categorias Ativas hihi!
        </p>
      </div>

      <div className="theme-card-grid gap-3 md:gap-4">
        {THEMES.map((theme) => {
          const count = getThemeCount(theme.id);
          const Icon = theme.icon;
          return (
            <button
              key={theme.id}
              onClick={() => onThemeSelect(theme.id)}
              className={`group relative bg-slate-950 border rounded-2xl p-4 text-center transition-all duration-300 hover:-translate-y-2 overflow-hidden flex flex-col items-center justify-between min-h-[190px] shadow-md ${theme.glowColor} neon-card-pulse border-white/5 hover:border-white/20`}
              style={{ animationDelay: `${Math.random() * 2}s` }}
            >
              {/* Background Glow */}
              <div className={`absolute inset-0 bg-gradient-to-b ${theme.bgGradient} to-transparent opacity-10 group-hover:opacity-30 transition-opacity`}></div>
              
              {/* Count Badge Small */}
              <div className="relative z-10 w-full flex justify-end">
                <div className="bg-black/60 border border-white/10 px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                   <div className={`w-1 h-1 rounded-full ${theme.color} shadow-[0_0_5px_currentColor]`}></div>
                   <span className="text-[8px] font-black text-white/80 font-mono">{count}</span>
                </div>
              </div>

              {/* Icon Center Small */}
              <div className="relative z-10 my-2">
                <div className={`p-3 rounded-full bg-slate-900 border border-white/5 group-hover:scale-110 transition-all duration-300 ${theme.color}`}>
                   <Icon className="w-7 h-7 drop-shadow-[0_0_8px_currentColor]" />
                </div>
              </div>

              {/* Bottom Info Small */}
              <div className="relative z-10 space-y-0.5">
                <h4 className={`text-sm font-black uppercase italic tracking-tight group-hover:text-white transition-colors ${theme.color}`}>
                  {theme.name}
                </h4>
                <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest leading-none">
                  {theme.description}
                </p>
                
                <div className="pt-2 flex justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                   <div className="flex items-center gap-1 px-3 py-0.5 rounded-full bg-white text-black text-[7px] font-black uppercase">
                      Abrir <ChevronRight className="w-2 h-2" />
                   </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-16 p-6 bg-slate-900/20 border border-slate-800/50 rounded-3xl text-center">
         <p className="text-[8px] font-black text-slate-700 uppercase tracking-[0.4em]">
           Visionary Compact Display 🐉 
         </p>
      </div>
    </div>
  );
};
