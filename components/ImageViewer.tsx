
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, Edit2, Trash2, Save, Check, 
  Hash, Clock, Flag, MapPin, Info, 
  History, Building2, Globe, Fingerprint,
  Sparkles, Columns, Ruler, Printer, Banknote, ScanLine,
  Layers, LayoutGrid, Eye, Calendar, ChevronDown, User,
  Tag, ShieldCheck, Palette, Activity, Image as ImageIcon,
  Plus
} from 'lucide-react';
import { ScratchcardData, ScratchcardState, Continent, LineType } from '../types';

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

const GERMAN_STATES = [
  "Baden-Württemberg", "Bayern", "Berlin", "Brandenburg", "Bremen", 
  "Hamburg", "Hessen", "Mecklenburg-Vorpommern", "Niedersachsen", 
  "Nordrhein-Westfalen", "Rheinland-Pfalz", "Saarland", "Sachsen", 
  "Sachsen-Anhalt", "Schleswig-Holstein", "Thüringen", 
  "National / Geral", "Outro"
];

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

const STATE_OPTIONS: { id: ScratchcardState; label: string; group: 'Archivio' | 'Condizione' }[] = [
  { id: 'MINT', label: 'MINT', group: 'Condizione' },
  { id: 'SC', label: 'SC', group: 'Condizione' },
  { id: 'CS', label: 'CS', group: 'Condizione' },
  { id: 'AMOSTRA', label: 'AMOSTRA', group: 'Archivio' },
  { id: 'VOID', label: 'VOID', group: 'Archivio' },
  { id: 'SAMPLE', label: 'SAMPLE', group: 'Archivio' },
  { id: 'MUESTRA', label: 'MUESTRA', group: 'Archivio' },
  { id: 'CAMPIONE', label: 'CAMPIONE', group: 'Archivio' },
  { id: '样本', label: '样本', group: 'Archivio' },
  { id: 'MUSTER', label: 'MUSTER', group: 'Archivio' },
  { id: 'PRØVE', label: 'PRØVE', group: 'Archivio' }
];

export const ImageViewer: React.FC<ImageViewerProps> = ({ image, onClose, onUpdate, onDelete, isAdmin, currentUser, contextImages, onImageSelect, t }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ScratchcardData>(image);
  const [activeImage, setActiveImage] = useState<string>(image.frontUrl);
  const [activeLabel, setActiveLabel] = useState<string>('front');
  const [isZoomed, setIsZoomed] = useState(false);
  const [viewMode, setViewMode] = useState<'single' | 'panorama'>('single');
  const backInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (image) {
      setFormData(image);
      setActiveImage(image.frontUrl);
      setActiveLabel('front');
      setIsEditing(false);
      setIsZoomed(false);
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

  const collectorsList = useMemo(() => {
    const defaultCollectors = ["Jorge Mesquita", "Fabio Pagni", "Chloe", "Pedro Rodrigo", "IA", "System"];
    const fromArchive = contextImages.map(img => img.collector).filter(Boolean) as string[];
    const combined = Array.from(new Set([...defaultCollectors, ...fromArchive])).sort((a, b) => a.localeCompare(b));
    return combined;
  }, [contextImages]);

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
        // Se estivermos a editar e carregarmos o verso, mostrar logo o verso
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
  
  const toggleCollection = () => {
    if (!currentUser) return;
    const currentOwners = formData.owners || [];
    const newOwners = currentOwners.includes(currentUser) ? currentOwners.filter(o => o !== currentUser) : [...currentOwners, currentUser];
    const newData = { ...formData, owners: newOwners };
    setFormData(newData);
    onUpdate(newData);
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

  const isGermany = formData.country.toLowerCase().trim() === 'alemanha' || 
                    formData.country.toLowerCase().trim() === 'germany' ||
                    formData.country.toLowerCase().trim() === 'deutschland';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-xl" onClick={onClose}>
      <button className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors z-[10000] p-4 bg-slate-900 border border-white/10 rounded-full shadow-2xl" onClick={onClose}>
        <X className="w-8 h-8" />
      </button>

      <div className={`w-full h-full md:h-[95vh] md:max-w-[1600px] flex flex-col md:flex-row bg-slate-950 md:rounded-3xl overflow-hidden border border-slate-800 shadow-[0_0_100px_rgba(0,0,0,0.8)] relative animate-fade-in`} onClick={e => e.stopPropagation()}>
         
         <div className="flex-1 bg-black relative flex flex-col min-h-0 border-b md:border-b-0 md:border-r border-slate-900">
            {viewMode === 'single' ? (
              <div className="flex-1 flex flex-col min-h-0 w-full h-full">
                <div className={`flex-1 relative w-full h-full flex items-center justify-center p-4 md:p-10 ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`} onClick={() => setIsZoomed(!isZoomed)}>
                   <img src={activeImage} className={`max-w-full max-h-full object-contain transition-transform duration-500 shadow-2xl ${isZoomed ? 'scale-150' : 'scale-100'}`} alt={formData.gameName} />
                </div>
                <div className="h-28 bg-slate-950 border-t border-slate-800 p-4 flex items-center gap-6 justify-center shrink-0">
                   <button onClick={() => { setActiveImage(formData.frontUrl); setActiveLabel('front'); }} className={`relative h-20 aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeLabel === 'front' ? 'border-blue-500 scale-105 shadow-xl' : 'border-slate-800 opacity-40 hover:opacity-100'}`}>
                      <img src={formData.frontUrl} className="w-full h-full object-cover" alt="Frente" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-[10px] font-black text-white uppercase tracking-widest">Frente</div>
                   </button>
                   {formData.backUrl ? (
                      <button onClick={() => { setActiveImage(formData.backUrl!); setActiveLabel('back'); }} className={`relative h-20 aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeLabel === 'back' ? 'border-brand-500 scale-105 shadow-xl' : 'border-slate-800 opacity-40 hover:opacity-100'}`}>
                        <img src={formData.backUrl} className="w-full h-full object-cover" alt="Verso" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-[10px] font-black text-white uppercase tracking-widest">Verso</div>
                      </button>
                   ) : isEditing && (
                      <button onClick={() => backInputRef.current?.click()} className="relative h-20 aspect-square rounded-xl overflow-hidden border-2 border-dashed border-slate-700 bg-slate-900/50 flex flex-col items-center justify-center group hover:border-brand-500 transition-all">
                        <Plus className="w-5 h-5 text-slate-600 group-hover:text-brand-500" />
                        <span className="text-[8px] font-black text-slate-600 uppercase group-hover:text-brand-500">Add Verso</span>
                        <input type="file" ref={backInputRef} className="hidden" accept="image/*" onChange={handleBackImageUpload} />
                      </button>
                   )}
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto bg-slate-950 p-6 md:p-12 custom-scrollbar">
                <div className="flex flex-col gap-12 max-w-5xl mx-auto animate-fade-in">
                   <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                      <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                         <Layers className="w-6 h-6 text-brand-500" /> Visualização do SET: {image.gameName}
                      </h3>
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{seriesMembers.length} Itens Catalogados</span>
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-1 gap-12">
                    {seriesMembers.map((member) => (
                      <div key={member.id} className="bg-slate-900/20 border border-slate-800/50 rounded-3xl p-8 flex flex-col md:flex-row gap-8 hover:border-blue-500/30 transition-all group relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-bl-full pointer-events-none"></div>
                         
                         <div className="flex-1 flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                  <span className="text-[10px] font-black text-white bg-blue-600 px-3 py-1 rounded-md border border-blue-400/50 shadow-lg shadow-blue-900/20">{member.customId}</span>
                                  {member.id === image.id && <span className="text-[8px] font-black text-brand-500 uppercase tracking-widest bg-brand-900/20 px-2 py-0.5 rounded border border-brand-500/20">Item Selecionado</span>}
                               </div>
                               <button onClick={() => onImageSelect(member)} className="text-[10px] font-black text-slate-500 hover:text-white flex items-center gap-1.5 uppercase transition-colors group/btn">
                                  <Eye className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" /> Ver Detalhes
                               </button>
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                               <div className="space-y-3">
                                  <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest text-center flex items-center justify-center gap-2">
                                     <div className="h-px w-4 bg-slate-800"></div> FRENTE <div className="h-px w-4 bg-slate-800"></div>
                                  </div>
                                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-slate-800 group-hover:border-blue-500/50 transition-all">
                                     <img src={member.frontUrl} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" alt="Frente" />
                                  </div>
                               </div>
                               <div className="space-y-3">
                                  <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest text-center flex items-center justify-center gap-2">
                                     <div className="h-px w-4 bg-slate-800"></div> VERSO <div className="h-px w-4 bg-slate-800"></div>
                                  </div>
                                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-slate-800 group-hover:border-blue-500/50 transition-all flex items-center justify-center bg-slate-900/50">
                                     {member.backUrl ? (
                                        <img src={member.backUrl} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" alt="Verso" />
                                     ) : (
                                        <div className="text-slate-700 text-[10px] font-black uppercase italic tracking-widest text-center p-4">Verso não catalogado</div>
                                     )}
                                  </div>
                               </div>
                            </div>
                         </div>
                         <div className="w-full md:w-60 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-800/50 pt-6 md:pt-0 md:pl-8 space-y-4">
                            <div>
                               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Ano de Lançamento</span>
                               <span className="text-lg font-black text-white italic">{member.releaseDate || '-'}</span>
                            </div>
                            <div>
                               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Linhas Técnicas</span>
                               <span className="text-sm font-black text-emerald-500 uppercase italic tracking-wider flex items-center gap-2">
                                  <ScanLine className="w-4 h-4" /> {member.lines || 'Nenhuma'}
                               </span>
                            </div>
                            <div>
                               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Nº de Jogo</span>
                               <span className="text-sm font-black text-blue-400 font-mono">{member.gameNumber || '-'}</span>
                            </div>
                         </div>
                      </div>
                    ))}
                   </div>
                </div>
              </div>
            )}
         </div>

         <div className="w-full md:w-[450px] bg-slate-950 flex flex-col h-full z-20 border-l border-slate-900 overflow-hidden shrink-0">
              <div className="p-6 border-b border-slate-900 bg-slate-900/40 backdrop-blur flex justify-between items-center shrink-0">
                 <div className="flex gap-2">
                    {isAdmin && (
                       <>
                          <button onClick={isEditing ? handleSave : () => setIsEditing(true)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${isEditing ? 'bg-green-600 text-white shadow-lg shadow-green-900/20' : 'bg-slate-800 text-blue-400 border border-slate-700 hover:bg-slate-700'}`}>
                             {isEditing ? <Save className="w-4 h-4"/> : <Edit2 className="w-4 h-4"/>} {isEditing ? 'Guardar' : 'Editar'}
                          </button>
                          {!isEditing && <button onClick={handleDelete} className="p-2.5 bg-slate-900 hover:bg-red-600 text-slate-600 hover:text-white rounded-xl transition-all"><Trash2 className="w-5 h-5"/></button>}
                       </>
                    )}
                 </div>
                 <div className="flex items-center gap-2">
                    {(image.isSeries || seriesMembers.length > 1) && !isEditing && (
                       <button 
                         onClick={() => setViewMode(viewMode === 'single' ? 'panorama' : 'single')}
                         className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-widest ${viewMode === 'panorama' ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/20' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'}`}
                       >
                          {viewMode === 'single' ? <LayoutGrid className="w-4 h-4" /> : <Columns className="w-4 h-4" />}
                          {viewMode === 'single' ? 'Ver SET' : 'Individual'}
                       </button>
                    )}
                    {currentUser && (
                       <button onClick={toggleCollection} className={`px-5 py-2.5 rounded-xl text-[10px] font-black border transition-all flex items-center gap-2 ${formData.owners?.includes(currentUser) ? 'bg-brand-600 text-white border-brand-500 shadow-xl shadow-brand-900/20' : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-white'}`}>
                          <Check className="w-4 h-4" /> {formData.owners?.includes(currentUser) ? 'Coleção' : 'Marcar'}
                       </button>
                    )}
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                 <div className="space-y-2">
                    <div className="flex items-center gap-2 text-blue-900 mb-2">
                       <Fingerprint className="w-4 h-4" />
                       <span className="text-[10px] font-black uppercase tracking-widest">{formData.customId}</span>
                       {formData.isSeries && <span className="ml-2 bg-brand-900/30 text-brand-400 px-2 py-0.5 rounded text-[8px] font-black border border-brand-500/20">SET / SÉRIE</span>}
                       {formData.aiGenerated && <Sparkles className="w-4 h-4 text-cyan-800 ml-auto animate-pulse" />}
                    </div>
                    {isEditing ? (
                       <div className="space-y-4 animate-fade-in">
                          <div className="space-y-1">
                             <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Nome do Jogo</label>
                             <input type="text" value={formData.gameName} onChange={e => handleChange('gameName', e.target.value)} className="w-full bg-slate-900 text-white text-lg font-black rounded-xl p-3 border border-slate-800 outline-none focus:border-blue-500 transition-all shadow-inner" />
                          </div>

                          <div className="space-y-1">
                             <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Colecionador</label>
                             <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-brand-500 transition-colors" />
                                <select 
                                   value={formData.collector || ''} 
                                   onChange={e => handleChange('collector', e.target.value)} 
                                   className="w-full bg-slate-900 text-white text-sm font-black rounded-xl p-3 pl-10 border border-slate-800 outline-none focus:border-brand-500 transition-all shadow-inner appearance-none cursor-pointer"
                                >
                                   <option value="">Selecione o Colecionador...</option>
                                   {collectorsList.map(name => (
                                      <option key={name} value={name}>{name}</option>
                                   ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none group-focus-within:text-brand-500 transition-colors" />
                             </div>
                          </div>

                          {/* SELETOR DE ESTADO FÍSICO NO EDITOR */}
                          <div className="space-y-2">
                             <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Activity className="w-3.5 h-3.5 text-blue-500" /> Estado Físico
                             </label>
                             <div className="flex flex-wrap gap-1.5 p-2 bg-slate-900 rounded-xl border border-slate-800 shadow-inner">
                                {STATE_OPTIONS.map(opt => (
                                   <button
                                     key={opt.id}
                                     onClick={() => handleChange('state', opt.id)}
                                     className={`px-2 py-1.5 rounded-md text-[8px] font-black uppercase tracking-tighter border transition-all ${formData.state === opt.id ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-950 border-slate-800 text-slate-600 hover:text-slate-400'}`}
                                   >
                                      {opt.label}
                                   </button>
                                ))}
                             </div>
                          </div>
                          
                          <div className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                             <input type="checkbox" id="isSeriesEdit" checked={formData.isSeries} onChange={e => handleChange('isSeries', e.target.checked)} className="w-5 h-5 accent-brand-500 cursor-pointer" />
                             <label htmlFor="isSeriesEdit" className="text-xs font-black text-slate-300 uppercase cursor-pointer select-none">Pertence a uma Série (SET)</label>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">País</label>
                                <input type="text" value={formData.country} onChange={e => handleChange('country', e.target.value)} className="w-full bg-slate-900 text-red-400 text-sm font-black rounded-xl p-3 border border-slate-800 outline-none focus:border-red-500/50 transition-all shadow-inner" />
                             </div>
                             <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest flex items-center justify-between ml-1">
                                   Região / Estado
                                   {isGermany && <span className="text-[7px] bg-red-900/50 text-red-400 px-1 rounded">ALEMANHA</span>}
                                </label>
                                {isGermany ? (
                                   <div className="relative">
                                     <select 
                                       value={formData.region || ''} 
                                       onChange={e => handleChange('region', e.target.value)} 
                                       className="w-full bg-slate-900 text-white text-sm font-black rounded-xl p-3 border border-slate-800 outline-none focus:border-blue-500 transition-all appearance-none pr-10 shadow-inner"
                                     >
                                        <option value="">Selecione o Estado...</option>
                                        {GERMAN_STATES.map(state => <option key={state} value={state}>{state}</option>)}
                                     </select>
                                     <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                                   </div>
                                ) : (
                                   <input type="text" value={formData.region || ''} onChange={e => handleChange('region', e.target.value)} className="w-full bg-slate-900 text-white text-sm font-black rounded-xl p-3 border border-slate-800 outline-none focus:border-blue-500 transition-all shadow-inner" placeholder="Ex: Continente" />
                                )}
                             </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Operador</label>
                                <input type="text" value={formData.operator || ''} onChange={e => handleChange('operator', e.target.value)} className="w-full bg-slate-900 text-blue-400 text-sm font-black rounded-xl p-3 border border-slate-800 outline-none focus:border-blue-500 shadow-inner" placeholder="Ex: SCML" />
                             </div>
                             <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Nº Jogo</label>
                                <input type="text" value={formData.gameNumber || ''} onChange={e => handleChange('gameNumber', e.target.value)} className="w-full bg-slate-900 text-slate-400 text-sm font-black rounded-xl p-3 border border-slate-800 outline-none focus:border-slate-500 shadow-inner" />
                             </div>
                          </div>

                          <div className="space-y-2">
                             <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                               <Palette className="w-3 h-3 text-brand-500" /> Linhas de Segurança
                             </label>
                             <div className="flex flex-wrap gap-2 p-2 bg-slate-900 rounded-xl border border-slate-800 shadow-inner">
                                {LINE_COLORS.map(color => (
                                  <button
                                    key={color.id}
                                    onClick={() => handleChange('lines', color.id)}
                                    className={`w-8 h-8 rounded-full ${color.bg} border-2 transition-all flex items-center justify-center ${formData.lines === color.id ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'}`}
                                    title={color.label}
                                  >
                                    {formData.lines === color.id && <Check className="w-4 h-4 text-white" />}
                                  </button>
                                ))}
                             </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Continente</label>
                                <select value={formData.continent} onChange={e => handleChange('continent', e.target.value)} className="w-full bg-slate-900 text-indigo-400 text-sm font-black rounded-xl p-3 border border-slate-800 outline-none focus:border-indigo-500 shadow-inner">
                                   {CONTINENTS.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                             </div>
                          </div>
                       </div>
                    ) : (
                       <div className="animate-fade-in border-b border-slate-900 pb-6">
                          <h2 className="text-4xl font-black text-slate-100 uppercase tracking-tighter italic leading-none">{formData.gameName}</h2>
                          {formData.operator && (
                            <div className="flex items-center gap-2 mt-3">
                              <Building2 className="w-3.5 h-3.5 text-blue-500" />
                              <span className="text-blue-500 text-xs font-black uppercase tracking-[0.2em]">{formData.operator}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-2 bg-slate-900/50 w-fit px-3 py-1 rounded-full border border-slate-800">
                             <User className="w-3 h-3 text-brand-500" />
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Colecionador: <span className="text-brand-400">{formData.collector || 'Arquivo Geral'}</span></span>
                          </div>
                       </div>
                    )}
                 </div>

                 {!isEditing && (
                    <div className="grid grid-cols-2 gap-3 animate-fade-in">
                       <DataTag icon={ScanLine} label="Linhas Técnicas" value={formData.lines} colorClass="text-emerald-500" />
                       <DataTag icon={ShieldCheck} label="Operador" value={formData.operator} colorClass="text-blue-500" />
                       <DataTag icon={Hash} label="Referência Jogo" value={formData.gameNumber} colorClass="text-slate-500" />
                       <DataTag icon={Flag} label="Nação" value={formData.country} colorClass="text-red-500" />
                       <DataTag icon={MapPin} label="Região/Estado" value={formData.region} colorClass="text-white" />
                       <DataTag icon={Globe} label="Continente" value={formData.continent} colorClass="text-indigo-500" />
                       <DataTag icon={Clock} label="Ano Lançamento" value={formData.releaseDate} colorClass="text-orange-500" />
                       <DataTag icon={Banknote} label="Valor Facial" value={formData.price} colorClass="text-green-500" />
                       <DataTag icon={Printer} label="Impressão" value={formData.printer} colorClass="text-slate-500" />
                       <DataTag icon={Ruler} label="Medidas" value={formData.size} colorClass="text-cyan-500" />
                    </div>
                 )}

                 <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 shadow-inner group">
                    <div className="flex items-center gap-2 mb-4">
                       <Info className="w-3.5 h-3.5 text-slate-500" />
                       <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Observações do Curador</span>
                    </div>
                    {isEditing ? (
                      <textarea value={formData.values} onChange={e => handleChange('values', e.target.value)} className="w-full bg-slate-900 text-white text-xs p-4 rounded-xl border border-slate-800 h-32 outline-none italic transition-all focus:border-brand-500 shadow-inner" placeholder="Detalhes técnicos, prémios, raridade..." />
                    ) : (
                      <p className="text-xs text-slate-400 italic leading-relaxed group-hover:text-slate-300 transition-colors">{formData.values || 'Nenhuma observação técnica adicional para este exemplar.'}</p>
                    )}
                 </div>
                 
                 <div className="text-[9px] text-slate-800 font-black uppercase tracking-[0.3em] text-center pt-8 border-t border-slate-900/50 pb-4">
                    Arquivo Mundial de Raspadinhas • Jorge Mesquita
                 </div>
              </div>
           </div>
      </div>
    </div>
  );
};
