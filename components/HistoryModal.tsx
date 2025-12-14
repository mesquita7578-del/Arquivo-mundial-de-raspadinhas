import React, { useState, useEffect } from 'react';
import { X, BookOpen, Scroll, FileText, UploadCloud, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import { storageService } from '../services/storage';
import { DocumentItem } from '../types';

interface HistoryModalProps {
  onClose: () => void;
  isAdmin: boolean;
  t: any;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ onClose, isAdmin, t }) => {
  const [activeTab, setActiveTab] = useState<'articles' | 'documents'>('articles');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null); // New state for Blob URL
  const [isUploading, setIsUploading] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  
  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, []);

  // Handle PDF Blob creation when a document is selected
  useEffect(() => {
    if (selectedDoc && selectedDoc.fileUrl) {
      try {
        // Convert Base64 string to Blob to fix iframe rendering issues in modern browsers
        const base64Part = selectedDoc.fileUrl.split(',')[1] || selectedDoc.fileUrl;
        const binaryString = window.atob(base64Part);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfBlobUrl(url);

        // Cleanup function to revoke URL when closing/switching
        return () => {
          URL.revokeObjectURL(url);
          setPdfBlobUrl(null);
        };
      } catch (e) {
        console.error("Erro ao processar PDF:", e);
        alert("Erro ao abrir o ficheiro PDF.");
      }
    }
  }, [selectedDoc]);

  const loadDocuments = async () => {
    try {
      const docs = await storageService.getDocuments();
      setDocuments(docs);
    } catch (e) {
      console.error("Erro ao carregar documentos", e);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert("Apenas arquivos PDF são permitidos.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit check
      alert(t.fileTooBig);
      return;
    }

    if (!docTitle.trim()) {
      alert("Por favor, escreva um título para o documento antes de carregar.");
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64 = reader.result as string;
      const newDoc: DocumentItem = {
        id: Math.random().toString(36).substr(2, 9),
        title: docTitle,
        fileName: file.name,
        fileUrl: base64,
        createdAt: Date.now()
      };

      try {
        await storageService.saveDocument(newDoc);
        setDocuments(prev => [newDoc, ...prev]);
        setDocTitle(''); // Reset title
        alert(t.addDocSuccess);
      } catch (err) {
        console.error("Erro ao salvar documento", err);
        alert("Erro ao salvar documento.");
      } finally {
        setIsUploading(false);
      }
    };
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t.deleteDocConfirm)) {
      try {
        await storageService.deleteDocument(id);
        setDocuments(prev => prev.filter(d => d.id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-5xl h-[90vh] shadow-2xl relative overflow-hidden flex flex-col">
        
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

        {/* Tabs */}
        {!selectedDoc && (
          <div className="flex border-b border-gray-800 px-6 bg-gray-900">
             <button
               onClick={() => setActiveTab('articles')}
               className={`py-4 px-6 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'articles' ? 'border-brand-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
             >
               <Scroll className="w-4 h-4" />
               {t.tabArticles}
             </button>
             <button
               onClick={() => setActiveTab('documents')}
               className={`py-4 px-6 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'documents' ? 'border-brand-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
             >
               <FileText className="w-4 h-4" />
               {t.tabDocs}
             </button>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative bg-gray-950">
           
           {/* DOC VIEWER MODE */}
           {selectedDoc ? (
             <div className="flex flex-col h-full animate-fade-in">
               <div className="flex items-center gap-4 p-4 border-b border-gray-800 bg-gray-900">
                 <button 
                   onClick={() => setSelectedDoc(null)}
                   className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-bold"
                 >
                   <ArrowLeft className="w-4 h-4" /> {t.backToList}
                 </button>
                 <span className="text-white font-bold truncate">{selectedDoc.title}</span>
               </div>
               <div className="flex-1 bg-gray-800 relative">
                 {pdfBlobUrl ? (
                   <iframe 
                     src={pdfBlobUrl} 
                     className="w-full h-full border-none"
                     title="PDF Viewer"
                     type="application/pdf"
                   />
                 ) : (
                   <div className="flex items-center justify-center h-full">
                     <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                   </div>
                 )}
               </div>
             </div>
           ) : (
             // LIST / TABS MODE
             <div className="h-full overflow-y-auto p-6 md:p-10 scroll-smooth">
               
               {activeTab === 'articles' ? (
                 <div className="space-y-12 max-w-3xl mx-auto">
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
                 </div>
               ) : (
                 <div className="max-w-4xl mx-auto">
                    {/* Upload Section (Admin Only) */}
                    {isAdmin && (
                      <div className="mb-10 bg-gray-900 border border-dashed border-gray-700 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6">
                         <div className="flex-1 w-full">
                           <label className="block text-xs uppercase text-gray-500 font-bold mb-2">1. {t.docTitlePlaceholder}</label>
                           <input 
                             type="text" 
                             value={docTitle}
                             onChange={(e) => setDocTitle(e.target.value)}
                             placeholder={t.docTitlePlaceholder}
                             className="w-full bg-gray-800 border border-gray-700 text-white rounded px-4 py-2 focus:border-brand-500 outline-none"
                           />
                         </div>
                         <div className="w-full md:w-auto flex flex-col gap-2">
                           <label className="block text-xs uppercase text-gray-500 font-bold">2. {t.uploadPdf}</label>
                           <label className={`flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-6 py-2 rounded-lg cursor-pointer transition-colors shadow-lg ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                             {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                             <span className="text-sm font-bold">{isUploading ? "Enviando..." : t.uploadPdf}</span>
                             <input type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} disabled={!docTitle.trim()} />
                           </label>
                         </div>
                      </div>
                    )}

                    {/* Documents Grid */}
                    {documents.length === 0 ? (
                      <div className="text-center py-20 text-gray-500">
                        <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p>{t.noDocs}</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {documents.map(doc => (
                           <div key={doc.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-brand-500/50 transition-all group flex flex-col h-full">
                              <div className="flex items-start justify-between mb-4">
                                <div className="bg-gray-800 p-3 rounded-lg text-brand-500 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                                  <FileText className="w-6 h-6" />
                                </div>
                                {isAdmin && (
                                  <button onClick={() => handleDelete(doc.id)} className="text-gray-600 hover:text-red-500 p-1">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                              <h4 className="text-lg font-bold text-gray-200 mb-1 group-hover:text-white">{doc.title}</h4>
                              <p className="text-xs text-gray-500 mb-4">{new Date(doc.createdAt).toLocaleDateString()} • PDF</p>
                              
                              <button 
                                onClick={() => setSelectedDoc(doc)}
                                className="mt-auto w-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white py-2 rounded-lg text-sm font-bold transition-colors border border-gray-700"
                              >
                                {t.viewPdf}
                              </button>
                           </div>
                         ))}
                      </div>
                    )}
                 </div>
               )}
             </div>
           )}
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
