
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  X, Upload, Sparkles, Check, Loader2, ArrowLeft, 
  ImageIcon, ScanLine, Star, Hash, Globe, 
  Printer, Ruler, Banknote, Clock, Info, MapPin, 
  Building2, Layers, User, Palette, Activity, Percent, Calendar, AlertCircle, Ship, ImagePlus, Trash2, LayoutList, Layout, Wand2
} from 'lucide-react';
import { ScratchcardData, Category, ScratchcardState, LineType, CategoryItem, AnalysisResult } from '../types';
import { analyzeImage } from '../services/geminiService';
import { storageService } from '../services/storage';

interface UploadModalProps {
  onClose: () => void;
  onUploadComplete: (data: ScratchcardData) => void;
  existingImages: ScratchcardData[];
  initialFile: File | null;
  currentUser: string | null;
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

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "Califórnia", "Carolina do Norte", "Carolina do Sul", "Colorado", "Connecticut", "Dakota do Norte", "Dakota do Sul", "Delaware", "Distrito de Colúmbia", "Flórida", "Geórgia", "Havai", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New York", "Novo México", "Ohio", "Oklahoma", "Oregon", "Pensilvânia", "Rhode Island", "Tennessee", "Texas", "Utah", "Vermont", "Virgínia", "Virgínia Ocidental", "Washington", "Wisconsin", "Wyoming"
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

const STATE_OPTIONS: { id: ScratchcardState; label: string; group: 'Archivio' | 'Condizione' }[] = [
  { id: 'MINT', label: 'MINT', group: 'Condizione' },
  { id: 'SC', label: 'SC', group: 'Condizione' },
  { id: 'CS', label: 'CS', group: 'Condizione' },
  { id: 'AMOSTRA', label: 'AMOSTRA', group: 'Archivio' },
  { id: 'VOID', label: 'VOID', group: 'Archivio' },
  { id: 'SAMPLE', label: 'SAMPLE', group: 'Archivio' },
  { id: 'MUESTRA', label: 'MUESTRA', group: 'Archivio' },
  { id: 'CAMPIONE', label: 'CAMPIONE', group: 'Archivio' },
  { id: '样本', label: '样本', group: 'Archivio' },
  { id: 'MUSTER', label: 'MUSTER', group: 'Archivio' },
  { id: 'PRØVE', label: 'PRØVE', group: 'Archivio' }
];

export const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUploadComplete, existingImages, initialFile, currentUser, t, categories }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<AnalysisResult | null>(null);

  const [formData, setFormData] = useState<Partial<ScratchcardData>>({
    category: 'raspadinha',
    state: 'SC',
    continent: 'Europa',
    country: 'Portugal',
    region: '',
    island: '',
    operator: '',
    theme: '',
    lines: 'none',
    gameNumber: '',
    size: '',
    printer: '',
    price: '',
    collector: currentUser || 'Jorge Mesquita',
    releaseDate: '',
    closeDate: '',
    emission: '',
    winProbability: '',
    values: '',
    setCount: ''
  });

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(() => {
    const unique = (arr: any[]) => Array.from(new Set(arr.filter(Boolean)));
    return {
      gameNames: unique(existingImages.map(img => img.gameName)),
      countries: unique(existingImages.map(img => img.country)),
      regions: unique(existingImages.map(img => img.region)),
      islands: unique(existingImages.map(img => img.island)),
      operators: unique(existingImages.map(img => img.operator)),
      printers: unique(existingImages.map(img => img.printer)),
      collectors: unique(existingImages.map(img => img.collector)),
      years: unique(existingImages.map(img => img.releaseDate))
    };
  }, [existingImages]);

  useEffect(() => {
    if (initialFile) handleFrontSelect(initialFile);
  }, [initialFile]);

  const handleFrontSelect = (file: File) => {
    setFrontFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setFrontPreview(e.target?.result as string);
    reader.readAsDataURL(file as Blob);
    setAnalysisError(null);
  };

  const handleBackSelect = (file: File) => {
    setBackFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setBackPreview(e.target?.result as string);
    reader.readAsDataURL(file as Blob);
  };

  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    files.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setGalleryPreviews(prev => [...prev, event.target?.result as string]);
      };
      reader.readAsDataURL(file as Blob);
    });
  };

  const removeGalleryImage = (index: number) => {
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const processImage = async () => {
    if (!frontFile || !frontPreview) return;
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const frontBase64 = frontPreview.split(',')[1];
      const backBase64 = backPreview ? backPreview.split(',')[1] : null;
      const result = await analyzeImage(frontBase64, backBase64, frontFile.type);
      
      setAiResult(result);
      setFormData(prev => ({
        ...prev,
        ...result,
        state: result.state as ScratchcardState,
        lines: result.lines as LineType,
        aiGenerated: true
      }));
      
      setStep(2);
    } catch (err) {
      console.error("Erro no processamento:", err);
      setAnalysisError("A Chloe teve dificuldade em extrair os dados. Vamos preencher manualmente!");
      setStep(2);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!formData.gameName || !formData.country) return;
    setIsSaving(true);
    const timestamp = Date.now();
    
    const countryCode = (formData.country || 'PT').substring(0, 2).toUpperCase();
    const generatedId = `${countryCode}-${Math.floor(10000 + Math.random() * 89999)}`;

    const newItem: ScratchcardData = {
      id: timestamp.toString(),
      customId: formData.customId || generatedId,
      frontUrl: frontPreview || '',
      backUrl: backPreview || undefined,
      gallery: galleryPreviews.length > 0 ? galleryPreviews : undefined,
      gameName: formData.gameName || '',
      gameNumber: formData.gameNumber || '',
      releaseDate: formData.releaseDate || '',
      closeDate: formData.closeDate || '',
      size: formData.size || '',
      values: formData.values || '',
      price: formData.price,
      state: (formData.state as ScratchcardState) || 'SC',
      country: formData.country || '',
      region: formData.region || '',
      island: formData.island || '',
      continent: (formData.continent as any) || 'Europa',
      category: formData.category || 'raspadinha',
      theme: formData.theme || '',
      operator: formData.operator || '',
      printer: formData.printer || '',
      emission: formData.emission || '',
      winProbability: formData.winProbability || '',
      lines: formData.lines || 'none',
      collector: formData.collector || currentUser || 'Jorge Mesquita',
      aiGenerated: formData.aiGenerated || false,
      createdAt: timestamp,
      owners: currentUser ? [currentUser] : [],
      setCount: formData.setCount
    };

    try {
      await storageService.save(newItem);
      onUploadComplete(newItem);
      onClose();
    } catch (err) {
      setIsSaving(false);
    }
  };

  /**
   * Chloe: Componente de Sugestão Inteligente
   */
  const AiSuggestion = ({ field, aiValue }: { field: keyof ScratchcardData, aiValue?: string }) => {
    if (!aiValue || !aiValue.trim()) return null;
    const currentValue = formData[field]?.toString() || '';
    
    if (currentValue.trim().toLowerCase() === aiValue.trim().toLowerCase()) return null;

    return (
      <button 
        type="button"
        onClick={() => setFormData(prev => ({ ...prev, [field]: aiValue }))}
        className="mt-1 inline-flex items-center gap-1.5 px-2 py-1 bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 border border-brand-500/30 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all group animate-fade-in"
      >
        <Wand2 className="w-2.5 h-2.5 group-hover:rotate-12 transition-transform" />
        Chloe sugere: <span className="text-white italic">{aiValue}</span>
      </button>
    );
  };

  const isUSA = formData.country?.toLowerCase() === 'eua' || formData.country?.toLowerCase() === 'usa' || formData.country?.toLowerCase() === 'estados unidos';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
       <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl h-[90vh] shadow-2xl flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
             <div className="flex items-center gap-4">
               <button onClick={() => setStep(1)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"><ArrowLeft className="w-6 h-6"/></button>
               <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Detalhes do Arquivo</h2>
             </div>
             <button onClick={onClose} className="text-slate-500 hover:text-white"><X className="w-6 h-6"/></button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-950/20">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-4">
                   <div className="sticky top-0 space-y-4">
                      <div className="bg-slate-950 rounded-2xl p-2 border border-slate-800 shadow-2xl">
                         <img src={frontPreview || ''} className="w-full rounded-xl object-contain max-h-[400px]" />
                      </div>
                      {(backPreview || galleryPreviews.length > 0) && (
                         <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 flex flex-wrap gap-2">
                            {backPreview && <div className="w-20 h-20 rounded-lg border border-brand-500/30 overflow-hidden"><img src={backPreview} className="w-full h-full object-cover" /></div>}
                            {galleryPreviews.map((g, i) => (
                               <div key={i} className="w-20 h-20 rounded-lg border border-slate-700 overflow-hidden opacity-70"><img src={g} className="w-full h-full object-cover" /></div>
                            ))}
                         </div>
                      )}
                   </div>
                </div>

                <div className="space-y-8">
                   {/* Step transition / AI feedback */}
                   {aiResult && (
                      <div className="p-4 bg-brand-500/10 border border-brand-500/20 rounded-2xl flex items-center gap-4 animate-bounce-in">
                         <div className="p-2 bg-brand-600 rounded-xl shadow-lg">
                            <Sparkles className="w-5 h-5 text-white" />
                         </div>
                         <div>
                            <p className="text-white text-xs font-black uppercase tracking-widest leading-none">A Chloe leu com sucesso!</p>
                            <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] mt-1.5 italic">Os campos foram pré-preenchidos. Verifique as sugestões hihi!</p>
                         </div>
                      </div>
                   )}

                   <section className="space-y-4">
                      <h3 className="text-[10px] font-black text-brand-500 uppercase tracking-[0.3em] flex items-center gap-2">
                        <User className="w-3 h-3" /> Identificação do Jogo
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <label className="block col-span-2">
                           <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-1">Nome do jogo:</span>
                           <input list="game-names" type="text" value={formData.gameName} onChange={e => setFormData({...formData, gameName: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-brand-500 transition-all" />
                           <AiSuggestion field="gameName" aiValue={aiResult?.gameName} />
                        </label>
                        <label className="block">
                           <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-1">Jogo nº:</span>
                           <input type="text" value={formData.gameNumber} onChange={e => setFormData({...formData, gameNumber: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-brand-500" />
                           <AiSuggestion field="gameNumber" aiValue={aiResult?.gameNumber} />
                        </label>
                        <label className="block">
                           <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-1">Codigo / ID:</span>
                           <input type="text" value={formData.customId} onChange={e => setFormData({...formData, customId: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-brand-500" placeholder="Gerado automaticamente" />
                        </label>
                      </div>
                   </section>

                   <section className="space-y-4">
                      <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] flex items-center gap-2">
                        <MapPin className="w-3 h-3" /> Origem Geográfica
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <label>
                           <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-1">País:</span>
                           <input list="countries" type="text" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-500" />
                           <AiSuggestion field="country" aiValue={aiResult?.country} />
                        </label>
                        <label>
                           <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-1">Ilha / Arquipélago:</span>
                           <input list="islands" type="text" value={formData.island} onChange={e => setFormData({...formData, island: e.target.value})} className="w-full bg-slate-950 border border-brand-500/50 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-500" placeholder="Ex: Açores, Madeira, Canárias..." />
                           <AiSuggestion field="island" aiValue={aiResult?.island} />
                        </label>
                        <label>
                           <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-1">Região / Estado:</span>
                           <input list="regions" type="text" value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-500" placeholder="Ex: Continente, Catalunha..." />
                           <AiSuggestion field="region" aiValue={aiResult?.region} />
                        </label>
                        <label>
                           <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-1">Continente:</span>
                           <select value={formData.continent} onChange={e => setFormData({...formData, continent: e.target.value as any})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none">
                             {['Europa', 'América', 'Ásia', 'África', 'Oceania'].map(c => <option key={c} value={c}>{c}</option>)}
                           </select>
                        </label>
                      </div>
                   </section>

                   <section className="space-y-4">
                      <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] flex items-center gap-2">
                        <ScanLine className="w-3 h-3" /> Especificações Técnicas
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <label className="block col-span-2">
                           <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-1">Operador:</span>
                           <input list="operators" type="text" value={formData.operator} onChange={e => setFormData({...formData, operator: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-brand-500" placeholder="Ex: SCML, ONCE, Sisal..." />
                           <AiSuggestion field="operator" aiValue={aiResult?.operator} />
                        </label>
                        <label className="block">
                           <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-1">Custo:</span>
                           <input type="text" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-brand-500" placeholder="Ex: 5€" />
                           <AiSuggestion field="price" aiValue={aiResult?.price} />
                        </label>
                        <label className="block">
                           <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-1">Estado:</span>
                           <select value={formData.state} onChange={e => setFormData({...formData, state: e.target.value as any})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-brand-500 uppercase text-[10px] font-black">
                              {STATE_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                           </select>
                        </label>
                      </div>
                   </section>

                   <section className="space-y-2">
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-1">Nota / Observações:</span>
                      <textarea value={formData.values} onChange={e => setFormData({...formData, values: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white text-sm h-32 outline-none italic transition-all focus:border-brand-500 shadow-inner" placeholder="Notas sobre raridade ou histórico..." />
                      <AiSuggestion field="values" aiValue={aiResult?.values} />
                   </section>
                </div>
             </div>
          </div>

          <div className="p-6 border-t border-slate-800 bg-slate-900 flex justify-end gap-4 shrink-0">
             <button onClick={onClose} className="px-8 py-3 bg-slate-800 text-slate-400 rounded-xl font-black text-xs uppercase hover:text-white transition-all">Cancelar</button>
             <button onClick={handleSave} disabled={isSaving} className="px-12 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-black flex items-center gap-2 shadow-2xl active:scale-95 transition-all neon-glow-blue">
                {isSaving ? <Loader2 className="animate-spin w-5 h-5"/> : <Check className="w-5 h-5"/>}
                Confirmar e Arquivar
             </button>
          </div>
       </div>

       <datalist id="game-names">{suggestions.gameNames.map(val => <option key={val} value={val} />)}</datalist>
       <datalist id="collectors">{suggestions.collectors.map(val => <option key={val} value={val} />)}</datalist>
       <datalist id="countries">{suggestions.countries.map(val => <option key={val} value={val} />)}</datalist>
       <datalist id="islands">{suggestions.islands.map(val => <option key={val} value={val} />)}</datalist>
       <datalist id="regions">{suggestions.regions.map(val => <option key={val} value={val} />)}</datalist>
       <datalist id="operators">{suggestions.operators.map(val => <option key={val} value={val} />)}</datalist>
       <datalist id="printers">{suggestions.printers.map(val => <option key={val} value={val} />)}</datalist>
       <datalist id="years">{suggestions.years.map(val => <option key={val} value={val} />)}</datalist>
    </div>
  );
};
