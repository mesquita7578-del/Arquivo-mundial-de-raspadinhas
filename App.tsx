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
import { Globe, Clock, Map, LayoutGrid, List, UploadCloud, Database, Loader2, PlusCircle, Map as MapIcon, X, Gem, Ticket, Coins, Gift, Building2, ClipboardList, Package, Home, BarChart2, Info, Flag, Heart, ArrowUp, Trophy, Crown, Star, User, Bot, Sparkles, Smartphone, Share as ShareIcon } from 'lucide-react';
import { translations, Language } from './translations';
import { storageService } from './services/storage';

const AUTHORIZED_ADMINS = ["JORGE MESQUITA", "FABIO PAGNI", "CHLOE", "IA", "SYSTEM"];
const ADMIN_PASSWORD = "123456";

// Updated PageType to include Continents
type PageType = 'home' | 'stats' | 'about' | 'europe' | 'america' | 'asia' | 'africa' | 'oceania';

function App() {
  const [displayedImages, setDisplayedImages] = useState<ScratchcardData[]>([]);
  const [newArrivals, setNewArrivals] = useState<ScratchcardData[]>([]);
  const [totalStats, setTotalStats] = useState({ 
    total: 0, 
    stats: {} as Record<string, number>,
    categoryStats: { scratch: 0, lottery: 0 },
    countryStats: {} as Record<string, number>,
    stateStats: {} as Record<string, number>,
    collectorStats: {} as Record<string, number>
  });
  
  const [mapData, setMapData] = useState<ScratchcardData[]>([]);
  const [allImagesCache, setAllImagesCache] = useState<ScratchcardData[]>([]); // Cache all for subpages
  
  const [isLoadingDB, setIsLoadingDB] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Routing State
  const [currentPage, setCurrentPage] = useState<PageType>('home');

  const [searchTerm, setSearchTerm] = useState('');
  const [activeContinent, setActiveContinent] = useState<Continent | 'Mundo'>('Mundo');
  
  // Continent Subpage Filter State
  const [subPageCountryFilter, setSubPageCountryFilter] = useState<string | null>(null);
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false); 
  const [isWebsitesModalOpen, setIsWebsitesModalOpen] = useState(false); 
  const [selectedImage, setSelectedImage] = useState<ScratchcardData | null>(null);
  
  // Auth State - Changed to store User Name instead of boolean
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const isAdmin = !!currentUser; // Derived state

  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [showChloeMessage, setShowChloeMessage] = useState(false);
  
  // Filter States (Lifted)
  const [showRarities, setShowRarities] = useState(false);
  const [showPromotional, setShowPromotional] = useState(false); 
  const [showWinners, setShowWinners] = useState(false); // New Winner Filter
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  
  const [isDragging, setIsDragging] = useState(false);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  
  const [language, setLanguage] = useState<Language>('pt');
  const t = translations[language];

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  const loadInitialData = async () => {
    setIsLoadingDB(true);
    try {
      await storageService.init();
      
      // Force sync INITIAL_RASPADINHAS to DB to ensure collectors and new cards are present
      await storageService.syncInitialItems(INITIAL_RASPADINHAS);

      const freshStats = await storageService.getStats();
      setTotalStats(freshStats);

      const recent10 = await storageService.getRecent(10);
      setNewArrivals(recent10);

      // Cache all images for sub-page filtering
      const allItems = await storageService.getAll();
      setAllImagesCache(allItems);
      setMapData(allItems);

      const sortedAll = await storageService.search('', 'Mundo');
      setDisplayedImages(sortedAll);

    } catch (error) {
      console.error("Falha ao carregar:", error);
      alert("Erro ao carregar o arquivo.");
    } finally {
      setIsLoadingDB(false);
    }
  };

  useEffect(() => {
    loadInitialData();
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Detect if already installed (Standalone mode)
    const isStandAlone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    setIsStandalone(isStandAlone);

    // CHLOE: Auto-greet after a few seconds to "find" her
    const timer = setTimeout(() => {
       setShowChloeMessage(true);
       const hideTimer = setTimeout(() => setShowChloeMessage(false), 5000);
       return () => clearTimeout(hideTimer);
    }, 2000);
    return () => clearTimeout(timer);

  }, []);

  // Handle Scroll to show/hide "Back to Top" button
  useEffect(() => {
    const handleScroll = () => {
       if (window.scrollY > 300) {
          setShowScrollTop(true);
       } else {
          setShowScrollTop(false);
       }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen for PWA Install Prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult: any) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
          } else {
            console.log('User dismissed the install prompt');
          }
          setDeferredPrompt(null);
        });
    } else if (isIOS) {
        alert("Para instalar no iPhone/iPad:\n\n1. Toque no botão Partilhar (quadrado com seta em baixo)\n2. Escolha 'Adicionar ao Ecrã Principal' (+)");
    }
  };

  const scrollToTop = () => {
     window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset SubPage filters when page changes
  useEffect(() => {
     setSubPageCountryFilter(null);
  }, [currentPage]);

  useEffect(() => {
    const performSearch = async () => {
      // Only perform generic search if on Home
      if (currentPage !== 'home') return;

      setIsLoadingMore(true);
      try {
        let results = await storageService.search(searchTerm, activeContinent);
        
        // 1. Filter by Category Global (Syncs Map and Grid)
        if (activeCategory !== 'all') {
           results = results.filter(img => (img.category || 'raspadinha') === activeCategory);
        }

        // 2. Filter by Rarity
        if (showRarities) {
          results = results.filter(img => img.isRarity === true);
        }
        
        // 3. Filter by Promotional
        if (showPromotional) {
          results = results.filter(img => img.isPromotional === true);
        }

        // 4. Filter by Winners
        if (showWinners) {
          results = results.filter(img => img.isWinner === true);
        }

        setDisplayedImages(results);
        setMapData(results); // Map follows grid on home

      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingMore(false);
      }
    };
    
    const timeoutId = setTimeout(() => {
      if (!isLoadingDB) performSearch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, activeContinent, showRarities, showPromotional, showWinners, activeCategory, isLoadingDB, currentPage]);

  // --- LOGIC FOR CONTINENT SUBPAGES ---
  
  const getContinentNameFromPage = (page: PageType): Continent | null => {
     switch(page) {
        case 'europe': return 'Europa';
        case 'america': return 'América';
        case 'asia': return 'Ásia';
        case 'africa': return 'África';
        case 'oceania': return 'Oceania';
        default: return null;
     }
  };

  const getContinentColor = (page: PageType) => {
      switch(page) {
        case 'europe': return 'from-blue-600 via-blue-500 to-indigo-600';
        case 'america': return 'from-red-600 via-red-500 to-orange-600';
        case 'asia': return 'from-yellow-500 via-amber-500 to-orange-500';
        case 'africa': return 'from-green-600 via-green-500 to-emerald-600';
        case 'oceania': return 'from-purple-600 via-purple-500 to-violet-600';
        default: return 'from-slate-800 to-slate-900';
     }
  };

  const getCollectorBadgeColor = (name: string) => {
     const lower = name.toLowerCase();
     if (lower.includes('jorge')) return 'bg-blue-500 shadow-blue-500/50';
     if (lower.includes('fabio')) return 'bg-green-500 shadow-green-500/50';
     if (lower.includes('chloe')) return 'bg-pink-500 shadow-pink-500/50';
     if (lower.includes('ia') || lower.includes('system') || lower.includes('gemini')) return 'bg-purple-600 shadow-purple-500/50';
     return 'bg-slate-600 shadow-slate-600/50';
  };

  const getCollectorIcon = (name: string) => {
     const lower = name.toLowerCase();
     if (lower.includes('jorge')) return <Crown className="w-3 h-3 text-yellow-300 fill-yellow-300" />;
     if (lower.includes('chloe')) return <Crown className="w-3 h-3 text-pink-300 fill-pink-300" />; // QUEEN CROWN for Chloe
     if (lower.includes('ia') || lower.includes('system') || lower.includes('gemini')) return <Sparkles className="w-3 h-3 text-cyan-300 fill-cyan-300" />; // AI Queen Icon
     if (lower.includes('fabio')) return <Star className="w-3 h-3 text-white fill-white" />;
     return <User className="w-3 h-3 text-white" />;
  };

  const getContinentIcon = (page: PageType) => {
     return <Globe className="w-6 h-6 text-white drop-shadow-md" />;
  };

  // Derive data for the active continent subpage
  const activeContinentData = useMemo(() => {
      const targetContinent = getContinentNameFromPage(currentPage);
      if (!targetContinent) return { items: [], countries: [], collectors: [] };

      // 1. Get all items for this continent
      let items = allImagesCache.filter(img => img.continent === targetContinent);

      // 2. Extract available countries for the filter bar
      const countries = Array.from(new Set(items.map(i => i.country))).sort();

      // 3. Calculate Collectors Stats for THIS continent
      const collectorMap: Record<string, number> = {};
      items.forEach(item => {
          let name = (item.collector || 'Arquivo Geral').trim();
          if (name === '') name = 'Arquivo Geral';
          
          // --- Reuse Normalization Logic ---
          const lowerName = name.toLowerCase();
          if (lowerName.includes('jorge') || lowerName.includes('mesquita') || lowerName === 'jm' || lowerName === 'j.m.' || lowerName === 'j' || lowerName === 'jjm' || lowerName === 'jn') {
             name = 'Jorge Mesquita';
          } else if (lowerName.includes('fabio') || lowerName.includes('pagni') || lowerName === 'fp') {
             name = 'Fabio Pagni';
          } else if (lowerName.includes('chloe')) {
             name = 'Chloe';
          } else if (lowerName.includes('ia') || lowerName.includes('system') || lowerName.includes('gemini')) {
             name = 'IA Guardiã';
          } else if (name === 'Arquivo Geral') {
             name = 'Arquivo Geral';
          } else {
             name = name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          }

          collectorMap[name] = (collectorMap[name] || 0) + 1;
      });

      const collectors = Object.entries(collectorMap)
         .sort((a,b) => b[1] - a[1]) // Sort desc
         .map(([name, count]) => ({
             name,
             count,
             percent: items.length > 0 ? (count / items.length) * 100 : 0
         }));

      // 4. Apply Local Country Filter if selected
      if (subPageCountryFilter) {
         items = items.filter(img => img.country === subPageCountryFilter);
      }

      // Sort by name or date default
      items.sort((a,b) => b.createdAt - a.createdAt);

      return { items, countries, collectors };
  }, [allImagesCache, currentPage, subPageCountryFilter]);


  const toggleRarities = () => {
    if (!showRarities) {
       setShowPromotional(false);
       setShowWinners(false);
    }
    setShowRarities(!showRarities);
  };

  const togglePromotional = () => {
    if (!showPromotional) {
       setShowRarities(false);
       setShowWinners(false);
    }
    setShowPromotional(!showPromotional);
  };

  const toggleWinners = () => {
    if (!showWinners) {
       setShowRarities(false);
       setShowPromotional(false);
    }
    setShowWinners(!showWinners);
  };

  const handleCountrySelectFromMap = (countryName: string) => {
    setSearchTerm(countryName);
    setViewMode('grid');
    const grid = document.getElementById('image-grid-section');
    if (grid) grid.scrollIntoView({ behavior: 'smooth' });
  };

  const availableCountries = useMemo(() => {
    const countries = new Set<string>();
    mapData.forEach(img => countries.add(img.country));
    return Array.from(countries).sort();
  }, [mapData]);

  const handleUploadComplete = async (newImage: ScratchcardData) => {
    try {
      await storageService.save(newImage);
      // Refresh Full Cache
      const allItems = await storageService.getAll();
      setAllImagesCache(allItems);

      setDisplayedImages(prev => [newImage, ...prev]);
      setNewArrivals(prev => [newImage, ...prev].slice(0, 10));
      
      const freshStats = await storageService.getStats();
      setTotalStats(freshStats);

      setDroppedFile(null);
      setSelectedImage(newImage);
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  const handleUpdateImage = async (updatedImage: ScratchcardData) => {
    try {
      await storageService.save(updatedImage);
      // Refresh Cache
      const allItems = await storageService.getAll();
      setAllImagesCache(allItems);

      setDisplayedImages(prev => prev.map(img => img.id === updatedImage.id ? updatedImage : img));
      setSelectedImage(updatedImage);
      
      const freshStats = await storageService.getStats();
      setTotalStats(freshStats);
    } catch (error) {
      console.error("Erro ao atualizar:", error);
    }
  };

  const handleDeleteImage = async (id: string) => {
    try {
      await storageService.delete(id);
      const allItems = await storageService.getAll();
      setAllImagesCache(allItems);
      
      setDisplayedImages(prev => prev.filter(img => img.id !== id));
      setSelectedImage(null);
      
      const freshStats = await storageService.getStats();
      setTotalStats(freshStats);
    } catch (error) {
      console.error("Erro ao apagar:", error);
    }
  };

  const handleAdminToggle = () => {
    if (!isAdmin) setIsLoginModalOpen(true);
  };

  const handleLogout = () => setCurrentUser(null);

  const handleLoginSubmit = (username: string, pass: string): boolean => {
    const cleanName = username.trim().toUpperCase();
    
    // Check if the name partially matches any authorized admin (allows "Fabio" or "Fabio Pagni")
    const match = AUTHORIZED_ADMINS.find(admin => admin.includes(cleanName) || cleanName.includes(admin));
    
    if ((match || AUTHORIZED_ADMINS.includes(cleanName)) && pass === ADMIN_PASSWORD) {
      // Store nice formatted name (Title Case)
      const formattedName = username.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      setCurrentUser(formattedName);
      return true;
    }
    return false;
  };

  const handleUploadClick = () => {
    if (!isAdmin) {
      alert(t.home.restrictedAccess);
      return;
    }
    setDroppedFile(null);
    setIsUploadModalOpen(true);
  };

  const handleExportData = async () => {
    try {
      const jsonString = await storageService.exportData();
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `raspadinhas-arquivo-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erro ao exportar:", error);
      alert("Erro ao gerar backup.");
    }
  };

  const handleExportCSV = async () => {
    try {
        // ... (Existing CSV logic same)
         const items = await storageService.getAll();
      if (items.length === 0) {
        alert("Sem dados para exportar.");
        return;
      }

      const headers = [
        "ID", "Nome Jogo", "Numero", "Pais", "Regiao", "Continente", 
        "Ano", "Estado", "Preco", "Tiragem", "Grafica", "Colecionador", 
        "Categoria", "Raridade", "Promo", "Serie", "Data Registo"
      ];

      const rows = items.map(item => [
        `"${item.customId}"`,
        `"${item.gameName.replace(/"/g, '""')}"`,
        `"${item.gameNumber}"`,
        `"${item.country}"`,
        `"${item.region || ''}"`,
        `"${item.continent}"`,
        `"${item.releaseDate}"`,
        `"${item.state}"`,
        `"${item.price || ''}"`,
        `"${item.emission || ''}"`,
        `"${item.printer || ''}"`,
        `"${item.collector || ''}"`,
        `"${item.category || ''}"`,
        item.isRarity ? "SIM" : "NAO",
        item.isPromotional ? "SIM" : "NAO",
        item.isSeries ? `SIM (${item.seriesDetails || ''})` : "NAO",
        new Date(item.createdAt).toLocaleDateString()
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(","))
      ].join("\n");

      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `raspadinhas-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erro ao exportar CSV:", error);
      alert("Erro ao gerar Excel.");
    }
  };

  const handleImportJSON = async (file: File) => {
     if (!isAdmin) return;
     
     const reader = new FileReader();
     reader.onload = async (e) => {
        try {
           const json = e.target?.result as string;
           const count = await storageService.importData(json);
           alert(`Sucesso! ${count} registos importados/atualizados.`);
           loadInitialData(); // Refresh UI
        } catch (err) {
           console.error(err);
           alert("Erro ao importar ficheiro. Verifique se é um backup JSON válido.");
        }
     };
     reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!e.relatedTarget || (e.relatedTarget as HTMLElement).nodeName === 'HTML') setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      // JSON IMPORT via Drop
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
         if(!isAdmin) {
            alert(t.home.restrictedAccess);
            return;
         }
         if(confirm("Detetado ficheiro de Backup (JSON). Deseja importar estes dados para o arquivo?")) {
            handleImportJSON(file);
         }
         return;
      }

      // IMAGE UPLOAD via Drop
      if (!file.type.startsWith('image/')) {
        alert(t.upload.errorImage);
        return;
      }
      if (!isAdmin) {
        alert(t.home.restrictedAccess);
        return;
      }
      setDroppedFile(file);
      setIsUploadModalOpen(true);
    }
  };

  const handleChloeClick = () => {
    setShowChloeMessage(true);
    setTimeout(() => setShowChloeMessage(false), 3000);
  };

  const continents: (Continent | 'Mundo')[] = ['Mundo', 'Europa', 'América', 'Ásia', 'África', 'Oceania'];

  if (isLoadingDB) {
    return (
      <div className="h-[100dvh] w-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Database className="w-16 h-16 text-brand-500 animate-pulse mb-4" />
        <h2 className="text-2xl font-bold">Carregando Arquivo...</h2>
        <p className="text-slate-400 mt-2">A conectar base de dados segura.</p>
      </div>
    );
  }

  // --- RENDER CONTINENT SUBPAGE (Updated with Compact 3D Header & Stats) ---
  const renderContinentPage = (page: PageType) => {
     const continentName = getContinentNameFromPage(page);
     const { items, countries, collectors } = activeContinentData; // Now includes 'collectors'
     const bannerGradient = getContinentColor(page);

     return (
        <div className="animate-fade-in min-h-full max-w-7xl mx-auto px-3 md:px-6 py-4 pb-20">
           
           {/* Compact 3D Animated Banner */}
           <div 
             className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${bannerGradient} shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-t border-white/20 p-6 md:p-8 mb-6 transform hover:scale-[1.01] transition-all duration-500 group`}
           >
              {/* Animated Pulse Overlay */}
              <div className="absolute inset-0 bg-white/10 animate-pulse-slow pointer-events-none"></div>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none"></div>

              {/* Header Content Grid */}
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                 
                 {/* Left: Title & Count */}
                 <div className="flex flex-col items-start">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="bg-black/30 p-2 rounded-xl backdrop-blur-sm shadow-lg border border-white/10">
                          {getContinentIcon(page)}
                       </div>
                       <div className="px-3 py-1 bg-black/40 rounded-full text-[10px] font-bold text-white/90 border border-white/10 uppercase tracking-widest shadow-md">
                          Arquivo Oficial
                       </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] tracking-tighter uppercase leading-none">
                       {continentName}
                    </h1>
                    <div className="mt-3 flex items-center gap-2 text-white/80 font-medium">
                       <Database className="w-4 h-4" />
                       <span className="text-lg font-bold">{items.length}</span>
                       <span className="text-sm opacity-70">registos preservados</span>
                    </div>
                 </div>

                 {/* Right: Collector Stats Mini-Dashboard (The "Idea Maluca") */}
                 <div className="bg-black/30 rounded-2xl p-4 border border-white/10 backdrop-blur-sm shadow-inner w-full">
                    <h3 className="text-[10px] uppercase font-bold text-white/60 mb-3 flex items-center gap-1">
                       <Trophy className="w-3 h-3 text-yellow-400" /> Top Contribuidores ({continentName})
                    </h3>
                    <div className="space-y-3">
                       {collectors.slice(0, 3).map((col, idx) => ( // Show top 3
                          <div key={col.name} className="flex items-center gap-3">
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-white/20 shadow-lg ${getCollectorBadgeColor(col.name)}`}>
                                {getCollectorIcon(col.name)}
                             </div>
                             <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center text-xs font-bold text-white mb-1">
                                   <span className="truncate">{col.name}</span>
                                   <span className="font-mono text-white/90">{col.count}</span>
                                </div>
                                {/* Progress Bar */}
                                <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                                   <div 
                                      className={`h-full rounded-full ${col.name.toLowerCase().includes('jorge') ? 'bg-blue-400' : col.name.toLowerCase().includes('fabio') ? 'bg-green-400' : col.name.toLowerCase().includes('chloe') ? 'bg-pink-400' : 'bg-slate-400'}`} 
                                      style={{ width: `${col.percent}%` }}
                                   ></div>
                                </div>
                             </div>
                             <div className="text-[10px] font-bold text-white/70 w-8 text-right">
                                {Math.round(col.percent)}%
                             </div>
                          </div>
                       ))}
                       {collectors.length === 0 && (
                          <div className="text-xs text-white/40 italic text-center py-2">Sem dados.</div>
                       )}
                    </div>
                 </div>
              </div>
           </div>

           {/* Country Filters Bar (Existing) */}
           {countries.length > 0 ? (
             <div className="mb-6 overflow-x-auto pb-2 scrollbar-hide">
                <div className="flex items-center gap-2">
                   <button
                     onClick={() => setSubPageCountryFilter(null)}
                     className={`px-4 py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap shadow-sm ${
                        subPageCountryFilter === null 
                          ? 'bg-white text-slate-900 border-white ring-2 ring-white/20' 
                          : 'bg-slate-900 text-slate-400 border-slate-700 hover:bg-slate-800'
                     }`}
                   >
                     Todos
                   </button>
                   {countries.map(country => (
                      <button
                        key={country}
                        onClick={() => setSubPageCountryFilter(country)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
                           subPageCountryFilter === country 
                              ? 'bg-brand-600 text-white border-brand-500 shadow-lg ring-2 ring-brand-500/20' 
                              : 'bg-slate-900 text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        {country}
                      </button>
                   ))}
                </div>
             </div>
           ) : (
             <div className="text-center py-12 text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed mb-6">
                <p>Ainda não existem registos para {continentName}.</p>
                {isAdmin && <button onClick={handleUploadClick} className="mt-2 text-brand-400 hover:underline">Adicionar agora</button>}
             </div>
           )}

           {/* Grid or Map Visualization */}
           <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
              {viewMode === 'map' ? (
                 <div className="p-4 h-[600px]">
                    <WorldMap 
                       images={items} 
                       onCountrySelect={(country) => {
                          setSubPageCountryFilter(country);
                          setViewMode('grid');
                       }}
                       t={t} 
                    />
                 </div>
              ) : (
                 <ImageGrid 
                   images={items} 
                   onImageClick={setSelectedImage} 
                   viewMode={viewMode}
                   onViewModeChange={setViewMode}
                   isAdmin={isAdmin} 
                   t={t.grid}
                 />
              )}
           </div>
        </div>
     );
  };

  return (
    <div 
      className="flex flex-col h-[100dvh] bg-slate-950 text-slate-100 relative overflow-hidden transition-colors duration-500"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Header 
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        onUploadClick={handleUploadClick}
        isAdmin={isAdmin}
        currentUser={currentUser} // Pass currentUser
        onAdminToggle={handleAdminToggle}
        onLogout={handleLogout}
        onExport={handleExportData}
        onExportCSV={handleExportCSV}
        onImport={handleImportJSON}
        onHistoryClick={() => setIsHistoryModalOpen(true)}
        language={language}
        setLanguage={setLanguage}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        stats={totalStats.stats} // Pass stats to Header
        t={t.header}
        onInstall={(!isStandalone && (deferredPrompt || isIOS)) ? handleInstallClick : undefined} // Logic for iOS or Android
      />

      {/* MOBILE NAVIGATION BAR (Updated for Continents) */}
      <div className="md:hidden sticky top-[60px] z-40 bg-slate-900 border-b border-slate-800 flex justify-between px-2 py-2 overflow-x-auto scrollbar-hide">
         <button onClick={() => setCurrentPage('home')} className={`px-3 py-2 rounded-lg text-xs font-bold flex flex-col items-center gap-1 min-w-[60px] ${currentPage === 'home' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}>
           <Home className="w-4 h-4" /> Início
         </button>
         
         <button onClick={() => setCurrentPage('europe')} className={`px-3 py-2 rounded-lg text-xs font-bold flex flex-col items-center gap-1 min-w-[60px] ${currentPage === 'europe' ? 'bg-blue-900/30 text-blue-400' : 'text-slate-400'}`}>
           <Globe className="w-4 h-4" /> Europa
         </button>

         <button onClick={() => setCurrentPage('stats')} className={`px-3 py-2 rounded-lg text-xs font-bold flex flex-col items-center gap-1 min-w-[60px] ${currentPage === 'stats' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}>
           <BarChart2 className="w-4 h-4" /> Stats
         </button>
         <button onClick={() => setCurrentPage('about')} className={`px-3 py-2 rounded-lg text-xs font-bold flex flex-col items-center gap-1 min-w-[60px] ${currentPage === 'about' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}>
           <Info className="w-4 h-4" /> Sobre
         </button>

         {!isStandalone && (deferredPrompt || isIOS) && (
            <button onClick={handleInstallClick} className="px-3 py-2 rounded-lg text-xs font-bold flex flex-col items-center gap-1 min-w-[60px] bg-gradient-to-br from-pink-600/20 to-rose-600/20 text-pink-400 border border-pink-500/30 animate-pulse">
               <Smartphone className="w-4 h-4" /> Instalar
            </button>
         )}
      </div>

      {isDragging && (
        <div className="absolute inset-0 z-50 bg-brand-600/90 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in border-8 border-brand-400 border-dashed m-4 rounded-3xl pointer-events-none">
           <div className="bg-white p-6 rounded-full shadow-2xl mb-6 animate-bounce">
             <UploadCloud className="w-16 h-16 text-brand-600" />
           </div>
           <h2 className="text-4xl font-bold text-white tracking-tight">{t.upload.clickDrag}</h2>
           <p className="text-brand-100 mt-2 text-lg">{t.upload.aiDesc}</p>
        </div>
      )}

      <main className="flex-1 overflow-y-auto relative scroll-smooth w-full">
        <div className="fixed top-0 left-0 w-full h-96 bg-brand-600/20 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 z-0"></div>
        <div className="fixed bottom-0 right-0 w-full h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none translate-y-1/2 z-0"></div>

        {/* --- PAGE: HOME --- */}
        {currentPage === 'home' && (
          <>
            {/* STICKY FILTER BAR (Categories + Rarities) */}
            <div className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-md">
              <div className="max-w-7xl mx-auto px-4 md:px-6 py-2 flex flex-nowrap items-center gap-2 md:gap-4 overflow-x-auto scrollbar-hide">
                  
                  {/* Rarities Toggle */}
                  <button
                    onClick={toggleRarities}
                    className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
                      showRarities 
                        ? "bg-gold-500 text-white border-gold-400 shadow-lg shadow-gold-500/20" 
                        : "bg-slate-800 text-slate-400 border-slate-700 hover:border-gold-500/50 hover:text-gold-400"
                    }`}
                  >
                    <Gem className="w-3.5 h-3.5" />
                    {t.header.rarities}
                  </button>

                  {/* Promotional Toggle */}
                  <button
                    onClick={togglePromotional}
                    className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
                      showPromotional 
                        ? "bg-pink-500 text-white border-pink-400 shadow-lg shadow-pink-500/20" 
                        : "bg-slate-800 text-slate-400 border-slate-700 hover:border-pink-500/50 hover:text-pink-400"
                    }`}
                  >
                    <Gift className="w-3.5 h-3.5" />
                    {t.header.promos}
                  </button>

                  {/* WINNERS Filter Button (New) */}
                  <button
                    onClick={toggleWinners}
                    className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
                      showWinners 
                        ? "bg-green-600 text-white border-green-500 shadow-lg shadow-green-500/20" 
                        : "bg-slate-800 text-slate-400 border-slate-700 hover:border-green-500/50 hover:text-green-400"
                    }`}
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    {t.header.winners}
                  </button>

                  {/* Websites Modal Trigger */}
                  <button
                    onClick={() => setIsWebsitesModalOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap bg-slate-800 text-slate-400 border-slate-700 hover:border-blue-500/50 hover:text-blue-400"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    {t.header.websites}
                  </button>

                  <div className="w-px h-6 bg-slate-700 mx-1 shrink-0"></div>

                  {/* Category Toggles */}
                  <button
                    onClick={() => setActiveCategory('all')}
                    className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${activeCategory === 'all' ? 'bg-slate-700 text-white border-slate-600' : 'text-slate-500 border-transparent hover:text-white hover:bg-slate-800'}`}
                  >
                    {t.grid.allTypes}
                  </button>
                  <button
                    onClick={() => setActiveCategory('raspadinha')}
                    className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs font-bold transition-all border flex items-center gap-2 whitespace-nowrap ${activeCategory === 'raspadinha' ? 'bg-brand-600 text-white border-brand-500' : 'text-slate-500 border-transparent hover:text-white hover:bg-slate-800'}`}
                  >
                    <Coins className="w-3.5 h-3.5" />
                    {t.grid.scratchcard}
                  </button>
                  <button
                    onClick={() => setActiveCategory('lotaria')}
                    className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs font-bold transition-all border flex items-center gap-2 whitespace-nowrap ${activeCategory === 'lotaria' ? 'bg-purple-600 text-white border-purple-500' : 'text-slate-500 border-transparent hover:text-white hover:bg-slate-800'}`}
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    {t.grid.lottery}
                  </button>
                  <button
                    onClick={() => setActiveCategory('boletim')}
                    className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs font-bold transition-all border flex items-center gap-2 whitespace-nowrap ${activeCategory === 'boletim' ? 'bg-green-600 text-white border-green-500' : 'text-slate-500 border-transparent hover:text-white hover:bg-slate-800'}`}
                  >
                    <ClipboardList className="w-3.5 h-3.5" />
                    {t.grid.bulletin}
                  </button>
                  <button
                    onClick={() => setActiveCategory('objeto')}
                    className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs font-bold transition-all border flex items-center gap-2 whitespace-nowrap ${activeCategory === 'objeto' ? 'bg-orange-600 text-white border-orange-500' : 'text-slate-500 border-transparent hover:text-white hover:bg-slate-800'}`}
                  >
                    <Package className="w-3.5 h-3.5" />
                    {t.grid.object}
                  </button>
              </div>
            </div>

            <div className="max-w-7xl mx-auto py-6 md:py-8 relative z-10 space-y-8 md:space-y-12 animate-fade-in">
              {/* New Arrivals (Hidden in Filter mode) */}
              {!showRarities && !showPromotional && !showWinners && (
                <section className="px-4 md:px-6">
                  <div className="flex items-center gap-2 mb-4 text-brand-400">
                    <Clock className="w-5 h-5" />
                    <h2 className="text-lg md:text-xl font-bold text-white uppercase tracking-wider">{t.home.newArrivals}</h2>
                  </div>
                  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 md:p-6 overflow-x-auto scrollbar-hide backdrop-blur-sm">
                    <div className="min-w-[800px]">
                      <ImageGrid 
                        images={newArrivals} 
                        onImageClick={setSelectedImage} 
                        hideFilters={true} 
                        isAdmin={isAdmin} 
                        activeCategory={activeCategory} // Pass active Category
                        t={t.grid}
                      />
                    </div>
                  </div>
                </section>
              )}

              <section id="image-grid-section" className="px-4 md:px-6 pb-20">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-brand-400">
                    {showRarities ? (
                      <Gem className="w-5 h-5 text-gold-500" />
                    ) : showPromotional ? (
                      <Gift className="w-5 h-5 text-pink-500" />
                    ) : showWinners ? (
                      <Trophy className="w-5 h-5 text-green-500" />
                    ) : (
                      <Globe className="w-5 h-5" />
                    )}
                    
                    <h2 className="text-lg md:text-xl font-bold text-white uppercase tracking-wider">
                      {showRarities 
                        ? t.header.rarities 
                        : showPromotional 
                          ? t.header.promos
                          : showWinners
                            ? t.header.winners
                            : t.home.explore
                      }
                    </h2>
                  </div>
                </div>

                {/* Continent Filters */}
                <div className="flex overflow-x-auto pb-2 gap-2 mb-4 scrollbar-hide">
                  {continents.map(c => {
                    let count = 0;
                    if (c === 'Mundo') {
                      count = totalStats.total;
                    } else {
                      count = totalStats.stats[c] || 0;
                    }

                    return (
                      <button
                        key={c}
                        onClick={() => setActiveContinent(c)}
                        className={`px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-bold transition-all border flex items-center gap-2 whitespace-nowrap ${
                          activeContinent === c 
                            ? 'bg-brand-600 text-white border-brand-500 shadow-lg shadow-brand-900/50 scale-105' 
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        {c}
                        <span className={`text-[10px] ml-1 py-0.5 px-1.5 rounded-full ${activeContinent === c ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-500'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {activeContinent !== 'Mundo' && viewMode !== 'map' && (
                  <div className="mb-6 flex flex-wrap gap-2 items-center text-sm text-slate-500">
                    <Map className="w-4 h-4 mr-2" />
                    <span>{t.home.countriesIncluded}</span>
                    {availableCountries.length > 0 ? availableCountries.map(country => (
                      <button
                        key={country}
                        onClick={() => setSearchTerm(country)}
                        className={`px-3 py-1 rounded border text-xs font-bold transition-colors ${
                          searchTerm === country
                            ? 'bg-brand-600 text-white border-brand-500'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white cursor-pointer'
                        }`}
                      >
                        {country}
                      </button>
                    )) : <span className="italic">{t.home.noCountries}</span>}
                    
                    {searchTerm && availableCountries.includes(searchTerm) && (
                      <button 
                        onClick={() => setSearchTerm('')}
                        className="ml-2 p-1 rounded-full bg-slate-800 text-slate-500 hover:text-white hover:bg-red-900/50 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}

                <div className={`bg-slate-900/30 border rounded-2xl overflow-hidden min-h-[500px] backdrop-blur-sm ${showRarities ? 'border-gold-500/30 bg-gold-900/5' : showPromotional ? 'border-pink-500/30 bg-pink-900/5' : showWinners ? 'border-green-500/30 bg-green-900/5' : 'border-slate-800/50'}`}>
                  {viewMode === 'map' ? (
                    <div className="p-4 h-[600px]">
                      <WorldMap 
                        images={mapData} 
                        onCountrySelect={handleCountrySelectFromMap}
                        t={t} 
                        />
                    </div>
                  ) : (
                    <>
                      <ImageGrid 
                        images={displayedImages} 
                        onImageClick={setSelectedImage} 
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        isAdmin={isAdmin} 
                        activeCategory={activeCategory} // Pass active Category
                        t={t.grid}
                      />
                    </>
                  )}
                </div>
              </section>
            </div>
          </>
        )}

        {/* --- DYNAMIC CONTINENT PAGES --- */}
        {['europe', 'america', 'asia', 'africa', 'oceania'].includes(currentPage) && renderContinentPage(currentPage)}

        {/* --- PAGE: STATS --- */}
        {currentPage === 'stats' && (
           <div className="animate-fade-in min-h-full">
             <StatsSection 
                stats={totalStats.stats} 
                categoryStats={totalStats.categoryStats} 
                countryStats={totalStats.countryStats} 
                stateStats={totalStats.stateStats}
                collectorStats={totalStats.collectorStats}
                totalRecords={totalStats.total} 
                t={t.stats} 
             />
           </div>
        )}

        {/* --- PAGE: ABOUT --- */}
        {currentPage === 'about' && (
           <AboutPage t={t} />
        )}

      </main>
      
      {/* SCROLL TO TOP BUTTON */}
      {showScrollTop && (
         <button
            onClick={scrollToTop}
            className="fixed bottom-20 right-6 z-40 bg-brand-600 text-white p-3 rounded-full shadow-xl shadow-brand-900/50 hover:bg-brand-500 transition-all animate-bounce-in border-2 border-slate-900"
            title="Voltar ao Topo"
         >
            <ArrowUp className="w-5 h-5" />
         </button>
      )}

      {/* Footer / Copyright (Always visible at very bottom) */}
      <footer className="bg-slate-950 border-t border-slate-900/50 py-6 z-10 relative mt-auto">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] md:text-xs text-slate-500">
              
              {/* Left */}
              <div className="flex items-center gap-4">
                 <span className="uppercase tracking-widest opacity-50">© {new Date().getFullYear()} Arquivo Mundial</span>
                 <span className="hidden md:inline text-slate-800">|</span>
                 <div className="flex items-center gap-1 opacity-70">
                    <span>Jorge Mesquita</span>
                    <span className="text-slate-700">&</span>
                    <span>Fabio Pagni</span>
                 </div>
              </div>

              {/* Right: Delicate Chloe Badge */}
              <div className="relative group">
                {showChloeMessage && (
                  <div className="absolute bottom-full right-0 mb-3 whitespace-nowrap bg-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl rounded-br-none shadow-lg animate-bounce-in flex items-center gap-1 z-50">
                    Estou aqui, Vovô! 💖
                  </div>
                )}
                <button 
                  onClick={handleChloeClick}
                  className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-full hover:border-pink-500/50 hover:bg-pink-950/30 transition-all group cursor-pointer shadow-sm"
                >
                   <div className="relative">
                      <Heart className="w-3 h-3 text-pink-500 fill-pink-500 animate-pulse" />
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-pink-400 rounded-full animate-ping opacity-75"></span>
                   </div>
                   <span className="text-pink-400/80 group-hover:text-pink-300 font-bold tracking-wide text-[10px] uppercase">Futura Guardiã Chloe</span>
                </button>
              </div>
          </div>
      </footer>

      {isLoginModalOpen && (
        <LoginModal 
          onClose={() => setIsLoginModalOpen(false)}
          onLogin={handleLoginSubmit}
          t={t.login}
        />
      )}

      {isUploadModalOpen && (
        <UploadModal 
          onClose={() => {
            setIsUploadModalOpen(false);
            setDroppedFile(null);
          }}
          onUploadComplete={handleUploadComplete}
          existingImages={displayedImages}
          initialFile={droppedFile}
          currentUser={currentUser} // Pass currentUser for auto-tagging
          t={t.upload}
        />
      )}

      {isHistoryModalOpen && (
        <HistoryModal 
          onClose={() => setIsHistoryModalOpen(false)}
          t={t.history}
          isAdmin={isAdmin}
        />
      )}

      {isWebsitesModalOpen && (
        <WebsitesModal 
          onClose={() => setIsWebsitesModalOpen(false)}
          isAdmin={isAdmin}
          t={t.websites}
        />
      )}

      {selectedImage && (
        <ImageViewer 
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
          onUpdate={handleUpdateImage}
          onDelete={handleDeleteImage}
          isAdmin={isAdmin}
          contextImages={displayedImages}
          onImageSelect={setSelectedImage}
          t={t.viewer}
        />
      )}
    </div>
  );
}

export default App;