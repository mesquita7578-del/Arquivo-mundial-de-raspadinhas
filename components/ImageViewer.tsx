
import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Edit2, Trash2, Save, Check, 
  Hash, Clock, Flag, MapPin, Info, 
  History, Building2, Globe, Fingerprint,
  Sparkles, Columns, Ruler, Printer, Banknote, ScanLine,
  Layers, LayoutGrid, Eye, Calendar, ChevronDown, User
} from 'lucide-react';
import { ScratchcardData, ScratchcardState, Continent } from '../types';

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
    // Agrupamento por Nome do Jogo + Número do Jogo OU ID de Grupo de Série
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
    <div className="bg-slate-900/60 backdrop-blur-md p-3 rounded-xl border border-slate-800 transition-all flex flex-col justify-between hover:border-slate-700">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className={`w-3 h-3 ${colorClass}`} />
        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
      </div>
      <div>
        <p className="text-xs font-black text-slate-200 leading-tight truncate">{value || '-'}</p>
        {subValue && <p className="text-[7px] text-slate-600 font-bold mt-0.5 uppercase tracking-tighter">{subValue}</p>}
      </div>
    </div>
  );

  const isGermany = formData.country.toLowerCase().trim() === 'alemanha' || 
                    formData.country.toLowerCase().trim() === 'germany' ||
                    formData.country.toLowerCase().trim() === 'deutschland';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-xl" onClick={onClose}>
      <button className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors z-[10000] p-4 bg-slate-900 border border-white/10 rounded-full" onClick={onClose}>
        <X className="w-8 h-8" />
      </button>

      <div className={`w-full h-full md:h-[95vh] md:max-w-[1600px] flex flex-col md:flex-row bg-slate-950 md:rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative`} onClick={e => e.stopPropagation()}>
         
         {/* ÁREA DE VISUALIZAÇÃO PRINCIPAL */}
         <div className="flex-1 bg-black relative flex flex-col min-h-0 border-b md:border-b-0 md:border-r border-slate-900">
            {viewMode === 'single' ? (
              <div className="flex-1 flex flex-col min-h-0 w-full h-full">
                <div className={`flex-1 relative w-full h-full flex items-center justify-center p-4 md:p-10 ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`} onClick={() => setIsZoomed(!isZoomed)}>
                   <img src={activeImage} className={`max-w-full max-h-full object-contain transition-transform duration-300 ${isZoomed ? 'scale-150' : 'scale-100'}`} />
                </div>
                <div className="h-28 bg-slate-950 border-t border-slate-800 p-4 flex items-center gap-6 justify-center shrink-0">
                   <button onClick={() => { setActiveImage(image.frontUrl); setActiveLabel('front'); }} className={`relative h-20 aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeLabel === 'front' ? 'border-blue-500 scale-105 shadow-xl' : 'border-slate-800 opacity-40'}`}>
                      <img src={image.frontUrl} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-[10px] font-black text-white">FRENTE</div>
                   </button>
                   {image.backUrl && (
                      <button onClick={() => { setActiveImage(image.backUrl!); setActiveLabel('back'); }} className={`relative h-20 aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeLabel === 'back' ? 'border-brand-500 scale-105 shadow-xl' : 'border-slate-800 opacity-40'}`}>
                        <img src={image.backUrl} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-[10px] font-black text-white">VERSO</div>
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
                        <span className="text-[10px] text-brand-600 font-bold uppercase tracking-widest">Coleção Jorge Mesquita</span>
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
                                     <img src={member.frontUrl} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" />
                                  </div>
                               </div>
                               <div className="space-y-3">
                                  <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest text-center flex items-center justify-center gap-2">
                                     <div className="h-px w-4 bg-slate-800"></div> VERSO <div className="h-px w-4 bg-slate-800"></div>
                                  </div>
                                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-slate-800 group-hover:border-blue-500/50 transition-all flex items-center justify-center bg-slate-900/50">
                                     {member.backUrl ? (
                                        <img src={member.backUrl} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" />
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

         {/* PAINEL LATERAL DE DADOS */}
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
                 <div className="flex items-center gap-2">
                    {(image.isSeries || seriesMembers.length > 1) && !isEditing && (
                       <button 
                         onClick={() => setViewMode(viewMode === 'single' ? 'panorama' : 'single')}
                         className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-widest ${viewMode === 'panorama' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'}`}
                       >
                          {viewMode === 'single' ? <LayoutGrid className="w-4 h-4" /> : <Columns className="w-4 h-4" />}
                          {viewMode === 'single' ? 'Ver SET' : 'Individual'}
                       </button>
                    )}
                    {currentUser && (
                       <button onClick={toggleCollection} className={`px-5 py-2.5 rounded-xl text-[10px] font-black border transition-all flex items-center gap-2 ${formData.owners?.includes(currentUser) ? 'bg-green-600 text-white border-green-500 shadow-xl shadow-green-900/20' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
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
                       {formData.aiGenerated && <Sparkles className="w-4 h-4 text-cyan-800 ml-auto" />}
                    </div>
                    {isEditing ? (
                       <div className="space-y-4 animate-fade-in">
                          <div className="space-y-1">
                             <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Nome do Jogo</label>
                             <input type="text" value={formData.gameName} onChange={e => handleChange('gameName', e.target.value)} className="w-full bg-slate-900 text-white text-lg font-black rounded-xl p-3 border border-slate-800 outline-none focus:border-blue-500 transition-all" />
                          </div>

                          <div className="space-y-1">
                             <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Colecionador</label>
                             <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-brand-500 transition-colors" />
                                <input type="text" value={formData.collector || ''} onChange={e => handleChange('collector', e.target.value)} className="w-full bg-slate-900 text-white text-sm font-black rounded-xl p-3 pl-10 border border-slate-800 outline-none focus:border-brand-500 transition-all" placeholder="Nome do Colecionador" />
                             </div>
                          </div>
                          
                          <div className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                             <input type="checkbox" id="isSeriesEdit" checked={formData.isSeries} onChange={e => handleChange('isSeries', e.target.checked)} className="w-5 h-5 accent-brand-500 cursor-pointer" />
                             <label htmlFor="isSeriesEdit" className="text-xs font-black text-slate-300 uppercase cursor-pointer select-none">Pertence a uma Série (SET)</label>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">País</label>
                                <input type="text" value={formData.country} onChange={e => handleChange('country', e.target.value)} className="w-full bg-slate-900 text-red-400 text-sm font-black rounded-xl p-3 border border-slate-800 outline-none focus:border-red-500/50 transition-all" />
                             </div>
                             <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest flex items-center justify-between">
                                   Região / Estado
                                   {isGermany && <span className="text-[7px] bg-red-900/50 text-red-400 px-1 rounded">ALEMANHA</span>}
                                </label>
                                {isGermany ? (
                                   <div className="relative">
                                     <select 
                                       value={formData.region || ''} 
                                       onChange={e => handleChange('region', e.target.value)} 
                                       className="w-full bg-slate-900 text-white text-sm font-black rounded-xl p-3 border border-slate-800 outline-none focus:border-blue-500 transition-all appearance-none pr-10"
                                     >
                                        <option value="">Selecione o Estado...</option>
                                        {GERMAN_STATES.map(state => <option key={state} value={state}>{state}</option>)}
                                     </select>
                                     <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                                   </div>
                                ) : (
                                   <input type="text" value={formData.region || ''} onChange={e => handleChange('region', e.target.value)} className="w-full bg-slate-900 text-white text-sm font-black rounded-xl p-3 border border-slate-800 outline-none focus:border-blue-500 transition-all" placeholder="Ex: Continente" />
                                )}
                             </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Operador</label>
                                <input type="text" value={formData.operator || ''} onChange={e => handleChange('operator', e.target.value)} className="w-full bg-slate-900 text-blue-400 text-sm font-black rounded-xl p-3 border border-slate-800 outline-none" placeholder="Operador" />
                             </div>
                             <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Linhas</label>
                                <input type="text" value={formData.lines || ''} onChange={e => handleChange('lines', e.target.value)} className="w-full bg-slate-900 text-emerald-400 text-sm font-black rounded-xl p-3 border border-slate-800 outline-none" placeholder="Cor das Linhas" />
                             </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Nº Jogo</label>
                                <input type="text" value={formData.gameNumber || ''} onChange={e => handleChange('gameNumber', e.target.value)} className="w-full bg-slate-900 text-slate-400 text-sm font-black rounded-xl p-3 border border-slate-800 outline-none" />
                             </div>
                             <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Continente</label>
                                <select value={formData.continent} onChange={e => handleChange('continent', e.target.value)} className="w-full bg-slate-900 text-indigo-400 text-sm font-black rounded-xl p-3 border border-slate-800 outline-none">
                                   {CONTINENTS.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                             </div>
                          </div>
                       </div>
                    ) : (
                       <div className="animate-fade-in">
                          <h2 className="text-3xl font-black text-slate-100 uppercase tracking-tighter italic leading-none">{formData.gameName}</h2>
                          {formData.operator && <div className="text-blue-500 text-xs font-black uppercase tracking-widest mt-2">{formData.operator}</div>}
                       </div>
                    )}
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <DataCard icon={ScanLine} label="Linhas" value={formData.lines} colorClass="text-emerald-500" />
                    <DataCard icon={Building2} label="Entidade" value={formData.operator} colorClass="text-blue-500" />
                    <DataCard icon={User} label="Colecionador" value={formData.collector} colorClass="text-brand-500" />
                    <DataCard icon={Hash} label="Nº Jogo" value={formData.gameNumber} colorClass="text-slate-500" />
                    <DataCard icon={Flag} label="País" value={formData.country} colorClass="text-red-500" />
                    <DataCard icon={MapPin} label="Região" value={formData.region} colorClass="text-white" />
                    <DataCard icon={Globe} label="Continente" value={formData.continent} colorClass="text-indigo-500" />
                    <DataCard icon={Clock} label="Ano" value={formData.releaseDate} colorClass="text-orange-500" />
                    <DataCard icon={Banknote} label="Preço" value={formData.price} colorClass="text-green-500" />
                    <DataCard icon={Printer} label="Gráfica" value={formData.printer} colorClass="text-slate-500" />
                 </div>

                 <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                    <span className="text-[9px] text-slate-500 uppercase block mb-3 font-black tracking-widest">Resumo Técnico</span>
                    {isEditing ? (
                      <textarea value={formData.values} onChange={e => handleChange('values', e.target.value)} className="w-full bg-slate-900 text-white text-xs p-4 rounded-xl border border-slate-800 h-32 outline-none italic transition-all focus:border-brand-500" />
                    ) : (
                      <p className="text-xs text-slate-400 italic leading-relaxed">{formData.values || 'Sem observações catalogadas.'}</p>
                    )}
                 </div>
                 
                 <div className="text-[9px] text-slate-700 font-black uppercase tracking-[0.2em] text-center pt-8 border-t border-slate-900/50">
                    Arquivo Mundial • Coleção Jorge Mesquita
                 </div>
              </div>
           </div>
      </div>
    </div>
  );
};
