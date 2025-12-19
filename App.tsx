
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Image as ImageIcon, Trash2, 
  X, Sparkles, FolderOpen, LayoutGrid, 
  ArrowUpCircle, Info, Tag as TagIcon, Loader2
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { storage } from './storage';
import { ArchiveImage } from './types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const App: React.FC = () => {
  const [images, setImages] = useState<ArchiveImage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ArchiveImage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    storage.init().then(async () => {
      const all = await storage.getAllImages();
      setImages(all.sort((a, b) => b.createdAt - a.createdAt));
      setIsLoading(false);
    });
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64 = reader.result as string;
      
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [
            {
              inlineData: {
                mimeType: file.type,
                data: base64.split(',')[1],
              },
            },
            { text: "Analisa esta imagem e sugere um título curto, uma descrição detalhada e 5 etiquetas (tags) relevantes. Responde apenas em JSON." }
          ],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          }
        });

        const aiData = JSON.parse(response.text || '{}');
        const newImg: ArchiveImage = {
          id: crypto.randomUUID(),
          url: base64,
          title: aiData.title || file.name,
          description: aiData.description || 'Sem descrição.',
          tags: aiData.tags || [],
          category: 'Geral',
          date: new Date().toLocaleDateString(),
          createdAt: Date.now()
        };

        await storage.saveImage(newImg);
        setImages([newImg, ...images]);
      } catch (err) {
        console.error("Erro na IA:", err);
      } finally {
        setIsUploading(false);
      }
    };
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Deseja remover esta imagem do arquivo?")) {
      await storage.deleteImage(id);
      setImages(images.filter(img => img.id !== id));
      if (selectedImage?.id === id) setSelectedImage(null);
    }
  };

  const filteredImages = useMemo(() => {
    return images.filter(img => 
      img.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      img.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [images, searchTerm]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-900 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-brand-500 p-2 rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-black uppercase tracking-tighter italic">Visionary Archive</h1>
          </div>

          <div className="flex-1 max-w-xl relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-brand-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Procurar memórias ou etiquetas..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-4 py-3 text-sm focus:border-brand-500 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-2xl font-bold text-sm cursor-pointer transition-all flex items-center gap-2 shadow-lg shadow-brand-500/20 active:scale-95">
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {isUploading ? "Chloe a Analisar..." : "Arquivar Imagem"}
              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
            </label>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6">
        {isLoading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-4 text-zinc-500">
            <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
            <p className="font-bold uppercase tracking-widest text-xs">A carregar arquivo...</p>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center gap-6 text-zinc-500 border-2 border-dashed border-zinc-900 rounded-[3rem]">
            <ImageIcon className="w-16 h-16 opacity-20" />
            <div className="text-center">
              <p className="font-black uppercase tracking-[0.2em] text-sm">O seu arquivo está vazio</p>
              <p className="text-xs mt-1">Carregue a sua primeira imagem para começar hihi!</p>
            </div>
          </div>
        ) : (
          <div className="masonry-grid animate-fade-in">
            {filteredImages.map((img) => (
              <div 
                key={img.id}
                onClick={() => setSelectedImage(img)}
                className="masonry-item group relative bg-zinc-900 rounded-2xl overflow-hidden cursor-zoom-in border border-zinc-800 hover:border-brand-500/50 transition-all shadow-xl"
              >
                <img src={img.url} alt={img.title} className="w-full h-auto block group-hover:scale-105 transition-transform duration-700" />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-5">
                  <h3 className="text-white font-bold text-lg mb-1">{img.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    {img.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[9px] font-black uppercase tracking-widest bg-brand-500 text-white px-2 py-0.5 rounded-full">#{tag}</span>
                    ))}
                  </div>
                  <button 
                    onClick={(e) => handleDelete(img.id, e)}
                    className="absolute top-4 right-4 bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/95 backdrop-blur-xl animate-fade-in" onClick={() => setSelectedImage(null)}>
          <div className="w-full max-w-6xl max-h-[90vh] bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden flex flex-col lg:flex-row shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex-1 bg-black flex items-center justify-center p-4">
              <img src={selectedImage.url} alt={selectedImage.title} className="max-w-full max-h-full object-contain rounded-xl" />
            </div>
            
            <div className="w-full lg:w-[400px] p-8 flex flex-col gap-6 overflow-y-auto">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-brand-500 uppercase tracking-[0.3em]">{selectedImage.category}</span>
                <button onClick={() => setSelectedImage(null)} className="p-2 hover:bg-zinc-800 rounded-full transition-colors"><X className="w-6 h-6" /></button>
              </div>

              <div>
                <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-4">{selectedImage.title}</h2>
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedImage.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1.5 text-[10px] font-bold bg-zinc-800 text-zinc-400 px-3 py-1.5 rounded-full border border-zinc-700">
                      <TagIcon className="w-3 h-3" /> {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-zinc-950/50 p-6 rounded-3xl border border-zinc-800">
                <div className="flex items-center gap-2 mb-3 text-zinc-500">
                  <Info className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Descrição da Memória</span>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed italic">
                  "{selectedImage.description}"
                </p>
              </div>

              <div className="mt-auto pt-6 border-t border-zinc-800 flex items-center justify-between text-zinc-600">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{selectedImage.date}</span>
                </div>
                <button 
                  onClick={(e) => handleDelete(selectedImage.id, e as any)}
                  className="flex items-center gap-2 text-red-500/50 hover:text-red-500 transition-colors text-[10px] font-black uppercase tracking-widest"
                >
                  <Trash2 className="w-3 h-3" /> Remover
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-zinc-950 px-6 py-8 border-t border-zinc-900 text-center">
        <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em]">
          Visionary Archive © {new Date().getFullYear()} • Organizado pela Chloe hihi!
        </p>
      </footer>
    </div>
  );
};

export default App;
