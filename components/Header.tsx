
import React, { useRef, useState, useEffect } from 'react';
import { 
  Ticket, Lock, LogOut, BookOpen, Home, 
  BarChart2, ChevronDown, Globe, User, Smartphone, 
  Info, Database, FileJson, FileSpreadsheet, ClipboardList, UploadCloud, ChevronRight, MapPin, Map as MapIcon, Zap, Radio, Menu
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
  onHistoryClick, onRadioClick, onExport, onExportCSV, onExportTXT, onImport,
  language, setLanguage,
  currentPage, onNavigate, t, onInstall,
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exploreRef.current && !exploreRef.current.contains(event.target as Node)) {
        setShowExplore(false);
        setActiveSubMenu(null);
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

  return (
    <header className="flex items-center justify-between px-3 md:px-8 py-2 bg-[#020617] border-b border-slate-900 sticky top-0 z-[100] shadow-xl h-[65px] md:h-[75px]">
      
      <div className="flex items-center gap-2 md:gap-3 cursor-pointer group shrink-0" onClick={() => onNavigate('home')}>
        <div className="bg-brand-500 p-1.5 md:p-2 rounded-lg shadow-[0_0_15px_rgba(0,168,255,0.4)] relative border border-white/20 group-hover:scale-105 transition-transform">
          <Ticket className="w-5 h-5 md:w-6 md:h-6 text-white" />
          {recentCount > 0 && (
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full border-2 border-brand-500 animate-pulse"></div>
          )}
        </div>
        <div className="flex flex-col">
          <h1 className="text-sm md:text-xl font-black text-white leading-none tracking-tight uppercase italic group-hover:text-brand-500 transition-colors">
            {t.title}
          </h1>
          <span className="hidden sm:inline text-[8px] md:text-[10px] text-brand-400 font-bold uppercase tracking-[0.1em] mt-1">
            {t.subtitle} 🐉
          </span>
        </div>
      </div>

      <nav className="hidden md:flex items-center gap-0.5 xl:gap-1">
         <button 
           onClick={onRadioClick}
           className="px-2 xl:px-4 py-2 rounded-full text-[10px] xl:text-xs font-black flex items-center gap-1.5 transition-all bg-brand-500/10 text-brand-400 border border-brand-500/30 hover:bg-brand-500 hover:text-white mr-1 group neon-glow-blue"
         >
           <Radio className="w-3.5 h-3.5 group-hover:animate-pulse" /> Rádios
         </button>

         <button 
           onClick={() => onNavigate('home')}
           className={`px-3 xl:px-4 py-2 rounded-full text-xs xl:text-sm font-bold flex items-center gap-1.5 transition-all relative ${currentPage === 'home' ? 'bg-brand-500 text-white shadow-[0_0_15px_rgba(0,168,255,0.4)]' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
         >
           <Home className="w-3.5 h-3.5" /> {t.home}
         </button>
         
         <div className="relative" ref={exploreRef}>
            <button onClick={() => setShowExplore(!showExplore)} className={`px-3 xl:px-4 py-2 rounded-full text-xs xl:text-sm font-bold flex items-center gap-1.5 transition-all ${showExplore ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <Globe className="w-3.5 h-3.5" /> {t.explore} <ChevronDown className={`w-3 h-3 transition-transform ${showExplore ? 'rotate-180' : ''}`} />
            </button>
            {showExplore && (
              <div className="absolute top-full left-0 mt-2 w-56 xl:w-64 bg-[#0a0f1e] border border-slate-800 rounded-xl shadow-2xl p-2 z-[110] animate-fade-in neon-border-blue">
                 {['Europa', 'América', 'Ásia', 'África', 'Oceania'].map(cont => {
                   const countries = countriesByContinent[cont] || [];
                   return (
                     <div key={cont} className="relative" onMouseEnter={() => setActiveSubMenu(cont)}>
                       <button onClick={() => { onNavigate('home'); onCountrySelect?.(cont as Continent, ''); setShowExplore(false); }} className={`w-full text-left px-3 py-2.5 text-[10px] xl:text-xs rounded-lg transition-all flex items-center justify-between font-black uppercase tracking-widest ${activeSubMenu === cont ? 'bg-brand-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                         {cont} {countries.length > 0 && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
                       </button>
                       {countries.length > 0 && activeSubMenu === cont && (
                          <div className="absolute left-full top-0 ml-2 w-64 bg-[#0a0f1e] border border-slate-800 rounded-xl shadow-2xl p-2 max-h-[70vh] overflow-y-auto neon-border-blue">
                             {countries.map(c => (
                                <button key={c} onClick={() => { onCountrySelect?.(cont as Continent, c); setShowExplore(false); }} className="w-full text-left px-4 py-2 text-[10px] font-black text-slate-300 hover:bg-brand-500 hover:text-white rounded-lg transition-all flex items-center gap-2 uppercase">
                                   <div className="w-1 h-1 rounded-full bg-brand-400"></div> {c}
                                </button>
                             ))}
                          </div>
                       )}
                     </div>
                   );
                 })}
              </div>
            )}
         </div>

         <button onClick={() => onNavigate('map')} className={`px-3 xl:px-4 py-2 rounded-full text-xs xl:text-sm font-bold flex items-center gap-1.5 transition-all ${currentPage === 'map' ? 'bg-brand-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
           <MapIcon className="w-3.5 h-3.5" /> Mapa
         </button>

         <button onClick={() => onNavigate('stats')} className={`px-3 xl:px-4 py-2 rounded-full text-xs xl:text-sm font-bold flex items-center gap-1.5 transition-all ${currentPage === 'stats' ? 'bg-brand-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
           <BarChart2 className="w-3.5 h-3.5" /> {t.stats}
         </button>
      </nav>

      <div className="flex items-center gap-1.5 md:gap-3">
        <div className="hidden sm:flex bg-slate-800/80 rounded-lg p-0.5 md:p-1 border border-slate-700">
          <button onClick={() => setLanguage('pt')} className={`px-2 py-0.5 rounded-md text-[8px] md:text-[10px] font-black transition-all ${language === 'pt' ? 'bg-brand-500 text-white shadow-md' : 'text-slate-500'}`}>PT</button>
          <button onClick={() => setLanguage('it')} className={`px-2 py-0.5 rounded-md text-[8px] md:text-[10px] font-black transition-all ${language === 'it' ? 'bg-brand-500 text-white shadow-md' : 'text-slate-500'}`}>IT</button>
        </div>

        <button onClick={onHistoryClick} className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-brand-500/10 text-brand-400 border border-brand-500/30 rounded-md hover:bg-brand-500 hover:text-white transition-all text-[10px] md:text-xs font-bold uppercase tracking-widest shrink-0">
          <BookOpen className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span className="hidden sm:inline">{t.history}</span>
        </button>

        {isAdmin && (
           <div className="relative">
              <button onClick={() => setShowTools(!showTools)} className={`p-2 md:p-2.5 bg-slate-800 hover:bg-brand-500 text-slate-300 hover:text-white rounded-md border border-slate-700 transition-all flex items-center gap-2 ${showTools ? 'ring-2 ring-brand-400 shadow-[0_0_10px_rgba(0,168,255,0.4)]' : ''}`}>
                <Database className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span className="hidden lg:inline text-[10px] font-black uppercase">DNA</span>
              </button>
              {showTools && (
                 <div className="absolute right-0 mt-3 w-56 xl:w-64 bg-[#0a0f1e] border border-slate-800 rounded-xl shadow-2xl p-2 animate-fade-in flex flex-col gap-1 z-[70] neon-border-blue">
                    <button onClick={() => { onExport(); setShowTools(false); }} className="flex items-center gap-3 w-full px-4 py-3 text-[10px] font-bold text-slate-300 hover:bg-brand-500 hover:text-white rounded-lg transition-all"><FileJson className="w-4 h-4" /> {t.exportBackup}</button>
                    <button onClick={handleImportClick} className="flex items-center gap-3 w-full px-4 py-3 text-[10px] font-bold text-slate-300 hover:bg-brand-500 hover:text-white rounded-lg transition-all"><UploadCloud className="w-4 h-4" /> {t.importBackup}</button>
                 </div>
              )}
           </div>
        )}

        <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileChange} />

        {currentUser ? (
          <button onClick={onLogout} className="flex items-center gap-1.5 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-md transition-all text-[10px] md:text-xs font-black uppercase tracking-widest shrink-0">
             <User className="w-3.5 h-3.5 text-brand-400" /> <span className="hidden sm:inline">{currentUser.split(' ')[0]}</span> <LogOut className="w-3 h-3 md:w-3.5 md:h-3.5 ml-0.5 opacity-50" />
          </button>
        ) : (
          <button onClick={onAdminToggle} className="flex items-center gap-1.5 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-slate-800 hover:bg-brand-500 text-white border border-slate-700 rounded-md transition-all text-[10px] md:text-xs font-black uppercase tracking-widest shadow-lg shrink-0">
            <Lock className="w-3 h-3 md:w-3.5 md:h-3.5" /> <span className="hidden sm:inline">{t.loginBtn}</span>
          </button>
        )}

        <button 
          onClick={() => setShowMobileMenu(!showMobileMenu)} 
          className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 top-[65px] bg-[#020617] z-[99] flex flex-col p-6 gap-4 animate-fade-in md:hidden">
          <button onClick={() => { onNavigate('home'); setShowMobileMenu(false); }} className="flex items-center gap-4 text-lg font-black uppercase tracking-widest text-slate-300 p-4 bg-slate-900 rounded-2xl"><Home className="w-6 h-6 text-brand-500" /> {t.home}</button>
          <button onClick={() => { onNavigate('map'); setShowMobileMenu(false); }} className="flex items-center gap-4 text-lg font-black uppercase tracking-widest text-slate-300 p-4 bg-slate-900 rounded-2xl"><MapIcon className="w-6 h-6 text-brand-500" /> Mapa</button>
          <button onClick={() => { onNavigate('stats'); setShowMobileMenu(false); }} className="flex items-center gap-4 text-lg font-black uppercase tracking-widest text-slate-300 p-4 bg-slate-900 rounded-2xl"><BarChart2 className="w-6 h-6 text-brand-500" /> {t.stats}</button>
          <button onClick={() => { onNavigate('about'); setShowMobileMenu(false); }} className="flex items-center gap-4 text-lg font-black uppercase tracking-widest text-slate-300 p-4 bg-slate-900 rounded-2xl"><Info className="w-6 h-6 text-brand-500" /> Sobre</button>
          <div className="mt-auto flex justify-between p-4">
            <button onClick={() => setLanguage('pt')} className={`px-6 py-3 rounded-xl font-black ${language === 'pt' ? 'bg-brand-500 text-white' : 'bg-slate-800 text-slate-500'}`}>PT</button>
            <button onClick={() => setLanguage('it')} className={`px-6 py-3 rounded-xl font-black ${language === 'it' ? 'bg-brand-500 text-white' : 'bg-slate-800 text-slate-500'}`}>IT</button>
          </div>
        </div>
      )}
    </header>
  );
};
