
import React, { useRef, useState, useEffect } from 'react';
import { 
  Ticket, Lock, LogOut, BookOpen, Home, 
  BarChart2, ChevronDown, Globe, User, 
  Info, Database, ClipboardList, ChevronRight, Map as MapIcon, Radio, Menu, X as CloseIcon,
  Download, Upload, MapPin, Star
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
  onCountrySelect?: (continent: Continent, country: string) => void;
  recentCount?: number;
  collectionCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ 
  isAdmin, currentUser, onAdminToggle, onLogout, 
  onHistoryClick, onRadioClick, onExport, onExportTXT, onImport,
  language, setLanguage,
  currentPage, onNavigate, t,
  countriesByContinent = {},
  onCountrySelect,
  recentCount = 0,
  collectionCount = 0
}) => {
  const [showTools, setShowTools] = useState(false);
  const [showExplore, setShowExplore] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState<Continent | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const exploreRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exploreRef.current && !exploreRef.current.contains(event.target as Node)) {
        setShowExplore(false);
        setActiveSubMenu(null);
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

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-[110] w-[95%] max-w-6xl pointer-events-none">
      <div className="bg-slate-900/90 backdrop-blur-3xl border border-white/10 rounded-full h-12 md:h-14 shadow-[0_15px_40px_rgba(0,0,0,0.6)] flex items-center justify-between px-5 md:px-8 pointer-events-auto transition-all">
        
        {/* Logo Minimalista Mais Compacto */}
        <div className="flex items-center gap-2.5 cursor-pointer group shrink-0" onClick={() => onNavigate('home')}>
          <div className="bg-brand-600 p-1.5 rounded-lg shadow-lg group-hover:scale-105 transition-transform">
            <Ticket className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="hidden md:block text-xs font-black text-white uppercase italic tracking-tighter leading-none">
              {t.title}
            </h1>
            <span className="hidden md:block text-[6px] text-brand-400 font-black uppercase tracking-[0.2em] mt-0.5">Vovô Jorge 🐉</span>
          </div>
        </div>

        {/* Navegação Central Compacta e "Dócil" */}
        <nav className="flex items-center gap-0.5 md:gap-1.5">
           <button onClick={() => onNavigate('home')} className={`p-2 rounded-lg transition-all ${currentPage === 'home' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-500 hover:text-white hover:bg-white/5'}`} title={t.home}>
             <Home className="w-4 h-4" />
           </button>

           <div className="relative" ref={exploreRef}>
              <button onClick={() => setShowExplore(!showExplore)} className={`p-2 rounded-lg transition-all flex items-center gap-1 ${showExplore ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white hover:bg-white/5'}`} title={t.explore}>
                <Globe className="w-4 h-4" />
              </button>
              
              {showExplore && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 flex z-[120] animate-bounce-in">
                  <div className="flex gap-1.5">
                    {/* Lista de Continentes */}
                    <div className="w-48 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-1.5 backdrop-blur-2xl h-fit">
                       {continents.map(cont => (
                         <button 
                           key={cont} 
                           onMouseEnter={() => setActiveSubMenu(cont)} 
                           onClick={() => { onNavigate('home'); onCountrySelect?.(cont, ''); setShowExplore(false); }} 
                           className={`w-full text-left px-4 py-2 text-[9px] rounded-lg transition-all flex items-center justify-between font-black uppercase tracking-widest ${activeSubMenu === cont ? 'bg-brand-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}
                         >
                           {cont}
                           <ChevronRight className={`w-2.5 h-2.5 transition-transform ${activeSubMenu === cont ? 'translate-x-1' : 'opacity-0'}`} />
                         </button>
                       ))}
                    </div>

                    {/* Lista de Países (Submenu Dinâmico) */}
                    {activeSubMenu && countriesByContinent[activeSubMenu] && countriesByContinent[activeSubMenu].length > 0 && (
                      <div className="w-56 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-1.5 backdrop-blur-2xl max-h-[300px] overflow-y-auto custom-scrollbar animate-fade-in">
                        <div className="px-3 py-1.5 border-b border-white/5 mb-1">
                          <span className="text-[8px] font-black text-brand-400 uppercase tracking-widest">{activeSubMenu}</span>
                        </div>
                        {countriesByContinent[activeSubMenu].sort().map(country => (
                          <button 
                            key={country}
                            onClick={() => {
                              onCountrySelect?.(activeSubMenu, country);
                              setShowExplore(false);
                              setActiveSubMenu(null);
                              onNavigate('home');
                            }}
                            className="w-full text-left px-3 py-2 text-[8px] text-slate-400 hover:text-white hover:bg-brand-600 rounded-lg transition-all font-black uppercase tracking-widest flex items-center gap-2"
                          >
                            <MapPin className="w-2.5 h-2.5" /> {country}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
           </div>

           <button onClick={() => onNavigate('map')} className={`p-2 rounded-lg transition-all ${currentPage === 'map' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-500 hover:text-white hover:bg-white/5'}`} title="Mapa">
             <MapIcon className="w-4 h-4" />
           </button>

           <button onClick={() => onNavigate('stats')} className={`p-2 rounded-lg transition-all ${currentPage === 'stats' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-500 hover:text-white hover:bg-white/5'}`} title={t.stats}>
             <BarChart2 className="w-4 h-4" />
           </button>

           {currentUser && (
             <button onClick={() => onNavigate('collection')} className={`p-2 rounded-lg transition-all flex items-center gap-1 relative ${currentPage === 'collection' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-500 hover:text-white hover:bg-white/5'}`} title={t.myCollection}>
               <Star className={`w-4 h-4 ${currentPage === 'collection' ? 'fill-current' : ''}`} />
               {collectionCount > 0 && (
                 <span className="absolute -top-0.5 -right-0.5 bg-brand-500 text-white text-[6px] font-black w-3.5 h-3.5 flex items-center justify-center rounded-full border border-slate-900">
                   {collectionCount}
                 </span>
               )}
             </button>
           )}

           <button onClick={onHistoryClick} className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all" title={t.history}>
             <BookOpen className="w-4 h-4" />
           </button>

           <div className="relative" ref={toolsRef}>
              <button onClick={() => setShowTools(!showTools)} className={`p-2 rounded-lg transition-all ${showTools ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white hover:bg-white/5'}`} title="Ferramentas">
                <Database className="w-4 h-4" />
              </button>
              {showTools && (
                <div className="absolute top-full right-0 mt-4 w-56 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-1.5 z-[120]">
                   <button onClick={onExport} className="w-full text-left px-4 py-2.5 text-[8px] text-slate-400 hover:bg-brand-600 hover:text-white rounded-xl font-black uppercase tracking-widest flex items-center gap-3">
                      <Download className="w-4 h-4" /> Exportar Backup
                   </button>
                   <button onClick={handleImportClick} className="w-full text-left px-4 py-2.5 text-[8px] text-slate-400 hover:bg-brand-600 hover:text-white rounded-xl font-black uppercase tracking-widest flex items-center gap-3">
                      <Upload className="w-4 h-4" /> Importar Backup
                   </button>
                   <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileChange} />
                </div>
              )}
           </div>
        </nav>

        {/* Lado Direito: Login & Idioma Mais Delicados */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:flex bg-white/5 rounded-lg p-0.5 border border-white/5">
            <button onClick={() => setLanguage('pt')} className={`px-3 py-1 rounded-md text-[8px] font-black transition-all ${language === 'pt' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>PT</button>
            <button onClick={() => setLanguage('it')} className={`px-3 py-1 rounded-md text-[8px] font-black transition-all ${language === 'it' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>IT</button>
          </div>

          {currentUser ? (
            <button onClick={onLogout} className="flex items-center gap-2 p-1 bg-slate-800 hover:bg-red-600/10 text-white border border-white/5 rounded-full transition-all group" title="Sair">
               <div className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center text-[8px] font-black shadow-inner">
                 {currentUser[0].toUpperCase()}
               </div>
               <LogOut className="w-3.5 h-3.5 opacity-30 group-hover:opacity-100 group-hover:text-red-400 mr-1" />
            </button>
          ) : (
            <button onClick={onAdminToggle} className="flex items-center gap-2 px-4 py-2 bg-amber-500/90 text-slate-950 hover:bg-white hover:text-brand-600 rounded-full transition-all text-[9px] font-black uppercase tracking-widest shadow-lg active:scale-95">
              <Lock className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Entrar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
