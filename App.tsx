
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, Plus, Loader2, Sparkles, Zap, LayoutGrid, Trophy, Star, 
  Ticket, Layers, Box, MapPin, X, Diamond, Crown, CheckCircle2 
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
import { Footer } from './components/Footer';
import { storageService } from './services/storage';
import { ScratchcardData, CategoryItem, SiteMetadata, Continent } from './types';
import { translations, Language } from './translations';
import { DivineSignal, Signal } from './components/DivineSignal';

const App: React.FC = () => {
  const [images, setImages] = useState<ScratchcardData[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [siteMetadata, setSiteMetadata] = useState<SiteMetadata | null>(null);
  
  const [currentPage, setCurrentPage] = useState<'home' | 'stats' | 'map' | 'about' | 'new-arrivals'>('home');
  const [language, setLanguage] = useState<Language>('pt');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeContinent, setActiveContinent] = useState<Continent | 'Mundo'>('Mundo');
  const [activeCountry, setActiveCountry] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showRaritiesOnly, setShowRaritiesOnly] = useState(false);
  const [showWinnersOnly, setShowWinnersOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
  const countryInputRef = useRef<HTMLDivElement>(null);

  const [selectedImage, setSelectedImage] = useState<ScratchcardData | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showWebsites, setShowWebsites] = useState(false);
  const [showRadio, setShowRadio] = useState(false);
  
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryInputRef.current && !countryInputRef.current.contains(event.target as Node)) {
        setShowCountrySuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
      const matchesCountry = !activeCountry || img.country.toLowerCase().includes(activeCountry.toLowerCase());
      const matchesCategory = activeCategory === 'all' || img.category === activeCategory;
      const matchesRarity = !showRaritiesOnly || img.isRarity;
      const matchesWinners = !showWinnersOnly || img.isWinner;
      
      const isRecent = (Date.now() - (img.createdAt || 0)) < 43200000;
      const matchesPage = currentPage === 'new-arrivals' ? isRecent : true;
      
      return matchesSearch && matchesContinent && matchesCountry && matchesCategory && matchesRarity && matchesWinners && matchesPage;
    });
  }, [images, searchTerm, activeContinent, activeCountry, activeCategory, showRaritiesOnly, showWinnersOnly, currentPage]);

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
        <Loader2 className="w-16 h-16 animate-spin text-brand-500" />
        <p className="font-black uppercase tracking-[0.3em] text-xs text-brand-400 animate-pulse">Chloe está a carregar... hihi!</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-100 pt-28 md:pt-32">
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
        recentCount={images.filter(img => (Date.now() - (img.createdAt || 0)) < 43200000).length}
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

      {(currentPage === 'home' || currentPage === 'new-arrivals') && (
        <div className="bg-[#020617]/70 backdrop-blur-3xl sticky top-[95px] z-[90] px-6 md:px-10 py-5 border-b border-white/10 shadow-2xl">
          <div className="max-w-[1800px] mx-auto flex flex-col gap-6">
            
            {/* LINHA ÚNICA DE FILTROS: "Tudo seguido e alinhado" */}
            <div className="flex flex-wrap items-center justify-center lg:justify-between gap-4">
              
              <div className="flex flex-wrap items-center gap-2">
                 {/* FILTROS ESPECIAIS PRIMEIRO */}
                 <div className="flex items-center gap-2 mr-2 border-r border-white/10 pr-4">
                   <button 
                     onClick={() => setShowRaritiesOnly(!showRaritiesOnly)}
                     className={`flex items-center gap-2 px-5 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${showRaritiesOnly ? 'bg-amber-500 text-slate-950 shadow-lg' : 'bg-slate-900/50 border border-slate-800 text-slate-500 hover:text-slate-300'}`}
                   >
                     <Diamond className="w-4 h-4" /> Raridades
                   </button>
                   <button 
                     onClick={() => setShowWinnersOnly(!showWinnersOnly)}
                     className={`flex items-center gap-2 px-5 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${showWinnersOnly ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-900/50 border border-slate-800 text-slate-500 hover:text-slate-300'}`}
                   >
                     <Trophy className="w-4 h-4" /> Premiadas
                   </button>
                 </div>

                 {/* CATEGORIAS LOGO A SEGUIR */}
                 <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
                    {[
                      { id: 'all', label: 'Tudo', icon: LayoutGrid },
                      { id: 'raspadinha', label: 'Raspadinhas', icon: Ticket },
                      { id: 'lotaria', label: 'Lotarias', icon: Star },
                      { id: 'boletim', label: 'Boletins', icon: Layers },
                      { id: 'objeto', label: 'Objetos', icon: Box },
                    ].map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex items-center gap-3 px-5 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat.id ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/40 border border-brand-400/30' : 'bg-slate-900/50 border border-slate-800 text-slate-500 hover:text-slate-300'}`}
                      >
                        <cat.icon className="w-4 h-4" /> {cat.label}
                      </button>
                    ))}
                 </div>
              </div>

              {/* PESQUISA E AÇÃO */}
              <div className="flex items-center gap-4 w-full lg:w-auto">
                <div className="relative w-full lg:w-72 group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-brand-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Pesquisar..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-full pl-12 pr-6 py-3 text-xs focus:border-brand-500 outline-none transition-all uppercase tracking-wider text-white shadow-inner"
                  />
                </div>

                {isAdmin && (
                  <button 
                    onClick={() => setShowUpload(true)} 
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 shadow-xl hover:scale-105 active:scale-95 border border-emerald-400/20 whitespace-nowrap"
                  >
                    <Plus className="w-5 h-5" /> Arquivar Item
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col min-h-0 pb-20">
        {(currentPage === 'home' || currentPage === 'new-arrivals') && (
          <div className="p-4 md:p-10 animate-fade-in">
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
           <div className="p-10 h-full min-h-[600px]">
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
