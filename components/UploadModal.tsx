
import React, { useState, useRef } from 'react';
import { 
  X, Upload, Sparkles, Check, Loader2, 
  ImagePlus, Wand2, Layers, Tag, MapPin, Palette, Info, 
  Calendar, Building2, Printer, ScanLine, Banknote, Globe2, Clock,
  Camera
} from 'lucide-react';
import { ScratchcardData, CategoryItem, Continent, LineType, ScratchcardState } from '../types';
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
  { id: 'astros', label: 'Astros', icon: '✨' },
];

const LINE_COLORS: { id: LineType; label: string; color: string }[] = [
  { id: 'none', label: 'Sem Linhas', color: 'bg-slate-800' },
  { id: 'blue', label: 'Azul', color: 'bg-blue-500' },
  { id: 'red', label: 'Vermelha', color: 'bg-red-500' },
  { id: 'green', label: 'Verde', color: 'bg-emerald-500' },
  { id: 'multicolor', label: 'Colorida', color: 'bg-gradient-to-tr from-red-500 via-green-500 to-blue-500' },
  { id: 'pink', label: 'Rosa', color: 'bg-pink-500' },
  { id: 'brown', label: 'Castanha', color: 'bg-amber-900' },
];

const STATE_OPTIONS: { id: ScratchcardState; label: string }[] = [
  { id: 'SC', label: 'SC (Usada)' },
  { id: 'MINT', label: 'MINT (Nova)' },
  { id: 'AMOSTRA', label: 'AMOSTRA' },
  { id: 'VOID', label: 'VOID' },
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
    releaseDate: '',
    closeDate: '',
    operator: '',
    printer: '',
    lines: 'none',
    isSeries: false,
    seriesGroupId: '',
    theme: '',
    values: '',
    collector: currentUser || 'Jorge Mesquita'
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
    } catch (err) { console.error(err); } finally { setIsAnalyzing(false); }
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
    } catch (err) { alert("Erro ao arquivar!"); } finally { setIsSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 bg-black/95 backdrop-blur-md">
      <div className="bg-[#0f172a] border border-white/10 rounded-[3rem] w-full max-w-7xl h-full md:h-[94vh] shadow-2xl flex flex-col overflow-hidden animate-bounce-in">
        
        {/* Header Compacto */}
        <div className="px-8 py-4 border-b border-white/5 flex justify-between items-center bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-600/20 rounded-xl text-brand-400 border border-brand-500/20"><ImagePlus className="w-5 h-5" /></div>
            <div>
              <h2 className="text-lg font-black text-white italic uppercase tracking-tighter">Registo Mestre do Arquivo</h2>
              <p className="text-slate-500 text-[8px] font-black uppercase tracking-widest">Controlo Técnico • Jorge Mesquita 🐉</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors bg-slate-800/50 rounded-full"><X className="w-5 h-5" /></button>
        </div>

        {/* Content: Split View */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {/* LADO ESQUERDO: Fotos e IA */}
          <div className="w-full md:w-1/3 bg-slate-950/30 p-6 flex flex-col gap-5 border-r border-white/5 overflow-y-auto">
             <div className="space-y-4">
                {/* Fixed: Use imported Camera icon */}
                <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2"><Camera className="w-3 h-3" /> Captura Visual</h3>
                <div className="grid grid-cols-2 gap-3">
                   <div onClick={() => frontInputRef.current?.click()} className={`relative aspect-[3/4] rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-2 overflow-hidden ${frontPreview ? 'border-brand-500' : 'border-slate-800 bg-slate-900/30'}`}>
                     {frontPreview ? <img src={frontPreview} className="w-full h-full object-cover" /> : <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Frente</span>}
                     <input type="file" ref={frontInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'front')} />
                   </div>
                   <div onClick={() => backInputRef.current?.click()} className={`relative aspect-[3/4] rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-2 overflow-hidden ${backPreview ? 'border-brand-500' : 'border-slate-800 bg-slate-900/30'}`}>
                     {backPreview ? <img src={backPreview} className="w-full h-full object-cover" /> : <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Verso</span>}
                     <input type="file" ref={backInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'back')} />
                   </div>
                </div>
                <button onClick={startAnalysis} disabled={!frontPreview || isAnalyzing} className={`w-full py-3.5 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all ${frontPreview ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-600'}`}>
                  {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />} Analisar com Chloe IA
                </button>
             </div>
             
             <div className="mt-auto p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 mb-2"><Info className="w-3 h-3 text-brand-500" /><span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Guia da Chloe</span></div>
                <p className="text-[8px] text-slate-400 font-bold uppercase leading-relaxed">Vovô, use a IA para preencher os nomes e números! hihi! 🎀</p>
             </div>
          </div>

          {/* LADO DIREITO: Super Formulário Técnico */}
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-slate-900/10">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Bloco 1: Identidade do Jogo */}
                <div className="space-y-4 bg-slate-950/40 p-5 rounded-[2rem] border border-white/5">
                   <h3 className="text-[9px] font-black text-brand-500 uppercase tracking-[0.3em] flex items-center gap-2"><Tag className="w-3.5 h-3.5" /> Identidade</h3>
                   <div className="space-y-3">
                      <div className="relative">
                         <input type="text" placeholder="Nome do Jogo" value={formData.gameName} onChange={e => setFormData({...formData, gameName: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-black text-xs outline-none focus:border-brand-500" />
                         <span className="absolute -top-1.5 left-2 bg-slate-950 px-1 text-[7px] text-slate-600 font-black uppercase">Nome</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                         <div className="relative">
                            <input type="text" placeholder="Ex: 502" value={formData.gameNumber} onChange={e => setFormData({...formData, gameNumber: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-black text-xs outline-none focus:border-brand-500" />
                            <span className="absolute -top-1.5 left-2 bg-slate-950 px-1 text-[7px] text-slate-600 font-black uppercase">Nº Jogo</span>
                         </div>
                         <div className="relative">
                            <input type="text" placeholder="Ex: 5€" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-black text-xs outline-none focus:border-brand-500" />
                            <span className="absolute -top-1.5 left-2 bg-slate-950 px-1 text-[7px] text-slate-600 font-black uppercase">Preço</span>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Bloco 2: Cronologia e Entidades */}
                <div className="space-y-4 bg-slate-950/40 p-5 rounded-[2rem] border border-white/5">
                   <h3 className="text-[9px] font-black text-orange-500 uppercase tracking-[0.3em] flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> Cronologia</h3>
                   <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                         <div className="relative">
                            <input type="date" value={formData.releaseDate} onChange={e => setFormData({...formData, releaseDate: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-black text-[10px] outline-none focus:border-orange-500" />
                            <span className="absolute -top-1.5 left-2 bg-slate-950 px-1 text-[7px] text-slate-600 font-black uppercase">Lançamento</span>
                         </div>
                         <div className="relative">
                            <input type="date" value={formData.closeDate} onChange={e => setFormData({...formData, closeDate: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-black text-[10px] outline-none focus:border-orange-500" />
                            <span className="absolute -top-1.5 left-2 bg-slate-950 px-1 text-[7px] text-slate-600 font-black uppercase">Caducidade</span>
                         </div>
                      </div>
                      <div className="relative">
                         <input type="text" placeholder="Ex: Jogos Santa Casa" value={formData.operator} onChange={e => setFormData({...formData, operator: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-black text-xs outline-none focus:border-brand-500" />
                         <span className="absolute -top-1.5 left-2 bg-slate-950 px-1 text-[7px] text-slate-600 font-black uppercase">Operadora</span>
                      </div>
                      <div className="relative">
                         <input type="text" placeholder="Ex: Scientific Games" value={formData.printer} onChange={e => setFormData({...formData, printer: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-black text-xs outline-none focus:border-brand-500" />
                         <span className="absolute -top-1.5 left-2 bg-slate-950 px-1 text-[7px] text-slate-600 font-black uppercase">Gráfica / Emissora</span>
                      </div>
                   </div>
                </div>

                {/* Bloco 3: Localização e Estado */}
                <div className="space-y-4 bg-slate-950/40 p-5 rounded-[2rem] border border-white/5">
                   <h3 className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em] flex items-center gap-2"><Globe2 className="w-3.5 h-3.5" /> Localização</h3>
                   <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                         <div className="relative">
                            <input type="text" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-black text-xs outline-none focus:border-emerald-500" />
                            <span className="absolute -top-1.5 left-2 bg-slate-950 px-1 text-[7px] text-slate-600 font-black uppercase">País</span>
                         </div>
                         <select value={formData.state} onChange={e => setFormData({...formData, state: e.target.value as ScratchcardState})} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-black text-[10px] outline-none">
                            {STATE_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                         </select>
                      </div>
                      <input type="text" placeholder="Região / Ilha / Sub-Região" value={formData.island || formData.region} onChange={e => setFormData({...formData, island: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-black text-xs outline-none focus:border-brand-500" />
                   </div>
                </div>

                {/* Bloco 4: Séries e SETs (Ocupa 2 colunas se puder) */}
                <div className="space-y-4 bg-brand-500/5 p-6 rounded-[2rem] border border-brand-500/20 lg:col-span-2">
                   <div className="flex items-center justify-between mb-2">
                      <h3 className="text-[9px] font-black text-brand-400 uppercase tracking-[0.3em] flex items-center gap-2"><Layers className="w-3.5 h-3.5" /> Sistema de Séries / SET</h3>
                      <label className="relative inline-flex items-center cursor-pointer scale-90">
                        <input type="checkbox" checked={formData.isSeries} onChange={e => setFormData({...formData, isSeries: e.target.checked})} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                      </label>
                   </div>
                   {formData.isSeries && (
                     <div className="flex gap-4 animate-fade-in">
                        <input type="text" placeholder="Nome do SET / Série Técnica" value={formData.seriesGroupId} onChange={e => setFormData({...formData, seriesGroupId: e.target.value})} className="flex-1 bg-slate-900 border border-brand-500/30 rounded-lg p-2.5 text-white font-black text-xs outline-none focus:border-brand-500" />
                        <input type="text" placeholder="Nº Itens no SET" value={formData.setCount} onChange={e => setFormData({...formData, setCount: e.target.value})} className="w-24 bg-slate-900 border border-brand-500/30 rounded-lg p-2.5 text-white font-black text-xs outline-none focus:border-brand-500 text-center" />
                     </div>
                   )}
                </div>

                {/* Bloco 5: Linhas de Segurança Visual */}
                <div className="space-y-4 bg-slate-950/40 p-5 rounded-[2rem] border border-white/5">
                   <h3 className="text-[9px] font-black text-pink-500 uppercase tracking-[0.3em] flex items-center gap-2"><ScanLine className="w-3.5 h-3.5" /> Linhas de Segurança</h3>
                   <div className="flex flex-wrap gap-2">
                      {LINE_COLORS.map(line => (
                        <button key={line.id} onClick={() => setFormData({...formData, lines: line.id})} className={`w-8 h-8 rounded-full border-2 transition-all ${formData.lines === line.id ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-40 hover:opacity-100'} ${line.color}`} title={line.label} />
                      ))}
                   </div>
                   <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest text-center">Cor selecionada: {formData.lines}</p>
                </div>

                {/* Bloco 6: Temas e Notas */}
                <div className="space-y-4 bg-slate-950/40 p-5 rounded-[2rem] border border-white/5 lg:col-span-3">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                         <h3 className="text-[9px] font-black text-blue-400 uppercase tracking-[0.3em] flex items-center gap-2"><Palette className="w-3.5 h-3.5" /> Tema Curadoria</h3>
                         <div className="grid grid-cols-4 gap-2">
                           {THEME_OPTIONS.map(theme => (
                             <button key={theme.id} onClick={() => setFormData({...formData, theme: theme.id})} className={`p-2 rounded-lg border text-[8px] font-black uppercase flex items-center justify-center gap-2 ${formData.theme === theme.id ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-900 border-white/5 text-slate-500 hover:text-white'}`}>
                               <span>{theme.icon}</span>
                             </button>
                           ))}
                         </div>
                      </div>
                      <div className="space-y-3">
                         <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2"><Info className="w-3.5 h-3.5" /> Notas Técnicas</h3>
                         <textarea placeholder="Alguma particularidade no verso ou tiragem especial? hihi!" value={formData.values} onChange={e => setFormData({...formData, values: e.target.value})} className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-white text-[10px] h-20 outline-none italic resize-none focus:border-brand-500 transition-all" />
                      </div>
                   </div>
                </div>

             </div>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="px-8 py-5 border-t border-white/5 bg-slate-900/60 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-8 py-3 bg-slate-800 text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:text-white transition-all">Cancelar</button>
          <button 
            onClick={handleSave} 
            disabled={isSaving || !formData.gameName || !frontPreview}
            className={`px-12 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl flex items-center gap-3 transition-all active:scale-95 ${formData.gameName && frontPreview ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Arquivar Item no Legado
          </button>
        </div>
      </div>
    </div>
  );
};
