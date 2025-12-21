
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
    <header className="fixed top-0 left-0 w-full z-[1000] bg-slate-900 border-b border-white/10 shadow-2xl">
      <div className="max-w-[1800px] mx-auto h-16 md:h-20 px-4 md:px-8 flex items-center justify-between">
        
        {/* Logo / Título */}
        <div 
          className="flex items-center gap-3 cursor-pointer group shrink-0" 
          onClick={() => onNavigate('home')}
          title={t.home}
        >
          <div className="bg-brand-600 p-2 rounded-xl shadow-lg group-hover:scale-105 transition-transform">
            <Ticket className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm md:text-lg font-black text-white uppercase italic tracking-tighter leading-none">
              {t.title}
            </h1>
            <span className="text-[7px] md:text-[9px] text-brand-400 font-black uppercase tracking-[0.2em] leading-none mt-1">Legado de Jorge Mesquita</span>
          </div>
        </div>

        {/* Navegação Central */}
        <nav className="flex items-center gap-1 md:gap-3">
           <button 
             onClick={() => onNavigate('home')} 
             className={`p-2 rounded-xl transition-all ${currentPage === 'home' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`} 
             title={t.home}
           >
             <Home className="w-5 h-5" />
           </button>

           <div className="relative" ref={exploreRef}>
              <button 
                onClick={() => setShowExplore(!showExplore)} 
                className={`p-2 rounded-xl transition-all flex items-center gap-2 ${showExplore ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white hover:bg-white/5'}`} 
                title={t.explore}
              >
                <Globe className="w-5 h-5" />
                <span className="hidden lg:inline text-[10px] font-black uppercase tracking-widest">Explorar</span>
              </button>
              
              {showExplore && (
                <div className="absolute top-full left-0 mt-3 flex z-[1200] animate-fade-in">
                  <div className="flex gap-2">
                    <div className="w-44 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-1.5 backdrop-blur-3xl">
                       {continents.map(cont => (
                         <button 
                           key={cont} 
                           onMouseEnter={() => { setActiveSubMenu(cont); setActiveCountrySub(null); }} 
                           onClick={() => { onNavigate('home'); onCountrySelect?.(cont, ''); setShowExplore(false); }} 
                           className={`w-full text-left px-4 py-2 text-[10px] rounded-xl transition-all flex items-center justify-between font-black uppercase tracking-widest ${activeSubMenu === cont ? 'bg-brand-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}
                         >
                           {cont}
                           <ChevronRight className={`w-3 h-3 transition-transform ${activeSubMenu === cont ? 'translate-x-1' : 'opacity-20'}`} />
                         </button>
                       ))}
                    </div>

                    {activeSubMenu && countriesByContinent[activeSubMenu] && (
                      <div className="w-56 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-1.5 backdrop-blur-3xl max-h-[400px] overflow-y-auto custom-scrollbar animate-fade-in">
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
                            className={`w-full text-left px-4 py-2 text-[9px] text-slate-400 hover:text-white hover:bg-brand-600 rounded-xl transition-all font-black uppercase tracking-widest flex items-center justify-between group ${activeCountrySub === country ? 'bg-brand-600 text-white' : ''}`}
                          >
                            <span className="flex items-center gap-2 truncate"><MapPin className="w-3 h-3" /> {country}</span>
                            {hasSpecialSubs(country) && <ChevronRight className="w-3 h-3" />}
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
             className={`p-2 rounded-xl transition-all ${currentPage === 'themes' ? 'bg-pink-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`} 
             title="Temas da Coleção"
           >
             <Layout className="w-5 h-5" />
           </button>

           <button 
             onClick={() => onNavigate('stats')} 
             className={`p-2 rounded-xl transition-all ${currentPage === 'stats' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`} 
             title={t.stats}
           >
             <BarChart2 className="w-5 h-5" />
           </button>

           {currentUser && (
             <button 
               onClick={() => onNavigate('collection')} 
               className={`p-2 rounded-xl transition-all flex items-center gap-2 relative ${currentPage === 'collection' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`} 
               title={t.myCollection}
             >
               <Star className={`w-5 h-5 ${currentPage === 'collection' ? 'fill-current' : ''}`} />
               {collectionCount > 0 && (
                 <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[7px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-slate-900">
                   {collectionCount}
                 </span>
               )}
             </button>
           )}

           <button 
             onClick={onHistoryClick} 
             className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all" 
             title="Biblioteca e PDF"
           >
             <BookOpen className="w-5 h-5" />
           </button>

           <div className="relative" ref={toolsRef}>
              <button 
                onClick={() => setShowTools(!showTools)} 
                className={`p-2 rounded-xl transition-all flex items-center gap-2 ${showTools ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white hover:bg-white/5'}`} 
                title="Ferramentas de Dados"
              >
                <Database className="w-5 h-5" />
                <ChevronDown className={`w-3 h-3 transition-transform ${showTools ? 'rotate-180' : ''}`} />
              </button>
              {showTools && (
                <div className="absolute top-full right-0 mt-3 w-48 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-2 z-[1200] animate-fade-in">
                   <button 
                     onClick={onExport} 
                     className="w-full text-left px-4 py-3 text-[10px] text-slate-400 hover:bg-brand-600 hover:text-white rounded-xl font-black uppercase tracking-widest flex items-center gap-3 transition-all"
                     title="Exportar base de dados JSON"
                   >
                      <Download className="w-4 h-4" /> Backup JSON
                   </button>
                   <button 
                     onClick={handleImportClick} 
                     className="w-full text-left px-4 py-3 text-[10px] text-slate-400 hover:bg-emerald-600 hover:text-white rounded-xl font-black uppercase tracking-widest flex items-center gap-3 transition-all"
                     title="Importar base de dados JSON"
                   >
                      <Upload className="w-4 h-4" /> Importar JSON
                   </button>
                   <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileChange} />
                </div>
              )}
           </div>
        </nav>

        {/* Login / Logout */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:flex bg-slate-950 rounded-xl p-1 border border-white/10">
            <button 
              onClick={() => setLanguage('pt')} 
              className={`px-3 py-1 rounded-lg text-[9px] font-black transition-all ${language === 'pt' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-300'}`}
              title="Português"
            >
              PT
            </button>
            <button 
              onClick={() => setLanguage('it')} 
              className={`px-3 py-1 rounded-lg text-[9px] font-black transition-all ${language === 'it' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-300'}`}
              title="Italiano"
            >
              IT
            </button>
          </div>

          {currentUser ? (
            <button 
              onClick={onLogout} 
              className="flex items-center gap-3 pl-1 pr-4 py-1 bg-slate-800 hover:bg-red-600/10 text-white border border-white/10 rounded-full transition-all group" 
              title="Sair do Arquivo"
            >
               <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-xs font-black shadow-inner">
                 {currentUser[0].toUpperCase()}
               </div>
               <div className="hidden md:flex flex-col items-start leading-none">
                  <span className="text-[10px] font-black uppercase">{currentUser}</span>
                  <span className="text-[7px] text-slate-500 font-black uppercase">Sair</span>
               </div>
               <LogOut className="w-4 h-4 text-slate-500 group-hover:text-red-500 transition-colors ml-1" />
            </button>
          ) : (
            <button 
              onClick={onAdminToggle} 
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-white text-slate-950 hover:text-brand-600 rounded-full transition-all text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95"
              title="Acesso Administrador"
            >
              <Lock className="w-4 h-4" /> <span className="hidden md:inline">Entrar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
