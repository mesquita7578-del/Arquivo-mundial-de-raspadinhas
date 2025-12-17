import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Edit2, Trash2, Save, Share2, Check, RotateCcw, AlertTriangle, AlignJustify, Layers, Trophy, ZoomIn, ZoomOut, LayoutTemplate, Star } from 'lucide-react';
import { ScratchcardData, Category, LineType } from '../types';

interface ImageViewerProps {
  image: ScratchcardData;
  onClose: () => void;
  onUpdate: (data: ScratchcardData) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
  currentUser?: string | null;
  contextImages: ScratchcardData[];
  onImageSelect: (img: ScratchcardData) => void;
  t: any;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ image, onClose, onUpdate, onDelete, isAdmin, currentUser, contextImages, onImageSelect, t }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ScratchcardData>(image);
  const [activeImage, setActiveImage] = useState<string>(image.frontUrl);
  const [activeLabel, setActiveLabel] = useState<string>('front');
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    setFormData(image);
    setActiveImage(image.frontUrl);
    setActiveLabel('front');
    setIsEditing(false);
    setIsZoomed(false);
  }, [image]);

  const handleChange = (field: keyof ScratchcardData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm(t.deleteConfirm)) onDelete(image.id);
  };
  
  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentIndex = contextImages.findIndex(img => img.id === image.id);
    if (currentIndex < contextImages.length - 1) onImageSelect(contextImages[currentIndex + 1]);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentIndex = contextImages.findIndex(img => img.id === image.id);
    if (currentIndex > 0) onImageSelect(contextImages[currentIndex - 1]);
  };

  const toggleCollection = () => {
    if (!currentUser) return;
    const currentOwners = formData.owners || [];
    const newOwners = currentOwners.includes(currentUser) ? currentOwners.filter(o => o !== currentUser) : [...currentOwners, currentUser];
    const newData = { ...formData, owners: newOwners };
    setFormData(newData);
    onUpdate(newData);
  };

  const toggleFeatured = () => {
    if (!isAdmin) return;
    const newData = { ...formData, isFeatured: !formData.isFeatured };
    setFormData(newData);
    onUpdate(newData);
  };

  const toggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsZoomed(!isZoomed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in" onClick={onClose}>
      <button className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-50" onClick={onClose}><X className="w-8 h-8" /></button>

      <button onClick={handlePrev} className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white p-2 md:p-4 hidden md:block z-40" disabled={contextImages.findIndex(img => img.id === image.id) === 0}>
         <ChevronLeft className="w-10 h-10 md:w-12 md:h-12" />
      </button>
      <button onClick={handleNext} className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white p-2 md:p-4 hidden md:block z-40" disabled={contextImages.findIndex(img => img.id === image.id) === contextImages.length - 1}>
         <ChevronRight className="w-10 h-10 md:w-12 md:h-12" />
      </button>

      <div className="w-full max-w-6xl h-[90vh] flex flex-col md:flex-row bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl" onClick={e => e.stopPropagation()}>
         
         <div className="flex-1 bg-black relative flex flex-col overflow-hidden">
            <div className="absolute top-4 right-4 z-30 flex gap-2">
               {isAdmin && (
                  <button onClick={toggleFeatured} className={`p-2 rounded-full border backdrop-blur transition-all ${formData.isFeatured ? 'bg-amber-500 text-black border-amber-400' : 'bg-black/50 text-white/50 border-white/10 hover:text-white'}`} title="Montra Digital">
                     <LayoutTemplate className="w-5 h-5" />
                  </button>
               )}
               <button onClick={toggleZoom} className="bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur border border-white/10 transition-colors">
                  {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
               </button>
            </div>

            <div className="absolute top-4 left-4 z-30 bg-black/50 text-white text-[10px] px-3 py-1.5 rounded-full backdrop-blur border border-white/10 uppercase tracking-widest font-bold shadow-lg">
               {activeLabel === 'front' ? 'FRENTE' : activeLabel === 'back' ? 'VERSO' : 'VARIANTE'}
               {formData.isFeatured && <span className="ml-2 text-amber-400">• MONTRA</span>}
            </div>

            <div className={`flex-1 relative flex items-center justify-center overflow-hidden transition-all duration-300 ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in p-4 md:p-8'}`} onClick={toggleZoom}>
               <img src={activeImage} className={`transition-transform duration-300 ease-out shadow-2xl ${isZoomed ? 'w-full h-auto scale-125' : 'max-w-full max-h-full object-contain'}`} style={{ maxHeight: isZoomed ? 'none' : '90%', maxWidth: isZoomed ? 'none' : '90%' }} />
            </div>

            <div className="h-16 md:h-20 bg-slate-950/90 backdrop-blur border-t border-white/10 p-2 flex items-center gap-2 justify-center overflow-x-auto shrink-0 z-30">
               <button onClick={() => { setActiveImage(image.frontUrl); setActiveLabel('front'); setIsZoomed(false); }} className={`relative h-full aspect-square rounded overflow-hidden border-2 transition-all ${activeLabel === 'front' ? 'border-brand-500 scale-105' : 'border-transparent opacity-50'}`}><img src={image.frontUrl} className="w-full h-full object-cover" /></button>
               {image.backUrl && <button onClick={() => { setActiveImage(image.backUrl!); setActiveLabel('back'); setIsZoomed(false); }} className={`relative h-full aspect-square rounded overflow-hidden border-2 transition-all ${activeLabel === 'back' ? 'border-brand-500 scale-105' : 'border-transparent opacity-50'}`}><img src={image.backUrl} className="w-full h-full object-cover" /></button>}
            </div>
         </div>

         <div className="w-full md:w-96 bg-slate-900 border-l border-slate-800 flex flex-col h-[40vh] md:h-full z-20 shadow-2xl overflow-y-auto">
            <div className="p-6 space-y-6">
               <div className="flex justify-between items-center">
                  {isAdmin ? (
                     <div className="flex gap-2">
                        {isEditing ? (
                           <><button onClick={handleSave} className="p-2 bg-green-600 text-white rounded"><Save className="w-4 h-4"/></button><button onClick={() => setIsEditing(false)} className="p-2 bg-slate-700 text-white rounded"><X className="w-4 h-4"/></button></>
                        ) : (
                           <><button onClick={() => setIsEditing(true)} className="p-2 bg-blue-600 text-white rounded"><Edit2 className="w-4 h-4"/></button><button onClick={handleDelete} className="p-2 bg-red-600 text-white rounded"><Trash2 className="w-4 h-4"/></button></>
                        )}
                     </div>
                  ) : <div></div>}

                  {currentUser && (
                     <button onClick={toggleCollection} className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-2 ${formData.owners?.includes(currentUser) ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                        <Check className="w-3 h-3" /> {formData.owners?.includes(currentUser) ? 'Na Coleção' : 'Marcar'}
                     </button>
                  )}
               </div>

               <div>
                  {isEditing ? (
                     <input type="text" value={formData.gameName} onChange={e => handleChange('gameName', e.target.value)} className="w-full bg-slate-800 text-white text-xl font-bold rounded p-2 border border-slate-700" />
                  ) : (
                     <h2 className="text-2xl font-bold text-white mb-1 leading-tight flex items-center gap-2">
                        {formData.gameName}
                        {formData.isFeatured && <Star className="w-5 h-5 text-amber-500 fill-amber-500" />}
                     </h2>
                  )}
                  <p className="text-sm text-slate-400">{formData.country} {formData.region ? `• ${formData.region}` : ''} • {formData.releaseDate.split('-')[0]}</p>
               </div>

               <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 rounded text-[10px] font-bold uppercase border bg-slate-700 text-slate-300">{formData.state}</span>
                  {formData.isFeatured && <span className="px-2 py-1 rounded text-[10px] font-bold uppercase border bg-amber-900/20 text-amber-500 border-amber-500/30">Montra Digital</span>}
                  {formData.isRarity && <span className="px-2 py-1 rounded text-[10px] font-bold uppercase border bg-brand-900/20 text-brand-400 border-brand-500/30">Raridade</span>}
                  {formData.isWinner && <span className="px-2 py-1 rounded text-[10px] font-bold uppercase border bg-green-900/20 text-green-400 border-green-500/30 flex items-center gap-1"><Trophy className="w-3 h-3" /> {formData.prizeAmount}</span>}
               </div>

               <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-slate-800/50 p-3 rounded-lg"><span className="text-[10px] text-slate-500 uppercase block mb-1">Nº Jogo</span><span className="font-mono text-white">{formData.gameNumber}</span></div>
                  <div className="bg-slate-800/50 p-3 rounded-lg"><span className="text-[10px] text-slate-500 uppercase block mb-1">Preço</span><span className="font-mono text-white">{formData.price || '-'}</span></div>
               </div>

               <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-800/50">
                  <span className="text-[10px] text-slate-500 uppercase block mb-2 font-bold">Informação</span>
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{formData.values || 'Nenhuma nota registada.'}</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};