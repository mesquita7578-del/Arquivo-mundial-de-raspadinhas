
import React, { useState, useRef } from 'react';
import { 
  X, Upload, Sparkles, Check, Loader2, 
  ImagePlus, Wand2, Layers, Tag, MapPin, Palette, Info, ChevronRight, Camera
} from 'lucide-react';
import { ScratchcardData, CategoryItem, Continent } from '../types';
import { analyzeImage } from '../services/geminiService';
import { storageService } from '../services/storage';

interface UploadModalProps {
  onClose: () => void;
  onUploadComplete: (data: ScratchcardData) => void;
  existingImages: ScratchcardData[];
  currentUser: string | null;
  t: any;
  categories: CategoryItem[];
}

const THEME_OPTIONS = [
  { id: 'animais', label: 'Animais', icon: '🐾' },
  { id: 'natal', label: 'Natal', icon: '🎄' },
  { id: 'desporto', label: 'Desporto', icon: '⚽' },
  { id: 'ouro', label: 'Ouro', icon: '💰' },
  { id: 'natureza', label: 'Natureza', icon: '🌿' },
  { id: 'amor', label: 'Amor', icon: '❤️' },
  { id: 'frutas', label: 'Frutas', icon: '🍎' },
  { id: 'astros', label: 'Astros', icon: '✨' },
];

export const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUploadComplete, currentUser, categories }) => {
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<Partial<ScratchcardData>>({
    category: 'raspadinha',
    state: 'SC',
    continent: 'Europa',
    country: 'Portugal',
    gameName: '',
    gameNumber: '',
    isSeries: false,
    seriesGroupId: '',
    theme: '',
    collector: currentUser || 'Jorge Mesquita',
    lines: 'none',
    values: ''
  });

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File, type: 'front' | 'back') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (type === 'front') setFrontPreview(e.target?.result as string);
      else setBackPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const startAnalysis = async () => {
    if (!frontPreview) return;
    setIsAnalyzing(true);
    try {
      const frontBase64 = frontPreview.split(',')[1];
      const result = await analyzeImage(frontBase64, null, 'image/jpeg');
      setFormData(prev => ({ ...prev, ...result }));
    } catch (err) {
      console.error("Erro na IA:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!formData.gameName || !frontPreview) return;
    setIsSaving(true);
    const timestamp = Date.now();
    const newItem: ScratchcardData = {
      ...formData as ScratchcardData,
      id: timestamp.toString(),
      frontUrl: frontPreview,
      backUrl: backPreview || undefined,
      createdAt: timestamp,
      customId: formData.customId || `ID-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      owners: currentUser ? [currentUser] : []
    };

    try {
      await storageService.save(newItem);
      onUploadComplete(newItem);
      onClose();
    } catch (err) {
      alert("Erro ao guardar no arquivo!");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-sm">
      <div className="bg-[#0f172a] border border-white/10 rounded-[2.5rem] w-full max-w-6xl h-full md:h-[90vh] shadow-[0_20px_80px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-bounce-in">
        
        {/* Top Header - Fino e Elegante */}
        <div className="px-8 py-5 border-b border-white/5 flex justify-between items-center bg-slate-900/40">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-brand-600/20 rounded-xl text-brand-400 border border-brand-500/20">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Registo de Colecionador</h2>
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Visionary Archive System • Jorge Mesquita 🐉</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors bg-slate-800/50 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: Split View (Images Left, Form Right) */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {/* LADO ESQUERDO: Fotos (Vista mais compacta) */}
          <div className="w-full md:w-2/5 bg-slate-950/30 p-8 flex flex-col gap-6 border-r border-white/5 overflow-y-auto custom-scrollbar">
             <div className="space-y-4">
                <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                   <ImagePlus className="w-3 h-3" /> Captura Visual
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                   {/* Frente */}
                   <div 
                     onClick={() => frontInputRef.current?.click()}
                     className={`relative aspect-[3/4] rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-3 overflow-hidden group ${frontPreview ? 'border-brand-500 bg-slate-900' : 'border-slate-800 hover:border-brand-500/30 bg-slate-900/30'}`}
                   >
                     {frontPreview ? (
                       <img src={frontPreview} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                     ) : (
                       <>
                         <div className="p-4 bg-slate-800 rounded-2xl text-slate-500 group-hover:text-brand-400 transition-colors"><ImagePlus className="w-8 h-8" /></div>
                         <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Frente</span>
                       </>
                     )}
                     <input type="file" ref={frontInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'front')} />
                   </div>

                   {/* Verso */}
                   <div 
                     onClick={() => backInputRef.current?.click()}
                     className={`relative aspect-[3/4] rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-3 overflow-hidden group ${backPreview ? 'border-brand-500 bg-slate-900' : 'border-slate-800 hover:border-brand-500/30 bg-slate-900/30'}`}
                   >
                     {backPreview ? (
                       <img src={backPreview} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                     ) : (
                       <>
                         <div className="p-4 bg-slate-800 rounded-2xl text-slate-500 group-hover:text-brand-400 transition-colors"><Upload className="w-8 h-8" /></div>
                         <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Verso</span>
                       </>
                     )}
                     <input type="file" ref={backInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'back')} />
                   </div>
                </div>

                <button 
                  onClick={startAnalysis}
                  disabled={!frontPreview || isAnalyzing}
                  className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all ${frontPreview ? 'bg-brand-600 text-white shadow-lg hover:bg-brand-500' : 'bg-slate-800 text-slate-600'}`}
                >
                  {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                  {isAnalyzing ? 'A ler com IA...' : 'Analisar com Chloe IA'}
                </button>
             </div>

             <div className="mt-auto p-4 bg-brand-500/5 rounded-2xl border border-brand-500/10">
                <p className="text-[9px] text-brand-400 font-bold uppercase tracking-widest leading-relaxed">
                   Vovô, coloque as imagens e a Chloe ajuda a preencher os dados automaticamente! hihi! 🎀
                </p>
             </div>
          </div>

          {/* LADO DIREITO: Dados (Elegante e Organizado) */}
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-slate-900/20">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Coluna 1: Identidade */}
                <div className="space-y-6">
                   <section className="space-y-4">
                      <h3 className="text-[10px] font-black text-brand-500 uppercase tracking-[0.3em] flex items-center gap-2"><Tag className="w-3.5 h-3.5" /> Ficha de Identidade</h3>
                      <div className="space-y-3">
                         <div className="relative">
                            <input type="text" placeholder="Nome do Jogo" value={formData.gameName} onChange={e => setFormData({...formData, gameName: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-xl p-3.5 text-white font-black text-xs outline-none focus:border-brand-500 transition-all" />
                            <span className="absolute -top-2 left-3 bg-slate-950 px-1 text-[8px] font-black text-slate-600 uppercase">Título</span>
                         </div>
                         <div className="grid grid-cols-2 gap-3">
                            <div className="relative">
                               <input type="text" placeholder="Ex: 502" value={formData.gameNumber} onChange={e => setFormData({...formData, gameNumber: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-white font-black text-xs outline-none focus:border-brand-500" />
                               <span className="absolute -top-2 left-3 bg-slate-950 px-1 text-[8px] font-black text-slate-600 uppercase">Nº Jogo</span>
                            </div>
                            <div className="relative">
                               <input type="text" placeholder="Ex: Portugal" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-white font-black text-xs outline-none focus:border-brand-500" />
                               <span className="absolute -top-2 left-3 bg-slate-950 px-1 text-[8px] font-black text-slate-600 uppercase">País</span>
                            </div>
                         </div>
                      </div>
                   </section>

                   <section className="space-y-4 p-5 bg-brand-500/5 rounded-3xl border border-brand-500/10">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-black text-brand-400 uppercase tracking-[0.3em] flex items-center gap-2"><Layers className="w-3.5 h-3.5" /> Séries & SET</h3>
                        <label className="relative inline-flex items-center cursor-pointer scale-75">
                          <input type="checkbox" checked={formData.isSeries} onChange={e => setFormData({...formData, isSeries: e.target.checked})} className="sr-only peer" />
                          <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                        </label>
                      </div>
                      {formData.isSeries && (
                        <div className="animate-fade-in">
                          <input type="text" placeholder="Nome da Série (Ex: SET Especial Natal)" value={formData.seriesGroupId} onChange={e => setFormData({...formData, seriesGroupId: e.target.value})} className="w-full bg-slate-950 border border-brand-500/30 rounded-xl p-3 text-white font-black text-xs outline-none focus:border-brand-500" />
                        </div>
                      )}
                   </section>
                </div>

                {/* Coluna 2: Temas e Notas */}
                <div className="space-y-6">
                   <section className="space-y-4">
                      <h3 className="text-[10px] font-black text-pink-500 uppercase tracking-[0.3em] flex items-center gap-2"><Palette className="w-3.5 h-3.5" /> Temas Curadoria</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {THEME_OPTIONS.map(theme => (
                          <button 
                            key={theme.id} 
                            onClick={() => setFormData({...formData, theme: theme.id})}
                            className={`p-2.5 rounded-xl border text-[9px] font-black uppercase transition-all flex items-center gap-2 ${formData.theme === theme.id ? 'bg-pink-600 border-pink-400 text-white shadow-lg' : 'bg-slate-950 border-white/5 text-slate-500 hover:text-white'}`}
                          >
                            <span>{theme.icon}</span> {theme.label}
                          </button>
                        ))}
                      </div>
                   </section>

                   <section className="space-y-3">
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2"><Info className="w-3.5 h-3.5" /> Notas Adicionais</h3>
                      <textarea 
                        placeholder="Vovô, escreva aqui alguma curiosidade... hihi!" 
                        value={formData.values} 
                        onChange={e => setFormData({...formData, values: e.target.value})} 
                        className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-white text-xs h-28 outline-none italic resize-none focus:border-brand-500 transition-all" 
                      />
                   </section>
                </div>

             </div>
          </div>
        </div>

        {/* Footer Bar - Fixa e Limpa */}
        <div className="px-8 py-5 border-t border-white/5 bg-slate-900/60 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-6 py-3 bg-slate-800 text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:text-white transition-all">Cancelar</button>
          <button 
            onClick={handleSave} 
            disabled={isSaving || !formData.gameName || !frontPreview}
            className={`px-10 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl flex items-center gap-3 transition-all active:scale-95 ${formData.gameName && frontPreview ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Arquivar Item
          </button>
        </div>
      </div>
    </div>
  );
};
