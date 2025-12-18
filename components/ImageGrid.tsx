
import React, { useState, useMemo } from 'react';
import { 
  Filter, Zap, Trophy, CheckCircle2, Image as ImageIcon, ChevronLeft, ChevronRight, MapPin
} from 'lucide-react';
import { ScratchcardData } from '../types';

interface ImageGridProps {
  images: ScratchcardData[];
  onImageClick: (item: ScratchcardData) => void;
  isAdmin?: boolean;
  currentUser?: string | null;
  t: any;
}

const ITEMS_PER_PAGE = 100;

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
  
  // Garante que as imagens estejam ordenadas por gameNumber antes de paginar
  const sortedImages = useMemo(() => {
    return [...images].sort((a, b) => {
      const numA = a.gameNumber || "";
      const numB = b.gameNumber || "";
      return numA.localeCompare(numB, undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [images]);

  const totalPages = Math.ceil(sortedImages.length / ITEMS_PER_PAGE);

  const displayedImages = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedImages.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedImages, currentPage]);

  const isRecent = (createdAt: number) => {
    const fortyEightHoursInMs = 48 * 60 * 60 * 1000;
    return (Date.now() - createdAt) < fortyEightHoursInMs;
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
    <div className="space-y-12">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 gap-2 md:gap-3">
        {displayedImages.map((item) => {
          const itemIsRecent = isRecent(item.createdAt);
          
          return (
            <div
              key={item.id}
              className="group bg-slate-950 border border-slate-900 hover:border-blue-600/50 transition-all duration-300 cursor-pointer flex flex-col rounded-sm overflow-hidden shadow-2xl hover:shadow-blue-500/10 active:scale-95"
              onClick={() => onImageClick(item)}
            >
              <div className="px-1.5 py-1 bg-black border-b border-slate-900 flex justify-between items-center text-[6px] font-black text-slate-600 uppercase tracking-widest">
                 <div className="flex items-center gap-0.5">
                    <span className="text-blue-900">REF</span> {item.gameNumber}
                 </div>
                 <span className="group-hover:text-slate-400 transition-colors">{item.releaseDate.split('-')[0]}</span>
              </div>

              <div className="relative aspect-[3/4] bg-black flex items-center justify-center overflow-hidden">
                <SafeImage 
                  src={item.frontUrl} 
                  alt={item.gameName} 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" 
                />
                
                <div className="absolute top-1 left-1 flex flex-col gap-0.5 z-20">
                   <div className="bg-black/60 backdrop-blur-md text-white text-[7px] font-black px-1.5 py-0.5 rounded-sm border border-white/5 uppercase tracking-tighter leading-none shadow-xl">
                      {item.customId}
                   </div>
                </div>

                 <div className="absolute top-1 right-1 flex flex-col gap-1 items-end z-20">
                    {itemIsRecent && (
                       <div className="bg-blue-600/20 backdrop-blur-md text-red-500 px-2 py-0.5 rounded-sm shadow-[0_0_15px_rgba(59,130,246,0.3)] -rotate-12 border border-blue-500/30 flex items-center gap-1 animate-pulse" title="Adicionado nas últimas 48h!">
                          <Zap className="w-2.5 h-2.5 fill-current drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
                          <span className="text-[7px] font-black uppercase tracking-widest drop-shadow-[0_0_2px_rgba(239,68,68,0.8)]">NOVO</span>
                       </div>
                    )}
                    {currentUser && item.owners?.includes(currentUser) && (
                       <div className="bg-blue-600/80 backdrop-blur-sm text-white p-1 rounded-full shadow-lg border border-blue-400/50">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                       </div>
                    )}
                    {item.isWinner && <div className="bg-green-600/80 backdrop-blur-sm text-white p-1 rounded-full shadow-lg border border-green-400/50"><Trophy className="w-2.5 h-2.5" /></div>}
                 </div>
                 
                 <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black to-transparent pointer-events-none opacity-60"></div>
              </div>

              <div className="p-1.5 bg-slate-950 flex flex-col flex-1 border-t border-slate-900/50">
                <div className="flex justify-between items-start mb-1 gap-1">
                  <h3 className="font-black text-slate-400 text-[9px] leading-tight truncate flex-1 uppercase tracking-tighter group-hover:text-blue-400 transition-colors" title={item.gameName}>{item.gameName}</h3>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-0.5 text-[7px] text-slate-600 font-black uppercase tracking-widest">
                    <MapPin className="w-2 h-2" /> <span className="truncate max-w-[50px]">{item.country}</span>
                  </div>
                  <StateBadge state={item.state} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-6 py-12">
          <button 
            onClick={() => {setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo(0,0);}} 
            disabled={currentPage === 1} 
            className="group flex items-center gap-2 px-6 py-2.5 bg-slate-900/40 backdrop-blur-xl text-slate-400 border border-slate-800/50 rounded-full disabled:opacity-10 hover:bg-blue-600/20 hover:text-blue-400 hover:border-blue-500/30 transition-all text-[10px] font-black uppercase tracking-widest shadow-2xl"
          >
             <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {t.prev}
          </button>
          
          <div className="px-4 py-1.5 bg-slate-950/80 rounded-full border border-slate-800/50 shadow-inner">
             <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">PAG <span className="text-slate-300">{currentPage}</span> / {totalPages}</span>
          </div>

          <button 
            onClick={() => {setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0,0);}} 
            disabled={currentPage === totalPages} 
            className="group flex items-center gap-2 px-6 py-2.5 bg-slate-900/40 backdrop-blur-xl text-slate-400 border border-slate-800/50 rounded-full disabled:opacity-10 hover:bg-blue-600/20 hover:text-blue-400 hover:border-blue-500/30 transition-all text-[10px] font-black uppercase tracking-widest shadow-2xl"
          >
             {t.next} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
};
