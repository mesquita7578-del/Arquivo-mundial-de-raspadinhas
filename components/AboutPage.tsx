
import React from 'react';
import { Ticket, Globe, Users, Database, Sparkles, Mail, Hourglass, Save, Sunrise, HeartHandshake, Award, ShieldCheck, User } from 'lucide-react';

export const AboutPage = ({ t }: { t: any }) => {
  return (
    <div className="w-full min-h-full animate-fade-in pb-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 border-b border-slate-800">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-600/20 rounded-full blur-[100px]"></div>
        
        <div className="max-w-7xl mx-auto px-6 py-20 relative z-10 flex flex-col md:flex-row items-center gap-12">
           <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 bg-brand-900/30 border border-brand-500/30 text-brand-400 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider">
                 <Sparkles className="w-4 h-4" />
                 <span>O Arquivo Digital</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-white leading-tight">
                 Preservando a História da <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-purple-600">Sorte Instantânea</span>
              </h1>
              <p className="text-xl text-slate-400 leading-relaxed max-w-2xl">
                 Bem-vindo ao maior catálogo digital colaborativo de raspadinhas, lotarias e boletins. Um projeto dedicado a colecionadores e entusiastas.
              </p>
           </div>
           
           <div className="flex-1 w-full max-w-md">
              <div className="aspect-square bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-slate-700 p-8 shadow-2xl relative rotate-3 hover:rotate-0 transition-transform duration-500">
                 <Ticket className="w-full h-full text-brand-500/20 absolute inset-0 m-auto" />
                 <div className="relative z-10 h-full flex flex-col justify-center items-center text-center space-y-4">
                    <Globe className="w-16 h-16 text-brand-500" />
                    <h3 className="text-2xl font-bold text-white">Arquivo Mundial</h3>
                    <p className="text-slate-400">Juntando peças de Portugal, Itália, Brasil e do mundo inteiro numa única plataforma inteligente.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* OS FUNDADORES - NOVO DESTAQUE PARA JORGE */}
      <div className="max-w-7xl mx-auto px-6 py-24">
         <div className="flex flex-col items-center mb-16 text-center">
            <h2 className="text-[10px] font-black text-brand-500 uppercase tracking-[0.4em] mb-4">A Mente Criativa</h2>
            <h3 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter">O Rosto do Arquivo</h3>
         </div>

         <div className="flex flex-col md:flex-row gap-12 items-center justify-center">
            {/* Card Jorge Mesquita */}
            <div className="w-full max-w-md group">
               <div className="relative bg-slate-900 border-2 border-slate-800 rounded-[3rem] p-8 md:p-10 shadow-2xl transition-all duration-500 group-hover:border-blue-500/50 group-hover:shadow-blue-900/20 overflow-hidden">
                  {/* Background Decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="relative z-10 flex flex-col items-center">
                     <div className="relative mb-8">
                        <div className="w-48 h-48 md:w-56 md:h-56 rounded-[2.5rem] overflow-hidden border-4 border-slate-800 shadow-2xl group-hover:scale-105 transition-transform duration-700 bg-slate-950">
                           {/* Placeholder da foto enviada - O utilizador pode trocar para o link final */}
                           <img 
                              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&h=400&auto=format&fit=crop" 
                              alt="Jorge Mesquita" 
                              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                           />
                        </div>
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-xl border-2 border-slate-900 flex items-center gap-2 whitespace-nowrap">
                           <Award className="w-3 h-3" /> Fundador Vitalício
                        </div>
                     </div>

                     <div className="text-center space-y-3">
                        <h4 className="text-3xl font-black text-white uppercase italic tracking-tighter">Jorge Mesquita</h4>
                        <div className="flex items-center justify-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-widest">
                           <ShieldCheck className="w-4 h-4" /> Guardião da História
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed mt-4 italic">
                           "O mentor deste arquivo. Com um olhar técnico e uma paixão inabalável, o Jorge dedicou décadas à catalogação de peças que outros poderiam ignorar, mas que aqui ganham o estatuto de tesouros mundiais."
                        </p>
                     </div>

                     <div className="mt-8 flex gap-3">
                        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex flex-col items-center">
                           <span className="text-[14px] font-black text-white leading-none">PT</span>
                           <span className="text-[7px] font-black text-slate-600 uppercase mt-1">Sede</span>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex flex-col items-center">
                           <Ticket className="w-5 h-5 text-brand-500" />
                           <span className="text-[7px] font-black text-slate-600 uppercase mt-1">Curador</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* MANIFESTO PARA OS NOVOS */}
            <div className="flex-1 max-w-xl space-y-8">
               <div className="bg-slate-900/50 border-l-4 border-brand-500 rounded-r-2xl p-8 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                     <Sunrise className="w-48 h-48 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                     <Sunrise className="w-6 h-6 text-yellow-500" />
                     Mensagem aos Colecionadores
                  </h3>
                  <p className="text-slate-300 italic text-lg leading-relaxed mb-6">
                     "Este arquivo não foi construído apenas para guardar o passado, mas para iluminar o futuro. Se chegaste agora ao mundo do colecionismo, sabe que não estás sozinho. Esta base de dados é o nosso presente para ti, para que possas estudar, apreciar e continuar esta história."
                  </p>
                  <div className="flex items-center gap-2 text-[10px] font-black text-brand-400 uppercase tracking-[0.2em]">
                     <HeartHandshake className="w-4 h-4" />
                     Legado Jorge Mesquita & Fabio Pagni
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800">
                     <h5 className="text-white font-black text-xs uppercase mb-2">Visão</h5>
                     <p className="text-[11px] text-slate-500 leading-relaxed">Preservar cada bilhete como uma cápsula do tempo cultural e artística.</p>
                  </div>
                  <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800">
                     <h5 className="text-white font-black text-xs uppercase mb-2">Missão</h5>
                     <p className="text-[11px] text-slate-500 leading-relaxed">Digitalizar a sorte para que o tempo nunca a consiga apagar.</p>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Legacy Section - TIME CAPSULE */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-br from-indigo-900/20 to-brand-900/10 border border-indigo-500/20 rounded-[3rem] p-8 md:p-16 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <Hourglass className="w-64 h-64 text-white" />
           </div>
           
           <div className="relative z-10 max-w-3xl">
              <h2 className="text-4xl font-black text-white mb-8 flex items-center gap-4 italic uppercase tracking-tighter">
                 <Hourglass className="w-10 h-10 text-indigo-400" />
                 Um Legado para o Futuro
              </h2>
              <div className="space-y-6 text-slate-300 text-lg leading-relaxed">
                 <p>
                    Este arquivo foi construído com uma visão de longo prazo. Não serve apenas para organizar a coleção de hoje, mas para garantir que a história destas peças de arte efémera sobreviva ao tempo.
                 </p>
                 <p>
                    <strong>Para a Chloe e para as gerações futuras:</strong> A tecnologia de "Exportação de Dados" integrada neste site funciona como uma cápsula do tempo digital. Permite que toda a base de dados seja transferida para novos sistemas no futuro, garantindo que o trabalho do avô Jorge nunca se perca.
                 </p>
                 <div className="mt-8 flex items-center gap-3 text-xs font-black text-indigo-300 bg-indigo-900/40 w-fit px-6 py-3 rounded-2xl border border-indigo-500/30 uppercase tracking-widest">
                    <Save className="w-4 h-4" />
                    <span>Backups regulares garantem a eternidade.</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 hover:border-brand-500/30 transition-colors group">
               <div className="w-12 h-12 bg-blue-900/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Database className="w-6 h-6 text-blue-400" />
               </div>
               <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-tighter">Base de Dados Viva</h3>
               <p className="text-slate-400 text-sm leading-relaxed">
                  Cada registo é analisado por Inteligência Artificial para extrair dados técnicos como emissão, gráfica e data de lançamento.
               </p>
            </div>

            <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 hover:border-purple-500/30 transition-colors group">
               <div className="w-12 h-12 bg-purple-900/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-purple-400" />
               </div>
               <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-tighter">Comunidade</h3>
               <p className="text-slate-400 text-sm leading-relaxed">
                  Criado por colecionadores, para colecionadores. Jorge Mesquita e Fabio Pagni lideram este esforço de preservação mundial.
               </p>
            </div>

            <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 hover:border-green-500/30 transition-colors group">
               <div className="w-12 h-12 bg-green-900/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Globe className="w-6 h-6 text-green-400" />
               </div>
               <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-tighter">Alcance Global</h3>
               <p className="text-slate-400 text-sm leading-relaxed">
                  Não importa o país ou a moeda. Se é uma raspadinha ou lotaria histórica, tem um lugar garantido no nosso arquivo.
               </p>
            </div>
         </div>
      </div>

      {/* Contact Section */}
      <div className="max-w-4xl mx-auto px-6 py-10">
         <div className="bg-gradient-to-r from-brand-900/20 to-purple-900/20 rounded-[3rem] p-8 md:p-12 text-center border border-white/5 shadow-2xl">
            <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-tighter italic">Quer contribuir ou tem dúvidas?</h2>
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto text-sm font-medium">
               Estamos sempre à procura de novos itens para catalogar e melhorar a nossa base de dados mundial. Entre em contacto com a administração.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
               <a href="mailto:mesquita757@hotmail.com" className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95">
                  <Mail className="w-4 h-4" />
                  Contactar Jorge
               </a>
               <a href="mailto:fabio.pagni@libero.it" className="inline-flex items-center justify-center gap-2 bg-slate-800 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition-all border border-slate-700 active:scale-95">
                  <Mail className="w-4 h-4" />
                  Contactar Fabio
               </a>
            </div>
         </div>
      </div>
    </div>
  );
};
