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
import { AboutPage } from './components/AboutPage'; 
import { INITIAL_RASPADINHAS } from './constants';
import { ScratchcardData, Continent, Category } from './types';
import { Globe, Clock, Map, LayoutGrid, List, UploadCloud, Database, Loader2, PlusCircle, Map as MapIcon, X, Gem, Ticket, Coins, Gift, Building2, ClipboardList, Package, Home, BarChart2, Info, Flag, Heart, ArrowUp, Trophy, Crown, Star, User, Bot, Sparkles, Smartphone, Share as ShareIcon, RefreshCw, ChevronRight, CheckSquare, FileText, Zap, Activity, ShieldCheck, LayoutTemplate, Star as StarFull } from 'lucide-react';
import { translations, Language } from './translations';
import { storageService } from './services/storage';

const AUTHORIZED_ADMINS = ["JORGE MESQUITA", "FABIO PAGNI", "CHLOE", "IA", "SYSTEM", "PEDRO RODRIGO"];
const ADMIN_PASSWORD = "123456";

type PageType = 'home' | 'stats' | 'about' | 'europe' | 'america' | 'asia' | 'africa' | 'oceania' | 'showcase' | 'my-collection';

function App() {
  const [displayedImages, setDisplayedImages] = useState<ScratchcardData[]>([]);
  const [allImagesCache, setAllImagesCache] = useState<ScratchcardData[]>([]);
  const [totalStats, setTotalStats] = useState({ total: 0, stats: {} as Record<string, number>, categoryStats: { scratch: 0, lottery: 0 }, countryStats: {} as Record<string, number>, stateStats: {} as Record<string, number>, collectorStats: {} as Record<string, number> });
  const [isLoadingDB, setIsLoadingDB] = useState(true);
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false); 
  const [selectedImage, setSelectedImage] = useState<ScratchcardData | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'visitor' | null>(null);
  const isAdmin = userRole === 'admin';
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [language, setLanguage] = useState<Language>('pt');
  const t = translations[language];

  const loadInitialData = async () => {
    setIsLoadingDB(true);
    try {
      await storageService.init();
      await storageService.syncInitialItems(INITIAL_RASPADINHAS);
      const allItems = await storageService.getAll();
      setAllImagesCache(allItems);
      const freshStats = await storageService.getStats();
      setTotalStats(freshStats);
      setDisplayedImages(allItems.sort((a,b) => b.createdAt - a.createdAt));
    } catch (error) { console.error(error); }
    finally { setIsLoadingDB(false); }
  };

  useEffect(() => { loadInitialData(); }, []);

  const featuredItems = useMemo(() => allImagesCache.filter(img => img.isFeatured), [allImagesCache]);
  
  const myCollectionItems = useMemo(() => {
    if (!currentUser) return [];
    return allImagesCache.filter(img => img.owners?.includes(currentUser));
  }, [allImagesCache, currentUser]);

  const handleUpdateImage = async (updatedImage: ScratchcardData) => {
    await storageService.save(updatedImage);
    const allItems = await storageService.getAll();
    setAllImagesCache(allItems);
    setDisplayedImages(prev => prev.map(img => img.id === updatedImage.id ? updatedImage : img));
    setSelectedImage(updatedImage);
  };

  const handleDeleteImage = async (id: string) => {
    await storageService.delete(id);
    const allItems = await storageService.getAll();
    setAllImagesCache(allItems);
    setDisplayedImages(prev => prev.filter(img => img.id !== id));
    setSelectedImage(null);
  };

  const handleLoginSubmit = (username: string, pass: string | null, type: 'admin' | 'visitor'): boolean => {
    if (type === 'admin') {
       const cleanName = username.trim().toUpperCase();
       if (AUTHORIZED_ADMINS.includes(cleanName) && pass === ADMIN_PASSWORD) {
         setCurrentUser(username); setUserRole('admin'); return true;
       }
       return false;
    } else {
       setCurrentUser(username); setUserRole('visitor'); return true;
    }
  };

  // Filter images for different pages (Europe, etc)
  const filteredByPage = useMemo(() => {
    if (currentPage === 'europe') return allImagesCache.filter(i => i.continent === 'Europa');
    if (currentPage === 'america') return allImagesCache.filter(i => i.continent === 'América');
    if (currentPage === 'asia') return allImagesCache.filter(i => i.continent === 'Ásia');
    if (currentPage === 'africa') return allImagesCache.filter(i => i.continent === 'África');
    if (currentPage === 'oceania') return allImagesCache.filter(i => i.continent === 'Oceania');
    return allImagesCache;
  }, [allImagesCache, currentPage]);

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-950 text-slate-100 overflow-hidden">
      <Header 
        searchTerm={searchTerm} onSearch={setSearchTerm} onUploadClick={() => setIsUploadModalOpen(true)}
        isAdmin={isAdmin} currentUser={currentUser} onAdminToggle={() => setIsLoginModalOpen(true)}
        onLogout={() => { setCurrentUser(null); setUserRole(null); setCurrentPage('home'); }} onExport={() => {}} onExportCSV={() => {}} onImport={() => {}}
        onHistoryClick={() => setIsHistoryModalOpen(true)} language={language} setLanguage={setLanguage}
        currentPage={currentPage} onNavigate={setCurrentPage} stats={totalStats.stats} t={t.header}
      />

      <main className="flex-1 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
        
        {currentPage === 'my-collection' && (
          <div className="min-h-full p-6 animate-fade-in">
             <div className="max-w-7xl mx-auto space-y-8">
                <div className="bg-gradient-to-r from-pink-900/20 to-slate-900 border border-pink-500/20 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
                   <div className="flex items-center gap-6">
                      <div className="bg-pink-600 p-4 rounded-2xl shadow-lg shadow-pink-900/40">
                         <Heart className="w-8 h-8 text-white fill-white" />
                      </div>
                      <div>
                         <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">Álbum de Colecionador</h2>
                         <p className="text-pink-400 font-bold text-sm uppercase tracking-widest">{currentUser}</p>
                      </div>
                   </div>
                   <div className="bg-slate-800/80 backdrop-blur px-6 py-3 rounded-2xl border border-slate-700 text-center">
                      <span className="text-3xl font-black text-white block leading-none">{myCollectionItems.length}</span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Itens na Pasta</span>
                   </div>
                </div>

                {myCollectionItems.length === 0 ? (
                  <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/30">
                     <Heart className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                     <h3 className="text-white font-bold text-xl mb-2">{t.grid.emptyCollection}</h3>
                     <p className="text-slate-500 max-w-sm mx-auto">{t.grid.emptyCollectionDesc}</p>
                     <button onClick={() => setCurrentPage('home')} className="mt-6 px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all border border-slate-700">Explorar o Arquivo</button>
                  </div>
                ) : (
                  <ImageGrid 
                    images={myCollectionItems} onImageClick={setSelectedImage} viewMode={viewMode}
                    onViewModeChange={setViewMode} isAdmin={isAdmin} currentUser={currentUser} 
                    activeCategory="all" t={t.grid}
                  />
                )}
             </div>
          </div>
        )}

        {currentPage === 'showcase' && (
          <div className="min-h-full p-6 md:p-12 animate-fade-in">
             <div className="max-w-7xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                   <div className="inline-flex items-center gap-2 bg-amber-900/30 border border-amber-500/30 px-4 py-1.5 rounded-full text-amber-400 text-sm font-bold uppercase tracking-[0.2em] animate-pulse">
                      <StarFull className="w-4 h-4 fill-amber-500" />
                      Peças de Museu
                   </div>
                   <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase">Montra Digital</h1>
                   <p className="text-slate-400 max-w-2xl mx-auto">As joias mais raras e especiais do Arquivo Mundial.</p>
                </div>

                {featuredItems.length === 0 ? (
                  <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl">
                     <LayoutTemplate className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                     <p className="text-slate-500">A montra está vazia.</p>
                  </div>
                ) : (
                  <ImageGrid 
                    images={featuredItems} onImageClick={setSelectedImage} viewMode={viewMode}
                    onViewModeChange={setViewMode} isAdmin={isAdmin} currentUser={currentUser} 
                    activeCategory="all" t={t.grid}
                  />
                )}
             </div>
          </div>
        )}

        {(currentPage === 'home' || ['europe', 'america', 'asia', 'africa', 'oceania'].includes(currentPage)) && (
           <div className="animate-fade-in">
              {currentPage === 'home' && featuredItems.length > 0 && (
                <div className="bg-slate-900/50 border-b border-slate-800 p-4 md:p-8 overflow-hidden">
                   <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-6">
                      <div className="shrink-0 text-center md:text-left">
                         <h2 className="text-amber-500 font-black text-xl md:text-2xl uppercase tracking-tighter leading-none mb-1">Destaques</h2>
                         <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Montra Digital</p>
                      </div>
                      <div className="flex-1 overflow-x-auto scrollbar-hide flex gap-4 pb-2">
                         {featuredItems.slice(0, 10).map(item => (
                            <div key={item.id} onClick={() => setSelectedImage(item)} className="h-24 w-24 md:h-32 md:w-32 bg-black rounded-xl border border-amber-500/20 shrink-0 cursor-pointer hover:scale-105 transition-transform p-2 flex items-center justify-center shadow-lg">
                               <img src={item.frontUrl} className="max-w-full max-h-full object-contain" />
                            </div>
                         ))}
                      </div>
                      <button onClick={() => setCurrentPage('showcase')} className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/20 hover:bg-amber-500 hover:text-black transition-all">VER MONTRA COMPLETA</button>
                   </div>
                </div>
              )}

              <div className="max-w-7xl mx-auto p-6 space-y-8">
                 <ImageGrid 
                    images={filteredByPage.filter(i => searchTerm ? i.gameName.toLowerCase().includes(searchTerm.toLowerCase()) || i.country.toLowerCase().includes(searchTerm.toLowerCase()) : true)} 
                    onImageClick={setSelectedImage} viewMode={viewMode}
                    onViewModeChange={setViewMode} isAdmin={isAdmin} currentUser={currentUser} 
                    activeCategory="all" t={t.grid}
                 />
              </div>
           </div>
        )}

        {currentPage === 'stats' && <StatsSection stats={totalStats.stats} categoryStats={totalStats.categoryStats} countryStats={totalStats.countryStats} stateStats={totalStats.stateStats} collectorStats={totalStats.collectorStats} totalRecords={totalStats.total} t={t.stats} />}
        {currentPage === 'about' && <AboutPage t={t} />}

      </main>

      {selectedImage && (
        <ImageViewer 
          image={selectedImage} onClose={() => setSelectedImage(null)}
          onUpdate={handleUpdateImage} onDelete={handleDeleteImage}
          isAdmin={isAdmin} currentUser={currentUser} contextImages={allImagesCache}
          onImageSelect={setSelectedImage} t={t.viewer}
        />
      )}

      {isLoginModalOpen && <LoginModal onClose={() => setIsLoginModalOpen(false)} onLogin={handleLoginSubmit} t={t.login} />}
      {isUploadModalOpen && <UploadModal onClose={() => setIsUploadModalOpen(false)} onUploadComplete={loadInitialData} existingImages={[]} initialFile={null} currentUser={currentUser} t={t.upload} />}
    </div>
  );
}

export default App;