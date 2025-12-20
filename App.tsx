
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Plus, Loader2, Sparkles, Zap, LayoutGrid, Trophy, Star, Ticket, Layers, Box, MapPin, X } from 'lucide-react';
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
  
  // Estados de Navegação e Filtros
  const [currentPage, setCurrentPage] = useState<'home' | 'stats' | 'map' | 'about' | 'new-arrivals'>('home');
  const [language, setLanguage] = useState<Language>('pt');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeContinent, setActiveContinent] = useState<Continent | 'Mundo'>('Mundo');
  const [activeCountry, setActiveCountry] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showRaritiesOnly, setShowRaritiesOnly] = useState(false);
  const [showWinnersOnly, setShowWinnersOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Sugestões de país
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
  const countryInputRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryInputRef.current && !countryInputRef.current.contains(event.target as Node)) {
        setShowCountrySuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const uniqueCountries = useMemo(() => {
    const countries = images.map(img => img.country).filter(Boolean);
    return Array.from(new Set(countries)).sort();
  }, [images]);

  const countrySuggestions = useMemo(() => {
    if (!activeCountry.trim()) return [];
    return uniqueCountries.filter(c => 
      c.toLowerCase().includes(activeCountry.toLowerCase()) && 
      c.toLowerCase() !== activeCountry.toLowerCase()
    ).slice(0, 5);
  }, [activeCountry, uniqueCountries]);

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
      
      const isRecent = (Date.now() - (img.createdAt || 0)) < 43200000; // 12h
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

      {/* Barra de Navegação Consolidada: Categorias + Status + Pesquisa + País */}
      {(currentPage === 'home' || currentPage === 'new-arrivals') && (
        <div className="bg-[#0a0f1e]/90 border-b border-slate-800 backdrop-blur-md sticky top-[70px] md:top-[80px] z-[100] px-4 md:px-8 py-2">
          <div className="max-w-[1800px] mx-auto flex flex-col xl:flex-row items-center justify-between gap-4">
            
            {/* Bloco Unificado: Categorias, Status, Pesquisa e País Alinhados */}
            <div className="flex flex-wrap items-center gap-3 w-full xl:flex-1 overflow-x-auto scrollbar-hide">
               <div className="flex items-center gap-1">
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
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${activeCategory === cat.id ? 'bg-brand-500 border-brand-400 text-white shadow-lg shadow-brand-900/20' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'}`}
                    >
                      <cat.icon className="w-3.5 h-3.5" /> {cat.label}
                    </button>
                  ))}
               </div>

               <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block"></div>

               {/* Raridades e Premiadas */}
               <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setShowRaritiesOnly(!showRaritiesOnly)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${showRaritiesOnly ? 'bg-amber-500 border-amber-400 text-white shadow-lg shadow-amber-900/20' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-amber-500'}`}
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${showRaritiesOnly ? 'text-white' : 'text-amber-500'}`} /> {showRaritiesOnly ? 'Só Raridades' : 'Raridades'}
                  </button>

                  <button
                    onClick={() => setShowWinnersOnly(!showWinnersOnly)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${showWinnersOnly ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-900/20' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-emerald-500'}`}
                  >
                    <Trophy className={`w-3.5 h-3.5 ${showWinnersOnly ? 'text-white' : 'text-emerald-500'}`} /> {showWinnersOnly ? 'Só Premiadas' : 'Premiadas'}
                  </button>
               </div>

               <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block"></div>

               {/* Pesquisa e Filtro de País (Agora ao lado de Premiadas) */}
               <div className="flex items-center gap-2 flex-1 min-w-[300px]">
                  <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600 group-focus-within:text-brand-500 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Pesquisar..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-[10px] focus:border-brand-500 outline-none transition-all shadow-inner font-bold text-white uppercase tracking-wider"
                    />
                  </div>

                  <div className="relative flex-1 group" ref={countryInputRef}>
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-brand-500" />
                    <input 
                      type="text" 
                      placeholder="Filtrar País..." 
                      value={activeCountry}
                      onChange={(e) => { setActiveCountry(e.target.value); setShowCountrySuggestions(true); }}
                      onFocus={() => setShowCountrySuggestions(true)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-8 py-1.5 text-[10px] focus:border-brand-500 outline-none transition-all shadow-inner font-bold text-white uppercase tracking-wider"
                    />
                    {activeCountry && (
                      <button onClick={() => setActiveCountry('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    )}
                    {showCountrySuggestions && countrySuggestions.length > 0 && (
                      <div className="absolute top-full right-0 w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-[120] overflow-hidden animate-fade-in">
                        {countrySuggestions.map(country => (
                          <button
                            key={country}
                            onClick={() => { setActiveCountry(country); setShowCountrySuggestions(false); }}
                            className="w-full text-left px-3 py-2 text-[9px] font-black text-slate-400 hover:bg-brand-500 hover:text-white transition-all border-b border-slate-800 last:border-0 uppercase"
                          >
                            {country}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
               </div>
            </div>

            {/* Direita: Ação Admin */}
            <div className="flex items-center shrink-0">
               {isAdmin && (
                  <button 
                    onClick={() => setShowUpload(true)} 
                    className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg active:scale-95 whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5" /> Arquivar
                  </button>
               )}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col min-h-0 pb-16 md:pb-12">
        {(currentPage === 'home' || currentPage === 'new-arrivals') && (
          <div className="p-4 md:p-8 space-y-6 animate-fade-in">
            {/* Status dos Filtros */}
            {(activeCountry || activeCategory !== 'all' || showRaritiesOnly || showWinnersOnly || searchTerm) && (
              <div className="flex items-center justify-between bg-slate-900/30 border border-slate-800/50 p-3 rounded-2xl">
                 <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mr-2">Filtros ativos:</span>
                    {searchTerm && <span className="bg-slate-800 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase border border-slate-700">{searchTerm}</span>}
                    {activeCountry && <span className="bg-slate-800 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase border border-slate-700">{activeCountry}</span>}
                    {activeCategory !== 'all' && <span className="bg-slate-800 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase border border-slate-700">{activeCategory}</span>}
                    {showRaritiesOnly && <span className="bg-amber-900/30 text-amber-400 px-2 py-0.5 rounded text-[8px] font-black uppercase border border-amber-800/50">Só Raridades</span>}
                    {showWinnersOnly && <span className="bg-emerald-900/30 text-emerald-400 px-2 py-0.5 rounded text-[8px] font-black uppercase border border-emerald-800/50">Só Premiadas</span>}
                 </div>
                 <button 
                    onClick={() => {
                      setActiveCountry('');
                      setActiveCategory('all');
                      setShowRaritiesOnly(false);
                      setShowWinnersOnly(false);
                      setSearchTerm('');
                    }} 
                    className="text-brand-500 hover:text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg transition-all"
                  >
                    Limpar Tudo
                  </button>
              </div>
            )}

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
