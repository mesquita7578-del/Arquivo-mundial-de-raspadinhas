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

const ITEMS_PER_PAGE = 60;

const StateBadge = ({ state }: { state: string }) => {
  const colors: Record<string, string> = {
    'MINT': 'bg-green-500/20 text-green-400 border-green-500/50',
    'SC': 'bg-slate-700 text-slate-300 border-slate-600',
    'AMOSTRA': 'bg-purple-500/20 text-purple-400 border-purple-500/50',
    'VOID': 'bg-red-500/20 text-red-400 border-red-500/50',
  };
  return (
    <span className={`px-1 py-0.5 rounded text-[8px] font-black uppercase border ${colors[state] || 'bg-slate-700 text-slate-300 border-slate-600'}`}>
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
  currentUser,
  t 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(images.length / ITEMS_PER_PAGE);

  const displayedImages = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return images.slice(start, start + ITEMS_PER_PAGE);
  }, [images, currentPage]);

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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
        {displayedImages.map((item) => (
          <div
            key={item.id}
            className="group bg-slate-900 border border-slate-800 hover:border-blue-500 transition-all cursor-pointer flex flex-col rounded-lg overflow-hidden shadow-lg"
            onClick={() => onImageClick(item)}
          >
            {/* CABEÇALHO TÉCNICO (Screenshot Match) */}
            <div className="px-2 py-1.5 bg-slate-950 border-b border-slate-800 flex justify-between items-center text-[9px] font-mono text-slate-400">
               <div className="flex items-center gap-1">
                  <span className="text-blue-500 font-bold">Nº</span> {item.gameNumber}
               </div>
               <div className="flex items-center gap-1">
                  {item.releaseDate.split('-')[0]}
               </div>
            </div>

            <div className="relative aspect-[3/4] bg-black flex items-center justify-center p-2">
              <SafeImage src={item.frontUrl} alt={item.gameName} className="w-full h-full object-contain transition-transform group-hover:scale-105" />
              
              <div className="absolute top-2 left-2 flex flex-col gap-1 z-20">
                 <div className="bg-slate-950/80 backdrop-blur text-white text-[8px] font-mono px-1.5 py-0.5 rounded border border-slate-700">
                    {item.customId}
                 </div>
              </div>

               <div className="absolute top-2 right-2 flex flex-col gap-1 items-end z-20">
                  {currentUser && item.owners?.includes(currentUser) && (
                     <div className="bg-blue-600 text-white p-1 rounded-full shadow-lg border border-blue-400">
                        <CheckCircle2 className="w-3 h-3" />
                     </div>
                  )}
                  {item.isWinner && <div className="bg-green-600 text-white p-1 rounded-full shadow-lg"><Trophy className="w-3 h-3" /></div>}
               </div>
            </div>

            <div className="p-3 bg-slate-900 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-1 gap-1">
                <h3 className="font-bold text-slate-200 text-[11px] leading-tight truncate flex-1 uppercase tracking-tight" title={item.gameName}>{item.gameName}</h3>
                <StateBadge state={item.state} />
              </div>
              <div className="mt-auto flex items-center gap-1 text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                <MapPin className="w-2.5 h-2.5" /> <span className="truncate">{item.country}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-6 py-10">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-30 hover:bg-slate-700 transition-colors">
             <ChevronLeft className="w-4 h-4" /> Anterior
          </button>
          <div className="text-sm font-bold text-slate-400">Página {currentPage} de {totalPages}</div>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-30 hover:bg-slate-700 transition-colors">
             Próxima <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};