
import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { ImageGrid } from './components/ImageGrid';
import { ImageViewer } from './components/ImageViewer';
import { UploadModal } from './components/UploadModal';
import { LoginModal } from './components/LoginModal';
import { StatsSection } from './components/StatsSection';
import { WorldMap } from './components/WorldMap';
import { HistoryModal } from './components/HistoryModal';
import { WebsitesModal } from './components/WebsitesModal';
import { AboutPage } from './components/AboutPage';
import { CategoryManager } from './components/CategoryManager';
import { DivineSignal, Signal } from './components/DivineSignal';
import { ChloeRaffle } from './components/ChloeRaffle';
import { Footer } from './components/Footer';
import { storageService } from './services/storage';
import { ScratchcardData, CategoryItem, SiteMetadata, Continent } from './types';
import { translations, Language } from './translations';

const App: React.FC = () => {
  // Estados de Dados
  const [images, setImages] = useState<ScratchcardData[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [siteMetadata, setSiteMetadata] = useState<SiteMetadata | null>(null);
  
  // Estados de UI/Navegação
  const [currentPage, setCurrentPage] = useState<'home' | 'stats' | 'map' | 'about' | 'new-arrivals'>('home');
  const [language, setLanguage] = useState<Language>('pt');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeContinent, setActiveContinent] = useState<Continent | 'Mundo'>('Mundo');
  const [activeCountry, setActiveCountry] = useState<string>('');
  
  // Estados de Modais
  const [selectedImage, setSelectedImage] = useState<ScratchcardData | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showWebsites, setShowWebsites] = useState(false);
  const [showCatManager, setShowCatManager] = useState(false);
  const [raffleItem, setRaffleItem] = useState<ScratchcardData | null>(null);
  
  // Estados de Autenticação
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(localStorage.getItem('archive_user'));

  // Sinais e Notificações
  const [signals, setSignals] = useState<Signal[]>([]);

  const t = translations[language];

  useEffect(() => {
    const init = async () => {
      await storageService.init();
      const allImages = await storageService.getAll();
      const allCats = await storageService.getCategories();
      const meta = await storageService.getSiteMetadata();
      
      setImages(allImages);
      setCategories(allCats);
      setSiteMetadata(meta);

      // Lógica de sorteio diário (uma vez por sessão)
      if (allImages.length > 5 && !sessionStorage.getItem('chloe_raffle_done')) {
        const randomItem = allImages[Math.floor(Math.random() * allImages.length)];
        setTimeout(() => {
          setRaffleItem(randomItem);
          sessionStorage.setItem('chloe_raffle_done', 'true');
        }, 3000);
      }
    };
    init();
  }, []);

  const addSignal = (message: string, type: Signal['type'] = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setSignals(prev => [...prev, { id, message, type }]);
  };

  const handleLogin = (user: string, pass: string | null, type: 'admin' | 'visitor') => {
    if (type === 'admin') {
      if (pass === '123456') { // Senha padrão do vovô
        setIsAdmin(true);
        setCurrentUser(user);
        localStorage.setItem('archive_user', user);
        addSignal(`Bem-vindo, Comandante ${user}! hihi!`, 'divine');
        return true;
      }
      return false;
    } else {
      setCurrentUser(user);
      localStorage.setItem('archive_user', user);
      addSignal(`Olá, ${user}! Bom ver-te no arquivo! hihi!`, 'success');
      return true;
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setCurrentUser(null);
    localStorage.removeItem('archive_user');
    addSignal("Até à próxima, vovô! hihi!");
  };

  const filteredImages = useMemo(() => {
    return images.filter(img => {
      const matchesSearch = img.gameName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          img.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          img.gameNumber.includes(searchTerm);
      const matchesContinent = activeContinent === 'Mundo' || img.continent === activeContinent;
      const matchesCountry = !activeCountry || img.country === activeCountry;
      
      return matchesSearch && matchesContinent && matchesCountry;
    });
  }, [images, searchTerm, activeContinent, activeCountry]);

  const stats = useMemo(() => {
    const res: any = { Europa: 0, América: 0, Ásia: 0, África: 0, Oceania: 0 };
    images.forEach(img => { if(res[img.continent] !== undefined) res[img.continent]++; });
    return res;
  }, [images]);

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
        onRadioClick={() => addSignal("A Chloe está a sintonizar... Use o menu lateral! hihi!")} // Placeholder para simplicidade
        onExport={async () => {
          const data = await storageService.exportData();
          const blob = new Blob([data], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `arquivo-dna-${new Date().toISOString().split('T')[0]}.json`;
          a.click();
          addSignal("DNA do Arquivo exportado com sucesso!", "divine");
        }}
        onImport={(file) => {
          const reader = new FileReader();
          reader.onload = async (e) => {
            const count = await storageService.importData(e.target?.result as string);
            const all = await storageService.getAll();
            setImages(all);
            addSignal(`${count} itens integrados no arquivo! hihi!`, "success");
          };
          reader.readAsText(file);
        }}
        t={t.header}
        recentCount={images.filter(img => (Date.now() - img.createdAt) < 86400000).length}
        onCountrySelect={(cont, country) => {
          setActiveContinent(cont);
          setActiveCountry(country);
          setCurrentPage('home');
        }}
        onExportCSV={() => {}}
        onExportTXT={() => {}}
      />

      <main className="flex-1 flex flex-col">
        {currentPage === 'home' && (
          <div className="p-4 md:p-8 space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-900 pb-6">
              <div className="relative w-full max-w-2xl group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-brand-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Pesquisar por nome, número ou país..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm focus:border-brand-500 outline-none transition-all shadow-inner"
                />
              </div>
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <button onClick={() => setShowUpload(true)} className="bg-brand-500 hover:bg-brand-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-xl shadow-brand-500/20 active:scale-95">
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
            stats={stats}
            categoryStats={{ 
              scratch: images.filter(i => i.category === 'raspadinha').length,
              lottery: images.filter(i => i.category === 'lotaria').length
            }}
            countryStats={images.reduce((acc: any, img) => {
              acc[img.country] = (acc[img.country] || 0) + 1;
              return acc;
            }, {})}
            stateStats={images.reduce((acc: any, img) => {
              acc[img.state] = (acc[img.state] || 0) + 1;
              return acc;
            }, {})}
            collectorStats={images.reduce((acc: any, img) => {
              const c = img.collector || 'Geral';
              acc[c] = (acc[c] || 0) + 1;
              return acc;
            }, {})}
            totalRecords={images.length}
            t={t.stats}
            currentUser={currentUser}
          />
        )}

        {currentPage === 'map' && (
          <div className="p-8 h-full">
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
            isAdmin={isAdmin}
            t={t.about}
            founderBio={siteMetadata?.founderBio}
            founderPhoto={siteMetadata?.founderPhotoUrl}
            founderQuote={siteMetadata?.founderQuote}
            milestones={siteMetadata?.milestones}
            onUpdateMetadata={async (data) => {
              const newMeta = { ...siteMetadata, ...data, id: 'site_settings' };
              await storageService.saveSiteMetadata(newMeta);
              setSiteMetadata(newMeta);
              addSignal("História do Guardião atualizada!", "success");
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
            addSignal("Registo atualizado!", "info");
          }}
          onDelete={async (id) => {
            await storageService.delete(id);
            setImages(images.filter(img => img.id !== id));
            setSelectedImage(null);
            addSignal("Item removido do arquivo.", "warning");
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
          onLogin={handleLogin}
          t={t.login}
        />
      )}

      {showHistory && (
        <HistoryModal 
          onClose={() => setShowHistory(false)}
          isAdmin={isAdmin}
          t={t.header}
        />
      )}

      {showWebsites && (
        <WebsitesModal 
          onClose={() => setShowWebsites(false)}
          isAdmin={isAdmin}
          t={t.header}
        />
      )}

      {raffleItem && (
        <ChloeRaffle 
          item={raffleItem}
          onClose={() => setRaffleItem(null)}
          onViewItem={(item) => {
            setSelectedImage(item);
            setRaffleItem(null);
          }}
        />
      )}

      <DivineSignal signals={signals} onRemove={(id) => setSignals(s => s.filter(sig => sig.id !== id))} />
    </div>
  );
};

export default App;
