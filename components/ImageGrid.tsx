
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Filter, Zap, Trophy, CheckCircle2, Image as ImageIcon, 
  ChevronLeft, ChevronRight, MapPin, RefreshCcw, Search, X 
} from 'lucide-react';
import { ScratchcardData } from '../types';

interface ImageGridProps {
  images: ScratchcardData[];
  onImageClick: (item: ScratchcardData) => void;
  isAdmin?: boolean;
  currentUser?: string | null;
  t: any;
}

const ITEMS_PER_PAGE = 20;

const StateBadge = ({ state }: { state: string }) => {
  const colors: Record<string, string> = {
    'MINT': 'bg-green-500/10 text-green-400 border-green-500/30',
    'SC': 'bg-slate-800/50 text-slate-400 border-slate-700/50',
    'AMOSTRA': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    'VOID': 'bg-red-500/10 text-red-400 border-red-500/30',
  };
  return (
    <span className={`px-1 py-0.5 rounded text-[7px] font-black uppercase border backdrop-blur-sm ${colors[state] || 'bg-slate-700/50 text-slate-300 border-slate-600/50'}`}>
      {state}
    </span>
  );
};

export const ImageGrid: React.FC<ImageGridProps> = ({ 
  images, 
  onImageClick, 
  currentUser,
  t 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [countryFilter, setCountryFilter] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Países únicos para o filtro
  const uniqueCountries = useMemo(() => {
    const countries = images.map(img => img.country).filter(Boolean);
    return Array.from(new Set(countries)).sort();
  }, [images]);

  // Sugestões dinâmicas
  const suggestions = useMemo(() => {
    if (!countryFilter.trim()) return [];
    return uniqueCountries.filter(c => 
      c.toLowerCase().includes(countryFilter.toLowerCase()) && 
      c.toLowerCase() !== countryFilter.toLowerCase()
    ).slice(0, 5);
  }, [countryFilter, uniqueCountries]);

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sortedAndFilteredImages = useMemo(() => {
    let result = [...images];
    
    // Aplicar filtro de país se houver
    if (countryFilter.trim()) {
      result = result.filter(img => 
        img.country.toLowerCase().includes(countryFilter.toLowerCase())
      );
    }

    // Ordenação Crescente pelo gameNumber (Natural Sort)
    return result.sort((a, b) => {
      const numA = a.gameNumber?.trim() || "";
      const numB = b.gameNumber?.trim() || "";
      
      // Se um deles não tem número, vai para o fim
      if (numA === "" && numB === "") return 0;
      if (numA === "") return 1;
      if (numB === "") return -1;
      
      // Ordenação numérica consciente (ex: "2" vem antes de "10")
      return numA.localeCompare(numB, undefined, { 
        numeric: true, 
        sensitivity: 'base' 
      });
    });
  }, [images, countryFilter]);

  const totalPages = Math.ceil(sortedAndFilteredImages.length / ITEMS_PER_PAGE);
  const displayedImages = sortedAndFilteredImages.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => { setCurrentPage(1); }, [countryFilter, images]);

  const isRecent = (createdAt: number) => (Date.now() - createdAt) < 86400000;

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-600 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
        <Filter className="w-12 h-12 mb-4 opacity-10" />
        <p className="font-black uppercase tracking-[0.2em] text-[10px]">Silêncio no Arquivo Mundial.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barra de Filtro de País */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800/50 backdrop-blur-sm">
        <div className="relative flex-1 w-full" ref={suggestionRef}>
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500" />
          <input 
            type="text" 
            placeholder="Filtrar por país..." 
            value={countryFilter}
            onChange={(e) => { setCountryFilter(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-10 py-3 text-xs font-bold text-white focus:border-brand-500 outline-none transition-all shadow-inner uppercase tracking-widest"
          />
          {countryFilter && (
            <button onClick={() => setCountryFilter('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 w-full mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-[60] overflow-hidden">
              {suggestions.map(country => (
                <button
                  key={country}
                  onClick={() => { setCountryFilter(country); setShowSuggestions(false); }}
                  className="w-full text-left px-4 py-3 text-[10px] font-black text-slate-400 hover:bg-brand-500 hover:text-white transition-all border-b border-slate-800 last:border-0 uppercase flex items-center gap-2"
                >
                  <MapPin className="w-3 h-3 opacity-50" /> {country}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-950 rounded-xl border border-slate-800 shrink-0">
          <span className="text-[10px] font-black text-slate-500 uppercase">Total:</span>
          <span className="text-xs font-black text-brand-400">{sortedAndFilteredImages.length}</span>
        </div>
      </div>

      {/* Grelha de Imagens */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {displayedImages.map((item) => (
          <div
            key={item.id}
            className="group bg-slate-950 border border-slate-900 hover:border-brand-500/50 transition-all cursor-pointer flex flex-col rounded-md overflow-hidden shadow-xl active:scale-95"
            onClick={() => onImageClick(item)}
          >
            <div className="px-2 py-1 bg-black border-b border-slate-900 flex justify-between items-center text-[7px] font-black text-slate-600 uppercase tracking-widest">
               <span>REF {item.gameNumber}</span>
               <span>{item.country}</span>
            </div>

            <div className="relative aspect-[3/4] bg-black overflow-hidden">
              <img 
                src={item.frontUrl} 
                alt={item.gameName} 
                className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${item.backUrl ? 'group-hover:opacity-0' : ''}`} 
              />
              {item.backUrl && (
                <img 
                  src={item.backUrl} 
                  className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity" 
                  alt="Verso"
                />
              )}
              
              <div className="absolute top-1 right-1 flex flex-col gap-1 items-end">
                {isRecent(item.createdAt) && (
                   <div className="bg-brand-500 text-white px-2 py-0.5 rounded-sm text-[8px] font-black animate-pulse">NOVO</div>
                )}
                {item.isWinner && <div className="bg-green-600 p-1 rounded-full"><Trophy className="w-2.5 h-2.5 text-white" /></div>}
              </div>
            </div>

            <div className="p-2 bg-slate-950 flex flex-col flex-1 border-t border-slate-900/50">
              <h3 className="font-black text-slate-400 text-[9px] leading-tight truncate uppercase group-hover:text-brand-500 transition-colors">
                {item.gameName}
              </h3>
              <div className="mt-auto pt-2 flex items-center justify-between">
                <span className="text-[7px] text-slate-600 font-black uppercase tracking-widest">{item.customId}</span>
                <StateBadge state={item.state} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-8">
          <button 
            onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo(0,0); }} 
            disabled={currentPage === 1} 
            className="p-2 bg-slate-900 text-slate-400 rounded-full border border-slate-800 disabled:opacity-10 hover:bg-brand-500 hover:text-white transition-all"
          >
             <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="px-4 py-1.5 bg-slate-950 rounded-full border border-slate-800">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
               Página <span className="text-slate-300">{currentPage}</span> de {totalPages}
             </span>
          </div>

          <button 
            onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0,0); }} 
            disabled={currentPage === totalPages} 
            className="p-2 bg-slate-900 text-slate-400 rounded-full border border-slate-800 disabled:opacity-10 hover:bg-brand-500 hover:text-white transition-all"
          >
             <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
