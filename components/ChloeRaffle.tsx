
import React, { useRef, useEffect, useState } from 'react';
import { ScratchcardData } from '../types';
import { X, Sparkles, Wand2, Loader2, PartyPopper, MapPin, Calendar } from 'lucide-react';
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

    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      ctx.fillStyle = '#1e293b'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillStyle = '#475569';
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
    ctx.arc(pos.x, pos.y, 30, 0, Math.PI * 2);
    ctx.fill();

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
    if (percent > 55 && !isRevealed) {
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
      <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-[3rem] p-6 md:p-10 shadow-[0_0_100px_rgba(244,63,94,0.3)] relative overflow-hidden flex flex-col">
        
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white z-50 p-2 bg-slate-800 rounded-full transition-colors"><X className="w-6 h-6" /></button>
        
        <div className="text-center space-y-1 mb-8">
            <h3 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter uppercase flex items-center justify-center gap-3">
              <Wand2 className="w-8 h-8 text-brand-500 animate-bounce" /> Sorteio da Chloe
            </h3>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Descubra o tesouro do dia, vovô! hihi!</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-center md:items-stretch">
            {/* LADO ESQUERDO: ÁREA DE RASPAGEM */}
            <div className="flex-1 w-full relative aspect-[4/3] md:aspect-auto bg-slate-950 rounded-3xl border-2 border-slate-800 overflow-hidden shadow-2xl group min-h-[300px]">
                {/* The Hidden Item */}
                <div className={`absolute inset-0 p-6 flex flex-col items-center justify-center text-center transition-all duration-1000 ${isRevealed ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                    <div className="relative w-full h-full">
                      <img src={item.frontUrl} className="w-full h-full object-contain rounded-xl drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]" alt={item.gameName} />
                      {isRevealed && <div className="absolute -top-6 -right-6"><PartyPopper className="w-16 h-16 text-brand-500 animate-bounce" /></div>}
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

            {/* LADO DIREITO: INFOS E COMENTÁRIOS */}
            <div className="w-full md:w-80 flex flex-col justify-between space-y-6">
                <div className={`space-y-4 transition-all duration-1000 ${isRevealed ? 'opacity-100 translate-x-0' : 'opacity-20 translate-x-10'}`}>
                    <div className="space-y-1">
                        <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest">Item Sorteado:</span>
                        <h4 className="text-white font-black uppercase text-2xl leading-tight italic tracking-tighter">{item.gameName}</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-700/50 flex flex-col items-center text-center">
                            <MapPin className="w-4 h-4 text-blue-400 mb-1" />
                            <span className="text-[8px] font-black text-slate-500 uppercase">País</span>
                            <span className="text-xs font-black text-slate-200">{item.country}</span>
                        </div>
                        <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-700/50 flex flex-col items-center text-center">
                            <Calendar className="w-4 h-4 text-orange-400 mb-1" />
                            <span className="text-[8px] font-black text-slate-500 uppercase">Emissão</span>
                            <span className="text-xs font-black text-slate-200">{item.releaseDate?.split('-')[0] || '-'}</span>
                        </div>
                    </div>

                    <div className="bg-slate-950 p-5 rounded-[2rem] border border-slate-800 relative overflow-hidden group">
                        <Sparkles className="absolute -top-4 -right-4 w-12 h-12 text-brand-500/10 group-hover:rotate-12 transition-transform" />
                        {isLoadingComment ? (
                          <div className="flex flex-col items-center justify-center py-4 gap-2 text-slate-500">
                            <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Chloe está a pensar...</span>
                          </div>
                        ) : isRevealed ? (
                          <p className="text-sm text-slate-300 font-medium italic leading-relaxed text-center relative z-10">
                            "{chloeComment || 'Vovô, que tesouro fantástico encontramos hoje! hihi!'}"
                          </p>
                        ) : (
                          <div className="py-6 text-center">
                             <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest animate-pulse">Aguardando a raspagem...</p>
                          </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    {isRevealed && (
                      <button onClick={() => { onViewItem(item); onClose(); }} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-900/20 transition-all flex items-center justify-center gap-2 animate-bounce-in">
                        Ver no Arquivo <Sparkles className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={onClose} className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
                        {isRevealed ? 'Fechar Sorteio' : 'Desistir da Sorte'}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
