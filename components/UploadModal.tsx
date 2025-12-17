
import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Sparkles, AlertCircle, Check, Loader2, ArrowLeft, Image as ImageIcon, ScanLine, DollarSign, Calendar, Globe, Printer, Layers, Heart, Hash, Map, Gift, Trophy, Star, Gem, Tag, Ruler, Banknote, Clock, Info, Coins, MapPin } from 'lucide-react';
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
    try {
      const frontBase64 = frontPreview.split(',')[1];
      const backBase64 = backPreview ? backPreview.split(',')[1] : null;
      const mime = frontFile.type || "image/jpeg";
      const result = await analyzeImage(frontBase64, backBase64, mime);
      
      const countryStr = result.country || 'Portugal';
      const initialsMap: Record<string, string> = {
        'Portugal': 'PT', 'Espanha': 'ES', 'Itália': 'IT', 'França': 'FR',
        'Brasil': 'BR', 'EUA': 'US', 'EUA (USA)': 'US', 'Estados Unidos': 'US',
        'Alemanha': 'DE', 'Japão': 'JP', 'Reino Unido': 'UK', 'China': 'CN',
        'Suíça': 'CH', 'Áustria': 'AT', 'Bélgica': 'BE', 'Luxemburgo': 'LU'
      };
      
      const countryCode = initialsMap[countryStr] || countryStr.substring(0, 2).toUpperCase();
      const randomNum = Math.floor(10000 + Math.random() * 89999);
      let generatedId = `${countryCode}-${randomNum}`;

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
           <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
           <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
             <Upload className="w-5 h-5 text-brand-500"/> Novo Registo no Arquivo
           </h2>
           <div className="grid grid-cols-2 gap-4 mb-6">
              <div onClick={() => frontInputRef.current?.click()} className="aspect-square border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 transition-all relative overflow-hidden bg-slate-800/50">
                {frontPreview ? <img src={frontPreview} className="absolute inset-0 w-full h-full object-contain" /> : <><ImageIcon className="w-8 h-8 text-slate-600 mb-2"/><span className="text-[10px] text-slate-500 font-bold uppercase">Frente *</span></>}
                <input type="file" ref={frontInputRef} className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleFrontSelect(e.target.files[0])} />
              </div>
              <div onClick={() => backInputRef.current?.click()} className="aspect-square border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 transition-all relative overflow-hidden bg-slate-800/50">
                {backPreview ? <img src={backPreview} className="absolute inset-0 w-full h-full object-contain" /> : <><ImageIcon className="w-8 h-8 text-slate-600 mb-2"/><span className="text-[10px] text-slate-500 font-bold uppercase">Verso</span></>}
                <input type="file" ref={backInputRef} className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleBackSelect(e.target.files[0])} />
              </div>
           </div>
           <button onClick={processImage} disabled={!frontFile || isAnalyzing} className="w-full bg-brand-600 hover:bg-brand-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-brand-900/40 disabled:opacity-50">
             {isAnalyzing ? <Loader2 className="animate-spin w-5 h-5"/> : <Sparkles className="w-5 h-5"/>}
             {isAnalyzing ? "Análise Profunda..." : "Ativar Chloe Analista"}
           </button>
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
               <h2 className="text-lg font-bold text-white tracking-tight">Revisão e Confirmação de Registo</h2>
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
                </div>

                {/* Formulário de Registo Total */}
                <div className="lg:col-span-8 space-y-6">
                   {error && <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-3 rounded-xl text-xs font-bold">{error}</div>}
                   
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                         <label className="text-[10px] text-slate-500 font-black uppercase mb-1 flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500"/> Nome do Jogo *</label>
                         <input type="text" value={formData.gameName || ''} onChange={e => updateField('gameName', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm font-bold focus:border-brand-500 outline-none" />
                      </div>
                      <div>
                         <label className="text-[10px] text-slate-500 font-black uppercase mb-1 flex items-center gap-1"><Hash className="w-3 h-3 text-brand-500"/> ID Arquivo</label>
                         <input type="text" value={formData.customId || ''} onChange={e => updateField('customId', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-brand-400 font-mono text-sm focus:border-brand-500 outline-none" />
                      </div>
                   </div>

                   <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-6">
                         <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.isSeries} onChange={e => updateField('isSeries', e.target.checked)} className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600" />
                            <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1"><Layers className="w-3 h-3 text-indigo-500"/> Série</span>
                         </label>
                         <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.isRarity} onChange={e => updateField('isRarity', e.target.checked)} className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-brand-600" />
                            <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1"><Gem className="w-3 h-3 text-yellow-500"/> Raridade</span>
                         </label>
                         <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.isPromotional} onChange={e => updateField('isPromotional', e.target.checked)} className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600" />
                            <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1"><Gift className="w-3 h-3 text-blue-500"/> Promo</span>
                         </label>
                         <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.isWinner} onChange={e => updateField('isWinner', e.target.checked)} className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-green-600" />
                            <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1"><Trophy className="w-3 h-3 text-green-500"/> Premiada</span>
                         </label>
                   </div>

                   <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                         <label className="text-[10px] text-slate-500 font-black uppercase mb-1 flex items-center gap-1"><Globe className="w-3 h-3 text-red-500"/> País</label>
                         <input type="text" value={formData.country || ''} onChange={e => updateField('country', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm" />
                      </div>
                      <div>
                         <label className="text-[10px] text-slate-500 font-black uppercase mb-1 flex items-center gap-1"><MapPin className="w-3 h-3 text-indigo-500"/> Região / Ilha</label>
                         <input type="text" value={formData.region || ''} onChange={e => updateField('region', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm" placeholder="Ex: Açores" />
                      </div>
                      <div>
                         <label className="text-[10px] text-slate-500 font-black uppercase mb-1 flex items-center gap-1"><Hash className="w-3 h-3 text-blue-500"/> Nº Jogo</label>
                         <input type="text" value={formData.gameNumber || ''} onChange={e => updateField('gameNumber', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm font-mono" />
                      </div>
                      <div>
                         <label className="text-[10px] text-slate-500 font-black uppercase mb-1 flex items-center gap-1"><Ruler className="w-3 h-3 text-emerald-500"/> Medidas</label>
                         <input type="text" value={formData.size || ''} onChange={e => updateField('size', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm" />
                      </div>
                      <div>
                         <label className="text-[10px] text-slate-500 font-black uppercase mb-1 flex items-center gap-1"><Printer className="w-3 h-3 text-slate-400"/> Gráfica</label>
                         <input type="text" value={formData.printer || ''} onChange={e => updateField('printer', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm" />
                      </div>
                   </div>

                   <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-800 space-y-4">
                      <label className="text-[10px] text-slate-500 font-black uppercase mb-1 flex items-center gap-1"><ScanLine className="w-3 h-3 text-cyan-400"/> Linhas (Cor da Série/Segurança)</label>
                      <div className="flex flex-wrap gap-2">
                         {commonLines.map((line) => (
                            <button
                               key={line.value}
                               onClick={() => updateField('lines', line.label)}
                               className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold flex items-center gap-2 transition-all ${formData.lines === line.label ? 'border-white bg-slate-700 text-white' : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500'}`}
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
                         className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-xs mt-2"
                      />
                   </div>

                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                         <label className="text-[10px] text-slate-500 font-black uppercase mb-1 flex items-center gap-1"><Coins className="w-3 h-3 text-yellow-500"/> Tiragem</label>
                         <input type="text" value={formData.emission || ''} onChange={e => updateField('emission', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm" />
                      </div>
                      <div>
                         <label className="text-[10px] text-slate-500 font-black uppercase mb-1 flex items-center gap-1"><Banknote className="w-3 h-3 text-green-500"/> Preço</label>
                         <input type="text" value={formData.price || ''} onChange={e => updateField('price', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm" />
                      </div>
                      <div>
                         <label className="text-[10px] text-slate-500 font-black uppercase mb-1 flex items-center gap-1"><Clock className="w-3 h-3 text-orange-500"/> Ano</label>
                         <input type="text" value={formData.releaseDate || ''} onChange={e => updateField('releaseDate', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm" />
                      </div>
                      <div>
                         <label className="text-[10px] text-slate-500 font-black uppercase mb-1 flex items-center gap-1"><Tag className="w-3 h-3 text-blue-500"/> Estado</label>
                         <select value={formData.state} onChange={e => updateField('state', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm font-black">
                            <option value="SC">SC (Raspada)</option>
                            <option value="MINT">MINT (Nova)</option>
                            <option value="AMOSTRA">AMOSTRA</option>
                            <option value="VOID">VOID</option>
                            <option value="SPECIMEN">SPECIMEN</option>
                         </select>
                      </div>
                   </div>

                   <div>
                      <label className="text-[10px] text-slate-500 font-black uppercase mb-1 block flex items-center gap-1"><Info className="w-3 h-3 text-slate-400"/> Observações do Arquivo</label>
                      <textarea value={formData.values || ''} onChange={e => updateField('values', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-white text-sm h-24 focus:border-brand-500 outline-none resize-none leading-relaxed shadow-inner" />
                   </div>
                </div>
             </div>
          </div>

          <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end gap-3 shrink-0">
             <button onClick={onClose} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold">Descartar</button>
             <button onClick={handleSave} disabled={isSaving} className="px-10 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-black flex items-center gap-2 shadow-lg active:scale-95 transition-all">
                {isSaving ? <Loader2 className="animate-spin w-4 h-4"/> : <Check className="w-4 h-4"/>}
                Confirmar e Arquivar
             </button>
          </div>
       </div>
    </div>
  );
}
