
import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Edit2, Trash2, Save, Check, 
  Hash, Clock, Flag, MapPin, Info, 
  History, Building2, Globe, Fingerprint,
  Sparkles, Columns, Ruler, Printer, Banknote
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
      {/* Botão de Fechar fixo e sempre visível */}
      <button 
        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-[10000] p-3 bg-slate-900 border border-white/10 rounded-full" 
        onClick={onClose}
      >
        <X className="w-8 h-8" />
      </button>

      <div 
        className={`w-full h-full md:h-[90vh] md:max-w-7xl flex flex-col md:flex-row bg-slate-950 md:rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative`} 
        onClick={e => e.stopPropagation()}
      >
         
         {/* Área da Imagem (Lado Esquerdo) */}
         <div className="flex-1 bg-black relative flex flex-col min-h-0 border-b md:border-b-0 md:border-r border-slate-900">
            
            {/* Opções de visualização no topo da imagem */}
            <div className="absolute top-4 left-4 z-[60] flex gap-2">
               {seriesMembers.length > 1 && (
                  <button onClick={() => setViewMode(viewMode === 'single' ? 'panorama' : 'single')} className={`flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur transition-all font-black text-[10px] tracking-widest ${viewMode === 'panorama' ? 'bg-blue-600 text-white border-blue-400 shadow-lg' : 'bg-black/50 text-white/50 border-white/10'}`}>
                    <Columns className="w-3.5 h-3.5" /> {viewMode === 'panorama' ? 'INDIVIDUAL' : `SÉRIE (${seriesMembers.length})`}
                  </button>
               )}
            </div>

            {viewMode === 'single' ? (
              <div className="flex-1 flex flex-col min-h-0 w-full h-full">
                {/* O contentor da imagem agora força ocupação total */}
                <div 
                  className={`flex-1 relative w-full h-full flex items-center justify-center p-4 md:p-10 ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`} 
                  onClick={() => setIsZoomed(!isZoomed)}
                >
                   <img 
                     src={activeImage} 
                     key={activeImage}
                     className={`max-w-full max-h-full object-contain transition-transform duration-300 ${isZoomed ? 'scale-150' : 'scale-100'}`}
                     style={{ display: 'block' }}
                   />
                </div>

                {/* Seletor de Frente/Verso */}
                <div className="h-24 bg-slate-900/50 backdrop-blur border-t border-slate-800 p-3 flex items-center gap-4 justify-center shrink-0">
                   <button 
                     onClick={() => { setActiveImage(image.frontUrl); setActiveLabel('front'); }} 
                     className={`relative h-16 aspect-square rounded-lg overflow-hidden border-2 transition-all ${activeLabel === 'front' ? 'border-blue-500 scale-105 shadow-lg' : 'border-slate-800 opacity-50'}`}
                   >
                      <img src={image.frontUrl} className="w-full h-full object-cover" />
                   </button>
                   {image.backUrl && (
                      <button 
                        onClick={() => { setActiveImage(image.backUrl!); setActiveLabel('back'); }} 
                        className={`relative h-16 aspect-square rounded-lg overflow-hidden border-2 transition-all ${activeLabel === 'back' ? 'border-brand-500 scale-105 shadow-lg' : 'border-slate-800 opacity-50'}`}
                      >
                        <img src={image.backUrl} className="w-full h-full object-cover" />
                      </button>
                   )}
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto bg-slate-950 px-4 py-6 custom-scrollbar">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
                    {seriesMembers.map((member) => (
                      <div key={member.id} className="bg-slate-900/30 border border-slate-800 rounded-lg p-2 flex flex-col gap-2 hover:border-blue-500/50 transition-all cursor-pointer" onClick={() => onImageSelect(member)}>
                         <img src={member.frontUrl} className="w-full aspect-[3/4] object-contain rounded" />
                         <span className="text-[7px] font-black text-slate-500 text-center uppercase tracking-widest">{member.customId}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
         </div>

         {/* Detalhes Técnicos (Lado Direito) */}
         {viewMode === 'single' && (
           <div className="w-full md:w-[420px] bg-slate-950 flex flex-col h-full z-20 border-l border-slate-900 overflow-hidden shrink-0">
              <div className="p-4 border-b border-slate-900 bg-slate-900/20 backdrop-blur flex justify-between items-center shrink-0">
                 <div className="flex gap-2">
                    {isAdmin && (
                       <>
                          <button onClick={isEditing ? handleSave : () => setIsEditing(true)} className={`flex items-center gap-2 px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${isEditing ? 'bg-green-600 text-white' : 'bg-slate-800 text-blue-400 border border-slate-700 hover:bg-slate-700'}`}>
                             {isEditing ? <Save className="w-3.5 h-3.5"/> : <Edit2 className="w-3.5 h-3.5"/>} {isEditing ? 'GUARDAR' : 'EDITAR'}
                          </button>
                          {!isEditing && (
                            <button onClick={handleDelete} className="p-2 bg-slate-900 hover:bg-red-600 text-slate-600 hover:text-white rounded-full transition-all">
                              <Trash2 className="w-4 h-4"/>
                            </button>
                          )}
                       </>
                    )}
                 </div>
                 {currentUser && (
                    <button onClick={toggleCollection} className={`px-4 py-2 rounded-full text-[9px] font-black border transition-all flex items-center gap-2 ${formData.owners?.includes(currentUser) ? 'bg-green-600 text-white border-green-500 shadow-lg' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
                       <Check className="w-3 h-3" /> {formData.owners?.includes(currentUser) ? 'NA COLEÇÃO' : 'MARCAR'}
                    </button>
                 )}
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                 <div className="space-y-1">
                    <div className="flex items-center gap-2 text-blue-900 mb-1">
                       <Fingerprint className="w-3 h-3" />
                       <span className="text-[9px] font-black uppercase tracking-[0.2em]">{formData.customId}</span>
                       {formData.aiGenerated && <Sparkles className="w-3 h-3 text-cyan-700 ml-auto" />}
                    </div>
                    {isEditing ? (
                       <div className="space-y-3">
                          <input type="text" value={formData.gameName} onChange={e => handleChange('gameName', e.target.value)} className="w-full bg-slate-900 text-white text-lg font-black rounded-lg p-3 border border-slate-800 outline-none" />
                          <input type="text" value={formData.operator || ''} onChange={e => handleChange('operator', e.target.value)} className="w-full bg-slate-900 text-blue-400 text-xs font-black rounded-lg p-3 border border-slate-800 outline-none" placeholder="Casa do Jogo" />
                       </div>
                    ) : (
                       <>
                          <h2 className="text-2xl font-black text-slate-100 uppercase tracking-tighter italic">{formData.gameName}</h2>
                          {formData.operator && (
                             <div className="flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-widest mt-1">
                                <Building2 className="w-3 h-3" /> {formData.operator}
                             </div>
                          )}
                       </>
                    )}
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                    <DataCard icon={Building2} label={t.operator} value={formData.operator} colorClass="text-blue-500" />
                    <DataCard icon={Hash} label={t.gameNo} value={formData.gameNumber} colorClass="text-slate-500" />
                    <DataCard icon={Flag} label={t.country} value={formData.country} colorClass="text-red-500" />
                    <DataCard icon={Globe} label={t.continent} value={formData.continent} colorClass="text-indigo-500" />
                    <DataCard icon={Clock} label={t.release} value={formData.releaseDate} colorClass="text-orange-500" />
                    <DataCard icon={Banknote} label={t.price} value={formData.price} colorClass="text-green-500" />
                    <DataCard icon={Ruler} label={t.size} value={formData.size} colorClass="text-slate-500" />
                    <DataCard icon={Printer} label={t.printer} value={formData.printer} colorClass="text-slate-500" />
                 </div>

                 <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <span className="text-[8px] text-slate-500 uppercase block mb-2 font-black tracking-widest">Observações</span>
                    {isEditing ? (
                      <textarea value={formData.values} onChange={e => handleChange('values', e.target.value)} className="w-full bg-slate-900 text-white text-xs p-3 rounded-lg border border-slate-800 h-24 outline-none italic" />
                    ) : (
                      <p className="text-xs text-slate-400 italic leading-relaxed">{formData.values || 'Sem notas.'}</p>
                    )}
                 </div>
              </div>
           </div>
         )}
      </div>
    </div>
  );
};
