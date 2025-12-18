
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  X, Upload, Sparkles, AlertCircle, Check, Loader2, ArrowLeft, 
  Image as ImageIcon, ScanLine, DollarSign, Calendar, Globe, 
  Printer, Layers, Heart, Hash, Map, Gift, Trophy, Star, 
  Gem, Tag, Ruler, Banknote, Clock, Info, Coins, MapPin, 
  ChevronDown, Search, Lightbulb, Building2
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
          className={`w-full bg-slate-800/40 backdrop-blur-sm border rounded-xl px-4 py-2.5 text-white text-sm transition-all outline-none ${isAiFilled ? 'border-brand-500/50 focus:border-brand-500' : 'border-slate-700 focus:border-blue-500'}`}
          placeholder={placeholder}
        />
        {showSuggestions && filtered.length > 0 && (
          <div className="absolute z-50 left-0 right-0 mt-1 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-fade-in">
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
  const [aiFilledFields, setAiFilledFields] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState<Partial<ScratchcardData>>({
    category: 'raspadinha',
    state: 'SC',
    continent: 'Europa',
    country: 'Portugal',
    operator: '',
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

  const collectionSuggestions = useMemo(() => {
    const suggestions = {
      countries: new Set<string>(),
      regions: new Set<string>(),
      printers: new Set<string>(),
      operators: new Set<string>(),
      sizes: new Set<string>(),
      gameNames: new Set<string>()
    };
    
    existingImages.forEach(img => {
      if (img.country) suggestions.countries.add(img.country);
      if (img.region) suggestions.regions.add(img.region);
      if (img.printer) suggestions.printers.add(img.printer);
      if (img.operator) suggestions.operators.add(img.operator);
      if (img.size) suggestions.sizes.add(img.size);
      if (img.gameName) suggestions.gameNames.add(img.gameName);
    });

    return {
      countries: Array.from(suggestions.countries).sort(),
      regions: Array.from(suggestions.regions).sort(),
      printers: Array.from(suggestions.printers).sort(),
      operators: Array.from(suggestions.operators).sort(),
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
        'Brasil': 'BR', 'EUA': 'US', 'Estados Unidos': 'US', 'Argentina': 'AR'
      };
      
      const countryCode = initialsMap[countryStr] || countryStr.substring(0, 2).toUpperCase();
      const randomNum = Math.floor(10000 + Math.random() * 89999);
      let generatedId = `${countryCode}-${randomNum}`;

      const detected = new Set<string>();
      Object.keys(result).forEach(key => {
        if ((result as any)[key]) detected.add(key);
      });
      setAiFilledFields(detected);

      setFormData(prev => ({ ...prev, ...result, customId: generatedId, aiGenerated: true }));
      setStep(2);
    } catch (err) {
      console.error("Erro na Chloe:", err);
      setStep(2);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateField = (field: keyof ScratchcardData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (aiFilledFields.has(field)) {
      const newSet = new Set(aiFilledFields);
      newSet.delete(field);
      setAiFilledFields(newSet);
    }
  };

  const handleSave = async () => {
    if (!formData.gameName || !formData.country) {
      setError("Nome e País são obrigatórios!");
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
      operator: formData.operator || '',
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

  if (step === 1) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl relative p-6">
           <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"><X className="w-5 h-5"/></button>
           <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 italic uppercase tracking-tighter">
             <Upload className="w-5 h-5 text-brand-500"/> Arquivar Novo Item
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
              className="w-full bg-brand-600 hover:bg-brand-500 text-white py-4 rounded-xl font-black flex items-center justify-center gap-3 transition-all shadow-lg shadow-brand-900/40 disabled:opacity-50"
             >
               {isAnalyzing ? <Loader2 className="animate-spin w-5 h-5"/> : <Sparkles className="w-5 h-5"/>}
               {isAnalyzing ? "CHLOE A ANALISAR..." : "ATIVAR CHLOE ANALISTA"}
             </button>
             <button 
              onClick={() => setStep(2)} 
              disabled={!frontFile || isAnalyzing}
              className="w-full bg-slate-800/40 border border-slate-700 text-slate-300 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
             >
               Registo Manual Rebelde
             </button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
       <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-6xl h-[95vh] shadow-2xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md">
             <div className="flex items-center gap-3">
               <button onClick={() => setStep(1)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"><ArrowLeft className="w-5 h-5"/></button>
               <h2 className="text-lg font-black text-white italic uppercase tracking-tighter flex items-center gap-2">
                 <ScanLine className="w-5 h-5 text-brand-500" /> Confirmação de Registo
               </h2>
             </div>
             <div className="flex items-center gap-4">
                <div className="bg-blue-600/10 border border-blue-500/20 px-3 py-1 rounded-full flex items-center gap-2">
                   <Clock className="w-3 h-3 text-blue-400" />
                   <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Registo: {new Date().toLocaleDateString()}</span>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-full"><X className="w-5 h-5"/></button>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-950/20">
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-4">
                   <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                      <img src={frontPreview || ''} className="w-full rounded-lg shadow-2xl grayscale hover:grayscale-0 transition-all duration-500" />
                   </div>
                   {backPreview && (
                      <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                         <img src={backPreview} className="w-full rounded-lg shadow-2xl grayscale hover:grayscale-0 transition-all duration-500" />
                      </div>
                   )}
                </div>

                <div className="lg:col-span-8 space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                         <SuggestiveInput 
                            label="Nome do Jogo *" 
                            icon={Star} 
                            value={formData.gameName || ''} 
                            onChange={v => updateField('gameName', v)}
                            suggestions={collectionSuggestions.gameNames}
                            isAiFilled={aiFilledFields.has('gameName')}
                         />
                      </div>
                      <div>
                         <label className="text-[10px] text-slate-500 font-black uppercase mb-1 flex items-center gap-1"><Hash className="w-3 h-3 text-brand-500"/> ID Arquivo</label>
                         <input type="text" value={formData.customId || ''} onChange={e => updateField('customId', e.target.value)} className="w-full bg-slate-800/40 border border-slate-700 rounded-xl px-4 py-3 text-brand-400 font-black text-sm outline-none" />
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <SuggestiveInput 
                        label="Casa do Jogo (Operador)" 
                        icon={Building2} 
                        value={formData.operator || ''} 
                        onChange={v => updateField('operator', v)}
                        suggestions={collectionSuggestions.operators}
                        placeholder="Ex: SCML, SWISSLOS, ONCE"
                        isAiFilled={aiFilledFields.has('operator')}
                      />
                      <SuggestiveInput 
                        label="País" 
                        icon={Globe} 
                        value={formData.country || ''} 
                        onChange={v => updateField('country', v)}
                        suggestions={collectionSuggestions.countries}
                        isAiFilled={aiFilledFields.has('country')}
                      />
                   </div>

                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <SuggestiveInput 
                        label="Região / Ilha" 
                        icon={MapPin} 
                        value={formData.region || ''} 
                        onChange={v => updateField('region', v)}
                        suggestions={collectionSuggestions.regions}
                        isAiFilled={aiFilledFields.has('region')}
                      />
                      <div>
                         <label className="text-[10px] text-slate-500 font-black uppercase mb-1 block">Nº Jogo</label>
                         <input type="text" value={formData.gameNumber || ''} onChange={e => updateField('gameNumber', e.target.value)} className="w-full bg-slate-800/40 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm font-black" />
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
                        label="Gráfica (Impressor)" 
                        icon={Printer} 
                        value={formData.printer || ''} 
                        onChange={v => updateField('printer', v)}
                        suggestions={collectionSuggestions.printers}
                        isAiFilled={aiFilledFields.has('printer')}
                      />
                   </div>

                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                         <label className="text-[10px] text-slate-500 font-black uppercase mb-1">Tiragem</label>
                         <input type="text" value={formData.emission || ''} onChange={e => updateField('emission', e.target.value)} className="w-full bg-slate-800/40 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm font-black" />
                      </div>
                      <div>
                         <label className="text-[10px] text-slate-500 font-black uppercase mb-1">Preço Facial</label>
                         <input type="text" value={formData.price || ''} onChange={e => updateField('price', e.target.value)} className="w-full bg-slate-800/40 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm font-black" />
                      </div>
                      <div>
                         <label className="text-[10px] text-slate-500 font-black uppercase mb-1">Ano Lançamento</label>
                         <input type="text" value={formData.releaseDate || ''} onChange={e => updateField('releaseDate', e.target.value)} className="w-full bg-slate-800/40 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm font-black" />
                      </div>
                      <div>
                         <label className="text-[10px] text-slate-500 font-black uppercase mb-1">Estado</label>
                         <select value={formData.state} onChange={e => updateField('state', e.target.value)} className="w-full bg-slate-800/40 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-xs font-black uppercase">
                            <option value="SC">SC (Raspada)</option>
                            <option value="MINT">MINT (Nova)</option>
                            <option value="AMOSTRA">AMOSTRA</option>
                            <option value="VOID">VOID</option>
                         </select>
                      </div>
                   </div>

                   <textarea 
                    value={formData.values || ''} 
                    onChange={e => updateField('values', e.target.value)} 
                    className="w-full bg-slate-800/30 border border-slate-800 rounded-2xl p-4 text-white text-sm h-28 outline-none resize-none italic" 
                    placeholder="Notas curtas do arquivo..."
                   />
                </div>
             </div>
          </div>

          <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end gap-3 shrink-0">
             <button onClick={onClose} className="px-6 py-2.5 bg-slate-800 text-slate-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:text-white transition-all">Cancelar</button>
             <button onClick={handleSave} disabled={isSaving} className="px-10 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-black flex items-center gap-2 shadow-2xl active:scale-95 transition-all">
                {isSaving ? <Loader2 className="animate-spin w-4 h-4"/> : <Check className="w-4 h-4"/>}
                Confirmar e Arquivar
             </button>
          </div>
       </div>
    </div>
  );
};
