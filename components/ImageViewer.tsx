
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, Edit2, Trash2, Save, 
  Hash, Clock, Flag, MapPin, Info, 
  Building2, Globe, Fingerprint,
  Ruler, Printer, Banknote, ScanLine,
  LayoutGrid, Eye, User,
  RefreshCw, Layers as LayersIcon, ChevronLeft, ChevronRight,
  Maximize2, Activity
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

  const currentIndex = useMemo(() => contextImages.findIndex(img => img.id === image.id), [image, contextImages]);
  const hasNext = currentIndex < contextImages.length - 1;
  const hasPrev = currentIndex > 0;

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

  const handleSave = () => { onUpdate(formData); setIsEditing(false); };
  const handleDelete = () => { if (confirm(t.deleteConfirm)) onDelete(image.id); };
  
  const DataTag = ({ icon: Icon, label, value, colorClass = "text-slate-400" }: any) => (
    <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl transition-all">
      <div className={`p-2 rounded-lg bg-slate-800`}>
        <Icon className={`w-4 h-4 ${colorClass}`} />
      </div>
      <div className="flex flex-col">
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
        <span className="text-xs font-black text-slate-200">{value || '-'}</span>
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
      
      {/* Navegação Lateral */}
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

      <div className="w-full h-full md:h-[90vh] md:max-w-6xl flex flex-col md:flex-row bg-[#020617] md:rounded-3xl overflow-hidden border border-white/5 shadow-2xl relative" onClick={e => e.stopPropagation()}>
         
         {/* Lado Esquerdo: Imagem Central */}
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

         {/* Lado Direito: Informação */}
         <div className="w-full md:w-[400px] bg-slate-900/30 flex flex-col h-full overflow-hidden shrink-0">
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
                 {isAdmin && (
                    <button onClick={isEditing ? handleSave : () => setIsEditing(true)} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isEditing ? 'bg-emerald-600 text-white' : 'bg-white/5 text-brand-400 hover:bg-white/10 border border-white/10'}`}>
                       {isEditing ? <Save className="w-4 h-4"/> : <Edit2 className="w-4 h-4"/>} {isEditing ? 'Gravar' : 'Editar'}
                    </button>
                 )}
                 {!isEditing && isAdmin && (
                    <button onClick={handleDelete} className="p-2 text-slate-500 hover:text-red-500"><Trash2 className="w-5 h-5"/></button>
                 )}
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                 <div className="space-y-4">
                    {isEditing ? (
                       <div className="space-y-4 animate-fade-in">
                          <input type="text" value={formData.gameName} onChange={e => handleChange('gameName', e.target.value)} className="w-full bg-slate-950 text-white text-sm font-black rounded-xl p-3 border border-white/10" placeholder="Nome" />
                          <input type="text" value={formData.gameNumber} onChange={e => handleChange('gameNumber', e.target.value)} className="w-full bg-slate-950 text-white text-xs p-3 border border-white/10 rounded-xl" placeholder="Nº Jogo" />
                          <input type="text" value={formData.operator} onChange={e => handleChange('operator', e.target.value)} className="w-full bg-slate-950 text-white text-xs p-3 border border-white/10 rounded-xl" placeholder="Emissor" />
                       </div>
                    ) : (
                       <div className="border-b border-white/5 pb-6">
                          <h2 className="text-3xl font-black text-white uppercase italic leading-none">{formData.gameName}</h2>
                          <div className="flex items-center gap-2 mt-4">
                            <span className="text-brand-500 text-[9px] font-black uppercase tracking-widest bg-brand-500/10 px-2 py-1 rounded border border-brand-500/20">{formData.category}</span>
                            <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{formData.operator}</span>
                          </div>
                       </div>
                    )}
                 </div>

                 {!isEditing && (
                    <div className="grid grid-cols-2 gap-3 animate-fade-in">
                       <DataTag icon={Hash} label="Nº Jogo" value={formData.gameNumber} colorClass="text-brand-500" />
                       <DataTag icon={Fingerprint} label="ID Único" value={formData.customId} colorClass="text-slate-500" />
                       <DataTag icon={Ruler} label="Formato" value={formData.size} colorClass="text-cyan-500" />
                       <DataTag icon={Clock} label="Ano" value={formData.releaseDate} colorClass="text-orange-500" />
                       <DataTag icon={Flag} label="País" value={formData.country} colorClass="text-red-500" />
                       <DataTag icon={Activity} label="Estado" value={formData.state} colorClass="text-brand-400" />
                    </div>
                 )}

                 <div className="bg-slate-950 p-6 rounded-2xl border border-white/5 space-y-3">
                    <div className="flex items-center gap-2 text-slate-500">
                       <Info className="w-4 h-4" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Notas do Colecionador</span>
                    </div>
                    {isEditing ? (
                      <textarea value={formData.values} onChange={e => handleChange('values', e.target.value)} className="w-full bg-slate-900 text-white text-xs p-3 rounded-xl border border-white/10 h-32 outline-none" />
                    ) : (
                      <p className="text-sm text-slate-400 italic leading-relaxed">{formData.values || 'Nenhuma nota registada.'}</p>
                    )}
                 </div>

                 <div className="text-[8px] text-slate-700 font-black uppercase tracking-[0.4em] text-center pt-8">
                    Visionary Archive • Porto 🐉
                 </div>
              </div>
           </div>
      </div>
    </div>
  );
};
