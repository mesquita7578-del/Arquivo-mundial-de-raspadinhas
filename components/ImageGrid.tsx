
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Filter, Zap, Layers, Trophy, CheckCircle2, Eye, RotateCcw, Sparkles, 
  ChevronLeft, ChevronRight, Coins, Ticket, ClipboardList, Package, Image as ImageIcon, Search, MapPin, X,
  // Fix: added missing LayoutGrid and List icon imports
  LayoutGrid, List
} from 'lucide-react';
import { ScratchcardData, Category, LineType } from '../types';

interface ImageGridProps {
  images: ScratchcardData[];
  onImageClick: (item: ScratchcardData) => void;
  hideFilters?: boolean;
  viewMode?: 'grid' | 'list' | 'map';
  onViewModeChange?: (mode: 'grid' | 'list' | 'map') => void;
  isAdmin?: boolean;
  currentUser?: string | null;
  activeCategory?: Category | 'all';
  t: any;
}

const ITEMS_PER_PAGE = 60;

const isRecentItem = (createdAt: number) => {
  const twoDays = 48 * 60 * 60 * 1000;
  return Date.now() - createdAt < twoDays;
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'raspadinha': return <Coins className="w-3 h-3" />;
    case 'lotaria': return <Ticket className="w-3 h-3" />;
    case 'boletim': return <ClipboardList className="w-3 h-3" />;
    case 'objeto': return <Package className="w-3 h-3" />;
    default: return <Coins className="w-3 h-3" />;
  }
};

const StateBadge = ({ state }: { state: string }) => {
  const colors: Record<string, string> = {
    'MINT': 'bg-green-500/20 text-green-400 border-green-500/50',
    'SC': 'bg-slate-700 text-slate-300 border-slate-600',
    'CS': 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    'AMOSTRA': 'bg-purple-500/20 text-purple-400 border-purple-500/50',
    'VOID': 'bg-red-500/20 text-red-400 border-red-500/50',
  };
  return (
    <span className={`px-1 py-0.5 rounded text-[8px] font-bold uppercase border ${colors[state] || 'bg-slate-700 text-slate-300 border-slate-600'}`}>
      {state}
    </span>
  );
};

const SafeImage = ({ src, alt, className }: { src: string, alt: string, className?: string }) => {
    const [error, setError] = useState(false);
    if (error || !src) return <div className={`flex items-center justify-center bg-slate-800 ${className}`}><ImageIcon className="w-6 h-6 text-slate-600" /></div>;
    return <img src={src} alt={alt} className={className} onError={() => setError(true)} loading="lazy" />;
};

export const ImageGrid: React.FC<ImageGridProps> = ({ 
  images, 
  onImageClick, 
  hideFilters = false, 
  viewMode = 'grid', 
  onViewModeChange,
  isAdmin = false, 
  currentUser,
  activeCategory = 'all', 
  t 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [countryFilter, setCountryFilter] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Extract unique countries from currently provided images
  const uniqueCountries = useMemo(() => {
    const countries = Array.from(new Set(images.map(img => img.country))).filter(Boolean).sort();
    return countries;
  }, [images]);

  // Suggested countries based on input
  const suggestions = useMemo(() => {
    if (!countryFilter.trim()) return [];
    return uniqueCountries.filter(c => c.toLowerCase().includes(countryFilter.toLowerCase()));
  }, [uniqueCountries, countryFilter]);

  // Filter images by country filter
  const filteredImages = useMemo(() => {
    if (!countryFilter.trim()) return images;
    return images.filter(img => img.country.toLowerCase().includes(countryFilter.toLowerCase()));
  }, [images, countryFilter]);

  const totalPages = Math.ceil(filteredImages.length / ITEMS_PER_PAGE);

  const displayedImages = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredImages.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredImages, currentPage]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [images, countryFilter]);

  return (
    <div className="flex flex-col h-full space-y-4">
      
      {/* Local Filter Bar */}
      {!hideFilters && (
        <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm">
           <div className="relative flex-1 w-full" ref={suggestionRef}>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                 <MapPin className="w-4 h-4" />
              </div>
              <input 
                type="text"
                placeholder="Filtrar por País..."
                value={countryFilter}
                onChange={(e) => {
                   setCountryFilter(e.target.value);
                   setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-brand-500 outline-none transition-all"
              />
              {countryFilter && (
                <button onClick={() => setCountryFilter('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                   <X className="w-4 h-4" />
                </button>
              )}

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-[60] overflow-hidden animate-fade-in max-h-60 overflow-y-auto">
                   {suggestions.map(country => (
                      <button 
                        key={country}
                        onClick={() => {
                           setCountryFilter(country);
                           setShowSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border-b border-slate-700/50 last:border-none flex items-center justify-between group"
                      >
                         <span>{country}</span>
                         <span className="text-[10px] font-bold text-slate-500 group-hover:text-brand-400">
                           {images.filter(i => i.country === country).length} itens
                         </span>
                      </button>
                   ))}
                </div>
              )}
           </div>
           
           <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              <button 
                onClick={() => onViewModeChange?.('grid')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onViewModeChange?.('list')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <List className="w-4 h-4" />
              </button>
           </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2 md:p-4 pb-24 scroll-smooth min-h-[400px]">
        {filteredImages.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-64 text-slate-500">
             <Filter className="w-12 h-12 mb-4 opacity-20" />
             <p>{t.noResults}</p>
             <button onClick={() => { setCountryFilter(''); }} className="text-brand-500 hover:underline mt-2 text-sm">Ver tudo</button>
           </div>
        ) : viewMode === 'list' ? (
          <div className="flex flex-col space-y-2 max-w-4xl mx-auto">
            {displayedImages.map((item) => (
              <div 
                key={item.id}
                onClick={() => onImageClick(item)}
                className="group flex items-center gap-4 bg-slate-900 border border-slate-800 hover:border-brand-500/50 p-2 rounded-lg hover:bg-slate-800/50 cursor-pointer transition-all"
              >
                <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0 bg-slate-950/50 border border-slate-700">
                   <SafeImage src={item.frontUrl} alt={item.gameName} className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-200 truncate">{item.gameName}</h3>
                    {getCategoryIcon(item.category)}
                    {currentUser && item.owners?.includes(currentUser) && (
                       <CheckCircle2 className="w-3 h-3 text-blue-500" />
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400">
                     {item.country} • Nº {item.gameNumber}
                  </div>
                </div>
                <StateBadge state={item.state} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-2 md:gap-3">
            {displayedImages.map((item) => (
              <div
                key={item.id}
                className="group relative bg-slate-900/80 rounded-lg overflow-hidden border border-slate-700/50 hover:border-brand-500/50 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/10 cursor-pointer flex flex-col h-full backdrop-blur-sm"
                onClick={() => onImageClick(item)}
              >
                <div className="relative aspect-square overflow-hidden bg-slate-800/50 flex items-center justify-center p-2">
                  <SafeImage src={item.frontUrl} alt={item.gameName} className="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-110" />
                  <div className="absolute top-1 left-1 bg-slate-950/70 backdrop-blur text-white text-[8px] font-mono px-1.5 py-0.5 rounded border border-slate-700 shadow-sm flex items-center gap-1 z-20">
                     {item.customId}
                  </div>
                   <div className="absolute top-1 right-1 flex flex-col gap-1 items-end z-20">
                      {isRecentItem(item.createdAt) && (
                         <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-sm flex items-center gap-0.5 animate-pulse">
                            <Zap className="w-2 h-2 fill-slate-900 stroke-none" />
                         </div>
                      )}
                      {currentUser && item.owners?.includes(currentUser) && (
                         <div className="bg-blue-600 text-white p-0.5 rounded-full shadow border border-blue-400">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                         </div>
                      )}
                      {item.isWinner && <div className="bg-green-600/90 text-white p-0.5 rounded-full shadow"><Trophy className="w-2.5 h-2.5" /></div>}
                   </div>
                </div>
                <div className="p-2 flex flex-col flex-1 bg-slate-900/50 border-t border-slate-800">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-slate-200 truncate flex-1 mr-1 text-[10px] md:text-xs leading-tight" title={item.gameName}>{item.gameName}</h3>
                    <StateBadge state={item.state} />
                  </div>
                  <div className="mb-1 flex items-center gap-1 text-[9px] text-slate-500">
                    <span className="truncate">{item.country}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredImages.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-center gap-4 mt-12 pb-12">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded-full border bg-slate-800 text-white border-slate-700 hover:bg-slate-700 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
            <div className="text-xs text-slate-400">Pág <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded">{currentPage}</span> de {totalPages}</div>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 rounded-full border bg-slate-800 text-white border-slate-700 hover:bg-slate-700 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
          </div>
        )}
      </div>
    </div>
  );
};
