
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Filter, Zap, Trophy, CheckCircle2, Image as ImageIcon, ChevronLeft, ChevronRight, MapPin, RefreshCcw, Search, X
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

const SafeImage = ({ src, alt, className }: { src: string, alt: string, className?: string }) => {
    const [error, setError] = useState(false);
    if (error || !src) return <div className={`flex items-center justify-center bg-slate-900 ${className}`}><ImageIcon className="w-5 h-5 text-slate-800" /></div>;
    return <img src={src} alt={alt} className={className} onError={() => setError(true)} loading="lazy" />;
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
  
  // Extrair países únicos para sugestões
  const uniqueCountries = useMemo(() => {
    const countries = images.map(img => img.country).filter(Boolean);
    return Array.from(new Set(countries)).sort();
  }, [images]);

  // Filtrar sugestões com base no input
  const suggestions = useMemo(() => {
    if (!countryFilter.trim()) return [];
    return uniqueCountries.filter(c => 
      c.toLowerCase().includes(countryFilter.toLowerCase()) && 
      c.toLowerCase() !== countryFilter.toLowerCase()
    ).slice(0, 5);
  }, [countryFilter, uniqueCountries]);

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sortedAndFilteredImages = useMemo(() => {
    let result = [...images];
    
    // Filtro por país local
    if (countryFilter.trim()) {
      result = result.filter(img => 
        img.country.toLowerCase().includes(countryFilter.toLowerCase())
      );
    }

    return result.sort((a, b) => {
      const numA = a.gameNumber || "";
      const numB = b.gameNumber || "";
      return numA.localeCompare(numB, undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [images, countryFilter]);

  const totalPages = Math.ceil(sortedAndFilteredImages.length / ITEMS_PER_PAGE);

  const displayedImages = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedAndFilteredImages.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedAndFilteredImages, currentPage]);

  // Resetar página quando o filtro muda
  useEffect(() => {
    setCurrentPage(1);
  }, [countryFilter]);

  const isRecent = (createdAt: number) => {
    const twentyFourHoursInMs = 24 * 60 * 60 * 1000;
    return (Date.now() - createdAt) < twentyFourHoursInMs;
  };

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
      {/* Country Search Bar Interno */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800/50 backdrop-blur-sm">
        <div className="relative flex-1 w-full" ref={suggestionRef}>
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500" />
          <input 
            type="text" 
            placeholder="Filtrar por país específico..." 
            value={countryFilter}
            onChange={(e) => {
              setCountryFilter(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-10 py-3 text-xs font-bold text-white focus:border-brand-500 outline-none transition-all shadow-inner uppercase tracking-widest"
          />
          {countryFilter && (
            <button 
              onClick={() => setCountryFilter('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Sugestões de Países */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 w-full mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-[60] overflow-hidden animate-fade-in neon-border-blue">
              {suggestions.map(country => (
                <button
                  key={country}
                  onClick={() => {
                    setCountryFilter(country);
                    setShowSuggestions(false);
                  }}
                  className="w-full text-left px-4 py-3 text-[10px] font-black text-slate-400 hover:bg-brand-500 hover:text-white transition-all border-b border-slate-800 last:border-0 uppercase tracking-widest flex items-center gap-2"
                >
                  <MapPin className="w-3 h-3 opacity-50" />
                  {country}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-950 rounded-xl border border-slate-800 shrink-0">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Resultados:</span>
          <span className="text-xs font-black text-brand-400">{sortedAndFilteredImages.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 gap-2 md:gap-3">
        {displayedImages.map((item) => {
          const itemIsRecent = isRecent(item.createdAt);
          
          return (
            <div
              key={item.id}
              className="group bg-slate-950 border border-slate-900 hover:border-brand-500/50 transition-all duration-300 cursor-pointer flex flex-col rounded-sm overflow-hidden shadow-2xl hover:shadow-brand-500/10 active:scale-95"
              onClick={() => onImageClick(item)}
            >
              <div className="px-1.5 py-1 bg-black border-b border-slate-900 flex justify-between items-center text-[6px] font-black text-slate-600 uppercase tracking-widest">
                 <div className="flex items-center gap-0.5">
                    <span className="text-brand-600">REF</span> {item.gameNumber}
                 </div>
                 <span className="group-hover:text-slate-400 transition-colors">{item.releaseDate?.split('-')[0]}</span>
              </div>

              <div className="relative aspect-[3/4] bg-black flex items-center justify-center overflow-hidden">
                <SafeImage 
                  src={item.frontUrl} 
                  alt={item.gameName} 
                  className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${item.backUrl ? 'group-hover:opacity-0' : 'opacity-80 group-hover:opacity-100'}`} 
                />
                
                {/* Imagem do Verso no Hover */}
                {item.