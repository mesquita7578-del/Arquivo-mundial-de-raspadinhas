import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
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
  ClipboardList, Package, Search, Filter, MapPin
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
  
  // State for Filters (as seen in screenshot)
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

  useEffect(() => { loadData(); }, []);

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
      // Continent Filter
      if (activeContinent !== 'Mundo' && i.continent !== activeContinent) return false;
      
      // Category Filter
      if (activeCategory !== 'all' && i.category !== activeCategory) return false;

      // Quick Filters
      if (filterRarity && !i.isRarity) return false;
      if (filterPromo && !i.isPromotional) return false;
      if (filterWinners && !i.isWinner) return false;
      if (currentPage === 'my-collection' && (!currentUser || !i.owners?.includes(currentUser))) return false;

      // Text/Country Search
      const search = (countrySearch || searchTerm).toLowerCase();
      if (search) {
        return i.gameName.toLowerCase().includes(search) || 
               i.country.toLowerCase().includes(search) || 
               i.gameNumber.toLowerCase().includes(search) ||
               i.customId.toLowerCase().includes(search);
      }
      
      return true;
    }).sort((a, b) => b.createdAt - a.createdAt);
  }, [allImagesCache, activeContinent, activeCategory, filterRarity, filterPromo, filterWinners, countrySearch, searchTerm, currentPage, currentUser]);

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Header 
        isAdmin={isAdmin} currentUser={currentUser} 
        onAdminToggle={() => setIsLoginModalOpen(true)}
        onLogout={() => { setCurrentUser(null); setUserRole(null); setCurrentPage('home'); }} 
        onHistoryClick={() => setIsHistoryModalOpen(true)} 
        language={language} setLanguage={setLanguage}
        currentPage={currentPage} onNavigate={(p) => { 
           setCurrentPage(p); 
           if (['europa', 'america', 'asia', 'africa', 'oceania'].includes(p)) {
              const mapping: Record<string, Continent> = {
                'europa': 'Europa', 'america': 'América', 'asia': 'Ásia', 'africa': 'África', 'oceania': 'Oceania'
              };
              setActiveContinent(mapping[p]);
           } else {
              setActiveContinent('Mundo');
           }
        }} 
        t={t.header}
      />

      <main className="flex-1 overflow-y-auto bg-slate-950">
        
        {/* BARRA DE FILTROS SUPERIOR (Screenshot Match) */}
        <div className="bg-slate-900/50 border-b border-slate-800 p-3 md:px-8 flex flex-wrap items-center gap-3">
           <button 
             onClick={() => setFilterRarity(!filterRarity)}
             className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-bold transition-all ${filterRarity ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'}`}
           >
             <Gem className="w-4 h-4" /> Raridades
           </button>
           <button 
             onClick={() => setFilterPromo(!filterPromo)}
             className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-bold transition-all ${filterPromo ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'}`}
           >
             <Gift className="w-4 h-4" /> Promocionais
           </button>
           <button 
             onClick={() => setFilterWinners(!filterWinners)}
             className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-bold transition-all ${filterWinners ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'}`}
           >
             <Trophy className="w-4 h-4" /> Premiadas
           </button>
           <button 
             onClick={() => setCurrentPage('my-collection')}
             className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-bold transition-all ${currentPage === 'my-collection' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'}`}
           >
             <Heart className="w-4 h-4" /> Minha Coleção
           </button>
           <button 
             onClick={() => setIsWebsitesModalOpen(true)}
             className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-bold transition-all"
           >
             <Building2 className="w-4 h-4" /> Sites Oficiais
           </button>

           <div className="h-8 w-px bg-slate-800 mx-2 hidden md:block"></div>

           <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-lg">
              <button onClick={() => setActiveCategory('all')} className={`px-4 py-1 rounded text-xs font-bold ${activeCategory === 'all' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>Tudo</button>
              <button onClick={() => setActiveCategory('raspadinha')} className={`px-4 py-1 rounded text-xs font-bold ${activeCategory === 'raspadinha' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>Raspadinha</button>
              <button onClick={() => setActiveCategory('lotaria')} className={`px-4 py-1 rounded text-xs font-bold ${activeCategory === 'lotaria' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>Lotaria</button>
              <button onClick={() => setActiveCategory('boletim')} className={`px-4 py-1 rounded text-xs font-bold ${activeCategory === 'boletim' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>Boletim</button>
              <button onClick={() => setActiveCategory('objeto')} className={`px-4 py-1 rounded text-xs font-bold ${activeCategory === 'objeto' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>Objeto</button>
           </div>
        </div>

        {currentPage === 'stats' ? (
           <StatsSection stats={totalStats.stats} categoryStats={totalStats.categoryStats} countryStats={totalStats.countryStats} stateStats={totalStats.stateStats} collectorStats={totalStats.collectorStats} totalRecords={totalStats.total} t={t.stats} />
        ) : currentPage === 'about' ? (
           <AboutPage t={t} />
        ) : (
          <div className="p-4 md:p-10 animate-fade-in">
             
             {/* SEÇÃO EXPLORAR (Screenshot Match) */}
             <div className="mb-10">
                <div className="flex items-center gap-2 text-white font-black uppercase tracking-widest mb-6">
                   <Globe className="w-5 h-5 text-blue-500" /> Explorar
                </div>
                
                <div className="flex flex-wrap gap-4 mb-6">
                   <button onClick={() => setActiveContinent('Mundo')} className={`px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 border transition-all ${activeContinent === 'Mundo' ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-900/20' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'}`}>
                      Mundo <span className="bg-slate-800 text-[10px] px-1.5 rounded">{totalStats.total}</span>
                   </button>
                   {['Europa', 'América', 'Ásia', 'África', 'Oceania'].map(cont => (
                      <button key={cont} onClick={() => setActiveContinent(cont as Continent)} className={`px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 border transition-all ${activeContinent === cont ? 'bg-orange-600 border-orange-500 text-white shadow-xl shadow-orange-900/20' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'}`}>
                         {cont} <span className="bg-slate-800 text-[10px] px-1.5 rounded">{totalStats.stats[cont] || 0}</span>
                      </button>
                   ))}
                </div>

                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                      <MapPin className="w-4 h-4" /> Países:
                   </div>
                   <div className="relative group min-w-[200px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                      <input 
                        type="text"
                        placeholder="Pesquisar País..."
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-blue-500 outline-none w-full"
                      />
                   </div>
                   {countrySearch && (
                      <div className="flex items-center gap-2 bg-orange-600 text-white px-3 py-1 rounded-md text-xs font-bold">
                         {countrySearch} <button onClick={() => setCountrySearch('')}><X className="w-3.5 h-3.5" /></button>
                      </div>
                   )}
                </div>
             </div>

             <div className="h-px bg-slate-800/50 mb-10"></div>

             {isLoadingDB ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                   <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
                   <p className="text-slate-500 font-bold uppercase tracking-widest">Carregando Arquivo...</p>
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
      </main>

      {/* Floating Action for Admin */}
      {isAdmin && (
        <button 
          onClick={() => setIsUploadModalOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-brand-600 hover:bg-brand-500 text-white rounded-full shadow-2xl shadow-brand-900/50 flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-40"
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

// Add PlusCircle manually since it was not in the imports
import { PlusCircle } from 'lucide-react';

export default App;