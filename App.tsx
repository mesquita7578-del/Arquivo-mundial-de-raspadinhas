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
  ClipboardList, Package, Search, Filter, MapPin, PlusCircle, LogIn
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

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    }
  };

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
    const headers = ["ID", "Nome", "Número", "País", "Estado", "Ano", "Preço", "Colecionador"];
    const rows = allImagesCache.map(i => [i.customId, i.gameName, i.gameNumber, i.country, i.state, i.releaseDate, i.price || '', i.collector || '']);
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
        alert(`${count} registos restaurados com sucesso!`);
        loadData();
      } catch (err) { alert("Erro ao importar ficheiro."); }
    };
    reader.readAsText(file);
  };

  const handleUpdateImage = async (updatedImage: ScratchcardData) => {
    await storageService.save(updatedImage);
    loadData();
  };

  const handleDeleteImage = async (id: string) => {
    await storageService.delete(id);
    loadData();
    setSelectedImage(null);
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
               i.gameNumber.toLowerCase().includes(search) ||
               i.customId.toLowerCase().includes(search);
      }
      return true;
    }).sort((a, b) => {
      // Ordenação Natural por Número de Jogo (Ascendente: 1, 2, 10, J01...)
      // Conforme pedido por Jorge Mesquita
      return a.gameNumber.localeCompare(b.gameNumber, undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [allImagesCache, activeContinent, activeCategory, filterRarity, filterPromo, filterWinners, countrySearch, searchTerm, currentPage, currentUser]);

  const registeredCountries = useMemo(() => {
     return Object.keys(totalStats.countryStats).sort();
  }, [totalStats.countryStats]);

  const handleNavigate = (p: PageType) => {
    setCurrentPage(p);
    // Reset filters when changing page to avoid confusion
    setCountrySearch('');
    if (['europe', 'america', 'asia', 'africa', 'oceania'].includes(p as string)) {
       const mapping: Record<string, Continent> = {
         'europe': 'Europa', 'america': 'América', 'asia': 'Ásia', 'africa': 'África', 'oceania': 'Oceania'
       };
       setActiveContinent(mapping[p as string]);
    } else {
       setActiveContinent('Mundo');
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Header 
        isAdmin={isAdmin} 
        currentUser={currentUser} 
        onAdminToggle={() => setIsLoginModalOpen(true)}
        onLogout={() => { setCurrentUser(null); setUserRole(null); setCurrentPage('home'); }} 
        onHistoryClick={() => setIsHistoryModalOpen(true)} 
        onExport={handleExportJSON}
        onExportCSV={handleExportCSV}
        onExportTXT={handleExportTXT}
        onImport={handleImportJSON}
        language={language} setLanguage={setLanguage}
        currentPage={currentPage} 
        onNavigate={handleNavigate} 
        t={t.header}
        onInstall={deferredPrompt ? handleInstallApp : undefined}
      />

      <main className="flex-1 overflow-y-auto bg-slate-950 scroll-smooth custom-scrollbar flex flex-col">
        
        {/* ÁREA FIXA (Sticky Section) */}
        {!(currentPage === 'stats' || currentPage === 'about') && (
          <div className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
            {/* BARRA DE FILTROS SUPERIOR */}
            <div className="bg-slate-900/30 p-2 md:px-8 flex flex-wrap items-center gap-2">
              <button onClick={() => setFilterRarity(!filterRarity)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${filterRarity ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200'}`}>
                <Gem className="w-3.5 h-3.5" /> Raridades
              </button>
              <button onClick={() => setFilterPromo(!filterPromo)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${filterPromo ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200'}`}>
                <Gift className="w-3.5 h-3.5" /> Promo
              </button>
              <button onClick={() => setFilterWinners(!filterWinners)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${filterWinners ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200'}`}>
                <Trophy className="w-3.5 h-3.5" /> Premiadas
              </button>
              <button onClick={() => handleNavigate('my-collection')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${currentPage === 'my-collection' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200'}`}>
                <Heart className="w-3.5 h-3.5" /> Coleção
              </button>
              <button onClick={() => setIsWebsitesModalOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200 text-[10px] font-bold transition-all">
                <Building2 className="w-3.5 h-3.5" /> Sites
              </button>

              <div className="h-6 w-px bg-slate-800 mx-1 hidden md:block"></div>

              <div className="flex items-center gap-1 bg-slate-900/50 border border-slate-800 p-1 rounded-lg">
                  {['all', 'raspadinha', 'lotaria', 'boletim', 'objeto'].map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => setActiveCategory(cat as any)} 
                      className={`px-3 py-1 rounded text-[10px] font-bold uppercase ${activeCategory === cat ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      {cat === 'all' ? 'Tudo' : cat}
                    </button>
                  ))}
              </div>
            </div>

            {/* SEÇÃO EXPLORAR FIXA */}
            <div className="px-4 md:px-8 py-3 bg-slate-950/40">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Continentes Compactos */}
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setActiveContinent('Mundo')} className={`px-4 py-2 rounded-full text-[11px] font-bold flex items-center gap-2 border transition-all ${activeContinent === 'Mundo' ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'}`}>
                        Mundo <span className="bg-slate-800 text-[9px] px-1.5 rounded">{totalStats.total}</span>
                    </button>
                    {['Europa', 'América', 'Ásia', 'África', 'Oceania'].map(cont => (
                        <button key={cont} onClick={() => setActiveContinent(cont as Continent)} className={`px-4 py-2 rounded-full text-[11px] font-bold flex items-center gap-2 border transition-all ${activeContinent === cont ? 'bg-orange-600 border-orange-500 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'}`}>
                          {cont} <span className="bg-slate-800 text-[9px] px-1.5 rounded">{totalStats.stats[cont] || 0}</span>
                        </button>
                    ))}
                  </div>

                  {/* Pesquisa de País Compacta */}
                  <div className="flex items-center gap-3">
                    <div className="relative group w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
                        <input 
                          type="text" placeholder="Procurar País..." value={countrySearch} onChange={(e) => setCountrySearch(e.target.value)}
                          className="bg-slate-900/80 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:border-blue-500 outline-none w-full"
                        />
                    </div>
                  </div>
                </div>
                
                {/* LISTA DINÂMICA DE PAÍSES FIXA */}
                <div className="mt-3 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 custom-scrollbar">
                    {registeredCountries.map(country => (
                      <button 
                        key={country} 
                        onClick={() => setCountrySearch(country)}
                        className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase border transition-all ${countrySearch === country ? 'bg-brand-600 border-brand-500 text-white' : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:text-white'}`}
                      >
                          {country} <span className="opacity-40 ml-0.5">({totalStats.countryStats[country]})</span>
                      </button>
                    ))}
                    {countrySearch && (
                      <button onClick={() => setCountrySearch('')} className="px-2.5 py-1 rounded-md text-[9px] font-bold uppercase bg-slate-700 text-white flex items-center gap-1">
                          <X className="w-2.5 h-2.5" /> Limpar
                      </button>
                    )}
                </div>
            </div>
          </div>
        )}

        {/* CONTEÚDO PRINCIPAL (Scrollable) */}
        <div className="relative flex-1">
          {currentPage === 'stats' ? (
            <StatsSection stats={totalStats.stats} categoryStats={totalStats.categoryStats} countryStats={totalStats.countryStats} stateStats={totalStats.stateStats} collectorStats={totalStats.collectorStats} totalRecords={totalStats.total} t={t.stats} />
          ) : currentPage === 'about' ? (
            <AboutPage t={t} />
          ) : (
            <div className="p-4 md:p-8 animate-fade-in min-h-[50vh]">
              {isLoadingDB ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">A sincronizar Arquivo...</p>
                  </div>
              ) : currentPage === 'my-collection' && (!currentUser || filteredImages.length === 0) ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center max-w-lg mx-auto">
                     <div className="bg-slate-900 p-8 rounded-full border border-slate-800 mb-6">
                        <Heart className="w-16 h-16 text-slate-700" />
                     </div>
                     <h3 className="text-xl font-bold text-white mb-3">
                        {!currentUser ? "Entra para veres a tua Coleção" : "A tua coleção ainda está vazia!"}
                     </h3>
                     <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                        {!currentUser 
                          ? "Regista o teu nome no botão 'Entrar' para poderes marcar as raspadinhas que já tens no teu álbum pessoal." 
                          : "Clica no botão 'Marcar' dentro de qualquer raspadinha do arquivo para a guardares aqui no teu álbum pessoal."}
                     </p>
                     {!currentUser ? (
                        <button onClick={() => setIsLoginModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-900/40 transition-all active:scale-95">
                           <LogIn className="w-5 h-5" /> Fazer Login / Entrar
                        </button>
                     ) : (
                        <button onClick={() => handleNavigate('home')} className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-bold transition-all border border-slate-700">
                           Explorar Arquivo
                        </button>
                     )}
                  </div>
              ) : (
                  <ImageGrid 
                    images={filteredImages} 
                    onImageClick={setSelectedImage} 
                    isAdmin={isAdmin} 
                    currentUser={currentUser} 
                    t={t.grid} 
                  />
              )}
            </div>
          )}
        </div>
      </main>

      {/* RODAPÉ FIXO (Fora do main scrollable) */}
      <Footer onNavigate={handleNavigate} onWebsitesClick={() => setIsWebsitesModalOpen(true)} />

      {isAdmin && (
        <button 
          onClick={() => setIsUploadModalOpen(true)}
          className="fixed bottom-20 right-8 w-16 h-16 bg-brand-600 hover:bg-brand-500 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-40 border-4 border-slate-950"
        >
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
      
      {isUploadModalOpen && <UploadModal onClose={() => setIsUploadModalOpen(false)} onUploadComplete={loadData} existingImages={[]} initialFile={null} currentUser={currentUser} t={t.upload} />}
      {isHistoryModalOpen && <HistoryModal onClose={() => setIsHistoryModalOpen(false)} isAdmin={isAdmin} t={t.header} />}
      {isWebsitesModalOpen && <WebsitesModal onClose={() => setIsWebsitesModalOpen(false)} isAdmin={isAdmin} t={t.header} />}
    </div>
  );
}

export default App;