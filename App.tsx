
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Loader2, Sparkles, Zap } from 'lucide-react';
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
import { Footer } from './components/Footer';
import { storageService } from './services/storage';
import { ScratchcardData, CategoryItem, SiteMetadata, Continent } from './types';
import { translations, Language } from './translations';
import { DivineSignal, Signal } from './components/DivineSignal';

const App: React.FC = () => {
  // Estados de Dados
  const [images, setImages] = useState<ScratchcardData[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [siteMetadata, setSiteMetadata] = useState<SiteMetadata | null>(null);
  
  // Estados de Navegação
  const [currentPage, setCurrentPage] = useState<'home' | 'stats' | 'map' | 'about' | 'new-arrivals'>('home');
  const [language, setLanguage] = useState<Language>('pt');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeContinent, setActiveContinent] = useState<Continent | 'Mundo'>('Mundo');
  const [activeCountry, setActiveCountry] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Modais
  const [selectedImage, setSelectedImage] = useState<ScratchcardData | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showWebsites, setShowWebsites] = useState(false);
  const [showRadio, setShowRadio] = useState(false);
  
  // Admin e Sinais
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
        setSiteMetadata(meta || null);
      } catch (err) {
        console.error("Erro no carregamento do Arquivo:", err);
      } finally {
        setTimeout(() => setIsLoading(false), 800);
      }
    };
    init();
  }, []);

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
  };

  const filteredImages = useMemo(() => {
    if (!images) return [];
    return images.filter(img => {
      const gName = (img.gameName || "").toLowerCase();
      const gCountry = (img.country || "").toLowerCase();
      const gNum = (img.gameNumber || "").toLowerCase();
      const s = searchTerm.toLowerCase();
      
      const matchesSearch = gName.includes(s) || gCountry.includes(s) || gNum.includes(s);
      const matchesContinent = activeContinent === 'Mundo' || img.continent === activeContinent;
      const matchesCountry = !activeCountry || img.country === activeCountry;
      
      const isRecent = (Date.now() - (img.createdAt || 0)) < 86400000;
      const matchesPage = currentPage === 'new-arrivals' ? isRecent : true;
      
      return matchesSearch && matchesContinent && matchesCountry && matchesPage;
    });
  }, [images, searchTerm, activeContinent, activeCountry, currentPage]);

  const handleExport = async () => {
    try {
      const data = await storageService.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-arquivo-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      addSignal("Arquivo exportado com sucesso! hihi!", "success");
    } catch (err) {
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

  const handleExportTXT = () => {
    const content = images.map(img => `${img.gameNumber} - ${img.gameName} (${img.country})`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `checklist-arquivo-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    addSignal("Checklist gerada com sucesso! hihi!", "success");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] text-slate-100 gap-6">
        <div className="relative">
          <Loader2 className="w-16 h-16 animate-spin text-brand-500" />
          <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-brand-400 animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <p className="font-black uppercase tracking-[0.3em] text-xs text-brand-400 animate-pulse">
            Chloe está a carregar o seu mundo azul... hihi!
          </p>
          <p className="text-[10px] text-slate-600 uppercase font-bold tracking-widest">Aguarde um momento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-100">
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
        onExportTXT={handleExportTXT}
        onExportCSV={() => {}}
        t={t.header}
        recentCount={images.filter(img => (Date.now() - (img.createdAt || 0)) < 86400000).length}
        onCountrySelect={(cont, country) => {
          setActiveContinent(cont);
          setActiveCountry(country);
          setCurrentPage('home');
        }}
        countriesByContinent={images.reduce((acc, img) => {
          if (!acc[img.continent]) acc[img.continent] = [];
          if (!acc[img.continent].includes(img.country)) acc[img.continent].push(img.country);
          return acc;
        }, {} as any)}
      />

      <main className="flex-1 flex flex-col min-h-0">
        {(currentPage === 'home' || currentPage === 'new-arrivals') && (
          <div className="p-4 md:p-8 space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="relative w-full max-w-xl group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-brand-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Pesquisar por nome, nº ou país..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm focus:border-brand-500 outline-none transition-all shadow-inner"
                />
              </div>
              <div className="flex gap-2">
                {activeCountry && (
                  <button onClick={() => setActiveCountry('')} className="bg-slate-800 text-slate-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase border border-slate-700 hover:text-white">
                    País: {activeCountry} (Limpar)
                  </button>
                )}
                {isAdmin && (
                  <button 
                    onClick={() => setShowUpload(true)} 
                    className="bg-brand-500 hover:bg-brand-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-xl shadow-brand-500/20"
                  >
                    <Plus className="w-4 h-4" /> Arquivar Item
                  </button>
                )}
              </div>
            </div>

            <ImageGrid 
              images={filteredImages}
              onImageClick={setSelectedImage}
              isAdmin={isAdmin}
              currentUser={currentUser}
              t={t.grid}
            />
          </div>
        )}

        {currentPage === 'stats' && (
           <StatsSection 
             stats={images.reduce((acc, img) => {
               if (img.continent) acc[img.continent] = (acc[img.continent] || 0) + 1;
               return acc;
             }, {} as any)}
             categoryStats={{ 
               scratch: images.filter(i => i.category === 'raspadinha').length,
               lottery: images.filter(i => i.category === 'lotaria').length
             }}
             countryStats={images.reduce((acc, img) => {
               if (img.country) acc[img.country] = (acc[img.country] || 0) + 1;
               return acc;
             }, {} as any)}
             stateStats={images.reduce((acc, img) => {
               if (img.state) acc[img.state] = (acc[img.state] || 0) + 1;
               return acc;
             }, {} as any)}
             collectorStats={images.reduce((acc, img) => {
               const c = img.collector || 'Geral';
               acc[c] = (acc[c] || 0) + 1;
               return acc;
             }, {} as any)}
             totalRecords={images.length}
             t={t.stats}
             currentUser={currentUser}
           />
        )}

        {currentPage === 'map' && (
           <div className="p-8 h-full min-h-[600px]">
             <WorldMap 
               images={images}
               activeContinent={activeContinent}
               onCountrySelect={(country) => {
                 setActiveCountry(country);
                 setCurrentPage('home');
               }}
               t={t.grid}
             />
           </div>
        )}

        {currentPage === 'about' && (
          <AboutPage 
            t={t.about} 
            isAdmin={isAdmin}
            founderPhoto={siteMetadata?.founderPhotoUrl}
            founderBio={siteMetadata?.founderBio}
            founderQuote={siteMetadata?.founderQuote}
            milestones={siteMetadata?.milestones}
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
      />

      {/* Modais */}
      {showUpload && (
        <UploadModal 
          onClose={() => setShowUpload(false)}
          onUploadComplete={(data) => {
            setImages([data, ...images]);
            addSignal(`${data.gameName} arquivado! hihi!`, 'success');
          }}
          existingImages={images}
          initialFile={null}
          currentUser={currentUser}
          t={t.upload}
          categories={categories}
        />
      )}

      {selectedImage && (
        <ImageViewer 
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
          onUpdate={async (data) => {
            await storageService.save(data);
            setImages(images.map(img => img.id === data.id ? data : img));
            setSelectedImage(data);
            addSignal("Registo atualizado! hihi!", "info");
          }}
          onDelete={async (id) => {
            await storageService.delete(id);
            setImages(images.filter(img => img.id !== id));
            setSelectedImage(null);
            addSignal("Item removido.", "warning");
          }}
          isAdmin={isAdmin}
          currentUser={currentUser}
          contextImages={images}
          onImageSelect={setSelectedImage}
          t={t.viewer}
          categories={categories}
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
              addSignal(`Bem-vindo, Comandante ${u}! hihi!`, 'divine');
              return true;
            } else if (type === 'visitor') {
              setCurrentUser(u);
              localStorage.setItem('archive_user', u);
              localStorage.setItem('archive_admin', 'false');
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

      <DivineSignal signals={signals} onRemove={(id) => setSignals(s => s.filter(sig => sig.id !== id))} />
    </div>
  );
};

export default App;
