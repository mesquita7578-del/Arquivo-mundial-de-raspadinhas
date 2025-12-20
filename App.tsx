
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, Plus, Loader2, Sparkles, Zap, LayoutGrid, Trophy, Star, 
  Ticket, Layers, Box, MapPin, X, Diamond, Crown, CheckCircle2, Users, Clock, ChevronDown, ChevronRight,
  Ship, Landmark, Flag
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
import { VisitorsModal } from './components/VisitorsModal';
import { Footer } from './components/Footer';
import { storageService } from './services/storage';
import { ScratchcardData, CategoryItem, SiteMetadata, Continent, VisitorEntry } from './types';
import { translations, Language } from './translations';
import { DivineSignal, Signal } from './components/DivineSignal';

const chloeChannel = new BroadcastChannel('chloe_archive_sync');

const App: React.FC = () => {
  const [images, setImages] = useState<ScratchcardData[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [siteMetadata, setSiteMetadata] = useState<SiteMetadata | null>(null);
  
  const [currentPage, setCurrentPage] = useState<'home' | 'stats' | 'map' | 'about' | 'new-arrivals' | 'collection'>('home');
  const [language, setLanguage] = useState<Language>('pt');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeContinent, setActiveContinent] = useState<Continent | 'Mundo'>('Mundo');
  const [activeCountry, setActiveCountry] = useState<string>(''); 
  const [activeSubRegion, setActiveSubRegion] = useState<string>(''); 
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showRaritiesOnly, setShowRaritiesOnly] = useState(false);
  const [showWinnersOnly, setShowWinnersOnly] = useState(false);
  const [showNewOnly, setShowNewOnly] = useState(false);
  const [showNewSubmenu, setShowNewSubmenu] = useState(false);
  const [activeNewCountrySub, setActiveNewCountrySub] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedImage, setSelectedImage] = useState<ScratchcardData | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showWebsites, setShowWebsites] = useState(false);
  const [showRadio, setShowRadio] = useState(false);
  const [showVisitors, setShowVisitors] = useState(false);
  
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('archive_admin') === 'true');
  const [currentUser, setCurrentUser] = useState<string | null>(localStorage.getItem('archive_user'));
  const [signals, setSignals] = useState<Signal[]>([]);

  const newSubmenuRef = useRef<HTMLDivElement>(null);

  const t = translations[language] || translations['pt'];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (newSubmenuRef.current && !newSubmenuRef.current.contains(event.target as Node)) {
        setShowNewSubmenu(false);
        setActiveNewCountrySub(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    chloeChannel.onmessage = (event) => {
      if (event.data.type === 'SYNC_METADATA') {
        setSiteMetadata(event.data.payload);
      }
    };
    return () => chloeChannel.close;
  }, []);

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
        
        const updatedMeta = {
           ...meta,
           visitorCount: (meta.visitorCount || 0) + 1,
        };
        setSiteMetadata(updatedMeta);
        await storageService.saveSiteMetadata(updatedMeta);
        
        chloeChannel.postMessage({ type: 'SYNC_METADATA', payload: updatedMeta });

        if (currentUser) {
           recordVisitor(currentUser, isAdmin, updatedMeta);
        }

      } catch (err) {
        console.error("Erro no carregamento do Arquivo:", err);
      } finally {
        setTimeout(() => setIsLoading(false), 800);
      }
    };
    init();
  }, []);

  const recordVisitor = async (name: string, isAdm: boolean, currentMeta?: SiteMetadata) => {
    const meta = currentMeta || siteMetadata;
    if (!meta) return;

    let location = 'Local Desconhecido';
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      if (data.city && data.country_name) {
        location = `${data.city}, ${data.country_name}`;
      }
    } catch (e) {
      console.log("Localização indisponível hihi!");
    }

    const newEntry: VisitorEntry = {
      name,
      isAdmin: isAdm,
      timestamp: Date.now(),
      location
    };

    const log = meta.visitorLog || [];
    const updatedLog = [newEntry, ...log].slice(0, 50);
    
    const updatedMeta = { ...meta, visitorLog: updatedLog };
    setSiteMetadata(updatedMeta);
    await storageService.saveSiteMetadata(updatedMeta);
    
    chloeChannel.postMessage({ type: 'SYNC_METADATA', payload: updatedMeta });
  };

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
    if (currentPage === 'collection') setCurrentPage('home');
  };

  const filteredImages = useMemo(() => {
    if (!images) return [];
    return images.filter(img => {
      const gName = (img.gameName || "").toLowerCase();
      const gCountry = (img.country || "").toLowerCase();
      const gIsland = (img.island || "").toLowerCase();
      const gRegion = (img.region || "").toLowerCase();
      const gSub = (img.subRegion || "").toLowerCase();
      const gNum = (img.gameNumber || "").toLowerCase();
      const s = searchTerm.toLowerCase();
      
      const isRecent = (Date.now() - (img.createdAt || 0)) < 86400000;
      
      const matchesSearch = gName.includes(s) || gCountry.includes(s) || gIsland.includes(s) || gNum.includes(s) || gRegion.includes(s);
      const matchesContinent = activeContinent === 'Mundo' || img.continent === activeContinent;
      
      let matchesLocation = true;
      if (activeCountry) {
        const countryMatch = gCountry === activeCountry.toLowerCase();
        
        if (activeSubRegion) {
          const sub = activeSubRegion.toLowerCase();
          if (activeCountry.toLowerCase() === 'portugal' && sub === 'continente') {
            matchesLocation = countryMatch && !img.island;
          } 
          else {
            matchesLocation = countryMatch && (gSub === sub || gIsland === sub || gRegion === sub || (img.operator && img.operator.toLowerCase().includes(sub)));
          }
        } else {
          matchesLocation = countryMatch;
        }
      }

      const matchesCategory = activeCategory === 'all' || img.category === activeCategory;
      const matchesRarity = !showRaritiesOnly || img.isRarity;
      const matchesWinners = !showWinnersOnly || img.isWinner;
      const matchesNew = !showNewOnly || isRecent;
      
      if (currentPage === 'collection') if (!currentUser || !img.owners?.includes(currentUser)) return false;
      
      return matchesSearch && matchesContinent && matchesLocation && matchesCategory && matchesRarity && matchesWinners && matchesNew;
    });
  }, [images, searchTerm, activeContinent, activeCountry, activeSubRegion, activeCategory, showRaritiesOnly, showWinnersOnly, showNewOnly, currentPage, currentUser]);

  const newsDetailed = useMemo(() => {
    const threshold = Date.now() - 86400000;
    const newItems = images.filter(img => (img.createdAt || 0) > threshold);
    
    const countrySet = new Set<string>();
    newItems.forEach(img => countrySet.add(img.country));

    return {
      countries: Array.from(countrySet).sort(),
      getNewsFor: (country: string) => {
        const countryNews = newItems.filter(i => i.country === country);
        return {
          total: countryNews.length,
          subs: countryNews.reduce((acc, curr) => {
            const label = curr.island || curr.subRegion || curr.region || 'Geral';
            acc[label] = (acc[label] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        };
      }
    };
  }, [images]);

  const collectionCount = useMemo(() => {
    if (!currentUser) return 0;
    return images.filter(img => img.owners?.includes(currentUser)).length;
  }, [images, currentUser]);

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
    const content = images.map(img => `${img.gameNumber} - ${img.gameName} (${img.island || img.country})`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `checklist-arquivo-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    addSignal("Checklist gerada com sucesso! hihi!", "success");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-100 pt-24 md:pt-28">
      <Header 
        isAdmin={isAdmin}
        currentUser={currentUser}
        language={language}
        setLanguage={setLanguage}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onAdminToggle={() => setShowLogin(true)}
        onLogout={handleLogout}
        onHistoryClick={() => setShowHistory(false)}
        onRadioClick={() => setShowRadio(true)}
        onExport={handleExport}
        onImport={handleImport}
        onExportTXT={handleExportTXT}
        onExportCSV={() => {}}
        t={t.header}
        recentCount={images.filter(img => (Date.now() - (img.createdAt || 0)) < 43200000).length}
        collectionCount={collectionCount}
        onCountrySelect={(cont, loc, sub) => {
          setActiveContinent(cont);
          setActiveCountry(loc);
          setActiveSubRegion(sub || '');
          setCurrentPage('home');
          setShowNewOnly(false);
        }}
        countriesByContinent={images.reduce((acc, img) => {
          if (!acc[img.continent]) acc[img.continent] = [];
          if (!acc[img.continent].includes(img.country)) acc[img.continent].push(img.country);
          return acc;
        }, {} as any)}
      />

      {(currentPage === 'home' || currentPage === 'collection') && (
        <div className="bg-[#020617]/40 backdrop-blur-3xl sticky top-[68px] md:top-[74px] z-[90] px-4 md:px-10 py-1 border-b border-white/5 shadow-xl transition-all">
          <div className="max-w-[1800px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-1 md:gap-3">
            
            <div className="flex flex-wrap items-center justify-center gap-1 md:gap-1.5">
               <div className="flex items-center gap-1 border-r border-white/10 pr-1 mr-0.5">
                 <button 
                   onClick={() => { setShowRaritiesOnly(!showRaritiesOnly); setActiveCategory('all'); setActiveCountry(''); setActiveSubRegion(''); }} 
                   className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${showRaritiesOnly ? 'bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-slate-900/40 border border-white/5 text-slate-500 hover:text-amber-400'}`}
                 >
                   <Diamond className="w-3 h-3" /> Raridades
                 </button>
                 <button 
                   onClick={() => { setShowWinnersOnly(!showWinnersOnly); setActiveCategory('all'); setActiveCountry(''); setActiveSubRegion(''); }} 
                   className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${showWinnersOnly ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-slate-900/40 border border-white/5 text-slate-500 hover:text-emerald-400'}`}
                 >
                   <Trophy className="w-3 h-3" /> Premiadas
                 </button>
               </div>

               <div className="flex items-center gap-1 py-1">
                  {[
                    { id: 'all', label: 'Tudo', icon: LayoutGrid },
                    { id: 'raspadinha', label: 'Raspadinhas', icon: Ticket },
                    { id: 'lotaria', label: 'Lotarias', icon: Star },
                    { id: 'boletim', label: 'Boletins', icon: Layers },
                    { id: 'objeto', label: 'Objetos', icon: Box },
                  ].map(cat => (
                    <button 
                      key={cat.id} 
                      onClick={() => { setActiveCategory(cat.id); setShowRaritiesOnly(false); setShowWinnersOnly(false); setShowNewOnly(false); setActiveCountry(''); setActiveSubRegion(''); }} 
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${activeCategory === cat.id ? 'bg-brand-600 text-white border border-brand-400/30' : 'bg-slate-900/40 border border-white/5 text-slate-500 hover:text-brand-400'}`}
                    >
                      <cat.icon className="w-3 h-3" /> {cat.label}
                    </button>
                  ))}
                  
                  <div className="relative" ref={newSubmenuRef}>
                    <button 
                      onClick={() => { setShowNewOnly(!showNewOnly); setShowRaritiesOnly(false); setShowWinnersOnly(false); setActiveCategory('all'); setActiveCountry(''); setActiveSubRegion(''); }} 
                      onMouseEnter={() => setShowNewSubmenu(true)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ml-0.5 ${showNewOnly || showNewSubmenu ? 'bg-pink-600 text-white shadow-[0_0_15px_rgba(219,39,119,0.5)] border border-pink-400/30' : 'bg-slate-900/40 border border-white/5 text-slate-500 hover:text-pink-400'}`}
                    >
                      <Clock className="w-3 h-3" /> Novas Entradas
                      {newsDetailed.countries.length > 0 && <ChevronDown className={`w-2.5 h-2.5 transition-transform ${showNewSubmenu ? 'rotate-180' : ''}`} />}
                    </button>

                    {showNewSubmenu && newsDetailed.countries.length > 0 && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 flex z-[100] animate-bounce-in">
                        <div className="w-44 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-1.5 backdrop-blur-3xl h-fit">
                           <div className="text-[7px] font-black text-slate-500 uppercase tracking-[0.2em] px-2 py-1.5 border-b border-white/5 mb-1 flex items-center gap-2">
                             <Sparkles className="w-2.5 h-2.5 text-pink-500" /> Países
                           </div>
                           {newsDetailed.countries.map(country => (
                             <button
                               key={country}
                               onMouseEnter={() => setActiveNewCountrySub(country)}
                               onClick={() => {
                                 setActiveCountry(country);
                                 setActiveSubRegion('');
                                 setShowNewOnly(true);
                                 setShowNewSubmenu(false);
                                 setCurrentPage('home');
                               }}
                               className={`w-full text-left px-3 py-1.5 text-[8px] rounded-lg transition-all font-black uppercase tracking-widest flex items-center justify-between group ${activeNewCountrySub === country ? 'bg-pink-600 text-white' : 'text-slate-400 hover:text-white'}`}
                             >
                               {country}
                               <ChevronRight className={`w-2.5 h-2.5 transition-opacity ${activeNewCountrySub === country ? 'opacity-100 translate-x-1' : 'opacity-0'}`} />
                             </button>
                           ))}
                        </div>

                        {activeNewCountrySub && (
                          <div className="w-48 ml-1 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-1.5 backdrop-blur-3xl animate-fade-in h-fit">
                             <div className="text-[7px] font-black text-slate-500 uppercase tracking-[0.2em] px-2 py-1.5 border-b border-white/5 mb-1 flex items-center gap-2">
                               <MapPin className="w-2.5 h-2.5 text-blue-500" /> Filtrar {activeNewCountrySub}
                             </div>
                             
                             {activeNewCountrySub === 'Portugal' && (
                               <>
                                 <button onClick={() => { setActiveCountry('Portugal'); setActiveSubRegion('continente'); setShowNewOnly(true); setShowNewSubmenu(false); }} className="w-full text-left px-3 py-2 text-[8px] text-slate-400 hover:bg-pink-600 hover:text-white rounded-lg transition-all font-black uppercase tracking-widest flex items-center gap-2">
                                    <Landmark className="w-3 h-3 text-blue-400" /> SCML (Continente)
                                 </button>
                                 <button onClick={() => { setActiveCountry('Portugal'); setActiveSubRegion('açores'); setShowNewOnly(true); setShowNewSubmenu(false); }} className="w-full text-left px-3 py-2 text-[8px] text-slate-400 hover:bg-pink-600 hover:text-white rounded-lg transition-all font-black uppercase tracking-widest flex items-center gap-2">
                                    <Ship className="w-3 h-3 text-cyan-400" /> Açores
                                 </button>
                                 <button onClick={() => { setActiveCountry('Portugal'); setActiveSubRegion('madeira'); setShowNewOnly(true); setShowNewSubmenu(false); }} className="w-full text-left px-3 py-2 text-[8px] text-slate-400 hover:bg-pink-600 hover:text-white rounded-lg transition-all font-black uppercase tracking-widest flex items-center gap-2">
                                    <MapPin className="w-3 h-3 text-emerald-400" /> Madeira
                                 </button>
                               </>
                             )}

                             {activeNewCountrySub === 'Espanha' && (
                               <>
                                 <button onClick={() => { setActiveCountry('Espanha'); setActiveSubRegion('nacional'); setShowNewOnly(true); setShowNewSubmenu(false); }} className="w-full text-left px-3 py-2 text-[8px] text-slate-400 hover:bg-pink-600 hover:text-white rounded-lg transition-all font-black uppercase tracking-widest flex items-center gap-2">
                                    <Landmark className="w-3 h-3 text-red-500" /> SELAE (Nacional)
                                 </button>
                                 <button onClick={() => { setActiveCountry('Espanha'); setActiveSubRegion('once'); setShowNewOnly(true); setShowNewSubmenu(false); }} className="w-full text-left px-3 py-2 text-[8px] text-slate-400 hover:bg-pink-600 hover:text-white rounded-lg transition-all font-black uppercase tracking-widest flex items-center gap-2">
                                    <Crown className="w-3 h-3 text-emerald-500" /> ONCE
                                 </button>
                                 <button onClick={() => { setActiveCountry('Espanha'); setActiveSubRegion('catalunha'); setShowNewOnly(true); setShowNewSubmenu(false); }} className="w-full text-left px-3 py-2 text-[8px] text-slate-400 hover:bg-pink-600 hover:text-white rounded-lg transition-all font-black uppercase tracking-widest flex items-center gap-2">
                                    <Flag className="w-3 h-3 text-yellow-500" /> Catalunha
                                 </button>
                               </>
                             )}

                             {activeNewCountrySub === 'Alemanha' && (
                               <>
                                 <button onClick={() => { setActiveCountry('Alemanha'); setActiveSubRegion('lotto'); setShowNewOnly(true); setShowNewSubmenu(false); }} className="w-full text-left px-3 py-2 text-[8px] text-slate-400 hover:bg-pink-600 hover:text-white rounded-lg transition-all font-black uppercase tracking-widest flex items-center gap-2">
                                    <Star className="w-3 h-3 text-blue-500" /> Lotto (Geral)
                                 </button>
                                 <button onClick={() => { setActiveCountry('Alemanha'); setActiveSubRegion('baviera'); setShowNewOnly(true); setShowNewSubmenu(false); }} className="w-full text-left px-3 py-2 text-[8px] text-slate-400 hover:bg-pink-600 hover:text-white rounded-lg transition-all font-black uppercase tracking-widest flex items-center gap-2">
                                    <MapPin className="w-3 h-3 text-blue-300" /> Baviera
                                 </button>
                               </>
                             )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-2 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-48 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600 group-focus-within:text-brand-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Pesquisar..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="w-full bg-slate-950/50 border border-white/5 rounded-full pl-8 pr-4 py-1 text-[9px] focus:border-brand-500/50 outline-none transition-all uppercase tracking-wider text-white shadow-inner"
                />
              </div>
              {isAdmin && (
                <button 
                  onClick={() => setShowUpload(true)} 
                  className="bg-emerald-600/90 hover:bg-emerald-500 text-white px-3.5 py-1 rounded-full font-black text-[8px] uppercase tracking-widest transition-all flex items-center gap-1.5 shadow-lg active:scale-95 border border-emerald-400/20 whitespace-nowrap"
                >
                  <Plus className="w-3 h-3" /> Novo Item
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col min-h-0 pb-20">
        {(currentPage === 'home' || currentPage === 'collection') && (
          <div className="p-4 md:p-8 animate-fade-in">
            <ImageGrid images={filteredImages} onImageClick={setSelectedImage} isAdmin={isAdmin} currentUser={currentUser} t={t.grid}/>
          </div>
        )}

        {currentPage === 'stats' && (
           <StatsSection 
             images={images}
             stats={images.reduce((acc, img) => { if (img.continent) acc[img.continent] = (acc[img.continent] || 0) + 1; return acc; }, {} as any)}
             categoryStats={{ scratch: images.filter(i => i.category === 'raspadinha').length, lottery: images.filter(i => i.category === 'lotaria').length }}
             countryStats={images.reduce((acc, img) => { if (img.country) acc[img.country] = (acc[img.country] || 0) + 1; return acc; }, {} as any)}
             stateStats={images.reduce((acc, img) => { if (img.state) acc[img.state] = (acc[img.state] || 0) + 1; return acc; }, {} as any)}
             collectorStats={images.reduce((acc, img) => { const c = img.collector || 'Geral'; acc[c] = (acc[c] || 0) + 1; return acc; }, {} as any)}
             totalRecords={images.length}
             t={t.stats}
             currentUser={currentUser}
           />
        )}

        {currentPage === 'map' && (
           <div className="p-10 h-full min-h-[600px]">
             <WorldMap images={images} activeContinent={activeContinent} onCountrySelect={(country) => { setActiveCountry(country); setActiveSubRegion(''); setCurrentPage('home'); }} t={t.grid} />
           </div>
        )}

        {currentPage === 'about' && (
          <AboutPage 
            t={t.about} isAdmin={isAdmin} founderPhoto={siteMetadata?.founderPhotoUrl} founderBio={siteMetadata?.founderBio} founderQuote={siteMetadata?.founderQuote} milestones={siteMetadata?.milestones}
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
        onRadioClick={() => setShowRadio(true)}
        visitorCount={siteMetadata?.visitorCount}
        onVisitorsClick={() => setShowVisitors(true)}
      />

      {showUpload && (
        <UploadModal 
          onClose={() => setShowUpload(false)}
          onUploadComplete={(data) => {
            setImages([data, ...images]);
            addSignal(`${data.gameName} arquivado! hihi!`, 'success');
          }}
          existingImages={images} initialFile={null} currentUser={currentUser} t={t.upload} categories={categories}
        />
      )}

      {selectedImage && (
        <ImageViewer 
          image={selectedImage} onClose={() => setSelectedImage(null)}
          onUpdate={async (data) => { await storageService.save(data); setImages(images.map(img => img.id === data.id ? data : img)); setSelectedImage(data); addSignal("Registo atualizado! hihi!", "info"); }}
          onDelete={async (id) => { await storageService.delete(id); setImages(images.filter(img => img.id !== id)); setSelectedImage(null); addSignal("Item removido.", "warning"); }}
          isAdmin={isAdmin} currentUser={currentUser} contextImages={images} onImageSelect={setSelectedImage} t={t.viewer} categories={categories}
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
              recordVisitor(u, true);
              addSignal(`Bem-vindo, Comandante ${u}! hihi!`, 'divine');
              return true;
            } else if (type === 'visitor') {
              setCurrentUser(u);
              localStorage.setItem('archive_user', u);
              localStorage.setItem('archive_admin', 'false');
              recordVisitor(u, false);
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
      {showVisitors && <VisitorsModal onClose={() => setShowVisitors(false)} visitors={siteMetadata?.visitorLog || []} totalCount={siteMetadata?.visitorCount || 0} />}

      <DivineSignal signals={signals} onRemove={(id) => setSignals(s => s.filter(sig => sig.id !== id))} />
    </div>
  );
};

export default App;
