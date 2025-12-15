import React from 'react';
import { Search, Upload, Ticket, Lock, LogOut, Download, BookOpen } from 'lucide-react';
import { Language } from '../translations';

interface HeaderProps {
  onSearch: (term: string) => void;
  onUploadClick: () => void;
  searchTerm: string;
  isAdmin: boolean;
  onAdminToggle: () => void;
  onLogout: () => void;
  onExport: () => void;
  onHistoryClick: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
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
  onHistoryClick,
  language,
  setLanguage,
  t
}) => {
  return (
    <header className="flex items-center justify-between px-3 md:px-6 py-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 shadow-lg h-[60px]">
      
      {/* Logo & Title */}
      <div className="flex items-center gap-2">
        <div className="bg-brand-600 p-1.5 md:p-2 rounded-lg shadow-lg shadow-brand-900/50 shrink-0">
          <Ticket className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-base md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-500 to-white leading-tight">
            {t.title}
          </h1>
          <span className="text-[9px] md:text-xs text-brand-500 font-bold uppercase tracking-widest hidden sm:block">{t.subtitle}</span>
        </div>
      </div>

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
            <button
              onClick={onExport}
              className="hidden lg:flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-500 hover:text-white border border-slate-700 px-3 py-2 rounded-full text-xs font-medium transition-all"
              title={t.backupTitle}
            >
              <Download className="w-3 h-3" />
            </button>

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