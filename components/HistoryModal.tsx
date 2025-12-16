import React, { useState, useEffect } from 'react';
import { X, BookOpen, Scroll, FileText, UploadCloud, Trash2, ArrowLeft, Loader2, Download, Maximize2, Library, ExternalLink, UserCheck, Star } from 'lucide-react';
import { storageService } from '../services/storage';
import { DocumentItem } from '../types';

interface HistoryModalProps {
  onClose: () => void;
  isAdmin: boolean;
  t: any;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ onClose, isAdmin, t }) => {
  const [activeTab, setActiveTab] = useState<'collection' | 'catalogs'>('collection');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
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
        // Convert Base64 string to Blob to fix rendering issues in modern browsers/mobile
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

    // INCREASED LIMIT: 50MB
    if (file.size > 50 * 1024 * 1024) { 
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
        alert("Erro ao salvar documento. Pode ser muito grande para o armazenamento local.");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      {/* 
         LAYOUT MOBILE: w-full h-full rounded-none
         LAYOUT DESKTOP: max-w-5xl rounded-2xl h-[90vh]
      */}
      <div className="bg-gray-900 border border-gray-800 w-full h-full md:max-w-5xl md:h-[90vh] md:rounded-2xl shadow-2xl relative overflow-hidden flex flex-col">
        
        {/* Header decoration */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-600 via-purple-600 to-brand-600 z-20"></div>

        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md z-10 shrink-0">
           <div className="flex items-center gap-3">
             <div className="bg-brand-900/30 p-2 rounded-lg border border-brand-800/50">
                <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-brand-500" />
             </div>
             <div>
               <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">{t.title}</h2>
               <p className="text-gray-400 text-xs md:text-sm">{t.subtitle}</p>
             </div>
           </div>
           
           <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-800 p-2 rounded-full transition-colors"
           >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs - Only show when not viewing a specific document */}
        {!selectedDoc && (
          <div className="flex border-b border-gray-800 px-4 md:px-6 bg-gray-900 shrink-0 overflow-x-auto scrollbar-hide">
             <button
               onClick={() => setActiveTab('collection')}
               className={`py-3 md:py-4 px-4 md:px-6 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'collection' ? 'border-brand-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
             >
               <Scroll className="w-4 h-4" />
               {t.tabCollection}
             </button>
             <button
               onClick={() => setActiveTab('catalogs')}
               className={`py-3 md:py-4 px-4 md:px-6 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'catalogs' ? 'border-brand-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
             >
               <Library className="w-4 h-4" />
               {t.tabCatalogs}
             </button>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative bg-gray-950 flex flex-col">
           
           {/* DOC VIEWER MODE */}
           {selectedDoc ? (
             <div className="flex flex-col h-full animate-fade-in relative">
               <div className="flex items-center gap-4 p-3 md:p-4 border-b border-gray-800 bg-gray-900 shrink-0">
                 <button 
                   onClick={() => setSelectedDoc(null)}
                   className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-bold"
                 >
                   <ArrowLeft className="w-4 h-4" /> {t.backToList}
                 </button>
                 <span className="text-white font-bold truncate">{selectedDoc.title}</span>
               </div>
               
               <div className="flex-1 bg-gray-800 relative w-full h-full">
                 {pdfBlobUrl ? (
                   <>
                     {/* Object tag works better than iframe for PDFs on mobile */}
                     <object 
                       data={pdfBlobUrl} 
                       type="application/pdf"
                       className="w-full h-full block"
                     >
                       {/* Fallback for browsers that absolutely cannot display inline PDF */}
                       <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center space-y-4">
                         <FileText className="w-16 h-16 opacity-20" />
                         <p>Não foi possível pré-visualizar o PDF aqui.</p>
                         <a 
                           href={pdfBlobUrl} 
                           target="_blank" 
                           rel="noreferrer"
                           className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2"
                         >
                           <Download className="w-4 h-4" /> Abrir PDF Externamente
                         </a>
                       </div>
                     </object>

                     {/* MOBILE/TABLET FLOATING BUTTON: 
                         Ensures users can always open the file if the inline viewer is cramped or buggy on iOS/Android 
                     */}
                     <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-max md:hidden">
                        <a 
                           href={pdfBlobUrl} 
                           target="_blank" 
                           rel="noreferrer"
                           className="bg-gray-900/90 border border-gray-700 text-white px-6 py-3 rounded-full font-bold shadow-xl backdrop-blur-md flex items-center gap-2 active:scale-95 transition-transform"
                         >
                           <Maximize2 className="w-4 h-4" /> Abrir / Baixar
                         </a>
                     </div>
                   </>
                 ) : (
                   <div className="flex items-center justify-center h-full">
                     <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                   </div>
                 )}
               </div>
             </div>
           ) : (
             // LIST / TABS MODE
             <div className="h-full overflow-y-auto p-4 md:p-10 scroll-smooth">
               
               {activeTab === 'catalogs' ? (
                  <div className="max-w-4xl mx-auto pb-20 animate-fade-in">
                     <div className="bg-gradient-to-br from-brand-900/20 to-slate-900 border border-brand-800/30 rounded-2xl p-8 shadow-xl relative overflow-hidden group hover:border-brand-500/50 transition-colors">
                        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                           <Library className="w-48 h-48 text-white" />
                        </div>
                        
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                           <div className="bg-white/10 p-6 rounded-2xl border border-white/10 shadow-inner">
                              <BookOpen className="w-16 h-16 text-brand-400" />
                           </div>
                           <div className="flex-1 text-center md:text-left">
                              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                 <h3 className="text-2xl md:text-3xl font-bold text-white">{t.catalogTitle}</h3>
                                 <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 animate-pulse" />
                              </div>
                              <p className="text-slate-300 text-lg mb-4 leading-relaxed">
                                 {t.catalogSubtitle}
                              </p>
                              
                              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700 mb-6 inline-flex items-center gap-3">
                                 <UserCheck className="w-5 h-5 text-blue-400" />
                                 <p className="text-sm text-slate-300">
                                    {t.catalogDavid}
                                 </p>
                              </div>

                              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                 <a 
                                    href="https://anyflip.com/bookcase/bidzw" 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg shadow-brand-900/50 hover:scale-105 transition-all"
                                 >
                                    {t.openCatalog} <ExternalLink className="w-5 h-5" />
                                 </a>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               ) : (
                 <div className="max-w-4xl mx-auto pb-20 space-y-12 animate-fade-in">
                    
                    {/* SECTION 1: STATIC HISTORY */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
                           <Scroll className="w-6 h-6 text-brand-500" />
                           <h3 className="text-2xl font-bold text-white">{t.articlesTitle}</h3>
                        </div>
                        
                        <article className="prose prose-invert max-w-none bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
                           <h3 className="text-xl font-bold text-gray-100 mb-3">A Origem das Raspadinhas</h3>
                           <p className="text-gray-400 leading-relaxed text-sm">
                              A história das raspadinhas modernas remonta a 1974, nos Estados Unidos, quando a empresa Scientific Games Corporation (liderada pelo cientista John Koza e pelo especialista em marketing Daniel Bower) criou o primeiro bilhete de lotaria instantânea seguro e gerado por computador.
                           </p>
                        </article>

                        <article className="prose prose-invert max-w-none bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
                           <h3 className="text-xl font-bold text-gray-100 mb-3">O Colecionismo e o Estado "MINT"</h3>
                           <p className="text-gray-400 leading-relaxed text-sm">
                              Para um colecionador, o estado de conservação é tudo. Enquanto a maioria das pessoas raspa o bilhete inteiro e o deita fora, os colecionadores procuram bilhetes "MINT" (novos, sem raspar) ou amostras ("SPECIMEN" / "VOID").
                           </p>
                        </article>
                    </div>

                    {/* SECTION 2: UPLOADED DOCUMENTS */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                           <div className="flex items-center gap-3">
                              <FileText className="w-6 h-6 text-blue-500" />
                              <h3 className="text-2xl font-bold text-white">{t.documentsTitle}</h3>
                           </div>
                           <span className="text-xs font-bold bg-gray-800 px-2 py-1 rounded text-gray-400">{documents.length} Docs</span>
                        </div>

                        {/* Upload Form (Admin) */}
                        {isAdmin && (
                           <div className="bg-blue-900/10 border border-dashed border-blue-500/30 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4">
                              <div className="flex-1 w-full">
                                 <input 
                                    type="text" 
                                    value={docTitle}
                                    onChange={(e) => setDocTitle(e.target.value)}
                                    placeholder={t.docTitlePlaceholder}
                                    className="w-full bg-gray-900 border border-gray-700 text-white rounded px-4 py-2 focus:border-brand-500 outline-none text-sm"
                                 />
                              </div>
                              <label className={`flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-lg whitespace-nowrap ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                 {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                                 <span className="text-xs font-bold">{isUploading ? "Enviando..." : t.uploadPdf}</span>
                                 <input type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} disabled={!docTitle.trim()} />
                              </label>
                           </div>
                        )}

                        {/* Documents Grid */}
                        {documents.length === 0 ? (
                           <div className="text-center py-10 text-gray-600 italic border border-gray-800 rounded-xl">
                              {t.noDocs}
                           </div>
                        ) : (
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {documents.map(doc => (
                                 <div key={doc.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-brand-500/50 transition-all group flex flex-col relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-brand-500/10 to-transparent rounded-bl-full pointer-events-none"></div>
                                    
                                    <div className="flex items-start justify-between mb-3">
                                       <div className="bg-gray-800 p-2 rounded-lg text-brand-500">
                                          <FileText className="w-5 h-5" />
                                       </div>
                                       {isAdmin && (
                                          <button onClick={() => handleDelete(doc.id)} className="text-gray-600 hover:text-red-500 p-1 transition-colors">
                                             <Trash2 className="w-4 h-4" />
                                          </button>
                                       )}
                                    </div>
                                    <h4 className="text-sm font-bold text-gray-200 mb-1 group-hover:text-white line-clamp-2">{doc.title}</h4>
                                    <p className="text-[10px] text-gray-500 mb-4">{new Date(doc.createdAt).toLocaleDateString()}</p>
                                    
                                    <button 
                                       onClick={() => setSelectedDoc(doc)}
                                       className="mt-auto w-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white py-2 rounded-lg text-xs font-bold transition-colors border border-gray-700 uppercase tracking-wide"
                                    >
                                       {t.viewPdf}
                                    </button>
                                 </div>
                              ))}
                           </div>
                        )}
                    </div>

                 </div>
               )}
             </div>
           )}
        </div>

        {/* Footer (Only in main view) */}
        {!selectedDoc && (
          <div className="p-4 md:p-6 border-t border-gray-800 bg-gray-900/50 flex justify-end shrink-0">
             <button 
               onClick={onClose}
               className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-full font-bold transition-colors"
             >
               {t.close}
             </button>
          </div>
        )}

      </div>
    </div>
  );
};