import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ImageGrid } from './components/ImageGrid';
import { UploadModal } from './components/UploadModal';
import { ImageViewer } from './components/ImageViewer';
import { LoginModal } from './components/LoginModal';
import { StatsSection } from './components/StatsSection';
import { HistoryModal } from './components/HistoryModal'; 
import { WebsitesModal } from './components/WebsitesModal';
import { AboutPage } from './components/AboutPage'; 
import { INITIAL_RASPADINHAS } from './constants';
import { ScratchcardData, Continent, Category } from './types';
import { 
  Globe, Ticket, Coins, Heart, Gem, Gift, Trophy, 
  Building2, Database, Loader2, Sparkles, X, 
  ClipboardList, Package, Search, Filter, MapPin, PlusCircle, LogIn, LayoutGrid
} from 'lucide-react';
import { translations, Language } from './translations';
import { storageService } from './services/storage';

const AUTHORIZED_ADMINS = ["JORGE MESQUITA", "FABIO PAGNI", "CHLOE", "IA", "SYSTEM", "PEDRO RODRIGO"];
const ADMIN_PASSWORD = "123456";

type PageType = 'home' | 'stats' | 'about' | 'europe' | 'america' | 'asia' | 'africa' | 'oceania' | 'showcase' | 'my-collection';

function App() {
  const [allImagesCache, setAllImagesCache] = useState<ScratchcardData[]>([]);
  const [totalStats, setTotalStats] = useState({ total: 0, stats: {} as Record<string, number>, categoryStats: { scratch: 0, lottery: 0 }, countryStats: {} as Record<string, number>, stateStats: {} as Record<string, number>, collectorStats: {} as Record<string, number> });
  const [isLoadingDB, setIsLoadingDB] = useState(true);
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [activeContinent, setActiveContinent] = useState<Continent | 'Mundo'>('Mundo');
  const [filterRarity, setFilterRarity] = useState(false);
  const [filterPromo, setFilterPromo] = useState(false);
  const [filterWinners, setFilterWinners] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false); 
  const [isWebsitesModalOpen, setIsWebsitesModalOpen] = useState(false); 
  const [selectedImage, setSelectedImage] = useState<ScratchcardData | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'visitor' | null>(null);
  const isAdmin = userRole === 'admin';
  const [language, setLanguage] = useState<Language>('pt');
  const t = translations[language];

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoadingDB(true);
    try {
      await storageService.init();
      const allItems = await storageService.getAll();
      if (allItems.length === 0) {
        await storageService.syncInitialItems(INITIAL_RASPADINHAS);
        const firstItems = await storageService.getAll();
        setAllImagesCache(firstItems);
      } else {
        setAllImagesCache(allItems);
      }
      const freshStats = await storageService.getStats();
      setTotalStats(freshStats);
    } catch (error) { console.error(error); }
    finally { setIsLoadingDB(false); }
  };

  // Added handleInstallApp to handle PWA installation prompt
  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleUploadComplete = async (newItem: ScratchcardData) => {
    setAllImagesCache(prev => {
      const exists = prev.find(img => img.id === newItem.id);
      if (exists) return prev.map(img => img.id === newItem.id ? newItem : img);
      return [...prev, newItem];
    });
    const freshStats = await storageService.getStats();
    setTotalStats(freshStats);
  };

  const countriesByContinent = useMemo(() => {
    const mapping: Record<string, string[]> = {
      'Europa': [], 'América': [], 'Ásia': [], 'África': [], 'Oceania': []
    };
    allImagesCache.forEach(img => {
      if (mapping[img.continent] && !mapping[img.continent].includes(img.country)) {
        mapping[img.continent].push(img.country);
      }
    });
    Object.keys(mapping).forEach(key => mapping[key].sort());
    return mapping;
  }, [allImagesCache]);

  const handleCountrySelectFromHeader = (continent: Continent, country: string) => {
    setCurrentPage('home');
    setActiveContinent(continent);
    setCountrySearch(country);
    setSearchTerm('');
    // Scroll para o topo ao selecionar país
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExportJSON = async () => {
    const data = await storageService.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arquivo-mundial-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Nome", "Número", "País", "Estado", "Ano", "Preço", "Linhas", "Colecionador"];
    const rows = allImagesCache.map(i => [i.customId, i.gameName, i.gameNumber, i.country, i.state, i.releaseDate, i.price || '', i.lines || '', i.collector || '']);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arquivo-mundial-lista.csv`;
    a.click();
  };

  const handleExportTXT = () => {
    const text = allImagesCache.map(i => `${i.customId} - ${i.gameName} (${i.country}) [${i.state}]`).join("\n");
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `checklist-arquivo-mundial.txt`;
    a.click();
  };

  const handleImportJSON = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const count = await storageService.importData(e.target?.result as string);
        alert(`${count} registos restaurados!`);
        loadData();
      } catch (err) { alert("Erro ao importar."); }
    };
    reader.readAsText(file);
  };

  const handleUpdateImage = async (updatedImage: ScratchcardData) => {
    await storageService.save(updatedImage);
    setAllImagesCache(prev => prev.map(img => img.id === updatedImage.id ? updatedImage : img));
    const freshStats = await storageService.getStats();
    setTotalStats(freshStats);
  };

  const handleDeleteImage = async (id: string) => {
    await storageService.delete(id);
    setAllImagesCache(prev => prev.filter(img => img.id !== id));
    setSelectedImage(null);
    const freshStats = await storageService.getStats();
    setTotalStats(freshStats);
  };

  const filteredImages = useMemo(() => {
    return allImagesCache.filter(i => {
      if (activeContinent !== 'Mundo' && i.continent !== activeContinent) return false;
      if (activeCategory !== 'all' && i.category !== activeCategory) return false;
      if (filterRarity && !i.isRarity) return false;
      if (filterPromo && !i.isPromotional) return false;
      if (filterWinners && !i.isWinner) return false;
      if (currentPage === 'my-collection' && (!currentUser || !i.owners?.includes(currentUser))) return false;
      
      const search = (countrySearch || searchTerm).toLowerCase();
      if (search) {
        return i.gameName.toLowerCase().includes(search) || 
               i.country.toLowerCase().includes(search) || 
               (i.region && i.region.toLowerCase().includes(search)) ||
               i.gameNumber.toLowerCase().includes(search) ||
               i.customId.toLowerCase().includes(search);
      }
      return true;
    }).sort((a, b) => a.gameNumber.localeCompare(b.gameNumber, undefined, { numeric: true }));
  }, [allImagesCache, activeContinent, activeCategory, filterRarity, filterPromo, filterWinners, countrySearch, searchTerm, currentPage, currentUser]);

  // CHAVE DE RESET PARA A GRID: Sempre que os filtros mudarem, a grid volta à pág 1
  const gridKey = useMemo(() => {
    return `${currentPage}-${activeContinent}-${activeCategory}-${countrySearch}-${searchTerm}-${filterRarity}-${filterPromo}-${filterWinners}-${currentUser}`;
  }, [currentPage, activeContinent, activeCategory, countrySearch, searchTerm, filterRarity, filterPromo, filterWinners, currentUser]);

  const handleNavigate = (p: PageType) => {
    setCurrentPage(p);
    setCountrySearch('');
    setSearchTerm('');
    if (['europe', 'america', 'asia', 'africa', 'oceania'].includes(p as string)) {
       const mapping: Record<string, Continent> = { 'europe': 'Europa', 'america': 'América', 'asia': 'Ásia', 'africa': 'África', 'oceania': 'Oceania' };
       setActiveContinent(mapping[p as string]);
    } else if (p === 'home') {
       setActiveContinent('Mundo');
       setActiveCategory('all');
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Header 
        isAdmin={isAdmin} 
        currentUser={currentUser} 
        onAdminToggle={() => setIsLoginModalOpen(true)}
        onLogout={() => { setCurrentUser(null); setUserRole(null); handleNavigate('home'); }} 
        onHistoryClick={() => setIsHistoryModalOpen(true)} 
        onExport={handleExportJSON}
        onExportCSV={handleExportCSV}
        onExportTXT={handleExportTXT}
        onImport={handleImportJSON}
        language={language} setLanguage={setLanguage}
        currentPage={currentPage} 
        onNavigate={handleNavigate} 
        t={t.header}
        onInstall={handleInstallApp}
        countriesByContinent={countriesByContinent}
        onCountrySelect={handleCountrySelectFromHeader}
      />

      <main className="flex-1 overflow-y-auto bg-slate-950 scroll-smooth custom-scrollbar flex flex-col">
        {!(currentPage === 'stats' || currentPage === 'about') && (
          <div className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
            <div className="bg-slate-900/30 p-2 md:px-8 flex flex-wrap items-center gap-2">
              <button onClick={() => setFilterRarity(!filterRarity)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-black transition-all ${filterRarity ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}><Gem className="w-3.5 h-3.5" /> Raridades</button>
              <button onClick={() => setFilterPromo(!filterPromo)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-black transition-all ${filterPromo ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}><Gift className="w-3.5 h-3.5" /> Promo</button>
              <button onClick={() => setFilterWinners(!filterWinners)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-black transition-all ${filterWinners ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}><Trophy className="w-3.5 h-3.5" /> Premiadas</button>
              <button onClick={() => handleNavigate(currentPage === 'my-collection' ? 'home' : 'my-collection')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-black transition-all ${currentPage === 'my-collection' ? 'bg-brand-600 text-white shadow-lg' : 'bg-slate-800/50 text-slate-400'}`}><Heart className="w-3.5 h-3.5" /> Minha Coleção</button>
              <div className="flex items-center gap-1 bg-slate-900/50 border border-slate-800 p-1 rounded-lg">
                  {['all', 'raspadinha', 'lotaria', 'boletim', 'objeto'].map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(cat as any)} className={`px-3 py-1 rounded text-[10px] font-black uppercase transition-all ${activeCategory === cat ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>{cat === 'all' ? 'Tudo' : cat}</button>
                  ))}
              </div>
            </div>
            <div className="px-4 md:px-8 py-3 bg-slate-950/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                <button onClick={() => { setActiveContinent('Mundo'); handleNavigate('home'); }} className={`px-4 py-2 rounded-full text-[11px] font-black flex items-center gap-2 border transition-all ${activeContinent === 'Mundo' ? 'bg-blue-600 text-white border-blue-400' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>Mundo <span className="bg-slate-800 text-[9px] px-1.5 rounded">{totalStats.total}</span></button>
                {['Europa', 'América', 'Ásia', 'África', 'Oceania'].map(cont => (
                    <button key={cont} onClick={() => { setActiveContinent(cont as Continent); if(currentPage === 'my-collection') handleNavigate('home'); }} className={`px-4 py-2 rounded-full text-[11px] font-black flex items-center gap-2 border transition-all ${activeContinent === cont ? 'bg-orange-600 text-white border-orange-400' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>{cont} <span className="bg-slate-800 text-[9px] px-1.5 rounded">{totalStats.stats[cont] || 0}</span></button>
                ))}
              </div>
              <div className="relative group w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
                  <input type="text" placeholder="Procurar no arquivo..." value={countrySearch} onChange={(e) => setCountrySearch(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white outline-none w-full focus:border-blue-500 transition-all" />
              </div>
            </div>
          </div>
        )}

        <div className="relative flex-1">
          {currentPage === 'stats' ? (
            <StatsSection stats={totalStats.stats} categoryStats={totalStats.categoryStats} countryStats={totalStats.countryStats} stateStats={totalStats.stateStats} collectorStats={totalStats.collectorStats} totalRecords={totalStats.total} t={t.stats} />
          ) : currentPage === 'about' ? (
            <AboutPage t={t} />
          ) : (
            <div className="p-4 md:p-8 animate-fade-in min-h-[50vh]">
              {isLoadingDB ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4"><Loader2 className="w-10 h-10 text-brand-500 animate-spin" /><p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Sincronizando Arquivo...</p></div>
              ) : (
                  <ImageGrid key={gridKey} images={filteredImages} onImageClick={setSelectedImage} isAdmin={isAdmin} currentUser={currentUser} t={t.grid} />
              )}
            </div>
          )}
        </div>
      </main>

      <Footer onNavigate={handleNavigate} onWebsitesClick={() => setIsWebsitesModalOpen(true)} onInstall={handleInstallApp} />

      {isAdmin && (
        <button onClick={() => setIsUploadModalOpen(true)} className="fixed bottom-24 right-8 w-16 h-16 bg-brand-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-40 border-4 border-slate-950">
          <PlusCircle className="w-8 h-8" />
        </button>
      )}

      {selectedImage && (
        <ImageViewer 
          image={selectedImage} onClose={() => setSelectedImage(null)}
          onUpdate={handleUpdateImage} onDelete={handleDeleteImage}
          isAdmin={isAdmin} currentUser={currentUser} contextImages={allImagesCache}
          onImageSelect={setSelectedImage} t={t.viewer}
        />
      )}

      {isLoginModalOpen && <LoginModal onClose={() => setIsLoginModalOpen(false)} onLogin={(u, p, t) => {
        if (t === 'admin') {
          const clean = u.trim().toUpperCase();
          if (AUTHORIZED_ADMINS.includes(clean) && p === ADMIN_PASSWORD) { setCurrentUser(u); setUserRole('admin'); return true; }
          return false;
        } else { setCurrentUser(u); setUserRole('visitor'); return true; }
      }} t={t.login} />}
      
      {isUploadModalOpen && <UploadModal onClose={() => setIsUploadModalOpen(false)} onUploadComplete={handleUploadComplete} existingImages={[]} initialFile={null} currentUser={currentUser} t={t.upload} />}
      {isHistoryModalOpen && <HistoryModal onClose={() => setIsHistoryModalOpen(false)} isAdmin={isAdmin} t={t.header} />}
      {isWebsitesModalOpen && <WebsitesModal onClose={() => setIsWebsitesModalOpen(false)} isAdmin={isAdmin} t={t.header} />}
    </div>
  );
}

export default App;