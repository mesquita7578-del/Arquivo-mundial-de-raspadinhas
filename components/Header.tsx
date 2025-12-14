import React from 'react';
import { Search, Upload, Ticket, Lock, LogOut, Download, FileSpreadsheet } from 'lucide-react';
import { Language } from '../translations';

interface HeaderProps {
  onSearch: (term: string) => void;
  onUploadClick: () => void;
  searchTerm: string;
  isAdmin: boolean;
  onAdminToggle: () => void;
  onLogout: () => void;
  onExport: () => void;
  onDownloadList: () => void; // New prop for public list download
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
  onDownloadList,
  language,
  setLanguage,
  t
}) => {
  return (
    <header className="flex flex-col md:flex-row items-center justify-between px-4 sm:px-6 py-4 bg-gray-900 border-b border-gray-800 sticky top-0 z-20 shadow-lg gap-4 md:gap-0">
      
      {/* Logo & Title */}
      <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center gap-2">
          <div className="bg-brand-600 p-2 rounded-lg shadow-lg shadow-brand-900/50">
            <Ticket className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-500 to-white">
              {t.title}
            </h1>
            <span className="text-[10px] sm:text-xs text-brand-500 font-bold uppercase tracking-widest">{t.subtitle}</span>
          </div>
        </div>

        {/* Mobile Language Toggle (Visible only on small screens) */}
        <div className="flex md:hidden bg-gray-800 rounded-lg p-1">
          <button 
            onClick={() => setLanguage('pt')}
            className={`px-2 py-1 rounded text-xs font-bold transition-colors ${language === 'pt' ? 'bg-brand-600 text-white' : 'text-gray-400'}`}
          >
            🇵🇹
          </button>
          <button 
            onClick={() => setLanguage('it')}
            className={`px-2 py-1 rounded text-xs font-bold transition-colors ${language === 'it' ? 'bg-green-600 text-white' : 'text-gray-400'}`}
          >
            🇮🇹
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="w-full md:flex-1 md:max-w-xl md:mx-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
          <input
            type="text"
            placeholder={t.search}
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full bg-gray-800 text-gray-200 rounded-full pl-10 pr-4 py-2 border border-gray-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder-gray-500 text-sm"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-center md:justify-end">
        
        {/* Desktop Language Toggle */}
        <div className="hidden md:flex bg-gray-800 rounded-lg p-1 mr-2 border border-gray-700">
          <button 
            onClick={() => setLanguage('pt')}
            className={`px-2 py-1 rounded text-sm transition-all ${language === 'pt' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
            title="Português"
          >
            🇵🇹 PT
          </button>
          <button 
            onClick={() => setLanguage('it')}
            className={`px-2 py-1 rounded text-sm transition-all ${language === 'it' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
            title="Italiano"
          >
            🇮🇹 IT
          </button>
        </div>

        {/* Public Excel Download Button */}
        <button
          onClick={onDownloadList}
          className="flex items-center gap-2 bg-green-900/20 hover:bg-green-800/40 text-green-400 hover:text-green-300 border border-green-800/50 px-3 py-2 rounded-full text-xs sm:text-sm font-medium transition-all"
          title="Download Lista Excel"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span className="hidden lg:inline">Lista Excel</span>
        </button>

        {/* Admin Controls */}
        {isAdmin ? (
          <>
            <button
              onClick={onExport}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 px-3 py-2 rounded-full text-xs sm:text-sm font-medium transition-all"
              title={t.backupTitle}
            >
              <Download className="w-4 h-4" />
              <span className="hidden lg:inline">{t.backup}</span>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-2 bg-red-900/30 hover:bg-red-600 text-red-400 hover:text-white border border-red-800 hover:border-red-500 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300"
              title={t.logoutTitle}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{t.logout}</span>
            </button>
          </>
        ) : (
          <button
            onClick={onAdminToggle}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300"
            title={t.loginTitle}
          >
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline">{t.admin}</span>
          </button>
        )}

        {/* Upload Button */}
        <button
          onClick={onUploadClick}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all shadow-lg ${
             isAdmin 
             ? "bg-brand-600 hover:bg-brand-500 text-white shadow-brand-900/50 cursor-pointer" 
             : "bg-gray-800 text-gray-600 cursor-not-allowed opacity-50"
          }`}
          title={isAdmin ? t.addTitle : t.loginRequired}
        >
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">{t.new}</span>
        </button>
      </div>
    </header>
  );
};