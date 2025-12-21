
import React, { useState, useRef } from 'react';
import { 
  X, Upload, Sparkles, Check, Loader2, ArrowRight, 
  ImagePlus, Wand2, Layers, Tag, MapPin, Hash, Palette, Info
} from 'lucide-react';
import { ScratchcardData, ScratchcardState, LineType, CategoryItem, AnalysisResult, Continent } from '../types';
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
];

export const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUploadComplete, currentUser, categories }) => {
  const [step, setStep] = useState<1 | 2>(1);
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
    lines: 'none'
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
      setStep(2);
    } catch (err) {
      setStep(2); // Vai para o passo 2 mesmo se a IA falhar para preenchimento manual
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
      alert("Erro ao guardar!");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
      <div className="bg-slate-900 border border-white/10 rounded-[3rem] w-full max-w-4xl h-[85vh] shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden relative">
        
        {/* Step Indicator */}
        <div className="absolute top-0 left-0 w-full h-1.5 flex gap-1 z-50">
          <div className={`flex-1 h-full transition-all duration-500 ${step === 1 ? 'bg-brand-500' : 'bg-emerald-500'}`}></div>
          <div className={`flex-1 h-full transition-all duration-500 ${step === 2 ? 'bg-brand-500' : 'bg-slate-800'}`}></div>
        </div>

        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${step === 1 ? 'bg-brand-600' : 'bg-emerald-600'} text-white shadow-lg`}>
              {step === 1 ? <ImagePlus className="w-6 h-6" /> : <Layers className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">
                {step === 1 ? 'Registo de Imagem' : 'Detalhes da Coleção'}
              </h2>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                {step === 1 ? 'Vovô, escolha as fotos primeiro hihi!' : 'Agora diga-me os pormenores mágicos!'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
            <X className="w-8 h-8" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {step === 1 ? (
            <div className="h-full flex flex-col items-center justify-center gap-12 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
                {/* Frente */}
                <div 
                  onClick={() => frontInputRef.current?.click()}
                  className={`relative aspect-[3/4] rounded-[2.5rem] border-4 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-4 overflow-hidden group ${frontPreview ? 'border-brand-500 bg-slate-950' : 'border-slate-800 hover:border-brand-500/50 bg-slate-900/50'}`}
                >
                  {frontPreview ? (
                    <img src={frontPreview} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <>
                      <div className="p-6 bg-slate-800 rounded-3xl text-brand-500 group-hover:scale-110 transition-transform"><ImagePlus className="w-12 h-12" /></div>
                      <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Foto da Frente</span>
                    </>
                  )}
                  <input type="file" ref={frontInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'front')} />
                </div>

                {/* Verso */}
                <div 
                  onClick={() => backInputRef.current?.click()}
                  className={`relative aspect-[3/4] rounded-[2.5rem] border-4 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-4 overflow-hidden group ${backPreview ? 'border-brand-500 bg-slate-950' : 'border-slate-800 hover:border-brand-500/50 bg-slate-900/50'}`}
                >
                  {backPreview ? (
                    <img src={backPreview} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <>
                      <div className="p-6 bg-slate-800 rounded-3xl text-slate-600 group-hover:scale-110 transition-transform"><Upload className="w-12 h-12" /></div>
                      <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Foto do Verso (Opcional)</span>
                    </>
                  )}
                  <input type="file" ref={backInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'back')} />
                </div>
              </div>

              <button 
                onClick={startAnalysis}
                disabled={!frontPreview || isAnalyzing}
                className={`px-12 py-5 rounded-3xl font-black text-sm uppercase tracking-[0.2em] flex items-center gap-4 shadow-2xl transition-all active:scale-95 ${frontPreview ? 'bg-brand-600 text-white hover:bg-brand-500' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
              >
                {isAnalyzing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Wand2 className="w-6 h-6" />}
                {isAnalyzing ? 'Chloe está a Ler...' : 'Continuar para Detalhes'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-fade-in">
              {/* Form Col 1 */}
              <div className="space-y-6">
                <section className="space-y-4">
                  <h3 className="text-[10px] font-black text-brand-500 uppercase tracking-[0.3em] flex items-center gap-2"><Tag className="w-3 h-3" /> Identificação</h3>
                  <input type="text" placeholder="Nome do Jogo" value={formData.gameName} onChange={e => setFormData({...formData, gameName: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-white font-black text-sm outline-none focus:border-brand-500" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Nº Jogo" value={formData.gameNumber} onChange={e => setFormData({...formData, gameNumber: e.target.value})} className="bg-slate-950 border border-white/5 rounded-2xl p-4 text-white font-black text-xs outline-none focus:border-brand-500" />
                    <input type="text" placeholder="País" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="bg-slate-950 border border-white/5 rounded-2xl p-4 text-white font-black text-xs outline-none focus:border-brand-500" />
                  </div>
                </section>

                <section className="space-y-4 bg-brand-500/5 p-6 rounded-[2rem] border border-brand-500/20">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-brand-400 uppercase tracking-[0.3em] flex items-center gap-2"><Layers className="w-3 h-3" /> Sistema de Séries / SET</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={formData.isSeries} onChange={e => setFormData({...formData, isSeries: e.target.checked})} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                    </label>
                  </div>
                  {formData.isSeries && (
                    <input type="text" placeholder="Identificador do SET (Ex: Coleção Verão 2024)" value={formData.seriesGroupId} onChange={e => setFormData({...formData, seriesGroupId: e.target.value})} className="w-full bg-slate-950 border border-brand-500/30 rounded-xl p-3 text-white font-black text-xs outline-none focus:border-brand-500 animate-fade-in" />
                  )}
                </section>
              </div>

              {/* Form Col 2 */}
              <div className="space-y-6">
                <section className="space-y-4">
                  <h3 className="text-[10px] font-black text-pink-500 uppercase tracking-[0.3em] flex items-center gap-2"><Palette className="w-3 h-3" /> Tema e Estilo</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {THEME_OPTIONS.map(theme => (
                      <button 
                        key={theme.id} 
                        onClick={() => setFormData({...formData, theme: theme.id})}
                        className={`p-3 rounded-2xl border text-[10px] font-black uppercase transition-all flex items-center gap-2 ${formData.theme === theme.id ? 'bg-pink-600 border-pink-400 text-white shadow-lg' : 'bg-slate-950 border-white/5 text-slate-500 hover:text-white'}`}
                      >
                        <span>{theme.icon}</span> {theme.label}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                   <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2"><Info className="w-3 h-3" /> Notas do Guardião</h3>
                   <textarea placeholder="Alguma curiosidade especial para o vovô lembrar? hihi!" value={formData.values} onChange={e => setFormData({...formData, values: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-white text-xs h-32 outline-none italic resize-none" />
                </section>
              </div>
            </div>
          )}
        </div>

        <div className="p-8 border-t border-white/5 bg-slate-900/50 flex justify-end gap-4">
          <button onClick={onClose} className="px-8 py-4 bg-slate-800 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:text-white transition-all">Cancelar</button>
          {step === 2 && (
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className="px-12 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-emerald-900/30 flex items-center gap-3 transition-all active:scale-95"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Arquivar Tesouro
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
