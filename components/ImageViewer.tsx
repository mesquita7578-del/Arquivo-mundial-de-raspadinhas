
import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, ChevronLeft, ChevronRight, Edit2, Trash2, Save, Check, 
  ZoomIn, ZoomOut, LayoutTemplate, Star, Trophy, Gem, Gift,
  Hash, Calendar, Printer, Ruler, Globe, MapPin, User, Info, 
  Layers, Tag, Coins, Clock, Flag, Zap, Sparkles, Maximize2, Columns,
  ExternalLink, FileText, Banknote, Box
} from 'lucide-react';
import { ScratchcardData, Category, LineType, ScratchcardState } from '../types';

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
  
  const toggleCollection = () => {
    if (!currentUser) return;
    const currentOwners = formData.owners || [];
    const newOwners = currentOwners.includes(currentUser) ? currentOwners.filter(o => o !== currentUser) : [...currentOwners, currentUser];
    const newData = { ...formData, owners: newOwners };
    setFormData(newData);
    onUpdate(newData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/98 backdrop-blur-3xl animate-fade-in" onClick={onClose}>
      <button className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-50 p-2 bg-slate-800/50 rounded-full" onClick={onClose}><X className="w-8 h-8" /></button>

      <div className={`w-full ${viewMode === 'panorama' ? 'h-full flex flex-col' : 'max-w-7xl h-[95vh] md:h-[90vh] flex flex-col md:flex-row bg-slate-900 md:rounded-2xl overflow-hidden border border-slate-800 shadow-2xl animate-bounce-in'}`} onClick={e => e.stopPropagation()}>
         
         {/* ÁREA DA IMAGEM / PANORAMA */}
         <div className="flex-1 bg-black relative flex flex-col overflow-hidden border-b md:border-b-0 md:border-r border-slate-800">
            <div className="absolute top-4 right-4 z-30 flex gap-2">
               {seriesMembers.length > 1 && (
                  <button onClick={() => setViewMode(viewMode === 'single' ? 'panorama' : 'single')} className={`flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur transition-all font-black text-[10px] tracking-widest ${viewMode === 'panorama' ? 'bg-brand-600 text-white border-brand-400 shadow-lg shadow-brand-900/40' : 'bg-black/50 text-white/50 border-white/10 hover:text-white'}`}>
                    {viewMode === 'panorama' ? <Columns className="w-3.5 h-3.5" /> : <LayoutTemplate className="w-3.5 h-3.5" />}
                    {viewMode === 'panorama' ? 'SAIR MODO SÉRIE' : `VER SÉRIE COMPLETA (${seriesMembers.length})`}
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
                <div className="absolute top-4 left-4 z-30 bg-black/50 text-white text-[9px] px-3 py-1.5 rounded-full backdrop-blur border border-white/10 uppercase tracking-widest font-black shadow-lg flex items-center gap-2">
                   <div className={`w-1.5 h-1.5 rounded-full ${activeLabel === 'front' ? 'bg-blue-500' : 'bg-brand-500'}`}></div>
                   {activeLabel === 'front' ? 'FRENTE' : 'VERSO'}
                </div>

                <div className={`flex-1 relative flex items-center justify-center overflow-hidden transition-all duration-500 ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in p-4 md:p-12'}`} onClick={() => setIsZoomed(!isZoomed)}>
                   <img 
                     src={activeImage} 
                     className={`transition-transform duration-500 ease-out shadow-2xl ${isZoomed ? 'w-full h-auto scale-150 origin-center' : 'max-w-full max-h-full object-contain'}`} 
                     style={{ maxHeight: isZoomed ? 'none' : '95%', maxWidth: isZoomed ? 'none' : '95%' }} 
                   />
                </div>

                <div className="h-24 bg-slate-950/90 backdrop-blur border-t border-white/5 p-3 flex items-center gap-4 justify-center shrink-0 z-30">
                   <button onClick={() => { setActiveImage(image.frontUrl); setActiveLabel('front'); setIsZoomed(false); }} className={`relative h-full aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeLabel === 'front' ? 'border-blue-500 scale-110 shadow-xl' : 'border-slate-800 opacity-30 hover:opacity-100'}`}><img src={image.frontUrl} className="w-full h-full object-cover" /></button>
                   {image.backUrl && <button onClick={() => { setActiveImage(image.backUrl!); setActiveLabel('back'); setIsZoomed(false); }} className={`relative h-full aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeLabel === 'back' ? 'border-brand-500 scale-110 shadow-xl' : 'border-slate-800 opacity-30 hover:opacity-100'}`}><img src={image.backUrl} className="w-full h-full object-cover" /></button>}
                </div>
              </>
            ) : (
              /* MODO PANORAMA COMPACTO */
              <div className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-12 custom-scrollbar">
                <div className="max-w-6xl mx-auto space-y-6">
                  <div className="flex items-center justify-between mb-8 sticky top-0 z-40 bg-slate-950/95 py-6 border-b border-white/5 backdrop-blur-xl">
                     <div className="flex items-center gap-4">
                        <div className="bg-brand-600 p-4 rounded-3xl shadow-2xl shadow-brand-900/40">
                           <Layers className="w-8 h-8 text-white" />
                        </div>
                        <div>
                           <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">{image.gameName}</h3>
                           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-2">Inventário Mundial de Série</p>
                        </div>
                     </div>
                     <button onClick={() => setViewMode('single')} className="p-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-all border border-slate-700"><X className="w-6 h-6"/></button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 pb-20">
                    {seriesMembers.map((member) => (
                      <div key={member.id} className={`group bg-slate-900/40 border rounded-3xl p-4 flex flex-col md:flex-row gap-6 transition-all hover:bg-slate-900/60 ${member.id === image.id ? 'border-brand-500/50 ring-1 ring-brand-500/20' : 'border-white/5'}`}>
                        <div className="flex gap-2 shrink-0 justify-center md:justify-start">
                           <div className="relative h-44 aspect-[3/4] bg-black rounded-xl overflow-hidden border border-white/10 shadow-xl group-hover:scale-105 transition-transform">
                              <img src={member.frontUrl} className="w-full h-full object-contain" />
                              <div className="absolute top-2 left-2 bg-blue-600 text-white text-[7px] px-1.5 py-0.5 rounded font-black">FRENTE</div>
                           </div>
                           {member.backUrl && (
                             <div className="relative h-44 aspect-[3/4] bg-black rounded-xl overflow-hidden border border-white/10 shadow-xl group-hover:scale-105 transition-transform">
                                <img src={member.backUrl} className="w-full h-full object-contain" />
                                <div className="absolute top-2 left-2 bg-brand-600 text-white text-[7px] px-1.5 py-0.5 rounded font-black">VERSO</div>
                             </div>
                           )}
                        </div>
                        <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 py-2">
                           <div className="space-y-1">
                              <p className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-1"><Hash className="w-3 h-3 text-brand-500"/> ID Registo</p>
                              <p className="text-xs font-black text-white font-mono tracking-tight">{member.customId}</p>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-1"><Hash className="w-3 h-3 text-blue-500"/> Nº Jogo</p>
                              <p className="text-xs font-black text-white font-mono">{member.gameNumber}</p>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-1"><Ruler className="w-3 h-3 text-emerald-500"/> Medidas</p>
                              <p className="text-xs font-bold text-slate-200">{member.size || '-'}</p>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-1"><Printer className="w-3 h-3 text-slate-500"/> Gráfica</p>
                              <p className="text-xs font-bold text-slate-300 truncate">{member.printer || 'Desconhecido'}</p>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-1"><Coins className="w-3 h-3 text-yellow-500"/> Tiragem</p>
                              <p className="text-xs font-bold text-slate-300">{member.emission || 'N/D'}</p>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-1"><Banknote className="w-3 h-3 text-green-500"/> Preço</p>
                              <p className="text-xs font-bold text-slate-200">{member.price || '-'}</p>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-1"><MapPin className="w-3 h-3 text-red-500"/> Local</p>
                              <p className="text-xs font-bold text-slate-300 truncate">{member.country}{member.region ? ` (${member.region})` : ''}</p>
                           </div>
                           <div className="flex items-center justify-end">
                              <button onClick={() => onImageSelect(member)} className="px-4 py-2 bg-slate-800 hover:bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2">Detalhes <Maximize2 className="w-3.5 h-3.5"/></button>
                           </div>
                           <div className="col-span-2 lg:col-span-4 mt-2 pt-2 border-t border-white/5 flex justify-between items-center">
                              <p className="text-[10px] text-slate-500 italic max-w-lg truncate">"{member.values || 'Sem observações adicionais.'}"</p>
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${member.state === 'MINT' ? 'bg-green-900/30 text-green-400 border-green-500/30' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>{member.state}</span>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
         </div>

         {/* FICHA TÉCNICA LATERAL */}
         {viewMode === 'single' && (
           <div className="w-full md:w-[450px] bg-slate-900 flex flex-col h-full z-20 shadow-2xl border-l border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center shrink-0">
                 <div className="flex gap-2">
                    {isAdmin && (
                       <>
                          {isEditing ? (
                             <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-black text-xs transition-all shadow-xl active:scale-95"><Save className="w-4 h-4"/> GUARDAR</button>
                          ) : (
                             <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs transition-all active:scale-95"><Edit2 className="w-4 h-4"/> EDITAR</button>
                          )}
                          <button onClick={handleDelete} className="p-3 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white rounded-2xl transition-all border border-slate-700"><Trash2 className="w-4.5 h-4.5"/></button>
                       </>
                    )}
                 </div>
                 {currentUser && (
                    <button onClick={toggleCollection} className={`px-5 py-2.5 rounded-2xl text-xs font-black border transition-all flex items-center gap-2 shadow-sm ${formData.owners?.includes(currentUser) ? 'bg-green-500 text-white border-green-400' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:border-slate-500'}`}>
                       <Check className="w-4 h-4" /> {formData.owners?.includes(currentUser) ? 'NA COLEÇÃO' : 'MARCAR'}
                    </button>
                 )}
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-slate-900/20">
                 <div className="space-y-5">
                    {isEditing ? (
                       <div className="space-y-4">
                          <div>
                             <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">Nome do Jogo</label>
                             <input type="text" value={formData.gameName} onChange={e => handleChange('gameName', e.target.value)} className="w-full bg-slate-800 text-white text-lg font-black rounded-xl p-3 border border-slate-700 focus:border-brand-500 outline-none" />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                             <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">ID Arquivo</label>
                                <input type="text" value={formData.customId} onChange={e => handleChange('customId', e.target.value)} className="w-full bg-slate-800 text-brand-400 text-sm font-black rounded-xl p-3 border border-slate-700 focus:border-brand-500 outline-none" />
                             </div>
                             <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">Categoria</label>
                                <select value={formData.category} onChange={e => handleChange('category', e.target.value)} className="w-full bg-slate-800 text-white text-sm font-bold rounded-xl p-3 border border-slate-700">
                                   <option value="raspadinha">Raspadinha</option>
                                   <option value="lotaria">Lotaria</option>
                                   <option value="boletim">Boletim</option>
                                   <option value="objeto">Objeto</option>
                                </select>
                             </div>
                          </div>
                       </div>
                    ) : (
                       <h2 className="text-3xl font-black text-white leading-tight uppercase tracking-tighter mb-4">{formData.gameName}</h2>
                    )}
                    {!isEditing && (
                      <div className="flex flex-wrap gap-2">
                         <span className="px-3 py-1.5 rounded-lg text-[10px] font-black border bg-slate-800 border-slate-700 text-slate-300 flex items-center gap-2 uppercase tracking-widest shadow-sm">
                           <Tag className="w-3.5 h-3.5 text-blue-500" /> {formData.category}
                         </span>
                         <span className="px-3 py-1.5 rounded-lg text-[10px] font-black border bg-slate-800 border-slate-700 text-brand-400 flex items-center gap-2 font-mono shadow-sm">
                           <Hash className="w-3.5 h-3.5 text-brand-500" /> {formData.customId}
                         </span>
                      </div>
                    )}
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 group hover:border-blue-500/30 transition-colors">
                       <p className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-2 mb-2 tracking-widest"><Hash className="w-3.5 h-3.5 text-blue-500"/> Nº Jogo</p>
                       {isEditing ? (
                         <input type="text" value={formData.gameNumber} onChange={e => handleChange('gameNumber', e.target.value)} className="w-full bg-slate-900 text-white text-sm font-black p-2 rounded-lg border border-slate-700" />
                       ) : (
                         <p className="text-base font-black text-white font-mono tracking-tighter">{formData.gameNumber}</p>
                       )}
                    </div>
                    <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 group hover:border-red-500/30 transition-colors">
                       <p className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-2 mb-2 tracking-widest"><Globe className="w-3.5 h-3.5 text-red-500"/> País</p>
                       {isEditing ? (
                         <input type="text" value={formData.country} onChange={e => handleChange('country', e.target.value)} className="w-full bg-slate-900 text-white text-sm font-black p-2 rounded-lg border border-slate-700" />
                       ) : (
                         <p className="text-base font-black text-white leading-none">{formData.country}</p>
                       )}
                    </div>

                    <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 group hover:border-indigo-500/30 transition-colors">
                       <p className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-2 mb-2 tracking-widest"><MapPin className="w-3.5 h-3.5 text-indigo-400"/> Região / Ilha</p>
                       {isEditing ? (
                         <input type="text" value={formData.region} onChange={e => handleChange('region', e.target.value)} className="w-full bg-slate-900 text-white text-sm font-black p-2 rounded-lg border border-slate-700" placeholder="Ex: Madeira" />
                       ) : (
                         <p className="text-sm font-black text-slate-200">{formData.region || '-'}</p>
                       )}
                    </div>

                    <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 group hover:border-emerald-500/30 transition-colors">
                       <p className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-2 mb-2 tracking-widest"><Ruler className="w-3.5 h-3.5 text-emerald-400"/> Medidas</p>
                       {isEditing ? (
                         <input type="text" value={formData.size} onChange={e => handleChange('size', e.target.value)} className="w-full bg-slate-900 text-white text-sm font-black p-2 rounded-lg border border-slate-700" />
                       ) : (
                         <p className="text-sm font-black text-slate-200">{formData.size || '-'}</p>
                       )}
                    </div>
                    
                    <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 col-span-2 group hover:border-indigo-500/30 transition-colors">
                       <p className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-2 mb-2 tracking-widest"><Printer className="w-3.5 h-3.5 text-indigo-400"/> Gráfica</p>
                       {isEditing ? (
                         <input type="text" value={formData.printer} onChange={e => handleChange('printer', e.target.value)} className="w-full bg-slate-900 text-white text-sm font-black p-2 rounded-lg border border-slate-700" />
                       ) : (
                         <p className="text-sm font-black text-slate-200">{formData.printer || '-'}</p>
                       )}
                    </div>

                    <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 group hover:border-yellow-500/30 transition-colors">
                       <p className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-2 mb-2 tracking-widest"><Coins className="w-3.5 h-3.5 text-yellow-500"/> Tiragem</p>
                       {isEditing ? (
                         <input type="text" value={formData.emission} onChange={e => handleChange('emission', e.target.value)} className="w-full bg-slate-900 text-white text-sm font-black p-2 rounded-lg border border-slate-700" />
                       ) : (
                         <p className="text-sm font-black text-slate-200">{formData.emission || '-'}</p>
                       )}
                    </div>

                    <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 group hover:border-green-500/30 transition-colors">
                       <p className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-2 mb-2 tracking-widest"><Banknote className="w-3.5 h-3.5 text-green-500"/> Preço</p>
                       {isEditing ? (
                         <input type="text" value={formData.price} onChange={e => handleChange('price', e.target.value)} className="w-full bg-slate-900 text-white text-sm font-black p-2 rounded-lg border border-slate-700" />
                       ) : (
                         <p className="text-sm font-black text-slate-200">{formData.price || '-'}</p>
                       )}
                    </div>
                    <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 group hover:border-orange-500/30 transition-colors">
                       <p className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-2 mb-2 tracking-widest"><Clock className="w-3.5 h-3.5 text-orange-500"/> Ano</p>
                       {isEditing ? (
                         <input type="text" value={formData.releaseDate} onChange={e => handleChange('releaseDate', e.target.value)} className="w-full bg-slate-900 text-white text-sm font-black p-2 rounded-lg border border-slate-700" />
                       ) : (
                         <p className="text-sm font-black text-slate-200">{formData.releaseDate || '-'}</p>
                       )}
                    </div>
                 </div>

                 <div className="bg-slate-800/30 p-6 rounded-3xl border border-slate-800 shadow-inner">
                    <span className="text-[10px] text-slate-500 uppercase block mb-3 font-black tracking-widest flex items-center gap-2"><Info className="w-4 h-4 text-brand-500"/> Observações</span>
                    {isEditing ? (
                      <textarea value={formData.values} onChange={e => handleChange('values', e.target.value)} className="w-full bg-slate-900 text-white text-sm p-3 rounded-xl border border-slate-700 h-24 focus:border-brand-500 outline-none resize-none leading-relaxed" />
                    ) : (
                      <p className="text-sm text-slate-300 italic leading-relaxed">{formData.values || 'Sem observações catalogadas.'}</p>
                    )}
                 </div>

                 <div className="pt-8 border-t border-slate-800 flex flex-col items-center gap-2 opacity-50">
                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] mb-1">Responsável: {formData.collector || 'Jorge Mesquita'}</p>
                 </div>
              </div>
           </div>
         )}
      </div>
    </div>
  );
};
