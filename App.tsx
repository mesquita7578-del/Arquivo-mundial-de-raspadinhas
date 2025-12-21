
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, Loader2, Sparkles, LayoutGrid, Trophy, Star, 
  Ticket, Layers, Diamond, Users, RefreshCw, CalendarCheck, CheckCircle2, AlertTriangle, Database, Wrench, ShieldAlert, X, Map as MapIcon,
  MapPin, Clipboard, Share2, Download
} from 'lucide-react';
import { Header } from './components/Header';
import { ImageGrid } from './components/ImageGrid';
import { ImageViewer } from './components/ImageViewer';
import { UploadModal } from './components/UploadModal';
import { LoginModal } from './components/LoginModal';
import { HistoryModal } from './components/HistoryModal';
import { WebsitesModal } from './components/WebsitesModal';
import { RadioModal } from './components/RadioModal';
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
const VERSION = '11.7'; // Chloe: ETERNAL SESSION & NEW UPLOAD 🛡️✨

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
      exportOverlay.id = "chloe-export-overlay";
      exportOverlay.style.position = 'fixed';
      exportOverlay.style.inset = '0';
      exportOverlay.style.zIndex = '1000000';
      exportOverlay.style.backgroundColor = 'rgba(2, 6, 23, 0.98)';
      exportOverlay.style.backdropFilter = 'blur(20px)';
      exportOverlay.style.display = 'flex';
      exportOverlay.style.alignItems = 'center';
      exportOverlay.style.justifyContent = 'center';
      exportOverlay.style.padding = '20px';

      exportOverlay.innerHTML = `
        <div style="background:#0f172a; border:2px solid rgba(59, 130, 246, 0.5); padding:40px; border-radius:40px; text-align:center; max-width:500px; width: 100%; box-shadow: 0 0 50px rgba(0,0,0,0.8); animation: bounceIn 0.5s ease-out;">
          <div style="background:rgba(59, 130, 246, 0.1); width:80px; height:80px; border-radius:30px; display:flex; align-items:center; justify-center; margin:0 auto 24px; border:1px solid rgba(59, 130, 246, 0.3);">
            <svg style="color:#3b82f6; width:40px; height:40px; margin: auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          </div>
          <h2 style="color:white; font-family:sans-serif; font-weight:900; font-size:28px; margin-bottom:12px; text-transform:uppercase; letter-spacing:-0.05em; font-style: italic;">Backup do Vovô</h2>
          <p style="color:#94a3b8; font-family:sans-serif; margin-bottom:32px; font-size:15px; line-height:1.6; font-weight: 500;">Chloe preparou três formas de salvar os dados. Escolha a que funcionar melhor no seu tablet! hihi!</p>
          
          <div style="display:grid; gap:16px;">
            <button id="btn-share" style="background:#2563eb; color:white; padding:20px; border-radius:20px; font-weight:900; border:none; cursor:pointer; font-size:13px; text-transform:uppercase; letter-spacing:0.1em; display:flex; align-items:center; justify-content:center; gap:12px; box-shadow: 0 10px 20px rgba(37,99,235,0.3);">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
              1. Enviar / Partilhar
            </button>
            <button id="btn-download" style="background:rgba(255,255,255,0.05); color:white; padding:18px; border-radius:20px; font-weight:900; border:1px solid rgba(255,255,255,0.1); cursor:pointer; font-size:13px; text-transform:uppercase; letter-spacing:0.1em; display:flex; align-items:center; justify-content:center; gap:12px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              2. Baixar Ficheiro
            </button>
            <button id="btn-copy" style="background:rgba(255,255,255,0.02); color:#64748b; padding:18px; border-radius:20px; font-weight:900; border:1px dashed rgba(255,255,255,0.1); cursor:pointer; font-size:13px; text-transform:uppercase; letter-spacing:0.1em; display:flex; align-items:center; justify-content:center; gap:12px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
              3. Copiar Tudo
            </button>
          </div>
          
          <button id="close-export" style="color:#475569; background:none; border:none; cursor:pointer; margin-top:32px; font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:0.1em;">Voltar ao Arquivo</button>
        </div>
      `;
      document.body.appendChild(exportOverlay);

      // AÇÕES DO OVERLAY
      document.getElementById('close-export')?.addEventListener('click', () => document.body.removeChild(exportOverlay));

      // 1. Partilha Nativa (Melhor para iPads/Tablets)
      document.getElementById('btn-share')?.addEventListener('click', async () => {
        try {
          const file = new File([dataStr], fileName, { type: 'application/json' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'Arquivo Mundial - Backup',
              text: 'Aqui está a minha coleção de raspadinhas vovô! hihi!'
            });
            addSignal("Partilhado!", "success");
            document.body.removeChild(exportOverlay);
          } else {
            // Se o tablet não suportar partilha de ficheiros, tenta partilha de texto
            await navigator.share({
              title: 'Backup Archive',
              text: dataStr
            });
            addSignal("Partilhado como texto!", "success");
            document.body.removeChild(exportOverlay);
          }
        } catch (err) {
          console.log("Partilha cancelada ou não suportada");
        }
      });

      // 2. Download Tradicional (Reforçado)
      document.getElementById('btn-download')?.addEventListener('click', () => {
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link); // Importante para alguns tablets
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 100);
        addSignal("A baixar...", "info");
      });

      // 3. Copiar para Clipboard
      document.getElementById('btn-copy')?.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(dataStr);
          addSignal("Copiado! Pode colar no Email.", "success");
          document.body.removeChild(exportOverlay);
        } catch (err) {
          addSignal("Erro ao copiar!", "warning");
        }
      });

    } catch (err) { 
      console.error(err);
      addSignal("Erro Crítico no Backup!", "warning"); 
    }
  };

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const count = await storageService.importData(text);
      addSignal(`${count} itens recuperados!`, "success");
      await loadAllData();
    } catch (err) { addSignal("Ficheiro inválido!", "warning"); }
  };

  const handleLogin = (u: string, p: string | null, type: 'admin' | 'visitor') => {
    if (type === 'admin' && p === '123456') {
      setIsAdmin(true);
      setCurrentUser(u);
      localStorage.setItem('archive_user', u);
      localStorage.setItem('archive_admin', 'true');
      addSignal(`Bem-vindo ${u}!`, 'success');
      return true;
    } else if (type === 'visitor') {
      setCurrentUser(u);
      localStorage.setItem('archive_user', u);
      addSignal(`Olá ${u}!`, 'success');
      return true;
    }
    return false;
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
        onLogout={() => { 
          setIsAdmin(false); 
          setCurrentUser(null); 
          localStorage.removeItem('archive_user'); 
          localStorage.removeItem('archive_admin'); 
          window.location.reload(); 
        }}
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

      <Footer onNavigate={setCurrentPage} onWebsitesClick={() => setShowWebsites(true)} onRadioClick={() => setShowRadio(true)} />

      <div className="fixed bottom-24 left-6 z-[1001] flex flex-col gap-3">
        <button onClick={handleForceRefresh} className="p-4 bg-red-600 text-white rounded-full shadow-2xl border-4 border-white group flex items-center gap-2"><Wrench className="w-6 h-6" /><span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all text-[10px] font-black uppercase">Reparar</span></button>
        <button onClick={() => window.location.reload()} className="p-4 bg-slate-900 text-white rounded-full shadow-2xl border border-white/20"><RefreshCw className="w-6 h-6" /></button>
      </div>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onUploadComplete={(data) => { setImages([data, ...images]); addSignal("Arquivado!", "success"); }} existingImages={images} currentUser={currentUser} t={t.upload} categories={categories} />}
      {selectedImage && <ImageViewer image={selectedImage} onClose={() => setSelectedImage(null)} onUpdate={async (data) => { await storageService.save(data); setImages(images.map(img => img.id === data.id ? data : img)); setSelectedImage(data); addSignal("Atualizado!", "success"); }} onDelete={async (id) => { await storageService.delete(id); setImages(images.filter(img => img.id !== id)); setSelectedImage(null); addSignal("Removido.", "warning"); }} isAdmin={isAdmin} currentUser={currentUser} contextImages={images} onImageSelect={setSelectedImage} t={t.viewer} categories={categories} />}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={handleLogin} t={t.login} />}
      {showHistory && <HistoryModal onClose={() => setShowHistory(false)} isAdmin={isAdmin} t={{...t.header, ...t.history}} />}
      {showWebsites && <WebsitesModal onClose={() => setShowWebsites(false)} isAdmin={isAdmin} t={t.header} />}
      {showRadio && <RadioModal onClose={() => setShowRadio(false)} />}
      <DivineSignal signals={signals} onRemove={(id) => setSignals(s => s.filter(sig => sig.id !== id))} />
    </div>
  );
};

export default App;
