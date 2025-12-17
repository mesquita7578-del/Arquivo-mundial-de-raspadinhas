import React, { useRef } from 'react';
import { Search, Upload, Ticket, Lock, LogOut, Download, BookOpen, FileSpreadsheet, Home, BarChart2, Info, ChevronDown, Coins, Star, ArrowRight, Globe, Map, UploadCloud, User, Smartphone, FileText, LayoutTemplate, Heart } from 'lucide-react';
import { Language } from '../translations';

interface HeaderProps {
  onSearch: (term: string) => void;
  onUploadClick: () => void;
  searchTerm: string;
  isAdmin: boolean;
  currentUser?: string | null;
  onAdminToggle: () => void;
  onLogout: () => void;
  onExport: () => void;
  onExportCSV: () => void;
  onImport: (file: File) => void; 
  onHistoryClick: () => void;
  onExportPersonalList?: () => void; 
  language: Language;
  setLanguage: (lang: Language) => void;
  currentPage: string;
  onNavigate: (page: any) => void;
  stats: Record<string, number>;
  t: any;
  onInstall?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onSearch, 
  onUploadClick, 
  searchTerm, 
  isAdmin, 
  currentUser,
  onAdminToggle, 
  onLogout,
  onExport,
  onExportCSV,
  onImport,
  onHistoryClick,
  onExportPersonalList,
  language,
  setLanguage,
  currentPage,
  onNavigate,
  stats,
  t,
  onInstall
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <header className="flex items-center justify-between px-3 md:px-6 py-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 shadow-lg h-[60px]">
      
      <div className="flex items-center gap-6">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => onNavigate('home')}
        >
          <div className="bg-brand-600 p-1.5 md:p-2 rounded-lg shadow-lg shadow-brand-900/50 shrink-0 group-hover:bg-brand-500 transition-colors">
            <Ticket className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-base md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-500 to-white leading-tight">
              {t.title}
            </h1>
            <span className="text-[9px] md:text-xs text-brand-500 font-bold uppercase tracking-widest hidden sm:block">Arquivo Mundial</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1 bg-slate-800/50 p-1 rounded-full border border-slate-700/50 h-9">
           <button
             onClick={() => onNavigate('home')}
             className={`px-4 h-full rounded-full text-xs font-bold flex items-center gap-2 transition-all ${currentPage === 'home' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
           >
             <Home className="w-3.5 h-3.5" />
             Início
           </button>

           <button
             onClick={() => onNavigate('showcase')}
             className={`px-4 h-full rounded-full text-xs font-bold flex items-center gap-2 transition-all ${currentPage === 'showcase' ? 'bg-amber-500 text-black shadow-sm' : 'text-amber-500/70 hover:text-amber-400 hover:bg-amber-950/20'}`}
           >
             <LayoutTemplate className="w-3.5 h-3.5" />
             Montra
           </button>

           {currentUser && (
              <button
                onClick={() => onNavigate('my-collection')}
                className={`px-4 h-full rounded-full text-xs font-bold flex items-center gap-2 transition-all ${currentPage === 'my-collection' ? 'bg-pink-600 text-white shadow-sm' : 'text-pink-400 hover:text-pink-300 hover:bg-pink-950/20'}`}
              >
                <Heart className="w-3.5 h-3.5" />
                {t.myCollection}
              </button>
           )}

           <div className="h-full group relative">
              <button
                className={`px-4 h-full rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${['europe', 'america', 'asia', 'africa', 'oceania'].includes(currentPage) ? 'bg-blue-900/40 text-blue-400 border border-blue-800' : 'text-slate-400 group-hover:text-white group-hover:bg-slate-800'}`}
              >
                <Globe className="w-3.5 h-3.5" />
                Explorar
                <ChevronDown className="w-3 h-3 opacity-50 transition-transform group-hover:rotate-180" />
              </button>
              
              <div className="absolute left-[-20%] top-[50%] w-[140%] h-12 bg-transparent z-50"></div>
              
              <div className="fixed top-[60px] left-0 w-full bg-slate-900/98 border-y border-slate-700 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl hidden group-hover:block animate-fade-in z-40">
                 <div className="max-w-6xl mx-auto p-6 md:p-8">
                    <div className="flex items-start justify-between mb-6">
                       <div>
                          <h3 className="text-white font-bold text-lg flex items-center gap-2">
                             <Map className="w-5 h-5 text-brand-500" />
                             Arquivo Mundial por Continente
                          </h3>
                       </div>
                    </div>

                    <div className="grid grid-cols-5 gap-4">
                       <button onClick={() => onNavigate('europe')} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-slate-800/50 border border-slate-700 hover:bg-blue-900/20 hover:border-blue-500/50 transition-all group/card text-center">
                          <div className="w-12 h-12 rounded-full bg-blue-900/30 flex items-center justify-center border border-blue-500/20 group-hover/card:scale-110 transition-transform shadow-lg"><Globe className="w-6 h-6 text-blue-400" /></div>
                          <h4 className="text-sm font-bold text-white mb-1">Europa</h4>
                       </button>
                       <button onClick={() => onNavigate('america')} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-slate-800/50 border border-slate-700 hover:bg-red-900/20 hover:border-red-500/50 transition-all group/card text-center">
                          <div className="w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center border border-red-500/20 group-hover/card:scale-110 transition-transform shadow-lg"><Globe className="w-6 h-6 text-red-400" /></div>
                          <h4 className="text-sm font-bold text-white mb-1">América</h4>
                       </button>
                       <button onClick={() => onNavigate('asia')} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-slate-800/50 border border-slate-700 hover:bg-yellow-900/20 hover:border-yellow-500/50 transition-all group/card text-center">
                          <div className="w-12 h-12 rounded-full bg-yellow-900/30 flex items-center justify-center border border-yellow-500/20 group-hover/card:scale-110 transition-transform shadow-lg"><Globe className="w-6 h-6 text-yellow-400" /></div>
                          <h4 className="text-sm font-bold text-white mb-1">Ásia</h4>
                       </button>
                       <button onClick={() => onNavigate('africa')} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-slate-800/50 border border-slate-700 hover:bg-green-900/20 hover:border-green-500/50 transition-all group/card text-center">
                          <div className="w-12 h-12 rounded-full bg-green-900/30 flex items-center justify-center border border-green-500/20 group-hover/card:scale-110 transition-transform shadow-lg"><Globe className="w-6 h-6 text-green-400" /></div>
                          <h4 className="text-sm font-bold text-white mb-1">África</h4>
                       </button>
                       <button onClick={() => onNavigate('oceania')} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-slate-800/50 border border-slate-700 hover:bg-purple-900/20 hover:border-purple-500/50 transition-all group/card text-center">
                          <div className="w-12 h-12 rounded-full bg-purple-900/30 flex items-center justify-center border border-purple-500/20 group-hover/card:scale-110 transition-transform shadow-lg"><Globe className="w-6 h-6 text-purple-400" /></div>
                          <h4 className="text-sm font-bold text-white mb-1">Oceania</h4>
                       </button>
                    </div>
                 </div>
              </div>
           </div>

           <button
             onClick={() => onNavigate('stats')}
             className={`px-4 h-full rounded-full text-xs font-bold flex items-center gap-2 transition-all ${currentPage === 'stats' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
           >
             <BarChart2 className="w-3.5 h-3.5" />
             Stats
           </button>
        </nav>
      </div>

      <div className="flex items-center gap-2">
        {onInstall && (
           <button onClick={onInstall} className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-pink-900/30 animate-pulse transition-all">
             <Smartphone className="w-3 h-3" />
             <span className="hidden sm:inline">Instalar</span>
           </button>
        )}

        <div className="flex bg-slate-800 rounded-md p-0.5 border border-slate-700">
          <button onClick={() => setLanguage('pt')} className={`px-2 py-1 rounded text-[10px] md:text-xs font-bold transition-all ${language === 'pt' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>PT</button>
          <button onClick={() => setLanguage('it')} className={`px-2 py-1 rounded text-[10px] md:text-xs font-bold transition-all ${language === 'it' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>IT</button>
        </div>

        {currentUser ? (
          <>
            {isAdmin && (
              <div className="hidden lg:flex items-center bg-slate-800 rounded-full p-0.5 border border-slate-700">
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                  <button onClick={handleImportClick} className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20 px-3 py-1.5 rounded-full text-xs font-medium transition-all" title="Importar">
                    <UploadCloud className="w-3 h-3" /> Importar
                  </button>
                  <div className="w-px h-4 bg-slate-700 mx-1"></div>
                  <button onClick={onExport} className="flex items-center gap-2 text-slate-400 hover:text-white hover:bg-slate-700 px-3 py-1.5 rounded-full text-xs font-medium transition-all" title="JSON Backup">
                    <Download className="w-3 h-3" /> JSON
                  </button>
              </div>
            )}

            <button
              onClick={onLogout}
              className={`flex items-center justify-center gap-2 w-auto px-3 py-2 rounded-full transition-all group border ${isAdmin ? 'bg-red-900/20 hover:bg-red-900/40 text-red-400 border-red-900/50' : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border-slate-700'}`}
            >
              <div className="flex items-center gap-2">
                 <div className={`p-0.5 rounded-full ${isAdmin ? 'bg-red-500' : 'bg-blue-500'}`}><User className="w-3 h-3 text-black" /></div>
                 <span className="text-[10px] font-bold uppercase hidden md:inline">{currentUser.split(' ')[0]}</span>
              </div>
              <LogOut className="w-4 h-4" />
            </button>

            {isAdmin && (
              <button onClick={onUploadClick} className="flex items-center justify-center w-8 h-8 md:w-auto md:px-4 md:py-2 rounded-full bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-900/50 transition-all">
                <Upload className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline text-xs font-bold">Novo</span>
              </button>
            )}
          </>
        ) : (
          <button onClick={onAdminToggle} className="flex items-center justify-center w-8 h-8 md:w-auto md:px-3 md:py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 rounded-full transition-all">
            <Lock className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline text-xs font-medium">Entrar</span>
          </button>
        )}
      </div>
    </header>
  );
};