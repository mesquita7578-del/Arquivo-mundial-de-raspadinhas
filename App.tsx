
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, Loader2, Sparkles, LayoutGrid, Trophy, Star, 
  Ticket, Layers, Diamond, Users, RefreshCw, CalendarCheck, CheckCircle2, AlertTriangle, Database, Wrench, ShieldAlert, X, Map as MapIcon,
  MapPin, Clipboard
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
import { WorldMap } from './components/WorldMap';
import { Footer } from './components/Footer';
import { storageService } from './services/storage';
import { ScratchcardData, CategoryItem, SiteMetadata, Continent } from './types';
import { translations, Language } from './translations';
import { DivineSignal, Signal } from './components/DivineSignal';

const RECENT_THRESHOLD = 2592000000;
const VERSION = '11.4'; // Chloe: BACKUP MASTER 📁✨

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
          matchesLocation = matchesLocation && (
            (img.region || "").toLowerCase() === sub || 
            (img.island || "").toLowerCase() === sub ||
            (img.subRegion || "").toLowerCase() === sub
          );
        }
      }
      return matchesSearch && matchesContinent && matchesLocation && matchesCategory && matchesTheme;
    });
  }, [images, searchTerm, activeContinent, activeCountry, activeSubRegion, activeCategory, activeTheme, showNewOnly, showTodayOnly]);

  const stats = useMemo(() => {
    const res: Record<string, number> = { Europa: 0, América: 0, Ásia: 0, África: 0, Oceania: 0 };
    const countryStats: Record<string, number> = {};
    const stateStats: Record<string, number> = {};
    const categoriesCount = { scratch: 0, lottery: 0 };

    images.forEach(img => {
      if (res[img.continent] !== undefined) res[img.continent]++;
      countryStats[img.country] = (countryStats[img.country] || 0) + 1;
      stateStats[img.state] = (stateStats[img.state] || 0) + 1;
      
      if (img.category === 'raspadinha') categoriesCount.scratch++;
      else if (img.category === 'lotaria') categoriesCount.lottery++;
    });

    return { 
      continent: res, 
      countries: countryStats, 
      states: stateStats,
      categories: categoriesCount
    };
  }, [images]);

  const collectionImages = useMemo(() => {
    return images.filter(img => currentUser && img.owners?.includes(currentUser));
  }, [images, currentUser]);

  const renderContent = () => {
    switch (currentPage) {
      case 'stats':
        return (
          <div className="max-w-[1800px] mx-auto p-4 md:p-10 animate-fade-in">
             <StatsSection 
               images={images} 
               stats={stats.continent} 
               countryStats={stats.countries} 
               stateStats={stats.states} 
               collectorStats={{}} 
               totalRecords={images.length} 
               t={t.stats} 
               currentUser={currentUser} 
               categoryStats={stats.categories} 
             />
          </div>
        );
      case 'map':
        return (
          <div className="max-w-[1800px] mx-auto p-4 md:p-10 animate-fade-in">
             <WorldMap 
               images={images} 
               onCountrySelect={(country) => {
                 setActiveCountry(country);
                 setActiveContinent('Mundo');
                 setCurrentPage('home');
                 addSignal(`Explorando: ${country.toUpperCase()}`);
               }}
               activeContinent={activeContinent}
               t={t.grid}
             />
          </div>
        );
      case 'themes':
        return (
          <div className="max-w-[1800px] mx-auto p-4 md:p-10 animate-fade-in">
             <ThemesPage 
               images={images} 
               onThemeSelect={(themeId) => { 
                 setActiveTheme(themeId); 
                 setCurrentPage('home'); 
                 addSignal(`Filtrado por: ${themeId.toUpperCase()}`); 
               }} 
             />
          </div>
        );
      case 'collection':
        return (
          <div className="max-w-[1800px] mx-auto p-4 md:p-10 animate-fade-in">
             <div className="mb-8 border-b border-white/5 pb-6 flex items-center justify-between">
                <div>
                   <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">A Minha Coleção 🌟</h2>
                   <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
                      Visualizando {collectionImages.length} itens marcados por {currentUser} hihi!
                   </p>
                </div>
                <button onClick={() => setCurrentPage('home')} className="bg-slate-800 text-slate-400 px-6 py-2 rounded-xl text-[10px] font-black uppercase hover:text-white transition-all">Voltar ao arquivo</button>
             </div>
             <ImageGrid images={collectionImages} onImageClick={setSelectedImage} t={t.grid}/>
          </div>
        );
      case 'about':
        return <AboutPage t={t.about} isAdmin={isAdmin} founderPhoto={siteMetadata?.founderPhotoUrl} founderBio={siteMetadata?.founderBio} founderQuote={siteMetadata?.founderQuote} milestones={siteMetadata?.milestones} onUpdateFounderPhoto={(url) => setSiteMetadata(prev => prev ? {...prev, founderPhotoUrl: url} : null)} onUpdateMetadata={(data) => setSiteMetadata(prev => prev ? {...prev, ...data} : null)} />;
      case 'home':
      default:
        return (
          <div className="max-w-[1800px] mx-auto p-4 md:p-10 animate-fade-in">
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
             {activeCountry && (
               <div className="mb-6 flex items-center justify-between bg-brand-600/10 border border-brand-500/30 p-4 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-brand-400" />
                    <span className="text-sm font-black text-white uppercase tracking-widest">Localização: <span className="text-brand-400">{activeCountry.toUpperCase()}</span></span>
                  </div>
                  <button onClick={() => setActiveCountry('')} className="flex items-center gap-2 bg-brand-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase hover:bg-brand-500 transition-all">
                    <X className="w-3 h-3" /> Ver Tudo
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
      const fileName = `arquivo-jorge-v11-${new Date().toISOString().split('T')[0]}.json`;

      const exportOverlay = document.createElement('div');
      exportOverlay.style.position = 'fixed';
      exportOverlay.style.inset = '0';
      exportOverlay.style.zIndex = '1000000';
      exportOverlay.style.backgroundColor = 'rgba(2, 6, 23, 0.95)';
      exportOverlay.style.backdropFilter = 'blur(10px)';
      exportOverlay.style.display = 'flex';
      exportOverlay.style.alignItems = 'center';
      exportOverlay.style.justifyContent = 'center';
      exportOverlay.style.padding = '20px';

      exportOverlay.innerHTML = `
        <div style="background:#0f172a; border:1px solid rgba(59, 130, 246, 0.3); padding:40px; border-radius:32px; text-align:center; max-width:500px; width: 100%; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
          <div style="background:rgba(59, 130, 246, 0.1); width:64px; height:64px; border-radius:20px; display:flex; align-items:center; justify-center; margin:0 auto 24px;">
            <svg style="color:#3b82f6; width:32px; height:32px; margin: auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          </div>
          <h2 style="color:white; font-family:sans-serif; font-weight:900; font-size:24px; margin-bottom:8px; text-transform:uppercase; letter-spacing:-0.025em;">Cópia de Segurança</h2>
          <p style="color:#94a3b8; font-family:sans-serif; margin-bottom:32px; font-size:14px; line-height:1.6;">Vovô, escolha como quer guardar os seus dados:</p>
          
          <div style="display:grid; gap:12px;">
            <button id="btn-download" style="background:#2563eb; color:white; padding:16px; border-radius:16px; font-weight:900; border:none; cursor:pointer; font-size:12px; text-transform:uppercase; letter-spacing:0.1em; transition:all 0.2s;">
              1. Descarregar Ficheiro (.json)
            </button>
            <button id="btn-copy" style="background:rgba(255,255,255,0.05); color:#cbd5e1; padding:16px; border-radius:16px; font-weight:900; border:1px solid rgba(255,255,255,0.1); cursor:pointer; font-size:12px; text-transform:uppercase; letter-spacing:0.1em; transition:all 0.2s;">
              2. Copiar Texto (Plano B)
            </button>
          </div>
          
          <button id="close-export" style="color:#64748b; background:none; border:none; cursor:pointer; margin-top:32px; font-size:12px; font-weight:700; text-transform:uppercase;">Cancelar</button>
        </div>
      `;
      document.body.appendChild(exportOverlay);

      // Ações
      document.getElementById('close-export')?.addEventListener('click', () => document.body.removeChild(exportOverlay));

      document.getElementById('btn-download')?.addEventListener('click', () => {
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
        addSignal("Download iniciado!", "success");
        setTimeout(() => document.body.removeChild(exportOverlay), 500);
      });

      document.getElementById('btn-copy')?.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(dataStr);
          addSignal("Copiado com sucesso!", "success");
          setTimeout(() => document.body.removeChild(exportOverlay), 500);
        } catch (err) {
          addSignal("Erro ao copiar!", "warning");
        }
      });

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
        currentPage={currentPage} onNavigate={(p) => { 
          setCurrentPage(p); 
          if (p === 'home') { setActiveTheme(''); setActiveCountry(''); } 
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }} 
        onAdminToggle={() => setShowLogin(true)} 
        onLogout={() => { setIsAdmin(false); setCurrentUser(null); localStorage.clear(); window.location.reload(); }}
        onHistoryClick={() => setShowHistory(true)} onRadioClick={() => setShowRadio(true)} onExport={handleExport}
        onImport={handleImport} onExportTXT={() => {}} onExportCSV={() => {}} t={t.header}
        onCountrySelect={(cont, loc, sub) => {
          setActiveContinent(cont); setActiveCountry(loc); setActiveSubRegion(sub || ''); setActiveTheme(''); setCurrentPage('home');
        }}
        collectionCount={collectionImages.length}
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
            <h2 className="text-white font-black uppercase">A carregar arquivo...</h2>
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
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={(u, p, type) => { if (type === 'admin' && p === '123456') { setIsAdmin(true); setCurrentUser(u); localStorage.setItem('archive_user', u); localStorage.setItem('archive_admin', 'true'); addSignal(`Bem-vindo ${u}!`); return true; } else if (type === 'visitor') { setCurrentUser(u); localStorage.setItem('archive_user', u); addSignal(`Olá ${u}!`); return true; } return false; }} t={t.login} />}
      {showHistory && <HistoryModal onClose={() => setShowHistory(false)} isAdmin={isAdmin} t={{...t.header, ...t.history}} />}
      {showWebsites && <WebsitesModal onClose={() => setShowWebsites(false)} isAdmin={isAdmin} t={t.header} />}
      {showRadio && <RadioModal onClose={() => setShowRadio(false)} />}
      {showVisitors && <VisitorsModal onClose={() => setShowVisitors(false)} visitors={siteMetadata?.visitorLog || []} totalCount={siteMetadata?.visitorCount || 0} />}
      <DivineSignal signals={signals} onRemove={(id) => setSignals(s => s.filter(sig => sig.id !== id))} />
    </div>
  );
};

export default App;
