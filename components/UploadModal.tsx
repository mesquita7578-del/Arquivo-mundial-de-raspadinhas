import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Sparkles, AlertCircle, Check, Loader2, AlignJustify, ArrowLeft, Image as ImageIcon, ScanLine, DollarSign, Calendar, MapPin, Globe, Printer, Layers, Maximize2, Plus } from 'lucide-react';
import { ScratchcardData, Category, LineType, Continent, ScratchcardState } from '../types';
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
  
  // Extra Images State (Array of 4 slots)
  const [extraPreviews, setExtraPreviews] = useState<(string | null)[]>([null, null, null, null]);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<ScratchcardData>>({
    category: 'raspadinha',
    state: 'MINT',
    continent: 'Europa',
    country: 'Portugal',
    lines: 'none',
    isSeries: false,
    isRarity: false,
    isPromotional: false,
    isWinner: false,
    aiGenerated: false
  });

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  // Refs for extra images
  const extraInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (initialFile) {
      handleFrontSelect(initialFile);
    }
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

  const handleExtraSelect = (file: File, index: number) => {
    const reader = new FileReader();
    reader.onload = (e) => {
       const newExtras = [...extraPreviews];
       newExtras[index] = e.target?.result as string;
       setExtraPreviews(newExtras);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async () => {
    if (!frontFile || !frontPreview) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const frontBase64 = frontPreview.split(',')[1];
      const backBase64 = backPreview ? backPreview.split(',')[1] : null;
      
      const result = await analyzeImage(frontBase64, backBase64, frontFile.type);
      
      setFormData(prev => ({
        ...prev,
        ...result,
        aiGenerated: true
      }));
      setStep(2);
    } catch (err) {
      console.error(err);
      setError(t.errorAnalyze);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManualEntry = () => {
    if (!frontFile) return;
    setStep(2);
  };

  const updateField = (field: keyof ScratchcardData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!formData.gameName || !formData.country) {
      setError("Nome e País são obrigatórios.");
      return;
    }

    setIsSaving(true);
    
    // Generate IDs
    const timestamp = Date.now();
    const id = timestamp.toString();
    const countryCode = formData.country?.substring(0, 2).toUpperCase() || 'XX';
    const customId = formData.customId || `RASP-${countryCode}-${Math.floor(Math.random() * 1000)}`;

    // Filter out nulls from extra images
    const validExtras = extraPreviews.filter(img => img !== null) as string[];

    const newItem: ScratchcardData = {
      id,
      customId,
      frontUrl: frontPreview || '',
      backUrl: backPreview || undefined,
      extraImages: validExtras.length > 0 ? validExtras : undefined,
      gameName: formData.gameName || 'Sem Nome',
      gameNumber: formData.gameNumber || '000',
      releaseDate: formData.releaseDate || new Date().toISOString().split('T')[0],
      size: formData.size || '?',
      values: formData.values || '',
      price: formData.price,
      state: formData.state || 'SC',
      country: formData.country || 'Desconhecido',
      region: formData.region,
      continent: formData.continent || 'Europa',
      category: formData.category || 'raspadinha',
      
      emission: formData.emission,
      printer: formData.printer,
      isSeries: formData.isSeries,
      seriesDetails: formData.seriesDetails,
      lines: formData.lines || 'none',
      isRarity: formData.isRarity,
      isPromotional: formData.isPromotional,
      isWinner: formData.isWinner,
      prizeAmount: formData.prizeAmount,
      
      collector: formData.collector || currentUser || 'Desconhecido',
      owners: currentUser ? [currentUser] : [],
      
      aiGenerated: formData.aiGenerated || false,
      createdAt: timestamp
    };

    onUploadComplete(newItem);
    onClose();
  };

  if (step === 1) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden">
           <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
           
           <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Upload className="w-5 h-5 text-brand-500"/> {t.title}
              </h2>

              {/* Main Images (Front/Back) */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                 {/* Front Upload */}
                 <div 
                   className={`border-2 border-dashed rounded-xl aspect-square flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden ${frontPreview ? 'border-brand-500 bg-slate-800' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/50'}`}
                   onClick={() => frontInputRef.current?.click()}
                 >
                    {frontPreview ? (
                      <img src={frontPreview} className="absolute inset-0 w-full h-full object-contain" />
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-slate-500 mb-2"/>
                        <span className="text-xs font-bold text-slate-400 uppercase">{t.front} *</span>
                      </>
                    )}
                    <input type="file" ref={frontInputRef} className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleFrontSelect(e.target.files[0])} />
                 </div>

                 {/* Back Upload */}
                 <div 
                   className={`border-2 border-dashed rounded-xl aspect-square flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden ${backPreview ? 'border-brand-500 bg-slate-800' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/50'}`}
                   onClick={() => backInputRef.current?.click()}
                 >
                    {backPreview ? (
                      <img src={backPreview} className="absolute inset-0 w-full h-full object-contain" />
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-slate-500 mb-2"/>
                        <span className="text-xs font-bold text-slate-400 uppercase">{t.back}</span>
                      </>
                    )}
                    <input type="file" ref={backInputRef} className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleBackSelect(e.target.files[0])} />
                 </div>
              </div>

              {/* Extra Images (Variants) */}
              <div className="mb-6">
                 <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Detalhes & Variantes (Opcional)</p>
                 <div className="grid grid-cols-4 gap-2">
                    {[0, 1, 2, 3].map((index) => (
                       <div 
                          key={index}
                          className={`border border-dashed rounded-lg aspect-square flex items-center justify-center cursor-pointer transition-all relative overflow-hidden group ${extraPreviews[index] ? 'border-brand-500/50 bg-slate-800' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/50'}`}
                          onClick={() => extraInputRefs.current[index]?.click()}
                       >
                          {extraPreviews[index] ? (
                             <img src={extraPreviews[index] || ''} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                          ) : (
                             <Plus className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                          )}
                          <input 
                             type="file" 
                             ref={(el) => extraInputRefs.current[index] = el} 
                             className="hidden" 
                             accept="image/*" 
                             onChange={e => e.target.files?.[0] && handleExtraSelect(e.target.files[0], index)} 
                          />
                       </div>
                    ))}
                 </div>
              </div>

              {error && <div className="mb-4 text-red-400 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4"/>{error}</div>}

              <div className="flex gap-3">
                 <button 
                   onClick={processImage}
                   disabled={!frontFile || isAnalyzing}
                   className="flex-1 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-800 disabled:text-slate-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-900/20"
                 >
                    {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4"/>}
                    {isAnalyzing ? t.analyzing : t.analyze}
                 </button>
                 
                 <button 
                   onClick={handleManualEntry}
                   disabled={!frontFile}
                   className="px-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-xl font-bold transition-colors"
                 >
                    Manual
                 </button>
              </div>
           </div>
        </div>
      </div>
    );
  }

  // Step 2: Form
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
       <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl h-[90vh] shadow-2xl relative flex flex-col overflow-hidden">
          
          <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur shrink-0">
             <div className="flex items-center gap-3">
               <button onClick={() => setStep(1)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"><ArrowLeft className="w-5 h-5"/></button>
               <h2 className="text-lg font-bold text-white">{t.reviewTitle}</h2>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"><X className="w-5 h-5"/></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Images Preview Side */}
                <div className="space-y-4">
                   <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                      <p className="text-xs font-bold text-slate-500 uppercase mb-2">{t.front}</p>
                      <img src={frontPreview || ''} className="w-full object-contain rounded-lg" />
                   </div>
                   {backPreview && (
                     <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-2">{t.back}</p>
                        <img src={backPreview} className="w-full object-contain rounded-lg" />
                     </div>
                   )}
                   {/* Extra Images Preview Grid */}
                   {extraPreviews.some(img => img !== null) && (
                      <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                         <p className="text-xs font-bold text-slate-500 uppercase mb-2">Variantes</p>
                         <div className="grid grid-cols-4 gap-2">
                            {extraPreviews.map((img, i) => img && (
                               <img key={i} src={img} className="w-full aspect-square object-cover rounded border border-slate-800" />
                            ))}
                         </div>
                      </div>
                   )}
                </div>

                {/* Form Fields */}
                <div className="md:col-span-2 space-y-4">
                   
                   {/* Row 1: Basic Info */}
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t.gameName}</label>
                         <input type="text" value={formData.gameName || ''} onChange={e => updateField('gameName', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:border-brand-500 outline-none" />
                      </div>
                      <div>
                         <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t.customId}</label>
                         <input type="text" value={formData.customId || ''} onChange={e => updateField('customId', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:border-brand-500 outline-none" />
                      </div>
                   </div>

                   {/* Row 2: Location */}
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t.country}</label>
                         <div className="relative">
                            <Globe className="absolute left-3 top-2.5 w-4 h-4 text-slate-500"/>
                            <input type="text" value={formData.country || ''} onChange={e => updateField('country', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-white text-sm focus:border-brand-500 outline-none" />
                         </div>
                      </div>
                      <div>
                         <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t.region}</label>
                         <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-500"/>
                            <input type="text" value={formData.region || ''} onChange={e => updateField('region', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-white text-sm focus:border-brand-500 outline-none" />
                         </div>
                      </div>
                   </div>

                   {/* Row 3: Technical */}
                   <div className="grid grid-cols-3 gap-4">
                      <div>
                         <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nº {t.gameNo}</label>
                         <div className="relative">
                            <ScanLine className="absolute left-3 top-2.5 w-4 h-4 text-slate-500"/>
                            <input type="text" value={formData.gameNumber || ''} onChange={e => updateField('gameNumber', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-white text-sm focus:border-brand-500 outline-none" />
                         </div>
                      </div>
                      <div>
                         <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t.releaseDate}</label>
                         <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-500"/>
                            <input type="text" value={formData.releaseDate || ''} onChange={e => updateField('releaseDate', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-white text-sm focus:border-brand-500 outline-none" placeholder="YYYY-MM-DD" />
                         </div>
                      </div>
                      <div>
                         <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t.price}</label>
                         <div className="relative">
                            <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-500"/>
                            <input type="text" value={formData.price || ''} onChange={e => updateField('price', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-white text-sm focus:border-brand-500 outline-none" />
                         </div>
                      </div>
                   </div>

                   {/* Row 4: Details */}
                   <div className="grid grid-cols-3 gap-4">
                      <div>
                         <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t.printer}</label>
                         <div className="relative">
                            <Printer className="absolute left-3 top-2.5 w-4 h-4 text-slate-500"/>
                            <input type="text" value={formData.printer || ''} onChange={e => updateField('printer', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-white text-sm focus:border-brand-500 outline-none" />
                         </div>
                      </div>
                      <div>
                         <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t.emission}</label>
                         <div className="relative">
                            <Layers className="absolute left-3 top-2.5 w-4 h-4 text-slate-500"/>
                            <input type="text" value={formData.emission || ''} onChange={e => updateField('emission', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-white text-sm focus:border-brand-500 outline-none" />
                         </div>
                      </div>
                      <div>
                         <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t.size}</label>
                         <div className="relative">
                            <Maximize2 className="absolute left-3 top-2.5 w-4 h-4 text-slate-500"/>
                            <input type="text" value={formData.size || ''} onChange={e => updateField('size', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-white text-sm focus:border-brand-500 outline-none" />
                         </div>
                      </div>
                   </div>

                   {/* Dropdowns */}
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t.state}</label>
                         <select value={formData.state || 'SC'} onChange={e => updateField('state', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:border-brand-500 outline-none">
                            <option value="MINT">MINT / NOVO</option>
                            <option value="SC">SC (Raspada)</option>
                            <option value="CS">CS (Coleção)</option>
                            <option value="AMOSTRA">AMOSTRA / SPECIMEN</option>
                            <option value="VOID">VOID</option>
                         </select>
                      </div>
                      <div>
                         <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t.category}</label>
                         <select value={formData.category || 'raspadinha'} onChange={e => updateField('category', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:border-brand-500 outline-none">
                            <option value="raspadinha">Raspadinha</option>
                            <option value="lotaria">Lotaria</option>
                            <option value="boletim">Boletim</option>
                            <option value="objeto">Objeto</option>
                         </select>
                      </div>
                   </div>

                   {/* Line Type Selector (Snippet Integration) */}
                   <div>
                      <label className="block text-xs uppercase text-gray-400 font-bold mb-2 tracking-widest pl-1">{t.lines}</label>
                      <div className="relative group">
                        <AlignJustify className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-500" />
                        <select
                          value={formData.lines || 'none'}
                          onChange={(e) => updateField('lines', e.target.value as LineType)}
                          className="w-full bg-gray-950/50 border border-gray-700 rounded-xl pl-11 pr-4 py-3 text-white focus:border-brand-500 focus:outline-none appearance-none cursor-pointer text-sm transition-all"
                        >
                          <option value="none">{t.linesNone}</option>
                          <option value="blue">{t.linesBlue}</option>
                          <option value="red">{t.linesRed}</option>
                          <option value="green">{t.linesGreen}</option>
                          <option value="brown">{t.linesBrown}</option>
                          <option value="pink">{t.linesPink}</option>
                          <option value="purple">{t.linesPurple}</option>
                          <option value="yellow">{t.linesYellow}</option>
                          <option value="multicolor">{t.linesMulti}</option>
                        </select>
                      </div>
                   </div>

                   {/* Booleans */}
                   <div className="flex flex-wrap gap-4 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer bg-slate-800/50 p-2 rounded border border-slate-700">
                         <input type="checkbox" checked={formData.isRarity || false} onChange={e => updateField('isRarity', e.target.checked)} className="accent-brand-500 w-4 h-4"/>
                         <span className="text-sm text-white">{t.isRarity}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer bg-slate-800/50 p-2 rounded border border-slate-700">
                         <input type="checkbox" checked={formData.isPromotional || false} onChange={e => updateField('isPromotional', e.target.checked)} className="accent-brand-500 w-4 h-4"/>
                         <span className="text-sm text-white">{t.isPromotional}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer bg-slate-800/50 p-2 rounded border border-slate-700">
                         <input type="checkbox" checked={formData.isWinner || false} onChange={e => updateField('isWinner', e.target.checked)} className="accent-brand-500 w-4 h-4"/>
                         <span className="text-sm text-white">{t.isWinner}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer bg-slate-800/50 p-2 rounded border border-slate-700">
                         <input type="checkbox" checked={formData.isSeries || false} onChange={e => updateField('isSeries', e.target.checked)} className="accent-brand-500 w-4 h-4"/>
                         <span className="text-sm text-white">{t.isSeries}</span>
                      </label>
                   </div>
                   
                   {/* Series Details */}
                   {formData.isSeries && (
                      <div>
                         <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Detalhes da Série</label>
                         <input type="text" value={formData.seriesDetails || ''} onChange={e => updateField('seriesDetails', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm" placeholder={t.seriesDetailsPlaceholder} />
                      </div>
                   )}
                   
                   {/* Winner Prize */}
                   {formData.isWinner && (
                      <div>
                         <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Prémio</label>
                         <input type="text" value={formData.prizeAmount || ''} onChange={e => updateField('prizeAmount', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm" placeholder={t.prizeAmountPlaceholder} />
                      </div>
                   )}
                   
                   {/* Notes */}
                   <div>
                       <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t.values}</label>
                       <textarea value={formData.values || ''} onChange={e => updateField('values', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm h-20" placeholder={t.rarityInfo}></textarea>
                   </div>
                </div>
             </div>
          </div>
          
          <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3 shrink-0">
             <button onClick={onClose} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors">{t.cancel}</button>
             <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold transition-colors shadow-lg flex items-center gap-2">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Check className="w-4 h-4"/>}
                {t.save}
             </button>
          </div>

       </div>
    </div>
  );
};