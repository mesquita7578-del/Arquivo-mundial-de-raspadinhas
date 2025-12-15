import React from 'react';
import { Search, Upload, Ticket, Lock, LogOut, Download, BookOpen, FileSpreadsheet, Home, BarChart2, Info, ChevronDown, Coins } from 'lucide-react';
import { Language } from '../translations';

interface HeaderProps {
  onSearch: (term: string) => void;
  onUploadClick: () => void;
  searchTerm: string;
  isAdmin: boolean;
  onAdminToggle: () => void;
  onLogout: () => void;
  onExport: () => void;
  onExportCSV: () => void;
  onHistoryClick: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  currentPage: string;
  onNavigate: (page: any) => void;
  t: any;
}

export const Header: React.FC<HeaderProps> = ({ 
  onSearch, 
  onUploadClick, 
  searchTerm, 
  isAdmin, 
  onAdminToggle, 
  onLogout,
  onExport,
  onExportCSV,
  onHistoryClick,
  language,
  setLanguage,
  currentPage,
  onNavigate,
  t
}) => {
  return (
    <header className="flex items-center justify-between px-3 md:px-6 py-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 shadow-lg h-[60px]">
      
      {/* Logo & Title */}
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
          <span className="text-[9px] md:text-xs text-brand-500 font-bold uppercase tracking-widest hidden sm:block">{t.subtitle}</span>
        </div>
      </div>

      {/* Navigation Menu (Center) - Desktop */}
      <nav className="hidden md:flex items-center gap-1 bg-slate-800/50 p-1 rounded-full border border-slate-700/50 absolute left-1/2 -translate-x-1/2">
         <button
           onClick={() => onNavigate('home')}
           className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all ${currentPage === 'home' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
         >
           <Home className="w-3.5 h-3.5" />
           Início
         </button>

         {/* PORTUGAL DROPDOWN */}
         <div className="relative group">
            <button
              className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all ${currentPage.startsWith('pt_') ? 'bg-green-900/40 text-green-400 border border-green-800' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <img src="https://flagcdn.com/pt.svg" alt="PT" className="w-3.5 h-3.5 rounded-sm object-cover" />
              Portugal
              <ChevronDown className="w-3 h-3 opacity-50" />
            </button>
            
            {/* Dropdown Content */}
            <div className="absolute top-full left-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden hidden group-hover:block animate-fade-in">
               <button 
                 onClick={() => onNavigate('pt_scratch')}
                 className="w-full text-left px-4 py-3 hover:bg-slate-800 flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-brand-400 transition-colors border-b border-slate-800"
               >
                 <Coins className="w-4 h-4" />
                 Raspadinhas PT
               </button>
               <button 
                 onClick={() => onNavigate('pt_lottery')}
                 className="w-full text-left px-4 py-3 hover:bg-slate-800 flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-purple-400 transition-colors"
               >
                 <Ticket className="w-4 h-4" />
                 Lotaria Nacional
               </button>
            </div>
         </div>

         <button
           onClick={() => onNavigate('stats')}
           className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all ${currentPage === 'stats' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
         >
           <BarChart2 className="w-3.5 h-3.5" />
           Estatísticas
         </button>
         <button
           onClick={() => onNavigate('about')}
           className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all ${currentPage === 'about' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
         >
           <Info className="w-3.5 h-3.5" />
           Sobre
         </button>
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-2">
        
        {/* Language Toggles */}
        <div className="flex bg-slate-800 rounded-md p-0.5 border border-slate-700">
          <button 
            onClick={() => setLanguage('pt')}
            className={`px-2 py-1 rounded text-[10px] md:text-xs font-bold transition-all ${language === 'pt' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
          >
            PT
          </button>
          <button 
            onClick={() => setLanguage('it')}
            className={`px-2 py-1 rounded text-[10px] md:text-xs font-bold transition-all ${language === 'it' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
          >
            IT
          </button>
        </div>

        {/* History Button */}
        <button
          onClick={onHistoryClick}
          className="flex items-center justify-center w-8 h-8 md:w-auto md:px-3 md:py-2 rounded-full bg-blue-900/20 hover:bg-blue-800/40 text-blue-400 border border-blue-800/50 transition-all"
          title={t.history}
        >
          <BookOpen className="w-4 h-4 md:mr-2" />
          <span className="hidden md:inline text-xs font-medium">{t.history}</span>
        </button>

        {/* Admin Controls */}
        {isAdmin ? (
          <>
            <div className="hidden lg:flex items-center bg-slate-800 rounded-full p-0.5 border border-slate-700">
                <button
                  onClick={onExport}
                  className="flex items-center gap-2 text-slate-400 hover:text-white hover:bg-slate-700 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  title={t.backupTitle}
                >
                  <Download className="w-3 h-3" /> JSON
                </button>
                <div className="w-px h-4 bg-slate-700 mx-1"></div>
                <button
                  onClick={onExportCSV}
                  className="flex items-center gap-2 text-green-400 hover:text-green-300 hover:bg-green-900/20 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  title="Exportar Excel (CSV)"
                >
                  <FileSpreadsheet className="w-3 h-3" /> Excel
                </button>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center justify-center w-8 h-8 md:w-auto md:px-3 md:py-2 bg-red-900/30 hover:bg-red-600 text-red-400 hover:text-white border border-red-800 rounded-full transition-all"
              title={t.logoutTitle}
            >
              <LogOut className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline text-xs font-bold">{t.logout}</span>
            </button>

             {/* Upload Button */}
            <button
              onClick={onUploadClick}
              className="flex items-center justify-center w-8 h-8 md:w-auto md:px-4 md:py-2 rounded-full bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-900/50 transition-all"
              title={t.addTitle}
            >
              <Upload className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline text-xs font-bold">{t.new}</span>
            </button>
          </>
        ) : (
          <button
            onClick={onAdminToggle}
            className="flex items-center justify-center w-8 h-8 md:w-auto md:px-3 md:py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 rounded-full transition-all"
            title={t.loginTitle}
          >
            <Lock className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline text-xs font-medium">{t.admin}</span>
          </button>
        )}
      </div>
    </header>
  );
};