import React, { useState, useEffect } from 'react';
import { X, UploadCloud, Loader2, Sparkles, AlertCircle, Ticket, ArrowLeft, Check, CheckCircle, User, Printer, Layers, BarChart, DollarSign, RefreshCw, Coins, Search, Globe } from 'lucide-react';
import { analyzeImage, searchScratchcardInfo } from '../services/geminiService';
import { ScratchcardData, ScratchcardState, Continent, Category } from '../types';

interface UploadModalProps {
  onClose: () => void;
  onUploadComplete: (image: ScratchcardData) => void;
  existingImages?: ScratchcardData[];
  initialFile?: File | null;
  t: any;
}

// Helper to compress images
const resizeAndCompressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Max dimensions (1024px is enough for web viewing and keeps size small)
        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;
        
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress to JPEG at 70% quality
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        } else {
          reject(new Error("Failed to get canvas context"));
        }
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUploadComplete, existingImages = [], initialFile, t }) => {
  const [step, setStep] = useState<'upload' | 'review'>('upload');
  const [activeTab, setActiveTab] = useState<'image' | 'web'>('image'); // New Tab State
  
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  
  // Web Search State
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  
  const [formData, setFormData] = useState<ScratchcardData | null>(null);

  // Handle Initial File from Drag and Drop
  useEffect(() => {
    if (initialFile) {
      processFile(initialFile, true);
    }
  }, [initialFile]);

  const processFile = async (file: File, isFront: boolean) => {
    if (!file.type.startsWith('image/')) {
      setError(t.errorImage);
      return;
    }
    setError(null);
    setIsCompressing(true);

    try {
      const compressedBase64 = await resizeAndCompressImage(file);
      
      if (isFront) {
        setFrontFile(file);
        setFrontPreview(compressedBase64);
      } else {
        setBackFile(file);
        setBackPreview(compressedBase64);
      }
    } catch (err) {
      console.error("Error compressing image:", err);
      setError("Erro ao processar imagem. Tente outra.");
    } finally {
      setIsCompressing(false);
    }
  };

  const getCountryCode = (countryName: string): string => {
    const name = countryName.toLowerCase().trim();
    const map: Record<string, string> = {
      'portugal': 'PT', 'italia': 'IT', 'itália': 'IT', 'italy': 'IT',
      'espanha': 'ES', 'spain': 'ES', 'españa': 'ES',
      'usa': 'US', 'eua': 'US', 'united states': 'US',
      'frança': 'FR', 'france': 'FR', 'franca': 'FR',
      'alemanha': 'DE', 'germany': 'DE', 'reino unido': 'UK',
      'uk': 'UK', 'england': 'UK', 'inglaterra': 'UK',
      'brasil': 'BR', 'brazil': 'BR', 'japao': 'JP', 'japão': 'JP',
      'japan': 'JP', 'china': 'CN', 'belgica': 'BE', 'belgium': 'BE',
      'bélgica': 'BE', 'suica': 'CH', 'suíça': 'CH', 'switzerland': 'CH',
      'singapore': 'SG', 'singapura': 'SG'
    };
    if (map[name]) return map[name];
    return countryName.substring(0, 2).toUpperCase();
  };

  const generateNextId = (country: string): string => {
    const code = getCountryCode(country);
    const prefix = `${code}-`;
    let maxNum = 0;
    existingImages.forEach(img => {
      if (img.customId && img.customId.startsWith(prefix)) {
        const parts = img.customId.split('-');
        if (parts.length >= 2) {
          const numStr = parts[parts.length - 1].replace(/[^0-9]/g, '');
          const num = parseInt(numStr, 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      }
    });
    const nextNum = (maxNum + 1).toString().padStart(6, '0');
    return `${prefix}${nextNum}`;
  };

  const createFormData = (analysis: any) => {
    const smartId = generateNextId(analysis.country || 'Desconhecido');
    const newCard: ScratchcardData = {
      id: Math.random().toString(36).substr(2, 9),
      customId: smartId,
      frontUrl: frontPreview || 'https://placehold.co/600x400/1f2937/white?text=Sem+Imagem',
      backUrl: backPreview || undefined,
      gameName: analysis.gameName || 'Novo Jogo',
      gameNumber: analysis.gameNumber || '',
      releaseDate: analysis.releaseDate || '',
      size: analysis.size || '',
      values: analysis.values || '',
      price: analysis.price || '',
      state: analysis.state || 'MINT',
      country: analysis.country || 'Portugal',
      continent: analysis.continent || 'Europa',
      collector: '',
      emission: analysis.emission || '',
      printer: analysis.printer || '',
      isSeries: false,
      category: analysis.category || 'raspadinha',
      createdAt: Date.now(),
      aiGenerated: true
    };
    setFormData(newCard);
    setStep('review');
  };

  const handleAnalyzeImage = async () => {
    if (!frontFile || !frontPreview) {
      setError(t.errorFront);
      return;
    }
    setIsProcessing(true);
    try {
      const frontBase64 = frontPreview.split(',')[1];
      const backBase64 = backPreview ? backPreview.split(',')[1] : null;
      const analysis = await analyzeImage(frontBase64, backBase64, frontFile.type);
      createFormData(analysis);
    } catch (err) {
      console.error(err);
      setError(t.errorAnalyze);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWebSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsProcessing(true);
    setError(null);
    try {
      const results = await searchScratchcardInfo(searchQuery);
      createFormData(results);
    } catch (err) {
      console.error(err);
      setError("Não foi possível encontrar informações online. Tente ser mais específico.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = () => {
    if (formData) {
      // Ensure we use the latest image previews if they exist (important for Web Search flow where image is added late)
      const finalData = {
        ...formData,
        frontUrl: frontPreview || formData.frontUrl,
        backUrl: backPreview || formData.backUrl
      };

      onUploadComplete(finalData);
      setShowSuccess(true);
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

  const regenerateId = () => {
    if (formData && formData.country) {
      const newId = generateNextId(formData.country);
      updateField('customId', newId);
    }
  };

  const UploadBox = ({ label, preview, isFront }: { label: string, preview: string | null, isFront: boolean }) => (
    <div className="flex-1">
       <label className="block text-xs uppercase text-gray-500 font-bold mb-2">{label}</label>
       {!preview ? (
          <div className={`border-2 border-dashed ${isCompressing ? 'border-brand-500 bg-brand-900/10' : 'border-gray-700 hover:border-brand-500/50 hover:bg-gray-800/50'} rounded-xl h-48 flex flex-col items-center justify-center transition-colors relative cursor-pointer overflow-hidden`}>
            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              accept="image/*"
              disabled={isCompressing}
              onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0], isFront)}
            />
            {isCompressing ? (
              <div className="flex flex-col items-center text-brand-400">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <span className="text-xs font-bold animate-pulse">Comprimindo...</span>
              </div>
            ) : (
              <>
                <UploadCloud className="w-8 h-8 text-gray-500 mb-2" />
                <span className="text-xs text-gray-400">{t.clickDrag}</span>
              </>
            )}
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
        
        {/* Success Toast */}
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

        {/* Tabs (Only in Upload Step) */}
        {step === 'upload' && (
          <div className="flex border-b border-gray-800 px-6">
            <button
              onClick={() => setActiveTab('image')}
              className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'image' ? 'border-brand-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
            >
              <UploadCloud className="w-4 h-4" />
              Via Imagem
            </button>
            <button
              onClick={() => setActiveTab('web')}
              className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'web' ? 'border-brand-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
            >
              <Globe className="w-4 h-4" />
              Via Web/SCML
            </button>
          </div>
        )}

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

              {activeTab === 'image' ? (
                <>
                  <div className="flex flex-col sm:flex-row gap-6 mb-6">
                    <UploadBox label={t.front} preview={frontPreview} isFront={true} />
                    <UploadBox label={t.back} preview={backPreview} isFront={false} />
                  </div>
                  {(frontPreview || backPreview) && (
                    <div className="bg-brand-900/20 border border-brand-800/50 p-4 rounded-lg flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-brand-400 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="text-brand-200 font-semibold text-sm">{t.aiTitle}</h4>
                        <p className="text-brand-200/70 text-xs mt-1">{t.aiDesc}</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-900/20 border border-blue-800/50 p-4 rounded-lg flex items-start gap-3">
                    <Globe className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-blue-200 font-semibold text-sm">Importar Dados da SCML</h4>
                      <p className="text-blue-200/70 text-xs mt-1">
                        Pesquise por "Novas raspadinhas Santa Casa" ou o nome específico do jogo. A IA irá procurar os dados técnicos oficiais.
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Ex: Nova Raspadinha Pé de Meia"
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 pl-12 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      onKeyDown={(e) => e.key === 'Enter' && handleWebSearch()}
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setSearchQuery("Novas raspadinhas Santa Casa"); handleWebSearch(); }}
                      className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full border border-gray-700 transition-colors"
                    >
                      Últimos Lançamentos SCML
                    </button>
                    <button 
                      onClick={() => setSearchQuery("Raspadinha 50X")}
                      className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full border border-gray-700 transition-colors"
                    >
                      Ex: 50X
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // REVIEW STEP
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left: Images */}
              <div className="space-y-4">
                <div className="bg-black rounded-xl border border-gray-700 overflow-hidden h-48 relative group">
                  <img src={frontPreview || formData?.frontUrl || ''} className="w-full h-full object-contain" alt="Frente" />
                  {/* Allow upload/change image in review step if missing */}
                  <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <UploadCloud className="w-6 h-6 text-white mb-2" />
                    <span className="text-xs text-white font-bold">Alterar Imagem</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0], true)} />
                  </label>
                </div>
                {/* ... existing Back Image logic ... */}
                
                {/* Category Selector */}
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                  <label className="block text-xs text-gray-500 font-bold mb-2 uppercase">{t.category}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => updateField('category', 'raspadinha')}
                      className={`flex flex-col items-center justify-center p-2 rounded border transition-all ${formData?.category === 'raspadinha' ? 'bg-brand-600 border-brand-500 text-white' : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'}`}
                    >
                      <Coins className="w-4 h-4 mb-1" />
                      <span className="text-[10px] font-bold">{t.typeScratch}</span>
                    </button>
                    <button
                      onClick={() => updateField('category', 'lotaria')}
                      className={`flex flex-col items-center justify-center p-2 rounded border transition-all ${formData?.category === 'lotaria' ? 'bg-purple-600 border-purple-500 text-white' : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'}`}
                    >
                      <Ticket className="w-4 h-4 mb-1" />
                      <span className="text-[10px] font-bold">{t.typeLottery}</span>
                    </button>
                  </div>
                </div>

                {/* Checkbox Series */}
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
                     <div className="relative">
                       <input 
                         type="text" 
                         value={formData?.country || ''}
                         onChange={e => updateField('country', e.target.value)}
                         className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:border-brand-500 focus:outline-none pr-8"
                       />
                       <button 
                         onClick={regenerateId}
                         className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-brand-400 transition-colors"
                         title="Regenerar ID com base neste país"
                       >
                         <RefreshCw className="w-4 h-4" />
                       </button>
                     </div>
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
               disabled={isProcessing || isCompressing}
            >
              {t.cancel}
            </button>
          )}

          <div className="flex gap-3">
             {step === 'upload' ? (
                activeTab === 'image' ? (
                  <button
                    onClick={handleAnalyzeImage}
                    disabled={!frontFile || isProcessing || isCompressing}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold shadow-lg transition-all ${
                      !frontFile || isProcessing || isCompressing
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
                    onClick={handleWebSearch}
                    disabled={!searchQuery.trim() || isProcessing}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold shadow-lg transition-all ${
                      !searchQuery.trim() || isProcessing
                        ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/50"
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Pesquisando...
                      </>
                    ) : (
                      <>
                        <Globe className="w-4 h-4" />
                        Buscar Online
                      </>
                    )}
                  </button>
                )
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