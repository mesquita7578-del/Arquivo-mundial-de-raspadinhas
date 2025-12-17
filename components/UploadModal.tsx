import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Sparkles, AlertCircle, Check, Loader2, AlignJustify, ArrowLeft, Image as ImageIcon, ScanLine, DollarSign, Calendar, MapPin, Globe, Printer, Layers, Maximize2, Plus, Heart } from 'lucide-react';
import { ScratchcardData, Category, LineType } from '../types';
import { analyzeImage } from '../services/geminiService';

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
    lines: 'none',
    aiGenerated: false
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

    // 1. GERAR O ID IMEDIATAMENTE (Passo Crítico para o Jorge)
    const randomNum = Math.floor(1000 + Math.random() * 8999);
    const generatedId = `RASP-PT-${randomNum}`;
    
    // Já guardamos o ID no formulário para ele estar lá aconteça o que acontecer
    setFormData(prev => ({ ...prev, customId: generatedId }));

    try {
      const frontBase64 = frontPreview.split(',')[1];
      const backBase64 = backPreview ? backPreview.split(',')[1] : null;
      const mime = frontFile.type || "image/jpeg";
      
      const result = await analyzeImage(frontBase64, backBase64, mime);
      
      if (result.gameName === "") {
        setAiStatus('failed'); // IA não conseguiu ler bem
      } else {
        setAiStatus('success');
      }

      setFormData(prev => ({
        ...prev,
        ...result,
        customId: generatedId, // Mantemos o ID que gerámos
        aiGenerated: true
      }));

    } catch (err) {
      console.error("Erro na Chloe:", err);
      setAiStatus('failed');
      // Não mudamos nada, deixamos o ID e os defaults de Portugal
    } finally {
      setIsAnalyzing(false);
      setStep(2); // Avançamos SEMPRE, erro ou não
    }
  };

  const updateField = (field: keyof ScratchcardData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!formData.gameName || !formData.country) {
      setError("Por favor, dê um nome ao jogo (ex: Pé de Meia).");
      return;
    }

    setIsSaving(true);
    const timestamp = Date.now();
    
    const newItem: ScratchcardData = {
      id: timestamp.toString(),
      customId: formData.customId || `RASP-PT-${Math.floor(Math.random() * 1000)}`,
      frontUrl: frontPreview || '',
      backUrl: backPreview || undefined,
      gameName: formData.gameName || 'Sem Nome',
      gameNumber: formData.gameNumber || '000',
      releaseDate: formData.releaseDate || new Date().toISOString().split('T')[0],
      size: formData.size || '10x15cm',
      values: formData.values || '',
      price: formData.price,
      state: (formData.state as any) || 'SC',
      country: formData.country || 'Portugal',
      continent: formData.continent || 'Europa',
      category: formData.category || 'raspadinha',
      collector: currentUser || 'Jorge Mesquita',
      aiGenerated: formData.aiGenerated || false,
      createdAt: timestamp,
      owners: currentUser ? [currentUser] : []
    };

    onUploadComplete(newItem);
    onClose();
  };

  if (step === 1) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl relative p-6">
           <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
           <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
             <Upload className="w-5 h-5 text-brand-500"/> {t.title}
           </h2>

           <div className="grid grid-cols-2 gap-4 mb-6">
              <div onClick={() => frontInputRef.current?.click()} className="aspect-square border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 transition-all relative overflow-hidden bg-slate-800/50">
                {frontPreview ? <img src={frontPreview} className="absolute inset-0 w-full h-full object-contain" /> : <><ImageIcon className="w-8 h-8 text-slate-600 mb-2"/><span className="text-[10px] text-slate-500 font-bold uppercase">Frente</span></>}
                <input type="file" ref={frontInputRef} className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleFrontSelect(e.target.files[0])} />
              </div>
              <div onClick={() => backInputRef.current?.click()} className="aspect-square border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 transition-all relative overflow-hidden bg-slate-800/50">
                {backPreview ? <img src={backPreview} className="absolute inset-0 w-full h-full object-contain" /> : <><ImageIcon className="w-8 h-8 text-slate-600 mb-2"/><span className="text-[10px] text-slate-500 font-bold uppercase">Verso</span></>}
                <input type="file" ref={backInputRef} className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleBackSelect(e.target.files[0])} />
              </div>
           </div>

           <button 
             onClick={processImage} 
             disabled={!frontFile || isAnalyzing} 
             className="w-full bg-brand-600 hover:bg-brand-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-brand-900/40 disabled:opacity-50"
           >
             {isAnalyzing ? <Loader2 className="animate-spin w-5 h-5"/> : <Sparkles className="w-5 h-5"/>}
             {isAnalyzing ? "A Chloe está a ler..." : "Pedir à Chloe para Catalogar"}
           </button>
           
           <p className="mt-4 text-[10px] text-slate-500 text-center uppercase tracking-widest font-bold">
             A Chloe ajuda-te a preencher os dados automaticamente
           </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
       <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl h-[90vh] shadow-2xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
             <div className="flex items-center gap-3">
               <button onClick={() => setStep(1)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"><ArrowLeft className="w-5 h-5"/></button>
               <h2 className="text-lg font-bold text-white tracking-tight">Revisão do Arquivo</h2>
             </div>
             <button onClick={onClose} className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-full"><X className="w-5 h-5"/></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
             
             {/* Mensagem da Chloe se falhou */}
             {aiStatus === 'failed' && (
                <div className="mb-6 bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl flex items-center gap-4 animate-bounce-in">
                   <div className="bg-blue-500 p-2 rounded-full"><Heart className="w-4 h-4 text-white fill-white"/></div>
                   <div>
                      <p className="text-white font-bold text-sm">Olá Jorge! A imagem está um pouco difícil de ler...</p>
                      <p className="text-blue-300 text-xs">Mas não faz mal! Já te dei um ID novo. Só tens de escrever o nome do jogo.</p>
                   </div>
                </div>
             )}

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Previews */}
                <div className="space-y-4">
                   <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 shadow-inner">
                      <p className="text-[10px] font-bold text-slate-600 uppercase mb-2">Frente</p>
                      <img src={frontPreview || ''} className="w-full rounded-lg shadow-lg" />
                   </div>
                   {backPreview && (
                      <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 shadow-inner">
                         <p className="text-[10px] font-bold text-slate-600 uppercase mb-2">Verso</p>
                         <img src={backPreview} className="w-full rounded-lg shadow-lg" />
                      </div>
                   )}
                </div>

                {/* Form Fields */}
                <div className="md:col-span-2 space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">ID no Arquivo</label>
                         <div className="relative">
                            <Layers className="absolute left-3 top-3 w-4 h-4 text-brand-500" />
                            <input type="text" value={formData.customId || ''} onChange={e => updateField('customId', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white font-mono text-sm focus:border-brand-500 outline-none" />
                         </div>
                      </div>
                      <div>
                         <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">Nome do Jogo *</label>
                         <input type="text" value={formData.gameName || ''} onChange={e => updateField('gameName', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-sm focus:border-brand-500 outline-none" placeholder="Ex: Super Pé de Meia" autoFocus />
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">País</label>
                         <div className="relative">
                            <Globe className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                            <input type="text" value={formData.country || ''} onChange={e => updateField('country', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:border-brand-500 outline-none" />
                         </div>
                      </div>
                      <div>
                         <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">Nº de Jogo</label>
                         <div className="relative">
                            <ScanLine className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                            <input type="text" value={formData.gameNumber || ''} onChange={e => updateField('gameNumber', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:border-brand-500 outline-none" />
                         </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-3 gap-4">
                      <div>
                         <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">Preço</label>
                         <div className="relative">
                            <DollarSign className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                            <input type="text" value={formData.price || ''} onChange={e => updateField('price', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm" />
                         </div>
                      </div>
                      <div>
                         <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">Estado</label>
                         <select value={formData.state || 'SC'} onChange={e => updateField('state', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-sm focus:border-brand-500 outline-none appearance-none">
                            <option value="MINT">NOVO (Intacto)</option>
                            <option value="SC">SC (Raspada)</option>
                            <option value="AMOSTRA">AMOSTRA / VOID</option>
                         </select>
                      </div>
                      <div>
                         <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">Ano</label>
                         <div className="relative">
                            <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                            <input type="text" value={formData.releaseDate || ''} onChange={e => updateField('releaseDate', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm" />
                         </div>
                      </div>
                   </div>

                   <div>
                      <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">Notas / Informação Extra</label>
                      <textarea value={formData.values || ''} onChange={e => updateField('values', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white text-sm h-32 focus:border-brand-500 outline-none resize-none" placeholder="Ex: Ganhou 10€, Série Limitada..." />
                   </div>
                </div>
             </div>
          </div>

          <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3 shrink-0">
             {error && <div className="mr-auto text-red-400 text-xs flex items-center gap-2"><AlertCircle className="w-4 h-4"/>{error}</div>}
             <button onClick={onClose} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all">Cancelar</button>
             <button onClick={handleSave} disabled={isSaving} className="px-8 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-brand-900/20 active:scale-95 transition-all">
                {isSaving ? <Loader2 className="animate-spin w-4 h-4"/> : <Check className="w-4 h-4"/>}
                Guardar no Meu Arquivo
             </button>
          </div>
       </div>
    </div>
  );
}