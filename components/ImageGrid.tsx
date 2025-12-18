
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
    'MINT': 'bg-green-500/20 text-green-400 border-green-500/50',
    'SC': 'bg-slate-700 text-slate-300 border-slate-600',
    'AMOSTRA': 'bg-purple-500/20 text-purple-400 border-purple-500/50',
    'VOID': 'bg-red-500/20 text-red-400 border-red-500/50',
  };
  return (
    <span className={`px-1 py-0.5 rounded text-[7px] font-black uppercase border ${colors[state] || 'bg-slate-700 text-slate-300 border-slate-600'}`}>
      {state}
    </span>
  );
};

const SafeImage = ({ src, alt, className }: { src: string, alt: string, className?: string }) => {
    const [error, setError] = useState(false);
    if (error || !src) return <div className={`flex items-center justify-center bg-slate-800 ${className}`}><ImageIcon className="w-5 h-5 text-slate-600" /></div>;
    return <img src={src} alt={alt} className={className} onError={() => setError(true)} loading="lazy" />;
};

export const ImageGrid: React.FC<ImageGridProps> = ({ 
  images, 
  onImageClick, 
  currentUser,
  t 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(images.length / ITEMS_PER_PAGE);

  const displayedImages = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return images.slice(start, start + ITEMS_PER_PAGE);
  }, [images, currentPage]);

  const isRecent = (createdAt: number) => {
    const fortyEightHoursInMs = 48 * 60 * 60 * 1000;
    return (Date.now() - createdAt) < fortyEightHoursInMs;
  };

  if (images.length === 0) {
     return (
        <div className="flex flex-col items-center justify-center py-20 text-slate-600 border border-dashed border-slate-800 rounded-2xl">
           <Filter className="w-12 h-12 mb-4 opacity-20" />
           <p className="font-bold uppercase tracking-widest text-sm">Sem resultados no arquivo.</p>
        </div>
     );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 gap-2 md:gap-3">
        {displayedImages.map((item) => {
          const itemIsRecent = isRecent(item.createdAt);
          
          return (
            <div
              key={item.id}
              className="group bg-slate-900 border border-slate-800 hover:border-blue-500 transition-all cursor-pointer flex flex-col rounded-md overflow-hidden shadow-sm hover:shadow-blue-900/20"
              onClick={() => onImageClick(item)}
            >
              <div className="px-1.5 py-1 bg-slate-950 border-b border-slate-800 flex justify-between items-center text-[7px] font-mono text-slate-500">
                 <div className="flex items-center gap-0.5">
                    <span className="text-blue-500 font-bold">Nº</span> {item.gameNumber}
                 </div>
                 <span>{item.releaseDate.split('-')[0]}</span>
              </div>

              <div className="relative aspect-[3/4] bg-slate-800 flex items-center justify-center overflow-hidden">
                <SafeImage 
                  src={item.frontUrl} 
                  alt={item.gameName} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                />
                
                <div className="absolute top-1 left-1 flex flex-col gap-0.5 z-20">
                   <div className="bg-slate-950/80 backdrop-blur text-white text-[7px] font-mono px-1 py-0.5 rounded border border-slate-700 leading-none">
                      {item.customId}
                   </div>
                </div>

                 <div className="absolute top-1 right-1 flex flex-col gap-0.5 items-end z-20">
                    {/* INDICADOR NOVO - AZUL TRANSPARENTE COM LETRAS VERMELHAS */}
                    {itemIsRecent && (
                       <div className="bg-blue-600/40 backdrop-blur-sm text-red-500 px-1.5 py-0.5 rounded-full shadow-lg animate-pulse border border-red-500/30 flex items-center gap-0.5" title="Adicionado nas últimas 48h!">
                          <Zap className="w-2 h-2 fill-current" />
                          <span className="text-[6px] font-black uppercase tracking-tighter">Novo</span>
                       </div>
                    )}
                    {currentUser && item.owners?.includes(currentUser) && (
                       <div className="bg-blue-600 text-white p-0.5 rounded-full shadow-lg border border-blue-400">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                       </div>
                    )}
                    {item.isWinner && <div className="bg-green-600 text-white p-0.5 rounded-full shadow-lg"><Trophy className="w-2.5 h-2.5" /></div>}
                 </div>
                 
                 <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-slate-950/60 to-transparent pointer-events-none"></div>
              </div>

              <div className="p-1.5 bg-slate-900 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-0.5 gap-1">
                  <h3 className="font-bold text-slate-200 text-[9px] leading-tight truncate flex-1 uppercase tracking-tighter" title={item.gameName}>{item.gameName}</h3>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-0.5 text-[8px] text-slate-500 font-bold uppercase tracking-tighter">
                    <MapPin className="w-2 h-2" /> <span className="truncate max-w-[40px]">{item.country}</span>
                  </div>
                  <StateBadge state={item.state} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-8">
          <button onClick={() => {setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo(0,0);}} disabled={currentPage === 1} className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 text-white rounded-lg disabled:opacity-30 hover:bg-slate-700 transition-colors text-xs font-bold">
             <ChevronLeft className="w-3.5 h-3.5" /> Ant.
          </button>
          <div className="text-[10px] font-bold text-slate-500 uppercase">Página {currentPage} / {totalPages}</div>
          <button onClick={() => {setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0,0);}} disabled={currentPage === totalPages} className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 text-white rounded-lg disabled:opacity-30 hover:bg-slate-700 transition-colors text-xs font-bold">
             Próx. <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
