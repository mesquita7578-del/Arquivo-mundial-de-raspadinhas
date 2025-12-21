
import React, { useState, useRef } from 'react';
import { 
  X, Upload, Sparkles, Check, Loader2, 
  ImagePlus, Wand2, Layers, Tag, MapPin, Palette, Info, 
  Calendar, Building2, Printer, ScanLine, Banknote, Globe2, Clock,
  Camera, Hash, Ruler, Percent, Factory, BookOpen, Trash2, RefreshCcw,
  Trophy, Star, Plus, Images, MousePointer2
} from 'lucide-react';
import { ScratchcardData, CategoryItem, Continent, LineType, ScratchcardState, AnalysisResult } from '../types';
import { analyzeImage } from '../services/geminiService';
import { storageService } from '../services/storage';

interface UploadModalProps {
  onClose: () => void;
  onUploadComplete: (data: ScratchcardData) => void;
  existingImages: ScratchcardData[];
  currentUser: string | null;
  t: any;
  categories: CategoryItem[];
}

const THEME_OPTIONS = [
  { id: 'animais', label: 'Animais', icon: '🐾' },
  { id: 'natal', label: 'Natal', icon: '🎄' },
  { id: 'desporto', label: 'Desporto', icon: '⚽' },
  { id: 'ouro', label: 'Ouro', icon: '💰' },
  { id: 'natureza', label: 'Natureza', icon: '🌿' },
  { id: 'amor', label: 'Amor', icon: '❤️' },
  { id: 'astros', label: 'Astros', icon: '✨' },
];

const LINE_COLORS: { id: LineType; label: string; color: string }[] = [
  { id: 'none', label: 'Sem Linhas', color: 'bg-slate-800' },
  { id: 'blue', label: 'Azul', color: 'bg-blue-500' },
  { id: 'red', label: 'Vermelha', color: 'bg-red-500' },
  { id: 'green', label: 'Verde', color: 'bg-emerald-500' },
  { id: 'multicolor', label: 'Colorida', color: 'bg-gradient-to-tr from-red-500 via-green-500 to-blue-500' },
  { id: 'pink', label: 'Rosa', color: 'bg-pink-500' },
  { id: 'brown', label: 'Castanha', color: 'bg-amber-900' },
];

const STATE_OPTIONS: { id: ScratchcardState; label: string }[] = [
  { id: 'SC', label: 'SC (Usada)' },
  { id: 'MINT', label: 'MINT (Nova)' },
  { id: 'AMOSTRA', label: 'AMOSTRA' },
  { id: 'VOID', label: 'VOID' },
];

const INITIAL_FORM_STATE: Partial<ScratchcardData> = {
  category: 'raspadinha',
  state: 'SC',
  continent: 'Europa',
  country: 'Portugal',
  gameName: '',
  gameNumber: '',
  releaseDate: '',
  closeDate: '',
  operator: '',
  emission: '',
  printer: '',
  size: '',
  winProbability: '',
  lines: 'none',
  isSeries: false,
  seriesGroupId: '',
  theme: '',
  values: '',
  customId: '',
  isWinner: false,
  isRarity: false
};

export const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUploadComplete, currentUser, categories }) => {
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasAiData, setHasAiData] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<Partial<AnalysisResult> | null>(null);

  const [formData, setFormData] = useState<Partial<ScratchcardData>>({
    ...INITIAL_FORM_STATE,
    collector: currentUser || 'Jorge Mesquita'
  });

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File, type: 'front' | 'back' | 'gallery') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (type === 'front') setFrontPreview(result);
      else if (type === 'back') setBackPreview(result);
      else setGalleryPreviews(prev => [...prev, result]);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const clearFormFields = () => {
    if (confirm("Vovô, quer mesmo apagar todos os dados desta ficha? hihi!")) {
      setFormData({
        ...INITIAL_FORM_STATE,
        collector: currentUser || 'Jorge Mesquita'
      });
      setFrontPreview(null);
      setBackPreview(null);
      setGalleryPreviews([]);
      setHasAiData(false);
      setAiSuggestions(null);
    }
  };

  const startAnalysis = async () => {
    if (!frontPreview) return;
    setIsAnalyzing(true);
    setAiSuggestions(null);
    try {
      const frontBase64 = frontPreview.split(',')[1];
      const backBase64 = backPreview ? backPreview.split(',')[1] : null;
      const result = await analyzeImage(frontBase64, backBase64, 'image/jpeg');
      
      setAiSuggestions(result);
      setHasAiData(true);
      
      // Auto-preenche campos que estejam vazios
      setFormData(prev => ({
        ...prev,
        gameName: prev.gameName || result.gameName,
        gameNumber: prev.gameNumber || result.gameNumber,
        price: prev.price || result.price,
        country: prev.country || result.country,
        island: prev.island || result.island,
        region: prev.region || result.region,
        operator: prev.operator || result.operator,
        printer: prev.printer || result.printer,
        lines: (prev.lines === 'none' ? (result.lines as LineType) : prev.lines),
        size: prev.size || result.size,
        emission: prev.emission || result.emission,
        winProbability: prev.winProbability || result.winProbability,
        values: prev.values || result.values,
        isWinner: prev.isWinner || result.isWinner,
        isRarity: prev.isRarity || result.isRarity,
        isSeries: prev.isSeries || !!result.seriesGroupId,
        seriesGroupId: prev.seriesGroupId || result.seriesGroupId,
        setCount: prev.setCount || result.setCount,
        state: result.isRarity ? 'AMOSTRA' : prev.state
      }));

    } catch (err) { 
      console.error(err);
      alert("Chloe não conseguiu ler tudo desta vez! hihi!");
    } finally { 
      setIsAnalyzing(false); 
    }
  };

  const handleApplySuggestion = (field: keyof ScratchcardData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.gameName || !frontPreview) return;
    setIsSaving(true);
    const timestamp = Date.now();
    const newItem: ScratchcardData = {
      ...formData as ScratchcardData,
      id: timestamp.toString(),
      frontUrl: frontPreview,
      backUrl: backPreview || undefined,
      gallery: galleryPreviews.length > 0 ? galleryPreviews : undefined,
      createdAt: timestamp,
      customId: formData.customId || `ID-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      owners: currentUser ? [currentUser] : []
    };

    try {
      await storageService.save(newItem);
      onUploadComplete(newItem);
      onClose();
    } catch (err) { alert("Erro ao arquivar!"); } finally { setIsSaving(false); }
  };

  // Helper para renderizar a sugestão da IA
  const AISuggestion = ({ field, value }: { field: keyof ScratchcardData, value: any }) => {
    if (!aiSuggestions || !value || formData[field] === value) return null;
    return (
      <button 
        onClick={() => handleApplySuggestion(field, value)}
        className="absolute -top-6 right-0 flex items-center gap-1.5 px-2 py-0.5 bg-brand-600 text-white rounded-full text-[7px] font-black uppercase tracking-widest shadow-lg animate-bounce-in hover:bg-emerald-500 transition-colors z-20"
        title="Clique para aceitar a sugestão da Chloe"
      >
        <Sparkles className="w-2.5 h-2.5" /> {value}
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 bg-black/95 backdrop-blur-md">
      <div className="bg-[#0f172a] border border-white/10 rounded-[3rem] w-full max-w-7xl h-full md:h-[94vh] shadow-2xl flex flex-col overflow-hidden animate-bounce-in">
        
        {/* Header Profissional */}
        <div className="px-8 py-5 border-b border-white/5 flex justify-between items-center bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-600/20 rounded-xl text-brand-400 border border-brand-500/20"><Camera className="w-5 h-5" /></div>
            <div>
              <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Registo de Arquivo Mestre</h2>
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Controlo de Legado • Jorge Mesquita 🐉</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {(hasAiData || frontPreview) && (
              <button 
                onClick={clearFormFields}
                className="flex items-center gap-2 px-4 py-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-xl border border-red-500/20 transition-all text-[9px] font-black uppercase tracking-widest"
                title="Limpar todos os campos da ficha"
              >
                <Trash2 className="w-3.5 h-3.5" /> Limpar Ficha
              </button>
            )}
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors bg-slate-800/50 rounded-full"><X className="w-6 h-6" /></button>
          </div>
        </div>

        {/* Content View */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {/* LADO ESQUERDO: Imagens e Análise */}
          <div className="w-full md:w-1/4 bg-slate-950/30 p-6 flex flex-col gap-6 border-r border-white/5 overflow-y-auto custom-scrollbar">
             <div className="space-y-6">
                <div>
                   <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2 mb-4"><ImagePlus className="w-3.5 h-3.5" /> Média Principal</h3>
                   <div className="grid grid-cols-2 gap-3">
                      <div onClick={() => frontInputRef.current?.click()} className={`relative aspect-square rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-2 overflow-hidden ${frontPreview ? 'border-brand-500' : 'border-slate-800 bg-slate-900/30'}`}>
                        {frontPreview ? <img src={frontPreview} className="w-full h-full object-cover" /> : <div className="text-center"><Upload className="w-5 h-5 mx-auto text-slate-700 mb-1"/><span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Frente</span></div>}
                        <input type="file" ref={frontInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'front')} />
                      </div>
                      <div onClick={() => backInputRef.current?.click()} className={`relative aspect-square rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-2 overflow-hidden ${backPreview ? 'border-brand-500' : 'border-slate-800 bg-slate-900/30'}`}>
                        {backPreview ? <img src={backPreview} className="w-full h-full object-cover" /> : <div className="text-center"><Upload className="w-5 h-5 mx-auto text-slate-700 mb-1"/><span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Verso</span></div>}
                        <input type="file" ref={backInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'back')} />
                      </div>
                   </div>
                </div>

                {/* GALERIA DO SET COMPACTA */}
                <div>
                   <h3 className="text-[10px] font-black text-brand-400 uppercase tracking-[0.3em] flex items-center gap-2 mb-4"><Images className="w-3.5 h-3.5" /> Galeria do SET</h3>
                   <div className="grid grid-cols-4 gap-2">
                      {galleryPreviews.map((src, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group shadow-md hover:border-brand-500/50 transition-all">
                           <img src={src} className="w-full h-full object-cover" />
                           <button onClick={(e) => { e.stopPropagation(); handleRemoveGalleryImage(i); }} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10"><X className="w-2.5 h-2.5" /></button>
                        </div>
                      ))}
                      <button onClick={() => galleryInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-slate-800 hover:border-brand-500/50 hover:bg-brand-500/5 transition-all flex flex-col items-center justify-center gap-1 text-slate-600 hover:text-brand-400">
                         <Plus className="w-4 h-4" />
                         <span className="text-[6px] font-black uppercase">Add</span>
                      </button>
                      <input type="file" ref={galleryInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'gallery')} />
                   </div>
                </div>

                <div className="flex flex-col gap-2">
                   <button onClick={startAnalysis} disabled={!frontPreview || isAnalyzing} className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all ${frontPreview ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/40' : 'bg-slate-800 text-slate-600'}`}>
                     {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />} {isAnalyzing ? 'A Ler Dados...' : 'Busca Profunda IA'}
                   </button>
                   {hasAiData && (
                     <p className="text-[7px] text-slate-500 font-black uppercase text-center mt-2 flex items-center justify-center gap-1">
                       <MousePointer2 className="w-2.5 h-2.5" /> Clique nas etiquetas azuis para corrigir
                     </p>
                   )}
                </div>
             </div>
          </div>

          {/* LADO DIREITO: Todos os Comandos Técnicos */}
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-slate-900/20">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                
                {/* GRUPO A: Dados de Identidade */}
                <div className="space-y-5 bg-slate-950/40 p-6 rounded-[2.5rem] border border-white/5">
                   <h3 className="text-[10px] font-black text-brand-500 uppercase tracking-[0.3em] flex items-center gap-2"><Tag className="w-4 h-4" /> Identidade do Jogo</h3>
                   <div className="space-y-4">
                      <div className="relative">
                         <AISuggestion field="gameName" value={aiSuggestions?.gameName} />
                         <input type="text" placeholder="Ex: Super Pé de Meia" value={formData.gameName} onChange={e => setFormData({...formData, gameName: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-black text-xs outline-none focus:border-brand-500" />
                         <span className="absolute -top-1.5 left-3 bg-slate-950 px-1 text-[7px] text-slate-600 font-black uppercase">Nome do Jogo</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                         <div className="relative">
                            <AISuggestion field="gameNumber" value={aiSuggestions?.gameNumber} />
                            <input type="text" placeholder="Ex: 502" value={formData.gameNumber} onChange={e => setFormData({...formData, gameNumber: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-black text-xs outline-none focus:border-brand-500" />
                            <span className="absolute -top-1.5 left-3 bg-slate-950 px-1 text-[7px] text-slate-600 font-black uppercase">Nº Jogo</span>
                         </div>
                         <div className="relative">
                            <AISuggestion field="price" value={aiSuggestions?.price} />
                            <input type="text" placeholder="Ex: 5€" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-black text-xs outline-none focus:border-brand-500" />
                            <span className="absolute -top-1.5 left-2 bg-slate-950 px-1 text-[7px] text-slate-600 font-black uppercase">Preço</span>
                         </div>
                      </div>
                   </div>
                </div>

                {/* GRUPO B: Cronologia e Entidades */}
                <div className="space-y-5 bg-slate-950/40 p-6 rounded-[2.5rem] border border-white/5">
                   <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] flex items-center gap-2"><Calendar className="w-4 h-4" /> Ciclo de Vida</h3>
                   <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                         <div className="relative">
                            <AISuggestion field="releaseDate" value={aiSuggestions?.releaseDate} />
                            <input type="date" value={formData.releaseDate} onChange={e => setFormData({...formData, releaseDate: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-black text-[10px] outline-none focus:border-orange-500" />
                            <span className="absolute -top-1.5 left-3 bg-slate-950 px-1 text-[7px] text-slate-600 font-black uppercase">Lançamento</span>
                         </div>
                         <div className="relative">
                            <input type="date" value={formData.closeDate} onChange={e => setFormData({...formData, closeDate: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-black text-[10px] outline-none focus:border-orange-500" />
                            <span className="absolute -top-1.5 left-3 bg-slate-950 px-1 text-[7px] text-slate-600 font-black uppercase">Caducidade</span>
                         </div>
                      </div>
                      <div className="relative">
                         <AISuggestion field="operator" value={aiSuggestions?.operator} />
                         <input type="text" placeholder="Ex: Jogos Santa Casa" value={formData.operator} onChange={e => setFormData({...formData, operator: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-black text-xs outline-none focus:border-orange-500" />
                         <span className="absolute -top-1.5 left-3 bg-slate-950 px-1 text-[7px] text-slate-600 font-black uppercase">Operadora / Editora</span>
                      </div>
                   </div>
                </div>

                {/* GRUPO C: Dados Técnicos Avançados */}
                <div className="space-y-5 bg-slate-950/40 p-6 rounded-[2.5rem] border border-white/5">
                   <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] flex items-center gap-2"><BookOpen className="w-4 h-4" /> Ficha Técnica</h3>
                   <div className="space-y-4">
                      <div className="relative">
                         <AISuggestion field="emission" value={aiSuggestions?.emission} />
                         <input type="text" placeholder="Ex: 20.000.000 exemplares" value={formData.emission} onChange={e => setFormData({...formData, emission: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-black text-xs outline-none focus:border-emerald-500" />
                         <span className="absolute -top-1.5 left-3 bg-slate-950 px-1 text-[7px] text-slate-600 font-black uppercase">Emissão / Tiragem</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                         <div className="relative">
                            <AISuggestion field="size" value={aiSuggestions?.size} />
                            <input type="text" placeholder="Ex: 10x15cm" value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-black text-xs outline-none focus:border-emerald-500" />
                            <span className="absolute -top-1.5 left-3 bg-slate-950 px-1 text-[7px] text-slate-600 font-black uppercase">Medidas</span>
                         </div>
                         <div className="relative">
                            <AISuggestion field="winProbability" value={aiSuggestions?.winProbability} />
                            <input type="text" placeholder="Ex: 1 em 3.4" value={formData.winProbability} onChange={e => setFormData({...formData, winProbability: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-black text-xs outline-none focus:border-emerald-500" />
                            <span className="absolute -top-1.5 left-3 bg-slate-950 px-1 text-[7px] text-slate-600 font-black uppercase">Probabilidade</span>
                         </div>
                      </div>
                   </div>
                </div>

                {/* GRUPO D: Geografia e Estado */}
                <div className="space-y-5 bg-slate-950/40 p-6 rounded-[2.5rem] border border-white/5">
                   <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] flex items-center gap-2"><Globe2 className="w-4 h-4" /> Geografia</h3>
                   <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                         <div className="relative">
                            <AISuggestion field="country" value={aiSuggestions?.country} />
                            <input type="text" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-black text-xs outline-none focus:border-blue-500" />
                            <span className="absolute -top-1.5 left-3 bg-slate-950 px-1 text-[7px] text-slate-600 font-black uppercase">País</span>
                         </div>
                         <div className="relative">
                            <select value={formData.state} onChange={e => setFormData({...formData, state: e.target.value as ScratchcardState})} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-black text-xs outline-none focus:border-blue-500">
                               {STATE_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                            </select>
                            <span className="absolute -top-1.5 left-3 bg-slate-950 px-1 text-[7px] text-slate-600 font-black uppercase">Estado Físico</span>
                         </div>
                      </div>
                   </div>
                </div>

                {/* GRUPO E: Séries e Curadoria Profunda */}
                <div className="space-y-5 bg-brand-500/5 p-6 rounded-[2.5rem] border border-brand-500/20 lg:col-span-2">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                         <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-brand-400 uppercase tracking-[0.3em] flex items-center gap-2"><Layers className="w-4 h-4" /> Série / SET</h3>
                            <label className="relative inline-flex items-center cursor-pointer scale-110">
                              <input type="checkbox" checked={formData.isSeries} onChange={e => setFormData({...formData, isSeries: e.target.checked})} className="sr-only peer" />
                              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                            </label>
                         </div>
                         {formData.isSeries && (
                            <div className="flex gap-3 animate-fade-in">
                               <div className="relative flex-1">
                                  <AISuggestion field="seriesGroupId" value={aiSuggestions?.seriesGroupId} />
                                  <input type="text" placeholder="Nome do SET" value={formData.seriesGroupId} onChange={e => setFormData({...formData, seriesGroupId: e.target.value})} className="w-full bg-slate-900 border border-brand-500/30 rounded-xl p-3 text-white font-black text-xs outline-none" />
                               </div>
                               <div className="relative w-16">
                                  <AISuggestion field="setCount" value={aiSuggestions?.setCount} />
                                  <input type="text" placeholder="Total" value={formData.setCount} onChange={e => setFormData({...formData, setCount: e.target.value})} className="w-full bg-slate-900 border border-brand-500/30 rounded-xl p-3 text-white font-black text-xs outline-none text-center" />
                               </div>
                            </div>
                         )}
                         <div className="flex gap-4 pt-2">
                            <button onClick={() => setFormData({...formData, isWinner: !formData.isWinner})} className={`flex-1 p-3 rounded-xl border flex items-center justify-center gap-2 transition-all font-black text-[9px] uppercase ${formData.isWinner ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                               <Trophy className="w-3.5 h-3.5" /> Premiada
                            </button>
                            <button onClick={() => setFormData({...formData, isRarity: !formData.isRarity})} className={`flex-1 p-3 rounded-xl border flex items-center justify-center gap-2 transition-all font-black text-[9px] uppercase ${formData.isRarity ? 'bg-amber-600 border-amber-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                               <Star className="w-3.5 h-3.5" /> Raridade
                            </button>
                         </div>
                      </div>
                      <div className="space-y-4">
                         <h3 className="text-[10px] font-black text-pink-500 uppercase tracking-[0.3em] flex items-center gap-2"><Palette className="w-4 h-4" /> Tema Sugerido</h3>
                         <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                            {THEME_OPTIONS.map(theme => (
                              <button key={theme.id} onClick={() => setFormData({...formData, theme: theme.id})} className={`p-2 rounded-xl border transition-all ${formData.theme === theme.id ? 'bg-pink-600 border-pink-400 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white'}`} title={theme.label}>
                                 <span className="text-lg">{theme.icon}</span>
                              </button>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>

                {/* GRUPO F: Notas e Curiosidades */}
                <div className="space-y-4 bg-slate-950/40 p-6 rounded-[2.5rem] border border-white/5 lg:col-span-3">
                   <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2"><Info className="w-4 h-4" /> Notas e Tabela de Prémios</h3>
                   <div className="relative">
                      <AISuggestion field="values" value={aiSuggestions?.values} />
                      <textarea placeholder="Vovô, descreva aqui os prémios ou curiosidades... hihi!" value={formData.values} onChange={e => setFormData({...formData, values: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-[2rem] p-5 text-white text-xs h-24 outline-none italic resize-none focus:border-brand-500 transition-all" />
                   </div>
                </div>

             </div>
          </div>
        </div>

        {/* Footer do Registo */}
        <div className="px-8 py-6 border-t border-white/5 bg-slate-900/60 flex justify-end gap-4 shrink-0">
          <button onClick={onClose} className="px-10 py-3 bg-slate-800 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:text-white transition-all">Cancelar</button>
          <button 
            onClick={handleSave} 
            disabled={isSaving || !formData.gameName || !frontPreview}
            className={`px-16 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl flex items-center gap-3 transition-all active:scale-95 ${formData.gameName && frontPreview ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
            Arquivar no Legado Mundial
          </button>
        </div>
      </div>
    </div>
  );
};
