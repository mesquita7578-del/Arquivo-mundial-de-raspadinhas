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
import { Globe, Ticket, Coins, Heart, BarChart2, User, Loader2, Sparkles, AlertCircle } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false); 
  const [isWebsitesModalOpen, setIsWebsitesModalOpen] = useState(false); 
  const [selectedImage, setSelectedImage] = useState<ScratchcardData | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'visitor' | null>(null);
  const isAdmin = userRole === 'admin';
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
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

  const handleExportJSON = async () => {
    const data = await storageService.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-arquivo-mundial-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Nome", "Numero", "Pais", "Estado", "Ano", "Preco", "Colecionador"];
    const rows = allImagesCache.map(i => [i.customId, i.gameName, i.gameNumber, i.country, i.state, i.releaseDate, i.price || '', i.collector || '']);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lista-arquivo-mundial.csv`;
    a.click();
  };

  const handleExportTXT = () => {
    const text = allImagesCache.map(i => `${i.customId} - ${i.gameName} (${i.country}) - ${i.state}`).join("\n");
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `checklist-arquivo.txt`;
    a.click();
  };

  const handleImportJSON = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const count = await storageService.importData(e.target?.result as string);
        alert(`${count} registos restaurados com sucesso!`);
        loadData();
      } catch (err) { alert("Erro ao importar ficheiro."); }
    };
    reader.readAsText(file);
  };

  const handleUpdateImage = async (updatedImage: ScratchcardData) => {
    await storageService.save(updatedImage);
    const allItems = await storageService.getAll();
    setAllImagesCache(allItems);
    const stats = await storageService.getStats();
    setTotalStats(stats);
  };

  const handleDeleteImage = async (id: string) => {
    await storageService.delete(id);
    const allItems = await storageService.getAll();
    setAllImagesCache(allItems);
    const stats = await storageService.getStats();
    setTotalStats(stats);
    setSelectedImage(null);
  };

  const filteredByPage = useMemo(() => {
    if (currentPage === 'europe') return allImagesCache.filter(i => i.continent === 'Europa');
    if (currentPage === 'america') return allImagesCache.filter(i => i.continent === 'América');
    if (currentPage === 'asia') return allImagesCache.filter(i => i.continent === 'Ásia');
    if (currentPage === 'africa') return allImagesCache.filter(i => i.continent === 'África');
    if (currentPage === 'oceania') return allImagesCache.filter(i => i.continent === 'Oceania');
    if (currentPage === 'my-collection' && currentUser) return allImagesCache.filter(i => i.owners?.includes(currentUser));
    if (currentPage === 'showcase') return allImagesCache.filter(i => i.isFeatured);
    return allImagesCache;
  }, [allImagesCache, currentPage, currentUser]);

  const finalFilteredImages = useMemo(() => {
    return filteredByPage.filter(i => {
       if (!searchTerm) return true;
       const term = searchTerm.toLowerCase();
       return i.gameName.toLowerCase().includes(term) || 
              i.country.toLowerCase().includes(term) || 
              i.gameNumber.toLowerCase().includes(term) ||
              i.customId.toLowerCase().includes(term);
    }).sort((a,b) => b.createdAt - a.createdAt);
  }, [filteredByPage, searchTerm]);

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-950 text-slate-100 overflow-hidden">
      <Header 
        searchTerm={searchTerm} onSearch={setSearchTerm} onUploadClick={() => setIsUploadModalOpen(true)}
        isAdmin={isAdmin} currentUser={currentUser} onAdminToggle={() => setIsLoginModalOpen(true)}
        onLogout={() => { setCurrentUser(null); setUserRole(null); setCurrentPage('home'); }} 
        onExport={handleExportJSON} onExportCSV={handleExportCSV} onExportTXT={handleExportTXT}
        onImport={handleImportJSON} onHistoryClick={() => setIsHistoryModalOpen(true)} 
        onWebsitesClick={() => setIsWebsitesModalOpen(true)}
        language={language} setLanguage={setLanguage}
        currentPage={currentPage} onNavigate={setCurrentPage} stats={totalStats.stats} t={t.header}
      />

      <main className="flex-1 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
        {isLoadingDB ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
             <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
             <p className="text-slate-500 font-bold uppercase tracking-widest animate-pulse">A carregar registos do Arquivo...</p>
          </div>
        ) : (
          <div className="animate-fade-in">
             {currentPage === 'home' && !searchTerm && (
                <div className="bg-slate-900/50 border-b border-slate-800 p-6">
                   <div className="max-w-7xl mx-auto flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="bg-brand-500/10 p-3 rounded-2xl border border-brand-500/20">
                            <Sparkles className="w-6 h-6 text-brand-400" />
                         </div>
                         <div>
                            <h2 className="text-xl font-black text-white uppercase italic">Base de Dados Viva</h2>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{totalStats.total} Itens Catalogados Mundialmente</p>
                         </div>
                      </div>
                      <div className="hidden md:flex items-center gap-6">
                         <div className="text-right">
                            <p className="text-[10px] text-slate-500 font-black uppercase">Europa</p>
                            <p className="text-lg font-black text-white">{totalStats.stats['Europa'] || 0}</p>
                         </div>
                         <div className="text-right">
                            <p className="text-[10px] text-slate-500 font-black uppercase">América</p>
                            <p className="text-lg font-black text-white">{totalStats.stats['América'] || 0}</p>
                         </div>
                      </div>
                   </div>
                </div>
             )}
             
             <div className="max-w-7xl mx-auto p-4 md:p-8">
                <ImageGrid 
                  images={finalFilteredImages} onImageClick={setSelectedImage} viewMode={viewMode}
                  onViewModeChange={setViewMode} isAdmin={isAdmin} currentUser={currentUser} 
                  activeCategory="all" t={t.grid}
                />
             </div>
          </div>
        )}

        {currentPage === 'stats' && <StatsSection stats={totalStats.stats} categoryStats={totalStats.categoryStats} countryStats={totalStats.countryStats} stateStats={totalStats.stateStats} collectorStats={totalStats.collectorStats} totalRecords={totalStats.total} t={t.stats} />}
      </main>

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

export default App;