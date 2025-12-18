
import React, { useRef, useState } from 'react';
import { Ticket, Globe, Users, Database, Sparkles, Mail, Hourglass, Save, Sunrise, HeartHandshake, Award, ShieldCheck, Camera, Edit2, History, Quote, Plus, Trash2, BookText, ScrollText, Download, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Milestone } from '../types';

interface AboutPageProps {
  t: any;
  isAdmin: boolean;
  founderPhoto?: string;
  founderBio?: string;
  founderQuote?: string;
  milestones?: Milestone[];
  onUpdateFounderPhoto?: (url: string) => void;
  onUpdateMetadata?: (data: any) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ 
  t, 
  isAdmin, 
  founderPhoto, 
  founderBio, 
  founderQuote, 
  milestones = [],
  onUpdateFounderPhoto,
  onUpdateMetadata
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState(founderBio || '');
  const [tempQuote, setTempQuote] = useState(founderQuote || '');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        onUpdateFounderPhoto?.(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveMetadata = () => {
    onUpdateMetadata?.({
      founderBio: tempBio,
      founderQuote: tempQuote,
      milestones: milestones
    });
    setIsEditingBio(false);
  };

  const addMilestone = () => {
    const newMilestone = { year: 'Ano', title: 'Título do Marco', description: 'Descrição da sua história...' };
    onUpdateMetadata?.({
      milestones: [...milestones, newMilestone]
    });
  };

  const updateMilestone = (index: number, field: keyof Milestone, value: string) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    onUpdateMetadata?.({ milestones: updated });
  };

  const deleteMilestone = (index: number) => {
    const updated = milestones.filter((_, i) => i !== index);
    onUpdateMetadata?.({ milestones: updated });
  };

  const displayPhoto = founderPhoto || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&h=400&auto=format&fit=crop";

  return (
    <div className="w-full min-h-full animate-fade-in pb-20 bg-[#020617]">
      {/* Hero Section - Estilo "Cinematográfico" */}
      <div className="relative h-[60vh] flex items-center justify-center overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1518133835878-5a93cc3f89e5?q=80&w=1920&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-20 scale-110 blur-sm"
            alt="Background"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent"></div>
        </div>

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10 space-y-8">
           <div className="inline-flex items-center gap-3 bg-brand-500/10 border border-brand-500/30 text-brand-400 px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.3em] animate-pulse">
              <Sparkles className="w-4 h-4" />
              <span>O Legado de Uma Vida</span>
           </div>
           <h1 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter uppercase leading-none">
              Arquivando a <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 via-purple-500 to-blue-500">História</span>
           </h1>
           <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed italic">
              "Cada bilhete é um sussurro do passado, um pedaço de sorte que o tempo não conseguiu apagar."
           </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-20">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Sidebar Fundador */}
            <div className="lg:col-span-4 space-y-8">
               <div className="sticky top-24">
                  <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-2 shadow-2xl overflow-hidden group">
                     <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem]">
                        <img 
                          src={displayPhoto} 
                          alt="Jorge Mesquita" 
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                        
                        {isAdmin && (
                           <button 
                             onClick={() => fileInputRef.current?.click()}
                             className="absolute inset-0 bg-brand-600/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity gap-3 backdrop-blur-sm"
                           >
                              <Camera className="w-10 h-10" />
                              <span className="text-xs font-black uppercase tracking-widest">Atualizar Retrato</span>
                              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                           </button>
                        )}

                        <div className="absolute bottom-8 left-0 w-full text-center">
                           <h4 className="text-3xl font-black text-white uppercase italic tracking-tighter">Jorge Mesquita</h4>
                           <p className="text-brand-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Guardião Vitalício</p>
                        </div>
                     </div>
                  </div>

                  {/* Quote de Ouro */}
                  <div className="mt-8 relative bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-10 rounded-[3rem] shadow-2xl overflow-hidden group">
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 to-blue-600"></div>
                     <Quote className="w-12 h-12 text-brand-500/20 mb-6 group-hover:rotate-12 transition-transform duration-700" />
                     {isEditingBio ? (
                        <textarea 
                           value={tempQuote} 
                           onChange={e => setTempQuote(e.target.value)}
                           className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-slate-300 italic text-sm outline-none h-32 focus:border-brand-500 transition-all"
                           placeholder="A sua filosofia de vida..."
                        />
                     ) : (
                        <p className="text-xl text-slate-200 italic font-medium leading-relaxed relative z-10">
                           "{founderQuote || 'O colecionismo é a ponte entre o que fomos e o que deixamos para quem vem depois.'}"
                        </p>
                     )}
                  </div>
                  
                  {/* Selo de Segurança */}
                  <div className="mt-8 bg-blue-900/10 border border-blue-500/20 p-6 rounded-[2rem] flex items-center gap-4 group hover:bg-blue-900/20 transition-all">
                     <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400 group-hover:scale-110 transition-transform">
                        <ShieldCheck className="w-8 h-8" />
                     </div>
                     <div>
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest block">Arquivo Blindado</span>
                        <span className="text-xs text-slate-400 font-medium">Backup local automático ativado para Jorge Mesquita.</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Conteúdo Biográfico Dramático */}
            <div className="lg:col-span-8 space-y-16">
               
               {/* Secção A Jornada */}
               <div className="bg-slate-900/40 border border-slate-800/50 backdrop-blur-sm rounded-[3.5rem] p-10 md:p-16 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                     <ScrollText className="w-64 h-64 text-white" />
                  </div>

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
                     <div>
                        <h2 className="text-[10px] font-black text-brand-500 uppercase tracking-[0.4em] mb-2">Narrativa Pessoal</h2>
                        <h3 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase">A Jornada do Guardião</h3>
                     </div>
                     {isAdmin && (
                        <button 
                           onClick={() => isEditingBio ? saveMetadata() : setIsEditingBio(true)} 
                           className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl ${isEditingBio ? 'bg-green-600 text-white shadow-green-900/30' : 'bg-slate-800 text-blue-400 hover:bg-slate-700 border border-slate-700'}`}
                        >
                           {isEditingBio ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                           {isEditingBio ? 'Guardar Memórias' : 'Escrever História'}
                        </button>
                     )}
                  </div>

                  <div className="prose prose-invert max-w-none">
                     {isEditingBio ? (
                        <textarea 
                           value={tempBio} 
                           onChange={e => setTempBio(e.target.value)}
                           className="w-full bg-slate-950 border border-slate-800 rounded-[2rem] p-8 text-slate-200 text-lg leading-relaxed min-h-[500px] outline-none focus:border-blue-500 transition-all shadow-inner"
                           placeholder="Vovô, escreva aqui a sua história e eu trato de a tornar mágica! hihi!"
                        />
                     ) : (
                        <div className="space-y-8 text-lg md:text-xl text-slate-200 leading-relaxed font-medium">
                           {founderBio ? (
                              founderBio.split('\n').map((para, i) => (
                                 para.trim() ? (
                                    <p key={i} className="first-letter:text-5xl first-letter:font-black first-letter:text-brand-500 first-letter:mr-3 first-letter:float-left animate-fade-in mb-6">
                                       {para}
                                    </p>
                                 ) : <br key={i} />
                              ))
                           ) : (
                              <div className="flex flex-col items-center py-20 text-center space-y-6">
                                 <BookText className="w-16 h-16 text-slate-800" />
                                 <p className="italic text-slate-500 max-w-md mx-auto">
                                    Esta página aguarda as memórias de Jorge Mesquita. 
                                    Se for o administrador, clique no botão para começar a escrever o seu legado mundial.
                                 </p>
                              </div>
                           )}
                        </div>
                     )}
                  </div>
               </div>

               {/* Timeline Estilizada */}
               <div className="space-y-12">
                  <div className="flex items-center gap-4">
                     <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] whitespace-nowrap">Marcos Históricos</h4>
                     <div className="h-px w-full bg-gradient-to-r from-slate-800 to-transparent"></div>
                  </div>

                  <div className="relative pl-8 md:pl-0">
                     {/* Linha Central Neon */}
                     <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-600 via-blue-600 to-transparent rounded-full opacity-20 hidden md:block"></div>
                     
                     <div className="grid grid-cols-1 gap-12">
                        {milestones.map((ms, idx) => (
                           <div key={idx} className={`relative flex flex-col md:flex-row items-center gap-8 group ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                              
                              {/* Círculo da Timeline */}
                              <div className="absolute left-[-32px] md:left-1/2 md:-translate-x-1/2 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-950 border-4 border-slate-800 rounded-full z-10 group-hover:border-brand-500 group-hover:scale-125 transition-all group-hover:shadow-[0_0_20px_rgba(244,63,94,0.4)]"></div>

                              <div className="flex-1 w-full">
                                 <div className={`bg-slate-900/60 border border-slate-800 rounded-[2.5rem] p-8 transition-all hover:bg-slate-900 hover:border-blue-500/30 group-hover:-translate-y-2 shadow-xl ${idx % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                                    {isAdmin ? (
                                       <div className="space-y-4">
                                          <div className={`flex gap-3 ${idx % 2 === 0 ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
                                             <input value={ms.year} onChange={e => updateMilestone(idx, 'year', e.target.value)} className="w-24 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-brand-500 font-black text-center outline-none" />
                                             <input value={ms.title} onChange={e => updateMilestone(idx, 'title', e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white font-black outline-none" />
                                             <button onClick={() => deleteMilestone(idx)} className="p-2 text-slate-700 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
                                          </div>
                                          <textarea value={ms.description} onChange={e => updateMilestone(idx, 'description', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-400 text-sm h-24 outline-none" />
                                       </div>
                                    ) : (
                                       <>
                                          <span className="text-3xl font-black text-brand-600 italic tracking-tighter mb-2 block">{ms.year}</span>
                                          <h5 className="text-xl font-bold text-white mb-3 uppercase tracking-tight">{ms.title}</h5>
                                          <p className="text-slate-400 text-base leading-relaxed">{ms.description}</p>
                                       </>
                                    )}
                                 </div>
                              </div>
                              <div className="flex-1 hidden md:block"></div>
                           </div>
                        ))}
                     </div>

                     {isAdmin && (
                        <div className="mt-12 flex justify-center">
                           <button onClick={addMilestone} className="flex items-center gap-3 px-8 py-4 bg-brand-900/20 text-brand-400 border border-brand-500/20 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-600 hover:text-white transition-all group">
                              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> Adicionar Marco à História
                           </button>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Secção Manual do Guardião - NOVO: Segurança da Informação */}
      <div className="max-w-7xl mx-auto px-6 py-20">
         <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-[0.05] pointer-events-none">
               <ShieldAlert className="w-64 h-64 text-red-500" />
            </div>
            
            <div className="max-w-3xl space-y-8 relative z-10">
               <div>
                  <h4 className="text-[10px] font-black text-red-500 uppercase tracking-[0.5em] mb-2">Protocolo de Segurança</h4>
                  <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase">Manual do Guardião: Nunca perder a História</h3>
               </div>
               
               <p className="text-slate-400 text-lg leading-relaxed">
                  Vovô Jorge, a sua informação é guardada neste navegador. Para que ela seja eterna e protegida contra falhas de computador, siga este ritual de segurança:
               </p>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                     <div className="flex items-center gap-3 text-brand-500">
                        <Download className="w-5 h-5" />
                        <span className="text-xs font-black uppercase tracking-widest">Passo 1: Exportar</span>
                     </div>
                     <p className="text-xs text-slate-500 leading-relaxed">
                        Uma vez por mês, ou sempre que adicionar muitos itens, clique no botão <strong>"JSON"</strong> no topo e escolha <strong>"Exportar Backup"</strong>.
                     </p>
                  </div>
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                     <div className="flex items-center gap-3 text-blue-500">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="text-xs font-black uppercase tracking-widest">Passo 2: Guardar</span>
                     </div>
                     <p className="text-xs text-slate-500 leading-relaxed">
                        Guarde esse ficheiro (.json) numa Pen USB ou envie por email para si próprio. Esse ficheiro é o "DNA" de toda a sua coleção.
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Secção Cápsula do Tempo - Estilo Digital */}
      <div className="max-w-7xl mx-auto px-6 py-12">
         <div className="bg-gradient-to-br from-blue-900/40 via-brand-900/10 to-purple-900/20 border border-white/5 rounded-[4rem] p-12 md:p-24 relative overflow-hidden text-center shadow-[0_0_100px_rgba(0,0,0,0.5)]">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
            
            <div className="relative z-10 space-y-8">
               <div className="bg-slate-950 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto border border-white/10 shadow-2xl rotate-12 mb-12">
                  <Hourglass className="w-12 h-12 text-blue-400 animate-pulse" />
               </div>
               <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-none">
                  Uma Herança para o <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500">Futuro</span>
               </h2>
               <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed">
                  Este arquivo não é apenas código e imagens. É o trabalho de uma vida protegida por tecnologia de ponta. 
                  Chloe, Pedro e todos os que virão depois poderão aceder a este tesouro com um único clique, garantindo que a paixão do vovô Jorge seja eterna.
               </p>
               <div className="flex justify-center gap-6 pt-12">
                  <div className="flex flex-col items-center gap-2">
                     <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-emerald-500 shadow-lg">
                        <Save className="w-6 h-6" />
                     </div>
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Seguro</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                     <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-blue-500 shadow-lg">
                        <ShieldCheck className="w-6 h-6" />
                     </div>
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protegido</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                     <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-purple-500 shadow-lg">
                        <History className="w-6 h-6" />
                     </div>
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Eterno</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
