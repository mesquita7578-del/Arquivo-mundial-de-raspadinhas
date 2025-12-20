
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, Edit2, Trash2, Save, 
  Hash, Clock, Flag, MapPin, Info, 
  Building2, Globe, Fingerprint,
  Ruler, Printer, Banknote, ScanLine,
  LayoutGrid, Eye, User,
  RefreshCw, Layers as LayersIcon, ChevronLeft, ChevronRight,
  Maximize2, Activity, Ship, Palette, Calendar, Percent, Check, Star
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
  { id: 'CAMPIONE', label: 'CAMPIONE' },
  { id: '样本', label: '样本' },
  { id: 'MUSTER', label: 'MUSTER' },
  { id: 'PRØVE', label: 'PRØVE' }
];

export const ImageViewer: React.FC<ImageViewerProps> = ({ image, onClose, onUpdate, onDelete, isAdmin, currentUser, contextImages, onImageSelect, t, categories }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ScratchcardData>(image);
  const [activeImage, setActiveImage] = useState<string>(image.frontUrl);
  const [activeLabel, setActiveLabel] = useState<'front' | 'back'>('front');
  
  const currentIndex = useMemo(() => contextImages.findIndex(img => img.id === image.id), [image, contextImages]);
  const hasNext = currentIndex < contextImages.length - 1;
  const hasPrev = currentIndex > 0;

  const isSaved = useMemo(() => {
    if (!currentUser) return false;
    return formData.owners?.includes(currentUser);
  }, [formData.owners, currentUser]);

  const handleNext = () => { if (hasNext) onImageSelect(contextImages[currentIndex + 1]); };
  const handlePrev = () => { if (hasPrev) onImageSelect(contextImages[currentIndex - 1]); };

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

  const handleChange = (field: keyof ScratchcardData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => { onUpdate(formData); setIsEditing(false); };
  const handleDelete = () => { if (confirm(t.deleteConfirm)) onDelete(image.id); };

  const handleToggleSave = () => {
    if (!currentUser) return;
    const currentOwners = formData.owners || [];
    let newOwners;
    if (currentOwners.includes(currentUser)) {
      newOwners = currentOwners.filter(o => o !== currentUser);
    } else {
      newOwners = [...currentOwners, currentUser];
    }
    const updatedData = { ...formData, owners: newOwners };
    setFormData(updatedData);
    onUpdate(updatedData);
  };
  
  const DataTag = ({ icon: Icon, label, value, colorClass = "text-slate-400" }: any) => (
    <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl transition-all">
      <div className={`p-2 rounded-lg bg-slate-800`}>
        <Icon className={`w-4 h-4 ${colorClass}`} />
      </div>
      <div className="flex flex-col">
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
        <span className="text-xs font-black text-slate-200 truncate max-w-[120px]">{value || '-'}</span>
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md" onClick={onClose}>
      
      {hasPrev && (
        <button onClick={(e) => { e.stopPropagation(); handlePrev(); }} className="absolute left-8 z-[10001] p-4 bg-slate-900/50 hover:bg-brand-600 text-white rounded-full border border-white/10 transition-all active:scale-95">
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}
      {hasNext && (
        <button onClick={(e) => { e.stopPropagation(); handleNext(); }} className="absolute right-8 z-[10001] p-4 bg-slate-900/50 hover:bg-brand-600 text-white rounded-full border border-white/10 transition-all active:scale-95">
          <ChevronRight className="w-8 h-8" />
        </button>
      )}

      <div className="w-full h-full md:h-[95vh] md:max-w-7xl flex flex-col md:flex-row bg-[#020617] md:rounded-3xl overflow-hidden border border-white/5 shadow-2xl relative" onClick={e => e.stopPropagation()}>
         
         <div className="flex-1 bg-black/40 relative flex flex-col min-h-0 border-r border-white/5">
            <button className="absolute top-4 right-4 text-white/50 hover:text-white z-50 p-2" onClick={onClose}><X className="w-6 h-6"/></button>
            
            <div className="flex-1 relative flex items-center justify-center p-6 md:p-10 overflow-hidden">
               <div className="relative max-w-full max-h-full flex items-center justify-center">
                  <img 
                    src={activeImage} 
                    className="max-w-full max-h-[75vh] object-contain shadow-2xl rounded-lg" 
                    alt={formData.gameName} 
                  />
                  {formData.backUrl && (
                     <button onClick={toggleImage} className="absolute bottom-4 right-4 bg-brand-600 text-white p-3 rounded-full shadow-xl hover:scale-110 transition-transform">
                        <RefreshCw className="w-5 h-5" />
                     </button>
                  )}
               </div>
            </div>

            <div className="h-24 bg-slate-900/50 border-t border-white/5 p-4 flex items-center gap-4 justify-center shrink-0">
               <button onClick={() => { setActiveImage(formData.frontUrl); setActiveLabel('front'); }} className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${activeLabel === 'front' ? 'border-brand-500 scale-105' : 'border-slate-800 opacity-40 hover:opacity-100'}`}>
                  <img src={formData.frontUrl} className="w-full h-full object-cover" />
               </button>
               {formData.backUrl && (
                  <button onClick={() => { setActiveImage(formData.backUrl!); setActiveLabel('back'); }} className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${activeLabel === 'back' ? 'border-brand-500 scale-105' : 'border-slate-800 opacity-40 hover:opacity-100'}`}>
                    <img src={formData.backUrl} className="w-full h-full object-cover" />
                  </button>
               )}
            </div>
         </div>

         <div className="w-full md:w-[500px] bg-slate-900/30 flex flex-col h-full overflow-hidden shrink-0">
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
                 <div className="flex items-center gap-2">
                   {isAdmin && (
                      <button onClick={isEditing ? handleSave : () => setIsEditing(true)} className={`flex items-center gap-2 px-6 py-2 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${isEditing ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-white/5 text-brand-400 hover:bg-white/10 border border-white/10'}`}>
                         {isEditing ? <Save className="w-4 h-4"/> : <Edit2 className="w-4 h-4"/>} {isEditing ? 'Gravar Alterações' : 'Editar Ficha'}
                      </button>
                   )}
                   {currentUser && !isEditing && (
                     <button 
                       onClick={handleToggleSave}
                       className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all border ${isSaved ? 'bg-brand-600 text-white border-brand-400/50' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}
                       title={isSaved ? "Remover da Coleção" : "Adicionar à Coleção"}
                     >
                       <Star className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                       {isSaved ? "Marcado" : "Marcar"}
                     </button>
                   )}
                 </div>
                 {!isEditing && isAdmin && (
                    <button onClick={handleDelete} className="p-2 text-slate-500 hover:text-red-500 transition-colors"><Trash2 className="w-6 h-6"/></button>
                 )}
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-slate-950/20">
                 
                 {isEditing ? (
                    <div className="space-y-8 animate-fade-in pb-10">
                       {/* Bloco: Identificação */}
                       <section className="space-y-4">
                          <h3 className="text-[10px] font-black text-brand-500 uppercase tracking-[0.3em] flex items-center gap-2">
                            <User className="w-3.5 h-3.5" /> Identificação do Jogo
                          </h3>
                          <div className="space-y-3">
                             <input type="text" value={formData.gameName} onChange={e => handleChange('gameName', e.target.value)} className="w-full bg-slate-950 text-white text-sm font-black rounded-xl p-4 border border-white/10 focus:border-brand-500 outline-none" placeholder="Nome do Jogo" />
                             <div className="grid grid-cols-2 gap-3">
                                <input type="text" value={formData.gameNumber} onChange={e => handleChange('gameNumber', e.target.value)} className="w-full bg-slate-950 text-white text-xs p-3 border border-white/10 rounded-xl outline-none focus:border-brand-500" placeholder="Nº Jogo" />
                                <input type="text" value={formData.customId} onChange={e => handleChange('customId', e.target.value)} className="w-full bg-slate-950 text-white text-xs p-3 border border-white/10 rounded-xl outline-none focus:border-brand-500" placeholder="ID Personalizado" />
                             </div>
                          </div>
                       </section>

                       {/* Bloco: Técnico */}
                       <section className="space-y-4">
                          <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] flex items-center gap-2">
                            <ScanLine className="w-3.5 h-3.5" /> Detalhes Técnicos
                          </h3>
                          <div className="space-y-3">
                             <input type="text" value={formData.operator} onChange={e => handleChange('operator', e.target.value)} className="w-full bg-slate-950 text-white text-xs p-3 border border-white/10 rounded-xl outline-none" placeholder="Operador (ex: SCML)" />
                             <div className="grid grid-cols-2 gap-3">
                                <input type="text" value={formData.size} onChange={e => handleChange('size', e.target.value)} className="w-full bg-slate-950 text-white text-xs p-3 border border-white/10 rounded-xl outline-none" placeholder="Dimensões" />
                                <input type="text" value={formData.emission} onChange={e => handleChange('emission', e.target.value)} className="w-full bg-slate-950 text-white text-xs p-3 border border-white/10 rounded-xl outline-none" placeholder="Tiragem" />
                             </div>
                             <div className="grid grid-cols-2 gap-3">
                                <input type="text" value={formData.printer} onChange={e => handleChange('printer', e.target.value)} className="w-full bg-slate-950 text-white text-xs p-3 border border-white/10 rounded-xl outline-none" placeholder="Gráfica" />
                                <input type="text" value={formData.winProbability} onChange={e => handleChange('winProbability', e.target.value)} className="w-full bg-slate-950 text-white text-xs p-3 border border-white/10 rounded-xl outline-none" placeholder="Probabilidade" />
                             </div>
                          </div>
                          
                          <div className="space-y-3">
                             <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block flex items-center gap-2">
                               <Palette className="w-3 h-3 text-brand-500" /> Cor das Linhas:
                             </span>
                             <div className="flex flex-wrap gap-2 p-2 bg-slate-950 border border-white/5 rounded-2xl">
                                {LINE_COLORS.map(color => (
                                  <button key={color.id} onClick={() => handleChange('lines', color.id)} className={`w-8 h-8 rounded-full ${color.bg} border-2 transition-all flex items-center justify-center ${formData.lines === color.id ? 'border-white scale-110' : 'border-transparent opacity-40 hover:opacity-100'}`}>
                                     {formData.lines === color.id && <Check className="w-4 h-4 text-white" />}
                                  </button>
                                ))}
                             </div>
                          </div>
                       </section>

                       {/* Bloco: Datas e Preço */}
                       <section className="space-y-4">
                          <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" /> Datas e Valores
                          </h3>
                          <div className="grid grid-cols-2 gap-3">
                             <input type="text" value={formData.releaseDate} onChange={e => handleChange('releaseDate', e.target.value)} className="w-full bg-slate-950 text-white text-xs p-3 border border-white/10 rounded-xl outline-none" placeholder="Data Emissão" />
                             <input type="text" value={formData.closeDate} onChange={e => handleChange('closeDate', e.target.value)} className="w-full bg-slate-950 text-white text-xs p-3 border border-white/10 rounded-xl outline-none" placeholder="Data Fecho" />
                             <input type="text" value={formData.price} onChange={e => handleChange('price', e.target.value)} className="w-full bg-slate-950 text-white text-xs p-3 border border-white/10 rounded-xl outline-none" placeholder="Preço" />
                             <select value={formData.state} onChange={e => handleChange('state', e.target.value as any)} className="w-full bg-slate-950 text-white text-[10px] font-black uppercase p-3 border border-white/10 rounded-xl outline-none">
                                {STATE_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                             </select>
                          </div>
                       </section>

                       {/* Bloco: Localização */}
                       <section className="space-y-4">
                          <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5" /> Localização Exata
                          </h3>
                          <div className="grid grid-cols-2 gap-3">
                             <input type="text" value={formData.country} onChange={e => handleChange('country', e.target.value)} className="w-full bg-slate-950 text-white text-xs p-3 border border-white/10 rounded-xl outline-none" placeholder="País" />
                             <input type="text" value={formData.island} onChange={e => handleChange('island', e.target.value)} className="w-full bg-slate-950 text-white text-xs p-3 border border-brand-500/50 rounded-xl outline-none focus:border-brand-500" placeholder="Ilha (Açores...)" />
                             <input type="text" value={formData.region} onChange={e => handleChange('region', e.target.value)} className="w-full bg-slate-950 text-white text-xs p-3 border border-white/10 rounded-xl outline-none" placeholder="Região" />
                             <select value={formData.continent} onChange={e => handleChange('continent', e.target.value as any)} className="w-full bg-slate-950 text-white text-[10px] font-black uppercase p-3 border border-white/10 rounded-xl outline-none">
                                {['Europa', 'América', 'Ásia', 'África', 'Oceania'].map(c => <option key={c} value={c}>{c}</option>)}
                             </select>
                          </div>
                       </section>

                       <section className="space-y-4">
                          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                            <Info className="w-3.5 h-3.5" /> Observações
                          </h3>
                          <textarea value={formData.values} onChange={e => handleChange('values', e.target.value)} className="w-full bg-slate-950 text-white text-xs p-4 rounded-xl border border-white/10 h-32 outline-none italic" placeholder="Notas históricas..." />
                          <input type="text" value={formData.collector} onChange={e => handleChange('collector', e.target.value)} className="w-full bg-slate-950 text-white text-[10px] font-black uppercase p-3 border border-white/10 rounded-xl outline-none" placeholder="Colecionador Responsável" />
                       </section>
                    </div>
                 ) : (
                    <div className="space-y-6">
                       <div className="border-b border-white/5 pb-6">
                          <h2 className="text-3xl font-black text-white uppercase italic leading-none">{formData.gameName}</h2>
                          <div className="flex flex-wrap items-center gap-2 mt-4">
                            <span className="text-brand-500 text-[9px] font-black uppercase tracking-widest bg-brand-500/10 px-2 py-1 rounded border border-brand-500/20">{formData.category}</span>
                            {formData.island && (
                              <div className="flex items-center gap-1.5 bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded border border-cyan-500/30">
                                 <Ship className="w-3 h-3" />
                                 <span className="text-[9px] font-black uppercase tracking-widest">{formData.island}</span>
                              </div>
                            )}
                            <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{formData.operator}</span>
                          </div>
                       </div>

                       <div className="grid grid-cols-2 gap-3 animate-fade-in">
                          <DataTag icon={Hash} label="Nº Jogo" value={formData.gameNumber} colorClass="text-brand-500" />
                          <DataTag icon={Flag} label="País" value={formData.country} colorClass="text-red-500" />
                          {formData.island && <DataTag icon={MapPin} label="Ilha / Arquipélago" value={formData.island} colorClass="text-cyan-500" />}
                          <DataTag icon={Fingerprint} label="ID Único" value={formData.customId} colorClass="text-slate-500" />
                          <DataTag icon={Ruler} label="Formato" value={formData.size} colorClass="text-cyan-500" />
                          <DataTag icon={Clock} label="Ano de Emissão" value={formData.releaseDate} colorClass="text-orange-500" />
                          <DataTag icon={Activity} label="Estado Físico" value={formData.state} colorClass="text-brand-400" />
                          <DataTag icon={Banknote} label="Preço Original" value={formData.price} colorClass="text-emerald-500" />
                          <DataTag icon={Printer} label="Impressão" value={formData.printer} colorClass="text-slate-400" />
                          <DataTag icon={Palette} label="Linhas" value={formData.lines} colorClass="text-brand-500" />
                       </div>

                       <div className="bg-slate-950 p-6 rounded-2xl border border-white/5 space-y-3">
                          <div className="flex items-center gap-2 text-slate-500">
                             <Info className="w-4 h-4" />
                             <span className="text-[10px] font-black uppercase tracking-widest">Notas e Histórico</span>
                          </div>
                          <p className="text-sm text-slate-400 italic leading-relaxed">{formData.values || 'Nenhuma nota registada neste exemplar.'}</p>
                          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                             <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Responsável</span>
                             <span className="text-[10px] font-black text-brand-400 uppercase">{formData.collector || 'Jorge Mesquita'}</span>
                          </div>
                       </div>

                       <div className="text-[8px] text-slate-700 font-black uppercase tracking-[0.4em] text-center pt-8">
                          Visionary Archive • Porto 🐉
                       </div>
                    </div>
                 )}
              </div>
           </div>
      </div>
    </div>
  );
};
