
import React, { useRef, useState, useEffect } from 'react';
import { 
  Ticket, Lock, LogOut, BookOpen, Home, 
  BarChart2, ChevronDown, Globe, User, 
  Info, Database, FileJson, ClipboardList, ChevronRight, Map as MapIcon, Radio, Menu, X as CloseIcon,
  Download, Upload
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
}

export const Header: React.FC<HeaderProps> = ({ 
  isAdmin, currentUser, onAdminToggle, onLogout, 
  onHistoryClick, onRadioClick, onExport, onExportTXT, onImport,
  language, setLanguage,
  currentPage, onNavigate, t,
  countriesByContinent = {},
  onCountrySelect,
  recentCount = 0
}) => {
  const [showTools, setShowTools] = useState(false);
  const [showExplore, setShowExplore] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
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
    <header className="flex items-center justify-between px-6 lg:px-10 py-3 bg-gradient-to-b from-slate-900/95 via-[#020617]/98 to-[#020617] border-b border-white/5 sticky top-0 z-[110] shadow-[0_10px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl h-[70px] md:h-[85px]">
      
      {/* Logo Area */}
      <div className="flex items-center gap-4 cursor-pointer group shrink-0" onClick={() => onNavigate('home')}>
        <div className="bg-brand-600 p-2.5 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.4)] relative border border-white/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
          <Ticket className="w-6 h-6 text-white" />
          {recentCount > 0 && (
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-[#020617] animate-pulse shadow-lg"></div>
          )}
        </div>
        <div className="flex flex-col">
          <h1 className="text-base md:text-2xl font-black text-white leading-none tracking-tighter uppercase italic group-hover:text-brand-400 transition-colors">
            {t.title}
          </h1>
          <span className="hidden sm:inline text-[9px] md:text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1 group-hover:text-brand-500 transition-colors">
            {t.subtitle} 🐉
          </span>
        </div>
      </div>

      {/* Desktop Navigation - Increased spacing and refined labels */}
      <nav className="hidden xl:flex items-center gap-2">
         <button 
           onClick={() => onNavigate('home')}
           className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-2.5 transition-all relative ${currentPage === 'home' ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/40' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
         >
           <Home className="w-4 h-4" /> {t.home}
         </button>

         <div className="relative" ref={exploreRef}>
            <button onClick={() => setShowExplore(!showExplore)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-2.5 transition-all ${showExplore ? 'bg-slate-800 text-white shadow-xl' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <Globe className="w-4 h-4" /> {t.explore} <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${showExplore ? 'rotate-180' : ''}`} />
            </button>
            
            {showExplore && (
              <div className="absolute top-full left-0 mt-4 flex z-[120] animate-fade-in">
                <div className="w-60 bg-[#0a0f1e]/95 border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-2 backdrop-blur-2xl">
                   {continents.map(cont => {
                     const countries = countriesByContinent[cont] || [];
                     return (
                       <div key={cont} className="relative" onMouseEnter={() => setActiveSubMenu(cont)}>
                         <button 
                           onClick={() => { 
                             onNavigate('home'); 
                             onCountrySelect?.(cont, ''); 
                             setShowExplore(false); 
                           }} 
                           className={`w-full text-left px-5 py-3.5 text-[10px] rounded-2xl transition-all flex items-center justify-between font-black uppercase tracking-widest ${activeSubMenu === cont ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}
                         >
                           <span className="flex items-center gap-3">
                             <MapIcon className="w-4 h-4 opacity-70" /> {cont}
                           </span>
                           {countries.length > 0 && <ChevronRight className="w-3.5 h-3.5 opacity-40" />}
                         </button>
                       </div>
                     );
                   })}
                </div>

                {activeSubMenu && countriesByContinent[activeSubMenu]?.length > 0 && (
                   <div className="ml-3 w-72 bg-[#0a0f1e]/95 border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-3 backdrop-blur-2xl animate-fade-in max-h-[450px] overflow-y-auto custom-scrollbar">
                      <div className="px-4 py-3 border-b border-white/5 mb-3">
                         <span className="text-[9px] font-black text-brand-400 uppercase tracking-[0.3em]">Territórios do Arquivo</span>
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        {countriesByContinent[activeSubMenu].sort().map(country => (
                          <button 
                            key={country}
                            onClick={() => {
                               onNavigate('home');
                               onCountrySelect?.(activeSubMenu as Continent, country);
                               setShowExplore(false);
                            }}
                            className="w-full text-left px-4 py-3 text-[10px] text-slate-400 hover:bg-brand-600 hover:text-white rounded-2xl transition-all font-black uppercase tracking-widest flex items-center gap-3 group"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-white transition-all"></div>
                            {country}
                          </button>
                        ))}
                      </div>
                   </div>
                )}
              </div>
            )}
         </div>

         <button onClick={() => onNavigate('map')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-2.5 transition-all ${currentPage === 'map' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
           <MapIcon className="w-4 h-4" /> Mapa
         </button>

         <button onClick={() => onNavigate('stats')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-2.5 transition-all ${currentPage === 'stats' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
           <BarChart2 className="w-4 h-4" /> {t.stats}
         </button>

         <button onClick={() => onNavigate('about')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-2.5 transition-all ${currentPage === 'about' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
           <Info className="w-4 h-4" /> Sobre
         </button>

         <button onClick={onRadioClick} className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-2.5 transition-all text-slate-400 hover:text-white hover:bg-white/5">
           <Radio className="w-4 h-4 text-brand-500 animate-pulse" /> Rádios
         </button>

         <div className="relative" ref={toolsRef}>
            <button onClick={() => setShowTools(!showTools)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-2.5 transition-all ${showTools ? 'bg-slate-800 text-white shadow-xl' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <Database className="w-4 h-4" /> Dados <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${showTools ? 'rotate-180' : ''}`} />
            </button>
            {showTools && (
              <div className="absolute top-full right-0 mt-4 w-64 bg-[#0a0f1e]/95 border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-3 z-[120] animate-fade-in backdrop-blur-2xl">
                 <button onClick={onExport} className="w-full text-left px-4 py-3.5 text-[10px] text-slate-300 hover:bg-brand-600 hover:text-white rounded-2xl font-black uppercase tracking-widest flex items-center gap-4 transition-all">
                    <Download className="w-4 h-4 text-brand-400" /> Exportar Backup
                 </button>
                 <button onClick={handleImportClick} className="w-full text-left px-4 py-3.5 text-[10px] text-slate-300 hover:bg-emerald-600 hover:text-white rounded-2xl font-black uppercase tracking-widest flex items-center gap-4 transition-all">
                    <Upload className="w-4 h-4 text-emerald-400" /> Importar Backup
                 </button>
                 <div className="h-px bg-white/5 my-2 mx-3"></div>
                 <button onClick={onExportTXT} className="w-full text-left px-4 py-3.5 text-[10px] text-slate-300 hover:bg-orange-600 hover:text-white rounded-2xl font-black uppercase tracking-widest flex items-center gap-4 transition-all">
                    <ClipboardList className="w-4 h-4 text-orange-400" /> Checklist (TXT)
                 </button>
                 <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileChange} />
              </div>
            )}
         </div>
      </nav>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex bg-white/5 rounded-2xl p-1.5 border border-white/10 backdrop-blur-md">
          <button onClick={() => setLanguage('pt')} className={`px-3 py-1.5 rounded-xl text-[9px] font-black transition-all ${language === 'pt' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>PT</button>
          <button onClick={() => setLanguage('it')} className={`px-3 py-1.5 rounded-xl text-[9px] font-black transition-all ${language === 'it' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>IT</button>
        </div>

        <button onClick={onHistoryClick} className="hidden lg:flex items-center gap-3 px-6 py-2.5 bg-brand-600/10 text-brand-400 border border-brand-600/30 rounded-2xl hover:bg-brand-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-brand-900/10">
          <BookOpen className="w-4 h-4" /> {t.history}
        </button>

        {currentUser ? (
          <button onClick={onLogout} className="flex items-center gap-3 px-5 py-2.5 bg-slate-800 hover:bg-red-600/20 hover:text-red-400 text-white border border-white/10 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest shadow-xl">
             <div className="w-5 h-5 rounded-full bg-brand-600 flex items-center justify-center text-[10px]">
               {currentUser[0]}
             </div>
             <span className="hidden sm:inline">{currentUser.split(' ')[0]}</span> 
             <LogOut className="w-4 h-4 opacity-40" />
          </button>
        ) : (
          <button onClick={onAdminToggle} className="flex items-center gap-3 px-6 py-2.5 bg-white text-slate-950 hover:bg-brand-500 hover:text-white rounded-2xl transition-all text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(255,255,255,0.15)] active:scale-95">
            <Lock className="w-4 h-4" /> <span className="hidden sm:inline">{t.loginBtn}</span>
          </button>
        )}

        <button 
          onClick={() => setShowMobileMenu(!showMobileMenu)} 
          className="xl:hidden p-2 text-brand-500 hover:bg-white/5 rounded-xl transition-all"
        >
          {showMobileMenu ? <CloseIcon className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
        </button>
      </div>

      {/* Mobile Menu - Enhanced with glassmorphism */}
      {showMobileMenu && (
        <div className="fixed inset-0 top-[70px] bg-[#020617]/98 z-[105] flex flex-col p-8 gap-4 animate-fade-in xl:hidden overflow-y-auto backdrop-blur-3xl">
          <button onClick={() => { onNavigate('home'); setShowMobileMenu(false); }} className="flex items-center gap-5 text-sm font-black uppercase tracking-widest text-slate-300 p-5 bg-white/5 border border-white/10 rounded-3xl active:bg-brand-600 active:text-white transition-all"><Home className="w-6 h-6 text-brand-500" /> {t.home}</button>
          <button onClick={() => { onNavigate('map'); setShowMobileMenu(false); }} className="flex items-center gap-5 text-sm font-black uppercase tracking-widest text-slate-300 p-5 bg-white/5 border border-white/10 rounded-3xl active:bg-brand-600 active:text-white transition-all"><MapIcon className="w-6 h-6 text-brand-500" /> Mapa Mundial</button>
          <button onClick={() => { onNavigate('stats'); setShowMobileMenu(false); }} className="flex items-center gap-5 text-sm font-black uppercase tracking-widest text-slate-300 p-5 bg-white/5 border border-white/10 rounded-3xl active:bg-brand-600 active:text-white transition-all"><BarChart2 className="w-6 h-6 text-brand-500" /> Estatísticas</button>
          <button onClick={() => { onNavigate('about'); setShowMobileMenu(false); }} className="flex items-center gap-5 text-sm font-black uppercase tracking-widest text-slate-300 p-5 bg-white/5 border border-white/10 rounded-3xl active:bg-brand-600 active:text-white transition-all"><Info className="w-6 h-6 text-brand-500" /> Sobre o Legado</button>
          <button onClick={() => { onRadioClick(); setShowMobileMenu(false); }} className="flex items-center gap-5 text-sm font-black uppercase tracking-widest text-slate-300 p-5 bg-white/5 border border-white/10 rounded-3xl active:bg-brand-600 active:text-white transition-all"><Radio className="w-6 h-6 text-brand-500" /> Rádios PT</button>
          <button onClick={() => { onHistoryClick(); setShowMobileMenu(false); }} className="flex items-center gap-5 text-sm font-black uppercase tracking-widest text-slate-300 p-5 bg-white/5 border border-white/10 rounded-3xl active:bg-brand-600 active:text-white transition-all"><BookOpen className="w-6 h-6 text-brand-500" /> Biblioteca</button>
          <div className="h-px bg-white/10 my-4"></div>
          <button onClick={() => { onExport(); setShowMobileMenu(false); }} className="flex items-center gap-5 text-sm font-black uppercase tracking-widest text-slate-300 p-5 bg-white/5 border border-white/10 rounded-3xl active:bg-brand-600 active:text-white transition-all"><Database className="w-6 h-6 text-brand-500" /> Exportar Backup</button>
        </div>
      )}
    </header>
  );
};
