
import React, { useRef, useState, useEffect } from 'react';
import { 
  Ticket, Lock, LogOut, BookOpen, Home, 
  BarChart2, ChevronDown, Globe, User, 
  Info, Database, ClipboardList, ChevronRight, Map as MapIcon, Radio, Menu, X as CloseIcon,
  Download, Upload, MapPin, Star, Landmark, Ship, Flag, Crown, Layout
} from 'lucide-react';
import { Language } from '../translations';
import { Continent } from '../types';

interface HeaderProps {
  isAdmin: boolean;
  currentUser?: string | null;
  onAdminToggle: () => void;
  onLogout: () => void;
  onHistoryClick: () => void;
  onRadioClick: () => void;
  onExport: () => void;
  onExportCSV: () => void;
  onExportTXT: () => void;
  onImport: (file: File) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  currentPage: string;
  onNavigate: (page: any) => void;
  t: any;
  onInstall?: () => void;
  countriesByContinent?: Record<string, string[]>;
  onCountrySelect?: (continent: Continent, country: string, subRegion?: string) => void;
  recentCount?: number;
  collectionCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ 
  isAdmin, currentUser, onAdminToggle, onLogout, 
  onHistoryClick, onRadioClick, onExport, onImport,
  language, setLanguage,
  currentPage, onNavigate, t,
  countriesByContinent = {},
  onCountrySelect,
  collectionCount = 0
}) => {
  const [showTools, setShowTools] = useState(false);
  const [showExplore, setShowExplore] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState<Continent | null>(null);
  const [activeCountrySub, setActiveCountrySub] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const exploreRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exploreRef.current && !exploreRef.current.contains(event.target as Node)) {
        setShowExplore(false);
        setActiveSubMenu(null);
        setActiveCountrySub(null);
      }
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setShowTools(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleImportClick = () => {
    fileInputRef.current?.click();
    setShowTools(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImport(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const continents: Continent[] = ['Europa', 'América', 'Ásia', 'África', 'Oceania'];

  const hasSpecialSubs = (country: string) => ['Portugal', 'Espanha', 'Alemanha', 'Canadá', 'Austrália'].includes(country);

  return (
    <header className="fixed top-0 left-0 w-full z-[2000] bg-slate-900 border-b border-brand-500/20 shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
      <div className="max-w-[1800px] mx-auto h-20 px-4 md:px-8 flex items-center justify-between">
        
        {/* Logo / Título */}
        <div 
          className="flex items-center gap-4 cursor-pointer group shrink-0" 
          onClick={() => onNavigate('home')}
          title="Página Inicial"
        >
          <div className="bg-brand-600 p-2.5 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
            <Ticket className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-base md:text-xl font-black text-white uppercase italic tracking-tighter leading-none group-hover:text-brand-400 transition-colors">
              {t.title}
            </h1>
            <span className="text-[8px] md:text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] leading-none mt-1.5">Mestre de Arquivo: Jorge Mesquita</span>
          </div>
        </div>

        {/* Navegação Central */}
        <nav className="flex items-center gap-2 md:gap-4">
           <button 
             onClick={() => onNavigate('home')} 
             className={`p-2.5 rounded-2xl transition-all ${currentPage === 'home' ? 'bg-brand-600 text-white shadow-xl' : 'text-slate-500 hover:text-white hover:bg-white/5'}`} 
             title="Página Inicial"
           >
             <Home className="w-6 h-6" />
           </button>

           <button 
             onClick={() => onNavigate('map')} 
             className={`p-2.5 rounded-2xl transition-all ${currentPage === 'map' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:text-white hover:bg-white/5'}`} 
             title="Mapa Mundi Interativo"
           >
             <Globe className="w-6 h-6" />
           </button>

           <div className="relative" ref={exploreRef}>
              <button 
                onClick={() => setShowExplore(!showExplore)} 
                className={`p-2.5 rounded-2xl transition-all flex items-center gap-2 ${showExplore ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white hover:bg-white/5'}`} 
                title="Explorar por Países e Continentes"
              >
                <MapIcon className="w-6 h-6" />
                <span className="hidden xl:inline text-[10px] font-black uppercase tracking-widest">Explorar</span>
              </button>
              
              {showExplore && (
                <div className="absolute top-full left-0 mt-4 flex z-[2100] animate-bounce-in">
                  <div className="flex gap-2">
                    <div className="w-48 bg-slate-900 border border-white/10 rounded-3xl shadow-2xl p-2 backdrop-blur-3xl">
                       {continents.map(cont => (
                         <button 
                           key={cont} 
                           onMouseEnter={() => { setActiveSubMenu(cont); setActiveCountrySub(null); }} 
                           onClick={() => { onNavigate('home'); onCountrySelect?.(cont, ''); setShowExplore(false); }} 
                           className={`w-full text-left px-4 py-2.5 text-[11px] rounded-xl transition-all flex items-center justify-between font-black uppercase tracking-widest ${activeSubMenu === cont ? 'bg-brand-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}
                         >
                           {cont}
                           <ChevronRight className={`w-4 h-4 transition-transform ${activeSubMenu === cont ? 'translate-x-1' : 'opacity-20'}`} />
                         </button>
                       ))}
                       <div className="border-t border-white/5 mt-1 pt-1">
                          <button 
                            onClick={() => { onNavigate('map'); setShowExplore(false); }}
                            className="w-full text-left px-4 py-2.5 text-[10px] text-brand-400 hover:bg-white/5 rounded-xl font-black uppercase tracking-widest flex items-center gap-3"
                          >
                             <Globe className="w-4 h-4" /> Ver Mapa Completo
                          </button>
                       </div>
                    </div>

                    {activeSubMenu && countriesByContinent[activeSubMenu] && (
                      <div className="w-64 bg-slate-900 border border-white/10 rounded-3xl shadow-2xl p-2 backdrop-blur-3xl max-h-[450px] overflow-y-auto custom-scrollbar animate-fade-in">
                        {countriesByContinent[activeSubMenu].sort().map(country => (
                          <button 
                            key={country}
                            onMouseEnter={() => setActiveCountrySub(country)}
                            onClick={() => {
                              if (!hasSpecialSubs(country)) {
                                onCountrySelect?.(activeSubMenu, country);
                                setShowExplore(false);
                                onNavigate('home');
                              }
                            }}
                            className={`w-full text-left px-4 py-2.5 text-[10px] text-slate-400 hover:text-white hover:bg-brand-600 rounded-xl transition-all font-black uppercase tracking-widest flex items-center justify-between group ${activeCountrySub === country ? 'bg-brand-600 text-white' : ''}`}
                          >
                            <span className="flex items-center gap-3 truncate"><MapPin className="w-4 h-4" /> {country}</span>
                            {hasSpecialSubs(country) && <ChevronRight className="w-4 h-4" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
           </div>

           <button 
             onClick={() => onNavigate('themes')} 
             className={`p-2.5 rounded-2xl transition-all ${currentPage === 'themes' ? 'bg-pink-600 text-white shadow-xl' : 'text-slate-500 hover:text-white hover:bg-white/5'}`} 
             title="Temas e Categorias Visuais"
           >
             <Layout className="w-6 h-6" />
           </button>

           <button 
             onClick={() => onNavigate('stats')} 
             className={`p-2.5 rounded-2xl transition-all ${currentPage === 'stats' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-white hover:bg-white/5'}`} 
             title="Estatísticas Detalhadas do Arquivo"
           >
             <BarChart2 className="w-6 h-6" />
           </button>

           {currentUser && (
             <button 
               onClick={() => onNavigate('collection')} 
               className={`p-2.5 rounded-2xl transition-all flex items-center gap-2 relative ${currentPage === 'collection' ? 'bg-amber-500 text-white shadow-xl' : 'text-slate-500 hover:text-white hover:bg-white/5'}`} 
               title="Minha Coleção Particular"
             >
               <Star className={`w-6 h-6 ${currentPage === 'collection' ? 'fill-current' : ''}`} />
               {collectionCount > 0 && (
                 <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-slate-900">
                   {collectionCount}
                 </span>
               )}
             </button>
           )}

           <button 
             onClick={onHistoryClick} 
             className="p-2.5 rounded-2xl text-slate-500 hover:text-white hover:bg-white/5 transition-all" 
             title="Biblioteca Técnica e Documentos PDF"
           >
             <BookOpen className="w-6 h-6" />
           </button>

           <div className="relative" ref={toolsRef}>
              <button 
                onClick={() => setShowTools(!showTools)} 
                className={`p-2.5 rounded-2xl transition-all flex items-center gap-2 ${showTools ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white hover:bg-white/5'}`} 
                title="Configurações de Dados e Backup"
              >
                <Database className="w-6 h-6" />
                <ChevronDown className={`w-4 h-4 transition-transform ${showTools ? 'rotate-180' : ''}`} />
              </button>
              {showTools && (
                <div className="absolute top-full right-0 mt-4 w-56 bg-slate-900 border border-white/10 rounded-3xl shadow-2xl p-2.5 z-[2200] animate-bounce-in">
                   <button 
                     onClick={onExport} 
                     className="w-full text-left px-4 py-4 text-[11px] text-slate-400 hover:bg-brand-600 hover:text-white rounded-2xl font-black uppercase tracking-widest flex items-center gap-4 transition-all"
                     title="Exportar base de dados JSON"
                   >
                      <Download className="w-5 h-5" /> Backup JSON
                   </button>
                   <button 
                     onClick={handleImportClick} 
                     className="w-full text-left px-4 py-4 text-[11px] text-slate-400 hover:bg-emerald-600 hover:text-white rounded-2xl font-black uppercase tracking-widest flex items-center gap-4 transition-all"
                     title="Importar base de dados JSON"
                   >
                      <Upload className="w-5 h-5" /> Importar JSON
                   </button>
                   <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileChange} />
                </div>
              )}
           </div>
        </nav>

        {/* Login / Logout / Idiomas */}
        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden sm:flex bg-slate-950 rounded-2xl p-1.5 border border-white/5">
            <button 
              onClick={() => setLanguage('pt')} 
              className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all ${language === 'pt' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-300'}`}
              title="Mudar para Português"
            >
              PT
            </button>
            <button 
              onClick={() => setLanguage('it')} 
              className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all ${language === 'it' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-300'}`}
              title="Passa a Italiano"
            >
              IT
            </button>
          </div>

          {currentUser ? (
            <button 
              onClick={onLogout} 
              className="flex items-center gap-4 pl-1.5 pr-5 py-1.5 bg-slate-800 hover:bg-red-600/10 text-white border border-white/10 rounded-full transition-all group" 
              title="Encerrar Sessão"
            >
               <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-sm font-black shadow-inner">
                 {currentUser[0].toUpperCase()}
               </div>
               <div className="hidden lg:flex flex-col items-start leading-none">
                  <span className="text-xs font-black uppercase">{currentUser}</span>
                  <span className="text-[8px] text-slate-500 font-black uppercase mt-1">Sair</span>
               </div>
               <LogOut className="w-5 h-5 text-slate-500 group-hover:text-red-500 transition-colors" />
            </button>
          ) : (
            <button 
              onClick={onAdminToggle} 
              className="flex items-center gap-3 px-6 py-3 bg-amber-500 hover:bg-white text-slate-950 hover:text-brand-600 rounded-full transition-all text-xs font-black uppercase tracking-widest shadow-xl active:scale-95"
              title="Entrar na Área do Colecionador"
            >
              <Lock className="w-5 h-5" /> <span className="hidden md:inline">Entrar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
