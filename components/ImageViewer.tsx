
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, Edit2, Trash2, Save, Check, 
  Hash, Clock, Flag, MapPin, Info, 
  Building2, Globe, Fingerprint,
  Sparkles, Columns, Ruler, Printer, Banknote, ScanLine,
  Layers, LayoutGrid, Eye, Calendar, ChevronDown, User,
  Tag, ShieldCheck, Palette, Activity, Percent, Plus, RefreshCw, 
  Layers as LayersIcon, ChevronLeft, ChevronRight
} from 'lucide-react';
import { ScratchcardData, ScratchcardState, Continent, LineType, CategoryItem } from '../types';

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
  categories: CategoryItem[];
}

const CONTINENTS: Continent[] = ['Europa', 'América', 'Ásia', 'África', 'Oceania'];

const LINE_COLORS: { id: LineType; label: string; bg: string }[] = [
  { id: 'blue', label: 'Azul', bg: 'bg-blue-500' },
  { id: 'red', label: 'Vermelho', bg: 'bg-red-500' },
  { id: 'multicolor', label: 'Multi', bg: 'bg-gradient-to-tr from-red-500 via-green-500 to-blue-500' },
  { id: 'green', label: 'Verde', bg: 'bg-emerald-500' },
  { id: 'brown', label: 'Castanho', bg: 'bg-amber-900' },
  { id: 'pink', label: 'Rosa', bg: 'bg-pink-500' },
  { id: 'purple', label: 'Violeta', bg: 'bg-purple-600' },
  { id: 'yellow', label: 'Amarelo', bg: 'bg-yellow-400' },
  { id: 'gray', label: 'Cinza', bg: 'bg-slate-500' },
  { id: 'none', label: 'Sem', bg: 'bg-slate-800 border-slate-700' }
];

const STATE_OPTIONS: { id: ScratchcardState; label: string }[] = [
  { id: 'MINT', label: 'MINT' },
  { id: 'SC', label: 'SC' },
  { id: 'CS', label: 'CS' },
  { id: 'AMOSTRA', label: 'AMOSTRA' },
  { id: 'VOID', label: 'VOID' },
  { id: 'SAMPLE', label: 'SAMPLE' },
  { id: 'MUESTRA', label: 'MUESTRA' },
  { id: 'CAMPIONE', label: 'CAMPIONE' }
];

export const ImageViewer: React.FC<ImageViewerProps> = ({ image, onClose, onUpdate, onDelete, isAdmin, currentUser, contextImages, onImageSelect, t, categories }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ScratchcardData>(image);
  const [activeImage, setActiveImage] = useState<string>(image.frontUrl);
  const [activeLabel, setActiveLabel] = useState<'front' | 'back'>('front');
  const [viewMode, setViewMode] = useState<'single' | 'panorama'>('single');
  const backInputRef = useRef<HTMLInputElement>(null);

  // Navegação
  const currentIndex = useMemo(() => contextImages.findIndex(img => img.id === image.id), [image, contextImages]);
  const hasNext = currentIndex < contextImages.length - 1;
  const hasPrev = currentIndex > 0;

  const handleNext = () => {
    if (hasNext) {
      onImageSelect(contextImages[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    if (hasPrev) {
      onImageSelect(contextImages[currentIndex - 1]);
    }
  };

  // Teclas de atalho
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditing) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isEditing]);

  useEffect(() => {
    if (image) {
      setFormData(image);
      setActiveImage(image.frontUrl);
      setActiveLabel('front');
      setIsEditing(false);
    }
  }, [image]);

  const seriesMembers = useMemo(() => {
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

  const handleBackImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        handleChange('backUrl', base64);
        setActiveImage(base64);
        setActiveLabel('back');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm(t.deleteConfirm)) onDelete(image.id);
  };
  
  const DataTag = ({ icon: Icon, label, value, colorClass = "text-slate-400" }: any) => (
    <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-2 rounded-xl hover:border-slate-700 transition-all group">
      <div className={`p-1.5 rounded-lg bg-slate-800 group-hover:bg-slate-700 transition-colors`}>
        <Icon className={`w-3.5 h-3.5 ${colorClass}`} />
      </div>
      <div className="flex flex-col">
        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{label}</span>
        <span className="text-xs font-black text-slate-200 leading-none truncate max-w-[120px]">{value || '-'}</span>
      </div>
    </div>
  );

  const toggleImage = () => {
    if (formData.backUrl) {
       if (activeLabel === 'front') {
          setActiveImage(formData.backUrl);
          setActiveLabel('back');
       } else {
          setActiveImage(formData.frontUrl);
          setActiveLabel('front');
       }
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-xl" onClick={onClose}>
      <button className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors z-[10000] p-4 bg-slate-900 border border-white/10 rounded-full shadow-2xl active:scale-90" onClick={onClose}>
        <X className="w-6 h-6" />
      </button>

      <div className={`w-full h-full md:h-[90vh] md:max-w-[1500px] flex flex-col md:flex-row bg-[#020617] md:rounded-[2.5rem] overflow-hidden border border-slate-800 shadow-[0_0_100px_rgba(0,0,0,0.8)] relative animate-fade-in`} onClick={e => e.stopPropagation()}>
         
         {/* Lado Esquerdo: Área da Imagem Delicada */}
         <div className="flex-1 bg-black/40 relative flex flex-col min-h-0 border-b md:border-b-0 md:border-r border-slate-900">
            {viewMode === 'single' ? (
              <div className="flex-1 flex flex-col min-h-0 w-full h-full relative group">
                {/* Comandos de Navegação Laterais */}
                {hasPrev && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-4 bg-slate-900/50 hover:bg-brand-600 text-white rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95"
                    title="Anterior (Seta Esquerda)"
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                )}
                {hasNext && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-4 bg-slate-900/50 hover:bg-brand-600 text-white rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95"
                    title="Próximo (Seta Direita)"
                  >
                    <ChevronRight className="w-8 h-8" />
                  </button>
                )}

                <div className="flex-1 relative w-full h-full flex items-center justify-center p-6 md:p-12">
                   {/* Imagem com moldura delicada */}
                   <div className="relative bg-slate-950 p-2 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-slate-800 max-h-full">
                      <img 
                        src={activeImage} 
                        className="max-w-full max-h-[60vh] md:max-h-[70vh] object-contain transition-all duration-700" 
                        alt={formData.gameName} 
                      />
                   </div>
                   
                   {/* Botão de Rotação Rápida */}
                   {formData.backUrl && (
                     <button 
                       onClick={(e) => { e.stopPropagation(); toggleImage(); }}
                       className="absolute bottom-6 right-6 bg-brand-600/90 hover:bg-brand-500 text-white p-4 rounded-full shadow-2xl backdrop-blur-md border border-brand-400/50 transition-all hover:scale-110 active:scale-95 group z-50"
                       title="Ver Verso"
                     >
                       <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                     </button>
                   )}
                </div>
                
                <div className="h-24 bg-[#0a0f1e] border-t border-slate-800 p-4 flex items-center gap-4 justify-center shrink-0">
                   <button onClick={() => { setActiveImage(formData.frontUrl); setActiveLabel('front'); }} className={`relative h-16 aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeLabel === 'front' ? 'border-brand-500 scale-105 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-slate-800 opacity-40 hover:opacity-100'}`}>
                      <img src={formData.frontUrl} className="w-full h-full object-cover" alt="Frente" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-[8px] font-black text-white uppercase tracking-widest">Frente</div>
                   </button>
                   {formData.backUrl ? (
                      <button onClick={() => { setActiveImage(formData.backUrl!); setActiveLabel('back'); }} className={`relative h-16 aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeLabel === 'back' ? 'border-brand-500 scale-105 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-slate-800 opacity-40 hover:opacity-100'}`}>
                        <img src={formData.backUrl} className="w-full h-full object-cover" alt="Verso" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-[8px] font-black text-white uppercase tracking-widest">Verso</div>
                      </button>
                   ) : isEditing && (
                      <button onClick={() => backInputRef.current?.click()} className="relative h-16 aspect-square rounded-xl overflow-hidden border-2 border-dashed border-slate-700 bg-slate-900/50 flex flex-col items-center justify-center group hover:border-brand-500 transition-all">
                        <Plus className="w-4 h-4 text-slate-600 group-hover:text-brand-500" />
                        <span className="text-[7px] font-black text-slate-600 uppercase group-hover:text-brand-500">Verso</span>
                        <input type="file" ref={backInputRef} className="hidden" accept="image/*" onChange={handleBackImageUpload} />
                      </button>
                   )}
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto bg-slate-950 p-6 md:p-12 custom-scrollbar">
                <div className="flex flex-col gap-12 max-w-5xl mx-auto animate-fade-in">
                   <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                      <h3 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                         <LayersIcon className="w-5 h-5 text-brand-500" /> SET: {image.gameName}
                      </h3>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{seriesMembers.length} Itens</span>
                   </div>
                   <div className="grid grid-cols-1 gap-12">
                    {seriesMembers.map((member) => (
                      <div key={member.id} className="bg-slate-900/20 border border-slate-800/50 rounded-3xl p-8 flex flex-col md:flex-row gap-8 hover:border-blue-500/30 transition-all group relative overflow-hidden">
                         <div className="flex-1 flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                               <span className="text-[10px] font-black text-white bg-brand-600 px-3 py-1 rounded-md border border-brand-400/50 shadow-lg">{member.customId}</span>
                               <button onClick={() => onImageSelect(member)} className="text-[10px] font-black text-slate-500 hover:text-white flex items-center gap-1.5 uppercase transition-colors">
                                  <Eye className="w-3.5 h-3.5" /> Ver No Centro
                               </button>
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                               <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900">
                                  <img src={member.frontUrl} className="w-full h-full object-contain" alt="Frente" />
                               </div>
                               <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex items-center justify-center bg-slate-900/50">
                                  {member.backUrl ? <img src={member.backUrl} className="w-full h-full object-contain" /> : <span className="text-[9px] font-black uppercase text-slate-700">Verso N/C</span>}
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

         {/* Painel de Informações (Direito) */}
         <div className="w-full md:w-[450px] bg-[#0a0f1e] flex flex-col h-full z-20 border-l border-slate-900 overflow-hidden shrink-0">
              <div className="p-6 border-b border-slate-900 bg-slate-900/40 backdrop-blur flex justify-between items-center shrink-0">
                 <div className="flex gap-2">
                    {isAdmin && (
                       <>
                          <button onClick={isEditing ? handleSave : () => setIsEditing(true)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isEditing ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-800 text-brand-400 border border-slate-700 hover:bg-slate-700'}`}>
                             {isEditing ? <Save className="w-4 h-4"/> : <Edit2 className="w-4 h-4"/>} {isEditing ? 'Guardar' : 'Editar'}
                          </button>
                          {!isEditing && <button onClick={handleDelete} className="p-2.5 bg-slate-900 hover:bg-red-600 text-slate-600 hover:text-white rounded-xl transition-all"><Trash2 className="w-5 h-5"/></button>}
                       </>
                    )}
                 </div>
                 {!isEditing && (image.isSeries || seriesMembers.length > 1) && (
                    <button onClick={() => setViewMode(viewMode === 'single' ? 'panorama' : 'single')} className={`p-2.5 rounded-xl border transition-all ${viewMode === 'panorama' ? 'bg-brand-500 text-white border-brand-400' : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'}`}>
                      <LayoutGrid className="w-5 h-5"/>
                    </button>
                 )}
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                 <div className="space-y-2">
                    {isEditing ? (
                       <div className="space-y-6 animate-fade-in">
                          <div className="grid grid-cols-2 gap-4">
                            <label className="col-span-2">
                               <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Nome do jogo:</span>
                               <input type="text" value={formData.gameName} onChange={e => handleChange('gameName', e.target.value)} className="w-full bg-slate-900 text-white text-sm font-black rounded-xl p-3 border border-slate-800 outline-none focus:border-brand-500" />
                            </label>
                            <label>
                               <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Jogo nº:</span>
                               <input type="text" value={formData.gameNumber} onChange={e => handleChange('gameNumber', e.target.value)} className="w-full bg-slate-900 text-white text-xs p-3 border border-slate-800 rounded-xl outline-none" />
                            </label>
                            <label>
                               <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Codigo / ID:</span>
                               <input type="text" value={formData.customId} onChange={e => handleChange('customId', e.target.value)} className="w-full bg-slate-900 text-white text-xs p-3 border border-slate-800 rounded-xl outline-none" />
                            </label>
                          </div>

                          <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 space-y-4">
                            <label className="flex items-center gap-3 cursor-pointer group">
                               <div className="relative">
                                  <input 
                                    type="checkbox" 
                                    checked={formData.isSeries} 
                                    onChange={e => handleChange('isSeries', e.target.checked)} 
                                    className="sr-only" 
                                  />
                                  <div className={`w-10 h-5 bg-slate-800 rounded-full transition-colors ${formData.isSeries ? 'bg-brand-600' : ''}`}></div>
                                  <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${formData.isSeries ? 'translate-x-5' : ''}`}></div>
                               </div>
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">É Série (SET)?</span>
                            </label>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <label className="col-span-2">
                               <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Operador:</span>
                               <input type="text" value={formData.operator} onChange={e => handleChange('operator', e.target.value)} className="w-full bg-slate-900 text-brand-400 text-xs p-3 border border-slate-800 rounded-xl outline-none" />
                            </label>
                            <label>
                               <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">data emissão:</span>
                               <input type="text" value={formData.releaseDate} onChange={e => handleChange('releaseDate', e.target.value)} className="w-full bg-slate-900 text-white text-xs p-3 border border-slate-800 rounded-xl outline-none" />
                            </label>
                            <label>
                               <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">custo:</span>
                               <input type="text" value={formData.price} onChange={e => handleChange('price', e.target.value)} className="w-full bg-slate-900 text-white text-xs p-3 border border-slate-800 rounded-xl outline-none" />
                            </label>
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                             <label>
                               <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">País:</span>
                               <input type="text" value={formData.country} onChange={e => handleChange('country', e.target.value)} className="w-full bg-slate-900 text-white text-xs p-2 border border-slate-800 rounded-xl outline-none" />
                             </label>
                             <label>
                               <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Região:</span>
                               <input type="text" value={formData.region} onChange={e => handleChange('region', e.target.value)} className="w-full bg-slate-900 text-white text-xs p-2 border border-slate-800 rounded-xl outline-none" />
                             </label>
                             <label>
                               <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Estado:</span>
                               <select value={formData.state} onChange={e => handleChange('state', e.target.value)} className="w-full bg-slate-900 text-white text-[10px] p-2 border border-slate-800 rounded-xl outline-none uppercase font-black">
                                  {STATE_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                               </select>
                             </label>
                          </div>
                       </div>
                    ) : (
                       <div className="animate-fade-in border-b border-slate-800 pb-6">
                          <h2 className="text-3xl font-black text-slate-100 uppercase tracking-tighter italic leading-tight">{formData.gameName}</h2>
                          <div className="flex items-center gap-3 mt-4">
                            <span className="text-brand-500 text-[9px] font-black uppercase tracking-[0.2em] bg-brand-900/20 px-2 py-0.5 rounded border border-brand-800/30">{formData.category}</span>
                            {formData.operator && (
                              <div className="flex items-center gap-2">
                                <Building2 className="w-3.5 h-3.5 text-brand-400" />
                                <span className="text-brand-400 text-[10px] font-black uppercase tracking-widest">{formData.operator}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-4 bg-slate-900/50 w-fit px-3 py-1 rounded-full border border-slate-800">
                             <User className="w-3 h-3 text-brand-500" />
                             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Responsável: <span className="text-brand-400">{formData.collector || 'Arquivo'}</span></span>
                          </div>
                       </div>
                    )}
                 </div>

                 {!isEditing && (
                    <div className="grid grid-cols-2 gap-3 animate-fade-in">
                       <DataTag icon={Hash} label="Jogo nº" value={formData.gameNumber} colorClass="text-brand-500" />
                       <DataTag icon={Fingerprint} label="Codigo / ID" value={formData.customId} colorClass="text-slate-500" />
                       <DataTag icon={Ruler} label="dimensões" value={formData.size} colorClass="text-cyan-500" />
                       <DataTag icon={Clock} label="emissão" value={formData.releaseDate} colorClass="text-orange-500" />
                       <DataTag icon={Banknote} label="custo" value={formData.price} colorClass="text-emerald-500" />
                       <DataTag icon={Flag} label="País" value={formData.country} colorClass="text-red-500" />
                       <DataTag icon={Globe} label="Continente" value={formData.continent} colorClass="text-indigo-500" />
                       <DataTag icon={Printer} label="Impressão" value={formData.printer} colorClass="text-slate-400" />
                       <DataTag icon={ScanLine} label="Linhas" value={formData.lines} colorClass="text-emerald-500" />
                       <DataTag icon={Activity} label="Estado" value={formData.state} colorClass="text-brand-400" />
                    </div>
                 )}

                 <div className="bg-slate-950 p-6 rounded-[2rem] border border-slate-800 shadow-inner group">
                    <div className="flex items-center gap-2 mb-4">
                       <Info className="w-3.5 h-3.5 text-slate-600" />
                       <span className="text-[9px] text-slate-600 uppercase font-black tracking-widest">Memórias do Exemplar</span>
                    </div>
                    {isEditing ? (
                      <textarea value={formData.values} onChange={e => handleChange('values', e.target.value)} className="w-full bg-[#020617] text-white text-xs p-4 rounded-xl border border-slate-800 h-32 outline-none italic transition-all focus:border-brand-500 shadow-inner" />
                    ) : (
                      <p className="text-xs text-slate-400 italic leading-relaxed group-hover:text-slate-300 transition-colors">{formData.values || 'Sem observações técnicas.'}</p>
                    )}
                 </div>
                 
                 <div className="text-[8px] text-slate-800 font-black uppercase tracking-[0.4em] text-center pt-8 border-t border-slate-900/50 pb-4">
                    Visionary Archive • Vovô Jorge
                 </div>
              </div>
           </div>
      </div>
    </div>
  );
};
