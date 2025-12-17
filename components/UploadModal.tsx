import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Sparkles, AlertCircle, Check, Loader2, ArrowLeft, Image as ImageIcon, ScanLine, DollarSign, Calendar, Globe, Printer, Layers, Heart, Hash, Map, Gift, Trophy, Star, Gem, Tag } from 'lucide-react';
import { ScratchcardData, Category, LineType } from '../types';
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
  const [aiStatus, setAiStatus] = useState<'idle' | 'success' | 'failed'>('idle');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<ScratchcardData>>({
    category: 'raspadinha',
    state: 'SC',
    continent: 'Europa',
    country: 'Portugal',
    region: '',
    lines: 'none',
    aiGenerated: false,
    isRarity: false,
    isSeries: false,
    isPromotional: false,
    isWinner: false
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
    setError(null);
    setAiStatus('idle');

    try {
      const frontBase64 = frontPreview.split(',')[1];
      const backBase64 = backPreview ? backPreview.split(',')[1] : null;
      const mime = frontFile.type || "image/jpeg";
      
      const result = await analyzeImage(frontBase64, backBase64, mime);
      
      // Geração de ID Automática Padrão PT-00001 (Jorge Style)
      const countryCode = result.country?.substring(0, 2).toUpperCase() || 'PT';
      const randomNum = Math.floor(10000 + Math.random() * 89999);
      let generatedId = `${countryCode}-${randomNum}`;

      setAiStatus(result.gameName === "" ? 'failed' : 'success');

      setFormData(prev => ({
        ...prev,
        ...result,
        customId: generatedId,
        aiGenerated: true
      }));

    } catch (err) {
      console.error("Erro na Chloe:", err);
      setAiStatus('failed');
    } finally {
      setIsAnalyzing(false);
      setStep(2);
    }
  };

  const updateField = (field: keyof ScratchcardData, value: any) => {
    if (field === 'isSeries' && value === true && !formData.customId?.includes('-0')) {
       setFormData(prev => ({ ...prev, [field]: value, customId: `${prev.customId}-01` }));
    } else {
       setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = async () => {
    if (!formData.gameName || !formData.country) {
      setError("Por favor, dê um nome ao jogo e selecione o país.");
      return;
    }

    setIsSaving(true);
    const timestamp = Date.now();
    
    const newItem: ScratchcardData = {
      id: timestamp.toString(),
      customId: formData.customId || `ID-${Math.floor(Math.random() * 100000)}`,
      frontUrl: frontPreview || '',
      backUrl: backPreview || undefined,
      gameName: formData.gameName || 'Sem Nome',
      gameNumber: formData.gameNumber || '000',
      releaseDate: formData.releaseDate || new Date().getFullYear().toString(),
      size: formData.size || '10x15cm',
      values: formData.values || '',
      price: formData.price,
      state: (formData.state as any) || 'SC',
      country: formData.country || 'Portugal',
      region: formData.region || '',
      continent: formData.continent || 'Europa',
      category: formData.category || 'raspadinha',
      lines: formData.lines || 'none',
      emission: formData.emission || '',
      printer: formData.printer || '',
      isRarity: formData.isRarity || false,
      isSeries: formData.isSeries || false,
      isPromotional: formData.isPromotional || false,
      isWinner: formData.isWinner || false,
      prizeAmount: formData.prizeAmount || '',
      seriesDetails: formData.seriesDetails || '',
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
      console.error("Erro ao gravar:", err);
      setError("Erro ao gravar na base de dados local.");
      setIsSaving(false);
    }
  };

  if (step === 1) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl relative p-6">
           <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
           <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
             <Upload className="w-5 h-5 text-brand-500"/> Catalogar Novo Item
           </h2>

           <div className="grid grid-cols-2 gap-4 mb-6">
              <div onClick={() => frontInputRef.current?.click()} className="aspect-square border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 transition-all relative overflow-hidden bg-slate-800/50">
                {frontPreview ? <img src={frontPreview} className="absolute inset-0 w-full h-full object-contain" /> : <><ImageIcon className="w-8 h-8 text-slate-600 mb-2"/><span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Frente *</span></>}
                <input type="file" ref={frontInputRef} className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleFrontSelect(e.target.files[0])} />
              </div>
              <div onClick={() => backInputRef.current?.click()} className="aspect-square border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 transition-all relative overflow-hidden bg-slate-800/50">
                {backPreview ? <img src={backPreview} className="absolute inset-0 w-full h-full object-contain" /> : <><ImageIcon className="w-8 h-8 text-slate-600 mb-2"/><span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Verso</span></>}
                <input type="file" ref={backInputRef} className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleBackSelect(e.target.files[0])} />
              </div>
           </div>

           <button onClick={processImage} disabled={!frontFile || isAnalyzing} className="w-full bg-brand-600 hover:bg-brand-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-brand-900/40 disabled:opacity-50">
             {isAnalyzing ? <Loader2 className="animate-spin w-5 h-5"/> : <Sparkles className="w-5 h-5"/>}
             {isAnalyzing ? "A Chloe está a ler..." : "Análise Inteligente da Chloe"}
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
       <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl h-[95vh] shadow-2xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur">
             <div className="flex items-center gap-3">
               <button onClick={() => setStep(1)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"><ArrowLeft className="w-5 h-5"/></button>
               <h2 className="text-lg font-bold text-white tracking-tight">Revisão do Registo</h2>
             </div>
             <button onClick={onClose} className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-full"><X className="w-5 h-5"/></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-3 space-y-4">
                   <div className="bg-slate-950 p-2 rounded-2xl border border-slate-800 shadow-inner">
                      <p className="text-[10px] font-bold text-slate-600 uppercase mb-2 ml-1">Frente</p>
                      <img src={frontPreview || ''} className="w-full rounded-xl shadow-lg border border-white/5" />
                   </div>
                   {backPreview && (
                      <div className="bg-slate-950 p-2 rounded-2xl border border-slate-800 shadow-inner">
                         <p className="text-[10px] font-bold text-slate-600 uppercase mb-2 ml-1">Verso</p>
                         <img src={backPreview} className="w-full rounded-xl shadow-lg border border-white/5" />
                      </div>
                   )}
                </div>

                <div className="lg:col-span-9 space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                         <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 flex items-center gap-1"><Hash className="w-3 h-3"/> ID Arquivo</label>
                         <input type="text" value={formData.customId || ''} onChange={e => updateField('customId', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-brand-400 font-mono text-sm focus:border-brand-500 outline-none font-bold" />
                      </div>
                      <div className="md:col-span-2">
                         <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500"/> Nome do Jogo *</label>
                         <input type="text" value={formData.gameName || ''} onChange={e => updateField('gameName', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-brand-500 outline-none" />
                      </div>
                   </div>

                   <div className="bg-slate-800/30 p-4 rounded-2xl border border-slate-800">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                         <div className="flex flex-col gap-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                               <input type="checkbox" checked={formData.isSeries} onChange={e => updateField('isSeries', e.target.checked)} className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600" />
                               <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><Layers className="w-3 h-3 text-indigo-500"/> É Membro de Série?</span>
                            </label>
                            {formData.isSeries && <p className="text-[8px] text-indigo-400 uppercase font-black">Modo Panorama Ativado</p>}
                         </div>
                         <div className="flex flex-col gap-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                               <input type="checkbox" checked={formData.isRarity} onChange={e => updateField('isRarity', e.target.checked)} className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-brand-600" />
                               <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><Gem className="w-3 h-3 text-gold-500"/> Raridade</span>
                            </label>
                         </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                         <label className="text-[10px] text-slate-500 font-bold uppercase mb-1">País</label>
                         <input type="text" value={formData.country || ''} onChange={e => updateField('country', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm" />
                      </div>
                      <div>
                         <label className="text-[10px] text-slate-500 font-bold uppercase mb-1">Nº Jogo</label>
                         <input type="text" value={formData.gameNumber || ''} onChange={e => updateField('gameNumber', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm font-mono" />
                      </div>
                      <div className="md:col-span-2">
                         <label className="text-[10px] text-slate-500 font-bold uppercase mb-1">Gráfica</label>
                         <input type="text" value={formData.printer || ''} onChange={e => updateField('printer', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm" />
                      </div>
                   </div>

                   <div>
                      <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">Observações do Arquivo</label>
                      <textarea value={formData.values || ''} onChange={e => updateField('values', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-white text-sm h-24 focus:border-brand-500 outline-none resize-none" />
                   </div>
                </div>
             </div>
          </div>

          <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end gap-3 shrink-0">
             <button onClick={onClose} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold">Cancelar</button>
             <button onClick={handleSave} disabled={isSaving} className="px-8 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg active:scale-95 transition-all">
                {isSaving ? <Loader2 className="animate-spin w-4 h-4"/> : <Check className="w-4 h-4"/>}
                Confirmar Registo
             </button>
          </div>
       </div>
    </div>
  );
}