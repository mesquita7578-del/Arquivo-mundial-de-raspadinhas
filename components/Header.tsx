import React from 'react';
import { Search, Upload, Ticket, Lock, LogOut, Download, BookOpen, FileSpreadsheet, Home, BarChart2, Info, ChevronDown, Coins, Star, ArrowRight } from 'lucide-react';
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
      <nav className="hidden md:flex items-center gap-1 bg-slate-800/50 p-1 rounded-full border border-slate-700/50 absolute left-1/2 -translate-x-1/2 h-9">
         <button
           onClick={() => onNavigate('home')}
           className={`px-4 h-full rounded-full text-xs font-bold flex items-center gap-2 transition-all ${currentPage === 'home' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
         >
           <Home className="w-3.5 h-3.5" />
           Início
         </button>

         {/* PORTUGAL MEGA MENU */}
         {/* Using 'group' here to trigger the hover state */}
         <div className="h-full group static">
            <button
              className={`px-4 h-full rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${currentPage.startsWith('pt_') ? 'bg-green-900/40 text-green-400 border border-green-800' : 'text-slate-400 group-hover:text-white group-hover:bg-slate-800'}`}
            >
              <img src="https://flagcdn.com/pt.svg" alt="PT" className="w-3.5 h-3.5 rounded-sm object-cover shadow-sm" />
              Portugal
              <ChevronDown className="w-3 h-3 opacity-50 transition-transform group-hover:rotate-180" />
            </button>
            
            {/* 
               MEGA MENU CONTAINER 
               Fixed position to span full screen width relative to viewport
            */}
            <div className="fixed top-[60px] left-0 w-full bg-slate-900/98 border-y border-slate-700 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl hidden group-hover:block animate-fade-in z-40">
               <div className="max-w-5xl mx-auto p-6 md:p-8">
                  <div className="flex items-start justify-between mb-6">
                     <div>
                        <h3 className="text-white font-bold text-lg flex items-center gap-2">
                           <img src="https://flagcdn.com/pt.svg" alt="PT" className="w-6 h-4 rounded shadow-sm object-cover" />
                           Coleção Nacional Portuguesa
                        </h3>
                        <p className="text-slate-400 text-sm mt-1">Selecione a categoria que deseja explorar no arquivo.</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     {/* Card Raspadinhas */}
                     <button 
                        onClick={() => onNavigate('pt_scratch')}
                        className="flex items-center gap-6 p-4 rounded-2xl bg-slate-800/50 border border-slate-700 hover:bg-green-900/20 hover:border-green-500/50 transition-all group/card text-left"
                     >
                        <div className="w-16 h-16 rounded-2xl bg-green-900/30 flex items-center justify-center border border-green-500/20 group-hover/card:scale-110 transition-transform shadow-lg">
                           <Coins className="w-8 h-8 text-green-400" />
                        </div>
                        <div>
                           <h4 className="text-lg font-bold text-white mb-1 group-hover/card:text-green-400 transition-colors">Raspadinhas</h4>
                           <p className="text-slate-400 text-xs mb-2 leading-relaxed">
                              Arquivo completo de raspadinhas da Santa Casa.
                           </p>
                           <span className="inline-flex items-center gap-1 text-xs font-bold text-green-500 uppercase tracking-wider">
                              Ver Coleção <ArrowRight className="w-3 h-3" />
                           </span>
                        </div>
                     </button>

                     {/* Card Lotarias */}
                     <button 
                        onClick={() => onNavigate('pt_lottery')}
                        className="flex items-center gap-6 p-4 rounded-2xl bg-slate-800/50 border border-slate-700 hover:bg-purple-900/20 hover:border-purple-500/50 transition-all group/card text-left"
                     >
                        <div className="w-16 h-16 rounded-2xl bg-purple-900/30 flex items-center justify-center border border-purple-500/20 group-hover/card:scale-110 transition-transform shadow-lg">
                           <Ticket className="w-8 h-8 text-purple-400" />
                        </div>
                        <div>
                           <h4 className="text-lg font-bold text-white mb-1 group-hover/card:text-purple-400 transition-colors">Lotaria Nacional</h4>
                           <p className="text-slate-400 text-xs mb-2 leading-relaxed">
                              Bilhetes de Lotaria Clássica e Popular.
                           </p>
                           <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-500 uppercase tracking-wider">
                              Ver Coleção <ArrowRight className="w-3 h-3" />
                           </span>
                        </div>
                     </button>
                  </div>
                  
                  {/* Decorative Footer inside menu */}
                  <div className="mt-6 pt-4 border-t border-slate-800 flex justify-center text-slate-500 text-[10px] uppercase tracking-widest gap-4">
                     <span className="flex items-center gap-1"><Star className="w-3 h-3" /> Base de Dados Atualizada</span>
                     <span className="flex items-center gap-1"><Star className="w-3 h-3" /> Imagens em Alta Definição</span>
                  </div>
               </div>
            </div>
         </div>

         <button
           onClick={() => onNavigate('stats')}
           className={`px-4 h-full rounded-full text-xs font-bold flex items-center gap-2 transition-all ${currentPage === 'stats' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
         >
           <BarChart2 className="w-3.5 h-3.5" />
           Estatísticas
         </button>
         <button
           onClick={() => onNavigate('about')}
           className={`px-4 h-full rounded-full text-xs font-bold flex items-center gap-2 transition-all ${currentPage === 'about' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
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