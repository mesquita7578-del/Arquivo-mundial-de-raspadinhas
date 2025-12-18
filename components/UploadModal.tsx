
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  X, Upload, Sparkles, AlertCircle, Check, Loader2, ArrowLeft, 
  Image as ImageIcon, ScanLine, DollarSign, Calendar, Globe, 
  Printer, Layers, Heart, Hash, Map, Gift, Trophy, Star, 
  Gem, Tag, Ruler, Banknote, Clock, Info, Coins, MapPin, 
  ChevronDown, Search, Lightbulb
} from 'lucide-react';
import { ScratchcardData, Category, LineType, ScratchcardState } from '../types';
import { analyzeImage } from '../services/geminiService';
import { storageService } from '../services/storage';

interface UploadModalProps {
  onClose: () => void;
  onUploadComplete: (data: ScratchcardData) => void;
  existingImages: ScratchcardData[];
  initialFile: File | null;
  currentUser: string | null;
  t: any;
}

// Sub-componente para Input com Sugestões
const SuggestiveInput = ({ 
  label, 
  icon: Icon, 
  value, 
  onChange, 
  suggestions, 
  placeholder,
  isAiFilled,
  className = ""
}: { 
  label: string; 
  icon: any; 
  value: string; 
  onChange: (val: string) => void; 
  suggestions: string[]; 
  placeholder?: string;
  isAiFilled?: boolean;
  className?: string;
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!value) return suggestions.slice(0, 5);
    return suggestions
      .filter(s => s.toLowerCase().includes(value.toLowerCase()) && s.toLowerCase() !== value.toLowerCase())
      .slice(0, 5);
  }, [value, suggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <label className="text-[10px] text-slate-500 font-black uppercase mb-1 flex items-center justify-between gap-1">
        <span className="flex items-center gap-1"><Icon className="w-3 h-3"/> {label}</span>
        {isAiFilled && (
          <span className="flex items-center gap-0.5 text-brand-500 animate-pulse">
            <Sparkles className="w-2.5 h-2.5" /> 
            <span className="text-[8px]">IA</span>
          </span>
        )}
      </label>
      <div className="relative">
        <input 
          type="text" 
          value={value} 
          onChange={e => { onChange(e.target.value); setShowSuggestions(true); }}
          onFocus={() => setShowSuggestions(true)}
          className={`w-full bg-slate-800 border rounded-xl px-4 py-2.5 text-white text-sm transition-all outline-none ${isAiFilled ? 'border-brand-500/50 focus:border-brand-500' : 'border-slate-700 focus:border-blue-500'}`}
          placeholder={placeholder}
        />
        {showSuggestions && filtered.length > 0 && (
          <div className="absolute z-50 left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-fade-in">
            {filtered.map((s, idx) => (
              <button 
                key={idx} 
                onClick={() => { onChange(s); setShowSuggestions(false); }}
                className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-2"
              >
                <Lightbulb className="w-3 h-3 text-yellow-500" /> {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUploadComplete, existingImages, initialFile, currentUser, t }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track which fields were auto-filled by AI to show visual feedback
  const [aiFilledFields, setAiFilledFields] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState<Partial<ScratchcardData>>({
    category: 'raspadinha',
    state: 'SC',
    continent: 'Europa',
    country: 'Portugal',
    region: '',
    lines: '',
    aiGenerated: false,
    isRarity: false,
    isSeries: false,
    isPromotional: false,
    isWinner: false,
    gameNumber: '',
    size: '10x15cm',
    printer: '',
    emission: '',
    price: '',
    releaseDate: new Date().getFullYear().toString()
  });

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  // Extrair valores únicos da coleção existente para sugestões
  const collectionSuggestions = useMemo(() => {
    const suggestions = {
      countries: new Set<string>(),
      regions: new Set<string>(),
      printers: new Set<string>(),
      sizes: new Set<string>(),
      gameNames: new Set<string>()
    };
    
    existingImages.forEach(img => {
      if (img.country) suggestions.countries.add(img.country);
      if (img.region) suggestions.regions.add(img.region);
      if (img.printer) suggestions.printers.add(img.printer);
      if (img.size) suggestions.sizes.add(img.size);
      if (img.gameName) suggestions.gameNames.add(img.gameName);
    });

    return {
      countries: Array.from(suggestions.countries).sort(),
      regions: Array.from(suggestions.regions).sort(),
      printers: Array.from(suggestions.printers).sort(),
      sizes: Array.from(suggestions.sizes).sort(),
      gameNames: Array.from(suggestions.gameNames).sort()
    };
  }, [existingImages]);

  useEffect(() => {
    if (initialFile) handleFrontSelect(initialFile);
  }, [initialFile]);

  const handleFrontSelect = (file: File) => {
    setFrontFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setFrontPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleBackSelect = (file: File) => {
    setBackFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setBackPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const processImage = async () => {
    if (!frontFile || !frontPreview) return;
    setIsAnalyzing(true);
    setError(null);
    setAiFilledFields(new Set());

    try {
      const frontBase64 = frontPreview.split(',')[1];
      const backBase64 = backPreview ? backPreview.split(',')[1] : null;
      const mime = frontFile.type || "image/jpeg";
      const result = await analyzeImage(frontBase64, backBase64, mime);
      
      const countryStr = result.country || 'Portugal';
      const initialsMap: Record<string, string> = {
        'Portugal': 'PT', 'Espanha': 'ES', 'Itália': 'IT', 'França': 'FR',
        'Brasil': 'BR', 'EUA': 'US', 'Estados Unidos': 'US', 'Argentina': 'AR',
        'Alemanha': 'DE', 'Japão': 'JP', 'Reino Unido': 'UK', 'China': 'CN',
        'Suíça': 'CH', 'Áustria': 'AT', 'Bélgica': 'BE', 'Luxemburgo': 'LU'
      };
      
      const countryCode = initialsMap[countryStr] || countryStr.substring(0, 2).toUpperCase();
      const randomNum = Math.floor(10000 + Math.random() * 89999);
      let generatedId = `${countryCode}-${randomNum}`;

      // Mark fields that AI actually found
      const detected = new Set<string>();
      Object.keys(result).forEach(key => {
        if ((result as any)[key]) detected.add(key);
      });
      setAiFilledFields(detected);

      setFormData(prev => ({ ...prev, ...result, customId: generatedId, aiGenerated: true }));
      setStep(2);
    } catch (err) {
      console.error("Erro na Chloe:", err);
      setStep(2); // Prossegue mesmo com erro para preenchimento manual
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateField = (field: keyof ScratchcardData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // If user manually changes a field, remove AI filled badge
    if (aiFilledFields.has(field)) {
      const newSet = new Set(aiFilledFields);
      newSet.delete(field);
      setAiFilledFields(newSet);
    }
  };

  const handleSave = async () => {
    if (!formData.gameName || !formData.country) {
      setError("Por favor, preencha o Nome do Jogo e o País.");
      return;
    }

    setIsSaving(true);
    const timestamp = Date.now();
    const newItem: ScratchcardData = {
      id: timestamp.toString(),
      customId: formData.customId || `ID-${Math.floor(Math.random() * 100000)}`,
      frontUrl: frontPreview || '',
      backUrl: backPreview || undefined,
      gameName: formData.gameName || '',
      gameNumber: formData.gameNumber || '',
      releaseDate: formData.releaseDate || '',
      size: formData.size || '',
      values: formData.values || '',
      price: formData.price,
      state: (formData.state as ScratchcardState) || 'SC',
      country: formData.country || '',
      region: formData.region || '',
      continent: formData.continent || 'Europa',
      category: formData.category || 'raspadinha',
      emission: formData.emission || '',
      printer: formData.printer || '',
      lines: formData.lines || '',
      isRarity: formData.isRarity || false,
      isSeries: formData.isSeries || false,
      isPromotional: formData.isPromotional || false,
      isWinner: formData.isWinner || false,
      collector: currentUser || 'Jorge Mesquita',
      aiGenerated: formData.aiGenerated || false,
      createdAt: timestamp,
      owners: currentUser ? [currentUser] : []
    };

    try {
      await storageService.save(newItem);
      onUploadComplete(newItem);
      onClose();
    } catch (err) {
      setError("Erro ao gravar no arquivo.");
      setIsSaving(false);
    }
  };

  const commonLines = [
    { label: 'Azul', value: 'blue', color: 'bg-blue-600' },
    { label: 'Vermelha', value: 'red', color: 'bg-red-600' },
    { label: 'Multicolor', value: 'multicolor', color: 'bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500' },
    { label: 'Verde', value: 'green', color: 'bg-green-600' },
    { label: 'Amarela', value: 'yellow', color: 'bg-yellow-400' },
    { label: 'Castanha', value: 'brown', color: 'bg-amber-900' },
    { label: 'Cinza', value: 'gray', color: 'bg-gray-500' },
  ];

  if (step === 1) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl relative p-6">
           <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"><X className="w-5 h-5"/></button>
           <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
             <Upload className="w-5 h-5 text-brand-500"/> Novo Registo no Arquivo
           </h2>
           <div className="grid grid-cols-2 gap-4 mb-6">
              <div onClick={() => frontInputRef.current?.click()} className="group aspect-square border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 hover:bg-slate-800/80 transition-all relative overflow-hidden bg-slate-800/50 shadow-inner">
                {frontPreview ? <img src={frontPreview} className="absolute inset-0 w-full h-full object-contain" /> : <><ImageIcon className="w-8 h-8 text-slate-600 mb-2 group-hover:text-brand-500 transition-colors"/><span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Frente *</span></>}
                <input type="file" ref={frontInputRef} className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleFrontSelect(e.target.files[0])} />
              </div>
              <div onClick={() => backInputRef.current?.click()} className="group aspect-square border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 hover:bg-slate-800/80 transition-all relative overflow-hidden bg-slate-800/50 shadow-inner">
                {backPreview ? <img src={backPreview} className="absolute inset-0 w-full h-full object-contain" /> : <><ImageIcon className="w-8 h-8 text-slate-600 mb-2 group-hover:text-brand-500 transition-colors"/><span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Verso</span></>}
                <input type="file" ref={backInputRef} className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleBackSelect(e.target.files[0])} />
              </div>
           </div>
           
           <div className="space-y-3">
             <button 
              onClick={processImage} 
              disabled={!frontFile || isAnalyzing} 
              className="w-full bg-brand-600 hover:bg-brand-500 text-white py-4 rounded-xl font-black flex items-center justify-center gap-3 transition-all shadow-lg shadow-brand-900/40 disabled:opacity-50 active:scale-[0.98]"
             >
               {isAnalyzing ? <Loader2 className="animate-spin w-5 h-5"/> : <Sparkles className="w-5 h-5"/>}
               {isAnalyzing ? "CHLOE ESTÁ A ANALISAR..." : "ATIVAR CHLOE ANALISTA"}
             </button>
             <button 
              onClick={() => setStep(2)} 
              disabled={!frontFile || isAnalyzing}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
             >
               Preencher Manualmente
             </button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
       <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-6xl h-[95vh] shadow-2xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur">
             <div className="flex items-center gap-3">
               <button onClick={() => setStep(1)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"><ArrowLeft className="w-5 h-5"/></button>
               <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                 <ScanLine className="w-5 h-5 text-brand-500" /> Revisão e Confirmação de Registo
               </h2>
             </div>
             <button onClick={onClose} className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-full"><X className="w-5 h-5"/></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-950/20">
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Imagens */}
                <div className="lg:col-span-4 space-y-4">
                   <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 shadow-inner">
                      <p className="text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">Vista de Frente</p>
                      <img src={frontPreview || ''} className="w-full rounded-xl shadow-lg border border-white/5" />
                   </div>
                   {backPreview && (
                      <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 shadow-inner">
                         <p className="text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">Vista de Verso</p>
                         <img src={backPreview} className="w-full rounded-xl shadow-lg border border-white/5" />
                      </div>
                   )}
                   <div className="bg-brand-900/10 border border-brand-500/20 p-4 rounded-2xl">
                      <div className="flex items-center gap-2 mb-2 text-brand-500">
                         <Sparkles className="w-4 h-4" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Informação Chloe IA</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed italic">
                        "Encontrei {aiFilledFields.size} detalhes técnicos. Verifica os campos realçados a rosa e completa o que faltar para o avô Jorge!"
                      </p>
                   </div>
                </div>

                {/* Formulário de Registo Total */}
                <div className="lg:col-span-8 space-y-6">
                   {error && <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-3 rounded-xl text-xs font-bold animate-pulse">{error}</div>}
                   
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                         <SuggestiveInput 
                            label="Nome do Jogo *" 
                            icon={Star} 
                            value={formData.gameName || ''} 
                            onChange={v => updateField('gameName', v)}
                            suggestions={collectionSuggestions.gameNames}
                            placeholder="Ex: Super Pé de Meia"
                            isAiFilled={aiFilledFields.has('gameName')}
                         />
                      </div>
                      <div>
                         <label className="text-[10px] text-slate-500 font-black uppercase mb-1 flex items-center gap-1"><Hash className="w-3 h-3 text-brand-500"/> ID Arquivo</label>
                         <input type="text" value={formData.customId || ''} onChange={e => updateField('customId', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-brand-400 font-mono text-sm focus:border-brand-500 outline-none shadow-inner" />
                      </div>
                   </div>

                   <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-6">
                         <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" checked={formData.isSeries} onChange={e => updateField('isSeries', e.target.checked)} className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 transition-all" />
                            <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1 group-hover:text-white"><Layers className="w-3 h-3 text-indigo-500"/> Série (SET)</span>
                         </label>
                         <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" checked={formData.isRarity} onChange={e => updateField('isRarity', e.target.checked)} className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-brand-600 focus:ring-brand-500 transition-all" />
                            <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1 group-hover:text-white"><Gem className="w-3 h-3 text-yellow-500"/> Raridade</span>
                         </label>
                         <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" checked={formData.isPromotional} onChange={e => updateField('isPromotional', e.target.checked)} className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 transition-all" />
                            <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1 group-hover:text-white"><Gift className="w-3 h-3 text-blue-500"/> Promocional</span>
                         </label>
                         <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" checked={formData.isWinner} onChange={e => updateField('isWinner', e.target.checked)} className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-green-600 focus:ring-green-500 transition-all" />
                            <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1 group-hover:text-white"><Trophy className="w-3 h-3 text-green-500"/> Premiada</span>
                         </label>
                   </div>

                   <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <SuggestiveInput 
                        label="País" 
                        icon={Globe} 
                        value={formData.country || ''} 
                        onChange={v => updateField('country', v)}
                        suggestions={collectionSuggestions.countries}
                        isAiFilled={aiFilledFields.has('country')}
                      />
                      <SuggestiveInput 
                        label="Região / Ilha" 
                        icon={MapPin} 
                        value={formData.region || ''} 
                        onChange={v => updateField('region', v)}
                        suggestions={collectionSuggestions.regions}
                        placeholder="Ex: Açores"
                        isAiFilled={aiFilledFields.has('region')}
                      />
                      <div>
                         <label className="text-[10px] text-slate-500 font-black uppercase mb-1 flex items-center gap-1 justify-between">
                            <span className="flex items-center gap-1"><Hash className="w-3 h-3 text-blue-500"/> Nº Jogo</span>
                            {aiFilledFields.has('gameNumber') && <Sparkles className="w-2.5 h-2.5 text-brand-500" />}
                         </label>
                         <input type="text" value={formData.gameNumber || ''} onChange={e => updateField('gameNumber', e.target.value)} className={`w-full bg-slate-800 border rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:border-blue-500 outline-none ${aiFilledFields.has('gameNumber') ? 'border-brand-500/50' : 'border-slate-700'}`} />
                      </div>
                      <SuggestiveInput 
                        label="Medidas" 
                        icon={Ruler} 
                        value={formData.size || ''} 
                        onChange={v => updateField('size', v)}
                        suggestions={collectionSuggestions.sizes}
                        isAiFilled={aiFilledFields.has('size')}
                      />
                      <SuggestiveInput 
                        label="Gráfica" 
                        icon={Printer} 
                        value={formData.printer || ''} 
                        onChange={v => updateField('printer', v)}
                        suggestions={collectionSuggestions.printers}
                        isAiFilled={aiFilledFields.has('printer')}
                      />
                   </div>

                   <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-800 space-y-4">
                      <label className="text-[10px] text-slate-500 font-black uppercase mb-1 flex items-center justify-between gap-1">
                         <span className="flex items-center gap-1"><ScanLine className="w-3 h-3 text-cyan-400"/> Linhas (Cor da Série/Segurança)</span>
                         {aiFilledFields.has('lines') && <Sparkles className="w-2.5 h-2.5 text-brand-500 animate-pulse" />}
                      </label>
                      <div className="flex flex-wrap gap-2">
                         {commonLines.map((line) => (
                            <button
                               key={line.value}
                               onClick={() => updateField('lines', line.label)}
                               className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold flex items-center gap-2 transition-all active:scale-95 ${formData.lines === line.label ? 'border-white bg-slate-700 text-white shadow-lg' : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500'}`}
                            >
                               <div className={`w-2 h-2 rounded-full ${line.color}`}></div>
                               {line.label}
                            </button>
                         ))}
                      </div>
                      <input 
                         type="text" 
                         value={formData.lines || ''} 
                         onChange={e => updateField('lines', e.target.value)} 
                         placeholder="Outra cor ou detalhe das linhas..." 
                         className={`w-full bg-slate-800 border rounded-xl px-4 py-2 text-white text-xs mt-2 transition-all ${aiFilledFields.has('lines') ? 'border-brand-500/50' : 'border-slate-700'}`}
                      />
                   </div>

                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                         <label className="text-[10px] text-slate-500 font-black uppercase mb-1 flex items-center gap-1 justify-between">
                            <span className="flex items-center gap-1"><Coins className="w-3 h-3 text-yellow-500"/> Tiragem</span>
                            {aiFilledFields.has('emission') && <Sparkles className="w-2.5 h-2.5 text-brand-500" />}
                         </label>
                         <input type="text" value={formData.emission || ''} onChange={e => updateField('emission', e.target.value)} className={`w-full bg-slate-800 border rounded-xl px-4 py-2.5 text-white text-sm focus:border-yellow-500 outline-none ${aiFilledFields.has('emission') ? 'border-brand-500/50' : 'border-slate-700'}`} />
                      </div>
                      <div>
                         <label className="text-[10px] text-slate-500 font-black uppercase mb-1 flex items-center gap-1 justify-between">
                            <span className="flex items-center gap-1"><Banknote className="w-3 h-3 text-green-500"/> Preço Facial</span>
                            {aiFilledFields.has('price') && <Sparkles className="w-2.5 h-2.5 text-brand-500" />}
                         </label>
                         <input type="text" value={formData.price || ''} onChange={e => updateField('price', e.target.value)} className={`w-full bg-slate-800 border rounded-xl px-4 py-2.5 text-white text-sm focus:border-green-500 outline-none ${aiFilledFields.has('price') ? 'border-brand-500/50' : 'border-slate-700'}`} />
                      </div>
                      <div>
                         <label className="text-[10px] text-slate-500 font-black uppercase mb-1 flex items-center gap-1 justify-between">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-orange-500"/> Ano Lançamento</span>
                            {aiFilledFields.has('releaseDate') && <Sparkles className="w-2.5 h-2.5 text-brand-500" />}
                         </label>
                         <input type="text" value={formData.releaseDate || ''} onChange={e => updateField('releaseDate', e.target.value)} className={`w-full bg-slate-800 border rounded-xl px-4 py-2.5 text-white text-sm focus:border-orange-500 outline-none ${aiFilledFields.has('releaseDate') ? 'border-brand-500/50' : 'border-slate-700'}`} />
                      </div>
                      <div>
                         <label className="text-[10px] text-slate-500 font-black uppercase mb-1 flex items-center gap-1 justify-between">
                            <span className="flex items-center gap-1"><Tag className="w-3 h-3 text-blue-500"/> Estado Item</span>
                            {aiFilledFields.has('state') && <Sparkles className="w-2.5 h-2.5 text-brand-500" />}
                         </label>
                         <select value={formData.state} onChange={e => updateField('state', e.target.value)} className={`w-full bg-slate-800 border rounded-xl px-4 py-2.5 text-white text-sm font-black focus:border-blue-500 outline-none cursor-pointer ${aiFilledFields.has('state') ? 'border-brand-500/50' : 'border-slate-700'}`}>
                            <option value="SC">SC (Raspada)</option>
                            <option value="MINT">MINT (Nova)</option>
                            <option value="AMOSTRA">AMOSTRA</option>
                            <option value="VOID">VOID</option>
                            <option value="SPECIMEN">SPECIMEN</option>
                            <option value="STEEKPROEF">STEEKPROEF</option>
                         </select>
                      </div>
                   </div>

                   <div>
                      <label className="text-[10px] text-slate-500 font-black uppercase mb-1 block flex items-center gap-1 justify-between">
                         <span className="flex items-center gap-1"><Info className="w-4 h-4 text-slate-400"/> Observações Técnicas do Arquivo</span>
                         {aiFilledFields.has('values') && <Sparkles className="w-2.5 h-2.5 text-brand-500 animate-pulse" />}
                      </label>
                      <textarea 
                        value={formData.values || ''} 
                        onChange={e => updateField('values', e.target.value)} 
                        className={`w-full bg-slate-800 border rounded-2xl p-4 text-white text-sm h-28 focus:border-brand-500 outline-none resize-none leading-relaxed shadow-inner transition-all ${aiFilledFields.has('values') ? 'border-brand-500/30' : 'border-slate-700'}`} 
                        placeholder="Adicione detalhes históricos, curiosidades ou notas sobre esta peça específica..."
                      />
                   </div>
                </div>
             </div>
          </div>

          <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end gap-3 shrink-0">
             <button onClick={onClose} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors">Descartar</button>
             <button onClick={handleSave} disabled={isSaving} className="px-10 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-black flex items-center gap-2 shadow-lg active:scale-95 transition-all shadow-brand-900/20">
                {isSaving ? <Loader2 className="animate-spin w-4 h-4"/> : <Check className="w-4 h-4"/>}
                Confirmar e Arquivar Item
             </button>
          </div>
       </div>
    </div>
  );
};
