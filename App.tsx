
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, Plus, Loader2, Sparkles, Zap, LayoutGrid, Trophy, Star, 
  Ticket, Layers, Box, MapPin, X, Diamond, Crown, CheckCircle2, Users, Clock, ChevronDown, ChevronRight,
  Ship, Landmark, Flag
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

const chloeChannel = new BroadcastChannel('chloe_archive_sync');
const RECENT_THRESHOLD = 172800000; 

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

  useEffect(() => {
    const init = async () => {
      try {
        await storageService.init();
        const [allImages, allCats, meta] = await Promise.all([
          storageService.getAll(),
          storageService.getCategories(),
          storageService.getSiteMetadata()
        ]);
        
        setImages(allImages || []);
        setCategories(allCats || []);
        
        const updatedMeta = {
           ...meta,
           visitorCount: (meta.visitorCount || 0) + 1,
        };
        setSiteMetadata(updatedMeta);
        await storageService.saveSiteMetadata(updatedMeta);
        
        chloeChannel.postMessage({ type: 'SYNC_METADATA', payload: updatedMeta });

        if (currentUser) {
           recordVisitor(currentUser, isAdmin, updatedMeta);
        }

      } catch (err) {
        console.error("Erro no carregamento do Arquivo:", err);
      } finally {
        setTimeout(() => setIsLoading(false), 800);
      }
    };
    init();
  }, []);

  const recordVisitor = async (name: string, isAdm: boolean, currentMeta?: SiteMetadata) => {
    const meta = currentMeta || siteMetadata;
    if (!meta) return;

    let location = 'Local Desconhecido';
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      if (data.city && data.country_name) {
        location = `${data.city}, ${data.country_name}`;
      }
    } catch (e) {
      console.log("Localização indisponível hihi!");
    }

    const newEntry: VisitorEntry = {
      name,
      isAdmin: isAdm,
      timestamp: Date.now(),
      location
    };

    const log = meta.visitorLog || [];
    const updatedLog = [newEntry, ...log].slice(0, 50);
    
    const updatedMeta = { ...meta, visitorLog: updatedLog };
    setSiteMetadata(updatedMeta);
    await storageService.saveSiteMetadata(updatedMeta);
    
    chloeChannel.postMessage({ type: 'SYNC_METADATA', payload: updatedMeta });
  };

  const addSignal = (message: string, type: Signal['type'] = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setSignals(prev => [...prev, { id, message, type }]);
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setCurrentUser(null);
    localStorage.removeItem('archive_user');
    localStorage.removeItem('archive_admin');
    addSignal("Até à próxima, vovô! hihi!");
    if (currentPage === 'collection') setCurrentPage('home');
  };

  const filteredImages = useMemo(() => {
    if (!images) return [];
    return images.filter(img => {
      const gName = (img.gameName || "").toLowerCase();
      const gCountry = (img.country || "").toLowerCase();
      const gIsland = (img.island || "").toLowerCase();
      const gRegion = (img.region || "").toLowerCase();
      const gSub = (img.subRegion || "").toLowerCase();
      const gNum = (img.gameNumber || "").toLowerCase();
      const s = searchTerm.toLowerCase();
      
      const isRecent = (Date.now() - (img.createdAt || 0)) < RECENT_THRESHOLD;
      
      const matchesSearch = gName.includes(s) || gCountry.includes(s) || gIsland.includes(s) || gNum.includes(s) || gRegion.includes(s);
      const matchesContinent = activeContinent === 'Mundo' || img.continent === activeContinent;
      
      let matchesLocation = true;
      if (activeCountry) {
        const countryMatch = gCountry === activeCountry.toLowerCase();
        if (activeSubRegion) {
          const sub = activeSubRegion.toLowerCase();
          if (activeCountry.toLowerCase() === 'portugal' && sub === 'continente') {
            matchesLocation = countryMatch && !img.island;
          } else {
            matchesLocation = countryMatch && (gSub === sub || gIsland === sub || gRegion === sub || (img.operator && img.operator.toLowerCase().includes(sub)));
          }
        } else {
          matchesLocation = countryMatch;
        }
      }

      const matchesCategory = activeCategory === 'all' || img.category === activeCategory;
      const matchesTheme = !activeTheme || img.theme?.toLowerCase() === activeTheme.toLowerCase();
      const matchesRarity = !showRaritiesOnly || img.isRarity;
      const matchesWinners = !showWinnersOnly || img.isWinner;
      const matchesSeries = !showSeriesOnly || img.isSeries;
      const matchesNew = !showNewOnly || isRecent;
      
      if (currentPage === 'collection') if (!currentUser || !img.owners?.includes(currentUser)) return false;
      
      return matchesSearch && matchesContinent && matchesLocation && matchesCategory && matchesTheme && matchesRarity && matchesWinners && matchesSeries && matchesNew;
    });
  }, [images, searchTerm, activeContinent, activeCountry, activeSubRegion, activeCategory, activeTheme, showRaritiesOnly, showWinnersOnly, showSeriesOnly, showNewOnly, currentPage, currentUser]);

  const recentCountriesData = useMemo(() => {
    const recent = images.filter(img => (Date.now() - (img.createdAt || 0)) < RECENT_THRESHOLD);
    const counts: Record<string, number> = {};
    recent.forEach(img => {
      counts[img.country] = (counts[img.country] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [images]);

  const collectionCount = useMemo(() => {
    if (!currentUser) return 0;
    return images.filter(img => img.owners?.includes(currentUser)).length;
  }, [images, currentUser]);

  const handleExport = async () => {
    try {
      // Chloe: Agora garantimos que o ficheiro é criado e descarregado corretamente em tablets!
      const dataStr = await storageService.exportData();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-arquivo-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      addSignal("Arquivo exportado com sucesso! hihi!", "success");
    } catch (err) {
      console.error("Erro export:", err);
      addSignal("Erro ao exportar arquivo.", "warning");
    }
  };

  const handleImport = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const count = await storageService.importData(content);
        const all = await storageService.getAll();
        setImages(all || []);
        addSignal(`${count} itens integrados no arquivo! hihi!`, "success");
      } catch (err) {
        addSignal("O ficheiro não é válido! hihi!", "warning");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-100 pt-24 md:pt-28">
      <Header 
        isAdmin={isAdmin}
        currentUser={currentUser}
        language={language}
        setLanguage={setLanguage}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onAdminToggle={() => setShowLogin(true)}
        onLogout={handleLogout}
        onHistoryClick={() => setShowHistory(true)}
        onRadioClick={() => setShowRadio(true)}
        onExport={handleExport}
        onImport={handleImport}
        onExportTXT={() => {}}
        onExportCSV={() => {}}
        t={t.header}
        recentCount={images.filter(img => (Date.now() - (img.createdAt || 0)) < RECENT_THRESHOLD).length}
        collectionCount={collectionCount}
        onCountrySelect={(cont, loc, sub) => {
          setActiveContinent(cont);
          setActiveCountry(loc);
          setActiveSubRegion(sub || '');
          setActiveTheme('');
          setCurrentPage('home');
          setShowNewOnly(false);
          setShowSeriesOnly(false);
        }}
        countriesByContinent={images.reduce((acc, img) => {
          if (!acc[img.continent]) acc[img.continent] = [];
          if (!acc[img.continent].includes(img.country)) acc[img.continent].push(img.country);
          return acc;
        }, {} as any)}
      />

      {(currentPage === 'home' || currentPage === 'collection') && (
        <div className="bg-[#020617]/40 backdrop-blur-3xl sticky top-[68px] md:top-[74px] z-[90] px-4 md:px-10 py-1 border-b border-white/5 shadow-xl transition-all">
          <div className="max-w-[1800px] mx-auto flex flex-col items-stretch">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-1 md:gap-3 py-1">
              <div className="flex flex-wrap items-center justify-center gap-1 md:gap-1.5">
                <div className="flex items-center gap-1 border-r border-white/10 pr-1 mr-0.5">
                  {activeTheme && (
                      <button 
                        onClick={() => setActiveTheme('')}
                        className="bg-brand-600 text-white px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-2"
                      >
                        Tema: {activeTheme} <X className="w-2.5 h-2.5" />
                      </button>
                  )}
                  <button 
                    onClick={() => { setShowSeriesOnly(!showSeriesOnly); setShowRaritiesOnly(false); setShowWinnersOnly(false); setActiveCategory('all'); setActiveCountry(''); setActiveSubRegion(''); setActiveTheme(''); setShowNewOnly(false); }} 
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${showSeriesOnly ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-slate-900/40 border border-white/5 text-slate-500 hover:text-blue-400'}`}
                  >
                    <Layers className="w-3 h-3" /> Séries
                  </button>
                  <button 
                    onClick={() => { setShowRaritiesOnly(!showRaritiesOnly); setShowSeriesOnly(false); setShowWinnersOnly(false); setActiveCategory('all'); setActiveCountry(''); setActiveSubRegion(''); setActiveTheme(''); setShowNewOnly(false); }} 
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${showRaritiesOnly ? 'bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-slate-900/40 border border-white/5 text-slate-500 hover:text-amber-400'}`}
                  >
                    <Diamond className="w-3 h-3" /> Raridades
                  </button>
                  <button 
                    onClick={() => { setShowWinnersOnly(!showWinnersOnly); setShowSeriesOnly(false); setShowRaritiesOnly(false); setActiveCategory('all'); setActiveCountry(''); setActiveSubRegion(''); setActiveTheme(''); setShowNewOnly(false); }} 
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${showWinnersOnly ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-slate-900/40 border border-white/5 text-slate-500 hover:text-emerald-400'}`}
                  >
                    <Trophy className="w-3 h-3" /> Premiadas
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-1 py-1">
                    {[
                      { id: 'all', label: 'Tudo', icon: LayoutGrid },
                      { id: 'raspadinha', label: 'Raspadinhas', icon: Ticket },
                      { id: 'lotaria', label: 'Lotarias', icon: Star },
                      { id: 'boletim', label: 'Boletins', icon: Layers },
                      { id: 'objeto', label: 'Objetos', icon: Box },
                    ].map(cat => (
                      <button 
                        key={cat.id} 
                        onClick={() => { setActiveCategory(cat.id); setShowSeriesOnly(false); setShowRaritiesOnly(false); setShowWinnersOnly(false); setShowNewOnly(false); setActiveCountry(''); setActiveSubRegion(''); setActiveTheme(''); }} 
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${activeCategory === cat.id ? 'bg-brand-600 text-white border border-brand-400/30' : 'bg-slate-900/40 border border-white/5 text-slate-500 hover:text-brand-400'}`}
                      >
                        <cat.icon className="w-3 h-3" /> {cat.label}
                      </button>
                    ))}
                    
                    <button 
                      onClick={() => { 
                        // Chloe: Garante que ao clicar em novidades, voltamos ao "Início" para ver os resultados!
                        setCurrentPage('home');
                        const willShow = !showNewOnly;
                        setShowNewOnly(willShow); 
                        setActiveCategory('all'); 
                        setShowSeriesOnly(false); 
                        setShowRaritiesOnly(false); 
                        setShowWinnersOnly(false); 
                        setActiveCountry(''); 
                        setActiveSubRegion(''); 
                        setActiveTheme(''); 
                      }} 
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${showNewOnly ? 'bg-pink-600 text-white border border-pink-400/30 shadow-[0_0_15px_rgba(219,39,119,0.4)]' : 'bg-slate-900/40 border border-white/5 text-slate-500 hover:text-pink-400'}`}
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Novidades
                    </button>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full lg:w-auto">
                <div className="relative flex-1 lg:w-48 group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600 group-focus-within:text-brand-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Pesquisar..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="w-full bg-slate-950/50 border border-white/5 rounded-full pl-8 pr-4 py-1.5 text-[9px] focus:border-brand-500/50 outline-none transition-all uppercase tracking-wider text-white shadow-inner"
                  />
                </div>
                {isAdmin && (
                  <button 
                    onClick={() => setShowUpload(true)} 
                    className="bg-emerald-600/90 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-full font-black text-[8px] uppercase tracking-widest transition-all flex items-center gap-1.5 shadow-lg active:scale-95 border border-emerald-400/20 whitespace-nowrap"
                  >
                    <Plus className="w-3 h-3" /> Novo Item
                  </button>
                )}
              </div>
            </div>

            {showNewOnly && recentCountriesData.length > 0 && (
              <div className="flex items-center gap-2 py-1.5 border-t border-white/5 animate-fade-in overflow-x-auto scrollbar-hide">
                 <div className="flex items-center gap-2 px-1 shrink-0">
                    <Zap className="w-2.5 h-2.5 text-pink-500 fill-pink-500 animate-pulse" />
                    <span className="text-[7px] font-black text-slate-500 uppercase tracking-[0.2em] whitespace-nowrap">Países com Novas Entradas:</span>
                 </div>
                 <div className="flex items-center gap-1 pr-4">
                    <button 
                      onClick={() => setActiveCountry('')}
                      className={`px-3 py-1.5 rounded-md text-[7px] font-black uppercase tracking-widest transition-all border flex items-center gap-1.5 ${!activeCountry ? 'bg-slate-100 text-slate-950 border-white' : 'bg-slate-900/60 text-slate-500 border-white/5 hover:border-white/20'}`}
                    >
                      Tudo
                      <span className={`px-1 rounded-sm text-[6px] ${!activeCountry ? 'bg-slate-300 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
                        {recentCountriesData.reduce((acc, c) => acc + c.count, 0)}
                      </span>
                    </button>
                    {recentCountriesData.map(c => (
                      <button 
                        key={c.name}
                        onClick={() => setActiveCountry(c.name)}
                        className={`px-3 py-1.5 rounded-md text-[7px] font-black uppercase tracking-widest transition-all border whitespace-nowrap flex items-center gap-1.5 ${activeCountry.toLowerCase() === c.name.toLowerCase() ? 'bg-pink-600 text-white border-pink-400 shadow-[0_0_10px_rgba(219,39,119,0.3)]' : 'bg-slate-900/60 text-slate-400 border-white/5 hover:border-white/20'}`}
                      >
                        {c.name}
                        <span className={`px-1 rounded-sm text-[6px] ${activeCountry.toLowerCase() === c.name.toLowerCase() ? 'bg-pink-400 text-white' : 'bg-slate-800 text-pink-500'}`}>
                          {c.count}
                        </span>
                      </button>
                    ))}
                 </div>
              </div>
            )}
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col min-h-0 pb-20">
        {(currentPage === 'home' || currentPage === 'collection') && (
          <div className="p-4 md:p-8 animate-fade-in">
            <ImageGrid images={filteredImages} onImageClick={setSelectedImage} isAdmin={isAdmin} currentUser={currentUser} t={t.grid}/>
          </div>
        )}

        {currentPage === 'themes' && (
           <ThemesPage 
             images={images}
             onThemeSelect={(themeId) => {
                setActiveTheme(themeId);
                setCurrentPage('home');
             }}
           />
        )}

        {currentPage === 'stats' && (
           <StatsSection 
             images={images}
             stats={images.reduce((acc, img) => { if (img.continent) acc[img.continent] = (acc[img.continent] || 0) + 1; return acc; }, {} as any)}
             categoryStats={{ scratch: images.filter(i => i.category === 'raspadinha').length, lottery: images.filter(i => i.category === 'lotaria').length }}
             countryStats={images.reduce((acc, img) => { if (img.country) acc[img.country] = (acc[img.country] || 0) + 1; return acc; }, {} as any)}
             stateStats={images.reduce((acc, img) => { if (img.state) acc[img.state] = (acc[img.state] || 0) + 1; return acc; }, {} as any)}
             collectorStats={images.reduce((acc, img) => { const c = img.collector || 'Geral'; acc[c] = (acc[c] || 0) + 1; return acc; }, {} as any)}
             totalRecords={images.length}
             t={t.stats}
             currentUser={currentUser}
           />
        )}

        {currentPage === 'map' && (
           <div className="p-10 h-full min-h-[600px]">
             <WorldMap images={images} activeContinent={activeContinent} onCountrySelect={(country) => { setActiveCountry(country); setActiveSubRegion(''); setCurrentPage('home'); }} t={t.grid} />
           </div>
        )}

        {currentPage === 'about' && (
          <AboutPage 
            t={t.about} isAdmin={isAdmin} founderPhoto={siteMetadata?.founderPhotoUrl} founderBio={siteMetadata?.founderBio} founderQuote={siteMetadata?.founderQuote} milestones={siteMetadata?.milestones}
            onUpdateFounderPhoto={(url) => setSiteMetadata(prev => prev ? {...prev, founderPhotoUrl: url} : {id: 'site_settings', founderPhotoUrl: url})}
            onUpdateMetadata={(data) => {
               const updated = {...siteMetadata, ...data} as SiteMetadata;
               setSiteMetadata(updated);
               storageService.saveSiteMetadata(updated);
               addSignal("Memórias atualizadas! hihi!", "success");
            }}
          />
        )}
      </main>

      <Footer 
        onNavigate={setCurrentPage}
        onWebsitesClick={() => setShowWebsites(true)}
        onRadioClick={() => setShowRadio(true)}
        visitorCount={siteMetadata?.visitorCount}
        onVisitorsClick={() => setShowVisitors(true)}
      />

      {showUpload && (
        <UploadModal 
          onClose={() => setShowUpload(false)}
          onUploadComplete={(data) => {
            setImages([data, ...images]);
            addSignal(`${data.gameName} arquivado! hihi!`, 'success');
          }}
          existingImages={images} initialFile={null} currentUser={currentUser} t={t.upload} categories={categories}
        />
      )}

      {selectedImage && (
        <ImageViewer 
          image={selectedImage} onClose={() => setSelectedImage(null)}
          onUpdate={async (data) => { await storageService.save(data); setImages(images.map(img => img.id === data.id ? data : img)); setSelectedImage(data); addSignal("Registo atualizado! hihi!", "info"); }}
          onDelete={async (id) => { await storageService.delete(id); setImages(images.filter(img => img.id !== id)); setSelectedImage(null); addSignal("Item removido.", "warning"); }}
          isAdmin={isAdmin} currentUser={currentUser} contextImages={images} onImageSelect={setSelectedImage} t={t.viewer} categories={categories}
        />
      )}

      {showLogin && (
        <LoginModal 
          onClose={() => setShowLogin(false)}
          onLogin={(u, p, type) => {
            if (type === 'admin' && p === '123456') {
              setIsAdmin(true);
              setCurrentUser(u);
              localStorage.setItem('archive_user', u);
              localStorage.setItem('archive_admin', 'true');
              recordVisitor(u, true);
              addSignal(`Bem-vindo, Comandante ${u}! hihi!`, 'divine');
              return true;
            } else if (type === 'visitor') {
              setCurrentUser(u);
              localStorage.setItem('archive_user', u);
              localStorage.setItem('archive_admin', 'false');
              recordVisitor(u, false);
              addSignal(`Olá, ${u}! Bom ver-te aqui! hihi!`, 'success');
              return true;
            }
            return false;
          }}
          t={t.login}
        />
      )}

      {showHistory && <HistoryModal onClose={() => setShowHistory(false)} isAdmin={isAdmin} t={{...t.header, ...t.history}} />}
      {showWebsites && <WebsitesModal onClose={() => setShowWebsites(false)} isAdmin={isAdmin} t={t.header} />}
      {showRadio && <RadioModal onClose={() => setShowRadio(false)} />}
      {showVisitors && <VisitorsModal onClose={() => setShowVisitors(false)} visitors={siteMetadata?.visitorLog || []} totalCount={siteMetadata?.visitorCount || 0} />}

      <DivineSignal signals={signals} onRemove={(id) => setSignals(s => s.filter(sig => sig.id !== id))} />
    </div>
  );
};

export default App;
