import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageGrid } from './components/ImageGrid';
import { UploadModal } from './components/UploadModal';
import { ImageViewer } from './components/ImageViewer';
import { LoginModal } from './components/LoginModal';
import { INITIAL_RASPADINHAS } from './constants';
import { ScratchcardData, Continent } from './types';
import { Globe, Clock, Map, LayoutGrid, List } from 'lucide-react';
import { translations, Language } from './translations';

// Lista de administradores autorizados (Case insensitive na verificação)
const AUTHORIZED_ADMINS = ["JORGE MESQUITA", "FABIO PAGNI"];
// Senha padrão para demonstração
const ADMIN_PASSWORD = "123456";

function App() {
  // Initialize state from LocalStorage if available, otherwise use mock data
  const [images, setImages] = useState<ScratchcardData[]>(() => {
    try {
      const savedData = localStorage.getItem('raspadinhas-archive-v1');
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (error) {
      console.error("Erro ao carregar do armazenamento local:", error);
    }
    return INITIAL_RASPADINHAS;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ScratchcardData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeContinent, setActiveContinent] = useState<Continent | 'Mundo'>('Mundo');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Language State
  const [language, setLanguage] = useState<Language>('pt');
  const t = translations[language];

  // Save to LocalStorage whenever images change
  useEffect(() => {
    try {
      localStorage.setItem('raspadinhas-archive-v1', JSON.stringify(images));
    } catch (error) {
      console.error("Erro ao salvar no armazenamento local (provavelmente limite excedido):", error);
      alert("Aviso: Limite de armazenamento local atingido. Algumas imagens podem não ser salvas permanentemente.");
    }
  }, [images]);

  // Filter images based on search term and continent
  const filteredImages = useMemo(() => {
    let result = images;

    // Filter by Continent
    if (activeContinent !== 'Mundo') {
      result = result.filter(img => img.continent === activeContinent);
    }

    // Filter by Search Term
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

  // Get New Arrivals (Top 5 most recent by createdAt)
  const newArrivals = useMemo(() => {
    return [...images].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
  }, [images]);

  // Get available countries for the active continent
  const availableCountries = useMemo(() => {
    const countries = new Set<string>();
    filteredImages.forEach(img => countries.add(img.country));
    return Array.from(countries).sort();
  }, [filteredImages]);

  const handleUploadComplete = (newImage: ScratchcardData) => {
    setImages(prev => [newImage, ...prev]);
  };

  const handleUpdateImage = (updatedImage: ScratchcardData) => {
    setImages(prev => prev.map(img => img.id === updatedImage.id ? updatedImage : img));
    setSelectedImage(updatedImage);
  };

  const handleDeleteImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    setSelectedImage(null);
  };

  const handleAdminToggle = () => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
    }
  };

  const handleLogout = () => {
    // Immediate logout without confirmation to prevent issues
    setIsAdmin(false);
  };

  const handleLoginSubmit = (username: string, pass: string): boolean => {
    const cleanName = username.trim().toUpperCase();
    
    // Verifica se é um dos admins autorizados E se a senha está correta
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
    setIsUploadModalOpen(true);
  };

  const continents: (Continent | 'Mundo')[] = ['Mundo', 'Europa', 'América', 'Ásia', 'África', 'Oceania'];

  return (
    <div className="flex flex-col h-full bg-gray-950 text-gray-100">
      <Header 
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        onUploadClick={handleUploadClick}
        isAdmin={isAdmin}
        onAdminToggle={handleAdminToggle}
        onLogout={handleLogout}
        language={language}
        setLanguage={setLanguage}
        t={t.header}
      />

      <main className="flex-1 overflow-y-auto relative scroll-smooth">
        
        {/* Background Gradients */}
        <div className="fixed top-0 left-0 w-full h-96 bg-brand-900/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 z-0"></div>
        <div className="fixed bottom-0 right-0 w-full h-96 bg-purple-900/10 rounded-full blur-[120px] pointer-events-none translate-y-1/2 z-0"></div>

        <div className="max-w-7xl mx-auto py-8 relative z-10 space-y-12">

          {/* New Arrivals Section */}
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

          {/* Continents Section */}
          <section className="px-6 pb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-brand-400">
                <Globe className="w-5 h-5" />
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">{t.home.explore}</h2>
              </div>
              
              {/* View Mode Toggles */}
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

            {/* Continent Tabs */}
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

            {/* Available Countries Badges */}
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

            {/* Main Grid for Filtered Result */}
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

        </div>
      </main>

      {/* Modals */}
      {isLoginModalOpen && (
        <LoginModal 
          onClose={() => setIsLoginModalOpen(false)}
          onLogin={handleLoginSubmit}
          t={t.login}
        />
      )}

      {isUploadModalOpen && (
        <UploadModal 
          onClose={() => setIsUploadModalOpen(false)}
          onUploadComplete={handleUploadComplete}
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