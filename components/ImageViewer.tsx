
import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Edit2, Trash2, Save, Check, 
  ZoomIn, ZoomOut, Star, Gem, Gift,
  Hash, Clock, Flag, MapPin, User, Info, 
  Layers, Tag, Coins, ScanLine, Fingerprint, History, 
  Award, ShieldCheck, CreditCard, Split, Image as ImageIcon,
  Maximize2, Columns, Ruler, Printer, Banknote, Sparkles, Globe,
  Building2
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

  const DataCard = ({ icon: Icon, label, value, colorClass = "text-slate-400", subValue }: any) => (
    <div className="bg-slate-900/40 backdrop-blur-sm p-3 rounded-xl border border-slate-800/50 group hover:border-slate-500/30 transition-all flex flex-col justify-between">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className={`w-3 h-3 ${colorClass}`} />
        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{label}</span>
      </div>
      <div>
        <p className="text-xs font-black text-slate-200 leading-tight">{value || '-'}</p>
        {subValue && <p className="text-[7px] text-slate-600 font-bold mt-0.5 uppercase tracking-tighter">{subValue}</p>}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/98 backdrop-blur-3xl animate-fade-in" onClick={onClose}>
      <button className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-[100] p-2 bg-slate-900/80 rounded-full" onClick={onClose}><X className="w-8 h-8" /></button>

      <div className={`w-full ${viewMode === 'panorama' ? 'h-full flex flex-col' : 'max-w-7xl h-[95vh] md:h-[90vh] flex flex-col md:flex-row bg-slate-950 md:rounded-sm overflow-hidden border border-slate-900 shadow-2xl animate-bounce-in relative'}`} onClick={e => e.stopPropagation()}>
         
         <div className="flex-1 bg-black relative flex flex-col overflow-hidden border-b md:border-b-0 md:border-r border-slate-900">
            <div className="absolute top-4 right-4 z-[60] flex gap-2">
               {seriesMembers.length > 1 && (
                  <button onClick={() => setViewMode(viewMode === 'single' ? 'panorama' : 'single')} className={`flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur transition-all font-black text-[10px] tracking-widest ${viewMode === 'panorama' ? 'bg-blue-600 text-white border-blue-400 shadow-lg' : 'bg-black/50 text-white/50 border-white/10 hover:text-white'}`}>
                    <Columns className="w-3.5 h-3.5" /> {viewMode === 'panorama' ? 'INDIVIDUAL' : `MODO PANORAMA (${seriesMembers.length})`}
                  </button>
               )}
            </div>

            {viewMode === 'single' ? (
              <>
                <div className={`flex-1 relative flex items-center justify-center overflow-hidden p-4 md:p-12 ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`} onClick={() => setIsZoomed(!isZoomed)}>
                   <img 
                     src={activeImage} 
                     className={`transition-all duration-700 ease-out shadow-2xl ${isZoomed ? 'w-full h-auto scale-150 origin-center grayscale-0' : 'max-w-full max-h-full object-contain grayscale-[0.2] hover:grayscale-0'}`} 
                   />
                </div>

                <div className="h-24 bg-slate-950/90 backdrop-blur border-t border-slate-900 p-3 flex items-center gap-4 justify-center shrink-0 z-30">
                   <button onClick={() => { setActiveImage(image.frontUrl); setActiveLabel('front'); setIsZoomed(false); }} className={`relative h-full aspect-square rounded-lg overflow-hidden border-2 transition-all ${activeLabel === 'front' ? 'border-blue-600 scale-110 shadow-xl' : 'border-slate-800 opacity-40 hover:opacity-100'}`}><img src={image.frontUrl} className="w-full h-full object-cover" /></button>
                   {image.backUrl && <button onClick={() => { setActiveImage(image.backUrl!); setActiveLabel('back'); setIsZoomed(false); }} className={`relative h-full aspect-square rounded-lg overflow-hidden border-2 transition-all ${activeLabel === 'back' ? 'border-brand-600 scale-110 shadow-xl' : 'border-slate-800 opacity-40 hover:opacity-100'}`}><img src={image.backUrl} className="w-full h-full object-cover" /></button>}
                </div>
              </>
            ) : (
              <div className="flex-1 overflow-y-auto bg-slate-950 px-4 md:px-8 lg:px-12 py-6 custom-scrollbar">
                <div className="max-w-[2200px] mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 pb-24">
                    {seriesMembers.map((member) => (
                      <div key={member.id} className="group bg-slate-900/30 border border-slate-900 rounded-lg p-2 flex flex-col gap-2 hover:border-blue-500/30 transition-all cursor-pointer" onClick={() => onImageSelect(member)}>
                         <img src={member.frontUrl} className="w-full aspect-[3/4] object-contain rounded" />
                         <span className="text-[7px] font-black text-slate-500 text-center uppercase tracking-[0.2em]">{member.customId}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
         </div>

         {viewMode === 'single' && (
           <div className="w-full md:w-[450px] bg-slate-950 flex flex-col h-full z-20 shadow-2xl border-l border-slate-900 overflow-hidden">
              <div className="p-4 border-b border-slate-900 bg-slate-950/80 backdrop-blur flex justify-between items-center shrink-0">
                 <div className="flex gap-2">
                    {isAdmin && (
                       <>
                          <button onClick={isEditing ? handleSave : () => setIsEditing(true)} className={`flex items-center gap-2 px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${isEditing ? 'bg-green-600 text-white' : 'bg-blue-900/40 text-blue-400 border border-blue-900/50 hover:bg-blue-600 hover:text-white'}`}>
                             {isEditing ? <Save className="w-3.5 h-3.5"/> : <Edit2 className="w-3.5 h-3.5"/>} {isEditing ? 'GUARDAR' : 'EDITAR'}
                          </button>
                          {!isEditing && <button onClick={handleDelete} className="p-2 bg-slate-900 hover:bg-red-600 text-slate-600 hover:text-white rounded-full transition-all"><Trash2 className="w-4 h-4"/></button>}
                       </>
                    )}
                 </div>
                 {currentUser && (
                    <button onClick={toggleCollection} className={`px-4 py-2 rounded-full text-[9px] font-black border transition-all flex items-center gap-2 ${formData.owners?.includes(currentUser) ? 'bg-green-600 text-white border-green-500 shadow-lg shadow-green-900/20' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
                       <Check className="w-3 h-3" /> {formData.owners?.includes(currentUser) ? 'COLEÇÃO' : 'MARCAR'}
                    </button>
                 )}
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-slate-950">
                 <div className="space-y-4">
                    {isEditing ? (
                       <div className="space-y-4">
                          <input type="text" value={formData.gameName} onChange={e => handleChange('gameName', e.target.value)} className="w-full bg-slate-900 text-white text-xl font-black rounded-lg p-3 border border-slate-800 outline-none" placeholder="Nome do Jogo" />
                          <input type="text" value={formData.operator || ''} onChange={e => handleChange('operator', e.target.value)} className="w-full bg-slate-900 text-blue-400 text-sm font-black rounded-lg p-3 border border-slate-800 outline-none" placeholder="Casa do Jogo (SCML, etc)" />
                       </div>
                    ) : (
                       <div className="space-y-1">
                          <div className="flex items-center gap-2 text-blue-900 mb-1">
                             <Fingerprint className="w-3 h-3" />
                             <span className="text-[8px] font-black uppercase tracking-[0.3em]">{formData.customId}</span>
                             {formData.aiGenerated && <Sparkles className="w-3 h-3 text-cyan-900 ml-auto" />}
                          </div>
                          <h2 className="text-2xl font-black text-slate-200 leading-tight uppercase tracking-tighter italic">{formData.gameName}</h2>
                          {formData.operator && (
                             <div className="flex items-center gap-2 text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                                <Building2 className="w-3 h-3" /> {formData.operator}
                             </div>
                          )}
                       </div>
                    )}
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                    <DataCard icon={Building2} label={t.viewer.operator} value={formData.operator} colorClass="text-blue-500" subValue="Emissora" />
                    <DataCard icon={Hash} label={t.viewer.gameNo} value={formData.gameNumber} colorClass="text-slate-500" subValue="Ref. Modelo" />
                    <DataCard icon={Flag} label={t.viewer.country} value={formData.country} colorClass="text-red-500" />
                    <DataCard icon={Globe} label={t.viewer.continent} value={formData.continent} colorClass="text-indigo-500" />
                    <DataCard icon={Clock} label={t.viewer.release} value={formData.releaseDate} colorClass="text-orange-500" subValue="Lançamento" />
                    <DataCard icon={Banknote} label={t.viewer.price} value={formData.price} colorClass="text-green-500" />
                    <DataCard icon={ShieldCheck} label={t.viewer.state} value={formData.state} colorClass="text-cyan-500" />
                    <DataCard icon={Printer} label={t.viewer.printer} value={formData.printer} colorClass="text-slate-500" />
                    <DataCard icon={Ruler} label={t.viewer.size} value={formData.size} colorClass="text-slate-500" />
                    <DataCard icon={History} label={t.viewer.addedOn} value={new Date(formData.createdAt).toLocaleDateString()} colorClass="text-blue-400" subValue="Registo Arquivo" />
                 </div>

                 <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-900 shadow-inner">
                    <span className="text-[8px] text-slate-600 uppercase block mb-2 font-black tracking-widest flex items-center gap-2"><Info className="w-3 h-3 text-brand-500"/> Notas</span>
                    {isEditing ? (
                      <textarea value={formData.values} onChange={e => handleChange('values', e.target.value)} className="w-full bg-slate-900 text-white text-xs p-3 rounded-lg border border-slate-800 h-24 outline-none italic" />
                    ) : (
                      <p className="text-xs text-slate-500 italic leading-relaxed">{formData.values || 'Sem observações.'}</p>
                    )}
                 </div>
              </div>
           </div>
         )}
      </div>
    </div>
  );
};
