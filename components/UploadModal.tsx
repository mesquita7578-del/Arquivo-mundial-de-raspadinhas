import React, { useState, useEffect, useMemo } from 'react';
import { X, UploadCloud, Loader2, Sparkles, AlertCircle, Ticket, ArrowLeft, Check, CheckCircle, User, Printer, Layers, BarChart, DollarSign, RefreshCw, Coins, Search, Globe, AlignJustify, Gem, MapPin, Gift, Image as ImageIcon, FileSearch, ClipboardList, Package, Calendar } from 'lucide-react';
import { analyzeImage, searchScratchcardInfo } from '../services/geminiService';
import { ScratchcardData, ScratchcardState, Continent, Category, LineType } from '../types';

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
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  
  const [formData, setFormData] = useState<ScratchcardData | null>(null);

  // Generate unique lists for autocomplete from existing data
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
      states: ['MINT', 'VOID', 'AMOSTRA', 'MUESTRA', 'CAMPIONE', 'SPECIMEN', 'SC', 'CS']
    };
  }, [existingImages]);

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

  // Modified to return data and allow custom image override
  const createFormData = (analysis: any): ScratchcardData => {
    const smartId = generateNextId(analysis.country || 'Desconhecido');
    
    // Dynamic placeholder based on category if no image provided
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
      collector: '',
      emission: analysis.emission || '',
      printer: analysis.printer || '',
      isSeries: false,
      seriesDetails: '',
      lines: 'none', 
      isRarity: false,
      isPromotional: false,
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
      setStep('review'); // Standard flow goes to review
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
      setStep('review'); // Web search goes to review
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
     
     // INSTANT SAVE: Create data and skip review
     const finalData = createFormData(dummyAnalysis);
     
     // Explicitly use the generated data to save immediately
     onUploadComplete(finalData);
     setShowSuccess(true);
     setTimeout(() => {
       onClose();
     }, 1500);
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

  const UploadBox = ({ label, preview, isFront, icon: CustomIcon }: { label: string, preview: string | null, isFront: boolean, icon?: React.ElementType }) => (
    <div className="flex-1 group">
       <label className="block text-xs uppercase text-gray-500 font-bold mb-2 ml-1">{label}</label>
       {!preview ? (
          <div className={`relative border-2 border-dashed rounded-2xl h-56 flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden ${isCompressing ? 'border-brand-500/50 bg-brand-900/5' : 'border-gray-700 bg-gray-900/50 hover:border-brand-500 hover:bg-gray-800'}`}>
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
                <span className="text-xs font-bold tracking-wider uppercase">Otimizando...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-gray-500 group-hover:text-brand-400 transition-colors">
                <div className="p-4 rounded-full bg-gray-800 group-hover:bg-brand-900/20 mb-3 transition-colors">
                  {CustomIcon ? <CustomIcon className="w-8 h-8" /> : <UploadCloud className="w-8 h-8" />}
                </div>
                <span className="text-sm font-medium">{t.clickDrag}</span>
                <span className="text-xs opacity-50 mt-1">JPG, PNG, WEBP</span>
              </div>
            )}
          </div>
       ) : (
         <div className="relative h-56 rounded-2xl overflow-hidden bg-black/40 border border-gray-700 group ring-0 hover:ring-2 ring-brand-500/50 transition-all">
           <img src={preview} alt={label} className="w-full h-full object-contain p-2" />
           <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
              <button 
                onClick={() => isFront ? (setFrontPreview(null), setFrontFile(null)) : (setBackPreview(null), setBackFile(null))}
                className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Trocar
              </button>
           </div>
           <div className="absolute top-2 right-2">
             <div className="bg-green-500/20 backdrop-blur-md p-1.5 rounded-full border border-green-500/50">
               <Check className="w-4 h-4 text-green-400" />
             </div>
           </div>
         </div>
       )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      
      {/* Hidden Datalists for Autocomplete */}
      <datalist id="list-countries">
        {suggestions.countries.map(v => <option key={v} value={v} />)}
      </datalist>
      <datalist id="list-regions">
        {suggestions.regions.map(v => <option key={v} value={v} />)}
      </datalist>
      <datalist id="list-printers">
        {suggestions.printers.map(v => <option key={v} value={v} />)}
      </datalist>
      <datalist id="list-collectors">
        {suggestions.collectors.map(v => <option key={v} value={v} />)}
      </datalist>
      <datalist id="list-emissions">
        {suggestions.emissions.map(v => <option key={v} value={v} />)}
      </datalist>
      <datalist id="list-sizes">
        {suggestions.sizes.map(v => <option key={v} value={v} />)}
      </datalist>
      <datalist id="list-states">
        {suggestions.states.map(v => <option key={v} value={v} />)}
      </datalist>

      {/* Container */}
      <div className={`bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl w-full ${step === 'review' ? 'max-w-5xl' : 'max-w-2xl'} shadow-2xl flex flex-col max-h-[90vh] transition-all duration-500 relative overflow-hidden`}>
        
        {/* Decorative Top Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-600 via-purple-600 to-blue-600"></div>

        {/* PROCESSING OVERLAY (AI Thinking) */}
        {isProcessing && (
           <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in">
              <div className="relative mb-8">
                 <div className="absolute inset-0 bg-brand-500/20 blur-xl rounded-full animate-pulse"></div>
                 <Sparkles className="w-16 h-16 text-brand-400 animate-bounce relative z-10" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Analisando Imagem...</h3>
              <p className="text-gray-400 text-sm animate-pulse">A Inteligência Artificial está a extrair os dados.</p>
              
              <div className="mt-8 flex gap-2">
                 <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                 <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                 <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
           </div>
        )}

        {/* Success Toast */}
        {showSuccess && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-bounce-in bg-green-600 text-white px-8 py-6 rounded-3xl shadow-2xl flex flex-col items-center gap-4 border border-green-400/50">
            <div className="bg-white/20 p-3 rounded-full">
              <CheckCircle className="w-12 h-12" />
            </div>
            <div className="text-center">
              <p className="font-black text-2xl">{t.success}</p>
              <p className="text-green-100">{t.saved}</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
             <div className="bg-gradient-to-br from-brand-600 to-brand-800 p-2.5 rounded-xl shadow-lg shadow-brand-900/20">
                <Ticket className="w-5 h-5 text-white" />
             </div>
             <div>
               <h2 className="text-xl font-bold text-white tracking-tight">
                 {step === 'upload' ? t.title : t.reviewTitle}
               </h2>
               <p className="text-xs text-gray-400 font-medium">
                  {step === 'upload' ? "Adicione novas raspadinhas ao arquivo" : "Verifique os dados extraídos pela IA"}
               </p>
             </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white bg-gray-800/50 hover:bg-gray-700 p-2 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs (Only in Upload Step) */}
        {step === 'upload' && (
          <div className="p-2 mx-6 mt-6 bg-gray-950/50 rounded-xl border border-white/5 flex gap-1 relative overflow-x-auto">
            <button
              onClick={() => setActiveTab('image')}
              className={`flex-1 py-2.5 px-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'image' ? 'bg-gray-800 text-white shadow-lg border border-white/5' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <ImageIcon className="w-4 h-4" />
              Via Imagem
            </button>
            <button
              onClick={() => setActiveTab('web')}
              className={`flex-1 py-2.5 px-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'web' ? 'bg-gray-800 text-white shadow-lg border border-white/5' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Globe className="w-4 h-4" />
              Web/SCML
            </button>
            <button
              onClick={() => setActiveTab('simple')}
              className={`flex-1 py-2.5 px-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'simple' ? 'bg-gray-800 text-white shadow-lg border border-white/5' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <ClipboardList className="w-4 h-4" />
              Registo Rápido
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {step === 'upload' ? (
            <div className="p-6">
              {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-200 p-4 rounded-xl flex items-center gap-3 text-sm animate-fade-in">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
                  {error}
                </div>
              )}

              {activeTab === 'image' && (
                <div className="animate-fade-in">
                  <div className="flex flex-col sm:flex-row gap-6 mb-6">
                    <UploadBox label={t.front} preview={frontPreview} isFront={true} />
                    <UploadBox label={t.back} preview={backPreview} isFront={false} />
                  </div>
                  
                  {/* AI Info Card */}
                  <div className="bg-gradient-to-r from-brand-900/10 to-purple-900/10 border border-white/5 p-4 rounded-xl flex items-center gap-4">
                      <div className="bg-gray-800/50 p-2 rounded-lg">
                        <Sparkles className="w-5 h-5 text-brand-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-sm">IA Pronta a Analisar</h4>
                        <p className="text-gray-400 text-xs mt-0.5">Carregue a frente (e verso opcional) para extração automática.</p>
                      </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'web' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-blue-900/10 border border-blue-500/20 p-6 rounded-2xl flex items-start gap-4">
                    <div className="bg-blue-500/20 p-2.5 rounded-xl">
                       <FileSearch className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-blue-100 font-bold text-lg mb-1">Base de Dados SCML & Web</h4>
                      <p className="text-blue-200/60 text-sm leading-relaxed">
                        Pesquise por "Novas raspadinhas Santa Casa" ou o nome específico do jogo. A IA irá cruzar dados técnicos oficiais para preencher a ficha.
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-500 to-blue-500 rounded-xl opacity-30 group-focus-within:opacity-100 transition duration-500 blur"></div>
                    <div className="relative bg-gray-900 rounded-xl flex items-center">
                       <Search className="absolute left-4 w-5 h-5 text-gray-500" />
                       <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Ex: Nova Raspadinha Pé de Meia"
                        className="w-full bg-transparent border-none text-white px-4 py-4 pl-12 focus:ring-0 focus:outline-none text-lg placeholder-gray-600 font-medium"
                        onKeyDown={(e) => e.key === 'Enter' && handleWebSearch()}
                       />
                       <button 
                         onClick={handleWebSearch}
                         disabled={!searchQuery.trim()}
                         className="absolute right-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-1.5 rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                       >
                         Buscar
                       </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'simple' && (
                <div className="space-y-6 animate-fade-in">
                   <div className="flex gap-4">
                      <button 
                        onClick={() => setSimpleCategory('boletim')}
                        className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 group ${simpleCategory === 'boletim' ? 'bg-green-600/20 border-green-500' : 'bg-gray-800/50 border-gray-700 hover:border-gray-500'}`}
                      >
                         <div className={`p-3 rounded-full ${simpleCategory === 'boletim' ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400 group-hover:bg-gray-600'}`}>
                            <ClipboardList className="w-6 h-6" />
                         </div>
                         <span className={`text-sm font-bold ${simpleCategory === 'boletim' ? 'text-green-400' : 'text-gray-400'}`}>Registar Boletim</span>
                      </button>
                      <button 
                        onClick={() => setSimpleCategory('objeto')}
                        className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 group ${simpleCategory === 'objeto' ? 'bg-orange-600/20 border-orange-500' : 'bg-gray-800/50 border-gray-700 hover:border-gray-500'}`}
                      >
                         <div className={`p-3 rounded-full ${simpleCategory === 'objeto' ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-400 group-hover:bg-gray-600'}`}>
                            <Package className="w-6 h-6" />
                         </div>
                         <span className={`text-sm font-bold ${simpleCategory === 'objeto' ? 'text-orange-400' : 'text-gray-400'}`}>Registar Objeto</span>
                      </button>
                   </div>

                   <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4 relative overflow-hidden">
                      {/* Decorative background based on selection */}
                      <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full pointer-events-none opacity-20 ${simpleCategory === 'boletim' ? 'bg-green-500' : 'bg-orange-500'}`}></div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        <div className="md:col-span-2">
                            <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Nome do {simpleCategory === 'boletim' ? 'Boletim' : 'Objeto'}</label>
                            <input 
                              type="text"
                              placeholder={`Ex: ${simpleCategory === 'boletim' ? 'Boletim Euromilhões 2024' : 'Catálogo de Natal'}`}
                              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none text-lg font-bold"
                              value={simpleName}
                              onChange={(e) => setSimpleName(e.target.value)}
                              autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-gray-500 font-bold mb-2">País</label>
                            <input 
                              type="text"
                              list="list-countries"
                              placeholder="Ex: Portugal"
                              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none"
                              value={simpleCountry}
                              onChange={(e) => setSimpleCountry(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Data de Registo</label>
                            <div className="relative">
                               <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                               <input 
                                  type="date"
                                  className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white focus:border-brand-500 outline-none"
                                  value={simpleDate}
                                  onChange={(e) => setSimpleDate(e.target.value)}
                               />
                            </div>
                        </div>
                        
                        {/* Optional Image Upload in Simple Mode with Contextual Icon */}
                        <div className="md:col-span-2">
                            <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Imagem (Opcional)</label>
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
            <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 animate-fade-in">
              
              {/* Left Column: Image & Basic Flags */}
              <div className="md:col-span-4 space-y-5">
                <div className="bg-black/40 rounded-2xl border border-gray-700 overflow-hidden h-64 relative group flex items-center justify-center">
                  <img src={frontPreview || formData?.frontUrl || ''} className="w-full h-full object-contain p-2" alt="Frente" />
                  <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm">
                    <UploadCloud className="w-8 h-8 text-white mb-2" />
                    <span className="text-sm text-white font-bold">Alterar Imagem</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0], true)} />
                  </label>
                </div>
                
                {/* Visual Category Selector */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => updateField('category', 'raspadinha')}
                      className={`relative p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${formData?.category === 'raspadinha' ? 'bg-brand-600/20 border-brand-500' : 'bg-gray-800/40 border-gray-700 hover:bg-gray-800'}`}
                    >
                      <Coins className={`w-5 h-5 ${formData?.category === 'raspadinha' ? 'text-brand-400' : 'text-gray-500'}`} />
                      <span className={`text-xs font-bold uppercase ${formData?.category === 'raspadinha' ? 'text-white' : 'text-gray-500'}`}>{t.typeScratch}</span>
                      {formData?.category === 'raspadinha' && <div className="absolute top-2 right-2 w-2 h-2 bg-brand-500 rounded-full shadow-lg shadow-brand-500/50"></div>}
                    </button>
                    <button
                      onClick={() => updateField('category', 'lotaria')}
                      className={`relative p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${formData?.category === 'lotaria' ? 'bg-purple-600/20 border-purple-500' : 'bg-gray-800/40 border-gray-700 hover:bg-gray-800'}`}
                    >
                      <Ticket className={`w-5 h-5 ${formData?.category === 'lotaria' ? 'text-purple-400' : 'text-gray-500'}`} />
                      <span className={`text-xs font-bold uppercase ${formData?.category === 'lotaria' ? 'text-white' : 'text-gray-500'}`}>{t.typeLottery}</span>
                      {formData?.category === 'lotaria' && <div className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full shadow-lg shadow-purple-500/50"></div>}
                    </button>
                    
                    {/* Extra Categories for Simple Mode */}
                    <button
                      onClick={() => updateField('category', 'boletim')}
                      className={`relative p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${formData?.category === 'boletim' ? 'bg-green-600/20 border-green-500' : 'bg-gray-800/40 border-gray-700 hover:bg-gray-800'}`}
                    >
                      <ClipboardList className={`w-5 h-5 ${formData?.category === 'boletim' ? 'text-green-400' : 'text-gray-500'}`} />
                      <span className={`text-xs font-bold uppercase ${formData?.category === 'boletim' ? 'text-white' : 'text-gray-500'}`}>{t.typeBulletin}</span>
                      {formData?.category === 'boletim' && <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full shadow-lg shadow-green-500/50"></div>}
                    </button>
                     <button
                      onClick={() => updateField('category', 'objeto')}
                      className={`relative p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${formData?.category === 'objeto' ? 'bg-orange-600/20 border-orange-500' : 'bg-gray-800/40 border-gray-700 hover:bg-gray-800'}`}
                    >
                      <Package className={`w-5 h-5 ${formData?.category === 'objeto' ? 'text-orange-400' : 'text-gray-500'}`} />
                      <span className={`text-xs font-bold uppercase ${formData?.category === 'objeto' ? 'text-white' : 'text-gray-500'}`}>{t.typeObject}</span>
                      {formData?.category === 'objeto' && <div className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full shadow-lg shadow-orange-500/50"></div>}
                    </button>
                </div>

                 {/* Attribute Cards */}
                 <div className="space-y-2">
                   {/* Series Toggle */}
                   <div 
                     className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${formData?.isSeries ? 'bg-brand-900/20 border-brand-500/50' : 'bg-gray-800/30 border-gray-700 hover:bg-gray-800'}`}
                     onClick={() => updateField('isSeries', !formData?.isSeries)}
                   >
                      <div className="flex items-center gap-3">
                         <div className={`p-1.5 rounded-lg ${formData?.isSeries ? 'bg-brand-500 text-white' : 'bg-gray-700 text-gray-400'}`}>
                           <Layers className="w-4 h-4" />
                         </div>
                         <div className="flex flex-col">
                           <span className={`text-xs font-bold ${formData?.isSeries ? 'text-white' : 'text-gray-400'}`}>{t.isSeries}</span>
                           {formData?.isSeries && <span className="text-[10px] text-brand-400">Ativado</span>}
                         </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${formData?.isSeries ? 'bg-brand-500 border-brand-500' : 'border-gray-600'}`}>
                        {formData?.isSeries && <Check className="w-3 h-3 text-white" />}
                      </div>
                   </div>
                   {formData?.isSeries && (
                        <input 
                          type="text" 
                          value={formData.seriesDetails || ''}
                          onChange={(e) => updateField('seriesDetails', e.target.value)}
                          placeholder={t.seriesDetailsPlaceholder}
                          className="w-full bg-black/20 border border-brand-500/30 text-white text-xs rounded-lg px-3 py-2 focus:border-brand-500 outline-none placeholder-gray-600 animate-fade-in ml-4 w-[calc(100%-1rem)]"
                        />
                   )}

                   {/* Rarity Toggle */}
                   <div 
                     className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${formData?.isRarity ? 'bg-gold-900/20 border-gold-500/50' : 'bg-gray-800/30 border-gray-700 hover:bg-gray-800'}`}
                     onClick={() => updateField('isRarity', !formData?.isRarity)}
                   >
                      <div className="flex items-center gap-3">
                         <div className={`p-1.5 rounded-lg ${formData?.isRarity ? 'bg-gold-500 text-white' : 'bg-gray-700 text-gray-400'}`}>
                           <Gem className="w-4 h-4" />
                         </div>
                         <span className={`text-xs font-bold ${formData?.isRarity ? 'text-gold-200' : 'text-gray-400'}`}>{t.isRarity}</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${formData?.isRarity ? 'bg-gold-500 border-gold-500' : 'border-gray-600'}`}>
                        {formData?.isRarity && <Check className="w-3 h-3 text-white" />}
                      </div>
                   </div>

                   {/* Promotional Toggle */}
                   <div 
                     className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${formData?.isPromotional ? 'bg-pink-900/20 border-pink-500/50' : 'bg-gray-800/30 border-gray-700 hover:bg-gray-800'}`}
                     onClick={() => updateField('isPromotional', !formData?.isPromotional)}
                   >
                      <div className="flex items-center gap-3">
                         <div className={`p-1.5 rounded-lg ${formData?.isPromotional ? 'bg-pink-500 text-white' : 'bg-gray-700 text-gray-400'}`}>
                           <Gift className="w-4 h-4" />
                         </div>
                         <span className={`text-xs font-bold ${formData?.isPromotional ? 'text-pink-200' : 'text-gray-400'}`}>{t.isPromotional}</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${formData?.isPromotional ? 'bg-pink-500 border-pink-500' : 'border-gray-600'}`}>
                        {formData?.isPromotional && <Check className="w-3 h-3 text-white" />}
                      </div>
                   </div>
                 </div>
              </div>

              {/* Right: Detailed Form */}
              <div className="md:col-span-8 space-y-5 bg-gray-950/30 p-6 rounded-2xl border border-white/5">
                <div className="grid grid-cols-2 gap-5">
                   <div className="col-span-2">
                     <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1.5 tracking-wider">{t.gameName}</label>
                     <input 
                       type="text" 
                       value={formData?.gameName || ''}
                       onChange={e => updateField('gameName', e.target.value)}
                       className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 focus:outline-none text-lg font-bold shadow-inner"
                     />
                   </div>
                   
                   <div>
                     <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1.5 tracking-wider">{t.country}</label>
                     <div className="relative">
                       <input 
                         type="text" 
                         list="list-countries"
                         value={formData?.country || ''}
                         onChange={e => updateField('country', e.target.value)}
                         className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white focus:border-brand-500 focus:outline-none pr-8 text-sm"
                       />
                       <button 
                         onClick={regenerateId}
                         className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-brand-400 transition-colors p-1"
                         title="Regenerar ID"
                       >
                         <RefreshCw className="w-3.5 h-3.5" />
                       </button>
                     </div>
                   </div>

                   <div>
                     <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1.5 tracking-wider">{t.region}</label>
                     <div className="relative group">
                       <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 group-focus-within:text-brand-500" />
                       <input 
                         type="text" 
                         list="list-regions"
                         value={formData?.region || ''}
                         onChange={e => updateField('region', e.target.value)}
                         placeholder="Ex: Baviera, Açores"
                         className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-9 pr-3 py-2.5 text-white focus:border-brand-500 focus:outline-none text-sm placeholder-gray-600"
                       />
                     </div>
                   </div>

                   <div>
                     <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1.5 tracking-wider">{t.continent}</label>
                     <select 
                       value={formData?.continent || ''}
                       onChange={e => updateField('continent', e.target.value as Continent)}
                       className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white focus:border-brand-500 focus:outline-none text-sm cursor-pointer"
                     >
                       {['Europa', 'América', 'Ásia', 'África', 'Oceania'].map(c => (
                         <option key={c} value={c}>{c}</option>
                       ))}
                     </select>
                   </div>

                   <div>
                     <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1.5 tracking-wider">{t.state}</label>
                     <input
                       type="text"
                       list="list-states"
                       value={formData?.state || ''}
                       onChange={e => updateField('state', e.target.value as ScratchcardState)}
                       placeholder="Ex: MINT, SPECIMEN..."
                       className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white focus:border-brand-500 focus:outline-none text-sm"
                     />
                   </div>

                   <div>
                     <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1.5 tracking-wider">{t.customId}</label>
                     <input 
                       type="text" 
                       value={formData?.customId || ''}
                       onChange={e => updateField('customId', e.target.value)}
                       className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-brand-400 font-mono font-bold focus:border-brand-500 focus:outline-none text-sm"
                     />
                   </div>

                   <div>
                     <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1.5 tracking-wider">{t.collector}</label>
                     <div className="relative group">
                       <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 group-focus-within:text-brand-500" />
                       <input 
                         type="text" 
                         list="list-collectors"
                         value={formData?.collector || ''}
                         onChange={e => updateField('collector', e.target.value)}
                         placeholder={t.collector}
                         className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-9 pr-3 py-2.5 text-white focus:border-brand-500 focus:outline-none text-sm placeholder-gray-600"
                       />
                     </div>
                   </div>

                   <div>
                     <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1.5 tracking-wider">{t.releaseDate}</label>
                     <input 
                       type="text" 
                       value={formData?.releaseDate || ''}
                       onChange={e => updateField('releaseDate', e.target.value)}
                       placeholder="YYYY-MM-DD"
                       className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white focus:border-brand-500 focus:outline-none text-sm"
                     />
                   </div>

                   <div>
                     <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1.5 tracking-wider">{t.size}</label>
                     <input 
                       type="text" 
                       list="list-sizes"
                       value={formData?.size || ''}
                       onChange={e => updateField('size', e.target.value)}
                       placeholder="Ex: 10x5cm"
                       className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white focus:border-brand-500 focus:outline-none text-sm"
                     />
                   </div>

                   <div>
                     <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1.5 tracking-wider">{t.price}</label>
                     <div className="relative group">
                       <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 group-focus-within:text-green-500" />
                       <input 
                         type="text" 
                         value={formData?.price || ''}
                         onChange={e => updateField('price', e.target.value)}
                         placeholder="Ex: 5€"
                         className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-9 pr-3 py-2.5 text-white focus:border-brand-500 focus:outline-none text-sm"
                       />
                     </div>
                   </div>

                   <div>
                     <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1.5 tracking-wider">{t.emission}</label>
                     <div className="relative group">
                       <BarChart className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 group-focus-within:text-blue-500" />
                       <input 
                         type="text" 
                         list="list-emissions"
                         value={formData?.emission || ''}
                         onChange={e => updateField('emission', e.target.value)}
                         placeholder="Ex: 500k"
                         className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-9 pr-3 py-2.5 text-white focus:border-brand-500 focus:outline-none text-sm"
                       />
                     </div>
                   </div>

                   <div className="col-span-2">
                     <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1.5 tracking-wider">{t.printer}</label>
                     <div className="relative group">
                       <Printer className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 group-focus-within:text-brand-500" />
                       <input 
                         type="text" 
                         list="list-printers"
                         value={formData?.printer || ''}
                         onChange={e => updateField('printer', e.target.value)}
                         placeholder="Ex: Scientific Games"
                         className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-9 pr-3 py-2.5 text-white focus:border-brand-500 focus:outline-none text-sm"
                       />
                     </div>
                   </div>

                   {/* Line Type Selector */}
                   <div className="col-span-2">
                      <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1.5 tracking-wider">{t.lines}</label>
                      <div className="relative group">
                        <AlignJustify className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 group-focus-within:text-brand-500" />
                        <select
                          value={formData?.lines || 'none'}
                          onChange={(e) => updateField('lines', e.target.value as LineType)}
                          className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-9 pr-3 py-2.5 text-white focus:border-brand-500 focus:outline-none appearance-none cursor-pointer text-sm"
                        >
                          <option value="none">{t.linesNone}</option>
                          <option value="blue">{t.linesBlue}</option>
                          <option value="red">{t.linesRed}</option>
                          <option value="multicolor">{t.linesMulti}</option>
                        </select>
                      </div>
                   </div>
                   
                   <div className="col-span-2">
                     <label className={`block text-[10px] uppercase font-bold mb-1.5 tracking-wider ${formData?.isRarity ? 'text-gold-400' : 'text-gray-500'}`}>
                        {formData?.isRarity ? t.rarityInfo : t.values}
                     </label>
                     <textarea 
                       value={formData?.values || ''}
                       onChange={e => updateField('values', e.target.value)}
                       className={`w-full bg-gray-900 border rounded-xl px-4 py-3 text-white focus:outline-none h-24 text-sm leading-relaxed ${formData?.isRarity ? 'border-gold-500/50 focus:border-gold-500' : 'border-gray-700 focus:border-brand-500'}`}
                     />
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/5 bg-gray-900/50 backdrop-blur-md flex justify-between items-center z-10">
          {step === 'review' ? (
             <button
               onClick={() => setStep('upload')}
               className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-bold px-4 py-2 hover:bg-white/5 rounded-lg"
             >
               <ArrowLeft className="w-4 h-4" /> {t.backBtn}
             </button>
          ) : (
            <button
               onClick={onClose}
               className="text-gray-400 hover:text-white transition-colors text-sm font-bold px-4 py-2 hover:bg-white/5 rounded-lg"
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
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold shadow-lg transition-all ${
                      !frontFile || isProcessing || isCompressing
                        ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white shadow-brand-900/40 hover:scale-105 active:scale-95"
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        {t.analyze}
                      </>
                    )}
                  </button>
                ) : activeTab === 'web' ? (
                  <button
                    onClick={handleWebSearch}
                    disabled={!searchQuery.trim() || isProcessing}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold shadow-lg transition-all ${
                      !searchQuery.trim() || isProcessing
                        ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40 hover:scale-105 active:scale-95"
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
                ) : (
                  <button
                    onClick={handleSimpleCreate}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold shadow-lg transition-all ${
                       !simpleName || !simpleCountry 
                         ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                         : simpleCategory === 'boletim' 
                            ? "bg-green-600 hover:bg-green-500 text-white shadow-green-900/40 hover:scale-105 active:scale-95" 
                            : "bg-orange-600 hover:bg-orange-500 text-white shadow-orange-900/40 hover:scale-105 active:scale-95"
                    }`}
                  >
                    {simpleCategory === 'boletim' ? <ClipboardList className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                    Guardar {simpleCategory === 'boletim' ? 'Boletim' : 'Objeto'}
                  </button>
                )
             ) : (
               <button
                  onClick={handleSave}
                  disabled={showSuccess}
                  className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold shadow-lg transition-all ${
                    showSuccess 
                      ? "bg-green-700 text-white cursor-default" 
                      : "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white shadow-green-900/40 hover:scale-105 active:scale-95"
                  }`}
                >
                  {showSuccess ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t.saving}
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