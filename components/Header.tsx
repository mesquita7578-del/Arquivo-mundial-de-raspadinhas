
import React, { useRef, useState, useEffect } from 'react';
import { 
  Ticket, Lock, LogOut, BookOpen, Home, 
  BarChart2, ChevronDown, Globe, User, Smartphone, 
  Info, Database, FileJson, FileSpreadsheet, ClipboardList, UploadCloud, ChevronRight, MapPin, Map as MapIcon, Zap, Radio
} from 'lucide-react';
import { Language } from '../translations';
import { Continent } from '../types';

interface HeaderProps {
  isAdmin: boolean;
  currentUser?: string | null;
  onAdminToggle: () => void;
  onLogout: () => void;
  onHistoryClick: () => void;
  onRadioClick: () => void; // Nova prop
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
    <header className="flex items-center justify-between px-4 md:px-8 py-3 bg-slate-900 border-b border-slate-800 sticky top-0 z-[100] shadow-xl h-[70px]">
      
      <div className="flex items-center gap-3 cursor-pointer group shrink-0" onClick={() => onNavigate('home')}>
        <div className="bg-brand-600 p-2 rounded-lg shadow-lg relative border border-white/10">
          <Ticket className="w-6 h-6 text-white" />
          {recentCount > 0 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
          )}
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-black text-white leading-none tracking-tight uppercase italic">
            {t.title}
          </h1>
          <span className="text-[10px] text-brand-500 font-bold uppercase tracking-[0.1em] mt-1">
            {t.subtitle}
          </span>
        </div>
      </div>

      <nav className="hidden lg:flex items-center gap-1">
         {/* Botão Rádios PT à esquerda do Início */}
         <button 
           onClick={onRadioClick}
           className="px-4 py-2 rounded-full text-xs font-black flex items-center gap-2 transition-all bg-brand-900/20 text-brand-400 border border-brand-500/30 hover:bg-brand-600 hover:text-white mr-2 group"
         >
           <Radio className="w-4 h-4 group-hover:animate-pulse" /> Rádios PT
         </button>

         <button 
           onClick={() => onNavigate('home')}
           className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all relative ${currentPage === 'home' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
         >
           <Home className="w-4 h-4" /> {t.home}
           {recentCount > 0 && currentPage !== 'home' && (
             <span className="absolute -top-1 -right-1 bg-brand-600 text-[8px] px-1.5 py-0.5 rounded-full text-white border border-slate-900 animate-bounce">
               {recentCount}
             </span>
           )}
         </button>
         
         <div className="relative" ref={exploreRef}>
            <button onClick={() => setShowExplore(!showExplore)} className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${showExplore ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <Globe className="w-4 h-4" /> {t.explore} <ChevronDown className={`w-3 h-3 transition-transform ${showExplore ? 'rotate-180' : ''}`} />
            </button>
            {showExplore && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-[110] animate-fade-in">
                 {['Europa', 'América', 'Ásia', 'África', 'Oceania'].map(cont => {
                   const countries = countriesByContinent[cont] || [];
                   return (
                     <div key={cont} className="relative" onMouseEnter={() => setActiveSubMenu(cont)}>
                       <button onClick={() => { onNavigate('home'); onCountrySelect?.(cont as Continent, ''); setShowExplore(false); }} className={`w-full text-left px-4 py-3 text-sm rounded-lg transition-all flex items-center justify-between font-black uppercase tracking-widest ${activeSubMenu === cont ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                         {cont} {countries.length > 0 && <ChevronRight className="w-4 h-4 opacity-50" />}
                       </button>
                       {countries.length > 0 && activeSubMenu === cont && (
                          <div className="absolute left-full top-0 ml-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 max-h-[70vh] overflow-y-auto">
                             {countries.map(c => (
                                <button key={c} onClick={() => { onCountrySelect?.(cont as Continent, c); setShowExplore(false); }} className="w-full text-left px-4 py-2.5 text-xs font-black text-slate-300 hover:bg-brand-600 hover:text-white rounded-lg transition-all flex items-center gap-3 uppercase">
                                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> {c}
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

         <button onClick={() => onNavigate('map')} className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${currentPage === 'map' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
           <MapIcon className="w-4 h-4" /> Mapa
         </button>

         <button onClick={() => onNavigate('stats')} className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${currentPage === 'stats' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
           <BarChart2 className="w-4 h-4" /> {t.stats}
         </button>

         <button onClick={() => onNavigate('about')} className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${currentPage === 'about' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
           <Info className="w-4 h-4" /> {t.about}
         </button>
      </nav>

      <div className="flex items-center gap-3">
        <div className="flex bg-slate-800/80 rounded-lg p-1 border border-slate-700">
          <button onClick={() => setLanguage('pt')} className={`px-3 py-1 rounded-md text-[10px] font-black transition-all ${language === 'pt' ? 'bg-slate-600 text-white' : 'text-slate-500'}`}>PT</button>
          <button onClick={() => setLanguage('it')} className={`px-3 py-1 rounded-md text-[10px] font-black transition-all ${language === 'it' ? 'bg-slate-600 text-white' : 'text-slate-500'}`}>IT</button>
        </div>

        <button onClick={onHistoryClick} className="flex items-center gap-2 px-4 py-2 bg-blue-900/30 text-blue-400 border border-blue-800 rounded-md hover:bg-blue-900/50 transition-all text-xs font-bold">
          <BookOpen className="w-4 h-4" /> {t.history}
        </button>

        {isAdmin && (
           <div className="relative">
              <button onClick={() => setShowTools(!showTools)} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md border border-slate-700 transition-all flex items-center gap-2">
                <Database className="w-4 h-4" /> <span className="hidden xl:inline text-[10px] font-black uppercase">JSON</span>
              </button>
              {showTools && (
                 <div className="absolute right-0 mt-3 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 animate-fade-in flex flex-col gap-1 z-[70]">
                    <button onClick={() => { onExport(); setShowTools(false); }} className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold text-slate-300 hover:bg-brand-600 hover:text-white rounded-lg transition-all"><FileJson className="w-4 h-4" /> {t.exportBackup}</button>
                    <button onClick={handleImportClick} className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold text-slate-300 hover:bg-blue-600 hover:text-white rounded-lg transition-all"><UploadCloud className="w-4 h-4" /> {t.importBackup}</button>
                 </div>
              )}
           </div>
        )}

        <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileChange} />

        {currentUser ? (
          <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-md transition-all text-xs font-bold uppercase">
             <User className="w-4 h-4" /> {currentUser.split(' ')[0]} <LogOut className="w-3.5 h-3.5 ml-1 opacity-50" />
          </button>
        ) : (
          <button onClick={onAdminToggle} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-md transition-all text-xs font-bold uppercase">
            <Lock className="w-3.5 h-3.5" /> {t.loginBtn}
          </button>
        )}
      </div>
    </header>
  );
};
