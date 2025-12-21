
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, Loader2, Sparkles, LayoutGrid, Trophy, Star, 
  Ticket, Layers, Diamond, Users, RefreshCw, CalendarCheck, CheckCircle2, AlertTriangle, Database, Wrench
} from 'lucide-react';
import { Header } from './components/Header';
import { ImageGrid } from './components/ImageGrid';
import { ImageViewer } from './components/ImageViewer';
import { UploadModal } from './components/UploadModal';
import { LoginModal } from './components/LoginModal';
import { HistoryModal } from './components/HistoryModal';
import { WebsitesModal } from './components/WebsitesModal';
import { RadioModal } from './components/RadioModal';
import { VisitorsModal } from './components/VisitorsModal';
import { Footer } from './components/Footer';
import { storageService } from './services/storage';
import { ScratchcardData, CategoryItem, SiteMetadata, Continent } from './types';
import { translations, Language } from './translations';
import { DivineSignal, Signal } from './components/DivineSignal';

const RECENT_THRESHOLD = 2592000000;
const CURRENT_VERSION = '10.0'; // Chloe: REPARAÇÃO TOTAL 🛠️

const App: React.FC = () => {
  const [images, setImages] = useState<ScratchcardData[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [siteMetadata, setSiteMetadata] = useState<SiteMetadata | null>(null);
  const [dbStatus, setDbStatus] = useState<'checking' | 'ok' | 'error'>('checking');
  
  const [currentPage, setCurrentPage] = useState<'home' | 'stats' | 'map' | 'about' | 'new-arrivals' | 'collection' | 'themes'>('home');
  const [language, setLanguage] = useState<Language>('pt');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeContinent, setActiveContinent] = useState<Continent | 'Mundo'>('Mundo');
  const [activeCountry, setActiveCountry] = useState<string>(''); 
  const [activeSubRegion, setActiveSubRegion] = useState<string>(''); 
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeTheme, setActiveTheme] = useState<string>('');
  const [showRaritiesOnly, setShowRaritiesOnly] = useState(false);
  const [showWinnersOnly, setShowWinnersOnly] = useState(false);
  const [showSeriesOnly, setShowSeriesOnly] = useState(false);
  const [showNewOnly, setShowNewOnly] = useState(false);
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedImage, setSelectedImage] = useState<ScratchcardData | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showWebsites, setShowWebsites] = useState(false);
  const [showRadio, setShowRadio] = useState(false);
  const [showVisitors, setShowVisitors] = useState(false);
  
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('archive_admin') === 'true');
  const [currentUser, setCurrentUser] = useState<string | null>(localStorage.getItem('archive_user'));
  const [signals, setSignals] = useState<Signal[]>([]);

  const t = translations[language] || translations['pt'];

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      await storageService.init();
      const [allImages, allCats, meta] = await Promise.all([
        storageService.getAll(),
        storageService.getCategories(),
        storageService.getSiteMetadata()
      ]);
      setImages(allImages || []);
      setCategories(allCats || []);
      setSiteMetadata(meta);
      setDbStatus('ok');
    } catch (err) {
      console.error("DB Error:", err);
      setDbStatus('error');
      addSignal("Erro de memória! Tente reparar.", "warning");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedVer = localStorage.getItem('chloe_archive_version');
    if (savedVer !== CURRENT_VERSION) {
      localStorage.setItem('chloe_archive_version', CURRENT_VERSION);
      handleForceRefresh();
      return;
    }
    loadAllData();
  }, []);

  const handleForceRefresh = () => {
    // Chloe: Limpeza radical de cache para tablets
    if ('caches' in window) {
      caches.keys().then(names => {
        for (let name of names) caches.delete(name);
      });
    }
    localStorage.removeItem('archive_admin');
    localStorage.removeItem('archive_user');
    localStorage.setItem('chloe_archive_version', CURRENT_VERSION);
    window.location.href = window.location.origin + window.location.pathname + '?refresh=' + Date.now();
  };

  const addSignal = (message: string, type: Signal['type'] = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setSignals(prev => [...prev, { id, message, type }]);
  };

  const filteredImages = useMemo(() => {
    if (!images) return [];
    return images.filter(img => {
      const imgDate = img.createdAt || 0;
      if (showTodayOnly) return imgDate >= new Date().setHours(0, 0, 0, 0);
      if (showNewOnly) return (Date.now() - imgDate) < RECENT_THRESHOLD;

      const gName = (img.gameName || "").toLowerCase();
      const s = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || gName.includes(s) || (img.country || "").toLowerCase().includes(s) || (img.customId || "").toLowerCase().includes(s);
      
      const matchesContinent = activeContinent === 'Mundo' || img.continent === activeContinent;
      const matchesCategory = activeCategory === 'all' || img.category === activeCategory;
      const matchesTheme = !activeTheme || img.theme?.toLowerCase() === activeTheme.toLowerCase();
      const matchesRarity = !showRaritiesOnly || img.isRarity;
      const matchesWinners = !showWinnersOnly || img.isWinner;
      const matchesSeries = !showSeriesOnly || img.isSeries;

      let matchesLocation = true;
      if (activeCountry) {
        matchesLocation = (img.country || "").toLowerCase() === activeCountry.toLowerCase();
        if (activeSubRegion) {
          const sub = activeSubRegion.toLowerCase();
          matchesLocation = matchesLocation && (img.subRegion?.toLowerCase() === sub || img.island?.toLowerCase() === sub);
        }
      }
      return matchesSearch && matchesContinent && matchesLocation && matchesCategory && matchesTheme && matchesRarity && matchesWinners && matchesSeries;
    });
  }, [images, searchTerm, activeContinent, activeCountry, activeSubRegion, activeCategory, activeTheme, showRaritiesOnly, showWinnersOnly, showSeriesOnly, showNewOnly, showTodayOnly]);

  const handleExport = async () => {
    try {
      addSignal("Vovô, Chloe a gerar o arquivo de segurança...", "info");
      const dataStr = await storageService.exportData();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const fileName = `backup-jorge-${new Date().toISOString().split('T')[0]}.json`;

      // Chloe: Método infalível para tablets - Interface de download dedicada
      const exportUI = document.createElement('div');
      exportUI.id = "chloe-export-ui";
      exportUI.style.position = 'fixed';
      exportUI.style.inset = '0';
      exportUI.style.zIndex = '999999';
      exportUI.style.backgroundColor = 'rgba(2, 6, 23, 0.98)';
      exportUI.style.display = 'flex';
      exportUI.style.flexDirection = 'column';
      exportUI.style.alignItems = 'center';
      exportUI.style.justifyContent = 'center';
      exportUI.style.padding = '20px';

      exportUI.innerHTML = `
        <div style="background:#0f172a; border:3px solid #3b82f6; padding:40px; border-radius:32px; max-width:500px; text-align:center; box-shadow:0 0 100px rgba(59,130,246,0.3);">
          <div style="font-size:50px; margin-bottom:20px;">💾</div>
          <h2 style="color:white; font-family:sans-serif; font-weight:900; margin-bottom:10px; font-style:italic; text-transform:uppercase;">Backup Pronto!</h2>
          <p style="color:#94a3b8; font-family:sans-serif; margin-bottom:30px; font-size:16px; line-height:1.5;">Vovô Jorge, clique no botão azul abaixo para guardar a sua coleção no tablet.</p>
          <a href="${url}" download="${fileName}" id="direct-download-btn" style="display:block; background:#2563eb; color:white; padding:20px; border-radius:20px; font-weight:900; text-decoration:none; font-family:sans-serif; margin-bottom:20px; border:4px solid white;">GUARDAR FICHEIRO 📁</a>
          <button id="close-export-ui" style="color:#64748b; background:none; border:none; cursor:pointer; font-size:14px; text-decoration:underline; font-weight:bold;">Fechar este aviso</button>
        </div>
      `;
      document.body.appendChild(exportUI);

      document.getElementById('close-export-ui')?.addEventListener('click', () => {
        document.body.removeChild(exportUI);
        URL.revokeObjectURL(url);
      });

      document.getElementById('direct-download-btn')?.addEventListener('click', () => {
        addSignal("Backup descarregado! hihi!", "success");
        setTimeout(() => {
          if (document.body.contains(exportUI)) document.body.removeChild(exportUI);
        }, 1500);
      });

    } catch (err) {
      addSignal("Erro ao exportar! Tente reparar o arquivo.", "warning");
    }
  };

  const handleImport = async (file: File) => {
    try {
      addSignal("Chloe a ler o arquivo...", "info");
      const text = await file.text();
      const count = await storageService.importData(text);
      addSignal(`${count} itens restaurados com sucesso! hihi!`, "success");
      await loadAllData();
    } catch (err) {
      addSignal("Erro na importação! Ficheiro inválido.", "warning");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-100 pt-20 md:pt-24">
      {/* Header Fixo e Seguro */}
      <Header 
        isAdmin={isAdmin} currentUser={currentUser} language={language} setLanguage={setLanguage}
        currentPage={currentPage} onNavigate={setCurrentPage} onAdminToggle={() => setShowLogin(true)} 
        onLogout={() => { setIsAdmin(false); setCurrentUser(null); localStorage.removeItem('archive_user'); localStorage.removeItem('archive_admin'); addSignal("Até à próxima, vovô!"); }}
        onHistoryClick={() => setShowHistory(true)} onRadioClick={() => setShowRadio(true)} onExport={handleExport}
        onImport={handleImport} onExportTXT={() => {}} onExportCSV={() => {}} t={t.header}
        recentCount={images.filter(img => (Date.now() - (img.createdAt || 0)) < RECENT_THRESHOLD).length}
        onCountrySelect={(cont, loc, sub) => {
          setActiveContinent(cont); setActiveCountry(loc); setActiveSubRegion(sub || ''); setActiveTheme(''); setCurrentPage('home'); setShowNewOnly(false); setShowTodayOnly(false);
        }}
        countriesByContinent={images.reduce((acc, img) => { if (!acc[img.continent]) acc[img.continent] = []; if (!acc[img.continent].includes(img.country)) acc[img.continent].push(img.country); return acc; }, {} as any)}
      />

      {/* Barra de Ferramentas Reforçada */}
      <div className="bg-[#020617] sticky top-0 z-[100] px-4 md:px-10 py-2 border-b border-white/10 shadow-2xl">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-4">
           <div className="flex items-center gap-1.5">
             <button onClick={() => { setShowTodayOnly(!showTodayOnly); setShowNewOnly(false); }} className={`flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${showTodayOnly ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-900 text-slate-500 hover:text-white'}`}>
                <CalendarCheck className="w-4 h-4" /> HOJE
             </button>
             <button onClick={() => { setShowNewOnly(!showNewOnly); setShowTodayOnly(false); }} className={`flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${showNewOnly ? 'bg-pink-600 text-white shadow-lg' : 'bg-slate-900 text-slate-500 hover:text-white'}`}>
                <Sparkles className="w-4 h-4" /> Novos
             </button>
           </div>
           
           <div className="flex items-center gap-3">
              {/* Saúde da Base de Dados */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${dbStatus === 'ok' ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-red-950/20 border-red-500/30'}`}>
                 <div className={`w-2 h-2 rounded-full animate-pulse ${dbStatus === 'ok' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                 <span className={`text-[8px] font-black uppercase tracking-widest ${dbStatus === 'ok' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {dbStatus === 'ok' ? 'Arquivo Ativo' : 'Erro Crítico'}
                 </span>
              </div>

              <div className="relative group hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
                <input type="text" placeholder="Pesquisar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-slate-900 border border-white/5 rounded-full pl-9 pr-4 py-2 text-[10px] text-white outline-none w-40 focus:w-60 focus:border-brand-500 transition-all" />
              </div>

              {isAdmin && (
                <button onClick={() => setShowUpload(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-full font-black text-[9px] uppercase tracking-widest shadow-xl flex items-center gap-2 transition-transform active:scale-95">
                  <Plus className="w-4 h-4" /> Novo Item
                </button>
              )}
           </div>
        </div>
      </div>

      <main className="flex-1 pb-24">
        {isLoading ? (
          <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
            <Loader2 className="w-12 h-12 animate-spin text-brand-500" />
            <div className="text-center">
              <p className="text-[12px] font-black uppercase text-white tracking-[0.2em] mb-1">Chloe a preparar o Arquivo Mundial...</p>
              <p className="text-[10px] font-black uppercase text-slate-600 tracking-widest">v10.0 - Reparação Total hihi!</p>
            </div>
          </div>
        ) : (
          <div className="p-4 md:p-8 animate-fade-in">
             <ImageGrid images={filteredImages} onImageClick={setSelectedImage} t={t.grid}/>
          </div>
        )}
      </main>

      <Footer onNavigate={setCurrentPage} onWebsitesClick={() => setShowWebsites(true)} onRadioClick={() => setShowRadio(true)} visitorCount={siteMetadata?.visitorCount} onVisitorsClick={() => setShowVisitors(true)} />

      {/* Botões de Emergência */}
      <div className="fixed bottom-6 left-6 z-[1001] flex flex-col gap-2">
        <button 
          onClick={handleForceRefresh} 
          className="p-3 bg-red-600 text-white rounded-full shadow-2xl border-2 border-white hover:bg-red-700 transition-all active:scale-90 flex items-center gap-2 group"
          title="REPARAR TUDO"
        >
          <Wrench className="w-5 h-5" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Reparar Tudo</span>
        </button>
        <button 
          onClick={() => window.location.reload()} 
          className="p-3 bg-slate-900 text-slate-400 rounded-full shadow-2xl border border-white/10 hover:text-white transition-all active:scale-90"
          title="Recarregar Página"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onUploadComplete={(data) => { setImages([data, ...images]); addSignal("Item arquivado com sucesso!"); }} existingImages={images} initialFile={null} currentUser={currentUser} t={t.upload} categories={categories} />}
      {selectedImage && <ImageViewer image={selectedImage} onClose={() => setSelectedImage(null)} onUpdate={async (data) => { await storageService.save(data); setImages(images.map(img => img.id === data.id ? data : img)); setSelectedImage(data); addSignal("Dados atualizados!"); }} onDelete={async (id) => { await storageService.delete(id); setImages(images.filter(img => img.id !== id)); setSelectedImage(null); addSignal("Removido do arquivo.", "warning"); }} isAdmin={isAdmin} currentUser={currentUser} contextImages={images} onImageSelect={setSelectedImage} t={t.viewer} categories={categories} />}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={(u, p, type) => { if (type === 'admin' && p === '123456') { setIsAdmin(true); setCurrentUser(u); localStorage.setItem('archive_user', u); localStorage.setItem('archive_admin', 'true'); addSignal(`Bem-vindo de volta, Comandante ${u}!`); return true; } return false; }} t={t.login} />}
      {showHistory && <HistoryModal onClose={() => setShowHistory(false)} isAdmin={isAdmin} t={{...t.header, ...t.history}} />}
      {showWebsites && <WebsitesModal onClose={() => setShowWebsites(false)} isAdmin={isAdmin} t={t.header} />}
      {showRadio && <RadioModal onClose={() => setShowRadio(false)} />}
      {showVisitors && <VisitorsModal onClose={() => setShowVisitors(false)} visitors={siteMetadata?.visitorLog || []} totalCount={siteMetadata?.visitorCount || 0} />}
      <DivineSignal signals={signals} onRemove={(id) => setSignals(s => s.filter(sig => sig.id !== id))} />
    </div>
  );
};

export default App;
