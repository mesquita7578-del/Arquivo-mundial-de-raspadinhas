import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageGrid } from './components/ImageGrid';
import { UploadModal } from './components/UploadModal';
import { ImageViewer } from './components/ImageViewer';
import { LoginModal } from './components/LoginModal';
import { StatsSection } from './components/StatsSection';
import { WorldMap } from './components/WorldMap';
import { HistoryModal } from './components/HistoryModal'; // New Import
import { INITIAL_RASPADINHAS } from './constants';
import { ScratchcardData, Continent } from './types';
import { Globe, Clock, Map, LayoutGrid, List, UploadCloud, Database, Loader2, PlusCircle, Map as MapIcon, X, Gem } from 'lucide-react';
import { translations, Language } from './translations';
import { storageService } from './services/storage';

const AUTHORIZED_ADMINS = ["JORGE MESQUITA", "FABIO PAGNI", "CHLOE"];
const ADMIN_PASSWORD = "123456";
const PAGE_SIZE = 48; 

function App() {
  const [displayedImages, setDisplayedImages] = useState<ScratchcardData[]>([]);
  const [newArrivals, setNewArrivals] = useState<ScratchcardData[]>([]);
  const [totalStats, setTotalStats] = useState({ total: 0, stats: {} as Record<string, number> });
  
  const [mapData, setMapData] = useState<ScratchcardData[]>([]);
  
  const [isLoadingDB, setIsLoadingDB] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeContinent, setActiveContinent] = useState<Continent | 'Mundo'>('Mundo');
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false); 
  const [selectedImage, setSelectedImage] = useState<ScratchcardData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  
  const [showRarities, setShowRarities] = useState(false); // New state for Rarities view
  
  const [isDragging, setIsDragging] = useState(false);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  
  const [language, setLanguage] = useState<Language>('pt');
  const t = translations[language];

  // Load Initial Data (Stats + Recent)
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

  // Handle Search & Continent & Rarities Filters
  useEffect(() => {
    const performSearch = async () => {
      setIsLoadingMore(true);
      try {
        let results = await storageService.search(searchTerm, activeContinent);
        
        // Filter for Rarities if active
        if (showRarities) {
          results = results.filter(img => img.isRarity === true);
        }

        setDisplayedImages(results);
        
        // Map data should usually reflect the current search/view, or remain global?
        // Let's filter map data too if in rarities mode
        if (showRarities) {
           setMapData(results);
        } else {
           // If search term exists, filter map. If not, map might need all? 
           // Usually map syncs with grid for consistency
           setMapData(results);
        }

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
  }, [searchTerm, activeContinent, showRarities, isLoadingDB]);

  const handleLoadMore = async () => {
     // Placeholder
  };

  const handleCountrySelectFromMap = (countryName: string) => {
    setSearchTerm(countryName);
    setViewMode('grid');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const availableCountries = useMemo(() => {
    const countries = new Set<string>();
    mapData.forEach(img => countries.add(img.country));
    return Array.from(countries).sort();
  }, [mapData]);

  // Actions
  const handleUploadComplete = async (newImage: ScratchcardData) => {
    try {
      await storageService.save(newImage);
      // Refresh logic relies on useEffects mostly, but lets update local state for instant feel
      setDisplayedImages(prev => {
         if (showRarities && !newImage.isRarity) return prev;
         return [newImage, ...prev];
      });
      
      setNewArrivals(prev => [newImage, ...prev].slice(0, 10));
      setMapData(prev => [...prev, newImage]);
      setTotalStats(prev => ({
         total: prev.total + 1,
         stats: { ...prev.stats, [newImage.continent]: (prev.stats[newImage.continent] || 0) + 1 }
      }));
      setDroppedFile(null);
      setSelectedImage(newImage);
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  const handleUpdateImage = async (updatedImage: ScratchcardData) => {
    try {
      await storageService.save(updatedImage);
      setDisplayedImages(prev => prev.map(img => img.id === updatedImage.id ? updatedImage : img));
      setNewArrivals(prev => prev.map(img => img.id === updatedImage.id ? updatedImage : img));
      setMapData(prev => prev.map(img => img.id === updatedImage.id ? updatedImage : img));
      setSelectedImage(updatedImage);
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
      setTotalStats(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
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
  const showLoadMore = false; 

  if (isLoadingDB) {
    return (
      <div className="h-screen w-screen bg-gray-950 flex flex-col items-center justify-center text-white">
        <Database className="w-16 h-16 text-brand-600 animate-pulse mb-4" />
        <h2 className="text-2xl font-bold">Carregando Arquivo...</h2>
        <p className="text-gray-400 mt-2">A conectar base de dados segura.</p>
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col h-full bg-gray-950 text-gray-100 relative"
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
        onToggleRarities={() => setShowRarities(!showRarities)}
        showRarities={showRarities}
        onHistoryClick={() => setIsHistoryModalOpen(true)}
        language={language}
        setLanguage={setLanguage}
        t={t.header}
      />

      {isDragging && (
        <div className="absolute inset-0 z-50 bg-brand-600/90 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in border-8 border-brand-400 border-dashed m-4 rounded-3xl pointer-events-none">
           <div className="bg-white p-6 rounded-full shadow-2xl mb-6 animate-bounce">
             <UploadCloud className="w-16 h-16 text-brand-600" />
           </div>
           <h2 className="text-4xl font-bold text-white tracking-tight">{t.upload.clickDrag}</h2>
           <p className="text-brand-100 mt-2 text-lg">{t.upload.aiDesc}</p>
        </div>
      )}

      <main className="flex-1 overflow-y-auto relative scroll-smooth">
        <div className="fixed top-0 left-0 w-full h-96 bg-brand-900/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 z-0"></div>
        <div className="fixed bottom-0 right-0 w-full h-96 bg-purple-900/10 rounded-full blur-[120px] pointer-events-none translate-y-1/2 z-0"></div>

        <div className="max-w-7xl mx-auto py-8 relative z-10 space-y-12">

          {/* New Arrivals (Hidden if Rarities mode is active to focus on search/collection) */}
          {!showRarities && (
            <section className="px-6">
              <div className="flex items-center gap-2 mb-4 text-brand-400">
                <Clock className="w-5 h-5" />
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">{t.home.newArrivals}</h2>
              </div>
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 overflow-x-auto">
                 <div className="min-w-[800px]">
                   <ImageGrid 
                     images={newArrivals} 
                     onImageClick={setSelectedImage} 
                     hideFilters={true} 
                     isAdmin={isAdmin} 
                     t={t.grid}
                   />
                 </div>
              </div>
            </section>
          )}

          <section className="px-6 pb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-brand-400">
                {showRarities ? <Gem className="w-5 h-5 text-gold-500" /> : <Globe className="w-5 h-5" />}
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                   {showRarities ? t.header.rarities : t.home.explore}
                </h2>
              </div>
            </div>

            {/* Continent Filters (Hide in Rarities if you want a cleaner look, or keep them) */}
            <div className="flex flex-wrap gap-2 mb-6">
              {continents.map(c => {
                let count = 0;
                // Note: The count logic currently counts ALL items, not just rarities. 
                // Updating stats logic for rarity mode would require more work in getStats(), 
                // for now we keep general stats which is acceptable.
                if (c === 'Mundo') {
                   count = totalStats.total;
                } else {
                   count = totalStats.stats[c] || 0;
                }

                return (
                  <button
                    key={c}
                    onClick={() => setActiveContinent(c)}
                    className={`px-6 py-2 rounded-full text-sm font-bold transition-all border flex items-center gap-2 ${
                      activeContinent === c 
                        ? 'bg-brand-600 text-white border-brand-500 shadow-lg shadow-brand-900/50 scale-105' 
                        : 'bg-gray-900 text-gray-400 border-gray-800 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    {c}
                    <span className={`text-xs ml-1 py-0.5 px-1.5 rounded-full ${activeContinent === c ? 'bg-white/20 text-white' : 'bg-gray-800 text-gray-500'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {activeContinent !== 'Mundo' && viewMode !== 'map' && (
              <div className="mb-6 flex flex-wrap gap-2 items-center text-sm text-gray-500">
                <Map className="w-4 h-4 mr-2" />
                <span>{t.home.countriesIncluded}</span>
                {availableCountries.length > 0 ? availableCountries.map(country => (
                  <button
                    key={country}
                    onClick={() => setSearchTerm(country)}
                    className={`px-3 py-1 rounded border text-xs font-bold transition-colors ${
                      searchTerm === country
                        ? 'bg-brand-600 text-white border-brand-500'
                        : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 hover:text-white cursor-pointer'
                    }`}
                    title={`Filtrar por ${country}`}
                  >
                    {country}
                  </button>
                )) : <span className="italic">{t.home.noCountries}</span>}
                
                {searchTerm && availableCountries.includes(searchTerm) && (
                   <button 
                     onClick={() => setSearchTerm('')}
                     className="ml-2 p-1 rounded-full bg-gray-800 text-gray-500 hover:text-white hover:bg-red-900/50 transition-colors"
                     title="Limpar filtro"
                   >
                     <X className="w-3 h-3" />
                   </button>
                )}
              </div>
            )}

            <div className={`bg-gray-900/30 border rounded-2xl overflow-hidden min-h-[500px] ${showRarities ? 'border-gold-500/30 bg-gold-900/5' : 'border-gray-800/50'}`}>
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
                    isAdmin={isAdmin} 
                    t={t.grid}
                  />
                  
                  {showLoadMore && (
                    <div className="p-6 flex justify-center border-t border-gray-800/50">
                      <button 
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-full font-bold transition-all shadow-lg hover:shadow-brand-900/20 disabled:opacity-50"
                      >
                        {isLoadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                        {isLoadingMore ? "Carregando..." : "Carregar Mais Itens"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>

          {!showRarities && <StatsSection stats={totalStats.stats} totalRecords={totalStats.total} t={t.stats} />}

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