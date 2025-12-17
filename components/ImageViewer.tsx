
import React, { useState, useEffect } from 'react';
import { 
  X, ChevronLeft, ChevronRight, Edit2, Trash2, Save, Check, 
  ZoomIn, ZoomOut, LayoutTemplate, Star, Trophy, Gem, Gift,
  Hash, Calendar, Printer, Ruler, Globe, MapPin, User, Info, 
  Layers, Tag, Coins, Clock, Flag, Zap, Sparkles
} from 'lucide-react';
import { ScratchcardData, Category, LineType } from '../types';

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

  useEffect(() => {
    setFormData(image);
    setActiveImage(image.frontUrl);
    setActiveLabel('front');
    setIsEditing(false);
    setIsZoomed(false);
  }, [image]);

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
  
  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentIndex = contextImages.findIndex(img => img.id === image.id);
    if (currentIndex < contextImages.length - 1) onImageSelect(contextImages[currentIndex + 1]);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentIndex = contextImages.findIndex(img => img.id === image.id);
    if (currentIndex > 0) onImageSelect(contextImages[currentIndex - 1]);
  };

  const toggleCollection = () => {
    if (!currentUser) return;
    const currentOwners = formData.owners || [];
    const newOwners = currentOwners.includes(currentUser) ? currentOwners.filter(o => o !== currentUser) : [...currentOwners, currentUser];
    const newData = { ...formData, owners: newOwners };
    setFormData(newData);
    onUpdate(newData);
  };

  const toggleFeatured = () => {
    if (!isAdmin) return;
    const newData = { ...formData, isFeatured: !formData.isFeatured };
    setFormData(newData);
    onUpdate(newData);
  };

  const toggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsZoomed(!isZoomed);
  };

  const formatLineColor = (line: string | undefined) => {
    const mapping: Record<string, string> = {
      blue: 'Azul', red: 'Vermelha', multicolor: 'Multicolor', green: 'Verde',
      yellow: 'Amarela', brown: 'Castanha', pink: 'Rosa', purple: 'Violeta', none: 'Nenhuma'
    };
    return line ? mapping[line] || line : 'Nenhuma';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in" onClick={onClose}>
      <button className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-50 p-2 bg-slate-800/50 rounded-full" onClick={onClose}><X className="w-8 h-8" /></button>

      <button onClick={handlePrev} className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white p-2 md:p-4 hidden md:block z-40 transition-all hover:scale-110" disabled={contextImages.findIndex(img => img.id === image.id) === 0}>
         <ChevronLeft className="w-10 h-10 md:w-12 md:h-12" />
      </button>
      <button onClick={handleNext} className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white p-2 md:p-4 hidden md:block z-40 transition-all hover:scale-110" disabled={contextImages.findIndex(img => img.id === image.id) === contextImages.length - 1}>
         <ChevronRight className="w-10 h-10 md:w-12 md:h-12" />
      </button>

      <div className="w-full max-w-7xl h-[95vh] md:h-[90vh] flex flex-col md:flex-row bg-slate-900 md:rounded-2xl overflow-hidden border border-slate-800 shadow-2xl" onClick={e => e.stopPropagation()}>
         
         {/* ÁREA DA IMAGEM */}
         <div className="flex-1 bg-black relative flex flex-col overflow-hidden border-b md:border-b-0 md:border-r border-slate-800">
            <div className="absolute top-4 right-4 z-30 flex gap-2">
               {isAdmin && (
                  <button onClick={toggleFeatured} className={`p-2 rounded-full border backdrop-blur transition-all ${formData.isFeatured ? 'bg-amber-500 text-black border-amber-400' : 'bg-black/50 text-white/50 border-white/10 hover:text-white'}`} title="Montra Digital">
                     <LayoutTemplate className="w-5 h-5" />
                  </button>
               )}
               <button onClick={toggleZoom} className="bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur border border-white/10 transition-colors">
                  {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
               </button>
            </div>

            <div className="absolute top-4 left-4 z-30 bg-black/50 text-white text-[10px] px-3 py-1.5 rounded-full backdrop-blur border border-white/10 uppercase tracking-widest font-bold shadow-lg flex items-center gap-2">
               <div className={`w-1.5 h-1.5 rounded-full ${activeLabel === 'front' ? 'bg-blue-500' : 'bg-brand-500'}`}></div>
               {activeLabel === 'front' ? 'FRENTE' : activeLabel === 'back' ? 'VERSO' : 'VARIANTE'}
               {formData.isFeatured && <span className="ml-2 text-amber-400 font-black">• MONTRA</span>}
            </div>

            <div className={`flex-1 relative flex items-center justify-center overflow-hidden transition-all duration-300 ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in p-4 md:p-8'}`} onClick={toggleZoom}>
               <img 
                 src={activeImage} 
                 className={`transition-transform duration-300 ease-out shadow-2xl ${isZoomed ? 'w-full h-auto scale-150 origin-center' : 'max-w-full max-h-full object-contain'}`} 
                 style={{ maxHeight: isZoomed ? 'none' : '95%', maxWidth: isZoomed ? 'none' : '95%' }} 
               />
            </div>

            <div className="h-20 bg-slate-950/90 backdrop-blur border-t border-white/5 p-2 flex items-center gap-3 justify-center shrink-0 z-30">
               <button onClick={() => { setActiveImage(image.frontUrl); setActiveLabel('front'); setIsZoomed(false); }} className={`relative h-full aspect-square rounded-lg overflow-hidden border-2 transition-all ${activeLabel === 'front' ? 'border-blue-500 scale-110 shadow-lg shadow-blue-500/20' : 'border-slate-800 opacity-40 hover:opacity-100'}`}><img src={image.frontUrl} className="w-full h-full object-cover" /></button>
               {image.backUrl && <button onClick={() => { setActiveImage(image.backUrl!); setActiveLabel('back'); setIsZoomed(false); }} className={`relative h-full aspect-square rounded-lg overflow-hidden border-2 transition-all ${activeLabel === 'back' ? 'border-brand-500 scale-110 shadow-lg shadow-brand-500/20' : 'border-slate-800 opacity-40 hover:opacity-100'}`}><img src={image.backUrl} className="w-full h-full object-cover" /></button>}
            </div>
         </div>

         {/* PAINEL DE DADOS (SIDEBAR) */}
         <div className="w-full md:w-[450px] bg-slate-900 flex flex-col h-full z-20 shadow-2xl">
            {/* Header Fixo do Painel */}
            <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center shrink-0">
               <div className="flex gap-2">
                  {isAdmin && (
                     <>
                        {isEditing ? (
                           <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-green-900/20"><Save className="w-3.5 h-3.5"/> GRAVAR</button>
                        ) : (
                           <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs transition-all"><Edit2 className="w-3.5 h-3.5"/> EDITAR</button>
                        )}
                        <button onClick={handleDelete} className="p-2.5 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-700"><Trash2 className="w-4 h-4"/></button>
                     </>
                  )}
               </div>

               {currentUser && (
                  <button onClick={toggleCollection} className={`px-4 py-2 rounded-xl text-xs font-black border transition-all flex items-center gap-2 shadow-sm ${formData.owners?.includes(currentUser) ? 'bg-green-500 text-white border-green-400' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:border-slate-500'}`}>
                     <Check className="w-3.5 h-3.5" /> {formData.owners?.includes(currentUser) ? 'NA COLEÇÃO' : 'MARCAR'}
                  </button>
               )}
            </div>

            {/* Conteúdo Scrollable dos Dados */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
               
               {/* Secção 1: Identidade e Título */}
               <div className="space-y-4">
                  <div>
                    {isEditing ? (
                       <input type="text" value={formData.gameName} onChange={e => handleChange('gameName', e.target.value)} className="w-full bg-slate-800 text-white text-xl font-black rounded-xl p-3 border border-slate-700 outline-none focus:border-blue-500" />
                    ) : (
                       <h2 className="text-2xl font-black text-white mb-1 leading-tight flex items-center gap-2 tracking-tight uppercase">
                          {formData.gameName}
                          {formData.isFeatured && <Star className="w-6 h-6 text-amber-500 fill-amber-500 animate-pulse" />}
                       </h2>
                    )}
                    <div className="flex flex-wrap gap-2 mt-3">
                       <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase border bg-slate-800 border-slate-700 text-slate-300 flex items-center gap-1.5">
                         <Tag className="w-3 h-3 text-blue-500" /> {formData.category || 'Raspadinha'}
                       </span>
                       <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase border bg-slate-800 border-slate-700 text-slate-300 flex items-center gap-1.5">
                         <Hash className="w-3 h-3 text-slate-500" /> ID: {formData.customId}
                       </span>
                    </div>
                 </div>

                 <div className="flex flex-wrap gap-2">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase border ${formData.state === 'MINT' ? 'bg-green-900/30 text-green-400 border-green-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>{formData.state}</span>
                    {formData.isRarity && <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase border bg-blue-900/30 text-blue-400 border-blue-500/30 flex items-center gap-1.5"><Gem className="w-3 h-3" /> Raridade</span>}
                    {formData.isWinner && <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase border bg-emerald-900/30 text-emerald-400 border-emerald-500/30 flex items-center gap-1.5"><Trophy className="w-3 h-3" /> Premiada {formData.prizeAmount && `: ${formData.prizeAmount}`}</span>}
                    {formData.isPromotional && <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase border bg-pink-900/30 text-pink-400 border-pink-500/30 flex items-center gap-1.5"><Gift className="w-3 h-3" /> Promo</span>}
                 </div>
               </div>

               {/* Secção 2: Dados Geográficos */}
               <div className="bg-slate-800/20 rounded-2xl p-4 border border-slate-800">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <Globe className="w-3 h-3" /> Origem e Geografia
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="flex items-center gap-3">
                        {/* Corrected: Added missing Flag icon usage from lucide-react */}
                        <div className="p-2 bg-slate-800 rounded-lg"><Flag className="w-4 h-4 text-blue-500" /></div>
                        <div>
                           <p className="text-[9px] font-bold text-slate-500 uppercase">País</p>
                           <p className="text-xs font-black text-white">{formData.country}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-800 rounded-lg"><MapPin className="w-4 h-4 text-emerald-500" /></div>
                        <div>
                           <p className="text-[9px] font-bold text-slate-500 uppercase">Região / Estado</p>
                           <p className="text-xs font-black text-white">{formData.region || '-'}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3 col-span-2">
                        <div className="p-2 bg-slate-800 rounded-lg"><Globe className="w-4 h-4 text-purple-500" /></div>
                        <div>
                           <p className="text-[9px] font-bold text-slate-500 uppercase">Continente</p>
                           <p className="text-xs font-black text-white">{formData.continent}</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Secção 3: Dados Técnicos de Registo (O que pediste!) */}
               <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                     <Info className="w-3 h-3" /> Ficha Técnica do Registo
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                     <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-2 mb-1">
                           <Hash className="w-3 h-3 text-blue-400" />
                           <span className="text-[9px] font-bold text-slate-500 uppercase">Número do Jogo</span>
                        </div>
                        <p className="text-sm font-black text-white font-mono">{formData.gameNumber}</p>
                     </div>

                     <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-2 mb-1">
                           <Calendar className="w-3 h-3 text-brand-400" />
                           <span className="text-[9px] font-bold text-slate-500 uppercase">Ano / Lançamento</span>
                        </div>
                        <p className="text-sm font-black text-white font-mono">{formData.releaseDate || '-'}</p>
                     </div>

                     <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-2 mb-1">
                           <Coins className="w-3 h-3 text-yellow-500" />
                           <span className="text-[9px] font-bold text-slate-500 uppercase">Preço / Valor</span>
                        </div>
                        <p className="text-sm font-black text-white font-mono">{formData.price || '-'}</p>
                     </div>

                     <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-2 mb-1">
                           <Layers className="w-3 h-3 text-purple-400" />
                           <span className="text-[9px] font-bold text-slate-500 uppercase">Linha de Cores</span>
                        </div>
                        <p className="text-sm font-black text-white">{formatLineColor(formData.lines)}</p>
                     </div>

                     <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800 col-span-2">
                        <div className="flex items-center gap-2 mb-1">
                           <Printer className="w-3 h-3 text-indigo-400" />
                           <span className="text-[9px] font-bold text-slate-500 uppercase">Gráfica / Impressor</span>
                        </div>
                        <p className="text-sm font-black text-white">{formData.printer || 'Desconhecido'}</p>
                     </div>

                     <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-2 mb-1">
                           {/* Corrected: Added missing Zap icon usage from lucide-react */}
                           <Zap className="w-3 h-3 text-orange-400" />
                           <span className="text-[9px] font-bold text-slate-500 uppercase">Tiragem / Emissão</span>
                        </div>
                        <p className="text-sm font-black text-white">{formData.emission || '-'}</p>
                     </div>

                     <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-2 mb-1">
                           <Ruler className="w-3 h-3 text-slate-400" />
                           <span className="text-[9px] font-bold text-slate-500 uppercase">Medidas / Tamanho</span>
                        </div>
                        <p className="text-sm font-black text-white">{formData.size || '-'}</p>
                     </div>
                  </div>
                  
                  {formData.isSeries && (
                     <div className="bg-blue-900/20 p-3 rounded-xl border border-blue-500/30">
                        <div className="flex items-center gap-2 mb-1">
                           <Layers className="w-3 h-3 text-blue-400" />
                           <span className="text-[9px] font-bold text-blue-400 uppercase">Detalhes da Série / SET</span>
                        </div>
                        <p className="text-sm font-bold text-white">{formData.seriesDetails || 'Sem detalhes'}</p>
                     </div>
                  )}
               </div>

               {/* Secção 4: Informações do Guardião */}
               <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                  <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <User className="w-3 h-3" /> Guardião do Registo
                  </h3>
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-[10px] font-black text-white border border-white/10 shadow-lg">
                           {formData.collector?.substring(0, 2).toUpperCase() || 'JM'}
                        </div>
                        <div>
                           <p className="text-xs font-black text-white uppercase tracking-tight">{formData.collector || 'Jorge Mesquita'}</p>
                           <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-bold">
                              <Clock className="w-3 h-3" /> {new Date(formData.createdAt).toLocaleDateString('pt-PT')}
                           </div>
                        </div>
                     </div>
                     {formData.aiGenerated && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-cyan-900/20 border border-cyan-500/30 rounded text-[9px] font-black text-cyan-400">
                           {/* Corrected: Added missing Sparkles icon usage from lucide-react */}
                           <Sparkles className="w-2.5 h-2.5" /> CHLOE IA
                        </div>
                     )}
                  </div>
               </div>

               {/* Secção 5: Notas Adicionais */}
               <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-800/50 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Info className="w-16 h-16" /></div>
                  <span className="text-[10px] text-slate-500 uppercase block mb-3 font-black tracking-widest">Observações do Arquivo</span>
                  {isEditing ? (
                     <textarea value={formData.values} onChange={e => handleChange('values', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white h-32 outline-none focus:border-blue-500" placeholder="Insira notas sobre a raspadinha..." />
                  ) : (
                     <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line font-medium italic">
                        {formData.values || 'Nenhuma nota especial registada para este item.'}
                     </p>
                  )}
               </div>

            </div>
         </div>
      </div>
    </div>
  );
};
