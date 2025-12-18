
import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Edit2, Trash2, Save, Check, 
  Hash, Clock, Flag, MapPin, Info, 
  History, Building2, Globe, Fingerprint,
  Sparkles, Columns, Ruler, Printer, Banknote, ScanLine
} from 'lucide-react';
import { ScratchcardData, ScratchcardState } from '../types';

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
    if (image) {
      setFormData(image);
      setActiveImage(image.frontUrl);
      setActiveLabel('front');
      setIsEditing(false);
      setIsZoomed(false);
    }
  }, [image]);

  const seriesMembers = useMemo(() => {
    if (!image.isSeries) return [];
    return contextImages
      .filter(img => (img.gameNumber === image.gameNumber && img.gameName === image.gameName) || (image.seriesGroupId && img.seriesGroupId === image.seriesGroupId))
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

  const DataCard = ({ icon: Icon, label, value, colorClass = "text-slate-400", subValue }: any) => (
    <div className="bg-slate-900/60 backdrop-blur-md p-3 rounded-xl border border-slate-800 transition-all flex flex-col justify-between">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className={`w-3 h-3 ${colorClass}`} />
        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
      </div>
      <div>
        <p className="text-xs font-black text-slate-200 leading-tight">{value || '-'}</p>
        {subValue && <p className="text-[7px] text-slate-600 font-bold mt-0.5 uppercase tracking-tighter">{subValue}</p>}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-xl" onClick={onClose}>
      <button className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors z-[10000] p-4 bg-slate-900 border border-white/10 rounded-full" onClick={onClose}>
        <X className="w-8 h-8" />
      </button>

      <div className={`w-full h-full md:h-[90vh] md:max-w-7xl flex flex-col md:flex-row bg-slate-950 md:rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative`} onClick={e => e.stopPropagation()}>
         
         <div className="flex-1 bg-black relative flex flex-col min-h-0 border-b md:border-b-0 md:border-r border-slate-900">
            {viewMode === 'single' ? (
              <div className="flex-1 flex flex-col min-h-0 w-full h-full">
                <div className={`flex-1 relative w-full h-full flex items-center justify-center p-4 md:p-10 ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`} onClick={() => setIsZoomed(!isZoomed)}>
                   <img src={activeImage} className={`max-w-full max-h-full object-contain transition-transform duration-300 ${isZoomed ? 'scale-150' : 'scale-100'}`} />
                </div>
                <div className="h-28 bg-slate-950 border-t border-slate-800 p-4 flex items-center gap-6 justify-center shrink-0">
                   <button onClick={() => { setActiveImage(image.frontUrl); setActiveLabel('front'); }} className={`relative h-20 aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeLabel === 'front' ? 'border-blue-500 scale-105 shadow-xl' : 'border-slate-800 opacity-40'}`}>
                      <img src={image.frontUrl} className="w-full h-full object-cover" />
                   </button>
                   {image.backUrl && (
                      <button onClick={() => { setActiveImage(image.backUrl!); setActiveLabel('back'); }} className={`relative h-20 aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeLabel === 'back' ? 'border-brand-500 scale-105 shadow-xl' : 'border-slate-800 opacity-40'}`}>
                        <img src={image.backUrl} className="w-full h-full object-cover" />
                      </button>
                   )}
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto bg-slate-950 p-8 custom-scrollbar">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {seriesMembers.map((member) => (
                      <div key={member.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col gap-3 cursor-pointer" onClick={() => onImageSelect(member)}>
                         <img src={member.frontUrl} className="w-full aspect-[3/4] object-contain rounded-lg" />
                         <span className="text-[8px] font-black text-slate-500 text-center uppercase tracking-widest">{member.customId}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
         </div>

         <div className="w-full md:w-[450px] bg-slate-950 flex flex-col h-full z-20 border-l border-slate-900 overflow-hidden shrink-0">
              <div className="p-6 border-b border-slate-900 bg-slate-900/40 backdrop-blur flex justify-between items-center shrink-0">
                 <div className="flex gap-2">
                    {isAdmin && (
                       <>
                          <button onClick={isEditing ? handleSave : () => setIsEditing(true)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${isEditing ? 'bg-green-600 text-white' : 'bg-slate-800 text-blue-400 border border-slate-700'}`}>
                             {isEditing ? <Save className="w-4 h-4"/> : <Edit2 className="w-4 h-4"/>} {isEditing ? 'Guardar' : 'Editar'}
                          </button>
                          {!isEditing && <button onClick={handleDelete} className="p-2.5 bg-slate-900 hover:bg-red-600 text-slate-600 hover:text-white rounded-xl transition-all"><Trash2 className="w-5 h-5"/></button>}
                       </>
                    )}
                 </div>
                 {currentUser && (
                    <button onClick={toggleCollection} className={`px-5 py-2.5 rounded-xl text-[10px] font-black border transition-all flex items-center gap-2 ${formData.owners?.includes(currentUser) ? 'bg-green-600 text-white border-green-500 shadow-xl shadow-green-900/20' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
                       <Check className="w-4 h-4" /> {formData.owners?.includes(currentUser) ? 'Coleção' : 'Marcar'}
                    </button>
                 )}
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                 <div className="space-y-2">
                    <div className="flex items-center gap-2 text-blue-900 mb-2">
                       <Fingerprint className="w-4 h-4" />
                       <span className="text-[10px] font-black uppercase tracking-widest">{formData.customId}</span>
                       {formData.aiGenerated && <Sparkles className="w-4 h-4 text-cyan-800 ml-auto" />}
                    </div>
                    {isEditing ? (
                       <div className="space-y-4">
                          <input type="text" value={formData.gameName} onChange={e => handleChange('gameName', e.target.value)} className="w-full bg-slate-900 text-white text-xl font-black rounded-xl p-4 border border-slate-800 outline-none" />
                          <input type="text" value={formData.operator || ''} onChange={e => handleChange('operator', e.target.value)} className="w-full bg-slate-900 text-blue-400 text-sm font-black rounded-xl p-4 border border-slate-800 outline-none" placeholder="Operador" />
                          <input type="text" value={formData.lines || ''} onChange={e => handleChange('lines', e.target.value)} className="w-full bg-slate-900 text-emerald-400 text-sm font-black rounded-xl p-4 border border-slate-800 outline-none" placeholder="Cor das Linhas" />
                       </div>
                    ) : (
                       <>
                          <h2 className="text-3xl font-black text-slate-100 uppercase tracking-tighter italic leading-none">{formData.gameName}</h2>
                          {formData.operator && <div className="text-blue-500 text-xs font-black uppercase tracking-widest mt-2">{formData.operator}</div>}
                       </>
                    )}
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <DataCard icon={ScanLine} label="Linhas" value={formData.lines} colorClass="text-emerald-500" />
                    <DataCard icon={Building2} label="Entidade" value={formData.operator} colorClass="text-blue-500" />
                    <DataCard icon={Hash} label="Nº Jogo" value={formData.gameNumber} colorClass="text-slate-500" />
                    <DataCard icon={Flag} label="País" value={formData.country} colorClass="text-red-500" />
                    <DataCard icon={Globe} label="Continente" value={formData.continent} colorClass="text-indigo-500" />
                    <DataCard icon={Clock} label="Ano" value={formData.releaseDate} colorClass="text-orange-500" />
                    <DataCard icon={Banknote} label="Preço" value={formData.price} colorClass="text-green-500" />
                    <DataCard icon={Printer} label="Gráfica" value={formData.printer} colorClass="text-slate-500" />
                 </div>

                 <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                    <span className="text-[9px] text-slate-500 uppercase block mb-3 font-black tracking-widest">Resumo Técnico</span>
                    {isEditing ? (
                      <textarea value={formData.values} onChange={e => handleChange('values', e.target.value)} className="w-full bg-slate-900 text-white text-xs p-4 rounded-xl border border-slate-800 h-32 outline-none italic" />
                    ) : (
                      <p className="text-xs text-slate-400 italic leading-relaxed">{formData.values || 'Sem observações catalogadas.'}</p>
                    )}
                 </div>
              </div>
           </div>
         )}
      </div>
    </div>
  );
};
