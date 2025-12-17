import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, ChevronLeft, ChevronRight, Edit2, Trash2, Save, Check, 
  ZoomIn, ZoomOut, LayoutTemplate, Star, Trophy, Gem, Gift,
  Hash, Calendar, Printer, Ruler, Globe, MapPin, User, Info, 
  Layers, Tag, Coins, Clock, Flag, Zap, Sparkles, Maximize2, Columns
} from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<'single' | 'panorama'>('single');

  useEffect(() => {
    setFormData(image);
    setActiveImage(image.frontUrl);
    setActiveLabel('front');
    setIsEditing(false);
    setIsZoomed(false);
    setViewMode('single');
  }, [image]);

  // Encontrar outros membros da mesma série (mesmo GameNumber ou seriesGroupId)
  const seriesMembers = useMemo(() => {
    if (!image.isSeries) return [];
    return contextImages
      .filter(img => 
        (img.gameNumber === image.gameNumber && img.gameName === image.gameName) || 
        (image.seriesGroupId && img.seriesGroupId === image.seriesGroupId)
      )
      .sort((a, b) => a.customId.localeCompare(b.customId, undefined, { numeric: true }));
  }, [image, contextImages]);

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

  const formatLineColor = (line: string | undefined) => {
    const mapping: Record<string, string> = {
      blue: 'Azul', red: 'Vermelha', multicolor: 'Multicolor', green: 'Verde',
      yellow: 'Amarela', brown: 'Castanha', pink: 'Rosa', purple: 'Violeta', none: 'Nenhuma'
    };
    return line ? mapping[line] || line : 'Nenhuma';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in" onClick={onClose}>
      <button className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-50 p-2 bg-slate-800/50 rounded-full" onClick={onClose}><X className="w-8 h-8" /></button>

      {viewMode === 'single' && (
        <>
          <button onClick={handlePrev} className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white p-2 md:p-4 hidden md:block z-40 transition-all hover:scale-110" disabled={contextImages.findIndex(img => img.id === image.id) === 0}>
             <ChevronLeft className="w-10 h-10 md:w-12 md:h-12" />
          </button>
          <button onClick={handleNext} className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white p-2 md:p-4 hidden md:block z-40 transition-all hover:scale-110" disabled={contextImages.findIndex(img => img.id === image.id) === contextImages.length - 1}>
             <ChevronRight className="w-10 h-10 md:w-12 md:h-12" />
          </button>
        </>
      )}

      <div className={`w-full ${viewMode === 'panorama' ? 'h-full flex flex-col' : 'max-w-7xl h-[95vh] md:h-[90vh] flex flex-col md:flex-row bg-slate-900 md:rounded-2xl overflow-hidden border border-slate-800 shadow-2xl'}`} onClick={e => e.stopPropagation()}>
         
         {/* ÁREA DA IMAGEM / PANORAMA */}
         <div className="flex-1 bg-black relative flex flex-col overflow-hidden border-b md:border-b-0 md:border-r border-slate-800">
            <div className="absolute top-4 right-4 z-30 flex gap-2">
               {seriesMembers.length > 1 && (
                  <button onClick={() => setViewMode(viewMode === 'single' ? 'panorama' : 'single')} className={`flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur transition-all font-bold text-xs ${viewMode === 'panorama' ? 'bg-brand-600 text-white border-brand-400' : 'bg-black/50 text-white/50 border-white/10 hover:text-white'}`}>
                    <Columns className="w-4 h-4" /> {viewMode === 'panorama' ? 'SAIR PANORAMA' : 'MODO PANORAMA'}
                  </button>
               )}
               <button onClick={() => setIsZoomed(!isZoomed)} className="bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur border border-white/10 transition-colors">
                  {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
               </button>
            </div>

            {viewMode === 'single' ? (
              <>
                <div className="absolute top-4 left-4 z-30 bg-black/50 text-white text-[10px] px-3 py-1.5 rounded-full backdrop-blur border border-white/10 uppercase tracking-widest font-bold shadow-lg flex items-center gap-2">
                   <div className={`w-1.5 h-1.5 rounded-full ${activeLabel === 'front' ? 'bg-blue-500' : 'bg-brand-500'}`}></div>
                   {activeLabel === 'front' ? 'FRENTE' : activeLabel === 'back' ? 'VERSO' : 'VARIANTE'}
                </div>

                <div className={`flex-1 relative flex items-center justify-center overflow-hidden transition-all duration-300 ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in p-4 md:p-8'}`} onClick={() => setIsZoomed(!isZoomed)}>
                   <img 
                     src={activeImage} 
                     className={`transition-transform duration-300 ease-out shadow-2xl ${isZoomed ? 'w-full h-auto scale-150 origin-center' : 'max-w-full max-h-full object-contain'}`} 
                     style={{ maxHeight: isZoomed ? 'none' : '95%', maxWidth: isZoomed ? 'none' : '95%' }} 
                   />
                </div>

                <div className="h-20 bg-slate-950/90 backdrop-blur border-t border-white/5 p-2 flex items-center gap-3 justify-center shrink-0 z-30">
                   <button onClick={() => { setActiveImage(image.frontUrl); setActiveLabel('front'); setIsZoomed(false); }} className={`relative h-full aspect-square rounded-lg overflow-hidden border-2 transition-all ${activeLabel === 'front' ? 'border-blue-500 scale-110 shadow-lg shadow-blue-500/20' : 'border-slate-800 opacity-40 hover:opacity-100'}`}><img src={image.frontUrl} className="w-full h-full object-cover" /></button>
                   {image.backUrl && <button onClick={() => { setActiveImage(image.backUrl!); setActiveLabel('back'); setIsZoomed(false); }} className={`relative h-full aspect-square rounded-lg overflow-hidden border-2 transition-all ${activeLabel === 'back' ? 'border-brand-500 scale-110 shadow-lg shadow-brand-500/20' : 'border-slate-800 opacity-40 hover:opacity-100'}`}><img src={image.backUrl} className="w-full h-full object-cover" /></button>}
                </div>
              </>
            ) : (
              /* MODO PANORAMA - COLADO LADO A LADO */
              <div className="flex-1 flex flex-col items-center justify-center p-10 overflow-hidden">
                <div className="w-full max-w-full overflow-x-auto overflow-y-auto flex flex-col gap-8 custom-scrollbar p-10 items-center">
                  <h3 className="text-xl font-black text-brand-500 uppercase tracking-widest bg-slate-900 px-6 py-2 rounded-full border border-slate-700 shadow-2xl">
                    Série Completa: {image.gameName} ({seriesMembers.length} itens)
                  </h3>
                  
                  {/* Frentes Coladas */}
                  <div className="flex items-center gap-2 md:gap-4 flex-nowrap bg-slate-900/40 p-6 rounded-3xl border border-white/5 shadow-inner">
                    {seriesMembers.map((member, idx) => (
                      <div key={member.id} className="flex flex-col gap-2 shrink-0 group">
                        <span className="text-[10px] font-black text-slate-500 text-center uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">Posição {idx + 1}</span>
                        <img 
                          src={member.frontUrl} 
                          className="h-[300px] md:h-[450px] w-auto object-contain rounded-lg shadow-2xl border border-white/5 hover:scale-110 transition-transform cursor-pointer"
                          onClick={() => onImageSelect(member)} 
                        />
                        <span className="text-[9px] font-mono text-center text-blue-400 font-bold">{member.customId}</span>
                      </div>
                    ))}
                  </div>

                  {/* Versos Colados (Opcional - Se houver) */}
                  {seriesMembers.some(m => m.backUrl) && (
                    <div className="flex items-center gap-2 md:gap-4 flex-nowrap bg-slate-900/40 p-6 rounded-3xl border border-white/5 shadow-inner">
                      {seriesMembers.map((member) => (
                        <div key={'back-' + member.id} className="shrink-0">
                          {member.backUrl ? (
                            <img src={member.backUrl} className="h-[150px] md:h-[220px] w-auto object-contain rounded-lg shadow-xl opacity-60 hover:opacity-100 transition-opacity" />
                          ) : (
                            <div className="h-[150px] md:h-[220px] w-[110px] md:w-[160px] bg-slate-800/30 rounded-lg flex items-center justify-center border border-dashed border-slate-700 text-[10px] font-bold text-slate-600 uppercase">Sem Verso</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
         </div>

         {/* PAINEL DE DADOS (SIDEBAR) */}
         {viewMode === 'single' && (
           <div className="w-full md:w-[450px] bg-slate-900 flex flex-col h-full z-20 shadow-2xl">
              <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center shrink-0">
                 <div className="flex gap-2">
                    {isAdmin && (
                       <>
                          {isEditing ? (
                             <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-green-900/20"><Save className="w-3.5 h-3.5"/> GRAVAR</button>
                          ) : (
                             <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs transition-all"><Edit2 className="w-3.5 h-3.5"/> EDITAR</button>
                          )}
                          <button onClick={handleDelete} className="p-2.5 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-700"><Trash2 className="w-4 h-4"/></button>
                       </>
                    )}
                 </div>

                 {currentUser && (
                    <button onClick={toggleCollection} className={`px-4 py-2 rounded-xl text-xs font-black border transition-all flex items-center gap-2 shadow-sm ${formData.owners?.includes(currentUser) ? 'bg-green-500 text-white border-green-400' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:border-slate-500'}`}>
                       <Check className="w-3.5 h-3.5" /> {formData.owners?.includes(currentUser) ? 'NA COLEÇÃO' : 'MARCAR'}
                    </button>
                 )}
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                 <div className="space-y-4">
                    <div>
                      {isEditing ? (
                         <input type="text" value={formData.gameName} onChange={e => handleChange('gameName', e.target.value)} className="w-full bg-slate-800 text-white text-xl font-black rounded-xl p-3 border border-slate-700" />
                      ) : (
                         <h2 className="text-2xl font-black text-white mb-1 tracking-tight uppercase">{formData.gameName}</h2>
                      )}
                      <div className="flex flex-wrap gap-2 mt-3">
                         <span className="px-2.5 py-1 rounded-md text-[10px] font-black border bg-slate-800 border-slate-700 text-slate-300 flex items-center gap-1.5 uppercase">
                           <Tag className="w-3 h-3 text-blue-500" /> {formData.category}
                         </span>
                         <span className="px-2.5 py-1 rounded-md text-[10px] font-black border bg-slate-800 border-slate-700 text-slate-300 flex items-center gap-1.5">
                           <Hash className="w-3 h-3 text-slate-500" /> ID: {formData.customId}
                         </span>
                      </div>
                   </div>

                   <div className="flex flex-wrap gap-2">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black border ${formData.state === 'MINT' ? 'bg-green-900/30 text-green-400 border-green-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>{formData.state}</span>
                      {formData.isSeries && <span className="px-2.5 py-1 rounded-md text-[10px] font-black border bg-indigo-900/30 text-indigo-400 border-indigo-500/30 flex items-center gap-1.5"><Layers className="w-3 h-3" /> Membro de Série</span>}
                   </div>
                 </div>

                 {/* Seção de Membros da Série na Barra Lateral */}
                 {image.isSeries && seriesMembers.length > 1 && (
                    <div className="bg-indigo-900/10 rounded-2xl p-4 border border-indigo-500/20">
                       <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                          <span className="flex items-center gap-2"><Layers className="w-3 h-3" /> Esta Série ({seriesMembers.length})</span>
                          <button onClick={() => setViewMode('panorama')} className="text-blue-400 hover:text-white transition-colors underline">Ver Todas</button>
                       </h3>
                       <div className="grid grid-cols-4 gap-2">
                          {seriesMembers.map(member => (
                             <button 
                               key={member.id} 
                               onClick={() => onImageSelect(member)}
                               className={`aspect-square rounded-md overflow-hidden border-2 transition-all ${member.id === image.id ? 'border-brand-500 ring-2 ring-brand-500/20 scale-105' : 'border-slate-800 opacity-60 hover:opacity-100'}`}
                             >
                               <img src={member.frontUrl} className="w-full h-full object-cover" />
                             </button>
                          ))}
                       </div>
                    </div>
                 )}

                 {/* Resto dos Dados Técnicos */}
                 <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
                       <p className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-1"><Hash className="w-2.5 h-2.5"/> Nº Jogo</p>
                       <p className="text-sm font-black text-white font-mono">{formData.gameNumber}</p>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
                       <p className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-1"><Globe className="w-2.5 h-2.5"/> País</p>
                       <p className="text-sm font-black text-white">{formData.country}</p>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800 col-span-2">
                       <p className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-1"><Printer className="w-2.5 h-2.5"/> Gráfica</p>
                       <p className="text-sm font-black text-white">{formData.printer || 'Desconhecido'}</p>
                    </div>
                 </div>

                 <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-800/50">
                    <span className="text-[10px] text-slate-500 uppercase block mb-3 font-black tracking-widest">Observações</span>
                    <p className="text-sm text-slate-300 italic leading-relaxed">{formData.values || 'Sem notas.'}</p>
                 </div>
              </div>
           </div>
         )}
      </div>
    </div>
  );
};