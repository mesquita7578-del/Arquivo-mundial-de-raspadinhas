import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageGrid } from './components/ImageGrid';
import { UploadModal } from './components/UploadModal';
import { ImageViewer } from './components/ImageViewer';
import { LoginModal } from './components/LoginModal';
import { StatsSection } from './components/StatsSection';
import { INITIAL_RASPADINHAS } from './constants';
import { ScratchcardData, Continent } from './types';
import { Globe, Clock, Map, LayoutGrid, List, UploadCloud, Database, Loader2 } from 'lucide-react';
import { translations, Language } from './translations';
import { storageService } from './services/storage';

const AUTHORIZED_ADMINS = ["JORGE MESQUITA", "FABIO PAGNI", "CHLOE"];
const ADMIN_PASSWORD = "123456";

function App() {
  const [images, setImages] = useState<ScratchcardData[]>([]);
  const [isLoadingDB, setIsLoadingDB] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ScratchcardData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeContinent, setActiveContinent] = useState<Continent | 'Mundo'>('Mundo');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [isDragging, setIsDragging] = useState(false);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  
  const [language, setLanguage] = useState<Language>('pt');
  const t = translations[language];

  // Initialize Database and Load Data
  useEffect(() => {
    const initData = async () => {
      setIsLoadingDB(true);
      try {
        await storageService.init();
        const savedItems = await storageService.getAll();
        
        if (savedItems.length > 0) {
          setImages(savedItems);
        } else {
          // Optional: Load initial mock data if DB is empty for demo purposes
          // In production for 20k items, you might want to start empty
          setImages(INITIAL_RASPADINHAS);
          // Save mocks to DB so they persist
          for (const item of INITIAL_RASPADINHAS) {
             await storageService.save(item);
          }
        }
      } catch (error) {
        console.error("Falha crítica ao carregar base de dados:", error);
        alert("Erro ao carregar o arquivo. Por favor recarregue a página.");
      } finally {
        setIsLoadingDB(false);
      }
    };

    initData();
  }, []);

  // Filter images
  const filteredImages = useMemo(() => {
    let result = images;

    if (activeContinent !== 'Mundo') {
      result = result.filter(img => img.continent === activeContinent);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(img => 
        img.gameName.toLowerCase().includes(term) ||
        img.customId.toLowerCase().includes(term) ||
        img.gameNumber.toLowerCase().includes(term) ||
        img.state.toLowerCase().includes(term) ||
        img.country.toLowerCase().includes(term)
      );
    }
    
    return result;
  }, [images, searchTerm, activeContinent]);

  const newArrivals = useMemo(() => {
    return [...images].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
  }, [images]);

  const availableCountries = useMemo(() => {
    const countries = new Set<string>();
    filteredImages.forEach(img => countries.add(img.country));
    return Array.from(countries).sort();
  }, [filteredImages]);

  // Handlers now interact with StorageService

  const handleUploadComplete = async (newImage: ScratchcardData) => {
    try {
      // 1. Save to DB first
      await storageService.save(newImage);
      // 2. Then update UI
      setImages(prev => [newImage, ...prev]);
      setDroppedFile(null);
      
      // 3. Open Viewer immediately for editing (as requested by user)
      setSelectedImage(newImage);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao gravar na base de dados. Verifique o espaço em disco.");
    }
  };

  const handleUpdateImage = async (updatedImage: ScratchcardData) => {
    try {
      await storageService.save(updatedImage);
      setImages(prev => prev.map(img => img.id === updatedImage.id ? updatedImage : img));
      setSelectedImage(updatedImage);
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      alert("Erro ao atualizar registo.");
    }
  };

  const handleDeleteImage = async (id: string) => {
    try {
      await storageService.delete(id);
      setImages(prev => prev.filter(img => img.id !== id));
      setSelectedImage(null);
    } catch (error) {
      console.error("Erro ao apagar:", error);
      alert("Erro ao apagar registo.");
    }
  };

  const handleAdminToggle = () => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
  };

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
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.relatedTarget || (e.relatedTarget as HTMLElement).nodeName === 'HTML') {
       setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

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
      <div className="h-screen w-screen bg-gray-950 flex flex-col items-center justify-center text-white">
        <Database className="w-16 h-16 text-brand-600 animate-pulse mb-4" />
        <h2 className="text-2xl font-bold">Carregando Arquivo...</h2>
        <p className="text-gray-400 mt-2">A preparar base de dados segura.</p>
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
              
              <div className="bg-gray-900 p-1 rounded-lg border border-gray-800 flex items-center">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                  title={t.grid.viewGrid}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                  title={t.grid.viewList}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {continents.map(c => (
                <button
                  key={c}
                  onClick={() => setActiveContinent(c)}
                  className={`px-6 py-2 rounded-full text-sm font-bold transition-all border ${
                    activeContinent === c 
                      ? 'bg-brand-600 text-white border-brand-500 shadow-lg shadow-brand-900/50 scale-105' 
                      : 'bg-gray-900 text-gray-400 border-gray-800 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {activeContinent !== 'Mundo' && (
              <div className="mb-6 flex flex-wrap gap-2 items-center text-sm text-gray-500">
                <Map className="w-4 h-4 mr-2" />
                <span>{t.home.countriesIncluded}</span>
                {availableCountries.length > 0 ? availableCountries.map(country => (
                  <span key={country} className="px-3 py-1 bg-gray-800 text-gray-300 rounded border border-gray-700">
                    {country}
                  </span>
                )) : <span className="italic">{t.home.noCountries}</span>}
              </div>
            )}

            <div className="bg-gray-900/30 border border-gray-800/50 rounded-2xl overflow-hidden min-h-[500px]">
              <ImageGrid 
                images={filteredImages} 
                onImageClick={setSelectedImage} 
                viewMode={viewMode}
                isAdmin={isAdmin}
                t={t.grid}
              />
            </div>
          </section>

          <StatsSection images={images} t={t.stats} />

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
          existingImages={images}
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