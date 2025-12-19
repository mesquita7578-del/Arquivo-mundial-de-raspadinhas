
import React, { useRef, useEffect, useState } from 'react';
import { ScratchcardData } from '../types';
import { X, Sparkles, Wand2, Loader2, PartyPopper } from 'lucide-react';
import { getChloeMagicComment } from '../services/geminiService';

interface ChloeRaffleProps {
  item: ScratchcardData;
  onClose: () => void;
  onViewItem: (item: ScratchcardData) => void;
}

export const ChloeRaffle: React.FC<ChloeRaffleProps> = ({ item, onClose, onViewItem }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [chloeComment, setChloeComment] = useState<string | null>(null);
  const [isLoadingComment, setIsLoadingComment] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match the container
    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // Draw the scratch layer
      ctx.fillStyle = '#1e293b'; // slate-800
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add text/pattern to the scratch layer
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillStyle = '#475569'; // slate-600
      ctx.textAlign = 'center';
      for(let i = 0; i < 20; i++) {
        for(let j = 0; j < 20; j++) {
            ctx.fillText('SORTE', i * 60, j * 40);
        }
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const getPointerPos = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const scratch = (e: any) => {
    if (!isDrawing || isRevealed) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const pos = getPointerPos(e);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 25, 0, Math.PI * 2);
    ctx.fill();

    // Check progress
    checkReveal();
  };

  const checkReveal = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] < 128) transparentPixels++;
    }

    const percent = (transparentPixels / (pixels.length / 4)) * 100;
    if (percent > 60 && !isRevealed) {
      setIsRevealed(true);
      handleRevealComplete();
    }
  };

  const handleRevealComplete = async () => {
    setIsLoadingComment(true);
    try {
      const comment = await getChloeMagicComment(item);
      setChloeComment(comment);
    } finally {
      setIsLoadingComment(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-fade-in">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-[3rem] p-8 shadow-[0_0_100px_rgba(244,63,94,0.3)] relative overflow-hidden">
        
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white z-50"><X className="w-6 h-6" /></button>
        
        <div className="text-center space-y-2 mb-8">
            <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase flex items-center justify-center gap-3">
              <Wand2 className="w-6 h-6 text-brand-500 animate-bounce" /> Sorteio da Chloe
            </h3>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Raspe o ecrã para ver o seu tesouro! hihi!</p>
        </div>

        <div className="relative aspect-[3/4] bg-slate-950 rounded-2xl border-2 border-slate-800 overflow-hidden shadow-2xl group">
            {/* The Hidden Item */}
            <div className={`absolute inset-0 p-4 flex flex-col items-center justify-center text-center transition-all duration-1000 ${isRevealed ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <div className="relative w-full h-full mb-4">
                  <img src={item.frontUrl} className="w-full h-full object-contain rounded-xl shadow-2xl" alt={item.gameName} />
                  {isRevealed && <div className="absolute -top-4 -right-4"><PartyPopper className="w-12 h-12 text-brand-500 animate-bounce" /></div>}
                </div>
                <div className="space-y-1">
                  <h4 className="text-white font-black uppercase text-lg leading-tight">{item.gameName}</h4>
                  <p className="text-brand-500 text-[10px] font-black uppercase tracking-widest">{item.country} • {item.releaseDate?.split('-')[0]}</p>
                </div>
            </div>

            {/* The Scratch Layer */}
            <canvas
              ref={canvasRef}
              className={`absolute inset-0 w-full h-full cursor-crosshair transition-opacity duration-1000 ${isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
              onMouseDown={() => setIsDrawing(true)}
              onMouseUp={() => setIsDrawing(false)}
              onMouseMove={scratch}
              onTouchStart={() => setIsDrawing(true)}
              onTouchEnd={() => setIsDrawing(false)}
              onTouchMove={scratch}
            />
        </div>

        <div className="mt-8 space-y-4">
           {isRevealed && (
             <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 animate-bounce-in relative overflow-hidden">
                <Sparkles className="absolute -top-4 -right-4 w-12 h-12 text-brand-500/20" />
                {isLoadingComment ? (
                  <div className="flex items-center justify-center gap-2 text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-[10px] font-black uppercase">Chloe está a pensar...</span>
                  </div>
                ) : (
                  <p className="text-sm text-slate-200 font-medium italic leading-relaxed text-center">
                    "{chloeComment}"
                  </p>
                )}
             </div>
           )}

           <div className="flex gap-4">
             <button onClick={onClose} className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">Fechar</button>
             {isRevealed && (
               <button onClick={() => { onViewItem(item); onClose(); }} className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-900/20 transition-all flex items-center justify-center gap-2">
                 Ver Detalhes <Sparkles className="w-4 h-4" />
               </button>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};
