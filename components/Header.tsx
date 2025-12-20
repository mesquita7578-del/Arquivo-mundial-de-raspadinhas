
import React, { useRef, useState, useEffect } from 'react';
import { 
  Ticket, Lock, LogOut, BookOpen, Home, 
  BarChart2, ChevronDown, Globe, User, Smartphone, 
  Info, Database, FileJson, FileSpreadsheet, ClipboardList, UploadCloud, ChevronRight, MapPin, Map as MapIcon, Zap, Radio, Menu, X as CloseIcon
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
    <header className="flex items-center justify-between px-4 lg:px-8 py-2 bg-[#020617] border-b border-slate-900 sticky top-0 z-[110] shadow-2xl h-[70px] md:h-[80px]">
      
      {/* Logo Area */}
      <div className="flex items-center gap-3 cursor-pointer group shrink-0" onClick={() => onNavigate('home')}>
        <div className="bg-brand-500 p-2 rounded-xl shadow-[0_0_15px_rgba(0,168,255,0.4)] relative border border-white/20 group-hover:scale-105 transition-transform">
          <Ticket className="w-6 h-6 text-white" />
          {recentCount > 0 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-brand-500 animate-pulse"></div>
          )}
        </div>
        <div className="flex flex-col">
          <h1 className="text-sm md:text-xl font-black text-white leading-none tracking-tight uppercase italic group-hover:text-brand-500 transition-colors">
            {t.title}
          </h1>
          <span className="hidden sm:inline text-[9px] md:text-[10px] text-brand-400 font-bold uppercase tracking-[0.1em] mt-1">
            {t.subtitle} 🐉
          </span>
        </div>
      </div>

      {/* Desktop Navigation - Aparece a partir de MD agora (768px) */}
      <nav className="hidden md:flex items-center gap-1">
         <button 
           onClick={() => onNavigate('home')}
           className={`px-3 py-2 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all relative ${currentPage === 'home' ? 'bg-brand-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
         >
           <Home className="w-4 h-4" /> {t.home}
         </button>

         <div className="relative" ref={exploreRef}>
            <button onClick={() => setShowExplore(!showExplore)} className={`px-3 py-2 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${showExplore ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <Globe className="w-4 h-4" /> {t.explore} <ChevronDown className={`w-3 h-3 transition-transform ${showExplore ? 'rotate-180' : ''}`} />
            </button>
            {showExplore && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-[#0a0f1e] border border-slate-800 rounded-xl shadow-2xl p-2 z-[120] animate-fade-in">
                 {['Europa', 'América', 'Ásia', 'África', 'Oceania'].map(cont => {
                   const countries = countriesByContinent[cont] || [];
                   return (
                     <div key={cont} className="relative" onMouseEnter={() => setActiveSubMenu(cont)}>
                       <button onClick={() => { onNavigate('home'); onCountrySelect?.(cont as Continent, ''); setShowExplore(false); }} className={`w-full text-left px-3 py-2.5 text-[10px] rounded-lg transition-all flex items-center justify-between font-black uppercase tracking-widest ${activeSubMenu === cont ? 'bg-brand-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                         {cont} {countries.length > 0 && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
                       </button>
                     </div>
                   );
                 })}
              </div>
            )}
         </div>

         <button onClick={() => onNavigate('map')} className={`px-3 py-2 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${currentPage === 'map' ? 'bg-brand-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
           <MapIcon className="w-4 h-4" /> Mapa
         </button>

         <button onClick={() => onNavigate('stats')} className={`px-3 py-2 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${currentPage === 'stats' ? 'bg-brand-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
           <BarChart2 className="w-4 h-4" /> {t.stats}
         </button>

         <button onClick={onRadioClick} className="px-3 py-2 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all text-slate-400 hover:text-white hover:bg-slate-800">
           <Radio className="w-4 h-4 text-brand-500" /> Rádios
         </button>
      </nav>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex bg-slate-800/80 rounded-lg p-1 border border-slate-700">
          <button onClick={() => setLanguage('pt')} className={`px-2 py-1 rounded-md text-[9px] font-black transition-all ${language === 'pt' ? 'bg-brand-500 text-white' : 'text-slate-500'}`}>PT</button>
          <button onClick={() => setLanguage('it')} className={`px-2 py-1 rounded-md text-[9px] font-black transition-all ${language === 'it' ? 'bg-brand-500 text-white' : 'text-slate-500'}`}>IT</button>
        </div>

        <button onClick={onHistoryClick} className="hidden lg:flex items-center gap-2 px-4 py-2 bg-brand-500/10 text-brand-400 border border-brand-500/30 rounded-xl hover:bg-brand-500 hover:text-white transition-all text-[11px] font-black uppercase tracking-widest">
          <BookOpen className="w-4 h-4" /> {t.history}
        </button>

        {currentUser ? (
          <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl transition-all text-[11px] font-black uppercase tracking-widest">
             <User className="w-4 h-4 text-brand-400" /> <span className="hidden sm:inline">{currentUser.split(' ')[0]}</span> <LogOut className="w-3.5 h-3.5 ml-1 opacity-50" />
          </button>
        ) : (
          <button onClick={onAdminToggle} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-brand-500 text-white border border-slate-700 rounded-xl transition-all text-[11px] font-black uppercase tracking-widest shadow-lg">
            <Lock className="w-4 h-4" /> <span className="hidden sm:inline">{t.loginBtn}</span>
          </button>
        )}

        <button 
          onClick={() => setShowMobileMenu(!showMobileMenu)} 
          className="md:hidden p-2 text-brand-500 hover:text-white transition-colors"
        >
          {showMobileMenu ? <CloseIcon className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="fixed inset-0 top-[70px] bg-[#020617] z-[105] flex flex-col p-6 gap-3 animate-fade-in md:hidden overflow-y-auto">
          <button onClick={() => { onNavigate('home'); setShowMobileMenu(false); }} className="flex items-center gap-4 text-sm font-black uppercase tracking-widest text-slate-300 p-4 bg-slate-900/50 border border-slate-800 rounded-2xl active:bg-brand-500 active:text-white transition-all"><Home className="w-5 h-5 text-brand-500" /> {t.home}</button>
          <button onClick={() => { onNavigate('map'); setShowMobileMenu(false); }} className="flex items-center gap-4 text-sm font-black uppercase tracking-widest text-slate-300 p-4 bg-slate-900/50 border border-slate-800 rounded-2xl active:bg-brand-500 active:text-white transition-all"><MapIcon className="w-5 h-5 text-brand-500" /> Mapa Mundial</button>
          <button onClick={() => { onNavigate('stats'); setShowMobileMenu(false); }} className="flex items-center gap-4 text-sm font-black uppercase tracking-widest text-slate-300 p-4 bg-slate-900/50 border border-slate-800 rounded-2xl active:bg-brand-500 active:text-white transition-all"><BarChart2 className="w-5 h-5 text-brand-500" /> Estatísticas</button>
          <button onClick={() => { onRadioClick(); setShowMobileMenu(false); }} className="flex items-center gap-4 text-sm font-black uppercase tracking-widest text-slate-300 p-4 bg-slate-900/50 border border-slate-800 rounded-2xl active:bg-brand-500 active:text-white transition-all"><Radio className="w-5 h-5 text-brand-500" /> Rádios PT</button>
          <button onClick={() => { onHistoryClick(); setShowMobileMenu(false); }} className="flex items-center gap-4 text-sm font-black uppercase tracking-widest text-slate-300 p-4 bg-slate-900/50 border border-slate-800 rounded-2xl active:bg-brand-500 active:text-white transition-all"><BookOpen className="w-5 h-5 text-brand-500" /> Biblioteca</button>
        </div>
      )}
    </header>
  );
};
