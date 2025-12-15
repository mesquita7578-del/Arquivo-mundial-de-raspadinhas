import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageGrid } from './components/ImageGrid';
import { UploadModal } from './components/UploadModal';
import { ImageViewer } from './components/ImageViewer';
import { LoginModal } from './components/LoginModal';
import { StatsSection } from './components/StatsSection';
import { WorldMap } from './components/WorldMap';
import { HistoryModal } from './components/HistoryModal'; 
import { WebsitesModal } from './components/WebsitesModal';
import { INITIAL_RASPADINHAS } from './constants';
import { ScratchcardData, Continent, Category } from './types';
import { Globe, Clock, Map, LayoutGrid, List, UploadCloud, Database, Loader2, PlusCircle, Map as MapIcon, X, Gem, Ticket, Coins, Gift, Building2 } from 'lucide-react';
import { translations, Language } from './translations';
import { storageService } from './services/storage';

const AUTHORIZED_ADMINS = ["JORGE MESQUITA", "FABIO PAGNI", "CHLOE"];
const ADMIN_PASSWORD = "123456";

function App() {
  const [displayedImages, setDisplayedImages] = useState<ScratchcardData[]>([]);
  const [newArrivals, setNewArrivals] = useState<ScratchcardData[]>([]);
  const [totalStats, setTotalStats] = useState({ 
    total: 0, 
    stats: {} as Record<string, number>,
    categoryStats: { scratch: 0, lottery: 0 } 
  });
  
  const [mapData, setMapData] = useState<ScratchcardData[]>([]);
  
  const [isLoadingDB, setIsLoadingDB] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeContinent, setActiveContinent] = useState<Continent | 'Mundo'>('Mundo');
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false); 
  const [isWebsitesModalOpen, setIsWebsitesModalOpen] = useState(false); // New Modal
  const [selectedImage, setSelectedImage] = useState<ScratchcardData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  
  // Filter States (Lifted)
  const [showRarities, setShowRarities] = useState(false);
  const [showPromotional, setShowPromotional] = useState(false); // New Filter
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  
  const [isDragging, setIsDragging] = useState(false);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  
  const [language, setLanguage] = useState<Language>('pt');
  const t = translations[language];

  const loadInitialData = async () => {
    setIsLoadingDB(true);
    try {
      await storageService.init();
      
      const stats = await storageService.getStats();
      if (stats.total === 0) {
        for (const item of INITIAL_RASPADINHAS) {
          await storageService.save(item);
        }
      }

      const freshStats = await storageService.getStats();
      setTotalStats(freshStats);

      const recent10 = await storageService.getRecent(10);
      setNewArrivals(recent10);

      const sortedAll = await storageService.search('', 'Mundo');
      setDisplayedImages(sortedAll);

      const allItems = await storageService.getAll();
      setMapData(allItems);

    } catch (error) {
      console.error("Falha ao carregar:", error);
      alert("Erro ao carregar o arquivo.");
    } finally {
      setIsLoadingDB(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      setIsLoadingMore(true);
      try {
        let results = await storageService.search(searchTerm, activeContinent);
        
        // 1. Filter by Category Global (Syncs Map and Grid)
        if (activeCategory !== 'all') {
           results = results.filter(img => (img.category || 'raspadinha') === activeCategory);
        }

        // 2. Filter by Rarity
        if (showRarities) {
          results = results.filter(img => img.isRarity === true);
        }
        
        // 3. Filter by Promotional
        if (showPromotional) {
          results = results.filter(img => img.isPromotional === true);
        }

        setDisplayedImages(results);
        
        // MapData always reflects the current filtered view
        setMapData(results);

      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingMore(false);
      }
    };
    
    const timeoutId = setTimeout(() => {
      if (!isLoadingDB) performSearch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, activeContinent, showRarities, showPromotional, activeCategory, isLoadingDB]); // Added activeCategory to dependencies

  // Handle toggling mutually exclusive filters (Optional behavior, but better UX)
  const toggleRarities = () => {
    if (!showRarities) setShowPromotional(false);
    setShowRarities(!showRarities);
  };

  const togglePromotional = () => {
    if (!showPromotional) setShowRarities(false);
    setShowPromotional(!showPromotional);
  };

  const handleCountrySelectFromMap = (countryName: string) => {
    setSearchTerm(countryName);
    setViewMode('grid');
    // Scroll to grid on mobile
    const grid = document.getElementById('image-grid-section');
    if (grid) grid.scrollIntoView({ behavior: 'smooth' });
  };

  const availableCountries = useMemo(() => {
    const countries = new Set<string>();
    mapData.forEach(img => countries.add(img.country));
    return Array.from(countries).sort();
  }, [mapData]);

  const handleUploadComplete = async (newImage: ScratchcardData) => {
    try {
      await storageService.save(newImage);
      setDisplayedImages(prev => {
         // Apply current view filters to the new image immediately
         if (activeCategory !== 'all' && newImage.category !== activeCategory) return prev;
         if (showRarities && !newImage.isRarity) return prev;
         if (showPromotional && !newImage.isPromotional) return prev;
         return [newImage, ...prev];
      });
      
      setNewArrivals(prev => [newImage, ...prev].slice(0, 10));
      setMapData(prev => {
          if (activeCategory !== 'all' && newImage.category !== activeCategory) return prev;
          return [...prev, newImage];
      });
      
      // Update local stats immediately
      setTotalStats(prev => {
         const newStats = { ...prev.stats, [newImage.continent]: (prev.stats[newImage.continent] || 0) + 1 };
         const newCatStats = { ...prev.categoryStats };
         if (newImage.category === 'lotaria') newCatStats.lottery++;
         else newCatStats.scratch++;
         
         return {
           total: prev.total + 1,
           stats: newStats,
           categoryStats: newCatStats
         };
      });

      setDroppedFile(null);
      setSelectedImage(newImage);
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  const handleUpdateImage = async (updatedImage: ScratchcardData) => {
    try {
      await storageService.save(updatedImage);
      // We trigger a re-search to ensure filters are respected if the user changed the category/rarity of the item
      const results = await storageService.search(searchTerm, activeContinent);
      // Apply filters manually or just trigger the effect (simplest is manually updating state here or rely on the effect if we change a dep, but we aren't changing deps here)
      // For simplicity, update arrays locally:
      setDisplayedImages(prev => prev.map(img => img.id === updatedImage.id ? updatedImage : img));
      setNewArrivals(prev => prev.map(img => img.id === updatedImage.id ? updatedImage : img));
      setMapData(prev => prev.map(img => img.id === updatedImage.id ? updatedImage : img));
      
      setSelectedImage(updatedImage);
      const freshStats = await storageService.getStats();
      setTotalStats(freshStats);
    } catch (error) {
      console.error("Erro ao atualizar:", error);
    }
  };

  const handleDeleteImage = async (id: string) => {
    try {
      await storageService.delete(id);
      setDisplayedImages(prev => prev.filter(img => img.id !== id));
      setNewArrivals(prev => prev.filter(img => img.id !== id));
      setMapData(prev => prev.filter(img => img.id !== id));
      setSelectedImage(null);
      
      const freshStats = await storageService.getStats();
      setTotalStats(freshStats);
    } catch (error) {
      console.error("Erro ao apagar:", error);
    }
  };

  const handleAdminToggle = () => {
    if (!isAdmin) setIsLoginModalOpen(true);
  };

  const handleLogout = () => setIsAdmin(false);

  const handleLoginSubmit = (username: string, pass: string): boolean => {
    const cleanName = username.trim().toUpperCase();
    if (AUTHORIZED_ADMINS.includes(cleanName) && pass === ADMIN_PASSWORD) {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const handleUploadClick = () => {
    if (!isAdmin) {
      alert(t.home.restrictedAccess);
      return;
    }
    setDroppedFile(null);
    setIsUploadModalOpen(true);
  };

  const handleExportData = async () => {
    try {
      const jsonString = await storageService.exportData();
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `raspadinhas-arquivo-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erro ao exportar:", error);
      alert("Erro ao gerar backup.");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!e.relatedTarget || (e.relatedTarget as HTMLElement).nodeName === 'HTML') setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.type.startsWith('image/')) {
        alert(t.upload.errorImage);
        return;
      }
      if (!isAdmin) {
        alert(t.home.restrictedAccess);
        return;
      }
      setDroppedFile(file);
      setIsUploadModalOpen(true);
    }
  };

  const continents: (Continent | 'Mundo')[] = ['Mundo', 'Europa', 'América', 'Ásia', 'África', 'Oceania'];

  if (isLoadingDB) {
    return (
      <div className="h-[100dvh] w-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Database className="w-16 h-16 text-brand-500 animate-pulse mb-4" />
        <h2 className="text-2xl font-bold">Carregando Arquivo...</h2>
        <p className="text-slate-400 mt-2">A conectar base de dados segura.</p>
      </div>
    );
  }

  return (
    // Mobile Fix: Use h-[100dvh] instead of h-screen to handle mobile browser bars correctly
    <div 
      className="flex flex-col h-[100dvh] bg-slate-950 text-slate-100 relative overflow-hidden transition-colors duration-500"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Header 
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        onUploadClick={handleUploadClick}
        isAdmin={isAdmin}
        onAdminToggle={handleAdminToggle}
        onLogout={handleLogout}
        onExport={handleExportData}
        onHistoryClick={() => setIsHistoryModalOpen(true)}
        language={language}
        setLanguage={setLanguage}
        t={t.header}
      />

      {/* STICKY FILTER BAR (Categories + Rarities) - Visible below header */}
      <div className="sticky top-[60px] z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-md">
         <div className="max-w-7xl mx-auto px-4 md:px-6 py-2 flex flex-nowrap items-center gap-2 md:gap-4 overflow-x-auto scrollbar-hide">
             
             {/* Rarities Toggle */}
             <button
              onClick={toggleRarities}
              className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
                 showRarities 
                   ? "bg-gold-500 text-white border-gold-400 shadow-lg shadow-gold-500/20" 
                   : "bg-slate-800 text-slate-400 border-slate-700 hover:border-gold-500/50 hover:text-gold-400"
              }`}
            >
              <Gem className="w-3.5 h-3.5" />
              {t.header.rarities}
            </button>

            {/* Promotional Toggle (New) */}
            <button
              onClick={togglePromotional}
              className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
                 showPromotional 
                   ? "bg-pink-500 text-white border-pink-400 shadow-lg shadow-pink-500/20" 
                   : "bg-slate-800 text-slate-400 border-slate-700 hover:border-pink-500/50 hover:text-pink-400"
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              {t.header.promos}
            </button>

            {/* Websites Modal Trigger (New) */}
            <button
              onClick={() => setIsWebsitesModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap bg-slate-800 text-slate-400 border-slate-700 hover:border-blue-500/50 hover:text-blue-400"
            >
              <Building2 className="w-3.5 h-3.5" />
              {t.header.websites}
            </button>

            <div className="w-px h-6 bg-slate-700 mx-1 shrink-0"></div>

             {/* Category Toggles */}
             <button
               onClick={() => setActiveCategory('all')}
               className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${activeCategory === 'all' ? 'bg-slate-700 text-white border-slate-600' : 'text-slate-500 border-transparent hover:text-white hover:bg-slate-800'}`}
             >
               {t.grid.allTypes}
             </button>
             <button
               onClick={() => setActiveCategory('raspadinha')}
               className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs font-bold transition-all border flex items-center gap-2 whitespace-nowrap ${activeCategory === 'raspadinha' ? 'bg-brand-600 text-white border-brand-500' : 'text-slate-500 border-transparent hover:text-white hover:bg-slate-800'}`}
             >
               <Coins className="w-3.5 h-3.5" />
               {t.grid.scratchcard}
             </button>
             <button
               onClick={() => setActiveCategory('lotaria')}
               className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs font-bold transition-all border flex items-center gap-2 whitespace-nowrap ${activeCategory === 'lotaria' ? 'bg-purple-600 text-white border-purple-500' : 'text-slate-500 border-transparent hover:text-white hover:bg-slate-800'}`}
             >
               <Ticket className="w-3.5 h-3.5" />
               {t.grid.lottery}
             </button>
         </div>
      </div>

      {isDragging && (
        <div className="absolute inset-0 z-50 bg-brand-600/90 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in border-8 border-brand-400 border-dashed m-4 rounded-3xl pointer-events-none">
           <div className="bg-white p-6 rounded-full shadow-2xl mb-6 animate-bounce">
             <UploadCloud className="w-16 h-16 text-brand-600" />
           </div>
           <h2 className="text-4xl font-bold text-white tracking-tight">{t.upload.clickDrag}</h2>
           <p className="text-brand-100 mt-2 text-lg">{t.upload.aiDesc}</p>
        </div>
      )}

      <main className="flex-1 overflow-y-auto relative scroll-smooth w-full">
        {/* VIBRANT BACKGROUND BLOBS */}
        <div className="fixed top-0 left-0 w-full h-96 bg-brand-600/20 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 z-0"></div>
        <div className="fixed bottom-0 right-0 w-full h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none translate-y-1/2 z-0"></div>

        <div className="max-w-7xl mx-auto py-6 md:py-8 relative z-10 space-y-8 md:space-y-12">

          {/* New Arrivals (Hidden in Rarities or Promos mode) */}
          {!showRarities && !showPromotional && (
            <section className="px-4 md:px-6">
              <div className="flex items-center gap-2 mb-4 text-brand-400">
                <Clock className="w-5 h-5" />
                <h2 className="text-lg md:text-xl font-bold text-white uppercase tracking-wider">{t.home.newArrivals}</h2>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 md:p-6 overflow-x-auto scrollbar-hide backdrop-blur-sm">
                 <div className="min-w-[800px]">
                   <ImageGrid 
                     images={newArrivals} 
                     onImageClick={setSelectedImage} 
                     hideFilters={true} 
                     isAdmin={isAdmin} 
                     activeCategory={activeCategory} // Pass active Category
                     t={t.grid}
                   />
                 </div>
              </div>
            </section>
          )}

          <section id="image-grid-section" className="px-4 md:px-6 pb-20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-brand-400">
                {showRarities ? (
                   <Gem className="w-5 h-5 text-gold-500" />
                ) : showPromotional ? (
                   <Gift className="w-5 h-5 text-pink-500" />
                ) : (
                   <Globe className="w-5 h-5" />
                )}
                
                <h2 className="text-lg md:text-xl font-bold text-white uppercase tracking-wider">
                   {showRarities 
                     ? t.header.rarities 
                     : showPromotional 
                       ? t.header.promos
                       : t.home.explore
                   }
                </h2>
              </div>
            </div>

            {/* Continent Filters - Scrollable on Mobile */}
            <div className="flex overflow-x-auto pb-2 gap-2 mb-4 scrollbar-hide">
              {continents.map(c => {
                let count = 0;
                if (c === 'Mundo') {
                   count = totalStats.total;
                } else {
                   count = totalStats.stats[c] || 0;
                }

                return (
                  <button
                    key={c}
                    onClick={() => setActiveContinent(c)}
                    className={`px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-bold transition-all border flex items-center gap-2 whitespace-nowrap ${
                      activeContinent === c 
                        ? 'bg-brand-600 text-white border-brand-500 shadow-lg shadow-brand-900/50 scale-105' 
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {c}
                    <span className={`text-[10px] ml-1 py-0.5 px-1.5 rounded-full ${activeContinent === c ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-500'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {activeContinent !== 'Mundo' && viewMode !== 'map' && (
              <div className="mb-6 flex flex-wrap gap-2 items-center text-sm text-slate-500">
                <Map className="w-4 h-4 mr-2" />
                <span>{t.home.countriesIncluded}</span>
                {availableCountries.length > 0 ? availableCountries.map(country => (
                  <button
                    key={country}
                    onClick={() => setSearchTerm(country)}
                    className={`px-3 py-1 rounded border text-xs font-bold transition-colors ${
                      searchTerm === country
                        ? 'bg-brand-600 text-white border-brand-500'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white cursor-pointer'
                    }`}
                  >
                    {country}
                  </button>
                )) : <span className="italic">{t.home.noCountries}</span>}
                
                {searchTerm && availableCountries.includes(searchTerm) && (
                   <button 
                     onClick={() => setSearchTerm('')}
                     className="ml-2 p-1 rounded-full bg-slate-800 text-slate-500 hover:text-white hover:bg-red-900/50 transition-colors"
                   >
                     <X className="w-3 h-3" />
                   </button>
                )}
              </div>
            )}

            <div className={`bg-slate-900/30 border rounded-2xl overflow-hidden min-h-[500px] backdrop-blur-sm ${showRarities ? 'border-gold-500/30 bg-gold-900/5' : showPromotional ? 'border-pink-500/30 bg-pink-900/5' : 'border-slate-800/50'}`}>
              {viewMode === 'map' ? (
                <div className="p-4 h-[600px]">
                   <WorldMap 
                     images={mapData} 
                     onCountrySelect={handleCountrySelectFromMap}
                     t={t} 
                    />
                </div>
              ) : (
                <>
                  <ImageGrid 
                    images={displayedImages} 
                    onImageClick={setSelectedImage} 
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    isAdmin={isAdmin} 
                    activeCategory={activeCategory} // Pass active Category
                    t={t.grid}
                  />
                </>
              )}
            </div>
          </section>

          {!showRarities && !showPromotional && <StatsSection stats={totalStats.stats} categoryStats={totalStats.categoryStats} totalRecords={totalStats.total} t={t.stats} />}

        </div>
      </main>

      {isLoginModalOpen && (
        <LoginModal 
          onClose={() => setIsLoginModalOpen(false)}
          onLogin={handleLoginSubmit}
          t={t.login}
        />
      )}

      {isUploadModalOpen && (
        <UploadModal 
          onClose={() => {
            setIsUploadModalOpen(false);
            setDroppedFile(null);
          }}
          onUploadComplete={handleUploadComplete}
          existingImages={displayedImages}
          initialFile={droppedFile}
          t={t.upload}
        />
      )}

      {isHistoryModalOpen && (
        <HistoryModal 
          onClose={() => setIsHistoryModalOpen(false)}
          t={t.history}
          isAdmin={isAdmin}
        />
      )}

      {isWebsitesModalOpen && (
        <WebsitesModal 
          onClose={() => setIsWebsitesModalOpen(false)}
          isAdmin={isAdmin}
          t={t.websites}
        />
      )}

      {selectedImage && (
        <ImageViewer 
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
          onUpdate={handleUpdateImage}
          onDelete={handleDeleteImage}
          isAdmin={isAdmin}
          t={t.viewer}
        />
      )}
    </div>
  );
}

export default App;