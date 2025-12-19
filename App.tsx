
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ImageGrid } from './components/ImageGrid';
import { UploadModal } from './components/UploadModal';
import { ImageViewer } from './components/ImageViewer';
import { LoginModal } from './components/LoginModal';
import { StatsSection } from './components/StatsSection';
import { HistoryModal } from './components/HistoryModal'; 
import { WebsitesModal } from './components/WebsitesModal';
import { CategoryManager } from './components/CategoryManager';
import { AboutPage } from './components/AboutPage'; 
import { WorldMap } from './components/WorldMap';
import { DivineSignal, Signal, SignalType } from './components/DivineSignal';
import { ChloeRaffle } from './components/ChloeRaffle';
import { INITIAL_RASPADINHAS } from './constants';
import { ScratchcardData, Continent, Category, CategoryItem, SiteMetadata } from './types';
import { 
  Globe, Ticket, Sparkles, Loader2, Library, BookOpen, 
  PlusCircle, Info, Search, Filter, LayoutGrid, Map as MapIcon, Tag,
  Navigation, MousePointer2, UserCheck, FileJson, Zap, Wand2
} from 'lucide-react';
import { translations, Language } from './translations';
import { storageService } from './services/storage';

const AUTHORIZED_ADMINS = ["JORGE MESQUITA", "FABIO PAGNI", "CHLOE", "IA", "SYSTEM", "PEDRO RODRIGO"];
const ADMIN_PASSWORD = "123456";

type PageType = 'home' | 'stats' | 'about' | 'europe' | 'america' | 'asia' | 'africa' | 'oceania' | 'showcase' | 'my-collection' | 'map' | 'new-arrivals';

function App() {
  const [allImagesCache, setAllImagesCache] = useState<ScratchcardData[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [siteMetadata, setSiteMetadata] = useState<SiteMetadata>({ 
    id: 'site_settings', 
    founderPhotoUrl: '',
    founderBio: `Nascido a 16 de julho de 1967 na rua de Bonjóia, em Campanhã, no coração do Porto, Jorge Manuel Cardoso Mesquita carrega no sangue a passion pelo detalhe. Filho de Custódio Mateus Mesquita e Ana Conceição Jesus Cardoso, Jorge descobriu o encanto do colecionismo através do seu falecido pai, que dedicava horas aos álbuns de cromos da Panini.\n\nO que começou com latas de bebidas, isqueiros e miniaturas de carros, evoluiu para a numismática e, finalmente, para o encontro que mudaria o seu destino: a descoberta das "Gratta e Vinci" em Itália. Ali, entre a arte italiana e os exemplares que já possuía em Portugal, Jorge mergulhou de cabeça no mundo da sorte instantânea.\n\nA jornada não foi fácil. A falta de informação sobre as emissões da SCML em Portugal motivou uma busca incessante que o levou a conhecer David Vázquez Trujillo, o maior colecionador mundial de lotarias. Sob a mentoria de David, Fabio Pagni e Kurt Böhmer, Jorge transformou-se de um entusiasta num verdadeiro guardião da história mundial das raspadinhas.\n\nA viver e trabalhar na Suíça, Jorge dedica 99,9% da sua alma ao colecionismo de raspadinhas, mantendo o espírito vivo para que este arquivo digital seja um legado eterno para as futuras gerações, incluindo a sua neta Chloe.`,
    founderQuote: "Dedico 99,9% da minha alma às raspadinhas; o resto é a história de uma vida a colecionar sonhos.",
    milestones: [
      { year: '1967', title: 'O Início no Porto', description: 'Nascimento na Rua de Bonjóia, Campanhã. O início de uma jornada marcada pela curiosidade.' },
      { year: '1980', title: 'A Herança de Custódio', description: 'A descoberta dos cromos Panini e o despertar do "vício" saudável do colecionismo pelas mãos do pai.' },
      { year: '1983', title: 'O Primeiro Passo Profissional', description: 'Início da vida laboral, mantendo sempre o "bichinho" das moedas e notas do mundo.' },
      { year: 'Itália', title: 'O Despertar da Sorte', description: 'A descoberta das "Gratta e Vinci" e a decisão de catalogar sistematicamente as raspadinhas mundiais.' },
      { year: '2013', title: 'A Conexão Mundial', description: 'O encontro com David Vázquez Trujillo e o início da grande caminhada com mentores globais.' },
      { year: '2025', title: 'O Arquivo Digital', description: 'A viver na Suíça, consolida o seu legado digital para garantir que a história nunca se perca.' }
    ]
  });
  const [totalStats, setTotalStats] = useState({ total: 0, stats: {} as Record<string, number>, categoryStats: {} as Record<string, number>, countryStats: {} as Record<string, number>, stateStats: {} as Record<string, number>, collectorStats: {} as Record<string, number> });
  const [isLoadingDB, setIsLoadingDB] = useState(true);
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [signals, setSignals] = useState<Signal[]>([]);
  
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [activeContinent, setActiveContinent] = useState<Continent | 'Mundo'>('Mundo');
  const [filterRarity, setFilterRarity] = useState(false);
  const [filterWinners, setFilterWinners] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false); 
  const [isWebsitesModalOpen, setIsWebsitesModalOpen] = useState(false); 
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ScratchcardData | null>(null);
  const [raffleItem, setRaffleItem] = useState<ScratchcardData | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'visitor' | null>(null);
  const isAdmin = userRole === 'admin';
  const [language, setLanguage] = useState<Language>('pt');
  const t = translations[language];

  const recentCount = useMemo(() => {
    const fortyEightHoursInMs = 48 * 60 * 60 * 1000;
    return allImagesCache.filter(img => (Date.now() - img.createdAt) < fortyEightHoursInMs).length;
  }, [allImagesCache]);

  useEffect(() => {
    loadData();
  }, []);

  const triggerSignal = useCallback((message: string, type: SignalType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setSignals(prev => [...prev, { id, message, type }]);
  }, []);

  const removeSignal = useCallback((id: string) => {
    setSignals(prev => prev.filter(s => s.id !== id));
  }, []);

  const loadData = async () => {
    try {
      await storageService.init();
      const cats = await storageService.getCategories();
      setCategories(cats);
      
      const meta = await storageService.getSiteMetadata();
      if (meta && meta.founderBio) setSiteMetadata(meta);

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
    } catch (error) { 
      console.error("DB Error:", error); 
    } finally { 
      setIsLoadingDB(false); 
    }
  };

  const handleExportBackup = async () => {
    try {
      const data = await storageService.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-arquivo-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      triggerSignal("Cópia de Segurança Criada!", 'success');
    } catch (err) {
      triggerSignal("Erro ao gerar backup", 'warning');
    }
  };

  const handleUpdateImage = async (updatedImage: ScratchcardData) => {
    await storageService.save(updatedImage);
    setAllImagesCache(prev => prev.map(img => img.id === updatedImage.id ? updatedImage : img));
    const freshStats = await storageService.getStats();
    setTotalStats(freshStats);
    triggerSignal("Item Atualizado", 'success');
  };

  const handleDeleteImage = async (id: string) => {
    await storageService.delete(id);
    setAllImagesCache(prev => prev.filter(img => img.id !== id));
    setSelectedImage(null);
    const freshStats = await storageService.getStats();
    setTotalStats(freshStats);
    triggerSignal("Item Removido", 'warning');
  };

  const countriesByContinent = useMemo(() => {
    const map: Record<string, string[]> = { 'Europa': [], 'América': [], 'Ásia': [], 'África': [], 'Oceania': [] };
    allImagesCache.forEach(img => {
      if (img.continent && map[img.continent] && !map[img.continent].includes(img.country)) {
        map[img.continent].push(img.country);
      }
    });
    Object.keys(map).forEach(cont => map[cont].sort());
    return map;
  }, [allImagesCache]);

  const handleCountrySelectFromMap = (country: string) => {
    setCurrentPage('home');
    const img = allImagesCache.find(i => i.country === country);
    if (img) setActiveContinent(img.continent);
    setCountrySearch(country);
  };

  const handleUploadComplete = async (newItem: ScratchcardData) => {
    setAllImagesCache(prev => [newItem, ...prev]);
    const freshStats = await storageService.getStats();
    setTotalStats(freshStats);
    triggerSignal("Nova Raspadinha no Arquivo! ✨", 'divine');
  };

  const handleChloeMagic = () => {
    if (allImagesCache.length === 0) return;
    const randomIndex = Math.floor(Math.random() * allImagesCache.length);
    setRaffleItem(allImagesCache[randomIndex]);
  };

  const filteredImages = useMemo(() => {
    return allImagesCache.filter(i => {
      // 1. Continent Filter
      if (activeContinent !== 'Mundo' && i.continent !== activeContinent) return false;
      
      // 2. Category Filter (Robust case-insensitive match)
      const targetCat = activeCategory.toLowerCase();
      const itemCat = (i.category || 'raspadinha').toLowerCase();
      if (targetCat !== 'all' && itemCat !== targetCat) return false;
      
      // 3. Flags
      if (filterRarity && !i.isRarity) return false;
      if (filterWinners && !i.isWinner) return false;
      
      // 4. Page-specific logical filters
      if (currentPage === 'my-collection' && (!currentUser || !i.owners?.includes(currentUser))) return false;
      if (currentPage === 'new-arrivals') {
        const fortyEightHoursInMs = 48 * 60 * 60 * 1000;
        if ((Date.now() - i.createdAt) > fortyEightHoursInMs) return false;
      }
      
      // search filters
      const search = (countrySearch || searchTerm).toLowerCase();
      if (search) {
        return i.gameName.toLowerCase().includes(search) || 
               i.country.toLowerCase().includes(search) || 
               i.gameNumber.toLowerCase().includes(search) ||
               (i.customId || '').toLowerCase().includes(search);
      }
      return true;
    }).sort((a, b) => a.gameNumber.localeCompare(b.gameNumber, undefined, { numeric: true }));
  }, [allImagesCache, activeContinent, activeCategory, filterRarity, filterWinners, countrySearch, searchTerm, currentPage, currentUser]);

  const handleNavigate = (p: PageType, resetFilters: boolean = false) => {
    setCurrentPage(p);
    if (resetFilters) {
      setCountrySearch('');
      setSearchTerm('');
      setActiveContinent('Mundo');
      setActiveCategory('all');
      setFilterRarity(false);
      setFilterWinners(false);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#020617] text-slate-100 overflow-hidden font-sans">
      <Header 
        isAdmin={isAdmin} 
        currentUser={currentUser} 
        onAdminToggle={() => setIsLoginModalOpen(true)}
        onLogout={() => { setCurrentUser(null); setUserRole(null); handleNavigate('home', true); }} 
        onHistoryClick={() => setIsHistoryModalOpen(true)} 
        onExport={handleExportBackup}
        onExportCSV={() => {}}
        onExportTXT={() => {}}
        onImport={(file) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
              try {
                const count = await storageService.importData(e.target?.result as string);
                triggerSignal(`${count} Novos Itens Sincronizados!`, 'divine');
                loadData();
              } catch (err) { triggerSignal("Erro na restauração", 'warning'); }
            };
            reader.readAsText(file);
        }}
        language={language} setLanguage={setLanguage}
        currentPage={currentPage} 
        onNavigate={(p) => handleNavigate(p, true)} 
        t={t.header}
        countriesByContinent={countriesByContinent}
        onCountrySelect={(cont, country) => { handleNavigate('home', true); setActiveContinent(cont); setCountrySearch(country); }}
        recentCount={recentCount}
      />

      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-950 to-[#020617] scroll-smooth custom-scrollbar flex flex-col relative">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-brand-600/5 blur-[100px] pointer-events-none z-0"></div>

        {!(currentPage === 'stats' || currentPage === 'about' || currentPage === 'map') && (
          <div className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-900 shadow-2xl">
            <div className="bg-slate-900/30 p-2 md:px-8 flex flex-wrap items-center gap-2">
              <button onClick={() => setFilterRarity(!filterRarity)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-black transition-all ${filterRarity ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800/50 border-slate-700 text-slate-500'}`}>Raridades</button>
              <button onClick={() => setFilterWinners(!filterWinners)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-black transition-all ${filterWinners ? 'bg-green-600 border-green-500 text-white' : 'bg-slate-800/50 border-slate-700 text-slate-500'}`}>Premiadas</button>
              
              <div className="flex bg-slate-900/50 border border-slate-800 p-1 rounded-lg">
                  <button 
                    onClick={() => { setActiveCategory('all'); handleNavigate('home'); }} 
                    className={`px-3 py-1 rounded text-[10px] font-black uppercase transition-all ${activeCategory === 'all' && currentPage === 'home' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-400'}`}
                  >
                    Tudo
                  </button>
                  {categories.map(cat => (
                    <button 
                      key={cat.id} 
                      onClick={() => { setActiveCategory(cat.name); handleNavigate('home'); }} 
                      className={`px-3 py-1 rounded text-[10px] font-black uppercase transition-all ${activeCategory.toLowerCase() === cat.name.toLowerCase() && currentPage === 'home' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-400'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                  
                  {currentUser && (
                    <button onClick={() => handleNavigate('my-collection')} className={`px-3 py-1 rounded text-[10px] font-black uppercase transition-all ml-1 border-l border-slate-800 pl-4 flex items-center gap-1.5 ${currentPage === 'my-collection' ? 'bg-cyan-600 text-white shadow-lg' : 'text-cyan-600 hover:text-cyan-400'}`}><UserCheck className="w-3 h-3" /> Minha Coleção</button>
                  )}
                  {recentCount > 0 && (
                    <button onClick={() => handleNavigate('new-arrivals')} className={`px-3 py-1 rounded text-[10px] font-black uppercase transition-all ml-1 border-l border-slate-800 pl-4 flex items-center gap-1.5 ${currentPage === 'new-arrivals' ? 'bg-brand-600 text-white shadow-lg' : 'text-brand-500 hover:text-brand-400'}`}><Zap className="w-3 h-3 animate-pulse" /> Novidades</button>
                  )}
                  {isAdmin && (
                    <button onClick={handleExportBackup} className="px-3 py-1 rounded text-[10px] font-black uppercase transition-all ml-1 border-l border-slate-800 pl-4 text-slate-500 hover:text-brand-500 flex items-center gap-1.5" title="Backup Rápido JSON"><FileJson className="w-3 h-3" /> [JSON]</button>
                  )}
              </div>
            </div>
            <div className="px-4 md:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setActiveContinent('Mundo')} className={`px-4 py-2 rounded-full text-[11px] font-black border transition-all ${activeContinent === 'Mundo' ? 'bg-blue-600 text-white border-blue-400 shadow-lg' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>Mundo</button>
                {['Europa', 'América', 'Ásia', 'África', 'Oceania'].map(cont => (
                    <button key={cont} onClick={() => setActiveContinent(cont as Continent)} className={`px-4 py-2 rounded-full text-[11px] font-black border transition-all ${activeContinent === cont ? 'bg-brand-600 text-white border-brand-400 shadow-lg' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>{cont}</button>
                ))}
              </div>
              <div className="relative group w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
                  <input type="text" placeholder="Procurar no arquivo..." value={countrySearch} onChange={(e) => setCountrySearch(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none w-full focus:border-brand-500" />
              </div>
            </div>
          </div>
        )}

        <div className="relative flex-1 flex flex-col min-h-0 z-10">
          {isLoadingDB ? (
            <div className="flex flex-col items-center justify-center flex-1 min-h-[400px] gap-6 animate-pulse">
                <Loader2 className="w-16 h-16 text-brand-500 animate-spin" />
                <p className="text-white font-black uppercase tracking-[0.3em] text-sm">Sincronizando Novidades...</p>
            </div>
          ) : currentPage === 'stats' ? (
            <StatsSection stats={totalStats.stats} categoryStats={totalStats.categoryStats as any} countryStats={totalStats.countryStats} stateStats={totalStats.stateStats} collectorStats={totalStats.collectorStats} totalRecords={totalStats.total} t={t.stats} currentUser={currentUser} />
          ) : currentPage === 'about' ? (
            <AboutPage t={t} isAdmin={isAdmin} founderPhoto={siteMetadata.founderPhotoUrl} founderBio={siteMetadata.founderBio} founderQuote={siteMetadata.founderQuote} milestones={siteMetadata.milestones} onUpdateFounderPhoto={(url) => storageService.saveSiteMetadata({...siteMetadata, founderPhotoUrl: url}).then(() => loadData())} onUpdateMetadata={(data) => storageService.saveSiteMetadata({...siteMetadata, ...data}).then(() => loadData())} />
          ) : currentPage === 'map' ? (
            <div className="flex-1 p-4 md:p-8 animate-fade-in flex flex-col h-full">
               <WorldMap images={allImagesCache} onCountrySelect={handleCountrySelectFromMap} activeContinent={activeContinent} t={t.grid} />
            </div>
          ) : (
            <div className="p-4 md:p-8 animate-fade-in min-h-[50vh]">
               <ImageGrid images={filteredImages} onImageClick={setSelectedImage} isAdmin={isAdmin} currentUser={currentUser} t={t.grid} />
            </div>
          )}
        </div>
      </main>

      <Footer onNavigate={(p) => handleNavigate(p, true)} onWebsitesClick={() => setIsWebsitesModalOpen(true)} />

      {/* Floating Actions */}
      <div className="fixed bottom-28 left-8 flex flex-col gap-4 z-40">
        <button 
          onClick={handleChloeMagic}
          className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-pink-600 text-white rounded-2xl shadow-xl flex items-center justify-center border-2 border-white/20 hover:scale-110 transition-transform group relative"
          title="Sorteio da Chloe"
        >
          <Wand2 className="w-8 h-8" />
          <div className="absolute -top-2 -right-2 bg-brand-500 text-[8px] px-1.5 py-0.5 rounded-full border border-slate-900 animate-pulse font-black uppercase">Sorte!</div>
        </button>
      </div>

      {isAdmin && (
        <button onClick={() => setIsUploadModalOpen(true)} className="fixed bottom-28 right-8 w-16 h-16 bg-brand-600 text-white rounded-2xl shadow-xl flex items-center justify-center z-40 border-2 border-brand-400/30">
          <PlusCircle className="w-8 h-8" />
        </button>
      )}

      {selectedImage && (
        <ImageViewer image={selectedImage} onClose={() => setSelectedImage(null)} onUpdate={handleUpdateImage} onDelete={handleDeleteImage} isAdmin={isAdmin} currentUser={currentUser} contextImages={allImagesCache} onImageSelect={setSelectedImage} t={t.viewer} categories={categories} />
      )}

      {raffleItem && (
        <ChloeRaffle item={raffleItem} onClose={() => setRaffleItem(null)} onViewItem={setSelectedImage} />
      )}

      {isLoginModalOpen && <LoginModal onClose={() => setIsLoginModalOpen(false)} onLogin={(u, p, t) => {
        if (t === 'admin') {
          const clean = u.trim().toUpperCase();
          if (AUTHORIZED_ADMINS.includes(clean) && p === ADMIN_PASSWORD) { 
            setCurrentUser(u); setUserRole('admin'); triggerSignal(`Bem-vindo, Administrador ${u.split(' ')[0]}`, 'divine'); return true; 
          }
          return false;
        } else { 
          setCurrentUser(u); setUserRole('visitor'); triggerSignal(`Entrada Registada: ${u}`, 'info'); return true; 
        }
      }} t={t.login} />}
      
      {isUploadModalOpen && <UploadModal onClose={() => setIsUploadModalOpen(false)} onUploadComplete={handleUploadComplete} existingImages={allImagesCache} initialFile={null} currentUser={currentUser} t={t.upload} categories={categories} />}
      {isHistoryModalOpen && <HistoryModal onClose={() => setIsHistoryModalOpen(false)} isAdmin={isAdmin} t={t.header} />}
      {isWebsitesModalOpen && <WebsitesModal onClose={() => setIsWebsitesModalOpen(false)} isAdmin={isAdmin} t={t.header} />}

      <DivineSignal signals={signals} onRemove={removeSignal} />
    </div>
  );
}

export default App;
