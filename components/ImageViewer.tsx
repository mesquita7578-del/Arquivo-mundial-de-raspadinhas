import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, ChevronLeft, ChevronRight, Edit2, Trash2, Save, Check, 
  ZoomIn, ZoomOut, LayoutTemplate, Star, Trophy, Gem, Gift,
  Hash, Calendar, Printer, Ruler, Globe, MapPin, User, Info, 
  Layers, Tag, Coins, Clock, Flag, Zap, Sparkles, Maximize2, Columns,
  ExternalLink, FileText, Banknote, History
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
  }, [image]);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/98 backdrop-blur-2xl animate-fade-in" onClick={onClose}>
      <button className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-50 p-2 bg-slate-800/50 rounded-full" onClick={onClose}><X className="w-8 h-8" /></button>

      <div className={`w-full ${viewMode === 'panorama' ? 'h-full flex flex-col' : 'max-w-7xl h-[95vh] md:h-[90vh] flex flex-col md:flex-row bg-slate-900 md:rounded-2xl overflow-hidden border border-slate-800 shadow-2xl'}`} onClick={e => e.stopPropagation()}>
         
         {/* ÁREA PRINCIPAL */}
         <div className="flex-1 bg-black relative flex flex-col overflow-hidden border-b md:border-b-0 md:border-r border-slate-800">
            {/* CONTROLES SUPERIORES */}
            <div className="absolute top-4 right-4 z-30 flex gap-2">
               {seriesMembers.length > 1 && (
                  <button onClick={() => setViewMode(viewMode === 'single' ? 'panorama' : 'single')} className={`flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur transition-all font-black text-xs ${viewMode === 'panorama' ? 'bg-brand-600 text-white border-brand-400 shadow-lg shadow-brand-900/40' : 'bg-black/50 text-white/50 border-white/10 hover:text-white'}`}>
                    {viewMode === 'panorama' ? <Columns className="w-4 h-4" /> : <LayoutTemplate className="w-4 h-4" />}
                    {viewMode === 'panorama' ? 'SAIR DO MODO SÉRIE' : `VER SÉRIE COMPLETA (${seriesMembers.length})`}
                  </button>
               )}
               {viewMode === 'single' && (
                 <button onClick={() => setIsZoomed(!isZoomed)} className="bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur border border-white/10 transition-colors">
                    {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
                 </button>
               )}
            </div>

            {viewMode === 'single' ? (
              <>
                <div className="absolute top-4 left-4 z-30 bg-black/50 text-white text-[10px] px-3 py-1.5 rounded-full backdrop-blur border border-white/10 uppercase tracking-widest font-bold shadow-lg flex items-center gap-2">
                   <div className={`w-1.5 h-1.5 rounded-full ${activeLabel === 'front' ? 'bg-blue-500' : 'bg-brand-500'}`}></div>
                   {activeLabel === 'front' ? 'FRENTE' : 'VERSO'}
                </div>

                <div className={`flex-1 relative flex items-center justify-center overflow-hidden transition-all duration-300 ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in p-4 md:p-8'}`} onClick={() => setIsZoomed(!isZoomed)}>
                   <img 
                     src={activeImage} 
                     className={`transition-transform duration-300 ease-out shadow-2xl ${isZoomed ? 'w-full h-auto scale-150 origin-center' : 'max-w-full max-h-full object-contain'}`} 
                     style={{ maxHeight: isZoomed ? 'none' : '95%', maxWidth: isZoomed ? 'none' : '95%' }} 
                   />
                </div>

                <div className="h-24 bg-slate-950/90 backdrop-blur border-t border-white/5 p-2 flex items-center gap-3 justify-center shrink-0 z-30">
                   <button onClick={() => { setActiveImage(image.frontUrl); setActiveLabel('front'); setIsZoomed(false); }} className={`relative h-full aspect-square rounded-lg overflow-hidden border-2 transition-all ${activeLabel === 'front' ? 'border-blue-500 scale-110 shadow-lg' : 'border-slate-800 opacity-40'}`}><img src={image.frontUrl} className="w-full h-full object-cover" /></button>
                   {image.backUrl && <button onClick={() => { setActiveImage(image.backUrl!); setActiveLabel('back'); setIsZoomed(false); }} className={`relative h-full aspect-square rounded-lg overflow-hidden border-2 transition-all ${activeLabel === 'back' ? 'border-brand-500 scale-110 shadow-lg' : 'border-slate-800 opacity-40'}`}><img src={image.backUrl} className="w-full h-full object-cover" /></button>}
                </div>
              </>
            ) : (
              /* MODO PANORAMA COMPACTO COM DADOS COMPLETOS */
              <div className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-8 custom-scrollbar">
                <div className="max-w-7xl mx-auto">
                  <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-40 bg-slate-950/95 py-4 backdrop-blur border-b border-white/5">
                     <div className="flex items-center gap-4">
                        <div className="bg-brand-600 p-3 rounded-2xl shadow-lg shadow-brand-900/20">
                           <Layers className="w-6 h-6 text-white" />
                        </div>
                        <div>
                           <h3 className="text-2xl font-black text-white uppercase tracking-tight">{image.gameName}</h3>
                           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Série Mundial • Fichas de Registo</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-center">
                           <p className="text-[8px] text-slate-500 font-bold uppercase">Itens Catalogados</p>
                           <p className="text-sm font-black text-white">{seriesMembers.length}</p>
                        </div>
                        <button onClick={() => setViewMode('single')} className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all"><X className="w-5 h-5"/></button>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 pb-20">
                    {seriesMembers.map((member) => (
                      <div key={member.id} className={`group bg-slate-900/40 border rounded-3xl p-4 flex flex-col md:flex-row gap-6 transition-all hover:bg-slate-900/80 ${member.id === image.id ? 'border-brand-500 ring-1 ring-brand-500/30 shadow-2xl shadow-brand-900/10' : 'border-white/5'}`}>
                        
                        {/* Imagens (Compactas) */}
                        <div className="flex gap-3 shrink-0 justify-center md:justify-start">
                           <div className="relative h-44 aspect-[3/4] bg-black rounded-xl overflow-hidden border border-white/10 shadow-lg">
                              <img src={member.frontUrl} className="w-full h-full object-contain" />
                              <div className="absolute top-2 left-2 bg-blue-600 text-white text-[7px] px-1.5 py-0.5 rounded font-black">FRENTE</div>
                           </div>
                           {member.backUrl && (
                             <div className="relative h-44 aspect-[3/4] bg-black rounded-xl overflow-hidden border border-white/10 shadow-lg">
                                <img src={member.backUrl} className="w-full h-full object-contain" />
                                <div className="absolute top-2 left-2 bg-brand-600 text-white text-[7px] px-1.5 py-0.5 rounded font-black">VERSO</div>
                             </div>
                           )}
                        </div>

                        {/* Ficha Técnica de Registo ao Lado */}
                        <div className="flex-1 flex flex-col justify-between">
                           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-2">
                              <div>
                                 <p className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-1 mb-1"><Hash className="w-2.5 h-2.5 text-brand-500"/> ID Registo</p>
                                 <p className="text-xs font-black text-white font-mono">{member.customId}</p>
                              </div>
                              <div>
                                 <p className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-1 mb-1"><Hash className="w-2.5 h-2.5 text-blue-500"/> Nº Jogo</p>
                                 <p className="text-xs font-black text-white font-mono">{member.gameNumber}</p>
                              </div>
                              <div>
                                 <p className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-1 mb-1"><Printer className="w-2.5 h-2.5 text-slate-500"/> Gráfica / Impressor</p>
                                 <p className="text-xs font-bold text-slate-300 truncate">{member.printer || 'Desconhecido'}</p>
                              </div>
                              <div>
                                 <p className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-1 mb-1"><Coins className="w-2.5 h-2.5 text-green-500"/> Tiragem / Emissão</p>
                                 <p className="text-xs font-bold text-slate-300">{member.emission || 'Não inf.'}</p>
                              </div>
                              <div>
                                 <p className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-1 mb-1"><Banknote className="w-2.5 h-2.5 text-yellow-500"/> Preço Unitário</p>
                                 <p className="text-xs font-bold text-slate-300">{member.price || '-'}</p>
                              </div>
                              <div>
                                 <p className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-1 mb-1"><History className="w-2.5 h-2.5 text-purple-500"/> Ano / Lançamento</p>
                                 <p className="text-xs font-bold text-slate-300">{member.releaseDate || '-'}</p>
                              </div>
                              <div className="col-span-2">
                                 <p className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-1 mb-1"><MapPin className="w-2.5 h-2.5 text-red-500"/> Localização</p>
                                 <p className="text-xs font-bold text-slate-300 truncate">{member.country} {member.region ? `(${member.region})` : ''}</p>
                              </div>
                           </div>

                           <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                              <p className="text-[10px] text-slate-400 italic line-clamp-1 max-w-lg">"{member.values || 'Nenhuma nota de arquivo registada para este item.'}"</p>
                              <div className="flex items-center gap-3">
                                 <span className={`text-[8px] font-black px-2 py-1 rounded border ${member.state === 'MINT' ? 'bg-green-900/30 text-green-400 border-green-500/30' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>{member.state}</span>
                                 <button onClick={() => onImageSelect(member)} className="flex items-center gap-2 text-[9px] font-black text-brand-400 hover:text-white transition-colors uppercase">Selecionar <Maximize2 className="w-3 h-3" /></button>
                              </div>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
         </div>

         {/* PAINEL LATERAL (FICHA TÉCNICA) - APENAS EM VISTA ÚNICA */}
         {viewMode === 'single' && (
           <div className="w-full md:w-[420px] bg-slate-900 flex flex-col h-full z-20 shadow-2xl border-l border-slate-800">
              <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center shrink-0">
                 <div className="flex gap-2">
                    {isAdmin && (
                       <>
                          {isEditing ? (
                             <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl font-black text-xs transition-all shadow-lg"><Save className="w-3.5 h-3.5"/> GRAVAR</button>
                          ) : (
                             <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xs transition-all"><Edit2 className="w-3.5 h-3.5"/> EDITAR</button>
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
                         <h2 className="text-2xl font-black text-white leading-tight uppercase tracking-tight">{formData.gameName}</h2>
                      )}
                      <div className="flex flex-wrap gap-2 mt-4">
                         <span className="px-2.5 py-1 rounded-md text-[10px] font-black border bg-slate-800 border-slate-700 text-slate-300 flex items-center gap-1.5 uppercase">
                           <Tag className="w-3 h-3 text-blue-500" /> {formData.category}
                         </span>
                         <span className="px-2.5 py-1 rounded-md text-[10px] font-black border bg-slate-800 border-slate-700 text-brand-400 flex items-center gap-1.5 font-mono">
                           <Hash className="w-3 h-3 text-brand-500" /> {formData.customId}
                         </span>
                      </div>
                   </div>

                   <div className="flex flex-wrap gap-2">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black border ${formData.state === 'MINT' ? 'bg-green-900/30 text-green-400 border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.1)]' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>{formData.state}</span>
                      {formData.isSeries && <span className="px-2.5 py-1 rounded-md text-[10px] font-black border bg-indigo-900/30 text-indigo-400 border-indigo-500/30 flex items-center gap-1.5"><Layers className="w-3 h-3" /> Membro de Série</span>}
                   </div>
                 </div>

                 {/* DADOS TÉCNICOS DETALHADOS (SCREENSHOT MATCH) */}
                 <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800/80">
                       <p className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-1 mb-1"><Hash className="w-2.5 h-2.5 text-blue-500"/> Nº Jogo</p>
                       <p className="text-sm font-black text-white font-mono">{formData.gameNumber}</p>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800/80">
                       <p className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-1 mb-1"><Globe className="w-2.5 h-2.5 text-red-500"/> País</p>
                       <p className="text-sm font-black text-white">{formData.country}</p>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800/80 col-span-2">
                       <p className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-1 mb-1"><Printer className="w-2.5 h-2.5 text-slate-400"/> Gráfica / Impressor</p>
                       <p className="text-sm font-black text-white">{formData.printer || 'Desconhecido'}</p>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800/80">
                       <p className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-1 mb-1"><Coins className="w-2.5 h-2.5 text-green-500"/> Emissão</p>
                       <p className="text-sm font-black text-white">{formData.emission || '-'}</p>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800/80">
                       <p className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-1 mb-1"><Clock className="w-2.5 h-2.5 text-orange-500"/> Ano</p>
                       <p className="text-sm font-black text-white">{formData.releaseDate || '-'}</p>
                    </div>
                 </div>

                 <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-800/50">
                    <span className="text-[10px] text-slate-500 uppercase block mb-3 font-black tracking-widest flex items-center gap-2"><Info className="w-3 h-3"/> Observações do Arquivo</span>
                    <p className="text-sm text-slate-300 italic leading-relaxed">{formData.values || 'Sem notas registadas.'}</p>
                 </div>

                 <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest text-center py-4 border-t border-slate-800/50">
                   Registado por: {formData.collector || 'Jorge Mesquita'}
                 </p>
              </div>
           </div>
         )}
      </div>
    </div>
  );
};