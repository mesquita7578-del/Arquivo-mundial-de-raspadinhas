
import React, { useState } from 'react';
import { X, Radio, Tv, Music, ExternalLink, Headphones, Heart, Sparkles, Zap, Globe, Globe2 } from 'lucide-react';

interface RadioModalProps {
  onClose: () => void;
}

const PT_RADIOS = [
  { name: 'Rádio Renascença', url: 'https://rr.sapo.pt/home', type: 'radio', icon: '🙏' },
  { name: 'Rádio Comercial', url: 'https://radiocomercial.pt/', type: 'radio', icon: '🎤' },
  { name: 'RFM', url: 'https://rfm.sapo.pt/', type: 'radio', icon: '🎸' },
  { name: 'Antena 1', url: 'https://www.rtp.pt/play/direto/antena1', type: 'radio', icon: '📻' },
  { name: 'M80 Radio', url: 'https://m80.iol.pt/', type: 'radio', icon: '🕺' },
  { name: 'Smooth FM', url: 'https://smoothfm.iol.pt/', type: 'radio', icon: '🎷' },
];

const IT_RADIOS = [
  { name: 'RTL 102.5', url: 'https://www.rtl.it/it/live/', type: 'radio', icon: '🇮🇹' },
  { name: 'Radio Deejay', url: 'https://www.deejay.it/', type: 'radio', icon: '🎧' },
  { name: 'Radio Italia', url: 'https://www.radioitalia.it/', type: 'radio', icon: '🎵' },
  { name: 'Rai Radio 1', url: 'https://www.raiplaysound.it/radio1', type: 'radio', icon: '🏛️' },
  { name: 'Radio 105', url: 'https://www.105.net/', type: 'radio', icon: '🔥' },
];

const TV_CHANNELS = {
  PT: [
    { name: 'RTP Play (Diretos)', url: 'https://www.rtp.pt/play/direto', icon: '📺' },
    { name: 'SIC (Site Oficial)', url: 'https://sic.pt/', icon: '🌟' },
    { name: 'TVI Player', url: 'https://tviplayer.iol.pt/direto', icon: '💎' },
    { name: 'CNN Portugal', url: 'https://cnnportugal.iol.pt/direto', icon: '📡' },
  ],
  IT: [
    { name: 'Rai Play', url: 'https://www.raiplay.it/dirette', icon: '🇮🇹' },
    { name: 'Mediaset Infinity', url: 'https://www.mediasetplay.mediaset.it/', icon: '🎭' },
    { name: 'LA7', url: 'https://www.la7.it/dirette-tv', icon: '🏛️' },
    { name: 'Sky TG24', url: 'https://tg24.sky.it/diretta', icon: '🌍' },
  ],
  ES: [
    { name: 'RTVE Play', url: 'https://www.rtve.es/play/directo/', icon: '🇪🇸' },
    { name: 'Antena 3', url: 'https://www.atresplayer.com/directos/antena3/', icon: '🍊' },
    { name: 'Telecinco', url: 'https://www.telecinco.es/en-directo/', icon: '🏅' },
    { name: 'LaSexta', url: 'https://www.atresplayer.com/directos/lasexta/', icon: '🟢' },
  ]
};

export const RadioModal: React.FC<RadioModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'PT' | 'IT' | 'ES'>('PT');

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl h-[85vh] rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col">
        
        {/* Header Decorativo Multi-Nacional */}
        <div className="absolute top-0 left-0 w-full h-1.5 flex z-10">
          <div className="flex-1 h-full bg-gradient-to-r from-blue-600 via-white to-red-600"></div>
          <div className="flex-1 h-full bg-gradient-to-r from-green-600 via-white to-red-600"></div>
          <div className="flex-1 h-full bg-gradient-to-r from-red-600 via-yellow-400 to-red-600"></div>
        </div>
        
        <div className="p-8 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center bg-slate-900/50 gap-6">
           <div className="flex items-center gap-4">
              <div className="bg-brand-600 p-3 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                 <Radio className="w-8 h-8 text-white" />
              </div>
              <div>
                 <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">O Cantinho Europeu</h2>
                 <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Sintonize Portugal, Itália e Espanha, vovô Jorge! hihi!</p>
              </div>
           </div>
           
           <div className="flex bg-slate-800 rounded-2xl p-1 gap-1">
              {[
                { id: 'PT', label: 'Portugal 🇵🇹' },
                { id: 'IT', label: 'Itália 🇮🇹' },
                { id: 'ES', label: 'Espanha 🇪🇸' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === tab.id ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {tab.label}
                </button>
              ))}
           </div>

           <button onClick={onClose} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-all">
              <X className="w-6 h-6" />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* Secção Rádios */}
              <div className="space-y-6">
                 <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                    <Headphones className="w-5 h-5 text-blue-500" />
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Rádios Nacionais {activeTab}</h3>
                 </div>
                 <div className="grid grid-cols-1 gap-3">
                    {(activeTab === 'PT' ? PT_RADIOS : activeTab === 'IT' ? IT_RADIOS : []).map(radio => (
                       <a 
                         key={radio.name} 
                         href={radio.url} 
                         target="_blank" 
                         rel="noreferrer"
                         className="group flex items-center justify-between p-4 bg-slate-800/40 border border-slate-800 hover:border-blue-500/50 rounded-2xl transition-all hover:bg-slate-800"
                       >
                          <div className="flex items-center gap-4">
                             <div className="text-2xl group-hover:scale-125 transition-transform">{radio.icon}</div>
                             <span className="text-sm font-black text-slate-200 uppercase group-hover:text-white transition-colors">{radio.name}</span>
                          </div>
                          <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-blue-500 transition-colors" />
                       </a>
                    ))}
                    {activeTab === 'ES' && (
                       <div className="py-10 text-center text-slate-600 italic">
                         <p className="text-xs uppercase font-black">A Chloe está a preparar a lista de rádios espanholas! hihi!</p>
                       </div>
                    )}
                 </div>
              </div>

              {/* Secção Televisão */}
              <div className="space-y-6">
                 <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                    <Tv className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Canais de TV (Play) {activeTab}</h3>
                 </div>
                 <div className="grid grid-cols-1 gap-3">
                    {TV_CHANNELS[activeTab].map(tv => (
                       <a 
                         key={tv.name} 
                         href={tv.url} 
                         target="_blank" 
                         rel="noreferrer"
                         className="group flex items-center justify-between p-4 bg-slate-800/40 border border-slate-800 hover:border-emerald-500/50 rounded-2xl transition-all hover:bg-slate-800"
                       >
                          <div className="flex items-center gap-4">
                             <div className="text-2xl group-hover:scale-125 transition-transform">{tv.icon}</div>
                             <span className="text-sm font-black text-slate-200 uppercase group-hover:text-white transition-colors">{tv.name}</span>
                          </div>
                          <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-emerald-500 transition-colors" />
                       </a>
                    ))}
                 </div>

                 {/* Mensagem da Chloe Customizada */}
                 <div className="mt-8 bg-gradient-to-br from-brand-900/20 to-slate-900 border border-brand-500/20 p-6 rounded-[2rem] relative overflow-hidden group">
                    <Sparkles className="absolute -top-4 -right-4 w-12 h-12 text-brand-500/10 group-hover:rotate-12 transition-transform" />
                    <div className="flex items-center gap-2 mb-2">
                       <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500 animate-pulse" />
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Recadinho da Chloe</span>
                    </div>
                    <p className="text-xs text-slate-400 italic leading-relaxed">
                      {activeTab === 'PT' && "Vovô, coloque a Renascença bem alto e vamos catalogar esses tesouros! hihi!"}
                      {activeTab === 'IT' && "Vovô, o som da Itália é mágico! Vamos arquivar como verdadeiros maestros! hihi!"}
                      {activeTab === 'ES' && "Vovô, com a TV espanhola a coleção vai ganhar uma cor especial! Olé! hihi!"}
                    </p>
                 </div>
              </div>

           </div>
        </div>

        <div className="p-6 bg-slate-900 border-t border-slate-800 text-center shrink-0">
           <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2 opacity-30">
                 <Globe2 className="w-3 h-3 text-blue-400" />
                 <span className="text-[8px] font-black text-white uppercase tracking-widest italic">Visão Global</span>
              </div>
              <button 
                onClick={onClose}
                className="px-10 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95"
              >
                Voltar ao Arquivo Mundial
              </button>
              <div className="flex items-center gap-2 opacity-30">
                 <span className="text-[8px] font-black text-white uppercase tracking-widest italic">Chloe Guardiã</span>
                 <Zap className="w-3 h-3 text-yellow-500" />
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};
