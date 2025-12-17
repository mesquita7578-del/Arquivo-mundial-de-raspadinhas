import React, { useRef, useState, useEffect } from 'react';
import { 
  Search, Upload, Ticket, Lock, LogOut, Download, BookOpen, Home, 
  BarChart2, ChevronDown, Globe, Map, UploadCloud, User, Smartphone, 
  LayoutTemplate, Heart, Link as LinkIcon, X, Database, FileText, 
  Share2, Save, FileJson, FileSpreadsheet, ClipboardList
} from 'lucide-react';
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
  onExportTXT: () => void; // Nova/Restaurada
  onImport: (file: File) => void; 
  onHistoryClick: () => void;
  onWebsitesClick?: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  currentPage: string;
  onNavigate: (page: any) => void;
  stats: Record<string, number>;
  t: any;
  onInstall?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onSearch, onUploadClick, searchTerm, isAdmin, currentUser,
  onAdminToggle, onLogout, onExport, onExportCSV, onExportTXT,
  onImport, onHistoryClick, onWebsitesClick, language, setLanguage,
  currentPage, onNavigate, stats, t, onInstall
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showTools, setShowTools] = useState(false);

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
    <header className="flex items-center justify-between px-3 md:px-6 py-3 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 shadow-lg h-[64px]">
      
      {/* Lado Esquerdo: Logo e Nav Principal */}
      <div className="flex items-center gap-4 lg:gap-8">
        <div className="flex items-center gap-2 cursor-pointer group shrink-0" onClick={() => onNavigate('home')}>
          <div className="bg-brand-600 p-1.5 md:p-2 rounded-lg shadow-lg shadow-brand-900/50 group-hover:bg-brand-500 transition-colors">
            <Ticket className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm md:text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-brand-500 to-white leading-none mb-1 uppercase italic tracking-tighter">
              Arquivo
            </h1>
            <span className="text-[8px] md:text-[10px] text-brand-500 font-bold uppercase tracking-[0.2em] leading-none hidden sm:block">Mundial</span>
          </div>
        </div>

        <nav className="hidden xl:flex items-center gap-1 bg-slate-800/40 p-1 rounded-full border border-slate-700/30 h-10">
           <button onClick={() => onNavigate('home')} className={`px-4 h-full rounded-full text-[11px] font-bold flex items-center gap-2 transition-all ${currentPage === 'home' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
             <Home className="w-3.5 h-3.5" /> Início
           </button>
           <button onClick={() => onNavigate('showcase')} className={`px-4 h-full rounded-full text-[11px] font-bold flex items-center gap-2 transition-all ${currentPage === 'showcase' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm' : 'text-amber-500/70 hover:text-amber-400 hover:bg-amber-950/20'}`}>
             <LayoutTemplate className="w-3.5 h-3.5" /> Montra
           </button>
           {currentUser && (
              <button onClick={() => onNavigate('my-collection')} className={`px-4 h-full rounded-full text-[11px] font-bold flex items-center gap-2 transition-all ${currentPage === 'my-collection' ? 'bg-pink-600/10 text-pink-500 border border-pink-500/20 shadow-sm' : 'text-pink-400 hover:text-pink-300 hover:bg-pink-950/20'}`}>
                <Heart className="w-3.5 h-3.5" /> Coleção
              </button>
           )}
           <div className="h-full group relative">
              <button className={`px-4 h-full rounded-full text-[11px] font-bold flex items-center gap-2 transition-all cursor-pointer ${['europe', 'america', 'asia', 'africa', 'oceania'].includes(currentPage) ? 'bg-blue-900/40 text-blue-400 border border-blue-800' : 'text-slate-400 group-hover:text-white group-hover:bg-slate-800'}`}>
                <Globe className="w-3.5 h-3.5" /> Explorar <ChevronDown className="w-3 h-3 opacity-50 transition-transform group-hover:rotate-180" />
              </button>
              <div className="fixed top-[64px] left-0 w-full bg-slate-900/98 border-y border-slate-700 shadow-2xl backdrop-blur-xl hidden group-hover:block animate-fade-in z-[100]">
                 <div className="max-w-6xl mx-auto p-8">
                    <div className="grid grid-cols-5 gap-6">
                       {['Europe', 'America', 'Asia', 'Africa', 'Oceania'].map((cont) => (
                          <button key={cont} onClick={() => onNavigate(cont.toLowerCase())} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-slate-800/50 border border-slate-700 hover:bg-brand-900/20 hover:border-brand-500/50 transition-all group/card text-center">
                             <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center border border-slate-700 group-hover/card:scale-110 transition-transform shadow-lg"><Globe className="w-6 h-6 text-brand-400" /></div>
                             <h4 className="text-sm font-bold text-white">{cont}</h4>
                          </button>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </nav>
      </div>

      {/* Centro: Barra de Pesquisa Restaurada */}
      <div className="flex-1 max-w-2xl mx-4 md:mx-10 hidden sm:flex items-center gap-2">
         <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-brand-500 transition-colors" />
            <input 
              type="text" placeholder={t.search} value={searchTerm} onChange={(e) => onSearch(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-full pl-10 pr-4 py-2 text-xs text-white focus:border-brand-500 outline-none transition-all placeholder-slate-500"
            />
            {searchTerm && <button onClick={() => onSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"><X className="w-3.5 h-3.5" /></button>}
         </div>

         <div className="flex items-center gap-1 bg-slate-800/30 p-1 rounded-full border border-slate-700/30 h-9">
            <button onClick={onHistoryClick} className="p-2 rounded-full text-slate-400 hover:text-blue-400 hover:bg-blue-900/20 transition-all" title="Biblioteca"><BookOpen className="w-4 h-4" /></button>
            <button onClick={onWebsitesClick} className="p-2 rounded-full text-slate-400 hover:text-emerald-400 hover:bg-emerald-900/20 transition-all" title="Sites Oficiais"><LinkIcon className="w-4 h-4" /></button>
            <button onClick={() => onNavigate('stats')} className="p-2 rounded-full text-slate-400 hover:text-purple-400 hover:bg-purple-900/20 transition-all" title="Estatísticas"><BarChart2 className="w-4 h-4" /></button>
         </div>
      </div>

      {/* Lado Direito: Perfil, Menu de Ferramentas e Backup */}
      <div className="flex items-center gap-2 shrink-0">
        
        {/* Menu de Backup/Ferramentas (Restaurado) */}
        {isAdmin && (
           <div className="relative">
              <button 
                onClick={() => setShowTools(!showTools)}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full border border-slate-700 transition-all"
                title="Ferramentas de Dados"
              >
                <Database className="w-4 h-4" />
              </button>

              {showTools && (
                 <>
                    <div className="fixed inset-0 z-[-1]" onClick={() => setShowTools(false)}></div>
                    <div className="absolute right-0 mt-3 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 animate-fade-in flex flex-col gap-1">
                       <div className="px-4 py-2 border-b border-slate-800 mb-1">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Gestão do Arquivo</p>
                       </div>
                       <button onClick={() => { onExport(); setShowTools(false); }} className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold text-slate-300 hover:bg-brand-600 hover:text-white rounded-xl transition-all">
                          <FileJson className="w-4 h-4" /> Exportar Backup (JSON)
                       </button>
                       <button onClick={handleImportClick} className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold text-slate-300 hover:bg-blue-600 hover:text-white rounded-xl transition-all">
                          <UploadCloud className="w-4 h-4" /> Importar Backup (JSON)
                       </button>
                       <button onClick={() => { onExportCSV(); setShowTools(false); }} className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold text-slate-300 hover:bg-emerald-600 hover:text-white rounded-xl transition-all">
                          <FileSpreadsheet className="w-4 h-4" /> Exportar Tabela (CSV)
                       </button>
                       <button onClick={() => { onExportTXT(); setShowTools(false); }} className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white rounded-xl transition-all border-t border-slate-800 mt-1">
                          <ClipboardList className="w-4 h-4" /> Checklist Simplificada (TXT)
                       </button>
                    </div>
                 </>
              )}
           </div>
        )}

        <div className="hidden md:flex bg-slate-800/50 rounded-full p-1 border border-slate-700">
          <button onClick={() => setLanguage('pt')} className={`px-2 py-1 rounded-full text-[10px] font-bold ${language === 'pt' ? 'bg-brand-600 text-white' : 'text-slate-500'}`}>PT</button>
          <button onClick={() => setLanguage('it')} className={`px-2 py-1 rounded-full text-[10px] font-bold ${language === 'it' ? 'bg-brand-600 text-white' : 'text-slate-500'}`}>IT</button>
        </div>

        <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileChange} />

        {currentUser ? (
          <div className="flex items-center gap-2">
            <button onClick={onLogout} className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border ${isAdmin ? 'bg-red-950/20 text-red-400 border-red-900/30' : 'bg-slate-800 text-slate-300'}`}>
               <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isAdmin ? 'bg-red-500' : 'bg-brand-500'}`}><User className="w-3.5 h-3.5 text-slate-900" /></div>
               <span className="text-[10px] font-black uppercase hidden lg:block">{currentUser.split(' ')[0]}</span>
               <LogOut className="w-3.5 h-3.5 opacity-50" />
            </button>
            {isAdmin && (
              <button onClick={onUploadClick} className="w-10 h-10 md:w-auto md:px-5 bg-brand-600 hover:bg-brand-500 text-white rounded-full shadow-lg transition-all flex items-center justify-center gap-2">
                <Upload className="w-4 h-4" /> <span className="hidden lg:inline text-xs font-black uppercase">Novo</span>
              </button>
            )}
          </div>
        ) : (
          <button onClick={onAdminToggle} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-full transition-all text-xs font-bold uppercase">
            <Lock className="w-3.5 h-3.5" /> Entrar
          </button>
        )}
      </div>
    </header>
  );
};