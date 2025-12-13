import React, { useState } from 'react';
import { X, UploadCloud, Loader2, Sparkles, AlertCircle, Ticket, ArrowLeft, Check, CheckCircle, User, Printer, Layers, BarChart, DollarSign } from 'lucide-react';
import { analyzeImage } from '../services/geminiService';
import { ScratchcardData, ScratchcardState, Continent } from '../types';

interface UploadModalProps {
  onClose: () => void;
  onUploadComplete: (image: ScratchcardData) => void;
  t: any;
}

export const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUploadComplete, t }) => {
  const [step, setStep] = useState<'upload' | 'review'>('upload');
  
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Form data for review step
  const [formData, setFormData] = useState<ScratchcardData | null>(null);

  const processFile = (file: File, isFront: boolean) => {
    if (!file.type.startsWith('image/')) {
      setError(t.errorImage);
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const res = e.target?.result as string;
      if (isFront) {
        setFrontFile(file);
        setFrontPreview(res);
      } else {
        setBackFile(file);
        setBackPreview(res);
      }
    };
    reader.readAsDataURL(file);
  };

  const generateCustomId = () => {
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `RASP-${random}`;
  };

  const handleAnalyze = async () => {
    if (!frontFile || !frontPreview) {
      setError(t.errorFront);
      return;
    }

    setIsProcessing(true);
    try {
      const frontBase64 = frontPreview.split(',')[1];
      const backBase64 = backPreview ? backPreview.split(',')[1] : null;
      
      const analysis = await analyzeImage(frontBase64, backBase64, frontFile.type);

      const newCard: ScratchcardData = {
        id: Math.random().toString(36).substr(2, 9),
        customId: generateCustomId(),
        frontUrl: frontPreview,
        backUrl: backPreview || undefined,
        gameName: analysis.gameName,
        gameNumber: analysis.gameNumber,
        releaseDate: analysis.releaseDate,
        size: analysis.size,
        values: analysis.values,
        price: analysis.price || '',
        state: analysis.state,
        country: analysis.country,
        continent: analysis.continent,
        collector: '', // Default empty
        emission: analysis.emission || '', // New field
        printer: analysis.printer || '', // New field
        isSeries: false, // Default false
        createdAt: Date.now(),
        aiGenerated: true
      };

      setFormData(newCard);
      setStep('review');
    } catch (err) {
      console.error(err);
      setError(t.errorAnalyze);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = () => {
    if (formData) {
      onUploadComplete(formData);
      setShowSuccess(true);
      // Aguarda 1.5 segundos mostrando a notificação antes de fechar
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  const updateField = (field: keyof ScratchcardData, value: string | boolean) => {
    if (formData) {
      setFormData({ ...formData, [field]: value });
    }
  };

  const UploadBox = ({ label, preview, isFront }: { label: string, preview: string | null, isFront: boolean }) => (
    <div className="flex-1">
       <label className="block text-xs uppercase text-gray-500 font-bold mb-2">{label}</label>
       {!preview ? (
          <div className="border-2 border-dashed border-gray-700 hover:border-brand-500/50 hover:bg-gray-800/50 rounded-xl h-48 flex flex-col items-center justify-center transition-colors relative cursor-pointer">
            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0], isFront)}
            />
            <UploadCloud className="w-8 h-8 text-gray-500 mb-2" />
            <span className="text-xs text-gray-400">{t.clickDrag}</span>
          </div>
       ) : (
         <div className="relative h-48 rounded-xl overflow-hidden bg-black border border-gray-700 group">
           <img src={preview} alt={label} className="w-full h-full object-contain" />
           <button 
             onClick={() => isFront ? (setFrontPreview(null), setFrontFile(null)) : (setBackPreview(null), setBackFile(null))}
             className="absolute top-2 right-2 bg-black/60 hover:bg-red-900/80 text-white p-1.5 rounded-full backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100"
           >
             <X className="w-4 h-4" />
           </button>
         </div>
       )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className={`bg-gray-900 border border-gray-800 rounded-2xl w-full ${step === 'review' ? 'max-w-4xl' : 'max-w-2xl'} shadow-2xl flex flex-col max-h-[90vh] transition-all duration-300 relative`}>
        
        {/* Success Toast Notification */}
        {showSuccess && (
          <div className="absolute bottom-6 right-6 z-50 animate-bounce-in bg-green-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-green-400/50">
            <div className="bg-white/20 p-1.5 rounded-full">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm">{t.success}</p>
              <p className="text-xs text-green-100">{t.saved}</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Ticket className="w-5 h-5 text-brand-500" />
            {step === 'upload' ? t.title : t.reviewTitle}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {step === 'upload' ? (
            <div className="p-6">
              {error && (
                <div className="mb-4 bg-red-900/30 border border-red-800 text-red-200 p-3 rounded-lg flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-6 mb-6">
                <UploadBox label={t.front} preview={frontPreview} isFront={true} />
                <UploadBox label={t.back} preview={backPreview} isFront={false} />
              </div>

              {(frontPreview || backPreview) && (
                <div className="bg-brand-900/20 border border-brand-800/50 p-4 rounded-lg flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-brand-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-brand-200 font-semibold text-sm">{t.aiTitle}</h4>
                    <p className="text-brand-200/70 text-xs mt-1">
                      {t.aiDesc}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left: Images */}
              <div className="space-y-4">
                <div className="bg-black rounded-xl border border-gray-700 overflow-hidden h-48">
                  <img src={frontPreview!} className="w-full h-full object-contain" alt="Frente" />
                </div>
                {backPreview && (
                  <div className="bg-black rounded-xl border border-gray-700 overflow-hidden h-48">
                    <img src={backPreview} className="w-full h-full object-contain" alt="Verso" />
                  </div>
                )}
                
                {/* Checkbox Series - Moved to left column or below images */}
                 <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700 flex items-center gap-3">
                   <div 
                     className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-colors ${formData?.isSeries ? 'bg-brand-500 border-brand-500' : 'border-gray-500 hover:border-gray-400'}`}
                     onClick={() => updateField('isSeries', !formData?.isSeries)}
                   >
                     {formData?.isSeries && <Check className="w-3.5 h-3.5 text-white" />}
                   </div>
                   <label 
                     className="text-sm text-gray-300 cursor-pointer select-none font-bold"
                     onClick={() => updateField('isSeries', !formData?.isSeries)}
                   >
                     {t.isSeries}
                   </label>
                 </div>
              </div>

              {/* Right: Form */}
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div className="col-span-2">
                     <label className="block text-xs text-gray-500 font-bold mb-1">{t.gameName}</label>
                     <input 
                       type="text" 
                       value={formData?.gameName || ''}
                       onChange={e => updateField('gameName', e.target.value)}
                       className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
                     />
                   </div>
                   
                   <div>
                     <label className="block text-xs text-gray-500 font-bold mb-1">{t.country}</label>
                     <input 
                       type="text" 
                       value={formData?.country || ''}
                       onChange={e => updateField('country', e.target.value)}
                       className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
                     />
                   </div>

                   <div>
                     <label className="block text-xs text-gray-500 font-bold mb-1">{t.continent}</label>
                     <select 
                       value={formData?.continent || ''}
                       onChange={e => updateField('continent', e.target.value as Continent)}
                       className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
                     >
                       {['Europa', 'América', 'Ásia', 'África', 'Oceania'].map(c => (
                         <option key={c} value={c}>{c}</option>
                       ))}
                     </select>
                   </div>

                   <div>
                     <label className="block text-xs text-gray-500 font-bold mb-1">{t.state}</label>
                     <input
                       type="text"
                       value={formData?.state || ''}
                       onChange={e => updateField('state', e.target.value as ScratchcardState)}
                       placeholder="Ex: MINT, VOID..."
                       className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
                     />
                   </div>

                   <div>
                     <label className="block text-xs text-gray-500 font-bold mb-1">{t.customId}</label>
                     <input 
                       type="text" 
                       value={formData?.customId || ''}
                       onChange={e => updateField('customId', e.target.value)}
                       className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:border-brand-500 focus:outline-none font-mono"
                     />
                   </div>

                   <div>
                     <label className="block text-xs text-gray-500 font-bold mb-1">{t.collector}</label>
                     <div className="relative">
                       <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                       <input 
                         type="text" 
                         value={formData?.collector || ''}
                         onChange={e => updateField('collector', e.target.value)}
                         placeholder={t.collector}
                         className="w-full bg-gray-800 border border-gray-700 rounded pl-8 pr-3 py-2 text-white focus:border-brand-500 focus:outline-none"
                       />
                     </div>
                   </div>

                   <div>
                     <label className="block text-xs text-gray-500 font-bold mb-1">{t.releaseDate}</label>
                     <input 
                       type="text" 
                       value={formData?.releaseDate || ''}
                       onChange={e => updateField('releaseDate', e.target.value)}
                       placeholder="YYYY ou YYYY-MM-DD"
                       className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
                     />
                   </div>

                   <div>
                     <label className="block text-xs text-gray-500 font-bold mb-1">{t.size}</label>
                     <input 
                       type="text" 
                       value={formData?.size || ''}
                       onChange={e => updateField('size', e.target.value)}
                       placeholder="Ex: 10x5cm"
                       className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
                     />
                   </div>

                   {/* New Fields: Price, Emissão & Impresso Por */}
                   <div>
                     <label className="block text-xs text-gray-500 font-bold mb-1">{t.price}</label>
                     <div className="relative">
                       <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                       <input 
                         type="text" 
                         value={formData?.price || ''}
                         onChange={e => updateField('price', e.target.value)}
                         placeholder="Ex: 5€"
                         className="w-full bg-gray-800 border border-gray-700 rounded pl-8 pr-3 py-2 text-white focus:border-brand-500 focus:outline-none"
                       />
                     </div>
                   </div>

                   <div>
                     <label className="block text-xs text-gray-500 font-bold mb-1">{t.emission}</label>
                     <div className="relative">
                       <BarChart className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                       <input 
                         type="text" 
                         value={formData?.emission || ''}
                         onChange={e => updateField('emission', e.target.value)}
                         placeholder="Ex: 500.000 un"
                         className="w-full bg-gray-800 border border-gray-700 rounded pl-8 pr-3 py-2 text-white focus:border-brand-500 focus:outline-none"
                       />
                     </div>
                   </div>

                   <div className="col-span-2">
                     <label className="block text-xs text-gray-500 font-bold mb-1">{t.printer}</label>
                     <div className="relative">
                       <Printer className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                       <input 
                         type="text" 
                         value={formData?.printer || ''}
                         onChange={e => updateField('printer', e.target.value)}
                         placeholder="Ex: Scientific Games"
                         className="w-full bg-gray-800 border border-gray-700 rounded pl-8 pr-3 py-2 text-white focus:border-brand-500 focus:outline-none"
                       />
                     </div>
                   </div>
                   
                   <div className="col-span-2">
                     <label className="block text-xs text-gray-500 font-bold mb-1">{t.values}</label>
                     <textarea 
                       value={formData?.values || ''}
                       onChange={e => updateField('values', e.target.value)}
                       className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:border-brand-500 focus:outline-none h-20"
                     />
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 flex justify-between items-center bg-gray-900/50 rounded-b-2xl">
          {step === 'review' ? (
             <button
               onClick={() => setStep('upload')}
               className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
             >
               <ArrowLeft className="w-4 h-4" /> {t.backBtn}
             </button>
          ) : (
            <button
               onClick={onClose}
               className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
               disabled={isProcessing}
            >
              {t.cancel}
            </button>
          )}

          <div className="flex gap-3">
             {step === 'upload' ? (
                <button
                  onClick={handleAnalyze}
                  disabled={!frontFile || isProcessing}
                  className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold shadow-lg transition-all ${
                    !frontFile || isProcessing
                      ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                      : "bg-brand-600 hover:bg-brand-500 text-white shadow-brand-900/50"
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t.analyzing}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      {t.analyze}
                    </>
                  )}
                </button>
             ) : (
               <button
                  onClick={handleSave}
                  disabled={showSuccess}
                  className={`flex items-center gap-2 px-8 py-2 rounded-full text-sm font-bold shadow-lg transition-all ${
                    showSuccess 
                      ? "bg-green-700 text-white cursor-default" 
                      : "bg-green-600 hover:bg-green-500 text-white shadow-green-900/50"
                  }`}
                >
                  {showSuccess ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t.saving}
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      {t.save}
                    </>
                  )}
                </button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};