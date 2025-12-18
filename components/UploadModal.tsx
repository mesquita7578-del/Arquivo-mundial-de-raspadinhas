
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  X, Upload, Sparkles, Check, Loader2, ArrowLeft, 
  Image as ImageIcon, ScanLine, Star, Hash, Globe, 
  Printer, Ruler, Banknote, Clock, Info, MapPin, 
  Building2, Layers, User, Palette, Activity
} from 'lucide-react';
import { ScratchcardData, Category, ScratchcardState, LineType } from '../types';
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

export const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUploadComplete, existingImages, initialFile, currentUser, t }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<ScratchcardData>>({
    category: 'raspadinha',
    state: 'SC',
    continent: 'Europa',
    country: 'Portugal',
    operator: '',
    lines: 'none',
    gameNumber: '',
    size: '10x15cm',
    printer: '',
    price: '',
    collector: currentUser || 'Jorge Mesquita',
    releaseDate: new Date().getFullYear().toString()
  });

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(() => {
    const unique = (arr: any[]) => Array.from(new Set(arr.filter(Boolean)));
    return {
      gameNames: unique(existingImages.map(img => img.gameName)),
      countries: unique(existingImages.map(img => img.country)),
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
    try {
      const frontBase64 = frontPreview.split(',')[1];
      const backBase64 = backPreview ? backPreview.split(',')[1] : null;
      const result = await analyzeImage(frontBase64, backBase64, frontFile.type);
      
      const countryCode = (result.country || 'PT').substring(0, 2).toUpperCase();
      const generatedId = `${countryCode}-${Math.floor(10000 + Math.random() * 89999)}`;

      setFormData(prev => ({ ...prev, ...result, customId: generatedId, aiGenerated: true }));
      setStep(2);
    } catch (err) {
      setStep(2);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!formData.gameName || !formData.country) return;
    setIsSaving(true);
    const timestamp = Date.now();
    const newItem: ScratchcardData = {
      id: timestamp.toString(),
      customId: formData.customId || `ID-${timestamp}`,
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
      continent: formData.continent || 'Europa',
      category: formData.category || 'raspadinha',
      operator: formData.operator || '',
      printer: formData.printer || '',
      lines: formData.lines || 'none',
      collector: formData.collector || currentUser || 'Jorge Mesquita',
      aiGenerated: formData.aiGenerated || false,
      createdAt: timestamp,
      owners: currentUser ? [currentUser] : []
    };

    try {
      await storageService.save(newItem);
      onUploadComplete(newItem);
      onClose();
    } catch (err) {
      setIsSaving(false);
    }
  };

  if (step === 1) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-8 shadow-2xl relative">
           <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X className="w-6 h-6"/></button>
           <h2 className="text-2xl font-black text-white mb-8 italic uppercase tracking-tighter flex items-center gap-3">
             <Upload className="w-6 h-6 text-brand-500"/> Arquivar Item
           </h2>
           <div className="grid grid-cols-2 gap-4 mb-8">
              <div onClick={() => frontInputRef.current?.click()} className="aspect-square border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 transition-all relative overflow-hidden bg-slate-950">
                {frontPreview ? <img src={frontPreview} className="absolute inset-0 w-full h-full object-contain" /> : <><ImageIcon className="w-8 h-8 text-slate-700 mb-2"/><span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Frente</span></>}
                <input type="file" ref={frontInputRef} className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleFrontSelect(e.target.files[0])} />
              </div>
              <div onClick={() => backInputRef.current?.click()} className="aspect-square border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 transition-all relative overflow-hidden bg-slate-950">
                {backPreview ? <img src={backPreview} className="absolute inset-0 w-full h-full object-contain" /> : <><ImageIcon className="w-8 h-8 text-slate-700 mb-2"/><span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Verso</span></>}
                <input type="file" ref={backInputRef} className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleBackSelect(e.target.files[0])} />
              </div>
           </div>
           <button onClick={processImage} disabled={!frontFile || isAnalyzing} className="w-full bg-brand-600 hover:bg-brand-500 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-xl disabled:opacity-50">
             {isAnalyzing ? <Loader2 className="animate-spin w-5 h-5"/> : <Sparkles className="w-5 h-5"/>}
             {isAnalyzing ? "CHLOE A ANALISAR..." : "PEDIR ANÁLISE À CHLOE"}
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
       <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl h-[90vh] shadow-2xl flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
             <div className="flex items-center gap-4">
               <button onClick={() => setStep(1)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"><ArrowLeft className="w-6 h-6"/></button>
               <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Confirmar Registo</h2>
             </div>
             <button onClick={onClose} className="text-slate-500 hover:text-white"><X className="w-6 h-6"/></button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-950/20">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-4">
                   <img src={frontPreview || ''} className="w-full rounded-2xl shadow-2xl border border-slate-800" />
                   {backPreview && <img src={backPreview} className="w-full rounded-2xl shadow-2xl border border-slate-800" />}
                </div>

                <div className="space-y-6">
                   <div className="space-y-4">
                      <label className="block">
                         <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-1">Nome do Jogo</span>
                         <input list="game-names" type="text" value={formData.gameName} onChange={e => setFormData({...formData, gameName: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-brand-500 transition-all" />
                      </label>
                      <label className="block">
                         <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-1">Colecionador</span>
                         <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input list="collectors" type="text" value={formData.collector} onChange={e => setFormData({...formData, collector: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-white outline-none focus:border-brand-500 transition-all" />
                         </div>
                      </label>
                      
                      {/* SELETOR DE ESTADO FÍSICO */}
                      <div className="space-y-3">
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-1 flex items-center gap-2">
                          <Activity className="w-3.5 h-3.5 text-blue-500" /> Estado do Exemplar
                        </span>
                        <div className="flex flex-wrap gap-2 p-3 bg-slate-800/50 rounded-2xl border border-slate-700/50 shadow-inner">
                           {STATE_OPTIONS.map(opt => (
                              <button
                                key={opt.id}
                                onClick={() => setFormData({...formData, state: opt.id})}
                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter border transition-all ${formData.state === opt.id ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300'}`}
                              >
                                 {opt.label}
                              </button>
                           ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <label>
                           <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-1">País</span>
                           <input list="countries" type="text" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-brand-500 transition-all" />
                        </label>
                        <label>
                           <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-1">Entidade (Operador)</span>
                           <input list="operators" type="text" value={formData.operator} onChange={e => setFormData({...formData, operator: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-brand-500 transition-all" />
                        </label>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-1 flex items-center gap-2">
                          <Palette className="w-3 h-3 text-brand-500" /> Linhas de Segurança (Cores)
                        </span>
                        <div className="flex flex-wrap gap-2.5 p-3 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                          {LINE_COLORS.map(color => (
                            <button
                              key={color.id}
                              onClick={() => setFormData({...formData, lines: color.id})}
                              className={`w-10 h-10 rounded-full ${color.bg} border-2 transition-all relative group flex items-center justify-center ${formData.lines === color.id ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'}`}
                              title={color.label}
                            >
                              {formData.lines === color.id && <Check className="w-5 h-5 text-white drop-shadow-md" />}
                              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[7px] font-black uppercase tracking-widest text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{color.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <label>
                           <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-1">Nº Jogo</span>
                           <input type="text" value={formData.gameNumber} onChange={e => setFormData({...formData, gameNumber: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-brand-500 transition-all" />
                        </label>
                        <label>
                           <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-1">Ano</span>
                           <input list="years" type="text" value={formData.releaseDate} onChange={e => setFormData({...formData, releaseDate: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-brand-500 transition-all" />
                        </label>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <label>
                           <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-1">Preço</span>
                           <input type="text" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-brand-500 transition-all" />
                        </label>
                        <label>
                           <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-1">Gráfica</span>
                           <input list="printers" type="text" value={formData.printer} onChange={e => setFormData({...formData, printer: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-brand-500 transition-all" />
                        </label>
                      </div>
                      <textarea value={formData.values} onChange={e => setFormData({...formData, values: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white text-sm h-32 outline-none italic transition-all focus:border-brand-500 shadow-inner" placeholder="Notas do Arquivo..." />
                   </div>
                </div>
             </div>
          </div>

          <div className="p-6 border-t border-slate-800 bg-slate-900 flex justify-end gap-4 shrink-0">
             <button onClick={onClose} className="px-8 py-3 bg-slate-800 text-slate-400 rounded-xl font-black text-xs uppercase hover:text-white transition-all">Cancelar</button>
             <button onClick={handleSave} disabled={isSaving} className="px-12 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-black flex items-center gap-2 shadow-2xl active:scale-95 transition-all">
                {isSaving ? <Loader2 className="animate-spin w-5 h-5"/> : <Check className="w-5 h-5"/>}
                Confirmar Registo
             </button>
          </div>
       </div>

       <datalist id="game-names">{suggestions.gameNames.map(val => <option key={val} value={val} />)}</datalist>
       <datalist id="collectors">{suggestions.collectors.map(val => <option key={val} value={val} />)}</datalist>
       <datalist id="countries">{suggestions.countries.map(val => <option key={val} value={val} />)}</datalist>
       <datalist id="operators">{suggestions.operators.map(val => <option key={val} value={val} />)}</datalist>
       <datalist id="printers">{suggestions.printers.map(val => <option key={val} value={val} />)}</datalist>
       <datalist id="years">{suggestions.years.map(val => <option key={val} value={val} />)}</datalist>
    </div>
  );
};
