
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
    <header className="fixed top-6 left-1/2 -translate-x-1/2 z-[110] w-[95%] max-w-7xl pointer-events-none">
      <div className="bg-slate-900/95 backdrop-blur-3xl border border-white/20 rounded-full h-16 md:h-20 shadow-[0_25px_60px_rgba(0,0,0,0.8)] flex items-center justify-between px-6 md:px-10 pointer-events-auto transition-all">
        
        {/* Logo Minimalista */}
        <div className="flex items-center gap-4 cursor-pointer group shrink-0" onClick={() => onNavigate('home')}>
          <div className="bg-brand-600 p-2 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
            <Ticket className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="hidden md:block text-lg font-black text-white uppercase italic tracking-tighter leading-none">
              {t.title}
            </h1>
            <span className="hidden md:block text-[8px] text-brand-400 font-black uppercase tracking-[0.2em] mt-1">Vovô Jorge 🐉</span>
          </div>
        </div>

        {/* Navegação Central Compacta */}
        <nav className="flex items-center gap-1 md:gap-2">
           <button onClick={() => onNavigate('home')} className={`p-3 rounded-full transition-all ${currentPage === 'home' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/10'}`} title={t.home}>
             <Home className="w-5 h-5 md:w-6 md:h-6" />
           </button>

           <div className="relative" ref={exploreRef}>
              <button onClick={() => setShowExplore(!showExplore)} className={`p-3 rounded-full transition-all flex items-center gap-1 ${showExplore ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10'}`} title={t.explore}>
                <Globe className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              
              {showExplore && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-6 flex z-[120] animate-bounce-in">
                  <div className="flex gap-2">
                    {/* Lista de Continentes */}
                    <div className="w-56 bg-slate-900 border border-white/20 rounded-2xl shadow-2xl p-2 backdrop-blur-2xl h-fit">
                       {continents.map(cont => (
                         <button 
                           key={cont} 
                           onMouseEnter={() => setActiveSubMenu(cont)} 
                           onClick={() => { onNavigate('home'); onCountrySelect?.(cont, ''); setShowExplore(false); }} 
                           className={`w-full text-left px-5 py-3 text-[11px] rounded-xl transition-all flex items-center justify-between font-black uppercase tracking-widest ${activeSubMenu === cont ? 'bg-brand-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}
                         >
                           {cont}
                           <ChevronRight className={`w-3 h-3 transition-transform ${activeSubMenu === cont ? 'translate-x-1' : 'opacity-0'}`} />
                         </button>
                       ))}
                    </div>

                    {/* Lista de Países (Submenu Dinâmico) */}
                    {activeSubMenu && countriesByContinent[activeSubMenu] && countriesByContinent[activeSubMenu].length > 0 && (
                      <div className="w-64 bg-slate-900 border border-white/20 rounded-2xl shadow-2xl p-2 backdrop-blur-2xl max-h-[400px] overflow-y-auto custom-scrollbar animate-fade-in">
                        <div className="px-4 py-2 border-b border-white/5 mb-1">
                          <span className="text-[9px] font-black text-brand-400 uppercase tracking-widest">{activeSubMenu}</span>
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
                            className="w-full text-left px-4 py-2.5 text-[10px] text-slate-400 hover:text-white hover:bg-brand-600 rounded-lg transition-all font-black uppercase tracking-widest flex items-center gap-2"
                          >
                            <MapPin className="w-3 h-3" /> {country}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
           </div>

           <button onClick={() => onNavigate('map')} className={`p-3 rounded-full transition-all ${currentPage === 'map' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/10'}`} title="Mapa">
             <MapIcon className="w-5 h-5 md:w-6 md:h-6" />
           </button>

           <button onClick={() => onNavigate('stats')} className={`p-3 rounded-full transition-all ${currentPage === 'stats' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/10'}`} title={t.stats}>
             <BarChart2 className="w-5 h-5 md:w-6 md:h-6" />
           </button>

           {currentUser && (
             <button onClick={() => onNavigate('collection')} className={`p-3 rounded-full transition-all flex items-center gap-1 relative ${currentPage === 'collection' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/10'}`} title={t.myCollection}>
               <Star className={`w-5 h-5 md:w-6 md:h-6 ${currentPage === 'collection' ? 'fill-current' : ''}`} />
               {collectionCount > 0 && (
                 <span className="absolute top-1 right-1 bg-brand-500 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full border border-slate-900">
                   {collectionCount}
                 </span>
               )}
             </button>
           )}

           <button onClick={onHistoryClick} className="p-3 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all" title={t.history}>
             <BookOpen className="w-5 h-5 md:w-6 md:h-6" />
           </button>

           <div className="relative" ref={toolsRef}>
              <button onClick={() => setShowTools(!showTools)} className={`p-3 rounded-full transition-all ${showTools ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10'}`} title="Ferramentas">
                <Database className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              {showTools && (
                <div className="absolute top-full right-0 mt-6 w-64 bg-slate-900 border border-white/20 rounded-2xl shadow-2xl p-3 z-[120]">
                   <button onClick={onExport} className="w-full text-left px-5 py-3 text-[10px] text-slate-400 hover:bg-brand-600 hover:text-white rounded-xl font-black uppercase tracking-widest flex items-center gap-4">
                      <Download className="w-5 h-5" /> Exportar Backup
                   </button>
                   <button onClick={handleImportClick} className="w-full text-left px-5 py-3 text-[10px] text-slate-400 hover:bg-brand-600 hover:text-white rounded-xl font-black uppercase tracking-widest flex items-center gap-4">
                      <Upload className="w-5 h-5" /> Importar Backup
                   </button>
                   <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileChange} />
                </div>
              )}
           </div>
        </nav>

        {/* Lado Direito: Login & Idioma */}
        <div className="flex items-center gap-3 md:gap-5">
          <div className="hidden sm:flex bg-white/5 rounded-full p-1 border border-white/10">
            <button onClick={() => setLanguage('pt')} className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${language === 'pt' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>PT</button>
            <button onClick={() => setLanguage('it')} className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${language === 'it' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>IT</button>
          </div>

          {currentUser ? (
            <button onClick={onLogout} className="flex items-center gap-3 p-1.5 bg-slate-800 hover:bg-red-600/20 text-white border border-white/10 rounded-full transition-all group" title="Sair">
               <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-brand-600 flex items-center justify-center text-[11px] font-black shadow-inner">
                 {currentUser[0].toUpperCase()}
               </div>
               <LogOut className="w-5 h-5 opacity-40 group-hover:opacity-100 group-hover:text-red-400 mr-2" />
            </button>
          ) : (
            <button onClick={onAdminToggle} className="flex items-center gap-3 px-6 py-3 bg-amber-500 text-slate-950 hover:bg-white hover:text-brand-600 rounded-full transition-all text-[11px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-95">
              <Lock className="w-5 h-5" /> <span className="hidden sm:inline">Entrar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
