
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Filter, Trophy, ChevronLeft, ChevronRight, Zap, Layers, MapPin, Search, X, Check
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
const FORTY_EIGHT_HOURS = 172800000; // 48 * 60 * 60 * 1000

const StateBadge = ({ state }: { state: string }) => {
  const colors: Record<string, string> = {
    'MINT': 'bg-green-500/10 text-green-400 border-green-500/30',
    'SC': 'bg-slate-800/50 text-slate-400 border-slate-700/50',
    'AMOSTRA': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    'VOID': 'bg-red-500/10 text-red-400 border-red-500/30',
  };
  return (
    <span className={`px-1 py-0.5 rounded text-[5px] font-black uppercase border backdrop-blur-sm ${colors[state] || 'bg-slate-700/50 text-slate-300 border-slate-600/50'}`}>
      {state}
    </span>
  );
};

export const ImageGrid: React.FC<ImageGridProps> = ({ 
  images, 
  onImageClick, 
  t 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [countrySearch, setCountrySearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Chloe: Fecha as sugestões se clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Chloe: Reset da página quando os filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [images.length, selectedCountry]);

  // Chloe: Pega os países únicos disponíveis no conjunto atual de imagens
  const availableCountries = useMemo(() => {
    const countries = images.map(img => img.country).filter(Boolean);
    return Array.from(new Set(countries)).sort();
  }, [images]);

  // Chloe: Filtra as sugestões conforme o utilizador digita
  const filteredSuggestions = useMemo(() => {
    if (!countrySearch) return [];
    return availableCountries.filter(c => 
      c.toLowerCase().includes(countrySearch.toLowerCase()) && c !== selectedCountry
    );
  }, [countrySearch, availableCountries, selectedCountry]);

  // Chloe: Aplica o filtro de país selecionado
  const filteredByCountry = useMemo(() => {
    if (!selectedCountry) return images;
    return images.filter(img => img.country === selectedCountry);
  }, [images, selectedCountry]);

  /**
   * CHLOE: ORDENAÇÃO MÁGICA CRESCENTE (1, 2, 3... 100)
   * Garante que o gameNumber manda na ordem em todas as vistas.
   */
  const sortedImages = useMemo(() => {
    return [...filteredByCountry].sort((a, b) => {
      const numA = a.gameNumber?.toString().trim() || "";
      const numB = b.gameNumber?.toString().trim() || "";
      
      // Chloe: Itens sem número vão para o final da fila (hihi!)
      if (numA === "" && numB === "") return 0;
      if (numA === "") return 1;
      if (numB === "") return -1;
      
      // Chloe: numeric: true faz com que "2" venha antes de "10" (ordem natural)
      return numA.localeCompare(numB, undefined, { 
        numeric: true, 
        sensitivity: 'base' 
      });
    });
  }, [filteredByCountry]);

  const totalPages = Math.ceil(sortedImages.length / ITEMS_PER_PAGE);
  const displayedImages = sortedImages.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );

  const isRecent = (createdAt: number) => (Date.now() - createdAt) < FORTY_EIGHT_HOURS;

  const handleSelectCountry = (country: string) => {
    setSelectedCountry(country);
    setCountrySearch('');
    setShowSuggestions(false);
  };

  const clearCountryFilter = () => {
    setSelectedCountry(null);
    setCountrySearch('');
  };

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-600 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10 animate-fade-in">
        <Filter className="w-12 h-12 mb-4 opacity-10" />
        <p className="font-black uppercase tracking-[0.2em] text-[10px]">Silêncio no Arquivo Mundial.</p>
        <p className="text-[9px] uppercase tracking-widest mt-2 text-slate-700">Tente ajustar os filtros ou a pesquisa.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* BARRA DE FILTRO DE PAÍS OTIMIZADA */}
      <div className="flex flex-wrap items-center gap-4 bg-slate-900/40 border border-white/5 p-4 rounded-3xl backdrop-blur-md">
         <div className="flex items-center gap-3 pr-4 border-r border-white/10">
            <div className="p-2 bg-brand-600/20 rounded-xl">
               <MapPin className="w-4 h-4 text-brand-400" />
            </div>
            <span className="text-[10px] font-black text-white uppercase tracking-widest hidden sm:inline">Países no Lote</span>
         </div>

         <div className="relative flex-1 max-w-sm" ref={suggestionsRef}>
            <div className="relative group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
               <input 
                 type="text"
                 placeholder="Filtrar por País..."
                 value={countrySearch}
                 onChange={(e) => {
                   setCountrySearch(e.target.value);
                   setShowSuggestions(true);
                 }}
                 onFocus={() => setShowSuggestions(true)}
                 className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-10 pr-4 py-2 text-xs text-white outline-none focus:border-brand-500/50 transition-all placeholder:text-slate-700"
               />
            </div>

            {/* SUGESTÕES INTELIGENTES */}
            {showSuggestions && filteredSuggestions.length > 0 && (
               <div className="absolute top-full left-0 w-full mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-[100] max-h-60 overflow-y-auto custom-scrollbar p-2 animate-bounce-in">
                  {filteredSuggestions.map(country => (
                     <button 
                       key={country}
                       onClick={() => handleSelectCountry(country)}
                       className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-brand-600 hover:text-white text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all flex items-center justify-between"
                     >
                        {country}
                        <ChevronRight className="w-3 h-3 opacity-30" />
                     </button>
                  ))}
               </div>
            )}
         </div>

         {/* TAG DE FILTRO ATIVO */}
         {selectedCountry && (
            <div className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-2xl text-[9px] font-black uppercase shadow-lg animate-fade-in border border-brand-400/30">
               <Check className="w-3 h-3" />
               <span>{selectedCountry}</span>
               <button onClick={clearCountryFilter} className="ml-1 hover:text-red-200 transition-colors">
                  <X className="w-3 h-3" />
               </button>
            </div>
         )}

         <div className="ml-auto flex items-center gap-2">
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">
               A mostrar {sortedImages.length} de {images.length} itens (Ordenado por Nº Jogo)
            </span>
         </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10 gap-2 md:gap-3 transition-all">
        {displayedImages.map((item) => (
          <div
            key={item.id}
            className="group bg-slate-950 border border-slate-900 hover:border-brand-500/50 transition-all cursor-pointer flex flex-col rounded-md overflow-hidden shadow-xl active:scale-95 animate-fade-in"
            onClick={() => onImageClick(item)}
          >
            <div className="px-1 py-0.5 bg-black border-b border-slate-900 flex justify-between items-center text-[5px] font-black text-slate-600 uppercase tracking-widest">
               <span className="truncate max-w-[30px]">#{item.gameNumber}</span>
               <span className="truncate max-w-[40px]">{item.country}</span>
            </div>

            <div className="relative aspect-[3/4] bg-slate-900 overflow-hidden">
              <img 
                src={item.frontUrl} 
                alt={item.gameName} 
                className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${item.backUrl ? 'group-hover:opacity-0' : ''}`} 
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/400x600/1e293b/475569?text=Sem+Imagem';
                }}
              />
              {item.backUrl && (
                <img 
                  src={item.backUrl} 
                  className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity" 
                  alt="Verso"
                  loading="lazy"
                />
              )}
              
              <div className="absolute top-0 right-0 flex flex-col gap-0.5 items-end z-20">
                {isRecent(item.createdAt) && (
                   <div className="flex items-center gap-1 bg-gradient-to-r from-pink-600 to-rose-500 text-white px-2 py-1 rounded-bl-xl text-[7px] font-black animate-pulse shadow-[0_0_15px_rgba(225,29,72,0.5)] border-l border-b border-white/20">
                     <Zap className="w-2 h-2 fill-current text-yellow-300" />
                     <span>NOVO</span>
                   </div>
                )}
                <div className="flex flex-col gap-1 pr-1 pt-1">
                   {item.isWinner && (
                     <div className="bg-green-600 p-0.5 rounded-full shadow-md">
                       <Trophy className="w-1.5 h-1.5 text-white" />
                     </div>
                   )}
                   {item.isSeries && (
                     <div className="bg-blue-600 p-0.5 rounded-full shadow-md border border-blue-400/50" title="Faz parte de uma série">
                       <Layers className="w-1.5 h-1.5 text-white" />
                     </div>
                   )}
                </div>
              </div>
            </div>

            <div className="p-1 bg-slate-950 flex flex-col flex-1 border-t border-slate-900/50">
              <h3 className="font-black text-slate-500 text-[7px] leading-tight truncate uppercase group-hover:text-brand-500 transition-colors">
                {item.gameName}
              </h3>
              <div className="mt-0.5 flex items-center justify-between">
                <span className="text-[4px] text-slate-700 font-black uppercase tracking-widest">{item.customId?.split('-')[1]}</span>
                <StateBadge state={item.state} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-4 mb-8">
          <button 
            onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
            disabled={currentPage === 1} 
            className="p-1.5 bg-slate-900 text-slate-400 rounded-full border border-slate-800 disabled:opacity-10 hover:bg-brand-500 hover:text-white transition-all active:scale-90"
          >
             <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="px-4 py-1 bg-slate-950 rounded-full border border-slate-800">
             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
               {currentPage} / {totalPages}
             </span>
          </div>

          <button 
            onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
            disabled={currentPage === totalPages} 
            className="p-1.5 bg-slate-900 text-slate-400 rounded-full border border-slate-800 disabled:opacity-10 hover:bg-brand-500 hover:text-white transition-all active:scale-90"
          >
             <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
