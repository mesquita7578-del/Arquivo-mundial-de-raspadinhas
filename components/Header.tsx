
import React, { useRef, useState } from 'react';
import { 
  Ticket, Lock, LogOut, BookOpen, Home, 
  BarChart2, ChevronDown, Globe, User, Smartphone, 
  Info, Database, FileJson, FileSpreadsheet, ClipboardList, UploadCloud, ChevronRight, MapPin
} from 'lucide-react';
import { Language } from '../translations';
import { Continent } from '../types';

interface HeaderProps {
  isAdmin: boolean;
  currentUser?: string | null;
  onAdminToggle: () => void;
  onLogout: () => void;
  onHistoryClick: () => void;
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
}

export const Header: React.FC<HeaderProps> = ({ 
  isAdmin, currentUser, onAdminToggle, onLogout, 
  onHistoryClick, onExport, onExportCSV, onExportTXT, onImport,
  language, setLanguage,
  currentPage, onNavigate, t, onInstall,
  countriesByContinent = {},
  onCountrySelect
}) => {
  const [showTools, setShowTools] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    <header className="flex items-center justify-between px-4 md:px-8 py-3 bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-md h-[70px]">
      
      {/* Lado Esquerdo: Logo */}
      <div className="flex items-center gap-3 cursor-pointer group shrink-0" onClick={() => onNavigate('home')}>
        <div className="bg-brand-600 p-2 rounded-lg shadow-lg">
          <Ticket className="w-6 h-6 text-white" />
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

      {/* Centro: Navegação Principal */}
      <nav className="hidden lg:flex items-center gap-1">
         <button 
           onClick={() => onNavigate('home')}
           className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${currentPage === 'home' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
         >
           <Home className="w-4 h-4" /> {t.home}
         </button>
         
         <div className="relative group">
            <button className="px-4 py-2 rounded-full text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 flex items-center gap-2 transition-all">
              <Globe className="w-4 h-4" /> {t.explore} <ChevronDown className="w-3 h-3 transition-transform group-hover:rotate-180" />
            </button>
            
            {/* Dropdown de Continentes (Pai) */}
            <div className="absolute top-full left-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-2 z-[60]">
               {['Europa', 'América', 'Ásia', 'África', 'Oceania'].map(cont => {
                 const countries = countriesByContinent[cont] || [];
                 const hasCountries = countries.length > 0;

                 return (
                   <div 
                      key={cont} 
                      className="relative group/sub"
                      onMouseEnter={() => setActiveSubMenu(cont)}
                      onMouseLeave={() => setActiveSubMenu(null)}
                   >
                     <button 
                        onClick={() => onNavigate(cont.toLowerCase().replace('é', 'e').replace('á', 'a') as any)} 
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all flex items-center justify-between font-bold"
                     >
                       {cont}
                       {hasCountries && <ChevronRight className="w-3 h-3 opacity-50" />}
                     </button>

                     {/* Submenu de Países (Filho) */}
                     {hasCountries && (
                        <div className="absolute left-full top-0 ml-1 w-64 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all p-2 max-h-[70vh] overflow-y-auto custom-scrollbar">
                           <div className="px-3 py-2 border-b border-slate-800 mb-2">
                              <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest flex items-center gap-2">
                                 <MapPin className="w-3 h-3" /> {t.exploreCountries} {cont}
                              </span>
                           </div>
                           {countries.map(country => (
                              <button 
                                 key={country}
                                 onClick={() => onCountrySelect?.(cont as Continent, country)}
                                 className="w-full text-left px-4 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-blue-600 rounded-lg transition-all flex items-center gap-3"
                              >
                                 <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                 {country}
                              </button>
                           ))}
                        </div>
                     )}
                   </div>
                 );
               })}
            </div>
         </div>

         <button 
           onClick={() => onNavigate('stats')}
           className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${currentPage === 'stats' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
         >
           <BarChart2 className="w-4 h-4" /> {t.stats}
         </button>

         <button 
           onClick={() => onNavigate('about')}
           className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${currentPage === 'about' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
         >
           <Info className="w-4 h-4" /> {t.about}
         </button>
      </nav>

      {/* Lado Direito: Ações */}
      <div className="flex items-center gap-3">
        {onInstall && (
           <button 
             onClick={onInstall} 
             className="hidden sm:flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-md text-xs font-black border border-brand-500 transition-all shadow-lg shadow-brand-900/40"
           >
             <Smartphone className="w-4 h-4" /> {t.install}
           </button>
        )}

        {/* SELETOR DE IDIOMA REFINADO */}
        <div className="flex bg-slate-800/80 rounded-lg p-1 border border-slate-700 shadow-inner">
          <button 
            onClick={() => setLanguage('pt')} 
            className={`px-3 py-1 rounded-md text-[10px] font-black transition-all ${language === 'pt' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
          >
            PT
          </button>
          <button 
            onClick={() => setLanguage('it')} 
            className={`px-3 py-1 rounded-md text-[10px] font-black transition-all ${language === 'it' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
          >
            IT
          </button>
        </div>

        <button 
          onClick={onHistoryClick}
          className="flex items-center gap-2 px-4 py-2 bg-blue-900/30 text-blue-400 border border-blue-800 rounded-md hover:bg-blue-900/50 transition-all text-xs font-bold"
        >
          <BookOpen className="w-4 h-4" /> {t.history}
        </button>

        {/* Menu JSON/Backup para Admin */}
        {isAdmin && (
           <div className="relative">
              <button 
                onClick={() => setShowTools(!showTools)}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md border border-slate-700 transition-all flex items-center gap-2"
                title={t.backup}
              >
                <Database className="w-4 h-4" />
                <span className="hidden xl:inline text-[10px] font-black uppercase">JSON</span>
              </button>
              {showTools && (
                 <>
                    <div className="fixed inset-0 z-[-1]" onClick={() => setShowTools(false)}></div>
                    <div className="absolute right-0 mt-3 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 animate-fade-in flex flex-col gap-1 z-[70]">
                       <button onClick={() => { onExport(); setShowTools(false); }} className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold text-slate-300 hover:bg-brand-600 hover:text-white rounded-lg transition-all">
                          <FileJson className="w-4 h-4" /> {t.exportBackup}
                       </button>
                       <button onClick={handleImportClick} className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold text-slate-300 hover:bg-blue-600 hover:text-white rounded-lg transition-all">
                          <UploadCloud className="w-4 h-4" /> {t.importBackup}
                       </button>
                       <button onClick={() => { onExportCSV(); setShowTools(false); }} className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold text-slate-300 hover:bg-emerald-600 hover:text-white rounded-lg transition-all">
                          <FileSpreadsheet className="w-4 h-4" /> {t.exportCSV}
                       </button>
                       <button onClick={() => { onExportTXT(); setShowTools(false); }} className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition-all">
                          <ClipboardList className="w-4 h-4" /> {t.exportTXT}
                       </button>
                    </div>
                 </>
              )}
           </div>
        )}

        <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileChange} />

        {currentUser ? (
          <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-md transition-all text-xs font-bold uppercase">
             <User className="w-4 h-4" /> {currentUser.split(' ')[0]}
             <LogOut className="w-3.5 h-3.5 ml-1 opacity-50" />
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
