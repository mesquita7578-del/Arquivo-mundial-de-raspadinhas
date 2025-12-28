
import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Edit2, Trash2, Save, 
  Hash, Clock, Flag, MapPin, Info, 
  Building2, Globe, Fingerprint,
  Ruler, Printer, Banknote, ScanLine,
  LayoutGrid, Eye, User,
  RefreshCw, Layers as LayersIcon, ChevronLeft, ChevronRight,
  Maximize2, Activity, Ship, Palette, Calendar, Percent, Check, Star, ImagePlus, LayoutList,
  Columns2, Grid3X3, Layout, StickyNote, AlertCircle, Factory, Tag, Trash,
  CalendarDays, ShieldCheck, Zap, Layers, Microscope, Images, ChevronDown
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

export const ImageViewer: React.FC<ImageViewerProps> = ({ image, onClose, onUpdate, onDelete, isAdmin, currentUser, contextImages, onImageSelect, t, categories }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showSeriesComparison, setShowSeriesComparison] = useState(false);
  const [formData, setFormData] = useState<ScratchcardData>(image);
  const [activeImage, setActiveImage] = useState<string>(image.frontUrl);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showFullScreen, setShowFullScreen] = useState<string | null>(null);
  
  const currentIndexInContext = useMemo(() => contextImages.findIndex(img => img.id === image.id), [image, contextImages]);
  const hasNextRecord = currentIndexInContext < contextImages.length - 1;
  const hasPrevRecord = currentIndexInContext > 0;

  // Lista única de colecionadores existentes para o dropdown
  const collectors = useMemo(() => {
    const names = new Set(contextImages.map(img => img.collector).filter(Boolean));
    if (currentUser) names.add(currentUser);
    // Adiciona o colecionador atual do item se não estiver na lista
    if (image.collector) names.add(image.collector);
    return Array.from(names).sort();
  }, [contextImages, currentUser, image.collector]);

  const seriesItems = useMemo(() => {
    return contextImages.filter(img => {
      if (image.seriesGroupId && img.seriesGroupId && img.seriesGroupId.toLowerCase() === image.seriesGroupId.toLowerCase()) {
        return true;
      }
      const sameName = img.gameName.toLowerCase() === image.gameName.toLowerCase();
      const sameCountry = img.country.toLowerCase() === image.country.toLowerCase();
      const sameOperator = (img.operator || '').toLowerCase() === (image.operator || '').toLowerCase();
      return sameName && sameCountry && sameOperator;
    });
  }, [image, contextImages]);

  const localGallery = useMemo(() => {
    const gal = [image.frontUrl];
    if (image.backUrl) gal.push(image.backUrl);
    if (image.gallery) gal.push(...image.gallery);
    return gal;
  }, [image]);

  const handleNextRecord = () => { if (hasNextRecord) onImageSelect(contextImages[currentIndexInContext + 1]); };
  const handlePrevRecord = () => { if (hasPrevRecord) onImageSelect(contextImages[currentIndexInContext - 1]); };

  useEffect(() => {
    setActiveImage(localGallery[activeIndex]);
  }, [activeIndex, localGallery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditing) return;
      if (e.key === 'ArrowRight') handleNextRecord();
      if (e.key === 'ArrowLeft') handlePrevRecord();
      if (e.key === 'Escape') {
        if (showFullScreen) setShowFullScreen(null);
        else onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndexInContext, isEditing, showFullScreen]);

  useEffect(() => {
    if (image) {
      setFormData(image);
      setActiveIndex(0);
      setIsEditing(false);
      const isSameSeries = seriesItems.some(s => s.id === image.id);
      if (!isSameSeries) setShowSeriesComparison(false);
    }
  }, [image]);

  const handleChange = (field: keyof ScratchcardData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClearData = () => {
    if (confirm("Quer limpar todos os campos de texto para preencher de novo, vovô? hihi!")) {
      setFormData(prev => ({
        ...prev,
        gameNumber: '',
        price: '',
        releaseDate: '',
        closeDate: '',
        operator: '',
        printer: '',
        emission: '',
        size: '',
        winProbability: '',
        values: ''
      }));
    }
  };

  const handleSave = () => { onUpdate(formData); setIsEditing(false); };
  const handleDelete = () => { 
    if (confirm("Vovô Jorge, tem a certeza que quer REMOVER TODO ESTE REGISTO do arquivo para sempre? hihi!")) {
      onDelete(image.id);
    } 
  };

  const DataCard = ({ icon: Icon, label, value, colorClass = "text-slate-400", subValue }: any) => (
    <div className="group bg-slate-900/40 border border-white/5 hover:border-brand-500/30 p-3 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-brand-900/10">
      <div className="flex items-start justify-between mb-2">
        <div className={`p-1.5 rounded-lg bg-slate-950 border border-white/5 group-hover:scale-110 transition-transform`}>
          <Icon className={`w-3.5 h-3.5 ${colorClass}`} />
        </div>
        {subValue && <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest">{subValue}</span>}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1 group-hover:text-brand-400 transition-colors">{label}</span>
        <span className="text-[10px] font-black text-slate-100 truncate tracking-tight">{value || '-'}</span>
      </div>
    </div>
  );

  const SectionHeader = ({ icon: Icon, title, color = "text-brand-500" }: any) => (
    <div className="flex items-center gap-2 mb-3 mt-6 first:mt-0">
      <Icon className={`w-3 h-3 ${color}`} />
      <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">{title}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md" onClick={onClose}>
      
      {/* FullScreen Overlay */}
      {showFullScreen && (
        <div className="fixed inset-0 z-[10005] bg-black/98 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowFullScreen(null)}>
           <img src={showFullScreen} className="max-w-full max-h-full object-contain shadow-2xl rounded-lg" />
           <button className="absolute top-8 right-8 bg-white/10 hover:bg-white/20 p-4 rounded-full text-white"><X className="w-8 h-8" /></button>
        </div>
      )}

      {!showSeriesComparison && hasPrevRecord && (
        <button onClick={(e) => { e.stopPropagation(); handlePrevRecord(); }} className="absolute left-6 z-[10001] p-3 bg-slate-900/50 hover:bg-brand-600 text-white rounded-full border border-white/10 transition-all active:scale-95 hidden md:block">
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      {!showSeriesComparison && hasNextRecord && (
        <button onClick={(e) => { e.stopPropagation(); handleNextRecord(); }} className="absolute right-6 z-[10001] p-3 bg-slate-900/50 hover:bg-brand-600 text-white rounded-full border border-white/10 transition-all active:scale-95 hidden md:block">
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      <div className={`w-full h-full md:h-[92vh] ${showSeriesComparison ? 'md:max-w-[95vw]' : 'md:max-w-[1400px]'} flex flex-col md:flex-row bg-[#020617] md:rounded-3xl overflow-hidden border border-white/5 shadow-2xl relative transition-all duration-500`} onClick={e => e.stopPropagation()}>
         
         {/* Visual Side: Grelha Ultra-Compacta para SETs */}
         <div className="flex-1 bg-black/40 relative flex flex-col min-h-0 border-r border-white/5 overflow-hidden">
            <button className="absolute top-4 right-4 text-white/50 hover:text-white z-50 p-2 bg-slate-800/50 rounded-full" onClick={onClose}><X className="w-5 h-5"/></button>
            
            {showSeriesComparison ? (
               <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar animate-fade-in">
                  <div className="flex items-center justify-between mb-8">
                     <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-brand-600 rounded-xl shadow-lg"><Grid3X3 className="w-5 h-5 text-white" /></div>
                        <div>
                           <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Comparação da Série</h3>
                           <p className="text-slate-500 text-[8px] font-black uppercase tracking-widest">{seriesItems.length} exemplares registados hihi!</p>
                        </div>
                     </div>
                     <button onClick={() => setShowSeriesComparison(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-[9px] font-black uppercase tracking-widest hover:text-white transition-all border border-slate-700">Ficha Individual</button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                     {seriesItems.map((sItem) => (
                        <div key={sItem.id} onClick={() => onImageSelect(sItem)} className={`group aspect-[3/4] bg-slate-900 rounded-2xl border-2 transition-all cursor-pointer overflow-hidden ${sItem.id === image.id ? 'border-brand-500 shadow-lg scale-105 z-10' : 'border-white/5 hover:border-white/20'}`}>
                           <img src={sItem.frontUrl} className="w-full h-full object-cover" />
                        </div>
                     ))}
                  </div>
               </div>
            ) : (
               <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
                  {localGallery.length === 1 ? (
                    <div className="h-full flex items-center justify-center">
                       <img src={localGallery[0]} className="max-w-full max-h-[70vh] object-contain shadow-2xl rounded-lg animate-fade-in" onClick={() => setShowFullScreen(localGallery[0])}/>
                    </div>
                  ) : (
                    <div className="space-y-8 animate-fade-in">
                       <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                          <Images className="w-6 h-6 text-brand-500" />
                          <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Grelha do SET <span className="text-slate-500">({localGallery.length} imagens)</span></h3>
                       </div>
                       
                       {/* GRELHA DINÂMICA COMPACTA: Ideal para SETs com muitas imagens */}
                       <div className="grid gap-2 grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
                          {localGallery.map((src, i) => (
                            <div key={i} className="group relative aspect-square bg-slate-900 rounded-lg overflow-hidden border border-white/5 hover:border-brand-500/50 transition-all cursor-zoom-in shadow-lg" onClick={() => setShowFullScreen(src)}>
                               <img src={src} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                               <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                  <Maximize2 className="w-4 h-4 text-white drop-shadow-lg" />
                               </div>
                               <div className="absolute bottom-1 left-1 right-1 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <span className="bg-black/80 text-white text-[5px] font-black px-1 py-0.5 rounded border border-white/10 uppercase tracking-tighter">
                                     {i === 0 ? 'F' : i === 1 ? 'V' : `P${i-1}`}
                                  </span>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                  )}
               </div>
            )}
         </div>

         {/* Data Side */}
         <div className={`w-full md:w-[450px] bg-slate-900/30 flex flex-col h-full overflow-hidden shrink-0`}>
              <div className="p-5 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
                 <div className="flex items-center gap-2">
                   {isAdmin && (
                      <div className="flex items-center gap-2">
                        <button onClick={isEditing ? handleSave : () => setIsEditing(true)} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${isEditing ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white/5 text-brand-400 hover:bg-white/10 border border-white/10'}`}>
                           {isEditing ? <Save className="w-3.5 h-3.5"/> : <Edit2 className="w-3.5 h-3.5"/>} {isEditing ? 'Gravar' : 'Editar'}
                        </button>
                        
                        {!isEditing && (
                          <button onClick={handleDelete} className="flex items-center gap-2 px-3 py-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-xl border border-red-500/20 transition-all text-[9px] font-black uppercase tracking-widest" title="REMOVER TODO O REGISTO">
                             <Trash2 className="w-3.5 h-3.5" /> Eliminar
                          </button>
                        )}

                        {isEditing && (
                          <button onClick={handleClearData} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl border border-red-500/20" title="Limpar Campos Técnicos">
                             <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                   )}
                 </div>
                 {!isEditing && image.isSeries && (
                   <button onClick={() => setShowSeriesComparison(true)} className="flex items-center gap-2 px-3 py-1.5 bg-brand-600/20 text-brand-400 border border-brand-500/20 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-brand-600 hover:text-white transition-all">
                      <Layers className="w-3 h-3" /> Série
                   </button>
                 )}
                 <button onClick={onClose} className="p-2 text-slate-500 hover:text-white"><X className="w-5 h-5"/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-950/20">
                 {isEditing ? (
                    <div className="space-y-6 animate-fade-in pb-10">
                       <section className="space-y-4">
                          <h3 className="text-[9px] font-black text-brand-500 uppercase tracking-[0.3em] flex items-center gap-2"><Tag className="w-3 h-3" /> Identidade Técnica</h3>
                          <input type="text" value={formData.gameName} onChange={e => handleChange('gameName', e.target.value)} className="w-full bg-slate-950 text-white text-xs font-black rounded-xl p-3 border border-white/5 focus:border-brand-500 outline-none" placeholder="Nome" />
                          
                          {/* CAMPO COLECIONADOR ESTILIZADO EM EDIT */}
                          <div className="relative group">
                            <select 
                              value={formData.collector} 
                              onChange={e => handleChange('collector', e.target.value)} 
                              className="w-full bg-slate-950 text-white text-[10px] p-3 border border-white/5 rounded-xl outline-none appearance-none cursor-pointer focus:border-brand-500 font-black uppercase"
                            >
                              {collectors.map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                            <span className="absolute -top-1.5 left-3 bg-slate-950 px-1 text-[7px] text-slate-600 font-black uppercase pointer-events-none">Colecionador Responsável</span>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-500 pointer-events-none" />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                             <input type="text" value={formData.gameNumber} onChange={e => handleChange('gameNumber', e.target.value)} className="w-full bg-slate-950 text-white text-[10px] p-3 border border-white/5 rounded-xl outline-none" placeholder="Nº Jogo" />
                             <input type="text" value={formData.price} onChange={e => handleChange('price', e.target.value)} className="w-full bg-slate-950 text-white text-[10px] p-3 border border-white/5 rounded-xl outline-none" placeholder="Preço" />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                             <div className="space-y-1">
                                <span className="text-[7px] text-slate-500 font-black uppercase ml-2">Lançamento</span>
                                <input type="date" value={formData.releaseDate} onChange={e => handleChange('releaseDate', e.target.value)} className="w-full bg-slate-950 text-white text-[10px] p-3 border border-white/5 rounded-xl outline-none" />
                             </div>
                             <div className="space-y-1">
                                <span className="text-[7px] text-slate-500 font-black uppercase ml-2">Caducidade</span>
                                <input type="date" value={formData.closeDate} onChange={e => handleChange('closeDate', e.target.value)} className="w-full bg-slate-950 text-white text-[10px] p-3 border border-white/5 rounded-xl outline-none" />
                             </div>
                          </div>
                          <input type="text" value={formData.operator} onChange={e => handleChange('operator', e.target.value)} className="w-full bg-slate-950 text-white text-[10px] p-3 border border-white/5 rounded-xl outline-none" placeholder="Operadora / Editora" />
                       </section>
                       
                       <section className="space-y-4">
                          <h3 className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em] flex items-center gap-2"><LayoutList className="w-3 h-3" /> Ficha Técnica</h3>
                          <div className="grid grid-cols-2 gap-3">
                             <input type="text" value={formData.emission} onChange={e => handleChange('emission', e.target.value)} className="w-full bg-slate-950 text-white text-[10px] p-3 border border-white/5 rounded-xl outline-none" placeholder="Emissão" />
                             <input type="text" value={formData.size} onChange={e => handleChange('size', e.target.value)} className="w-full bg-slate-950 text-white text-[10px] p-3 border border-white/5 rounded-xl outline-none" placeholder="Medidas" />
                          </div>
                          <input type="text" value={formData.winProbability} onChange={e => handleChange('winProbability', e.target.value)} className="w-full bg-slate-950 text-white text-[10px] p-3 border border-white/5 rounded-xl outline-none" placeholder="Probabilidade de Ganho" />
                       </section>
                    </div>
                 ) : (
                    <div className="space-y-8 pb-10">
                       <div className="border-b border-white/5 pb-4">
                          <div className="flex items-center gap-2 mb-2">
                             <div className="bg-brand-600 p-1 rounded-md"><Star className="w-3 h-3 text-white fill-current" /></div>
                             <span className="text-[8px] font-black text-brand-500 uppercase tracking-widest">{formData.category}</span>
                          </div>
                          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{formData.gameName}</h2>
                          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">{formData.operator || 'Operador Desconhecido'}</p>
                       </div>

                       {/* Grupo: Identidade e Valor */}
                       <section>
                          <SectionHeader icon={Fingerprint} title="Identidade do Item" color="text-brand-400" />
                          <div className="grid grid-cols-2 gap-3">
                             <DataCard icon={Hash} label="Nº Jogo" value={formData.gameNumber} colorClass="text-brand-500" />
                             <DataCard icon={Banknote} label="Valor Facial" value={formData.price} colorClass="text-emerald-500" />
                             <DataCard icon={ShieldCheck} label="Estado Físico" value={formData.state} colorClass="text-amber-500" />
                             <DataCard icon={User} label="Colecionador" value={formData.collector} colorClass="text-brand-400" />
                             <DataCard icon={Zap} label="Raridade" value={formData.isRarity ? 'PEÇA RARA' : 'COMUM'} colorClass={formData.isRarity ? 'text-rose-500' : 'text-slate-500'} />
                          </div>
                       </section>

                       {/* Grupo: Ciclo de Vida */}
                       <section>
                          <SectionHeader icon={CalendarDays} title="Cronologia Técnica" color="text-orange-500" />
                          <div className="grid grid-cols-2 gap-3">
                             <DataCard icon={Clock} label="Lançamento" value={formData.releaseDate} colorClass="text-orange-400" />
                             <DataCard icon={Calendar} label="Caducidade" value={formData.closeDate} colorClass="text-red-400" />
                          </div>
                       </section>

                       {/* Grupo: Detalhes de Impressão */}
                       <section>
                          <SectionHeader icon={Microscope} title="Dados de Produção" color="text-indigo-500" />
                          <div className="grid grid-cols-2 gap-3">
                             <DataCard icon={Factory} label="Entidade Gráfica" value={formData.printer} colorClass="text-indigo-400" />
                             <DataCard icon={Ruler} label="Medidas Reais" value={formData.size} colorClass="text-blue-400" />
                             <DataCard icon={LayoutList} label="Tiragem Total" value={formData.emission} colorClass="text-purple-400" />
                             <DataCard icon={Percent} label="Probabilidade" value={formData.winProbability} colorClass="text-pink-400" />
                          </div>
                       </section>

                       {/* Grupo: Localização */}
                       <section>
                          <SectionHeader icon={Globe} title="Origem Geográfica" color="text-cyan-500" />
                          <div className="grid grid-cols-2 gap-3">
                             <DataCard icon={Flag} label="Nação" value={formData.country} colorClass="text-red-500" />
                             <DataCard icon={MapPin} label="Região / Ilha" value={formData.island || formData.region} colorClass="text-cyan-400" />
                          </div>
                       </section>

                       {/* Notas Adicionais */}
                       <div className="bg-slate-900 border border-brand-500/10 p-5 rounded-3xl space-y-3 shadow-inner">
                          <div className="flex items-center gap-2 text-slate-500">
                             <Info className="w-3.5 h-3.5 text-brand-500" />
                             <span className="text-[8px] font-black uppercase tracking-widest">Observações de Curador</span>
                          </div>
                          <p className="text-xs text-slate-300 italic leading-relaxed border-l-2 border-brand-500/30 pl-4">{formData.values || 'Nenhuma nota especial registada para este exemplar.'}</p>
                       </div>
                    </div>
                 )}
              </div>
           </div>
      </div>
    </div>
  );
};
