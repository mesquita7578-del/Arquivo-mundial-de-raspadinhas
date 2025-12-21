
import React, { useState, useRef } from 'react';
import { 
  X, Upload, Sparkles, Check, Loader2, 
  ImagePlus, Wand2, Layers, Tag, MapPin, Palette, Info, 
  Calendar, Building2, Printer, ScanLine, Banknote, Globe2, Clock,
  Camera, Hash, Ruler, Percent, Factory, BookOpen
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
    emission: '',
    printer: '',
    size: '',
    winProbability: '',
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
        
        {/* Header Profissional */}
        <div className="px-8 py-5 border-b border-white/5 flex justify-between items-center bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-600/20 rounded-xl text-brand-400 border border-brand-500/20"><Camera className="w-5 h-5" /></div>
            <div>
              <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Registo de Arquivo Mestre</h2>
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Controlo de Legado • Jorge Mesquita 🐉</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors bg-slate-800/50 rounded-full"><X className="w-6 h-6" /></button>
        </div>

        {/* Content View */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {/* LADO ESQUERDO: Imagens e Análise */}
          <div className="w-full md:w-1/4 bg-slate-950/30 p-6 flex flex-col gap-6 border-r border-white/5 overflow-y-auto custom-scrollbar">
             <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2"><ImagePlus className="w-3.5 h-3.5" /> Média Captura</h3>
                <div className="grid grid-cols-1 gap-4">
                   <div onClick={() => frontInputRef.current?.click()} className={`relative aspect-[3/4] rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-3 overflow-hidden ${frontPreview ? 'border-brand-500' : 'border-slate-800 bg-slate-900/30'}`}>
                     {frontPreview ? <img src={frontPreview} className="w-full h-full object-cover" /> : <div className="text-center"><Upload className="w-8 h-8 mx-auto text-slate-700 mb-2"/><span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Frente</span></div>}
                     <input type="file" ref={frontInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'front')} />
                   </div>
                   <div onClick={() => backInputRef.current?.click()} className={`relative aspect-[3/4] rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-3 overflow-hidden ${backPreview ? 'border-brand-500' : 'border-slate-800 bg-slate-900/30'}`}>
                     {backPreview ? <img src={backPreview} className="w-full h-full object-cover" /> : <div className="text-center"><Upload className="w-8 h-8 mx-auto text-slate-700 mb-2"/><span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Verso</span></div>}
                     <input type="file" ref={backInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'back')} />
                   </div>
                </div>
                <button onClick={startAnalysis} disabled={!frontPreview || isAnalyzing} className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all ${frontPreview ? 'bg-brand-600 text-white shadow-lg' : 'bg-slate-800 text-slate-600'}`}>
                  {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />} {isAnalyzing ? 'A Ler...' : 'Chloe IA: Ler Dados'}
                </button>
             </div>
          </div>

          {/* LADO DIREITO: Todos os Comandos Técnicos */}
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-slate-900/20">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                
                {/* GRUPO A: Dados de Identidade */}
                <div className="space-y-5 bg-slate-950/40 p-6 rounded-[2.5rem] border border-white/5">
                   <h3 className="text-[10px] font-black text-brand-500 uppercase tracking-[0.3em] flex items-center gap-2"><Tag className="w-4 h-4" /> Identidade do Jogo</h3>
                   <div className="space-y-4">
                      <div className="relative">
                         <input type="text" placeholder="Ex: Super Pé de Meia" value={formData.gameName} onChange={e => setFormData({...formData, gameName: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-black text-xs outline-none focus:border-brand-500" />
                         <span className="absolute -top-1.5 left-3 bg-slate-950 px-1 text-[7px] text-slate-600 font-black uppercase">Nome do Jogo</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                         <div className="relative">
                            <input type="text" placeholder="Ex: 502" value={formData.gameNumber} onChange={e => setFormData({...formData, gameNumber: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-black text-xs outline-none focus:border-brand-500" />
                            <span className="absolute -top-1.5 left-3 bg-slate-950 px-1 text-[7px] text-slate-600 font-black uppercase">Nº Jogo</span>
                         </div>
                         <div className="relative">
                            <input type="text" placeholder="Ex: 5€" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-black text-xs outline-none focus:border-brand-500" />
                            <span className="absolute -top-1.5 left-2 bg-slate-950 px-1 text-[7px] text-slate-600 font-black uppercase">Preço</span>
                         </div>
                      </div>
                      <div className="relative">
                         <input type="text" placeholder="Identificador Interno" value={formData.customId} onChange={e => setFormData({...formData, customId: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-black text-xs outline-none focus:border-brand-500" />
                         <span className="absolute -top-1.5 left-3 bg-slate-950 px-1 text-[7px] text-slate-600 font-black uppercase">ID Personalizado</span>
                      </div>
                   </div>
                </div>

                {/* GRUPO B: Cronologia e Entidades */}
                <div className="space-y-5 bg-slate-950/40 p-6 rounded-[2.5rem] border border-white/5">
                   <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] flex items-center gap-2"><Calendar className="w-4 h-4" /> Ciclo de Vida</h3>
                   <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                         <div className="relative">
                            <input type="date" value={formData.releaseDate} onChange={e => setFormData({...formData, releaseDate: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-black text-[10px] outline-none focus:border-orange-500" />
                            <span className="absolute -top-1.5 left-3 bg-slate-950 px-1 text-[7px] text-slate-600 font-black uppercase">Lançamento</span>
                         </div>
                         <div className="relative">
                            <input type="date" value={formData.closeDate} onChange={e => setFormData({...formData, closeDate: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-black text-[10px] outline-none focus:border-orange-500" />
                            <span className="absolute -top-1.5 left-3 bg-slate-950 px-1 text-[7px] text-slate-600 font-black uppercase">Caducidade</span>
                         </div>
                      </div>
                      <div className="relative">
                         <input type="text" placeholder="Ex: Jogos Santa Casa" value={formData.operator} onChange={e => setFormData({...formData, operator: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-black text-xs outline-none focus:border-orange-500" />
                         <span className="absolute -top-1.5 left-3 bg-slate-950 px-1 text-[7px] text-slate-600 font-black uppercase">Operadora / Editora</span>
                      </div>
                      <div className="relative">
                         <input type="text" placeholder="Ex: Scientific Games" value={formData.printer} onChange={e => setFormData({...formData, printer: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-black text-xs outline-none focus:border-orange-500" />
                         <span className="absolute -top-1.5 left-3 bg-slate-950 px-1 text-[7px] text-slate-600 font-black uppercase">Gráfica / Impressora</span>
                      </div>
                   </div>
                </div>

                {/* GRUPO C: Dados Técnicos Avançados */}
                <div className="space-y-5 bg-slate-950/40 p-6 rounded-[2.5rem] border border-white/5">
                   <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] flex items-center gap-2"><BookOpen className="w-4 h-4" /> Ficha Técnica</h3>
                   <div className="space-y-4">
                      <div className="relative">
                         <input type="text" placeholder="Ex: 20.000.000 exemplares" value={formData.emission} onChange={e => setFormData({...formData, emission: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-black text-xs outline-none focus:border-emerald-500" />
                         <span className="absolute -top-1.5 left-3 bg-slate-950 px-1 text-[7px] text-slate-600 font-black uppercase">Emissão / Tiragem</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                         <div className="relative">
                            <input type="text" placeholder="Ex: 10x15cm" value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-black text-xs outline-none focus:border-emerald-500" />
                            <span className="absolute -top-1.5 left-3 bg-slate-950 px-1 text-[7px] text-slate-600 font-black uppercase">Medidas</span>
                         </div>
                         <div className="relative">
                            <input type="text" placeholder="Ex: 1 em 3.4" value={formData.winProbability} onChange={e => setFormData({...formData, winProbability: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-black text-xs outline-none focus:border-emerald-500" />
                            <span className="absolute -top-1.5 left-3 bg-slate-950 px-1 text-[7px] text-slate-600 font-black uppercase">Probabilidade</span>
                         </div>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2">
                        <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest w-full">Linhas de Segurança:</span>
                        {LINE_COLORS.map(line => (
                          <button key={line.id} onClick={() => setFormData({...formData, lines: line.id})} className={`w-8 h-8 rounded-full border-2 transition-all ${formData.lines === line.id ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-30 hover:opacity-100'} ${line.color}`} title={line.label} />
                        ))}
                      </div>
                   </div>
                </div>

                {/* GRUPO D: Geografia e Estado */}
                <div className="space-y-5 bg-slate-950/40 p-6 rounded-[2.5rem] border border-white/5">
                   <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] flex items-center gap-2"><Globe2 className="w-4 h-4" /> Geografia</h3>
                   <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                         <div className="relative">
                            <input type="text" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-black text-xs outline-none focus:border-blue-500" />
                            <span className="absolute -top-1.5 left-3 bg-slate-950 px-1 text-[7px] text-slate-600 font-black uppercase">País</span>
                         </div>
                         <div className="relative">
                            <select value={formData.state} onChange={e => setFormData({...formData, state: e.target.value as ScratchcardState})} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-black text-xs outline-none focus:border-blue-500">
                               {STATE_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                            </select>
                            <span className="absolute -top-1.5 left-3 bg-slate-950 px-1 text-[7px] text-slate-600 font-black uppercase">Estado Físico</span>
                         </div>
                      </div>
                      <div className="relative">
                         <input type="text" placeholder="Açores, Madeira, Catalunha..." value={formData.island || formData.region} onChange={e => setFormData({...formData, island: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-black text-xs outline-none focus:border-blue-500" />
                         <span className="absolute -top-1.5 left-3 bg-slate-950 px-1 text-[7px] text-slate-600 font-black uppercase">Região / Sub-Divisão</span>
                      </div>
                   </div>
                </div>

                {/* GRUPO E: Séries e Curadoria */}
                <div className="space-y-5 bg-brand-500/5 p-6 rounded-[2.5rem] border border-brand-500/20 lg:col-span-2">
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex-1 space-y-4">
                         <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-brand-400 uppercase tracking-[0.3em] flex items-center gap-2"><Layers className="w-4 h-4" /> Agrupamento de Série / SET</h3>
                            <label className="relative inline-flex items-center cursor-pointer scale-110">
                              <input type="checkbox" checked={formData.isSeries} onChange={e => setFormData({...formData, isSeries: e.target.checked})} className="sr-only peer" />
                              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                            </label>
                         </div>
                         {formData.isSeries && (
                            <div className="flex gap-4 animate-fade-in">
                               <input type="text" placeholder="Nome do SET (Ex: Coleção Verão)" value={formData.seriesGroupId} onChange={e => setFormData({...formData, seriesGroupId: e.target.value})} className="flex-1 bg-slate-900 border border-brand-500/30 rounded-xl p-3 text-white font-black text-xs outline-none" />
                               <input type="text" placeholder="Total" value={formData.setCount} onChange={e => setFormData({...formData, setCount: e.target.value})} className="w-20 bg-slate-900 border border-brand-500/30 rounded-xl p-3 text-white font-black text-xs outline-none text-center" />
                            </div>
                         )}
                      </div>
                      <div className="flex-1 space-y-4">
                         <h3 className="text-[10px] font-black text-pink-500 uppercase tracking-[0.3em] flex items-center gap-2"><Palette className="w-4 h-4" /> Tema Sugerido</h3>
                         <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                            {THEME_OPTIONS.map(theme => (
                              <button key={theme.id} onClick={() => setFormData({...formData, theme: theme.id})} className={`p-2 rounded-xl border transition-all ${formData.theme === theme.id ? 'bg-pink-600 border-pink-400 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white'}`} title={theme.label}>
                                 <span className="text-lg">{theme.icon}</span>
                              </button>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>

                {/* GRUPO F: Notas e Curiosidades */}
                <div className="space-y-4 bg-slate-950/40 p-6 rounded-[2.5rem] border border-white/5 lg:col-span-3">
                   <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2"><Info className="w-4 h-4" /> Notas de Curador</h3>
                   <textarea placeholder="Vovô, descreva aqui alguma curiosidade, tiragem especial ou defeitos de impressão... hihi!" value={formData.values} onChange={e => setFormData({...formData, values: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-[2rem] p-5 text-white text-xs h-24 outline-none italic resize-none focus:border-brand-500 transition-all" />
                </div>

             </div>
          </div>
        </div>

        {/* Footer do Registo */}
        <div className="px-8 py-6 border-t border-white/5 bg-slate-900/60 flex justify-end gap-4 shrink-0">
          <button onClick={onClose} className="px-10 py-3 bg-slate-800 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:text-white transition-all">Cancelar</button>
          <button 
            onClick={handleSave} 
            disabled={isSaving || !formData.gameName || !frontPreview}
            className={`px-16 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl flex items-center gap-3 transition-all active:scale-95 ${formData.gameName && frontPreview ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
            Arquivar no Legado Mundial
          </button>
        </div>
      </div>
    </div>
  );
};
