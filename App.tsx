import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageGrid } from './components/ImageGrid';
import { UploadModal } from './components/UploadModal';
import { ImageViewer } from './components/ImageViewer';
import { LoginModal } from './components/LoginModal';
import { StatsSection } from './components/StatsSection';
import { WorldMap } from './components/WorldMap';
import { INITIAL_RASPADINHAS } from './constants';
import { ScratchcardData, Continent } from './types';
import { Globe, Clock, Map, LayoutGrid, List, UploadCloud, Database, Loader2, PlusCircle, Map as MapIcon, X } from 'lucide-react';
import { translations, Language } from './translations';
import { storageService } from './services/storage';

const AUTHORIZED_ADMINS = ["JORGE MESQUITA", "FABIO PAGNI", "CHLOE"];
const ADMIN_PASSWORD = "123456";
const PAGE_SIZE = 48; // Items per database fetch (sync with UI page if desired, or larger)

function App() {
  const [displayedImages, setDisplayedImages] = useState<ScratchcardData[]>([]);
  const [newArrivals, setNewArrivals] = useState<ScratchcardData[]>([]);
  const [totalStats, setTotalStats] = useState({ total: 0, stats: {} as Record<string, number> });
  
  // We need a separate state for "All Images" for the map visualization because the map needs
  // to show the global distribution, not just the paginated current page.
  const [mapData, setMapData] = useState<ScratchcardData[]>([]);
  
  const [isLoadingDB, setIsLoadingDB] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeContinent, setActiveContinent] = useState<Continent | 'Mundo'>('Mundo');
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ScratchcardData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  
  const [isDragging, setIsDragging] = useState(false);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  
  const [language, setLanguage] = useState<Language>('pt');
  const t = translations[language];

  // Load Initial Data (Stats + Recent)
  const loadInitialData = async () => {
    setIsLoadingDB(true);
    try {
      await storageService.init();
      
      // Check if empty and seed
      const stats = await storageService.getStats();
      if (stats.total === 0) {
        for (const item of INITIAL_RASPADINHAS) {
          await storageService.save(item);
        }
      }

      // Fetch Stats
      const freshStats = await storageService.getStats();
      setTotalStats(freshStats);

      // Fetch New Arrivals (Top 10) - Increased to show 2 rows
      const recent10 = await storageService.getRecent(10);
      setNewArrivals(recent10);

      // Fetch Main Grid - NOW BY NUMBER (Ascending) using search
      // We perform an empty search to get all items sorted by number
      const sortedAll = await storageService.search('', 'Mundo');
      setDisplayedImages(sortedAll);

      // For Map: Fetch all items
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

  // Handle Search & Continent Filters
  useEffect(() => {
    const performSearch = async () => {
      setIsLoadingMore(true);
      try {
        // Perform DB Search (which now sorts by number)
        const results = await storageService.search(searchTerm, activeContinent);
        setDisplayedImages(results);
        setMapData(results); // Map reflects search results
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingMore(false);
      }
    };
    
    // Debounce slightly to avoid hitting DB too hard while typing
    const timeoutId = setTimeout(() => {
      if (!isLoadingDB) performSearch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, activeContinent, isLoadingDB]);

  // Load More Handler (Infinite Scroll logic)
  const handleLoadMore = async () => {
     // Simplified: Since we are using client-side sorting via the `search` method that fetches a large batch,
     // we don't need complex pagination logic here for this version.
  };

  const handleCountrySelectFromMap = (countryName: string) => {
    // When clicking map, we filter by that country
    setSearchTerm(countryName);
    setViewMode('grid'); // Switch back to grid to show results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const availableCountries = useMemo(() => {
    const countries = new Set<string>();
    // Use mapData (all available or filtered) to calculate available countries list
    mapData.forEach(img => countries.add(img.country));
    return Array.from(countries).sort();
  }, [mapData]);

  // Actions
  const handleUploadComplete = async (newImage: ScratchcardData) => {
    try {
      await storageService.save(newImage);
      // Update UI - Add to displayed images and re-sort? 
      // For simplicity, just prepend to displayed for immediate feedback, 
      // even if it breaks sort momentarily until refresh.
      setDisplayedImages(prev => [newImage, ...prev]);
      
      // Update New Arrivals (Keep top 10)
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
      
      // Update stats count roughly
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

  // Generate and Download CSV (Excel style)
  const handleDownloadList = async () => {
    try {
      // 1. Fetch ALL items
      const allItems = await storageService.getAll();

      // 2. Sort by Continent -> Country -> Category -> Game Number/Name
      const sortedItems = allItems.sort((a, b) => {
        // Sort by Continent
        const contCompare = a.continent.localeCompare(b.continent);
        if (contCompare !== 0) return contCompare;

        // Sort by Country
        const countryCompare = a.country.localeCompare(b.country);
        if (countryCompare !== 0) return countryCompare;

        // Sort by Category (Raspadinha before Lotaria)
        const catA = a.category || '';
        const catB = b.category || '';
        const catCompare = catA.localeCompare(catB);
        if (catCompare !== 0) return catCompare;

        // Sort by Game Number (Numeric if possible)
        const numA = parseInt(a.gameNumber.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.gameNumber.replace(/\D/g, '')) || 0;
        if (numA !== numB) return numA - numB;

        return a.gameName.localeCompare(b.gameName);
      });

      // 3. Define Headers (Including Continent now)
      const headers = [
        "Continente / Continent",
        "País / Country",
        "Categoria / Type",
        "Nome do Jogo / Game Name",
        "Número / No.",
        "Ano / Year",
        "Estado / State",
        "Preço / Price",
        "Tamanho / Size",
        "Emissão / Emission",
        "Gráfica / Printer",
        "Colecionador / Collector",
        "Link Imagem / Image Link", // New: URL to image for verification
        "Notas / Notes",
        "Correções (Para Preencher) / Corrections" // New: Empty column for manual notes
      ];

      // 4. Create CSV Rows (using semicolon ';' for better Excel compatibility in Europe)
      const escapeCsv = (field: string | undefined) => {
        if (!field) return "";
        const stringField = String(field);
        if (stringField.includes(";") || stringField.includes("\n") || stringField.includes('"')) {
           return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
      };

      const rows = sortedItems.map(item => [
        escapeCsv(item.continent),
        escapeCsv(item.country),
        escapeCsv(item.category),
        escapeCsv(item.gameName),
        escapeCsv(item.gameNumber),
        escapeCsv(item.releaseDate),
        escapeCsv(item.state),
        escapeCsv(item.price),
        escapeCsv(item.size),
        escapeCsv(item.emission),
        escapeCsv(item.printer),
        escapeCsv(item.collector),
        escapeCsv(item.frontUrl), // Image URL
        escapeCsv(item.values),
        "" // Empty column for granddaughter's corrections
      ].join(";"));

      // 5. Combine with BOM for UTF-8 support in Excel
      const csvContent = "\uFEFF" + headers.join(";") + "\n" + rows.join("\n");
      
      // 6. Download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Arquivo-Mundial-Lista-Completa-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error("Erro ao gerar lista:", error);
      alert("Erro ao criar a lista para download.");
    }
  };

  // Drag & Drop
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
  const showLoadMore = false; // Disabled load more as we are now loading full sorted lists

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
        onDownloadList={handleDownloadList}
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

          <section className="px-6 pb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-brand-400">
                <Globe className="w-5 h-5" />
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">{t.home.explore}</h2>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {continents.map(c => {
                // Calculate count for this continent
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
                
                {/* Clear filter button if a country is selected via search */}
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

            <div className="bg-gray-900/30 border border-gray-800/50 rounded-2xl overflow-hidden min-h-[500px]">
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
                  
                  {/* Load More Trigger */}
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

          <StatsSection stats={totalStats.stats} totalRecords={totalStats.total} t={t.stats} />

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