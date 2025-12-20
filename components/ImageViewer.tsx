
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
    <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800/50 px-3 py-2.5 rounded-2xl hover:border-slate-700 transition-all group">
      <div className={`p-2 rounded-xl bg-slate-800/80 group-hover:bg-slate-700 transition-colors`}>
        <Icon className={`w-4 h-4 ${colorClass}`} />
      </div>
      <div className="flex flex-col">
        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{label}</span>
        <span className="text-xs font-black text-slate-200 leading-none truncate max-w-[140px]">{value || '-'}</span>
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#020617]/98 backdrop-blur-3xl animate-fade-in" onClick={onClose}>
      
      {/* Botão de Fechar Superior */}
      <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-all z-[10000] p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full shadow-2xl active:scale-90" onClick={onClose}>
        <X className="w-6 h-6" />
      </button>

      <div className={`w-full h-full md:h-[92vh] md:max-w-[1600px] flex flex-col md:flex-row bg-[#020617] md:rounded-[3rem] overflow-hidden border border-white/5 shadow-[0_0_80px_rgba(0,0,0,0.9)] relative`} onClick={e => e.stopPropagation()}>
         
         {/* Lado Esquerdo: Área da Imagem Magnificada */}
         <div className="flex-1 bg-black/20 relative flex flex-col min-h-0 border-b md:border-b-0 md:border-r border-white/5">
            {viewMode === 'single' ? (
              <div className="flex-1 flex flex-col min-h-0 w-full h-full relative group">
                
                {/* Comandos de Navegação Laterais - Estilo Glassmorphism Suave */}
                <div className="absolute inset-y-0 left-0 w-24 flex items-center justify-center z-50">
                  {hasPrev && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                      className="p-5 bg-white/5 hover:bg-brand-600/80 text-white rounded-full border border-white/5 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 backdrop-blur-md"
                      title="Anterior"
                    >
                      <ChevronLeft className="w-10 h-10" />
                    </button>
                  )}
                </div>

                <div className="absolute inset-y-0 right-0 w-24 flex items-center justify-center z-50">
                  {hasNext && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleNext(); }}
                      className="p-5 bg-white/5 hover:bg-brand-600/80 text-white rounded-full border border-white/5 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 backdrop-blur-md"
                      title="Próximo"
                    >
                      <ChevronRight className="w-10 h-10" />
                    </button>
                  )}
                </div>

                {/* Content: Imagem Delicada com Glow */}
                <div className="flex-1 relative w-full h-full flex items-center justify-center p-4 md:p-10 overflow-hidden">
                   
                   {/* Glow de Fundo que acompanha a cor da marca */}
                   <div className="absolute w-[60%] h-[60%] bg-brand-600/10 blur-[120px] rounded-full pointer-events-none"></div>

                   <div className="relative bg-slate-900/40 p-1.5 rounded-[2rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10 max-h-full flex items-center justify-center animate-bounce-in">
                      <img 
                        src={activeImage} 
                        className="max-w-full max-h-[70vh] md:max-h-[80vh] object-contain rounded-[1.8rem] transition-all duration-500" 
                        alt={formData.gameName} 
                      />
                   </div>
                   
                   {/* Botão de Rotação Flutuante */}
                   {formData.backUrl && (
                     <button 
                       onClick={(e) => { e.stopPropagation(); toggleImage(); }}
                       className="absolute bottom-10 right-10 bg-brand-600 hover:bg-brand-500 text-white p-5 rounded-full shadow-[0_0_30px_rgba(37,99,235,0.5)] border border-white/20 transition-all hover:scale-110 active:scale-95 group z-50"
                       title="Girar Imagem"
                     >
                       <RefreshCw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-700" />
                     </button>
                   )}
                </div>
                
                {/* Thumbnails Inferiores */}
                <div className="h-28 bg-[#0a0f1e]/80 backdrop-blur-xl border-t border-white/5 p-4 flex items-center gap-6 justify-center shrink-0 z-50">
                   <button 
                      onClick={() => { setActiveImage(formData.frontUrl); setActiveLabel('front'); }} 
                      className={`relative h-20 aspect-square rounded-2xl overflow-hidden border-2 transition-all ${activeLabel === 'front' ? 'border-brand-500 scale-110 shadow-[0_0_20px_rgba(59,130,246,0.6)]' : 'border-white/5 opacity-30 hover:opacity-100 hover:border-white/20'}`}
                   >
                      <img src={formData.frontUrl} className="w-full h-full object-cover" alt="Frente" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-[9px] font-black text-white uppercase tracking-[0.2em] opacity-0 hover:opacity-100 transition-opacity">Frente</div>
                   </button>
                   {formData.backUrl ? (
                      <button 
                        onClick={() => { setActiveImage(formData.backUrl!); setActiveLabel('back'); }} 
                        className={`relative h-20 aspect-square rounded-2xl overflow-hidden border-2 transition-all ${activeLabel === 'back' ? 'border-brand-500 scale-110 shadow-[0_0_20px_rgba(59,130,246,0.6)]' : 'border-white/5 opacity-30 hover:opacity-100 hover:border-white/20'}`}
                      >
                        <img src={formData.backUrl} className="w-full h-full object-cover" alt="Verso" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-[9px] font-black text-white uppercase tracking-[0.2em] opacity-0 hover:opacity-100 transition-opacity">Verso</div>
                      </button>
                   ) : isEditing && (
                      <button 
                        onClick={() => backInputRef.current?.click()} 
                        className="relative h-20 aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center group hover:border-brand-500 hover:bg-white/10 transition-all"
                      >
                        <Maximize2 className="w-5 h-5 text-slate-600 group-hover:text-brand-500 mb-1" />
                        <span className="text-[8px] font-black text-slate-600 uppercase group-hover:text-brand-500">Add Verso</span>
                        <input type="file" ref={backInputRef} className="hidden" accept="image/*" onChange={handleBackImageUpload} />
                      </button>
                   )}
                </div>
              </div>
            ) : (
              /* Modo Panorama / Set List */
              <div className="flex-1 overflow-y-auto bg-[#020617] p-8 md:p-16 custom-scrollbar">
                <div className="flex flex-col gap-12 max-w-6xl mx-auto animate-fade-in">
                   <div className="flex items-center justify-between border-b border-white/5 pb-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-brand-600 p-3 rounded-2xl shadow-lg shadow-brand-900/20">
                           <LayersIcon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                           Coleção: {image.gameName}
                        </h3>
                      </div>
                      <span className="text-xs font-black text-brand-500 bg-brand-900/20 px-4 py-1.5 rounded-full border border-brand-500/20 uppercase tracking-widest">{seriesMembers.length} Itens Catalogados</span>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {seriesMembers.map((member) => (
                      <div key={member.id} className="bg-slate-900/30 border border-white/5 rounded-[2.5rem] p-6 hover:border-brand-500/50 transition-all group">
                         <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                               <span className="text-[10px] font-black text-white bg-slate-800 px-3 py-1.5 rounded-xl border border-white/10">{member.customId}</span>
                               <button onClick={() => onImageSelect(member)} className="text-[10px] font-black text-slate-500 hover:text-brand-400 flex items-center gap-2 uppercase transition-all">
                                  <Eye className="w-4 h-4" /> Focar Item
                               </button>
                            </div>
                            <div className="grid grid-cols-2 gap-6 h-64">
                               <div className="relative h-full rounded-2xl overflow-hidden bg-black/40 border border-white/5 shadow-xl">
                                  <img src={member.frontUrl} className="w-full h-full object-contain" alt="Frente" />
                               </div>
                               <div className="relative h-full rounded-2xl overflow-hidden bg-black/40 border border-white/5 shadow-xl flex items-center justify-center">
                                  {member.backUrl ? <img src={member.backUrl} className="w-full h-full object-contain" /> : <span className="text-[10px] font-black uppercase text-slate-800 tracking-widest">Sem Verso</span>}
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

         {/* Painel de Informações (Direito) - Mais Elegante */}
         <div className="w-full md:w-[480px] bg-[#0a0f1e]/50 backdrop-blur-2xl flex flex-col h-full z-20 border-l border-white/5 overflow-hidden shrink-0">
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5 shrink-0">
                 <div className="flex gap-3">
                    {isAdmin && (
                       <>
                          <button 
                            onClick={isEditing ? handleSave : () => setIsEditing(true)} 
                            className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isEditing ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-white/5 text-brand-400 border border-white/5 hover:bg-white/10 active:scale-95'}`}
                          >
                             {isEditing ? <Save className="w-4 h-4"/> : <Edit2 className="w-4 h-4"/>} {isEditing ? 'Gravar' : 'Editar'}
                          </button>
                          {!isEditing && <button onClick={handleDelete} className="p-3 bg-white/5 hover:bg-red-600/20 text-slate-600 hover:text-red-500 border border-white/5 rounded-2xl transition-all"><Trash2 className="w-5 h-5"/></button>}
                       </>
                    )}
                 </div>
                 {!isEditing && (image.isSeries || seriesMembers.length > 1) && (
                    <button 
                      onClick={() => setViewMode(viewMode === 'single' ? 'panorama' : 'single')} 
                      className={`p-3 rounded-2xl border transition-all ${viewMode === 'panorama' ? 'bg-brand-600 text-white border-brand-400 shadow-lg' : 'border-white/5 bg-white/5 text-slate-400 hover:text-white'}`}
                      title="Alternar Vista de Série"
                    >
                      <LayoutGrid className="w-5 h-5"/>
                    </button>
                 )}
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                 <div className="space-y-4">
                    {isEditing ? (
                       <div className="space-y-6 animate-fade-in bg-white/5 p-6 rounded-[2rem] border border-white/5">
                          <div className="grid grid-cols-2 gap-5">
                            <label className="col-span-2">
                               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome da Raspadinha:</span>
                               <input type="text" value={formData.gameName} onChange={e => handleChange('gameName', e.target.value)} className="w-full bg-slate-950 text-white text-sm font-black rounded-xl p-4 border border-white/5 outline-none focus:border-brand-500 transition-all" />
                            </label>
                            <label>
                               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Nº Jogo:</span>
                               <input type="text" value={formData.gameNumber} onChange={e => handleChange('gameNumber', e.target.value)} className="w-full bg-slate-950 text-white text-xs p-4 border border-white/5 rounded-xl outline-none focus:border-brand-500" />
                            </label>
                            <label>
                               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">ID Único:</span>
                               <input type="text" value={formData.customId} onChange={e => handleChange('customId', e.target.value)} className="w-full bg-slate-950 text-white text-xs p-4 border border-white/5 rounded-xl outline-none focus:border-brand-500" />
                            </label>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-5">
                            <label className="col-span-2">
                               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Emissor / Casa:</span>
                               <input type="text" value={formData.operator} onChange={e => handleChange('operator', e.target.value)} className="w-full bg-slate-950 text-brand-400 text-xs p-4 border border-white/5 rounded-xl outline-none focus:border-brand-500" />
                            </label>
                            <label>
                               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Ano Emissão:</span>
                               <input type="text" value={formData.releaseDate} onChange={e => handleChange('releaseDate', e.target.value)} className="w-full bg-slate-950 text-white text-xs p-4 border border-white/5 rounded-xl outline-none focus:border-brand-500" />
                            </label>
                            <label>
                               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Preço:</span>
                               <input type="text" value={formData.price} onChange={e => handleChange('price', e.target.value)} className="w-full bg-slate-950 text-white text-xs p-4 border border-white/5 rounded-xl outline-none focus:border-brand-500" />
                            </label>
                          </div>
                       </div>
                    ) : (
                       <div className="animate-fade-in border-b border-white/5 pb-8">
                          <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-[0.9] mb-4">{formData.gameName}</h2>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-brand-500 text-[10px] font-black uppercase tracking-[0.2em] bg-brand-600/10 px-3 py-1 rounded-lg border border-brand-500/20 shadow-lg">{formData.category}</span>
                            {formData.operator && (
                              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest">{formData.operator}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-6 bg-slate-900/40 w-fit px-4 py-2 rounded-2xl border border-white/5">
                             <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-xs font-black text-white shadow-lg">
                                {formData.collector?.[0] || 'A'}
                             </div>
                             <div className="flex flex-col">
                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Responsável pelo Registo</span>
                                <span className="text-[11px] font-black text-slate-200 uppercase tracking-widest">{formData.collector || 'Arquivo Central'}</span>
                             </div>
                          </div>
                       </div>
                    )}
                 </div>

                 {!isEditing && (
                    <div className="grid grid-cols-2 gap-4 animate-fade-in">
                       <DataTag icon={Hash} label="Nº de Jogo" value={formData.gameNumber} colorClass="text-brand-500" />
                       <DataTag icon={Fingerprint} label="Referência / ID" value={formData.customId} colorClass="text-slate-500" />
                       <DataTag icon={Ruler} label="Formato" value={formData.size} colorClass="text-cyan-500" />
                       <DataTag icon={Clock} label="Lançamento" value={formData.releaseDate} colorClass="text-orange-500" />
                       <DataTag icon={Banknote} label="Valor de Venda" value={formData.price} colorClass="text-emerald-500" />
                       <DataTag icon={Flag} label="País de Origem" value={formData.country} colorClass="text-red-500" />
                       <DataTag icon={Globe} label="Continente" value={formData.continent} colorClass="text-indigo-500" />
                       <DataTag icon={Printer} label="Tipografia" value={formData.printer} colorClass="text-slate-400" />
                       <DataTag icon={ScanLine} label="Linhas Segurança" value={formData.lines} colorClass="text-emerald-500" />
                       <DataTag icon={Activity} label="Estado Conservação" value={formData.state} colorClass="text-brand-400" />
                    </div>
                 )}

                 {/* Notas do Exemplar */}
                 <div className="bg-[#020617] p-8 rounded-[2.5rem] border border-white/5 shadow-inner group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
                        <Info className="w-32 h-32 text-white" />
                    </div>
                    <div className="flex items-center gap-3 mb-5 relative z-10">
                       <Info className="w-4 h-4 text-brand-500" />
                       <span className="text-[10px] text-slate-500 uppercase font-black tracking-[0.3em]">Memórias e Notas Técnicas</span>
                    </div>
                    {isEditing ? (
                      <textarea value={formData.values} onChange={e => handleChange('values', e.target.value)} className="w-full bg-[#0a0f1e] text-white text-sm p-6 rounded-2xl border border-white/5 h-40 outline-none italic transition-all focus:border-brand-500 shadow-inner leading-relaxed" placeholder="Adicione os detalhes que o Pedro vai querer ler no futuro... hihi!" />
                    ) : (
                      <p className="text-sm text-slate-400 italic leading-relaxed group-hover:text-slate-200 transition-colors relative z-10">
                        {formData.values || 'Nenhuma nota técnica registada para este exemplar.'}
                      </p>
                    )}
                 </div>
                 
                 <div className="text-[9px] text-slate-800 font-black uppercase tracking-[0.5em] text-center pt-12 border-t border-white/5 pb-6">
                    Visionary Archive • Vovô Jorge Mesquita
                 </div>
              </div>
           </div>
      </div>
    </div>
  );
};
