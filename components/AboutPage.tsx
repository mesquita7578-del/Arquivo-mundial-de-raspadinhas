import React from 'react';
import { Ticket, Globe, Users, Database, Sparkles, Mail, ArrowRight, Hourglass, Save, Sunrise, HeartHandshake } from 'lucide-react';

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

      {/* MANIFESTO PARA OS NOVOS (NOVO) */}
      <div className="max-w-5xl mx-auto px-6 -mt-10 relative z-20">
         <div className="bg-slate-800 border-l-4 border-brand-500 rounded-r-2xl p-8 md:p-10 shadow-2xl flex flex-col md:flex-row gap-8 items-center">
            <div className="bg-slate-900/50 p-6 rounded-full border border-slate-700 shrink-0">
               <Sunrise className="w-12 h-12 text-yellow-400 animate-pulse-slow" />
            </div>
            <div className="flex-1">
               <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                  Aos que estão a começar a jornada...
               </h3>
               <p className="text-slate-300 italic text-lg leading-relaxed mb-4">
                  "Este arquivo não foi construído apenas para guardar o passado, mas para iluminar o futuro. Se chegaste agora ao mundo do colecionismo, sabe que não estás sozinho. Esta base de dados é o nosso presente para ti, para que possas estudar, apreciar e continuar esta história. O legado agora também está nas tuas mãos."
               </p>
               <div className="flex items-center gap-2 text-sm font-bold text-brand-400 uppercase tracking-widest">
                  <HeartHandshake className="w-4 h-4" />
                  Jorge Mesquita & Fabio Pagni
               </div>
            </div>
         </div>
      </div>

      {/* Legacy Section - TIME CAPSULE */}
      <div className="max-w-7xl mx-auto px-6 pt-16">
        <div className="bg-gradient-to-br from-indigo-900/20 to-brand-900/10 border border-indigo-500/20 rounded-3xl p-8 md:p-12 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <Hourglass className="w-64 h-64 text-white" />
           </div>
           
           <div className="relative z-10 max-w-3xl">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                 <Hourglass className="w-8 h-8 text-indigo-400" />
                 Um Legado para o Futuro
              </h2>
              <div className="space-y-4 text-slate-300 text-lg leading-relaxed">
                 <p>
                    Este arquivo foi construído com uma visão de longo prazo. Não serve apenas para organizar a coleção de hoje, mas para garantir que a história destas peças de arte efémera sobreviva ao tempo.
                 </p>
                 <p>
                    <strong>Para a Chloe e para as gerações futuras:</strong> A tecnologia de "Exportação de Dados" (JSON) integrada neste site funciona como uma cápsula do tempo digital. Permite que toda a base de dados — com milhares de imagens e detalhes técnicos — seja guardada e transferida para novos sistemas no futuro, garantindo que o trabalho do avô Jorge nunca se perca.
                 </p>
                 <div className="mt-6 flex items-center gap-2 text-sm text-indigo-300 bg-indigo-900/30 w-fit px-4 py-2 rounded-lg border border-indigo-500/30">
                    <Save className="w-4 h-4" />
                    <span>Lembrete: Faça backups regulares usando o botão "Dados" no menu de Admin.</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 hover:border-brand-500/30 transition-colors group">
               <div className="w-12 h-12 bg-blue-900/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Database className="w-6 h-6 text-blue-400" />
               </div>
               <h3 className="text-xl font-bold text-white mb-3">Base de Dados Viva</h3>
               <p className="text-slate-400 leading-relaxed">
                  Cada registo é analisado por Inteligência Artificial para extrair dados técnicos como emissão, gráfica e data de lançamento.
               </p>
            </div>

            <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 hover:border-purple-500/30 transition-colors group">
               <div className="w-12 h-12 bg-purple-900/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-purple-400" />
               </div>
               <h3 className="text-xl font-bold text-white mb-3">Comunidade</h3>
               <p className="text-slate-400 leading-relaxed">
                  Criado por colecionadores, para colecionadores. Jorge Mesquita e Fabio Pagni lideram este esforço de preservação.
               </p>
            </div>

            <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 hover:border-green-500/30 transition-colors group">
               <div className="w-12 h-12 bg-green-900/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Globe className="w-6 h-6 text-green-400" />
               </div>
               <h3 className="text-xl font-bold text-white mb-3">Global</h3>
               <p className="text-slate-400 leading-relaxed">
                  Não importa o país ou a moeda. Se é uma raspadinha ou lotaria, tem lugar no nosso arquivo mundial.
               </p>
            </div>
         </div>
      </div>

      {/* Contact Section */}
      <div className="max-w-4xl mx-auto px-6 py-10">
         <div className="bg-gradient-to-r from-brand-900/20 to-purple-900/20 rounded-3xl p-8 md:p-12 text-center border border-white/5">
            <h2 className="text-3xl font-bold text-white mb-6">Quer contribuir ou tem dúvidas?</h2>
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
               Estamos sempre à procura de novos itens para catalogar e melhorar a nossa base de dados. Entre em contacto com a administração.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
               <a href="mailto:mesquita757@hotmail.com" className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                  <Mail className="w-5 h-5" />
                  Contactar Jorge
               </a>
               <a href="mailto:fabio.pagni@libero.it" className="inline-flex items-center justify-center gap-2 bg-slate-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-700 transition-colors border border-slate-700">
                  <Mail className="w-5 h-5" />
                  Contactar Fabio
               </a>
            </div>
         </div>
      </div>
    </div>
  );
};