import React, { useState, useMemo, useEffect } from 'react';
import { ScratchcardData, ScratchcardState, Category, LineType } from '../types';
import { Sparkles, Eye, Filter, X, RotateCcw, Calendar, Maximize2, Printer, BarChart, Layers, Search, Globe, Ticket, Coins, ChevronLeft, ChevronRight, AlignJustify } from 'lucide-react';

interface ImageGridProps {
  images: ScratchcardData[];
  onImageClick: (image: ScratchcardData) => void;
  hideFilters?: boolean;
  viewMode?: 'grid' | 'list';
  isAdmin?: boolean;
  t: any;
}

const ITEMS_PER_PAGE = 48;

const StateBadge: React.FC<{ state: string }> = ({ state }) => {
  const getColor = (s: string) => {
    const normalized = s.toUpperCase();
    if (normalized.includes('MINT')) return 'bg-green-500/20 text-green-400 border-green-500/50';
    if (normalized.includes('VOID')) return 'bg-red-500/20 text-red-400 border-red-500/50';
    if (normalized.includes('AMOSTRA') || normalized.includes('MUESTRA')) return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
    return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
  };

  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getColor(state)}`}>
      {state}
    </span>
  );
};

const LineIndicator: React.FC<{ type?: LineType; t: any }> = ({ type, t }) => {
  if (!type || type === 'none') return null;

  let colorClass = '';
  let label = '';

  switch (type) {
    case 'blue':
      colorClass = 'bg-blue-500';
      label = t.linesBlue || 'Azuis';
      break;
    case 'red':
      colorClass = 'bg-red-500';
      label = t.linesRed || 'Vermelhas';
      break;
    case 'multicolor':
      colorClass = 'bg-gradient-to-r from-blue-400 via-yellow-400 to-red-400';
      label = t.linesMulti || 'Multi';
      break;
    default:
      return null;
  }

  return (
    <div className="flex items-center gap-1.5 bg-gray-800/80 px-1.5 py-0.5 rounded border border-gray-700" title={`Linhas: ${label}`}>
      <div className={`w-2 h-2 rounded-full ${colorClass} shadow-sm`}></div>
      <span className="text-[9px] text-gray-400 uppercase font-bold hidden sm:inline">{label}</span>
    </div>
  );
};

export const ImageGrid: React.FC<ImageGridProps> = ({ images, onImageClick, hideFilters = false, viewMode = 'grid', isAdmin = false, t }) => {
  // Category Filter
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Manual text filters
  const [filterCountry, setFilterCountry] = useState<string>('');
  const [filterState, setFilterState] = useState<string>('');
  const [filterYear, setFilterYear] = useState<string>('');
  const [filterSize, setFilterSize] = useState<string>('');
  const [filterEmission, setFilterEmission] = useState<string>('');
  const [filterPrinter, setFilterPrinter] = useState<string>('');
  const [filterSeries, setFilterSeries] = useState<boolean>(false);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, filterCountry, filterState, filterYear, filterSize, filterEmission, filterPrinter, filterSeries, images]);

  // Apply filters
  const filteredImages = useMemo(() => {
    return images.filter(img => {
      // Filter by Category
      if (activeCategory !== 'all') {
         const cat = img.category || 'raspadinha';
         if (cat !== activeCategory) return false;
      }

      // Case insensitive partial matching
      if (filterCountry && !img.country.toLowerCase().includes(filterCountry.toLowerCase())) return false;
      if (filterState && !img.state.toLowerCase().includes(filterState.toLowerCase())) return false;
      if (filterYear && !img.releaseDate.includes(filterYear)) return false;
      if (filterSize && !img.size.toLowerCase().includes(filterSize.toLowerCase())) return false;
      if (filterEmission && !img.emission?.toLowerCase().includes(filterEmission.toLowerCase())) return false;
      if (filterPrinter && !img.printer?.toLowerCase().includes(filterPrinter.toLowerCase())) return false;
      if (filterSeries && !img.isSeries) return false;
      
      return true;
    });
  }, [images, activeCategory, filterCountry, filterState, filterYear, filterSize, filterEmission, filterPrinter, filterSeries]);

  // Apply Pagination
  const totalPages = Math.ceil(filteredImages.length / ITEMS_PER_PAGE);
  const displayedImages = useMemo(() => {
    if (hideFilters) return filteredImages; // Don't paginate "New Arrivals" horizontal scroll
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredImages.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredImages, currentPage, hideFilters]);

  const clearFilters = () => {
    setFilterCountry('');
    setFilterState('');
    setFilterYear('');
    setFilterSize('');
    setFilterEmission('');
    setFilterPrinter('');
    setFilterSeries(false);
  };

  const hasFilters = filterCountry || filterState || filterYear || filterSize || filterEmission || filterPrinter || filterSeries;

  const InputFilter = ({ 
    value, 
    onChange, 
    placeholder, 
    icon: Icon 
  }: { 
    value: string, 
    onChange: (val: string) => void, 
    placeholder: string, 
    icon: React.ElementType 
  }) => (
    <div className="relative group min-w-[140px] flex-1">
      <Icon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 group-focus-within:text-brand-500 transition-colors" />
      <input 
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-800 text-gray-200 text-xs rounded-lg border border-gray-700 pl-8 pr-2 py-2 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors placeholder-gray-600"
      />
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      
      {/* Category Tabs (Visible above filters) */}
      {!hideFilters && (
        <div className="px-6 pt-2 pb-2 flex gap-2 border-b border-gray-800/50 bg-gray-900/30">
          <button
             onClick={() => setActiveCategory('all')}
             className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${activeCategory === 'all' ? 'bg-gray-700 text-white border-gray-600' : 'text-gray-500 border-transparent hover:text-white'}`}
          >
            {t.allTypes}
          </button>
          <button
             onClick={() => setActiveCategory('raspadinha')}
             className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-2 ${activeCategory === 'raspadinha' ? 'bg-brand-600 text-white border-brand-500' : 'text-gray-500 border-transparent hover:text-white'}`}
          >
            <Coins className="w-3 h-3" />
            {t.scratchcard}
          </button>
          <button
             onClick={() => setActiveCategory('lotaria')}
             className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-2 ${activeCategory === 'lotaria' ? 'bg-purple-600 text-white border-purple-500' : 'text-gray-500 border-transparent hover:text-white'}`}
          >
            <Ticket className="w-3 h-3" />
            {t.lottery}
          </button>
        </div>
      )}

      {/* Filter Bar - Restricted to ADMIN only */}
      {!hideFilters && isAdmin && (
        <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm z-10 sticky top-0 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-brand-400 text-sm font-medium">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">{t.filters} (Admin)</span>
            </div>
            
            <div className="text-xs text-gray-500 font-mono">
              {filteredImages.length} {t.results}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <InputFilter value={filterCountry} onChange={setFilterCountry} placeholder={t.country} icon={Globe} />
            <InputFilter value={filterState} onChange={setFilterState} placeholder={t.state} icon={Search} />
            <InputFilter value={filterYear} onChange={setFilterYear} placeholder={t.year} icon={Calendar} />
            <InputFilter value={filterSize} onChange={setFilterSize} placeholder={t.size} icon={Maximize2} />
            <InputFilter value={filterEmission} onChange={setFilterEmission} placeholder={t.emission} icon={BarChart} />
            <InputFilter value={filterPrinter} onChange={setFilterPrinter} placeholder={t.printer} icon={Printer} />
            
            <button 
              onClick={() => setFilterSeries(!filterSeries)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-2 transition-all ${
                filterSeries 
                ? 'bg-brand-600 border-brand-500 text-white shadow-lg shadow-brand-900/40' 
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              {t.series}
            </button>

            {hasFilters && (
              <button 
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-400 font-medium transition-colors ml-auto px-2"
              >
                <X className="w-3 h-3" /> {t.clear}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className={`${hideFilters ? '' : 'flex-1 overflow-y-auto p-6 pb-24 scroll-smooth'}`}>
        {!hideFilters && filteredImages.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-64 text-gray-500">
             <Filter className="w-12 h-12 mb-4 opacity-20" />
             <p>{t.noResults}</p>
             <button onClick={clearFilters} className="text-brand-500 hover:underline mt-2 text-sm">{t.clearFilters}</button>
           </div>
        ) : viewMode === 'list' ? (
          // LIST VIEW
          <div className="flex flex-col space-y-2">
            {displayedImages.map((item) => (
              <div 
                key={item.id}
                onClick={() => onImageClick(item)}
                className="group flex items-center gap-4 bg-gray-900 border border-gray-800 hover:border-brand-500/50 p-3 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-all"
              >
                {/* Thumbnail */}
                <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0 bg-gray-800">
                   <img src={item.frontUrl} alt={item.gameName} className="w-full h-full object-cover" />
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-500 bg-gray-800 px-1.5 rounded">{item.customId}</span>
                    <h3 className="font-bold text-gray-200 truncate">{item.gameName}</h3>
                    {item.category === 'lotaria' ? (
                      <div title={t.lottery}>
                        <Ticket className="w-3 h-3 text-purple-400" />
                      </div>
                    ) : (
                      <div title={t.scratchcard}>
                        <Coins className="w-3 h-3 text-brand-400" />
                      </div>
                    )}
                    {item.isSeries && (
                      <span title={t.series} className="flex items-center gap-1 bg-brand-900/20 px-1.5 py-0.5 rounded border border-brand-900/30">
                        <Layers className="w-3 h-3 text-brand-500" />
                        {item.seriesDetails && <span className="text-[10px] text-brand-400 font-medium">{item.seriesDetails}</span>}
                      </span>
                    )}
                    {/* Line Indicator in List */}
                    {item.lines && item.lines !== 'none' && (
                       <LineIndicator type={item.lines} t={t} />
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                     <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                        {item.country}
                     </span>
                     <span className="hidden sm:inline text-gray-600">|</span>
                     <span className="hidden sm:inline font-mono">Nº {item.gameNumber}</span>
                  </div>
                </div>

                {/* Meta details hidden on small screens */}
                <div className="hidden sm:flex items-center gap-6 text-xs text-gray-500 mr-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {item.releaseDate.split('-')[0]}
                  </div>
                  <div className="flex items-center gap-1">
                    <Maximize2 className="w-3 h-3" />
                    {item.size}
                  </div>
                </div>

                {/* Badge */}
                <StateBadge state={item.state} />
              </div>
            ))}
          </div>
        ) : (
          // GRID VIEW
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${hideFilters ? 'md:grid-cols-4 lg:grid-cols-5' : 'md:grid-cols-3 lg:grid-cols-4'} gap-6`}>
            {displayedImages.map((item) => (
              <div
                key={item.id}
                className="group relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-brand-500/50 transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-500/20 hover:scale-[1.02] cursor-pointer flex flex-col h-full"
                onClick={() => onImageClick(item)}
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-800">
                  <img
                    src={item.frontUrl}
                    alt={item.gameName}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    loading="lazy"
                  />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white/10 backdrop-blur-md p-3 rounded-full">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  {/* ID Badge */}
                  <div className="absolute top-2 left-2 bg-black/70 backdrop-blur text-white text-[10px] font-mono px-2 py-1 rounded border border-gray-700 shadow-sm flex items-center gap-1">
                     {item.category === 'lotaria' && <Ticket className="w-3 h-3 text-purple-400" />}
                     {item.customId}
                  </div>

                   <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                      <div className="flex gap-1">
                        {item.isSeries && (
                            <div className={`backdrop-blur text-white rounded-lg shadow-sm flex items-center justify-center gap-1 ${item.seriesDetails ? 'bg-brand-600/90 px-1.5 py-0.5' : 'bg-brand-600/90 p-1 rounded-full'}`} title={t.series}>
                            <Layers className="w-3 h-3" />
                            {item.seriesDetails && <span className="text-[10px] font-bold leading-none">{item.seriesDetails}</span>}
                            </div>
                        )}
                        {item.backUrl && (
                            <div className="bg-gray-800/80 backdrop-blur text-gray-300 p-1 rounded-full shadow-sm" title="Possui verso / Retro">
                            <RotateCcw className="w-3 h-3" />
                            </div>
                        )}
                        {item.aiGenerated && (
                            <div className="bg-brand-600/90 backdrop-blur text-white p-1 rounded-full shadow-sm" title="AI">
                            <Sparkles className="w-3 h-3" />
                            </div>
                        )}
                      </div>
                      
                      {/* Lines Visual Indicator on Grid */}
                      <LineIndicator type={item.lines} t={t} />
                   </div>
                </div>

                {/* Info Container */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-200 truncate flex-1 mr-2" title={item.gameName}>{item.gameName}</h3>
                    <StateBadge state={item.state} />
                  </div>
                  
                  {/* Flag / Country Info */}
                  <div className="mb-2 flex items-center gap-1.5 text-xs text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                    <span className="truncate">{item.country}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-auto text-xs text-gray-400">
                    <div className="bg-gray-800/50 p-2 rounded flex flex-col">
                      <span className="text-[10px] uppercase text-gray-500">{t.gameNo}</span>
                      <span className="font-mono text-gray-300">{item.gameNumber}</span>
                    </div>
                    <div className="bg-gray-800/50 p-2 rounded flex flex-col">
                      <span className="text-[10px] uppercase text-gray-500">{t.year}</span>
                      <span className="font-mono text-gray-300">{item.releaseDate.split('-')[0] || '?'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!hideFilters && filteredImages.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-full border transition-all ${currentPage === 1 ? 'bg-gray-800 text-gray-600 border-gray-800 cursor-not-allowed' : 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700 hover:border-gray-500'}`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>{t.page}</span>
              <span className="font-bold text-white bg-gray-800 px-2 py-1 rounded">{currentPage}</span>
              <span>{t.of}</span>
              <span>{totalPages}</span>
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-full border transition-all ${currentPage === totalPages ? 'bg-gray-800 text-gray-600 border-gray-800 cursor-not-allowed' : 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700 hover:border-gray-500'}`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};