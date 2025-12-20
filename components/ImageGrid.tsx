
import React, { useState, useMemo } from 'react';
import { 
  Filter, Trophy, ChevronLeft, ChevronRight, Zap 
} from 'lucide-react';
import { ScratchcardData } from '../types';

interface ImageGridProps {
  images: ScratchcardData[];
  onImageClick: (item: ScratchcardData) => void;
  isAdmin?: boolean;
  currentUser?: string | null;
  t: any;
}

const ITEMS_PER_PAGE = 50; 

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

  const sortedImages = useMemo(() => {
    return [...images].sort((a, b) => {
      const numA = a.gameNumber?.trim() || "";
      const numB = b.gameNumber?.trim() || "";
      
      if (numA === "" && numB === "") return 0;
      if (numA === "") return 1;
      if (numB === "") return -1;
      
      return numA.localeCompare(numB, undefined, { 
        numeric: true, 
        sensitivity: 'base' 
      });
    });
  }, [images]);

  const totalPages = Math.ceil(sortedImages.length / ITEMS_PER_PAGE);
  const displayedImages = sortedImages.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );

  // Alterado para 12 horas (43200000ms) como o vovô pediu!
  const isRecent = (createdAt: number) => (Date.now() - createdAt) < 43200000;

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-600 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
        <Filter className="w-12 h-12 mb-4 opacity-10" />
        <p className="font-black uppercase tracking-[0.2em] text-[10px]">Silêncio no Arquivo Mundial.</p>
        <p className="text-[9px] uppercase tracking-widest mt-2 text-slate-700">Tente ajustar os filtros ou a pesquisa.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
        {displayedImages.map((item) => (
          <div
            key={item.id}
            className="group bg-slate-950 border border-slate-900 hover:border-brand-500/50 transition-all cursor-pointer flex flex-col rounded-md overflow-hidden shadow-xl active:scale-95"
            onClick={() => onImageClick(item)}
          >
            <div className="px-1 py-0.5 bg-black border-b border-slate-900 flex justify-between items-center text-[5px] font-black text-slate-600 uppercase tracking-widest">
               <span className="truncate max-w-[30px]">#{item.gameNumber}</span>
               <span className="truncate max-w-[40px]">{item.country}</span>
            </div>

            <div className="relative aspect-[3/4] bg-black overflow-hidden">
              <img 
                src={item.frontUrl} 
                alt={item.gameName} 
                className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${item.backUrl ? 'group-hover:opacity-0' : ''}`} 
                loading="lazy"
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
                   <div className="flex items-center gap-1 bg-pink-600 text-white px-2 py-1 rounded-bl-lg text-[8px] font-black animate-pulse shadow-[0_0_15px_rgba(219,39,119,0.6)] border-l border-b border-pink-400/50">
                     <Zap className="w-2 h-2 fill-white" />
                     NOVO
                   </div>
                )}
                {item.isWinner && !isRecent(item.createdAt) && (
                  <div className="bg-green-600 p-0.5 rounded-full shadow-md mr-1 mt-1">
                    <Trophy className="w-1.5 h-1.5 text-white" />
                  </div>
                )}
                {item.isWinner && isRecent(item.createdAt) && (
                  <div className="bg-green-600 p-0.5 rounded-full shadow-md mr-1 mt-0.5">
                    <Trophy className="w-1.5 h-1.5 text-white" />
                  </div>
                )}
              </div>
            </div>

            <div className="p-1 bg-slate-950 flex flex-col flex-1 border-t border-slate-900/50">
              <h3 className="font-black text-slate-500 text-[7px] leading-tight truncate uppercase group-hover:text-brand-500 transition-colors">
                {item.gameName}
              </h3>
              <div className="mt-0.5 flex items-center justify-between">
                <span className="text-[4px] text-slate-700 font-black uppercase tracking-widest">{item.customId.split('-')[1]}</span>
                <StateBadge state={item.state} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-4 mb-8">
          <button 
            onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo(0,0); }} 
            disabled={currentPage === 1} 
            className="p-1.5 bg-slate-900 text-slate-400 rounded-full border border-slate-800 disabled:opacity-10 hover:bg-brand-500 hover:text-white transition-all"
          >
             <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="px-4 py-1 bg-slate-950 rounded-full border border-slate-800">
             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
               {currentPage} / {totalPages}
             </span>
          </div>

          <button 
            onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0,0); }} 
            disabled={currentPage === totalPages} 
            className="p-1.5 bg-slate-900 text-slate-400 rounded-full border border-slate-800 disabled:opacity-10 hover:bg-brand-500 hover:text-white transition-all"
          >
             <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
