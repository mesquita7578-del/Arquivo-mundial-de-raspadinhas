
import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Edit2, Trash2, Save, 
  Hash, Clock, Flag, MapPin, Info, 
  Building2, Globe, Fingerprint,
  Ruler, Printer, Banknote, ScanLine,
  LayoutGrid, Eye, User,
  RefreshCw, Layers as LayersIcon, ChevronLeft, ChevronRight,
  Maximize2, Activity, Ship, Palette, Calendar, Percent, Check, Star, ImagePlus, LayoutList,
  Columns2, Grid3X3, Layout, StickyNote, AlertCircle, Factory, Tag
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

const THEME_OPTIONS = [
  { id: 'animais', label: 'Animais' },
  { id: 'natal', label: 'Natal' },
  { id: 'filmes', label: 'Filmes' },
  { id: 'desenhos', label: 'Desenhos Animados' },
  { id: 'desporto', label: 'Desporto' },
  { id: 'ouro', label: 'Ouro' },
  { id: 'espaco', label: 'Espaço' },
  { id: 'automoveis', label: 'Automóveis' },
  { id: 'natureza', label: 'Natureza' },
  { id: 'artes', label: 'Artes' },
  { id: 'historia', label: 'História' },
  { id: 'amor', label: 'Amor' },
];

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
  const [showSeriesComparison, setShowSeriesComparison] = useState(false);
  const [formData, setFormData] = useState<ScratchcardData>(image);
  const [activeImage, setActiveImage] = useState<string>(image.frontUrl);
  const [activeIndex, setActiveIndex] = useState(0);
  
  const currentIndexInContext = useMemo(() => contextImages.findIndex(img => img.id === image.id), [image, contextImages]);
  const hasNextRecord = currentIndexInContext < contextImages.length - 1;
  const hasPrevRecord = currentIndexInContext > 0;

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

  const isSaved = useMemo(() => {
    if (!currentUser) return false;
    return formData.owners?.includes(currentUser);
  }, [formData.owners, currentUser]);

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
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndexInContext, isEditing]);

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
    <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2.5 rounded-xl transition-all">
      <div className={`p-1.5 rounded-lg bg-slate-800 shrink-0`}>
        <Icon className={`w-3.5 h-3.5 ${colorClass}`} />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{label}</span>
        <span className="text-[10px] font-black text-slate-200 truncate">{value || '-'}</span>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md" onClick={onClose}>
      
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

      <div className={`w-full h-full md:h-[92vh] ${showSeriesComparison ? 'md:max-w-[95vw]' : 'md:max-w-6xl'} flex flex-col md:flex-row bg-[#020617] md:rounded-3xl overflow-hidden border border-white/5 shadow-2xl relative transition-all duration-500`} onClick={e => e.stopPropagation()}>
         
         {/* Visual Side */}
         <div className="flex-1 bg-black/40 relative flex flex-col min-h-0 border-r border-white/5">
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
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                     {seriesItems.map((sItem) => (
                        <div key={sItem.id} onClick={() => onImageSelect(sItem)} className={`group aspect-[3/4] bg-slate-900 rounded-2xl border-2 transition-all cursor-pointer overflow-hidden ${sItem.id === image.id ? 'border-brand-500 shadow-lg scale-105 z-10' : 'border-white/5 hover:border-white/20'}`}>
                           <img src={sItem.frontUrl} className="w-full h-full object-cover" />
                        </div>
                     ))}
                  </div>
               </div>
            ) : (
               <div className="flex-1 relative flex items-center justify-center p-6 md:p-10">
                  <img src={activeImage} className="max-w-full max-h-[70vh] object-contain shadow-2xl rounded-lg animate-fade-in" key={activeImage}/>
                  {localGallery.length > 1 && (
                     <button onClick={() => setActiveIndex((activeIndex + 1) % localGallery.length)} className="absolute bottom-4 right-4 bg-brand-600 text-white p-3 rounded-full shadow-xl hover:scale-110 transition-transform border border-brand-400">
                        <RefreshCw className="w-4 h-4" />
                     </button>
                  )}
               </div>
            )}
         </div>

         {/* Data Side - Vista Completa de Profissional */}
         <div className={`w-full md:w-[420px] bg-slate-900/30 flex flex-col h-full overflow-hidden shrink-0`}>
              <div className="p-5 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
                 <div className="flex items-center gap-2">
                   {isAdmin && (
                      <button onClick={isEditing ? handleSave : () => setIsEditing(true)} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${isEditing ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white/5 text-brand-400 hover:bg-white/10 border border-white/10'}`}>
                         {isEditing ? <Save className="w-3.5 h-3.5"/> : <Edit2 className="w-3.5 h-3.5"/>} {isEditing ? 'Gravar' : 'Editar'}
                      </button>
                   )}
                 </div>
                 <button onClick={onClose} className="p-2 text-slate-500 hover:text-white"><X className="w-5 h-5"/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-950/20">
                 {isEditing ? (
                    <div className="space-y-6 animate-fade-in pb-10">
                       <section className="space-y-4">
                          {/* Fixed: Tag was not imported from lucide-react */}
                          <h3 className="text-[9px] font-black text-brand-500 uppercase tracking-[0.3em] flex items-center gap-2"><Tag className="w-3 h-3" /> Identidade Técnica</h3>
                          <input type="text" value={formData.gameName} onChange={e => handleChange('gameName', e.target.value)} className="w-full bg-slate-950 text-white text-xs font-black rounded-xl p-3 border border-white/5 focus:border-brand-500 outline-none" placeholder="Nome" />
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
                          <input type="text" value={formData.printer} onChange={e => handleChange('printer', e.target.value)} className="w-full bg-slate-950 text-white text-[10px] p-3 border border-white/5 rounded-xl outline-none" placeholder="Gráfica / Impressora" />
                       </section>
                    </div>
                 ) : (
                    <div className="space-y-6">
                       <div className="border-b border-white/5 pb-4">
                          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">{formData.gameName}</h2>
                          <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mt-2">{formData.category} • {formData.operator || 'Operador Desconhecido'}</p>
                       </div>

                       <div className="grid grid-cols-2 gap-2 animate-fade-in">
                          <DataTag icon={Hash} label="Nº Jogo" value={formData.gameNumber} colorClass="text-brand-500" />
                          <DataTag icon={Flag} label="País" value={formData.country} colorClass="text-red-500" />
                          <DataTag icon={Clock} label="Lançamento" value={formData.releaseDate} colorClass="text-orange-500" />
                          <DataTag icon={Calendar} label="Caducidade" value={formData.closeDate} colorClass="text-amber-500" />
                          <DataTag icon={Activity} label="Estado" value={formData.state} colorClass="text-brand-400" />
                          <DataTag icon={Banknote} label="Preço" value={formData.price} colorClass="text-emerald-500" />
                          <DataTag icon={LayoutList} label="Emissão" value={formData.emission} colorClass="text-indigo-400" />
                          <DataTag icon={Ruler} label="Medidas" value={formData.size} colorClass="text-blue-400" />
                          <DataTag icon={Percent} label="Sorte" value={formData.winProbability} colorClass="text-pink-400" />
                          <DataTag icon={Factory} label="Gráfica" value={formData.printer} colorClass="text-slate-400" />
                       </div>

                       <div className="bg-slate-950 p-5 rounded-2xl border border-white/5 space-y-4">
                          <div className="flex items-center gap-2 text-slate-500">
                             <Info className="w-3.5 h-3.5" />
                             <span className="text-[8px] font-black uppercase tracking-widest">Notas de Arquivo</span>
                          </div>
                          <p className="text-xs text-slate-400 italic leading-relaxed">{formData.values || 'Nenhuma nota adicional.'}</p>
                       </div>
                    </div>
                 )}
              </div>
           </div>
      </div>
    </div>
  );
};
