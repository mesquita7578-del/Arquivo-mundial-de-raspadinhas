
import React from 'react';
import { 
  Sparkles, Dog, Gift, Trophy, Coins, Rocket, 
  Car, Palette, Landmark, TreePine, Heart, Star, LayoutGrid, ChevronRight
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
  description: string;
  gradient: string;
}

const THEMES: ThemeCard[] = [
  { id: 'animais', name: 'Mundo Animal', icon: Dog, color: 'text-emerald-400', description: 'Gatos, Cães, Cavalos e muito mais.', gradient: 'from-emerald-600/20 to-slate-900' },
  { id: 'natal', name: 'Magia do Natal', icon: Gift, color: 'text-red-400', description: 'Edições festivas e de inverno.', gradient: 'from-red-600/20 to-slate-900' },
  { id: 'desporto', name: 'Arena Desportiva', icon: Trophy, color: 'text-blue-400', description: 'Futebol, Jogos Olímpicos e Corridas.', gradient: 'from-blue-600/20 to-slate-900' },
  { id: 'ouro', name: 'Cofre de Ouro', icon: Coins, color: 'text-amber-400', description: 'Itens de luxo, moedas e barras.', gradient: 'from-amber-600/20 to-slate-900' },
  { id: 'espaco', name: 'Universo Sideral', icon: Rocket, color: 'text-purple-400', description: 'Planetas, Estrelas e Ficção.', gradient: 'from-purple-600/20 to-slate-900' },
  { id: 'automoveis', name: 'Velocidade', icon: Car, color: 'text-cyan-400', description: 'Carros, Motos e Clássicos.', gradient: 'from-cyan-600/20 to-slate-900' },
  { id: 'natureza', name: 'Eco Arquivo', icon: TreePine, color: 'text-green-400', description: 'Paisagens, Flores e Meio Ambiente.', gradient: 'from-green-600/20 to-slate-900' },
  { id: 'artes', name: 'Cultura & Arte', icon: Palette, color: 'text-pink-400', description: 'Pinturas, Música e Cinema.', gradient: 'from-pink-600/20 to-slate-900' },
  { id: 'historia', name: 'História & Monumentos', icon: Landmark, color: 'text-slate-400', description: 'Castelos e Património Mundial.', gradient: 'from-slate-600/20 to-slate-900' },
  { id: 'amor', name: 'Amor & Emoções', icon: Heart, color: 'text-rose-400', description: 'S. Valentim e Afetos.', gradient: 'from-rose-600/20 to-slate-900' },
];

export const ThemesPage: React.FC<ThemesPageProps> = ({ onThemeSelect, images }) => {
  const getThemeCount = (themeId: string) => {
    return images.filter(img => img.theme?.toLowerCase() === themeId.toLowerCase()).length;
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-12 animate-fade-in">
      <div className="text-center mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 px-4 py-1.5 rounded-full">
           <Sparkles className="w-4 h-4 text-brand-400 animate-pulse" />
           <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest">Exposição de Curadoria</span>
        </div>
        <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
          Temas do <span className="text-brand-500">Arquivo</span>
        </h2>
        <p className="text-slate-500 text-sm max-w-2xl mx-auto font-medium">
          "Vovô, organizei todos os nossos tesouros por categorias especiais. Explore o arquivo de uma forma totalmente nova! hihi!"
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {THEMES.map((theme) => {
          const count = getThemeCount(theme.id);
          const Icon = theme.icon;
          return (
            <button
              key={theme.id}
              onClick={() => onThemeSelect(theme.id)}
              className={`group relative bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 text-left transition-all hover:border-brand-500/50 hover:-translate-y-2 shadow-xl overflow-hidden`}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${theme.gradient} opacity-0 group-hover:opacity-40 rounded-full -mr-16 -mt-16 transition-opacity blur-3xl`}></div>
              
              <div className="flex justify-between items-start relative z-10">
                <div className={`p-4 bg-slate-950 rounded-2xl border border-slate-800 group-hover:scale-110 transition-transform ${theme.color}`}>
                   <Icon className="w-8 h-8" />
                </div>
                <div className="flex flex-col items-end">
                   <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Catalogados</span>
                   <span className="text-2xl font-black text-white italic tracking-tighter">{count}</span>
                </div>
              </div>

              <div className="mt-8 relative z-10">
                <h4 className="text-xl font-black text-white uppercase tracking-tighter group-hover:text-brand-500 transition-colors">
                  {theme.name}
                </h4>
                <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
                  {theme.description}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between relative z-10">
                 <div className="flex items-center gap-1">
                    <LayoutGrid className="w-3 h-3 text-slate-700" />
                    <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Galeria Ativa</span>
                 </div>
                 <div className="opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all flex items-center gap-1 text-brand-500">
                    <span className="text-[10px] font-black uppercase">Entrar</span>
                    <ChevronRight className="w-4 h-4" />
                 </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-20 p-8 bg-slate-900/40 border border-slate-800 rounded-[3rem] text-center">
         <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.4em]">
           Sistemas de Curadoria Temática • Porto 🐉
         </p>
      </div>
    </div>
  );
};
