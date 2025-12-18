
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  X, Upload, Sparkles, Check, Loader2, ArrowLeft, 
  Image as ImageIcon, ScanLine, Star, Hash, Globe, 
  Printer, Ruler, Banknote, Clock, Info, MapPin, 
  Building2, Layers
} from 'lucide-react';
import { ScratchcardData, Category, ScratchcardState } from '../types';
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
    lines: '',
    gameNumber: '',
    size: '10x15cm',
    printer: '',
    price: '',
    releaseDate: new Date().getFullYear().toString()
  });

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

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
      lines: formData.lines || '',
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
                         <input type="text" value={formData.gameName} onChange={e => setFormData({...formData, gameName: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white font-bold" />
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <label>
                           <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-1">País</span>
                           <input type="text" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white" />
                        </label>
                        <label>
                           <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-1">Entidade (Operador)</span>
                           <input type="text" value={formData.operator} onChange={e => setFormData({...formData, operator: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white" />
                        </label>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <label>
                           <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-1">Nº Jogo</span>
                           <input type="text" value={formData.gameNumber} onChange={e => setFormData({...formData, gameNumber: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white" />
                        </label>
                        <label>
                           <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-1">Ano</span>
                           <input type="text" value={formData.releaseDate} onChange={e => setFormData({...formData, releaseDate: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white" />
                        </label>
                        <label>
                           <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-1">Linhas</span>
                           <input type="text" value={formData.lines} onChange={e => setFormData({...formData, lines: e.target.value})} placeholder="Ex: azul" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white" />
                        </label>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <label>
                           <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-1">Preço</span>
                           <input type="text" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white" />
                        </label>
                        <label>
                           <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-1">Gráfica</span>
                           <input type="text" value={formData.printer} onChange={e => setFormData({...formData, printer: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white" />
                        </label>
                      </div>
                      <textarea value={formData.values} onChange={e => setFormData({...formData, values: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white text-sm h-32 outline-none italic" placeholder="Notas do Arquivo..." />
                   </div>
                </div>
             </div>
          </div>

          <div className="p-6 border-t border-slate-800 bg-slate-900 flex justify-end gap-4">
             <button onClick={onClose} className="px-8 py-3 bg-slate-800 text-slate-400 rounded-xl font-black text-xs uppercase hover:text-white transition-all">Cancelar</button>
             <button onClick={handleSave} disabled={isSaving} className="px-12 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-black flex items-center gap-2 shadow-2xl active:scale-95 transition-all">
                {isSaving ? <Loader2 className="animate-spin w-5 h-5"/> : <Check className="w-5 h-5"/>}
                Confirmar Registo
             </button>
          </div>
       </div>
    </div>
  );
};
