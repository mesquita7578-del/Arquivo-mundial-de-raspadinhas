import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Edit2, Trash2, Save, Share2, Check, RotateCcw, AlertTriangle, AlignJustify, Layers, Trophy, ZoomIn, ZoomOut } from 'lucide-react';
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
  
  // Display State
  const [activeImage, setActiveImage] = useState<string>(image.frontUrl);
  const [activeLabel, setActiveLabel] = useState<string>('front'); // 'front', 'back', 'extra-0', 'extra-1', etc
  const [isZoomed, setIsZoomed] = useState(false); // New Zoom State

  useEffect(() => {
    setFormData(image);
    setActiveImage(image.frontUrl);
    setActiveLabel('front');
    setIsEditing(false);
    setIsZoomed(false); // Reset zoom on new image
  }, [image]);

  const handleChange = (field: keyof ScratchcardData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm(t.deleteConfirm)) {
      onDelete(image.id);
    }
  };
  
  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentIndex = contextImages.findIndex(img => img.id === image.id);
    if (currentIndex < contextImages.length - 1) {
      onImageSelect(contextImages[currentIndex + 1]);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentIndex = contextImages.findIndex(img => img.id === image.id);
    if (currentIndex > 0) {
      onImageSelect(contextImages[currentIndex - 1]);
    }
  };

  // Toggle my collection ownership
  const toggleCollection = () => {
    if (!currentUser) return;
    const currentOwners = formData.owners || [];
    let newOwners;
    if (currentOwners.includes(currentUser)) {
       newOwners = currentOwners.filter(o => o !== currentUser);
    } else {
       newOwners = [...currentOwners, currentUser];
    }
    const newData = { ...formData, owners: newOwners };
    setFormData(newData);
    onUpdate(newData);
  };

  const toggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsZoomed(!isZoomed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in" onClick={onClose}>
      <button className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-50" onClick={onClose}>
        <X className="w-8 h-8" />
      </button>

      {/* Navigation Arrows */}
      <button onClick={handlePrev} className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white p-2 md:p-4 hidden md:block z-40" disabled={contextImages.findIndex(img => img.id === image.id) === 0}>
         <ChevronLeft className="w-10 h-10 md:w-12 md:h-12" />
      </button>
      <button onClick={handleNext} className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white p-2 md:p-4 hidden md:block z-40" disabled={contextImages.findIndex(img => img.id === image.id) === contextImages.length - 1}>
         <ChevronRight className="w-10 h-10 md:w-12 md:h-12" />
      </button>

      <div className="w-full max-w-6xl h-[90vh] flex flex-col md:flex-row bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl" onClick={e => e.stopPropagation()}>
         
         {/* Left: Image Canvas */}
         <div className="flex-1 bg-black relative flex flex-col overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
            
            {/* Zoom Controls Overlay */}
            <div className="absolute top-4 right-4 z-30 flex gap-2">
               <button 
                  onClick={toggleZoom}
                  className="bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur border border-white/10 transition-colors"
                  title={isZoomed ? "Reduzir" : "Ampliar"}
               >
                  {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
               </button>
            </div>

            {/* Label Overlay */}
            <div className="absolute top-4 left-4 z-30 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur border border-white/10 uppercase tracking-widest font-bold shadow-lg pointer-events-none">
               {activeLabel === 'front' && t.front}
               {activeLabel === 'back' && t.back}
               {activeLabel.startsWith('extra') && "Variante"}
            </div>

            {/* MAIN IMAGE CONTAINER */}
            <div 
               className={`flex-1 relative flex items-center justify-center overflow-hidden transition-all duration-300 ${isZoomed ? 'cursor-zoom-out p-0' : 'cursor-zoom-in p-4 md:p-8'}`}
               onClick={toggleZoom}
            >
               <img 
                  src={activeImage} 
                  alt={image.gameName}
                  className={`transition-transform duration-300 ease-out shadow-2xl ${
                     isZoomed 
                     ? 'w-full h-auto max-h-none object-contain scale-125'  // Zoomed: Allow scroll/overflow potentially, keep aspect
                     : 'max-w-full max-h-full w-auto h-auto object-contain' // Default: Force Fit completely
                  }`}
                  style={{ 
                     maxHeight: isZoomed ? 'none' : '90%', // Ensure safety margin in fit mode
                     maxWidth: isZoomed ? 'none' : '90%' 
                  }}
               />
            </div>

            {/* Thumbnail Gallery */}
            <div className="h-16 md:h-20 bg-slate-950/90 backdrop-blur border-t border-white/10 p-2 flex items-center gap-2 justify-center overflow-x-auto shrink-0 z-30">
               
               {/* Front Thumb */}
               <button 
                  onClick={() => { setActiveImage(image.frontUrl); setActiveLabel('front'); setIsZoomed(false); }}
                  className={`relative h-full aspect-square rounded overflow-hidden border-2 transition-all ${activeLabel === 'front' ? 'border-brand-500 scale-105 opacity-100' : 'border-transparent opacity-50 hover:opacity-100'}`}
               >
                  <img src={image.frontUrl} className="w-full h-full object-cover" />
               </button>

               {/* Back Thumb */}
               {image.backUrl && (
                  <button 
                     onClick={() => { setActiveImage(image.backUrl!); setActiveLabel('back'); setIsZoomed(false); }}
                     className={`relative h-full aspect-square rounded overflow-hidden border-2 transition-all ${activeLabel === 'back' ? 'border-brand-500 scale-105 opacity-100' : 'border-transparent opacity-50 hover:opacity-100'}`}
                  >
                     <img src={image.backUrl} className="w-full h-full object-cover" />
                     <span className="absolute bottom-0 left-0 w-full text-[6px] md:text-[8px] bg-black/70 text-white text-center font-bold">VERSO</span>
                  </button>
               )}

               {/* Extra Images Thumbs */}
               {image.extraImages && image.extraImages.map((extra, idx) => (
                  <button 
                     key={idx}
                     onClick={() => { setActiveImage(extra); setActiveLabel(`extra-${idx}`); setIsZoomed(false); }}
                     className={`relative h-full aspect-square rounded overflow-hidden border-2 transition-all ${activeLabel === `extra-${idx}` ? 'border-brand-500 scale-105 opacity-100' : 'border-transparent opacity-50 hover:opacity-100'}`}
                  >
                     <img src={extra} className="w-full h-full object-cover" />
                  </button>
               ))}
            </div>
         </div>

         {/* Right: Info */}
         <div className="w-full md:w-96 bg-slate-900 border-l border-slate-800 flex flex-col h-[40vh] md:h-full z-20 shadow-2xl">
            <div className="p-6 flex-1 overflow-y-auto">
               
               {/* Edit / Actions Bar */}
               <div className="flex justify-between items-center mb-6">
                  {isAdmin ? (
                     <div className="flex gap-2">
                        {isEditing ? (
                           <>
                              <button onClick={handleSave} className="p-2 bg-green-600 text-white rounded hover:bg-green-500"><Save className="w-4 h-4"/></button>
                              <button onClick={() => setIsEditing(false)} className="p-2 bg-slate-700 text-white rounded hover:bg-slate-600"><X className="w-4 h-4"/></button>
                           </>
                        ) : (
                           <>
                              <button onClick={() => setIsEditing(true)} className="p-2 bg-blue-600 text-white rounded hover:bg-blue-500"><Edit2 className="w-4 h-4"/></button>
                              <button onClick={handleDelete} className="p-2 bg-red-600 text-white rounded hover:bg-red-500"><Trash2 className="w-4 h-4"/></button>
                           </>
                        )}
                     </div>
                  ) : (
                     <div></div>
                  )}

                  {/* My Collection Toggle */}
                  {currentUser && (
                     <button 
                        onClick={toggleCollection}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-2 ${formData.owners?.includes(currentUser) ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'}`}
                     >
                        <Check className="w-3 h-3" />
                        {formData.owners?.includes(currentUser) ? 'Na Coleção' : 'Marcar'}
                     </button>
                  )}
               </div>

               {/* Content */}
               <div className="space-y-6">
                  <div>
                     {isEditing ? (
                        <input 
                           type="text" 
                           value={formData.gameName} 
                           onChange={e => handleChange('gameName', e.target.value)}
                           className="w-full bg-slate-800 text-white text-xl font-bold rounded p-2 border border-slate-700"
                        />
                     ) : (
                        <h2 className="text-2xl font-bold text-white mb-1 leading-tight">{formData.gameName}</h2>
                     )}
                     <div className="flex items-center gap-2 text-sm text-slate-400">
                        {isEditing ? (
                           <input 
                              type="text" 
                              value={formData.country} 
                              onChange={e => handleChange('country', e.target.value)}
                              className="bg-slate-800 text-white rounded p-1 border border-slate-700 text-xs w-24"
                           />
                        ) : (
                           <span>{formData.country} {formData.region ? `• ${formData.region}` : ''}</span>
                        )}
                        <span>•</span>
                        <span className="font-mono">{formData.releaseDate.split('-')[0]}</span>
                     </div>
                  </div>

                  {/* Snippet Integration: Series / Category / Lines */}
                  {isEditing ? (
                    <div className="space-y-3 bg-slate-800/30 p-3 rounded-xl border border-slate-800">
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
                         
                         {/* Line Editor */}
                         <div>
                             <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">{t.lines}</label>
                             <select 
                               className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-brand-500 outline-none text-xs"
                               value={formData.lines || 'none'}
                               onChange={e => handleChange('lines', e.target.value)}
                             >
                                <option value="none">{t.linesNone}</option>
                                <option value="blue">{t.linesBlue}</option>
                                <option value="red">{t.linesRed}</option>
                                <option value="green">{t.linesGreen}</option>
                                <option value="brown">{t.linesBrown}</option>
                                <option value="pink">{t.linesPink}</option>
                                <option value="purple">{t.linesPurple}</option>
                                <option value="yellow">{t.linesYellow}</option>
                                <option value="multicolor">{t.linesMulti}</option>
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
                    </div>
                  ) : (
                     // View Mode for Details
                     <div className="flex flex-wrap gap-2">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${formData.state === 'MINT' ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                           {formData.state}
                        </span>
                        {formData.isSeries && (
                           <span className="px-2 py-1 rounded text-[10px] font-bold uppercase border bg-brand-900/20 text-brand-400 border-brand-500/30 flex items-center gap-1">
                              <Layers className="w-3 h-3" /> Série {formData.seriesDetails}
                           </span>
                        )}
                        {formData.isWinner && (
                           <span className="px-2 py-1 rounded text-[10px] font-bold uppercase border bg-green-900/20 text-green-400 border-green-500/30 flex items-center gap-1">
                              <Trophy className="w-3 h-3" /> {formData.prizeAmount}
                           </span>
                        )}
                     </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                     <div className="bg-slate-800/50 p-3 rounded-lg">
                        <span className="text-[10px] text-slate-500 uppercase block mb-1">{t.gameNo}</span>
                        {isEditing ? (
                           <input type="text" value={formData.gameNumber} onChange={e => handleChange('gameNumber', e.target.value)} className="w-full bg-slate-800 text-white rounded p-1 border border-slate-700 text-xs"/>
                        ) : <span className="font-mono text-white">{formData.gameNumber}</span>}
                     </div>
                     <div className="bg-slate-800/50 p-3 rounded-lg">
                        <span className="text-[10px] text-slate-500 uppercase block mb-1">{t.price}</span>
                        {isEditing ? (
                           <input type="text" value={formData.price} onChange={e => handleChange('price', e.target.value)} className="w-full bg-slate-800 text-white rounded p-1 border border-slate-700 text-xs"/>
                        ) : <span className="font-mono text-white">{formData.price || '-'}</span>}
                     </div>
                     <div className="bg-slate-800/50 p-3 rounded-lg">
                        <span className="text-[10px] text-slate-500 uppercase block mb-1">{t.emission}</span>
                        {isEditing ? (
                           <input type="text" value={formData.emission} onChange={e => handleChange('emission', e.target.value)} className="w-full bg-slate-800 text-white rounded p-1 border border-slate-700 text-xs"/>
                        ) : <span className="font-mono text-white">{formData.emission || '-'}</span>}
                     </div>
                     <div className="bg-slate-800/50 p-3 rounded-lg">
                        <span className="text-[10px] text-slate-500 uppercase block mb-1">{t.printer}</span>
                        {isEditing ? (
                           <input type="text" value={formData.printer} onChange={e => handleChange('printer', e.target.value)} className="w-full bg-slate-800 text-white rounded p-1 border border-slate-700 text-xs"/>
                        ) : <span className="font-mono text-white">{formData.printer || '-'}</span>}
                     </div>
                  </div>

                  <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-800/50">
                     <span className="text-[10px] text-slate-500 uppercase block mb-2 font-bold">{t.values}</span>
                     {isEditing ? (
                        <textarea value={formData.values} onChange={e => handleChange('values', e.target.value)} className="w-full bg-slate-800 text-white rounded p-2 border border-slate-700 text-xs h-24"/>
                     ) : (
                        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{formData.values}</p>
                     )}
                  </div>
               </div>
            </div>

            <div className="p-4 bg-slate-900 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between shrink-0">
               <span>ID: {formData.customId}</span>
               <span>{t.collector}: {formData.collector}</span>
            </div>
         </div>
      </div>
    </div>
  );
};
