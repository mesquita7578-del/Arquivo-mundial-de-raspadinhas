
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, Loader2, Sparkles, LayoutGrid, Trophy, Star, 
  Ticket, Layers, Diamond, Users, RefreshCw, CalendarCheck, CheckCircle2, AlertTriangle, Database
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
const CURRENT_VERSION = '9.0'; // Chloe: DESCANSO DO GUERREIRO

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
      setDbStatus('error');
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
    localStorage.clear();
    localStorage.setItem('chloe_archive_version', CURRENT_VERSION);
    window.location.href = window.location.origin + window.location.pathname + '?clean=' + Date.now();
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
      addSignal("Vovô, Chloe a preparar o ficheiro...", "info");
      const dataStr = await storageService.exportData();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const fileName = `arquivo-jorge-${new Date().toISOString().split('T')[0]}.json`;

      // Chloe: Cria um link visível se o download falhar
      const emergencyDiv = document.createElement('div');
      emergencyDiv.style.position = 'fixed';
      emergencyDiv.style.inset = '0';
      emergencyDiv.style.zIndex = '99999';
      emergencyDiv.style.background = '#020617';
      emergencyDiv.style.display = 'flex';
      emergencyDiv.style.flexDirection = 'column';
      emergencyDiv.style.alignItems = 'center';
      emergencyDiv.style.justifyContent = 'center';
      emergencyDiv.style.padding = '20px';
      emergencyDiv.style.textAlign = 'center';

      emergencyDiv.innerHTML = `
        <div style="background:#0f172a; border:2px solid #3b82f6; padding:30px; border-radius:24px; max-width:400px;">
          <h2 style="color:white; font-family:sans-serif; margin-bottom:15px;">PRONTO, VOVÔ! hihi!</h2>
          <p style="color:#94a3b8; font-family:sans-serif; margin-bottom:25px; font-size:14px;">Clique no botão abaixo para guardar o ficheiro no tablet.</p>
          <a href="${url}" download="${fileName}" style="display:block; background:#2563eb; color:white; padding:15px; border-radius:12px; font-weight:bold; text-decoration:none; margin-bottom:20px;">DESCARREGAR AGORA 💾</a>
          <button id="close-emergency" style="color:#475569; background:none; border:none; cursor:pointer; font-size:12px; text-decoration:underline;">Fechar este aviso</button>
        </div>
      `;
      document.body.appendChild(emergencyDiv);
      document.getElementById('close-emergency')?.addEventListener('click', () => document.body.removeChild(emergencyDiv));

      addSignal("Tudo pronto para o backup!", "success");
    } catch (err) {
      addSignal("Erro no backup!", "warning");
    }
  };

  const handleImport = async (file: File) => {
    try {
      addSignal("A ler ficheiro...", "info");
      const text = await file.text();
      const count = await storageService.importData(text);
      addSignal(`${count} registos recuperados!`, "success");
      await loadAllData();
    } catch (err) {
      addSignal("Erro na importação!", "warning");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-100 pt-24 md:pt-28">
      <Header 
        isAdmin={isAdmin} currentUser={currentUser} language={language} setLanguage={setLanguage}
        currentPage={currentPage} onNavigate={setCurrentPage} onAdminToggle={() => setShowLogin(true)} onLogout={() => { setIsAdmin(false); setCurrentUser(null); localStorage.removeItem('archive_user'); localStorage.removeItem('archive_admin'); }}
        onHistoryClick={() => setShowHistory(true)} onRadioClick={() => setShowRadio(true)} onExport={handleExport}
        onImport={handleImport} onExportTXT={() => {}} onExportCSV={() => {}} t={t.header}
        recentCount={images.filter(img => (Date.now() - (img.createdAt || 0)) < RECENT_THRESHOLD).length}
        onCountrySelect={(cont, loc, sub) => {
          setActiveContinent(cont); setActiveCountry(loc); setActiveSubRegion(sub || ''); setActiveTheme(''); setCurrentPage('home'); setShowNewOnly(false); setShowTodayOnly(false);
        }}
        countriesByContinent={images.reduce((acc, img) => { if (!acc[img.continent]) acc[img.continent] = []; if (!acc[img.continent].includes(img.country)) acc[img.continent].push(img.country); return acc; }, {} as any)}
      />

      <div className="bg-[#020617]/80 backdrop-blur-xl sticky top-[68px] md:top-[74px] z-[90] px-4 md:px-10 py-1.5 border-b border-white/5 shadow-xl">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-4">
           <div className="flex items-center gap-2">
             <button onClick={() => setShowTodayOnly(!showTodayOnly)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${showTodayOnly ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-900/40 text-slate-500'}`}>
                <CalendarCheck className="w-3.5 h-3.5" /> HOJE
             </button>
             <button onClick={() => setShowNewOnly(!showNewOnly)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${showNewOnly ? 'bg-pink-600 text-white shadow-lg' : 'bg-slate-900/40 text-slate-500'}`}>
                <Sparkles className="w-3.5 h-3.5" /> Novidades
             </button>
           </div>
           
           {/* Chloe: Indicador de Saúde da Memória */}
           <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 rounded-full border border-white/5">
              <div className={`w-2 h-2 rounded-full animate-pulse ${dbStatus === 'ok' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
              <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">
                {dbStatus === 'ok' ? 'Memória OK' : 'Erro de Acesso'}
              </span>
           </div>

           <div className="flex items-center gap-3">
             <div className="relative group hidden md:block">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600" />
               <input type="text" placeholder="Pesquisar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-slate-950/50 border border-white/5 rounded-full pl-8 pr-4 py-1.5 text-[9px] text-white outline-none w-48" />
             </div>
             {isAdmin && (
               <button onClick={() => setShowUpload(true)} className="bg-emerald-600 text-white px-4 py-2 rounded-full font-black text-[8px] uppercase tracking-widest shadow-lg flex items-center gap-1.5">
                 <Plus className="w-3.5 h-3.5" /> Novo
               </button>
             )}
           </div>
        </div>
      </div>

      <main className="flex-1 pb-20">
        {isLoading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
            <p className="text-[10px] font-black uppercase text-slate-500">A carregar o arquivo...</p>
          </div>
        ) : (
          <div className="p-4 md:p-8">
             <ImageGrid images={filteredImages} onImageClick={setSelectedImage} t={t.grid}/>
          </div>
        )}
      </main>

      <Footer onNavigate={setCurrentPage} onWebsitesClick={() => setShowWebsites(true)} onRadioClick={() => setShowRadio(true)} visitorCount={siteMetadata?.visitorCount} onVisitorsClick={() => setShowVisitors(true)} />

      <button onClick={handleForceRefresh} className="fixed bottom-4 left-4 z-[1001] p-2 bg-slate-900 rounded-full text-slate-600 hover:text-brand-400 border border-white/10 shadow-xl" title="Limpar Tudo">
        <RefreshCw className="w-4 h-4" />
      </button>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onUploadComplete={(data) => { setImages([data, ...images]); addSignal("Arquivado!"); }} existingImages={images} initialFile={null} currentUser={currentUser} t={t.upload} categories={categories} />}
      {selectedImage && <ImageViewer image={selectedImage} onClose={() => setSelectedImage(null)} onUpdate={async (data) => { await storageService.save(data); setImages(images.map(img => img.id === data.id ? data : img)); setSelectedImage(data); }} onDelete={async (id) => { await storageService.delete(id); setImages(images.filter(img => img.id !== id)); setSelectedImage(null); }} isAdmin={isAdmin} currentUser={currentUser} contextImages={images} onImageSelect={setSelectedImage} t={t.viewer} categories={categories} />}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={(u, p, type) => { if (type === 'admin' && p === '123456') { setIsAdmin(true); setCurrentUser(u); localStorage.setItem('archive_user', u); localStorage.setItem('archive_admin', 'true'); return true; } return false; }} t={t.login} />}
      {showHistory && <HistoryModal onClose={() => setShowHistory(false)} isAdmin={isAdmin} t={{...t.header, ...t.history}} />}
      {showWebsites && <WebsitesModal onClose={() => setShowWebsites(false)} isAdmin={isAdmin} t={t.header} />}
      {showRadio && <RadioModal onClose={() => setShowRadio(false)} />}
      {showVisitors && <VisitorsModal onClose={() => setShowVisitors(false)} visitors={siteMetadata?.visitorLog || []} totalCount={siteMetadata?.visitorCount || 0} />}
      <DivineSignal signals={signals} onRemove={(id) => setSignals(s => s.filter(sig => sig.id !== id))} />
    </div>
  );
};

export default App;
