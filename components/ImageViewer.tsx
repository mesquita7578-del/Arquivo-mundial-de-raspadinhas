import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Share2, ZoomIn, ZoomOut, Edit2, Trash2, Save, RotateCcw, Check, MapPin, Printer, Layers, Trophy, Gift, Gem, CheckSquare, Square } from 'lucide-react';
import { ScratchcardData, Category } from '../types';

interface ImageViewerProps {
  image: ScratchcardData;
  onClose: () => void;
  onUpdate: (data: ScratchcardData) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
  currentUser?: string | null; // Pass current user to check ownership
  contextImages: ScratchcardData[];
  onImageSelect: (data: ScratchcardData) => void;
  t: any;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ 
  image, 
  onClose, 
  onUpdate, 
  onDelete, 
  isAdmin, 
  currentUser,
  contextImages, 
  onImageSelect,
  t 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ScratchcardData>(image);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    setFormData(image);
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setIsEditing(false);
    setShowBack(false);
  }, [image]);

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleChange = (field: keyof ScratchcardData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDeleteClick = () => {
    if (confirm(t.deleteConfirm)) {
      onDelete(image.id);
      onClose();
    }
  };

  // Ownership Toggle
  const toggleOwnership = () => {
     if (!currentUser) return;
     
     const currentOwners = image.owners || [];
     let newOwners: string[];

     if (currentOwners.includes(currentUser)) {
        newOwners = currentOwners.filter(o => o !== currentUser);
     } else {
        newOwners = [...currentOwners, currentUser];
     }

     // Immediately update via parent callback without going into Edit Mode
     onUpdate({ ...image, owners: newOwners });
  };

  const handleNext = () => {
    const idx = contextImages.findIndex(img => img.id === image.id);
    if (idx < contextImages.length - 1) {
      onImageSelect(contextImages[idx + 1]);
    }
  };

  const handlePrev = () => {
    const idx = contextImages.findIndex(img => img.id === image.id);
    if (idx > 0) {
      onImageSelect(contextImages[idx - 1]);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    if (e.deltaY < 0) {
      setScale(s => Math.min(s + 0.1, 4));
    } else {
      setScale(s => Math.max(s - 0.1, 0.5));
    }
  };

  const startDrag = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const onDrag = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const stopDrag = () => setIsDragging(false);

  const currentImageSrc = showBack && image.backUrl ? image.backUrl : image.frontUrl;
  
  // Check if current user owns this
  const isOwned = currentUser && image.owners?.includes(currentUser);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in">
      <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-gray-800/50 hover:bg-gray-700 text-white rounded-full transition-colors">
        <X className="w-6 h-6" />
      </button>

      <div className="flex w-full h-full relative">
        {/* Left Navigation */}
        <button onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2 z-40 p-3 bg-gray-800/50 hover:bg-gray-700 text-white rounded-full transition-colors disabled:opacity-30" disabled={contextImages.findIndex(i => i.id === image.id) === 0}>
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Right Navigation */}
        <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 z-40 p-3 bg-gray-800/50 hover:bg-gray-700 text-white rounded-full transition-colors disabled:opacity-30" disabled={contextImages.findIndex(i => i.id === image.id) === contextImages.length - 1}>
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Main Image Area */}
        <div 
          className="flex-1 relative overflow-hidden flex items-center justify-center cursor-move select-none"
          onWheel={handleWheel}
          onMouseDown={startDrag}
          onMouseMove={onDrag}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
        >
           <div 
             style={{ 
               transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`, 
               transition: isDragging ? 'none' : 'transform 0.2s ease-out' 
             }}
             className="relative"
           >
              <img 
                src={currentImageSrc} 
                alt={image.gameName} 
                className="max-h-[90vh] max-w-[90vw] object-contain drop-shadow-2xl"
                draggable={false}
              />
           </div>

           {/* Image Controls */}
           <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-gray-900/80 backdrop-blur px-4 py-2 rounded-full border border-gray-700 shadow-xl z-50">
              <button onClick={() => setScale(s => Math.max(s - 0.5, 0.5))} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ZoomOut className="w-4 h-4 text-white" /></button>
              <span className="text-xs font-mono text-gray-400 w-12 text-center">{Math.round(scale * 100)}%</span>
              <button onClick={() => setScale(s => Math.min(s + 0.5, 4))} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ZoomIn className="w-4 h-4 text-white" /></button>
              
              <div className="w-px h-4 bg-gray-700 mx-2"></div>
              
              {image.backUrl && (
                 <button 
                   onClick={() => setShowBack(!showBack)} 
                   className={`p-2 rounded-full transition-colors ${showBack ? 'bg-brand-600 text-white' : 'hover:bg-white/10 text-gray-300'}`}
                   title={t.front + " / " + t.back}
                 >
                   <RotateCcw className="w-4 h-4" />
                 </button>
              )}
           </div>
        </div>

        {/* Sidebar Info */}
        <div className={`w-96 bg-gray-900 border-l border-gray-800 h-full flex flex-col transition-all duration-300 transform ${false ? 'translate-x-full' : 'translate-x-0'} absolute right-0 top-0 z-40 shadow-2xl overflow-hidden`}>
           {/* Top Bar Actions */}
           <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/95 backdrop-blur shrink-0">
              <div className="flex gap-2">
                 {isAdmin && (
                   isEditing ? (
                     <>
                        <button onClick={handleSave} className="p-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors" title={t.save}>
                           <Save className="w-4 h-4" />
                        </button>
                        <button onClick={() => setIsEditing(false)} className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors" title={t.cancel}>
                           <X className="w-4 h-4" />
                        </button>
                     </>
                   ) : (
                     <>
                        <button onClick={() => setIsEditing(true)} className="p-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-colors" title={t.edit}>
                           <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={handleDeleteClick} className="p-2 bg-red-900/50 hover:bg-red-600 text-red-200 hover:text-white rounded-lg transition-colors" title={t.delete}>
                           <Trash2 className="w-4 h-4" />
                        </button>
                     </>
                   )
                 )}
              </div>
              
              <div className="flex gap-2">
                 <button className="p-2 text-gray-400 hover:text-white transition-colors" title={t.share}>
                    <Share2 className="w-4 h-4" />
                 </button>
              </div>
           </div>

           {/* Content */}
           <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {isEditing ? (
                 <div className="space-y-4 animate-fade-in">
                    {/* EDIT MODE */}
                    <div>
                       <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">{t.gameName}</label>
                       <input 
                         className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-brand-500 outline-none"
                         value={formData.gameName}
                         onChange={e => handleChange('gameName', e.target.value)}
                       />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                       <div>
                          <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">{t.gameNo}</label>
                          <input 
                            className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-brand-500 outline-none text-xs"
                            value={formData.gameNumber}
                            onChange={e => handleChange('gameNumber', e.target.value)}
                          />
                       </div>
                       <div>
                          <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">{t.release}</label>
                          <input 
                            className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-brand-500 outline-none text-xs"
                            value={formData.releaseDate}
                            onChange={e => handleChange('releaseDate', e.target.value)}
                          />
                       </div>
                    </div>

                    <div>
                       <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">{t.state}</label>
                       <select 
                         className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-brand-500 outline-none text-xs"
                         value={formData.state}
                         onChange={e => handleChange('state', e.target.value)}
                       >
                          {['MINT', 'VOID', 'AMOSTRA', 'MUESTRA', 'CAMPIONE', 'SPECIMEN', 'MUSTER', 'ÉCHANTILLON', '견본', 'STEEKPROEF', 'PRØVE', 'PROV', '样本', 'CS', 'SC'].map(s => (
                             <option key={s} value={s}>{s}</option>
                          ))}
                       </select>
                    </div>

                    <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                       <div 
                         className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer ${formData.isSeries ? 'bg-brand-500 border-brand-500' : 'border-gray-500'}`}
                         onClick={() => handleChange('isSeries', !formData.isSeries)}
                       >
                         {formData.isSeries && <Check className="w-3 h-3 text-white" />}
                       </div>
                       <label className="text-xs text-gray-400 cursor-pointer font-bold" onClick={() => handleChange('isSeries', !formData.isSeries)}>SET / Serie?</label>
                     </div>

                     {/* Category Editor */}
                     <select 
                       value={formData.category || 'raspadinha'}
                       onChange={(e) => handleChange('category', e.target.value as Category)}
                       className="bg-gray-800 text-white text-xs border border-gray-700 rounded px-2 py-1 outline-none focus:border-brand-500"
                     >
                       <option value="raspadinha">Raspadinha</option>
                       <option value="lotaria">Lotaria</option>
                       <option value="boletim">Boletim</option>
                       <option value="objeto">Objeto</option>
                     </select>
                   </div>
                   
                   {/* Manual numbers input for SET */}
                   {formData.isSeries && (
                     <div className="animate-fade-in mt-2 p-2 bg-gray-900/50 rounded border border-gray-700">
                       <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1">{t.seriesDetailsPlaceholder || "Detalhes"}</label>
                       <input
                         type="text"
                         value={formData.seriesDetails || ''}
                         onChange={(e) => handleChange('seriesDetails', e.target.value)}
                         placeholder={t.seriesDetailsPlaceholder || "Ex: 1/4, Coleção Inverno..."}
                         className="w-full bg-gray-800 border border-gray-600 text-gray-200 text-xs rounded px-2 py-1.5 focus:border-brand-500 outline-none placeholder-gray-500"
                       />
                     </div>
                   )}
                   
                   <div>
                       <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">{t.values}</label>
                       <textarea 
                         className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-brand-500 outline-none text-xs h-24"
                         value={formData.values}
                         onChange={e => handleChange('values', e.target.value)}
                       />
                   </div>

                   {/* Other Toggles */}
                   <div className="space-y-2 pt-2 border-t border-gray-800">
                      <div className="flex items-center justify-between">
                         <label className="text-xs text-gray-400 font-bold">{t.isRarity}</label>
                         <div 
                           className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${formData.isRarity ? 'bg-gold-500' : 'bg-gray-700'}`}
                           onClick={() => handleChange('isRarity', !formData.isRarity)}
                         >
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.isRarity ? 'left-6' : 'left-1'}`}></div>
                         </div>
                      </div>
                      <div className="flex items-center justify-between">
                         <label className="text-xs text-gray-400 font-bold">{t.promoInfo}</label>
                         <div 
                           className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${formData.isPromotional ? 'bg-pink-500' : 'bg-gray-700'}`}
                           onClick={() => handleChange('isPromotional', !formData.isPromotional)}
                         >
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.isPromotional ? 'left-6' : 'left-1'}`}></div>
                         </div>
                      </div>
                      <div className="flex items-center justify-between">
                         <label className="text-xs text-gray-400 font-bold">{t.winnerInfo}</label>
                         <div 
                           className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${formData.isWinner ? 'bg-green-500' : 'bg-gray-700'}`}
                           onClick={() => handleChange('isWinner', !formData.isWinner)}
                         >
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.isWinner ? 'left-6' : 'left-1'}`}></div>
                         </div>
                      </div>
                   </div>

                 </div>
              ) : (
                 <div className="space-y-6">
                    {/* VIEW MODE */}
                    
                    {/* OWNERSHIP TOGGLE (The "Quadradinho") */}
                    {currentUser && (
                       <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 flex items-center justify-between group cursor-pointer hover:bg-blue-900/30 transition-all" onClick={toggleOwnership}>
                          <div>
                             <h4 className="text-sm font-bold text-white mb-1">Minha Coleção</h4>
                             <p className="text-[10px] text-blue-300">
                                {isOwned ? "Este item está na tua coleção." : "Marca se tens este item."}
                             </p>
                          </div>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isOwned ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50' : 'bg-slate-800 border-2 border-slate-600 text-transparent group-hover:border-blue-400'}`}>
                             {isOwned ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                          </div>
                       </div>
                    )}

                    {/* Header Info */}
                    <div>
                       <div className="flex justify-between items-start mb-2">
                           <span className="text-[10px] font-mono text-brand-400 border border-brand-900/50 bg-brand-900/20 px-1.5 py-0.5 rounded">{image.customId}</span>
                           <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${image.state === 'MINT' ? 'bg-green-900/20 text-green-400 border-green-500/30' : 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                              {image.state}
                           </span>
                       </div>
                       <h2 className="text-2xl font-black text-white leading-tight mb-2">{image.gameName}</h2>
                       <div className="flex items-center gap-2 text-sm text-gray-400">
                          <MapPin className="w-4 h-4 text-brand-500" />
                          {image.country}
                          {image.region && <span className="text-gray-500">• {image.region}</span>}
                       </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                       <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-800">
                          <span className="text-[10px] uppercase text-gray-500 font-bold block mb-1">{t.gameNo}</span>
                          <span className="font-mono text-white text-sm">{image.gameNumber}</span>
                       </div>
                       <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-800">
                          <span className="text-[10px] uppercase text-gray-500 font-bold block mb-1">{t.release}</span>
                          <span className="font-mono text-white text-sm">{image.releaseDate || '---'}</span>
                       </div>
                       <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-800">
                          <span className="text-[10px] uppercase text-gray-500 font-bold block mb-1">{t.price}</span>
                          <span className="font-mono text-white text-sm">{image.price || '---'}</span>
                       </div>
                       <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-800">
                          <span className="text-[10px] uppercase text-gray-500 font-bold block mb-1">{t.size}</span>
                          <span className="font-mono text-white text-sm">{image.size || '---'}</span>
                       </div>
                    </div>

                    {/* Badges Area */}
                    <div className="flex flex-wrap gap-2">
                       {image.isSeries && (
                          <div className="inline-flex items-center gap-1.5 bg-brand-900/20 border border-brand-500/30 px-3 py-1.5 rounded-lg">
                             <Layers className="w-4 h-4 text-brand-500" />
                             <span className="text-xs font-bold text-brand-300">Série</span>
                             {image.seriesDetails && <span className="text-xs text-brand-400/70 border-l border-brand-500/30 pl-1.5 ml-1">{image.seriesDetails}</span>}
                          </div>
                       )}
                       {image.isWinner && (
                          <div className="inline-flex items-center gap-1.5 bg-green-900/20 border border-green-500/30 px-3 py-1.5 rounded-lg">
                             <Trophy className="w-4 h-4 text-green-500" />
                             <span className="text-xs font-bold text-green-300">{image.prizeAmount || 'Premiada'}</span>
                          </div>
                       )}
                       {image.isRarity && (
                          <div className="inline-flex items-center gap-1.5 bg-gold-900/20 border border-gold-500/30 px-3 py-1.5 rounded-lg">
                             <Gem className="w-4 h-4 text-gold-500" />
                             <span className="text-xs font-bold text-gold-300">Raridade</span>
                          </div>
                       )}
                       {image.isPromotional && (
                          <div className="inline-flex items-center gap-1.5 bg-pink-900/20 border border-pink-500/30 px-3 py-1.5 rounded-lg">
                             <Gift className="w-4 h-4 text-pink-500" />
                             <span className="text-xs font-bold text-pink-300">Promo</span>
                          </div>
                       )}
                    </div>

                    {/* Technical Info */}
                    {(image.emission || image.printer) && (
                       <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-800 space-y-2">
                          {image.emission && (
                             <div className="flex justify-between text-xs">
                                <span className="text-gray-500">{t.emission}</span>
                                <span className="text-white font-mono">{image.emission}</span>
                             </div>
                          )}
                          {image.printer && (
                             <div className="flex justify-between text-xs">
                                <span className="text-gray-500">{t.printer}</span>
                                <span className="text-white flex items-center gap-1">
                                   <Printer className="w-3 h-3 text-gray-400" /> {image.printer}
                                </span>
                             </div>
                          )}
                       </div>
                    )}
                    
                    {/* Description / Values */}
                    <div>
                       <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t.values}</h4>
                       <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line bg-gray-900 p-3 rounded-lg border border-gray-800">
                          {image.values || 'Sem informação adicional.'}
                       </p>
                    </div>

                    {/* Meta Footer */}
                    <div className="pt-6 border-t border-gray-800 text-[10px] text-gray-600 space-y-1">
                       <p>Adicionado em: {new Date(image.createdAt).toLocaleString()}</p>
                       <p>Colecionador (Origem): <span className="text-brand-500">{image.collector || 'Desconhecido'}</span></p>
                       
                       {/* List of Owners */}
                       {image.owners && image.owners.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-800">
                             <p className="mb-1 text-slate-500 uppercase font-bold tracking-widest">Coleções onde existe:</p>
                             <div className="flex flex-wrap gap-1">
                                {image.owners.map(owner => (
                                   <span key={owner} className="bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">{owner}</span>
                                ))}
                             </div>
                          </div>
                       )}
                    </div>
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};