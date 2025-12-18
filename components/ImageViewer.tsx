
import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, ChevronLeft, ChevronRight, Edit2, Trash2, Save, Check, 
  ZoomIn, ZoomOut, LayoutTemplate, Star, Trophy, Gem, Gift,
  Hash, Calendar, Printer, Ruler, Globe, MapPin, User, Info, 
  Layers, Tag, Coins, Clock, Flag, Zap, Sparkles, Maximize2, Columns,
  ExternalLink, FileText, Banknote, Box, ScanLine, Fingerprint, History, 
  Award, ShieldCheck, CreditCard, Split, Image as ImageIcon
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

  const getLineBadge = (line: string) => {
     const lower = line.toLowerCase();
     if (lower.includes('azul')) return 'bg-blue-600';
     if (lower.includes('vermelha')) return 'bg-red-600';
     if (lower.includes('multicolor')) return 'bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500';
     if (lower.includes('verde')) return 'bg-green-600';
     if (lower.includes('amarela')) return 'bg-yellow-400';
     if (lower.includes('castanha')) return 'bg-amber-900';
     if (lower.includes('cinza')) return 'bg-gray-500';
     return 'bg-slate-600';
  };

  const DataCard = ({ icon: Icon, label, value, colorClass = "text-slate-400", subValue }: any) => (
    <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-700/50 group hover:border-slate-500/30 transition-all flex flex-col justify-between">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-3.5 h-3.5 ${colorClass}`} />
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
      </div>
      <div>
        <p className="text-sm font-black text-slate-100 leading-tight">{value || '-'}</p>
        {subValue && <p className="text-[9px] text-slate-500 font-bold mt-0.5">{subValue}</p>}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/98 backdrop-blur-3xl animate-fade-in" onClick={onClose}>
      <button className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-[100] p-2 bg-slate-800/50 rounded-full" onClick={onClose}><X className="w-8 h-8" /></button>

      <div className={`w-full ${viewMode === 'panorama' ? 'h-full flex flex-col' : 'max-w-7xl h-[95vh] md:h-[90vh] flex flex-col md:flex-row bg-slate-900 md:rounded-2xl overflow-hidden border border-slate-800 shadow-2xl animate-bounce-in'}`} onClick={e => e.stopPropagation()}>
         
         <div className="flex-1 bg-black relative flex flex-col overflow-hidden border-b md:border-b-0 md:border-r border-slate-800">
            <div className="absolute top-4 right-4 z-[60] flex gap-2">
               {seriesMembers.length > 1 && (
                  <button onClick={() => setViewMode(viewMode === 'single' ? 'panorama' : 'single')} className={`flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur transition-all font-black text-[10px] tracking-widest ${viewMode === 'panorama' ? 'bg-brand-600 text-white border-brand-400 shadow-lg shadow-brand-900/40' : 'bg-black/50 text-white/50 border-white/10 hover:text-white'}`}>
                    {viewMode === 'panorama' ? <Columns className="w-3.5 h-3.5" /> : <Split className="w-3.5 h-3.5" />}
                    {viewMode === 'panorama' ? 'VOLTAR AO INDIVIDUAL' : `MODO PANORAMA SÉRIE (${seriesMembers.length})`}
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
                <div className="absolute top-4 left-4 z-[60] bg-black/50 text-white text-[9px] px-3 py-1.5 rounded-full backdrop-blur border border-white/10 uppercase tracking-widest font-black shadow-lg flex items-center gap-2">
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
              <div className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-6 lg:p-10 custom-scrollbar">
                <div className="max-w-[1920px] mx-auto">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4 sticky top-0 z-[70] bg-slate-950/95 py-4 border-b border-white/5 backdrop-blur-xl">
                     <div className="flex items-center gap-4">
                        <div className="bg-brand-600 p-3 rounded-2xl shadow-xl shadow-brand-900/40">
                           <Layers className="w-6 h-6 text-white" />
                        </div>
                        <div>
                           <div className="flex items-center gap-2 mb-0.5">
                              <span className="bg-brand-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest">Série</span>
                              <span className="text-slate-500 text-[8px] font-black uppercase tracking-widest">Grup {image.gameNumber}</span>
                           </div>
                           <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">{image.gameName}</h3>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 flex items-center gap-3">
                           <div className="flex flex-col">
                              <span className="text-[8px] font-black text-slate-500 uppercase">Peças</span>
                              <span className="text-sm font-black text-white leading-none">{seriesMembers.length}</span>
                           </div>
                           <div className="w-px h-5 bg-slate-800"></div>
                           <div className="flex flex-col">
                              <span className="text-[8px] font-black text-slate-500 uppercase">Imagens</span>
                              <span className="text-sm font-black text-brand-500 leading-none">{seriesMembers.length * (image.backUrl ? 2 : 1)}</span>
                           </div>
                        </div>
                        <button onClick={() => setViewMode('single')} className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all border border-slate-700 shadow-lg"><X className="w-5 h-5"/></button>
                     </div>
                  </div>

                  {/* Grid mais denso para melhor aproveitamento */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 pb-32">
                    {seriesMembers.map((member) => (
                      <div key={member.id} className={`group bg-slate-900/30 border rounded-[1.5rem] p-4 flex flex-col gap-4 transition-all hover:bg-slate-900/60 ${member.id === image.id ? 'border-brand-500/40 ring-4 ring-brand-500/5' : 'border-white/5 shadow-xl shadow-black/40'}`}>
                        
                        {/* Galeria de Lado compacta */}
                        <div className="flex gap-2">
                           <div className="flex-1 space-y-1.5">
                              <div className="flex items-center justify-between px-1">
                                 <span className="text-[7px] font-black text-blue-500 uppercase tracking-widest">Frente</span>
                              </div>
                              <div className="relative aspect-[3/4] bg-slate-950 rounded-xl overflow-hidden border border-white/5 group-hover:border-blue-500/20 transition-all">
                                 <img src={member.frontUrl} className="w-full h-full object-contain" />
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                              </div>
                           </div>

                           {member.backUrl ? (
                              <div className="flex-1 space-y-1.5">
                                 <div className="flex items-center justify-between px-1">
                                    <span className="text-[7px] font-black text-brand-500 uppercase tracking-widest">Verso</span>
                                 </div>
                                 <div className="relative aspect-[3/4] bg-slate-950 rounded-xl overflow-hidden border border-white/5 group-hover:border-brand-500/20 transition-all">
                                    <img src={member.backUrl} className="w-full h-full object-contain" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                                 </div>
                              </div>
                           ) : (
                              <div className="flex-1 flex flex-col items-center justify-center bg-slate-950/20 rounded-xl border border-dashed border-slate-800/50 text-slate-800 opacity-40 space-y-1">
                                 <ImageIcon className="w-6 h-6" />
                                 <span className="text-[7px] font-black uppercase tracking-tighter">Sem Verso</span>
                              </div>
                           )}
                        </div>

                        {/* Dados Rápidos Ultra-Compactos */}
                        <div className="flex items-center justify-between bg-slate-950/40 px-3 py-2.5 rounded-xl border border-slate-800/40">
                           <div className="flex flex-col">
                              <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Registo</span>
                              <span className="text-[10px] font-black text-white font-mono leading-none">{member.customId}</span>
                           </div>
                           <div className="flex flex-col items-center">
                              <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Estado</span>
                              <div className="flex items-center gap-1">
                                 <span className={`w-1 h-1 rounded-full ${member.state === 'MINT' ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]' : 'bg-slate-500'}`}></span>
                                 <span className="text-[10px] font-black text-slate-300 leading-none">{member.state}</span>
                              </div>
                           </div>
                           <button 
                              onClick={() => onImageSelect(member)} 
                              className={`p-2 rounded-lg transition-all ${member.id === image.id ? 'bg-brand-600 text-white' : 'bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white'}`}
                              title="Focar item"
                           >
                              <Maximize2 className="w-3.5 h-3.5"/>
                           </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
         </div>

         {viewMode === 'single' && (
           <div className="w-full md:w-[480px] bg-slate-900 flex flex-col h-full z-20 shadow-2xl border-l border-slate-800 overflow-hidden">
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
                             <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block tracking-widest">Nome do Jogo</label>
                             <input type="text" value={formData.gameName} onChange={e => handleChange('gameName', e.target.value)} className="w-full bg-slate-800 text-white text-lg font-black rounded-xl p-3 border border-slate-700 focus:border-brand-500 outline-none" />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                             <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block tracking-widest">ID Arquivo</label>
                                <input type="text" value={formData.customId} onChange={e => handleChange('customId', e.target.value)} className="w-full bg-slate-800 text-brand-400 text-sm font-black rounded-xl p-3 border border-slate-700 focus:border-brand-500 outline-none" />
                             </div>
                             <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block tracking-widest">Categoria</label>
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
                       <div className="space-y-2">
                          <div className="flex items-center gap-2 text-brand-500 mb-1">
                             <Fingerprint className="w-4 h-4" />
                             <span className="text-[10px] font-black uppercase tracking-[0.2em]">{formData.customId}</span>
                             {formData.aiGenerated && <Sparkles className="w-3 h-3 text-cyan-400 ml-auto" title="Catalogado por Chloe IA" />}
                          </div>
                          <h2 className="text-3xl font-black text-white leading-tight uppercase tracking-tighter">{formData.gameName}</h2>
                       </div>
                    )}
                    {!isEditing && (
                      <div className="flex flex-wrap gap-2">
                         <span className="px-3 py-1.5 rounded-lg text-[10px] font-black border bg-slate-900 border-slate-700 text-slate-300 flex items-center gap-2 uppercase tracking-widest shadow-sm">
                           <Tag className="w-3.5 h-3.5 text-blue-500" /> {formData.category}
                         </span>
                         {formData.isRarity && (
                            <span className="px-3 py-1.5 rounded-lg text-[10px] font-black border bg-yellow-900/20 border-yellow-700/50 text-yellow-500 flex items-center gap-2 uppercase tracking-widest">
                               <Gem className="w-3.5 h-3.5" /> RARIDADE
                            </span>
                         )}
                         {formData.isWinner && (
                            <span className="px-3 py-1.5 rounded-lg text-[10px] font-black border bg-green-900/20 border-green-700/50 text-green-500 flex items-center gap-2 uppercase tracking-widest">
                               <Award className="w-3.5 h-3.5" /> PREMIADA
                            </span>
                         )}
                         {formData.isSeries && (
                            <span className="px-3 py-1.5 rounded-lg text-[10px] font-black border bg-indigo-900/20 border-indigo-700/50 text-indigo-500 flex items-center gap-2 uppercase tracking-widest">
                               <Layers className="w-3.5 h-3.5" /> SÉRIE / SET
                            </span>
                         )}
                      </div>
                    )}
                 </div>

                 {!isEditing ? (
                    <div className="space-y-8">
                       <section>
                          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                             <CreditCard className="w-3.5 h-3.5" /> Identidade Técnica
                          </h3>
                          <div className="grid grid-cols-2 gap-3">
                             <DataCard icon={Hash} label="Nº do Jogo" value={formData.gameNumber} colorClass="text-blue-400" subValue="Codificação Oficial" />
                             <DataCard icon={Clock} label="Lançamento" value={formData.releaseDate} colorClass="text-orange-400" subValue="Ano de Emissão" />
                             <DataCard icon={Banknote} label="Valor Facial" value={formData.price} colorClass="text-emerald-400" subValue="Custo de Venda" />
                             <DataCard icon={ShieldCheck} label="Estado" value={formData.state} colorClass="text-cyan-400" subValue="Grau de Conservação" />
                          </div>
                       </section>

                       <section>
                          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                             <Globe className="w-3.5 h-3.5" /> Geografia & Origem
                          </h3>
                          <div className="grid grid-cols-2 gap-3">
                             <DataCard icon={Flag} label="País" value={formData.country} colorClass="text-red-400" />
                             <DataCard icon={MapPin} label="Região / Ilha" value={formData.region} colorClass="text-indigo-400" />
                             <div className="col-span-2">
                                <DataCard icon={Printer} label="Impressor / Gráfica" value={formData.printer} colorClass="text-slate-300" subValue="Entidade Responsável pela Produção" />
                             </div>
                          </div>
                       </section>

                       <section>
                          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                             <ScanLine className="w-3.5 h-3.5" /> Segurança & Medidas
                          </h3>
                          <div className="grid grid-cols-2 gap-3">
                             <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-700/50 group flex flex-col justify-between">
                                <div className="flex items-center gap-2 mb-2">
                                  <ScanLine className="w-3.5 h-3.5 text-cyan-500" />
                                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Linhas de Série</span>
                                </div>
                                <div className="flex items-center gap-2">
                                   {formData.lines && <div className={`w-3 h-3 rounded-full ${getLineBadge(formData.lines)} shadow-lg`}></div>}
                                   <p className="text-sm font-black text-slate-100">{formData.lines || '-'}</p>
                                </div>
                             </div>
                             <DataCard icon={Ruler} label="Dimensões" value={formData.size} colorClass="text-emerald-500" />
                             <div className="col-span-2">
                                <DataCard icon={Coins} label="Tiragem Total" value={formData.emission} colorClass="text-yellow-500" subValue="Número de Exemplares Produzidos" />
                             </div>
                          </div>
                       </section>
                    </div>
                 ) : (
                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
                          <p className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-2 mb-2 tracking-widest"><Hash className="w-3.5 h-3.5 text-blue-500"/> Nº Jogo</p>
                          <input type="text" value={formData.gameNumber} onChange={e => handleChange('gameNumber', e.target.value)} className="w-full bg-slate-900 text-white text-sm font-black p-2 rounded-lg border border-slate-700" />
                       </div>
                       <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
                          <p className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-2 mb-2 tracking-widest"><Globe className="w-3.5 h-3.5 text-red-500"/> País</p>
                          <input type="text" value={formData.country} onChange={e => handleChange('country', e.target.value)} className="w-full bg-slate-900 text-white text-sm font-black p-2 rounded-lg border border-slate-700" />
                       </div>
                       <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 col-span-2">
                          <p className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-2 mb-2 tracking-widest"><ScanLine className="w-3.5 h-3.5 text-cyan-400"/> Linhas</p>
                          <input type="text" value={formData.lines || ''} onChange={e => handleChange('lines', e.target.value)} className="w-full bg-slate-900 text-white text-sm font-black p-2 rounded-lg border border-slate-700" />
                       </div>
                       <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
                          <p className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-2 mb-2 tracking-widest"><Clock className="w-3.5 h-3.5 text-orange-400"/> Ano</p>
                          <input type="text" value={formData.releaseDate} onChange={e => handleChange('releaseDate', e.target.value)} className="w-full bg-slate-900 text-white text-sm font-black p-2 rounded-lg border border-slate-700" />
                       </div>
                       <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
                          <p className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-2 mb-2 tracking-widest"><Banknote className="w-3.5 h-3.5 text-emerald-400"/> Preço</p>
                          <input type="text" value={formData.price || ''} onChange={e => handleChange('price', e.target.value)} className="w-full bg-slate-900 text-white text-sm font-black p-2 rounded-lg border border-slate-700" />
                       </div>
                    </div>
                 )}

                 <div className="bg-slate-800/30 p-6 rounded-3xl border border-slate-800 shadow-inner">
                    <span className="text-[10px] text-slate-500 uppercase block mb-3 font-black tracking-widest flex items-center gap-2"><Info className="w-4 h-4 text-brand-500"/> Notas do Arquivo</span>
                    {isEditing ? (
                      <textarea value={formData.values} onChange={e => handleChange('values', e.target.value)} className="w-full bg-slate-900 text-white text-sm p-3 rounded-xl border border-slate-700 h-24 focus:border-brand-500 outline-none resize-none leading-relaxed" />
                    ) : (
                      <p className="text-sm text-slate-300 italic leading-relaxed">{formData.values || 'Sem observações catalogadas.'}</p>
                    )}
                 </div>

                 <div className="pt-8 border-t border-slate-800 flex flex-col items-center gap-3 opacity-50">
                    <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
                       <User className="w-3 h-3 text-slate-400" />
                       <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.1em]">Responsável: {formData.collector || 'Jorge Mesquita'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                       <History className="w-3 h-3 text-slate-600" />
                       <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">Arquivado em: {new Date(formData.createdAt).toLocaleDateString()}</p>
                    </div>
                 </div>
              </div>
           </div>
         )}
      </div>
    </div>
  );
};
