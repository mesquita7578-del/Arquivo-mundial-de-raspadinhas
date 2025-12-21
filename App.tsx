
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, Loader2, Sparkles, LayoutGrid, Trophy, Star, 
  Ticket, Layers, Diamond, Users, RefreshCw, CalendarCheck, CheckCircle2, AlertTriangle, Database, Wrench, ShieldAlert, X
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
import { StatsSection } from './components/StatsSection';
import { ThemesPage } from './components/ThemesPage';
import { AboutPage } from './components/AboutPage';
import { Footer } from './components/Footer';
import { storageService } from './services/storage';
import { ScratchcardData, CategoryItem, SiteMetadata, Continent } from './types';
import { translations, Language } from './translations';
import { DivineSignal, Signal } from './components/DivineSignal';

const RECENT_THRESHOLD = 2592000000;
const VERSION = '11.1'; // Chloe: CAMINHO LIVRE 🚀

const App: React.FC = () => {
  const [images, setImages] = useState<ScratchcardData[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [siteMetadata, setSiteMetadata] = useState<SiteMetadata | null>(null);
  const [dbStatus, setDbStatus] = useState<'checking' | 'ok' | 'error'>('checking');
  
  const [currentPage, setCurrentPage] = useState<'home' | 'stats' | 'map' | 'about' | 'collection' | 'themes'>('home');
  const [language, setLanguage] = useState<Language>('pt');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeContinent, setActiveContinent] = useState<Continent | 'Mundo'>('Mundo');
  const [activeCountry, setActiveCountry] = useState<string>(''); 
  const [activeSubRegion, setActiveSubRegion] = useState<string>(''); 
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeTheme, setActiveTheme] = useState<string>('');
  
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
      const allImages = await storageService.getAll();
      const allCats = await storageService.getCategories();
      const meta = await storageService.getSiteMetadata();
      setImages(allImages || []);
      setCategories(allCats || []);
      setSiteMetadata(meta);
      setDbStatus('ok');
    } catch (err) {
      setDbStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedVer = localStorage.getItem('chloe_archive_version');
    if (savedVer !== VERSION) {
      localStorage.setItem('chloe_archive_version', VERSION);
      handleForceRefresh();
      return;
    }
    loadAllData();
  }, []);

  const handleForceRefresh = () => {
    localStorage.removeItem('archive_admin');
    localStorage.removeItem('archive_user');
    sessionStorage.clear();
    window.location.href = window.location.origin + window.location.pathname + '?v=' + Date.now();
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

      let matchesLocation = true;
      if (activeCountry) {
        matchesLocation = (img.country || "").toLowerCase() === activeCountry.toLowerCase();
        if (activeSubRegion) {
          const sub = activeSubRegion.toLowerCase();
          matchesLocation = matchesLocation && (img.subRegion?.toLowerCase() === sub || img.island?.toLowerCase() === sub);
        }
      }
      return matchesSearch && matchesContinent && matchesLocation && matchesCategory && matchesTheme;
    });
  }, [images, searchTerm, activeContinent, activeCountry, activeSubRegion, activeCategory, activeTheme, showNewOnly, showTodayOnly]);

  const stats = useMemo(() => {
    const res: Record<string, number> = { Europa: 0, América: 0, Ásia: 0, África: 0, Oceania: 0 };
    const countryStats: Record<string, number> = {};
    const stateStats: Record<string, number> = {};
    images.forEach(img => {
      if (res[img.continent] !== undefined) res[img.continent]++;
      countryStats[img.country] = (countryStats[img.country] || 0) + 1;
      stateStats[img.state] = (stateStats[img.state] || 0) + 1;
    });
    return { continent: res, countries: countryStats, states: stateStats };
  }, [images]);

  const renderContent = () => {
    switch (currentPage) {
      case 'stats':
        return <StatsSection images={images} stats={stats.continent} countryStats={stats.countries} stateStats={stats.states} collectorStats={{}} totalRecords={images.length} t={t.stats} currentUser={currentUser} categoryStats={{scratch:0, lottery:0}} />;
      case 'themes':
        return <ThemesPage images={images} onThemeSelect={(themeId) => { setActiveTheme(themeId); setCurrentPage('home'); addSignal(`Filtrado por: ${themeId.toUpperCase()}`); }} />;
      case 'about':
        return <AboutPage t={t.about} isAdmin={isAdmin} founderPhoto={siteMetadata?.founderPhotoUrl} founderBio={siteMetadata?.founderBio} founderQuote={siteMetadata?.founderQuote} milestones={siteMetadata?.milestones} onUpdateFounderPhoto={(url) => setSiteMetadata(prev => prev ? {...prev, founderPhotoUrl: url} : null)} onUpdateMetadata={(data) => setSiteMetadata(prev => prev ? {...prev, ...data} : null)} />;
      case 'home':
      default:
        return (
          <div className="p-4 md:p-8 animate-fade-in">
             {activeTheme && (
               <div className="mb-6 flex items-center justify-between bg-pink-600/10 border border-pink-500/30 p-4 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-pink-500" />
                    <span className="text-sm font-black text-white uppercase tracking-widest">Tema Ativo: <span className="text-pink-400">{activeTheme.toUpperCase()}</span></span>
                  </div>
                  <button onClick={() => setActiveTheme('')} className="flex items-center gap-2 bg-pink-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase hover:bg-pink-500 transition-all">
                    <X className="w-3 h-3" /> Limpar Filtro
                  </button>
               </div>
             )}
             <ImageGrid images={filteredImages} onImageClick={setSelectedImage} t={t.grid}/>
          </div>
        );
    }
  };

  const handleExport = async () => {
    try {
      const dataStr = await storageService.exportData();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const fileName = `arquivo-jorge-v11-${new Date().toISOString().split('T')[0]}.json`;

      const emergencyExport = document.createElement('div');
      emergencyExport.style.position = 'fixed';
      emergencyExport.style.inset = '0';
      emergencyExport.style.zIndex = '1000000';
      emergencyExport.style.backgroundColor = '#020617';
      emergencyExport.style.display = 'flex';
      emergencyExport.style.flexDirection = 'column';
      emergencyExport.style.alignItems = 'center';
      emergencyExport.style.justifyContent = 'center';
      emergencyExport.style.padding = '30px';

      emergencyExport.innerHTML = `
        <div style="background:#0f172a; border:4px solid #2563eb; padding:50px; border-radius:40px; text-align:center; max-width:600px;">
          <h1 style="color:white; font-family:sans-serif; font-weight:900;">BACKUP DE SEGURANÇA</h1>
          <p style="color:#94a3b8; font-family:sans-serif; margin-bottom:40px;">Clique abaixo para salvar as suas raspadinhas.</p>
          <a href="${url}" download="${fileName}" id="final-btn" style="display:inline-block; background:#2563eb; color:white; padding:25px 50px; border-radius:25px; font-weight:900; text-decoration:none;">DESCARREGAR AGORA 📁</a>
          <br><br>
          <button id="close-emergency" style="color:#475569; background:none; border:none; cursor:pointer;">Voltar</button>
        </div>
      `;
      document.body.appendChild(emergencyExport);
      document.getElementById('close-emergency')?.addEventListener('click', () => { document.body.removeChild(emergencyExport); URL.revokeObjectURL(url); });
      document.getElementById('final-btn')?.addEventListener('click', () => { addSignal("Backup salvo!", "success"); setTimeout(() => { if (document.body.contains(emergencyExport)) document.body.removeChild(emergencyExport); }, 2000); });
    } catch (err) { addSignal("Erro no backup!", "warning"); }
  };

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const count = await storageService.importData(text);
      addSignal(`${count} itens recuperados!`, "success");
      await loadAllData();
    } catch (err) { addSignal("Ficheiro inválido!", "warning"); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-100">
      <Header 
        isAdmin={isAdmin} currentUser={currentUser} language={language} setLanguage={setLanguage}
        currentPage={currentPage} onNavigate={(p) => { setCurrentPage(p); if (p === 'home') { setActiveTheme(''); setActiveCountry(''); } }} onAdminToggle={() => setShowLogin(true)} 
        onLogout={() => { setIsAdmin(false); setCurrentUser(null); localStorage.clear(); window.location.reload(); }}
        onHistoryClick={() => setShowHistory(true)} onRadioClick={() => setShowRadio(true)} onExport={handleExport}
        onImport={handleImport} onExportTXT={() => {}} onExportCSV={() => {}} t={t.header}
        onCountrySelect={(cont, loc, sub) => {
          setActiveContinent(cont); setActiveCountry(loc); setActiveSubRegion(sub || ''); setActiveTheme(''); setCurrentPage('home');
        }}
        countriesByContinent={images.reduce((acc, img) => { if (!acc[img.continent]) acc[img.continent] = []; if (!acc[img.continent].includes(img.country)) acc[img.continent].push(img.country); return acc; }, {} as any)}
      />

      <main className="flex-1 mt-24 md:mt-28 pb-32">
        {currentPage === 'home' && (
          <div className="bg-[#020617] sticky top-20 md:top-24 z-[900] px-4 md:px-10 py-3 border-b border-white/5 shadow-2xl">
            <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button onClick={() => setShowTodayOnly(!showTodayOnly)} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase transition-all ${showTodayOnly ? 'bg-red-600 text-white' : 'bg-slate-900 text-slate-500'}`}>HOJE</button>
                <button onClick={() => setShowNewOnly(!showNewOnly)} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase transition-all ${showNewOnly ? 'bg-pink-600 text-white' : 'bg-slate-900 text-slate-500'}`}>NOVOS</button>
              </div>
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${dbStatus === 'ok' ? 'border-emerald-500/30' : 'border-red-500/30'}`}>
                  <div className={`w-2 h-2 rounded-full ${dbStatus === 'ok' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                  <span className="text-[8px] font-black uppercase">{dbStatus === 'ok' ? 'Arquivo Ativo' : 'Erro'}</span>
                </div>
                <div className="hidden md:flex relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input type="text" placeholder="Pesquisar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-slate-900 border border-white/10 rounded-full pl-10 pr-4 py-2 text-xs text-white outline-none w-48 focus:w-64 transition-all" />
                </div>
                {isAdmin && <button onClick={() => setShowUpload(true)} className="bg-emerald-600 text-white px-6 py-2 rounded-full font-black text-[10px] uppercase shadow-xl">+ NOVO</button>}
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="h-[50vh] flex flex-col items-center justify-center gap-6">
            <Loader2 className="w-12 h-12 animate-spin text-brand-500" />
            <h2 className="text-white font-black uppercase">A carregar...</h2>
          </div>
        ) : renderContent()}
      </main>

      <Footer onNavigate={setCurrentPage} onWebsitesClick={() => setShowWebsites(true)} onRadioClick={() => setShowRadio(true)} visitorCount={siteMetadata?.visitorCount} onVisitorsClick={() => setShowVisitors(true)} />

      <div className="fixed bottom-24 left-6 z-[1001] flex flex-col gap-3">
        <button onClick={handleForceRefresh} className="p-4 bg-red-600 text-white rounded-full shadow-2xl border-4 border-white group flex items-center gap-2"><Wrench className="w-6 h-6" /><span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all text-[10px] font-black uppercase">Reparar</span></button>
        <button onClick={() => window.location.reload()} className="p-4 bg-slate-900 text-white rounded-full shadow-2xl border border-white/20"><RefreshCw className="w-6 h-6" /></button>
      </div>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onUploadComplete={(data) => { setImages([data, ...images]); addSignal("Arquivado!"); }} existingImages={images} initialFile={null} currentUser={currentUser} t={t.upload} categories={categories} />}
      {selectedImage && <ImageViewer image={selectedImage} onClose={() => setSelectedImage(null)} onUpdate={async (data) => { await storageService.save(data); setImages(images.map(img => img.id === data.id ? data : img)); setSelectedImage(data); addSignal("Atualizado!"); }} onDelete={async (id) => { await storageService.delete(id); setImages(images.filter(img => img.id !== id)); setSelectedImage(null); addSignal("Removido.", "warning"); }} isAdmin={isAdmin} currentUser={currentUser} contextImages={images} onImageSelect={setSelectedImage} t={t.viewer} categories={categories} />}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={(u, p, type) => { if (type === 'admin' && p === '123456') { setIsAdmin(true); setCurrentUser(u); localStorage.setItem('archive_user', u); localStorage.setItem('archive_admin', 'true'); addSignal(`Bem-vindo ${u}!`); return true; } return false; }} t={t.login} />}
      {showHistory && <HistoryModal onClose={() => setShowHistory(false)} isAdmin={isAdmin} t={{...t.header, ...t.history}} />}
      {showWebsites && <WebsitesModal onClose={() => setShowWebsites(false)} isAdmin={isAdmin} t={t.header} />}
      {showRadio && <RadioModal onClose={() => setShowRadio(false)} />}
      {showVisitors && <VisitorsModal onClose={() => setShowVisitors(false)} visitors={siteMetadata?.visitorLog || []} totalCount={siteMetadata?.visitorCount || 0} />}
      <DivineSignal signals={signals} onRemove={(id) => setSignals(s => s.filter(sig => sig.id !== id))} />
    </div>
  );
};

export default App;
