import React, { useState, useEffect, useMemo } from 'react';
import { X, UploadCloud, Loader2, Sparkles, AlertCircle, Ticket, ArrowLeft, Check, CheckCircle, User, Printer, Layers, BarChart, DollarSign, RefreshCw, Coins, Search, Globe, AlignJustify, Gem, MapPin, Gift, Image as ImageIcon, FileSearch, ClipboardList, Package, Calendar, Trophy, Lock, ScanLine, Wand2, Cpu, Eye, Fingerprint, Zap, Database } from 'lucide-react';
import { analyzeImage, searchScratchcardInfo } from '../services/geminiService';
import { ScratchcardData, ScratchcardState, Continent, Category, LineType } from '../types';

interface UploadModalProps {
  onClose: () => void;
  onUploadComplete: (image: ScratchcardData) => void;
  existingImages?: ScratchcardData[];
  initialFile?: File | null;
  currentUser?: string | null;
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
        
        const MAX_WIDTH = 1200; // Increased for better quality OCR
        const MAX_HEIGHT = 1200;
        
        let width = img.width;
        let height = img.height;

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
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85); // Slightly better quality
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

export const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUploadComplete, existingImages = [], initialFile, currentUser, t }) => {
  const [step, setStep] = useState<'upload' | 'review'>('upload');
  const [activeTab, setActiveTab] = useState<'image' | 'web' | 'simple'>('image');
  
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  
  // Web Search State
  const [searchQuery, setSearchQuery] = useState('');
  
  // Simple Mode State
  const [simpleName, setSimpleName] = useState('');
  const [simpleCountry, setSimpleCountry] = useState('');
  const [simpleCategory, setSimpleCategory] = useState<Category>('boletim');
  const [simpleDate, setSimpleDate] = useState(new Date().toISOString().split('T')[0]);

  const [isProcessing, setIsProcessing] = useState(false);
  
  // Enhanced AI Feedback State
  const [aiStepIndex, setAiStepIndex] = useState(0);
  
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  
  const [formData, setFormData] = useState<ScratchcardData | null>(null);

  // AI Processing Steps - Cinematic Messages
  const aiMessages = [
    { text: "A inicializar visão computacional...", icon: Eye },
    { text: "A detetar textos e números (OCR)...", icon: ScanLine },
    { text: "A identificar país e moeda...", icon: Globe },
    { text: "A analisar padrões de jogo...", icon: Cpu },
    { text: "A verificar estado de conservação...", icon: Fingerprint },
    { text: "A compilar ficha técnica final...", icon: Database }
  ];

  const suggestions = useMemo(() => {
    const countries = new Set<string>();
    const regions = new Set<string>();
    const printers = new Set<string>();
    const collectors = new Set<string>();
    const emissions = new Set<string>();
    const sizes = new Set<string>();

    existingImages.forEach(img => {
      if (img.country) countries.add(img.country);
      if (img.region) regions.add(img.region);
      if (img.printer) printers.add(img.printer);
      if (img.collector) collectors.add(img.collector);
      if (img.emission) emissions.add(img.emission);
      if (img.size) sizes.add(img.size);
    });

    return {
      countries: Array.from(countries).sort(),
      regions: Array.from(regions).sort(),
      printers: Array.from(printers).sort(),
      collectors: Array.from(collectors).sort(),
      emissions: Array.from(emissions).sort(),
      sizes: Array.from(sizes).sort(),
      states: [
        'MINT', 'VOID', 'AMOSTRA', 'MUESTRA', 'CAMPIONE', 'SPECIMEN', 
        'MUSTER', 'ÉCHANTILLON', '견본', 'STEEKPROEF', 'PRØVE', 'PROV', '样本', 
        'SC', 'CS'
      ]
    };
  }, [existingImages]);

  // Handle Initial File
  useEffect(() => {
    if (initialFile) {
      processFile(initialFile, true);
    }
  }, [initialFile]);

  // AI Feedback Loop Animation
  useEffect(() => {
    let interval: any;
    if (isProcessing) {
      setAiStepIndex(0);
      interval = setInterval(() => {
        setAiStepIndex(prev => {
           if (prev < aiMessages.length - 1) return prev + 1;
           return prev;
        });
      }, 1500); // Change message every 1.5s
    }
    return () => clearInterval(interval);
  }, [isProcessing]);

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

  const createFormData = (analysis: any): ScratchcardData => {
    const smartId = generateNextId(analysis.country || 'Desconhecido');
    
    let defaultImage = 'https://placehold.co/600x400/1f2937/white?text=Sem+Imagem';
    if (analysis.category === 'boletim') defaultImage = 'https://placehold.co/600x800/064e3b/ffffff?text=BOLETIM';
    if (analysis.category === 'objeto') defaultImage = 'https://placehold.co/600x600/7c2d12/ffffff?text=OBJETO';

    const newCard: ScratchcardData = {
      id: Math.random().toString(36).substr(2, 9),
      customId: smartId,
      frontUrl: frontPreview || defaultImage,
      backUrl: backPreview || undefined,
      gameName: analysis.gameName || 'Novo Jogo',
      gameNumber: analysis.gameNumber || '',
      releaseDate: analysis.releaseDate || '',
      size: analysis.size || '',
      values: analysis.values || '',
      price: analysis.price || '',
      state: analysis.state || 'MINT',
      country: analysis.country || 'Portugal',
      region: analysis.region || '',
      continent: analysis.continent || 'Europa',
      collector: currentUser || '',
      emission: analysis.emission || '',
      printer: analysis.printer || '',
      isSeries: false,
      seriesDetails: '',
      lines: 'none', 
      isRarity: false,
      isPromotional: false,
      isWinner: false,
      prizeAmount: '', 
      category: analysis.category || 'raspadinha',
      createdAt: Date.now(),
      aiGenerated: true
    };
    setFormData(newCard);
    return newCard;
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
      setStep('review');
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
      setStep('review');
    } catch (err) {
      console.error(err);
      setError("Não foi possível encontrar informações online. Tente ser mais específico.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimpleCreate = () => {
     if (!simpleName || !simpleCountry) {
        setError("Nome e País são obrigatórios");
        return;
     }

     const dummyAnalysis = {
        gameName: simpleName,
        country: simpleCountry,
        category: simpleCategory,
        releaseDate: simpleDate,
        state: 'MINT',
        continent: 'Europa',
        gameNumber: '---',
     };
     
     const finalData = createFormData(dummyAnalysis);
     onUploadComplete(finalData);
     setShowSuccess(true);
     setTimeout(() => onClose(), 1500);
  };

  const handleSave = () => {
    if (formData) {
      const finalData = {
        ...formData,
        frontUrl: frontPreview || formData.frontUrl,
        backUrl: backPreview || formData.backUrl
      };

      onUploadComplete(finalData);
      setShowSuccess(true);
      setTimeout(() => onClose(), 1500);
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

  // Upload Box Component
  const UploadBox = ({ label, preview, isFront, icon: CustomIcon }: { label: string, preview: string | null, isFront: boolean, icon?: React.ElementType }) => (
    <div className="flex-1 group">
       <label className="block text-xs uppercase text-gray-400 font-bold mb-3 tracking-wider flex items-center gap-2 pl-1">
          {isFront ? <ScanLine className="w-3.5 h-3.5 text-brand-500" /> : <RefreshCw className="w-3.5 h-3.5 text-gray-500" />}
          {label}
       </label>
       {!preview ? (
          <div className={`relative border-2 border-dashed rounded-3xl h-72 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer overflow-hidden ${isCompressing ? 'border-brand-500/50 bg-brand-900/5' : 'border-gray-700 bg-gray-900/30 hover:border-brand-500 hover:bg-gray-800/50 hover:shadow-2xl hover:shadow-brand-500/10'}`}>
            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              accept="image/*"
              disabled={isCompressing}
              onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0], isFront)}
            />
            {isCompressing ? (
              <div className="flex flex-col items-center text-brand-400 animate-pulse">
                <Loader2 className="w-10 h-10 animate-spin mb-3" />
                <span className="text-xs font-bold tracking-wider uppercase">A Otimizar...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-gray-500 group-hover:text-brand-400 transition-colors transform group-hover:scale-105 duration-300">
                <div className="p-6 rounded-full bg-gray-800 border border-gray-700 group-hover:bg-brand-500/20 group-hover:border-brand-500/50 mb-4 transition-all shadow-lg group-hover:shadow-brand-500/20">
                  {CustomIcon ? <CustomIcon className="w-10 h-10" /> : <UploadCloud className="w-10 h-10" />}
                </div>
                <span className="text-sm font-bold text-white mb-1 tracking-wide">{t.clickDrag}</span>
                <span className="text-[10px] uppercase tracking-wide opacity-50 font-mono">JPG, PNG, WEBP</span>
              </div>
            )}
          </div>
       ) : (
         <div className="relative h-72 rounded-3xl overflow-hidden bg-black/40 border border-gray-700 group ring-0 hover:ring-2 ring-brand-500/50 transition-all shadow-xl">
           <img src={preview} alt={label} className="w-full h-full object-contain p-4" />
           <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-sm">
              <button 
                onClick={() => isFront ? (setFrontPreview(null), setFrontFile(null)) : (setBackPreview(null), setBackFile(null))}
                className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-2xl font-bold shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Trocar
              </button>
           </div>
           <div className="absolute top-4 right-4 animate-bounce-in">
             <div className="bg-green-500 text-white p-2 rounded-full shadow-lg shadow-green-900/50">
               <Check className="w-4 h-4" />
             </div>
           </div>
         </div>
       )}
    </div>
  );

  const CurrentAiIcon = aiMessages[aiStepIndex].icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/95 backdrop-blur-xl animate-fade-in">
      
      {/* Hidden Datalists for Autocomplete */}
      <div className="hidden">
          <datalist id="list-countries">{suggestions.countries.map(v => <option key={v} value={v} />)}</datalist>
          <datalist id="list-regions">{suggestions.regions.map(v => <option key={v} value={v} />)}</datalist>
          <datalist id="list-printers">{suggestions.printers.map(v => <option key={v} value={v} />)}</datalist>
          <datalist id="list-collectors">{suggestions.collectors.map(v => <option key={v} value={v} />)}</datalist>
          <datalist id="list-emissions">{suggestions.emissions.map(v => <option key={v} value={v} />)}</datalist>
          <datalist id="list-sizes">{suggestions.sizes.map(v => <option key={v} value={v} />)}</datalist>
          <datalist id="list-states">{suggestions.states.map(v => <option key={v} value={v} />)}</datalist>
      </div>

      {/* Main Modal Container */}
      <div className={`bg-gray-900/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] w-full ${step === 'review' ? 'max-w-[90vw] h-[90vh]' : 'max-w-4xl h-auto max-h-[90vh]'} shadow-2xl flex flex-col transition-all duration-500 relative overflow-hidden`}>
        
        {/* Top Gradient Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-600 via-purple-600 to-blue-600 z-20"></div>

        {/* --- AI PROCESSING OVERLAY (Immersive) --- */}
        {isProcessing && (
           <div className="absolute inset-0 z-[60] bg-slate-950 flex flex-col items-center justify-center animate-fade-in">
              <div className="relative mb-16">
                 {/* Glowing Core */}
                 <div className="absolute inset-0 bg-brand-500/20 blur-[100px] rounded-full animate-pulse-slow"></div>
                 <div className="relative bg-slate-900 p-8 rounded-full border border-brand-500/30 shadow-[0_0_50px_rgba(244,63,94,0.3)] animate-bounce">
                    <CurrentAiIcon className="w-20 h-20 text-brand-400 animate-pulse" />
                 </div>
                 
                 {/* Orbiting Particles */}
                 <div className="absolute top-1/2 left-1/2 w-[200px] h-[200px] border border-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 animate-spin-slow">
                    <div className="absolute top-0 left-1/2 w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_15px_#3b82f6]"></div>
                 </div>
                 <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] border border-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 animate-spin-reverse-slow opacity-50">
                    <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_15px_#a855f7]"></div>
                 </div>
              </div>
              
              <div className="text-center space-y-6 max-w-md px-6">
                 <h3 className="text-4xl font-black text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-200 to-brand-500">
                    IA a Analisar
                 </h3>
                 
                 {/* Animated Text Feed */}
                 <div className="h-12 relative overflow-hidden w-full">
                    {aiMessages.map((msg, idx) => (
                       <p 
                         key={idx} 
                         className={`absolute inset-0 flex items-center justify-center text-lg font-medium text-brand-200 transition-all duration-500 transform ${idx === aiStepIndex ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}
                       >
                          {msg.text}
                       </p>
                    ))}
                 </div>

                 {/* High-tech Progress Bar */}
                 <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden mt-8 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                    <div 
                        className="h-full bg-gradient-to-r from-brand-600 to-purple-600 transition-all duration-300 ease-out shadow-[0_0_20px_rgba(244,63,94,0.5)]" 
                        style={{ width: `${((aiStepIndex + 1) / aiMessages.length) * 100}%` }}
                    ></div>
                 </div>
              </div>
           </div>
        )}

        {/* Success Toast Overlay */}
        {showSuccess && (
          <div className="absolute inset-0 z-[70] bg-green-900/90 backdrop-blur-xl flex flex-col items-center justify-center animate-fade-in">
             <div className="bg-white p-6 rounded-full shadow-[0_0_50px_rgba(34,197,94,0.5)] mb-8 animate-bounce-in">
               <CheckCircle className="w-24 h-24 text-green-600" />
             </div>
             <h2 className="text-5xl font-black text-white mb-2 tracking-tight">{t.success}</h2>
             <p className="text-green-200 text-xl font-medium">{t.saved}</p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/5 shrink-0">
          <div className="flex items-center gap-4">
             <div className="bg-gradient-to-br from-brand-600 to-brand-900 p-3 rounded-2xl shadow-lg shadow-brand-900/30 border border-white/10">
                <Wand2 className="w-6 h-6 text-white" />
             </div>
             <div>
               <h2 className="text-2xl font-bold text-white tracking-tight">
                 {step === 'upload' ? t.title : t.reviewTitle}
               </h2>
               <div className="flex items-center gap-3 mt-1">
                 <p className="text-xs text-gray-400 font-medium">
                    {step === 'upload' ? "Adicione novas raspadinhas ao arquivo" : "Verifique os dados extraídos pela IA"}
                 </p>
                 {currentUser && (
                    <span className="text-[10px] bg-brand-500/10 text-brand-300 px-2.5 py-0.5 rounded-full border border-brand-500/20 flex items-center gap-1.5 font-bold">
                       <User className="w-3 h-3" /> {currentUser}
                    </span>
                 )}
               </div>
             </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-3 rounded-xl transition-all hover:rotate-90">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs (Only in Upload Step) */}
        {step === 'upload' && (
          <div className="px-8 pt-6 pb-2 shrink-0">
             <div className="p-1.5 bg-gray-950/50 rounded-2xl border border-white/5 flex gap-1 relative">
               <button
                 onClick={() => setActiveTab('image')}
                 className={`flex-1 py-3 px-4 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'image' ? 'bg-gray-800 text-white shadow-lg border border-white/5 ring-1 ring-white/10' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
               >
                 <ImageIcon className="w-4 h-4" />
                 Via Imagem (IA)
               </button>
               <button
                 onClick={() => setActiveTab('web')}
                 className={`flex-1 py-3 px-4 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'web' ? 'bg-gray-800 text-white shadow-lg border border-white/5 ring-1 ring-white/10' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
               >
                 <Globe className="w-4 h-4" />
                 Web/SCML
               </button>
               <button
                 onClick={() => setActiveTab('simple')}
                 className={`flex-1 py-3 px-4 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'simple' ? 'bg-gray-800 text-white shadow-lg border border-white/5 ring-1 ring-white/10' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
               >
                 <ClipboardList className="w-4 h-4" />
                 Registo Rápido
               </button>
             </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          {step === 'upload' ? (
            <div className="max-w-4xl mx-auto h-full flex flex-col justify-center">
              {error && (
                <div className="mb-8 bg-red-500/10 border border-red-500/30 text-red-200 p-4 rounded-2xl flex items-center gap-3 text-sm animate-fade-in shadow-lg shadow-red-900/10">
                  <div className="bg-red-500/20 p-2 rounded-full">
                     <AlertCircle className="w-5 h-5 text-red-400" />
                  </div>
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {activeTab === 'image' && (
                <div className="animate-fade-in space-y-8">
                  <div className="flex flex-col sm:flex-row gap-8">
                    <UploadBox label={t.front} preview={frontPreview} isFront={true} />
                    <UploadBox label={t.back} preview={backPreview} isFront={false} />
                  </div>
                  
                  {/* Info Card */}
                  <div className="bg-gradient-to-r from-brand-900/20 to-purple-900/20 border border-white/5 p-6 rounded-2xl flex items-center gap-5 backdrop-blur-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-[40px]"></div>
                      <div className="bg-gray-900/80 p-4 rounded-xl border border-white/10 shadow-lg">
                        <Sparkles className="w-6 h-6 text-brand-400 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-lg mb-1">IA Pronta a Analisar</h4>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-lg">Carregue a frente (e verso opcional). O nosso sistema irá extrair automaticamente o nome, número, emissão, gráfica e muito mais.</p>
                      </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'web' && (
                <div className="space-y-8 animate-fade-in py-8">
                  <div className="bg-blue-900/10 border border-blue-500/20 p-8 rounded-3xl flex flex-col items-center text-center gap-4 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="bg-blue-500/20 p-4 rounded-2xl shadow-xl shadow-blue-900/20 mb-2">
                       <FileSearch className="w-12 h-12 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-blue-100 font-bold text-2xl mb-2">Base de Dados SCML & Web</h4>
                      <p className="text-blue-200/60 text-base leading-relaxed max-w-lg mx-auto">
                        Pesquise por "Novas raspadinhas Santa Casa" ou o nome específico do jogo. A IA irá cruzar dados técnicos oficiais para preencher a ficha.
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative group max-w-2xl mx-auto">
                    <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 to-blue-500 rounded-2xl opacity-30 group-focus-within:opacity-100 transition duration-500 blur-md"></div>
                    <div className="relative bg-gray-900 rounded-2xl flex items-center p-2 border border-white/10">
                       <Search className="ml-4 w-6 h-6 text-gray-500" />
                       <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Ex: Nova Raspadinha Pé de Meia"
                        className="w-full bg-transparent border-none text-white px-4 py-5 focus:ring-0 focus:outline-none text-xl placeholder-gray-600 font-medium"
                        onKeyDown={(e) => e.key === 'Enter' && handleWebSearch()}
                       />
                       <button 
                         onClick={handleWebSearch}
                         disabled={!searchQuery.trim()}
                         className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:scale-105 active:scale-95"
                       >
                         Buscar
                       </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'simple' && (
                <div className="space-y-8 animate-fade-in">
                   <div className="flex gap-6">
                      <button 
                        onClick={() => setSimpleCategory('boletim')}
                        className={`flex-1 p-8 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 group ${simpleCategory === 'boletim' ? 'bg-green-900/10 border-green-500/50 shadow-xl shadow-green-900/10 scale-[1.02]' : 'bg-gray-900/30 border-gray-800 hover:border-gray-600 hover:bg-gray-800/50'}`}
                      >
                         <div className={`p-5 rounded-2xl ${simpleCategory === 'boletim' ? 'bg-green-500 text-white shadow-lg' : 'bg-gray-800 text-gray-500 group-hover:text-gray-300'}`}>
                            <ClipboardList className="w-10 h-10" />
                         </div>
                         <div className="text-center">
                            <span className={`text-lg font-bold block ${simpleCategory === 'boletim' ? 'text-green-400' : 'text-gray-400'}`}>Registar Boletim</span>
                            <span className="text-sm text-gray-500 mt-1 block">Euromilhões, Totoloto...</span>
                         </div>
                      </button>
                      <button 
                        onClick={() => setSimpleCategory('objeto')}
                        className={`flex-1 p-8 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 group ${simpleCategory === 'objeto' ? 'bg-orange-900/10 border-orange-500/50 shadow-xl shadow-orange-900/10 scale-[1.02]' : 'bg-gray-900/30 border-gray-800 hover:border-gray-600 hover:bg-gray-800/50'}`}
                      >
                         <div className={`p-5 rounded-2xl ${simpleCategory === 'objeto' ? 'bg-orange-500 text-white shadow-lg' : 'bg-gray-800 text-gray-500 group-hover:text-gray-300'}`}>
                            <Package className="w-10 h-10" />
                         </div>
                         <div className="text-center">
                            <span className={`text-lg font-bold block ${simpleCategory === 'objeto' ? 'text-orange-400' : 'text-gray-400'}`}>Registar Objeto</span>
                            <span className="text-sm text-gray-500 mt-1 block">Catálogos, Brindes, Moedas...</span>
                         </div>
                      </button>
                   </div>

                   <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8 space-y-6 relative overflow-hidden backdrop-blur-sm">
                      <div className={`absolute -top-10 -right-10 w-48 h-48 blur-[80px] rounded-full pointer-events-none opacity-20 transition-colors duration-500 ${simpleCategory === 'boletim' ? 'bg-green-500' : 'bg-orange-500'}`}></div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        <div className="md:col-span-2">
                            <label className="block text-xs uppercase text-gray-400 font-bold mb-2 ml-1">Nome do Item</label>
                            <input 
                              type="text"
                              placeholder={`Ex: ${simpleCategory === 'boletim' ? 'Boletim Euromilhões 2024' : 'Catálogo de Natal'}`}
                              className="w-full bg-gray-950/50 border border-gray-700 rounded-xl px-5 py-4 text-white focus:border-brand-500 outline-none text-xl font-bold shadow-inner focus:ring-1 focus:ring-brand-500/30 transition-all"
                              value={simpleName}
                              onChange={(e) => setSimpleName(e.target.value)}
                              autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-gray-400 font-bold mb-2 ml-1">País</label>
                            <div className="relative group">
                               <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-500 transition-colors" />
                               <input 
                                 type="text"
                                 list="list-countries"
                                 placeholder="Ex: Portugal"
                                 className="w-full bg-gray-950/50 border border-gray-700 rounded-xl pl-11 pr-4 py-3 text-white focus:border-brand-500 outline-none transition-all"
                                 value={simpleCountry}
                                 onChange={(e) => setSimpleCountry(e.target.value)}
                               />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-gray-400 font-bold mb-2 ml-1">Data de Registo</label>
                            <div className="relative group">
                               <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-500 transition-colors" />
                               <input 
                                  type="date"
                                  className="w-full bg-gray-950/50 border border-gray-700 rounded-xl pl-11 pr-4 py-3 text-white focus:border-brand-500 outline-none transition-all"
                                  value={simpleDate}
                                  onChange={(e) => setSimpleDate(e.target.value)}
                               />
                            </div>
                        </div>
                        
                        <div className="md:col-span-2 pt-2">
                            <label className="block text-xs uppercase text-gray-400 font-bold mb-3 ml-1">Imagem (Opcional)</label>
                            <div className="flex gap-4">
                              <UploadBox 
                                label="Foto do Item" 
                                preview={frontPreview} 
                                isFront={true} 
                                icon={simpleCategory === 'boletim' ? ClipboardList : Package} 
                              />
                            </div>
                        </div>
                      </div>
                   </div>
                </div>
              )}
            </div>
          ) : (
            // REVIEW STEP
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in h-full">
              
              {/* Left Column: Image & Basic Flags (Sticky) */}
              <div className="lg:col-span-4 space-y-6 flex flex-col h-full overflow-y-auto pr-2 custom-scrollbar">
                <div className="bg-black/20 rounded-3xl border border-white/5 overflow-hidden relative group flex items-center justify-center min-h-[400px] shadow-inner">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                  <img src={frontPreview || formData?.frontUrl || ''} className="w-full h-full object-contain p-4 relative z-10 drop-shadow-2xl" alt="Frente" />
                  <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm z-20">
                    <UploadCloud className="w-12 h-12 text-white mb-3" />
                    <span className="text-base text-white font-bold bg-white/10 px-6 py-3 rounded-full backdrop-blur-md">Alterar Imagem</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0], true)} />
                  </label>
                </div>
                
                {/* Visual Category Selector Cards */}
                <div className="grid grid-cols-2 gap-3">
                    {['raspadinha', 'lotaria', 'boletim', 'objeto'].map((cat) => (
                       <button
                         key={cat}
                         onClick={() => updateField('category', cat)}
                         className={`relative p-4 rounded-2xl border transition-all flex flex-col items-center gap-3 group ${formData?.category === cat ? 'bg-gray-800 border-brand-500/50 ring-1 ring-brand-500/20 shadow-lg' : 'bg-gray-900/50 border-gray-800 hover:bg-gray-800 hover:border-gray-700'}`}
                       >
                         {cat === 'raspadinha' && <Coins className={`w-6 h-6 ${formData?.category === cat ? 'text-brand-400' : 'text-gray-600 group-hover:text-gray-400'}`} />}
                         {cat === 'lotaria' && <Ticket className={`w-6 h-6 ${formData?.category === cat ? 'text-purple-400' : 'text-gray-600 group-hover:text-gray-400'}`} />}
                         {cat === 'boletim' && <ClipboardList className={`w-6 h-6 ${formData?.category === cat ? 'text-green-400' : 'text-gray-600 group-hover:text-gray-400'}`} />}
                         {cat === 'objeto' && <Package className={`w-6 h-6 ${formData?.category === cat ? 'text-orange-400' : 'text-gray-600 group-hover:text-gray-400'}`} />}
                         
                         <span className={`text-xs font-bold uppercase tracking-wider ${formData?.category === cat ? 'text-white' : 'text-gray-600'}`}>
                            {cat === 'raspadinha' ? t.typeScratch : cat === 'lotaria' ? t.typeLottery : cat === 'boletim' ? t.typeBulletin : t.typeObject}
                         </span>
                         {formData?.category === cat && <div className="absolute top-3 right-3 w-2 h-2 bg-brand-500 rounded-full shadow-lg shadow-brand-500/50 animate-pulse"></div>}
                       </button>
                    ))}
                </div>

                 {/* Attribute Toggles */}
                 <div className="space-y-3">
                   {/* Series Toggle */}
                   <div 
                     className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${formData?.isSeries ? 'bg-brand-900/10 border-brand-500/30' : 'bg-gray-900/50 border-gray-800 hover:bg-gray-800'}`}
                     onClick={() => updateField('isSeries', !formData?.isSeries)}
                   >
                      <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-xl ${formData?.isSeries ? 'bg-brand-500 text-white shadow-lg shadow-brand-900/20' : 'bg-gray-800 text-gray-500'}`}>
                           <Layers className="w-5 h-5" />
                         </div>
                         <div className="flex flex-col">
                           <span className={`text-sm font-bold uppercase tracking-wide ${formData?.isSeries ? 'text-white' : 'text-gray-400'}`}>{t.isSeries}</span>
                         </div>
                      </div>
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${formData?.isSeries ? 'bg-brand-500 border-brand-500' : 'border-gray-700'}`}>
                        {formData?.isSeries && <Check className="w-4 h-4 text-white" />}
                      </div>
                   </div>
                   {formData?.isSeries && (
                        <div className="pl-4 animate-fade-in">
                           <input 
                             type="text" 
                             value={formData.seriesDetails || ''}
                             onChange={(e) => updateField('seriesDetails', e.target.value)}
                             placeholder={t.seriesDetailsPlaceholder}
                             className="w-full bg-gray-900/80 border border-brand-500/30 text-white text-sm rounded-xl px-4 py-3 focus:border-brand-500 outline-none placeholder-gray-600 shadow-inner"
                           />
                        </div>
                   )}

                   {/* Rarity Toggle */}
                   <div 
                     className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${formData?.isRarity ? 'bg-gold-900/10 border-gold-500/30' : 'bg-gray-900/50 border-gray-800 hover:bg-gray-800'}`}
                     onClick={() => updateField('isRarity', !formData?.isRarity)}
                   >
                      <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-xl ${formData?.isRarity ? 'bg-gold-500 text-white shadow-lg shadow-gold-900/20' : 'bg-gray-800 text-gray-500'}`}>
                           <Gem className="w-5 h-5" />
                         </div>
                         <span className={`text-sm font-bold uppercase tracking-wide ${formData?.isRarity ? 'text-gold-200' : 'text-gray-400'}`}>{t.isRarity}</span>
                      </div>
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${formData?.isRarity ? 'bg-gold-500 border-gold-500' : 'border-gray-700'}`}>
                        {formData?.isRarity && <Check className="w-4 h-4 text-white" />}
                      </div>
                   </div>

                   {/* Promotional Toggle */}
                   <div 
                     className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${formData?.isPromotional ? 'bg-pink-900/10 border-pink-500/30' : 'bg-gray-900/50 border-gray-800 hover:bg-gray-800'}`}
                     onClick={() => updateField('isPromotional', !formData?.isPromotional)}
                   >
                      <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-xl ${formData?.isPromotional ? 'bg-pink-500 text-white shadow-lg shadow-pink-900/20' : 'bg-gray-800 text-gray-500'}`}>
                           <Gift className="w-5 h-5" />
                         </div>
                         <span className={`text-sm font-bold uppercase tracking-wide ${formData?.isPromotional ? 'text-pink-200' : 'text-gray-400'}`}>{t.isPromotional}</span>
                      </div>
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${formData?.isPromotional ? 'bg-pink-500 border-pink-500' : 'border-gray-700'}`}>
                        {formData?.isPromotional && <Check className="w-4 h-4 text-white" />}
                      </div>
                   </div>

                   {/* WINNER Toggle */}
                   <div 
                     className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${formData?.isWinner ? 'bg-green-900/10 border-green-500/30' : 'bg-gray-900/50 border-gray-800 hover:bg-gray-800'}`}
                     onClick={() => updateField('isWinner', !formData?.isWinner)}
                   >
                      <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-xl ${formData?.isWinner ? 'bg-green-500 text-white shadow-lg shadow-green-900/20' : 'bg-gray-800 text-gray-500'}`}>
                           <Trophy className="w-5 h-5" />
                         </div>
                         <span className={`text-sm font-bold uppercase tracking-wide ${formData?.isWinner ? 'text-green-300' : 'text-gray-400'}`}>{t.isWinner}</span>
                      </div>
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${formData?.isWinner ? 'bg-green-500 border-green-500' : 'border-gray-700'}`}>
                        {formData?.isWinner && <Check className="w-4 h-4 text-white" />}
                      </div>
                   </div>
                   {formData?.isWinner && (
                        <div className="pl-4 animate-fade-in">
                           <input 
                             type="text" 
                             value={formData.prizeAmount || ''}
                             onChange={(e) => updateField('prizeAmount', e.target.value)}
                             placeholder={t.prizeAmountPlaceholder}
                             className="w-full bg-gray-900/80 border border-green-500/30 text-white text-sm rounded-xl px-4 py-3 focus:border-green-500 outline-none placeholder-gray-600 shadow-inner font-bold text-lg"
                           />
                        </div>
                   )}
                 </div>
              </div>

              {/* Right: Detailed Form */}
              <div className="lg:col-span-8 bg-gray-900/40 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-md overflow-y-auto custom-scrollbar h-full">
                <div className="grid grid-cols-2 gap-6">
                   <div className="col-span-2">
                     <label className="block text-xs uppercase text-gray-400 font-bold mb-2 tracking-widest pl-1">{t.gameName}</label>
                     <input 
                       type="text" 
                       value={formData?.gameName || ''}
                       onChange={e => updateField('gameName', e.target.value)}
                       className="w-full bg-gray-950/50 border border-gray-700 rounded-xl px-5 py-4 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 focus:outline-none text-2xl font-black shadow-inner"
                     />
                   </div>
                   
                   <div>
                     <label className="block text-xs uppercase text-gray-400 font-bold mb-2 tracking-widest pl-1">{t.country}</label>
                     <div className="relative group">
                       <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-500 transition-colors" />
                       <input 
                         type="text" 
                         list="list-countries"
                         value={formData?.country || ''}
                         onChange={e => updateField('country', e.target.value)}
                         className="w-full bg-gray-950/50 border border-gray-700 rounded-xl pl-11 pr-4 py-3 text-white focus:border-brand-500 focus:outline-none text-sm transition-all"
                       />
                       <button 
                         onClick={regenerateId}
                         className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-brand-400 transition-colors p-2 hover:bg-white/5 rounded-lg"
                         title="Regenerar ID"
                       >
                         <RefreshCw className="w-3.5 h-3.5" />
                       </button>
                     </div>
                   </div>

                   <div>
                     <label className="block text-xs uppercase text-gray-400 font-bold mb-2 tracking-widest pl-1">{t.region}</label>
                     <div className="relative group">
                       <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-500 transition-colors" />
                       <input 
                         type="text" 
                         list="list-regions"
                         value={formData?.region || ''}
                         onChange={e => updateField('region', e.target.value)}
                         placeholder="Ex: Baviera, Açores"
                         className="w-full bg-gray-950/50 border border-gray-700 rounded-xl pl-11 pr-4 py-3 text-white focus:border-brand-500 focus:outline-none text-sm placeholder-gray-600 transition-all"
                       />
                     </div>
                   </div>

                   <div>
                     <label className="block text-xs uppercase text-gray-400 font-bold mb-2 tracking-widest pl-1">{t.continent}</label>
                     <div className="relative">
                        <select 
                          value={formData?.continent || ''}
                          onChange={e => updateField('continent', e.target.value as Continent)}
                          className="w-full bg-gray-950/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 focus:outline-none text-sm cursor-pointer appearance-none transition-all"
                        >
                          {['Europa', 'América', 'Ásia', 'África', 'Oceania'].map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                           <AlignJustify className="w-4 h-4 text-gray-500" />
                        </div>
                     </div>
                   </div>

                   <div>
                     <label className="block text-xs uppercase text-gray-400 font-bold mb-2 tracking-widest pl-1">{t.state}</label>
                     <input
                       type="text"
                       list="list-states"
                       value={formData?.state || ''}
                       onChange={e => updateField('state', e.target.value as ScratchcardState)}
                       placeholder="Ex: MINT, SPECIMEN..."
                       className="w-full bg-gray-950/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 focus:outline-none text-sm transition-all font-bold tracking-wide"
                     />
                   </div>

                   <div>
                     <label className="block text-xs uppercase text-gray-400 font-bold mb-2 tracking-widest pl-1">{t.customId}</label>
                     <div className="relative">
                       <input 
                         type="text" 
                         value={formData?.customId || ''}
                         onChange={e => updateField('customId', e.target.value)}
                         className="w-full bg-gray-950/50 border border-gray-700 rounded-xl px-4 py-3 text-brand-400 font-mono font-bold focus:border-brand-500 focus:outline-none text-sm tracking-widest"
                       />
                       <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
                     </div>
                   </div>

                   <div>
                     <label className="block text-xs uppercase text-gray-400 font-bold mb-2 tracking-widest pl-1">{t.collector}</label>
                     <div className="relative group">
                       {currentUser && formData?.collector === currentUser ? (
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
                             <Lock className="w-3.5 h-3.5 text-brand-500" />
                          </div>
                       ) : (
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-500" />
                       )}
                       
                       <input 
                         type="text" 
                         list="list-collectors"
                         value={formData?.collector || ''}
                         onChange={e => updateField('collector', e.target.value)}
                         placeholder={t.collector}
                         readOnly={!!currentUser && formData?.collector === currentUser}
                         className={`w-full bg-gray-950/50 border rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none text-sm placeholder-gray-600 transition-all ${currentUser && formData?.collector === currentUser ? 'border-brand-500/50 bg-brand-900/5 text-brand-100 font-bold' : 'border-gray-700 focus:border-brand-500'}`}
                       />
                       
                       {currentUser && formData?.collector === currentUser && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-brand-500/20 px-2 py-0.5 rounded text-[9px] text-brand-400 font-bold border border-brand-500/30">
                             <CheckCircle className="w-3 h-3" /> Auto
                          </div>
                       )}
                     </div>
                   </div>

                   <div>
                     <label className="block text-xs uppercase text-gray-400 font-bold mb-2 tracking-widest pl-1">{t.releaseDate}</label>
                     <input 
                       type="text" 
                       value={formData?.releaseDate || ''}
                       onChange={e => updateField('releaseDate', e.target.value)}
                       placeholder="YYYY-MM-DD"
                       className="w-full bg-gray-950/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 focus:outline-none text-sm transition-all"
                     />
                   </div>

                   <div>
                     <label className="block text-xs uppercase text-gray-400 font-bold mb-2 tracking-widest pl-1">{t.size}</label>
                     <input 
                       type="text" 
                       list="list-sizes"
                       value={formData?.size || ''}
                       onChange={e => updateField('size', e.target.value)}
                       placeholder="Ex: 10x5cm"
                       className="w-full bg-gray-950/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 focus:outline-none text-sm transition-all"
                     />
                   </div>

                   <div>
                     <label className="block text-xs uppercase text-gray-400 font-bold mb-2 tracking-widest pl-1">{t.price}</label>
                     <div className="relative group">
                       <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-green-500" />
                       <input 
                         type="text" 
                         value={formData?.price || ''}
                         onChange={e => updateField('price', e.target.value)}
                         placeholder="Ex: 5€"
                         className="w-full bg-gray-950/50 border border-gray-700 rounded-xl pl-11 pr-4 py-3 text-white focus:border-brand-500 focus:outline-none text-sm transition-all"
                       />
                     </div>
                   </div>

                   <div>
                     <label className="block text-xs uppercase text-gray-400 font-bold mb-2 tracking-widest pl-1">{t.emission}</label>
                     <div className="relative group">
                       <BarChart className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-500" />
                       <input 
                         type="text" 
                         list="list-emissions"
                         value={formData?.emission || ''}
                         onChange={e => updateField('emission', e.target.value)}
                         placeholder="Ex: 500k"
                         className="w-full bg-gray-950/50 border border-gray-700 rounded-xl pl-11 pr-4 py-3 text-white focus:border-brand-500 focus:outline-none text-sm transition-all"
                       />
                     </div>
                   </div>

                   <div className="col-span-2">
                     <label className="block text-xs uppercase text-gray-400 font-bold mb-2 tracking-widest pl-1">{t.printer}</label>
                     <div className="relative group">
                       <Printer className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-500" />
                       <input 
                         type="text" 
                         list="list-printers"
                         value={formData?.printer || ''}
                         onChange={e => updateField('printer', e.target.value)}
                         placeholder="Ex: Scientific Games"
                         className="w-full bg-gray-950/50 border border-gray-700 rounded-xl pl-11 pr-4 py-3 text-white focus:border-brand-500 focus:outline-none text-sm transition-all"
                       />
                     </div>
                   </div>

                   {/* Line Type Selector */}
                   <div className="col-span-2">
                      <label className="block text-xs uppercase text-gray-400 font-bold mb-2 tracking-widest pl-1">{t.lines}</label>
                      <div className="relative group">
                        <AlignJustify className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-500" />
                        <select
                          value={formData?.lines || 'none'}
                          onChange={(e) => updateField('lines', e.target.value as LineType)}
                          className="w-full bg-gray-950/50 border border-gray-700 rounded-xl pl-11 pr-4 py-3 text-white focus:border-brand-500 focus:outline-none appearance-none cursor-pointer text-sm transition-all"
                        >
                          <option value="none">{t.linesNone}</option>
                          <option value="blue">{t.linesBlue}</option>
                          <option value="red">{t.linesRed}</option>
                          <option value="multicolor">{t.linesMulti}</option>
                        </select>
                      </div>
                   </div>
                   
                   <div className="col-span-2">
                     <label className={`block text-xs uppercase font-bold mb-2 tracking-widest pl-1 ${formData?.isRarity ? 'text-gold-400' : 'text-gray-400'}`}>
                        {formData?.isRarity ? t.rarityInfo : t.values}
                     </label>
                     <textarea 
                       value={formData?.values || ''}
                       onChange={e => updateField('values', e.target.value)}
                       className={`w-full bg-gray-950/50 border rounded-xl px-5 py-4 text-white focus:outline-none h-32 text-sm leading-relaxed transition-all shadow-inner resize-none ${formData?.isRarity ? 'border-gold-500/50 focus:border-gold-500' : 'border-gray-700 focus:border-brand-500'}`}
                     />
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-gray-900/80 backdrop-blur-md flex justify-between items-center z-10 shrink-0">
          {step === 'review' ? (
             <button
               onClick={() => setStep('upload')}
               className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-bold px-6 py-4 hover:bg-white/5 rounded-2xl"
             >
               <ArrowLeft className="w-5 h-5" /> {t.backBtn}
             </button>
          ) : (
            <button
               onClick={onClose}
               className="text-gray-400 hover:text-white transition-colors text-sm font-bold px-6 py-4 hover:bg-white/5 rounded-2xl"
               disabled={isProcessing || isCompressing}
            >
              {t.cancel}
            </button>
          )}

          <div className="flex gap-4">
             {step === 'upload' ? (
                activeTab === 'image' ? (
                  <button
                    onClick={handleAnalyzeImage}
                    disabled={!frontFile || isProcessing || isCompressing}
                    className={`flex items-center gap-3 px-10 py-5 rounded-2xl text-base font-bold shadow-xl transition-all hover:scale-[1.02] active:scale-95 ${
                      !frontFile || isProcessing || isCompressing
                        ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
                        : "bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white shadow-brand-900/40 border border-brand-400/20"
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <Zap className="w-5 h-5 animate-pulse" />
                        Digitalizando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        {t.analyze}
                      </>
                    )}
                  </button>
                ) : activeTab === 'web' ? (
                  <button
                    onClick={handleWebSearch}
                    disabled={!searchQuery.trim() || isProcessing}
                    className={`flex items-center gap-3 px-10 py-5 rounded-2xl text-base font-bold shadow-xl transition-all hover:scale-[1.02] active:scale-95 ${
                      !searchQuery.trim() || isProcessing
                        ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
                        : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-blue-900/40 border border-blue-400/20"
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Pesquisando...
                      </>
                    ) : (
                      <>
                        <Globe className="w-5 h-5" />
                        Buscar Online
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleSimpleCreate}
                    className={`flex items-center gap-3 px-10 py-5 rounded-2xl text-base font-bold shadow-xl transition-all hover:scale-[1.02] active:scale-95 ${
                       !simpleName || !simpleCountry 
                         ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
                         : simpleCategory === 'boletim' 
                            ? "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white shadow-green-900/40 border border-green-400/20" 
                            : "bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white shadow-orange-900/40 border border-orange-400/20"
                    }`}
                  >
                    {simpleCategory === 'boletim' ? <ClipboardList className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                    Guardar {simpleCategory === 'boletim' ? 'Boletim' : 'Objeto'}
                  </button>
                )
             ) : (
               <button
                  onClick={handleSave}
                  disabled={showSuccess}
                  className={`flex items-center gap-3 px-12 py-5 rounded-2xl text-base font-bold shadow-xl transition-all hover:scale-[1.02] active:scale-95 ${
                    showSuccess 
                      ? "bg-green-700 text-white cursor-default" 
                      : "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white shadow-green-900/40 border border-green-400/20"
                  }`}
                >
                  {showSuccess ? (
                    <>
                      <CheckCircle className="w-5 h-5 animate-bounce" />
                      {t.saved}
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
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