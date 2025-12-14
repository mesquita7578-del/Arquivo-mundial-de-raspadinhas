import React from 'react';
import { X, BookOpen, Scroll } from 'lucide-react';

interface HistoryModalProps {
  onClose: () => void;
  t: any;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ onClose, t }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-4xl h-[85vh] shadow-2xl relative overflow-hidden flex flex-col">
        
        {/* Header decoration */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-600 via-purple-600 to-brand-600"></div>

        {/* Top Bar */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md z-10">
           <div className="flex items-center gap-3">
             <div className="bg-brand-900/30 p-2 rounded-lg border border-brand-800/50">
                <BookOpen className="w-6 h-6 text-brand-500" />
             </div>
             <div>
               <h2 className="text-2xl font-bold text-white tracking-tight">{t.title}</h2>
               <p className="text-gray-400 text-sm">{t.subtitle}</p>
             </div>
           </div>
           
           <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-800 p-2 rounded-full transition-colors"
           >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-12 scroll-smooth">
           
           {/* Article 1 */}
           <article className="prose prose-invert max-w-none">
             <div className="flex items-center gap-2 text-brand-400 mb-4">
               <Scroll className="w-5 h-5" />
               <span className="text-sm font-bold uppercase tracking-widest">Capítulo 1</span>
             </div>
             <h3 className="text-3xl font-bold text-gray-100 mb-4">A Origem das Raspadinhas</h3>
             <div className="text-gray-300 space-y-4 text-lg leading-relaxed">
               <p>
                 A história das raspadinhas modernas remonta a 1974, nos Estados Unidos, quando a empresa Scientific Games Corporation (liderada pelo cientista John Koza e pelo especialista em marketing Daniel Bower) criou o primeiro bilhete de lotaria instantânea seguro e gerado por computador.
               </p>
               <p>
                 Antes disso, as lotarias dependiam de sorteios semanais ou mensais. A inovação de Koza e Bower permitiu que os jogadores soubessem instantaneamente se tinham ganho, revolucionando a indústria do jogo.
               </p>
               <p>
                 Em Portugal, as raspadinhas ganharam uma popularidade imensa sob a gestão da Santa Casa da Misericórdia, tornando-se num dos jogos sociais mais vendidos, com receitas que muitas vezes superam as de lotarias clássicas como o Totoloto.
               </p>
             </div>
           </article>

           <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>

           {/* Article 2 */}
           <article className="prose prose-invert max-w-none">
             <div className="flex items-center gap-2 text-brand-400 mb-4">
               <Scroll className="w-5 h-5" />
               <span className="text-sm font-bold uppercase tracking-widest">Capítulo 2</span>
             </div>
             <h3 className="text-3xl font-bold text-gray-100 mb-4">O Colecionismo e o Estado "MINT"</h3>
             <div className="text-gray-300 space-y-4 text-lg leading-relaxed">
               <p>
                 Para um colecionador, o estado de conservação é tudo. Enquanto a maioria das pessoas raspa o bilhete inteiro e o deita fora, os colecionadores procuram bilhetes "MINT" (novos, sem raspar) ou amostras ("SPECIMEN" / "VOID").
               </p>
               <p>
                 As raspadinhas "VOID" ou "AMOSTRA" são particularmente valiosas porque nunca entraram em circulação para venda. São produzidas pelas gráficas para testes de qualidade ou para demonstração aos revendedores.
               </p>
               <p>
                 Este arquivo digital serve precisamente para preservar essa memória gráfica, catalogando não apenas o valor monetário, mas a arte, a tipografia e a evolução cultural que cada pequeno bilhete representa.
               </p>
             </div>
           </article>

           {/* Add more articles here by copying the block above */}
           
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 bg-gray-900/50 flex justify-end">
           <button 
             onClick={onClose}
             className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-full font-bold transition-colors"
           >
             {t.close}
           </button>
        </div>

      </div>
    </div>
  );
};
