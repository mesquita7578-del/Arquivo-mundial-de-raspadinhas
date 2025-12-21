
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, Plus, Loader2, Sparkles, Zap, LayoutGrid, Trophy, Star, 
  Ticket, Layers, Box, MapPin, X, Diamond, Crown, CheckCircle2, Users, Clock, ChevronDown, ChevronRight,
  Ship, Landmark, Flag, Download, RefreshCw, CalendarCheck
} from 'lucide-react';
import { Header } from './components/Header';
import { ImageGrid } from './components/ImageGrid';
import { ImageViewer } from './components/ImageViewer';
import { UploadModal } from './components/UploadModal';
import { LoginModal } from './components/LoginModal';
import { StatsSection } from './components/StatsSection';
import { WorldMap } from './components/WorldMap';
import { HistoryModal } from './components/HistoryModal';
import { WebsitesModal } from './components/WebsitesModal';
import { RadioModal } from './components/RadioModal';
import { AboutPage } from './components/AboutPage';
import { VisitorsModal } from './components/VisitorsModal';
import { ThemesPage } from './components/ThemesPage';
import { Footer } from './components/Footer';
import { storageService } from './services/storage';
import { ScratchcardData, CategoryItem, SiteMetadata, Continent, VisitorEntry } from './types';
import { translations, Language } from './translations';
import { DivineSignal, Signal } from './components/DivineSignal';

const RECENT_THRESHOLD = 2592000000; // 30 dias
const CURRENT_VERSION = '8.0'; // Chloe: Fim dos Conflitos!

const App: React.FC = () => {
  const [images, setImages] = useState<ScratchcardData[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [siteMetadata, setSiteMetadata] = useState<SiteMetadata | null>(null);
  
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
  const [isExporting, setIsExporting] = useState(false);
  
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
      return true;
    } catch (err) {
      return false;
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  useEffect(() => {
    const savedVer = localStorage.getItem('chloe_archive_version');
    if (savedVer !== CURRENT_VERSION) {
      localStorage.setItem('chloe_archive_version', CURRENT_VERSION);
      handleForceRefresh();
      return;
    }

    loadAllData().then(() => {
      if (siteMetadata) {
        const updatedMeta = { ...siteMetadata, visitorCount: (siteMetadata.visitorCount || 0) + 1 };
        storageService.saveSiteMetadata(updatedMeta);
      }
    });
  }, []);

  const handleForceRefresh = async () => {
    addSignal("Chloe a limpar conflitos com a mareta... hihi!", "info");
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (let registration of registrations) {
        registration.unregister();
      }
    }
    if ('caches' in window) {
      const keys = await caches.keys();
      for (let key of keys) {
        await caches.delete(key);
      }
    }
    window.location.href = window.location.origin + window.location.pathname + '?v=' + CURRENT_VERSION + '&t=' + Date.now();
  };

  const addSignal = (message: string, type: Signal['type'] = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setSignals(prev => [...prev, { id, message, type }]);
  };

  const filteredImages = useMemo(() => {
    if (!images) return [];
    return images.filter(img => {
      const imgDate = img.createdAt || 0;
      const now = Date.now();

      if (showTodayOnly) {
        const startOfToday = new Date().setHours(0, 0, 0, 0);
        return imgDate >= startOfToday;
      }

      if (showNewOnly) {
        return (now - imgDate) < RECENT_THRESHOLD;
      }

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

      if (currentPage === 'collection') {
        if (!currentUser || !img.owners?.includes(currentUser)) return false;
      }

      return matchesSearch && matchesContinent && matchesLocation && matchesCategory && matchesTheme && matchesRarity && matchesWinners && matchesSeries;
    });
  }, [images, searchTerm, activeContinent, activeCountry, activeSubRegion, activeCategory, activeTheme, showRaritiesOnly, showWinnersOnly, showSeriesOnly, showNewOnly, showTodayOnly, currentPage, currentUser]);

  const handleExport = async () => {
    if (isExporting) return;
    try {
      setIsExporting(true);
      addSignal("Chloe a preparar backup... Aguarde! hihi!", "info");
      
      // Chloe: Agora usamos EXCLUSIVAMENTE o storageService correto
      const dataStr = await storageService.exportData();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const fileName = `backup-arquivo-${new Date().toISOString().split('T')[0]}.json`;
      
      // Plano A: Download Automático
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Plano B: Botão Gigante de Backup para Tablets Teimosos
      const fallbackId = 'chloe-manual-backup';
      const existing = document.getElementById(fallbackId);
      if (existing) document.body.removeChild(existing);

      const fallback = document.createElement('div');
      fallback.id = fallbackId;
      fallback.style.position = 'fixed';
      fallback.style.inset = '0';
      fallback.style.zIndex = '20000';
      fallback.style.display = 'flex';
      fallback.style.alignItems = 'center';
      fallback.style.justifyContent = 'center';
      fallback.style.backgroundColor = 'rgba(0,0,0,0.85)';
      fallback.style.backdropFilter = 'blur(10px)';
      
      fallback.innerHTML = `
        <div style="background:#0f172a; border:2px solid #3b82f6; padding:40px; border-radius:32px; text-align:center; max-width:90%; box-shadow:0 0 50px rgba(59,130,246,0.3);">
          <h2 style="color:white; font-family:sans-serif; font-weight:900; margin-bottom:10px; font-style:italic; text-transform:uppercase;">Backup Pronto, Vovô!</h2>
          <p style="color:#94a3b8; font-family:sans-serif; margin-bottom:30px; font-size:14px;">Se o tablet não descarregou sozinho, clique no botão azul abaixo!</p>
          <a href="${url}" download="${fileName}" id="backup-direct-link" style="display:inline-block; background:#2563eb; color:white; padding:20px 40px; border-radius:20px; font-weight:900; text-decoration:none; font-family:sans-serif; border:4px solid white; box-shadow:0 10px 40px rgba(0,0,0,0.5);">
            GUARDAR BACKUP AGORA 💾
          </a>
          <button id="close-backup-overlay" style="display:block; margin:30px auto 0; background:transparent; color:#64748b; border:none; font-weight:bold; cursor:pointer; text-decoration:underline;">Fechar este aviso</button>
        </div>
      `;
      document.body.appendChild(fallback);

      document.getElementById('close-backup-overlay')?.addEventListener('click', () => {
        document.body.removeChild(fallback);
      });
      document.getElementById('backup-direct-link')?.addEventListener('click', () => {
        setTimeout(() => {
          if (document.body.contains(fallback)) document.body.removeChild(fallback);
        }, 1000);
      });

      addSignal(`Backup gerado com sucesso! hihi!`, "success");
    } catch (err) {
      addSignal("Erro ao gerar backup. Tente recarregar!", "warning");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (file: File) => {
    try {
      addSignal("Chloe a ler backup... hihi!", "info");
      const text = await file.text();
      const count = await storageService.importData(text);
      addSignal(`${count} registos integrados! hihi!`, "success");
      await loadAllData();
    } catch (err) {
      addSignal("Erro na importação!", "warning");
    }
  };

  const handleToggleToday = () => {
    const willShow = !showTodayOnly;
    setShowTodayOnly(willShow);
    if (willShow) {
      setShowNewOnly(false);
      setActiveCategory('all');
      setActiveCountry('');
      setActiveSubRegion('');
      setActiveTheme('');
      setActiveContinent('Mundo');
      setShowSeriesOnly(false);
      setShowRaritiesOnly(false);
      setShowWinnersOnly(false);
      setSearchTerm('');
      setCurrentPage('home');
      addSignal("A mostrar tudo o que registou HOJE! hihi!");
    }
  };

  const handleToggleNew = () => {
    const willShow = !showNewOnly;
    setShowNewOnly(willShow);
    if (willShow) {
      setShowTodayOnly(false);
      setActiveCategory('all');
      setActiveCountry('');
      setActiveSubRegion('');
      setActiveTheme('');
      setActiveContinent('Mundo');
      setShowSeriesOnly(false);
      setShowRaritiesOnly(false);
      setShowWinnersOnly(false);
      setSearchTerm('');
      setCurrentPage('home');
      addSignal("Novidades dos últimos 30 dias! hihi!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-100 pt-24 md:pt-28">
      <Header 
        isAdmin={isAdmin} currentUser={currentUser} language={language} setLanguage={setLanguage}
        currentPage={currentPage} onNavigate={setCurrentPage} onAdminToggle={() => setShowLogin(true)} onLogout={() => { setIsAdmin(false); setCurrentUser(null); localStorage.removeItem('archive_user'); localStorage.removeItem('archive_admin'); addSignal("Até logo, vovô!"); }}
        onHistoryClick={() => setShowHistory(true)} onRadioClick={() => setShowRadio(true)} onExport={handleExport}
        onImport={(f) => handleImport(f)} onExportTXT={() => {}} onExportCSV={() => {}} t={t.header}
        recentCount={images.filter(img => (Date.now() - (img.createdAt || 0)) < RECENT_THRESHOLD).length}
        collectionCount={images.filter(img => img.owners?.includes(currentUser || '')).length}
        onCountrySelect={(cont, loc, sub) => {
          setActiveContinent(cont); setActiveCountry(loc); setActiveSubRegion(sub || ''); setActiveTheme(''); setCurrentPage('home'); setShowNewOnly(false); setShowTodayOnly(false); setShowSeriesOnly(false); setSearchTerm(''); 
        }}
        countriesByContinent={images.reduce((acc, img) => { if (!acc[img.continent]) acc[img.continent] = []; if (!acc[img.continent].includes(img.country)) acc[img.continent].push(img.country); return acc; }, {} as any)}
      />

      {(currentPage === 'home' || currentPage === 'collection') && (
        <div className="bg-[#020617]/40 backdrop-blur-3xl sticky top-[68px] md:top-[74px] z-[90] px-4 md:px-10 py-1 border-b border-white/5 shadow-xl transition-all">
          <div className="max-w-[1800px] mx-auto flex flex-col items-stretch">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-1 md:gap-3 py-1">
              <div className="flex flex-wrap items-center justify-center gap-1 md:gap-1.5">
                <div className="flex items-center gap-1 border-r border-white/10 pr-1 mr-0.5">
                  <button onClick={() => { setShowSeriesOnly(!showSeriesOnly); setShowNewOnly(false); setShowTodayOnly(false); }} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${showSeriesOnly ? 'bg-blue-600 text-white' : 'bg-slate-900/40 text-slate-500'}`}><Layers className="w-3 h-3" /> Séries</button>
                  <button onClick={() => { setShowRaritiesOnly(!showRaritiesOnly); setShowNewOnly(false); setShowTodayOnly(false); }} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${showRaritiesOnly ? 'bg-amber-500 text-slate-950' : 'bg-slate-900/40 text-slate-500'}`}><Diamond className="w-3 h-3" /> Raridades</button>
                  <button onClick={() => { setShowWinnersOnly(!showWinnersOnly); setShowNewOnly(false); setShowTodayOnly(false); }} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${showWinnersOnly ? 'bg-emerald-500 text-white' : 'bg-slate-900/40 text-slate-500'}`}><Trophy className="w-3 h-3" /> Premiadas</button>
                </div>
                <div className="flex flex-wrap items-center gap-1 py-1">
                    {[
                      { id: 'all', label: 'Tudo', icon: LayoutGrid },
                      { id: 'raspadinha', label: 'Raspadinhas', icon: Ticket },
                      { id: 'lotaria', label: 'Lotarias', icon: Star },
                    ].map(cat => (
                      <button key={cat.id} onClick={() => { setActiveCategory(cat.id); setShowNewOnly(false); setShowTodayOnly(false); }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${activeCategory === cat.id ? 'bg-brand-600 text-white' : 'bg-slate-900/40 text-slate-500'}`}><cat.icon className="w-3 h-3" /> {cat.label}</button>
                    ))}
                    
                    <button onClick={handleToggleToday} className={`flex items-center gap-2 px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${showTodayOnly ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'bg-slate-900/40 text-slate-500 hover:text-red-400'}`}>
                      <CalendarCheck className="w-3.5 h-3.5" /> HOJE
                    </button>

                    <button onClick={handleToggleNew} className={`flex items-center gap-2 px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${showNewOnly ? 'bg-pink-600 text-white shadow-[0_0_15px_rgba(219,39,119,0.5)]' : 'bg-slate-900/40 text-slate-500 hover:text-pink-400'}`}>
                      <Sparkles className="w-3.5 h-3.5" /> Novidades
                    </button>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full lg:w-auto">
                <div className="relative flex-1 lg:w-48 group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600 group-focus-within:text-brand-500 transition-colors" />
                  <input type="text" placeholder="Pesquisar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-950/50 border border-white/5 rounded-full pl-8 pr-4 py-1.5 text-[9px] focus:border-brand-500/50 outline-none text-white shadow-inner" />
                </div>
                {isAdmin && (
                  <button onClick={() => setShowUpload(true)} className="bg-emerald-600 text-white px-3.5 py-1.5 rounded-full font-black text-[8px] uppercase tracking-widest transition-all flex items-center gap-1.5 shadow-lg"><Plus className="w-3 h-3" /> Novo Item</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col min-h-0 pb-20">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-brand-500" />
            <p className="text-[10px] font-black uppercase tracking-widest">Chloe: Limpando conflitos... hihi!</p>
          </div>
        ) : (
          <div className="p-4 md:p-8 animate-fade-in">
             {showTodayOnly && images.filter(img => (img.createdAt || 0) >= new Date().setHours(0,0,0,0)).length === 0 && (
               <div className="text-center py-20 bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl">
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Vovô, ainda não registou nada hoje no tablet! hihi!</p>
               </div>
             )}
             <ImageGrid images={filteredImages} onImageClick={setSelectedImage} isAdmin={isAdmin} currentUser={currentUser} t={t.grid}/>
          </div>
        )}
      </main>

      <Footer onNavigate={setCurrentPage} onWebsitesClick={() => setShowWebsites(true)} onRadioClick={() => setShowRadio(true)} visitorCount={siteMetadata?.visitorCount} onVisitorsClick={() => setShowVisitors(true)} />

      <button 
        onClick={handleForceRefresh}
        className="fixed bottom-4 left-4 z-[1001] p-2 bg-slate-900/90 border border-white/10 rounded-full text-slate-500 hover:text-brand-400 shadow-2xl backdrop-blur-md"
        title="MARETA GIGANTE"
      >
        <RefreshCw className="w-4 h-4" />
      </button>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onUploadComplete={(data) => { setImages([data, ...images]); addSignal(`${data.gameName} arquivado!`, 'success'); }} existingImages={images} initialFile={null} currentUser={currentUser} t={t.upload} categories={categories} />}
      {selectedImage && <ImageViewer image={selectedImage} onClose={() => setSelectedImage(null)} onUpdate={async (data) => { await storageService.save(data); setImages(images.map(img => img.id === data.id ? data : img)); setSelectedImage(data); addSignal("Atualizado!", "info"); }} onDelete={async (id) => { await storageService.delete(id); setImages(images.filter(img => img.id !== id)); setSelectedImage(null); addSignal("Removido.", "warning"); }} isAdmin={isAdmin} currentUser={currentUser} contextImages={images} onImageSelect={setSelectedImage} t={t.viewer} categories={categories} />}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={(u, p, type) => { if (type === 'admin' && p === '123456') { setIsAdmin(true); setCurrentUser(u); localStorage.setItem('archive_user', u); localStorage.setItem('archive_admin', 'true'); addSignal(`Olá, Comandante ${u}!`); return true; } else if (type === 'visitor') { setCurrentUser(u); localStorage.setItem('archive_user', u); localStorage.setItem('archive_admin', 'false'); addSignal(`Olá, ${u}!`); return true; } return false; }} t={t.login} />}
      {showHistory && <HistoryModal onClose={() => setShowHistory(false)} isAdmin={isAdmin} t={{...t.header, ...t.history}} />}
      {showWebsites && <WebsitesModal onClose={() => setShowWebsites(false)} isAdmin={isAdmin} t={t.header} />}
      {showRadio && <RadioModal onClose={() => setShowRadio(false)} />}
      {showVisitors && <VisitorsModal onClose={() => setShowVisitors(false)} visitors={siteMetadata?.visitorLog || []} totalCount={siteMetadata?.visitorCount || 0} />}
      <DivineSignal signals={signals} onRemove={(id) => setSignals(s => s.filter(sig => sig.id !== id))} />
    </div>
  );
};

export default App;
