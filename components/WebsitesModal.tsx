
import React, { useState, useEffect } from 'react';
import { X, Globe, Plus, Trash2, ExternalLink, Building2, Link, Tag, DownloadCloud, Check, RefreshCw, Search } from 'lucide-react';
import { WebsiteLink } from '../types';
import { storageService } from '../services/storage';
import { OFFICIAL_LOTTERIES } from '../constants';

interface WebsitesModalProps {
  onClose: () => void;
  isAdmin: boolean;
  t: any;
}

export const WebsitesModal: React.FC<WebsitesModalProps> = ({ onClose, isAdmin, t }) => {
  const [sites, setSites] = useState<WebsiteLink[]>([]);
  const [newSite, setNewSite] = useState<Partial<WebsiteLink>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      const data = await storageService.getWebsites();
      
      // AUTO-FIX: Check if MUSL or ALEA is missing and inject it silently if needed
      const prioritySites = OFFICIAL_LOTTERIES.filter(s => s.name?.includes("MUSL") || s.name?.includes("ALEA"));
      
      for (const pSite of prioritySites) {
         const exists = data.some(s => s.url === pSite.url || (pSite.name && s.name.includes(pSite.name)));
         if (!exists && pSite.name && pSite.url && pSite.country) {
            const autoSite: WebsiteLink = {
               id: Math.random().toString(36).substr(2, 9),
               name: pSite.name,
               url: pSite.url,
               country: pSite.country,
               category: pSite.category || "Association"
            };
            await storageService.saveWebsite(autoSite);
            data.push(autoSite);
         }
      }

      // Sort alphabetically by Country then Name
      data.sort((a, b) => a.country.localeCompare(b.country) || a.name.localeCompare(b.name));
      setSites(data);
    } catch (error) {
      console.error("Erro ao carregar sites:", error);
    }
  };

  const handleAddSite = async () => {
    if (!newSite.name || !newSite.url || !newSite.country) return;

    let finalUrl = newSite.url;
    if (!finalUrl.startsWith('http')) {
      finalUrl = 'https://' + finalUrl;
    }

    const site: WebsiteLink = {
      id: Math.random().toString(36).substr(2, 9),
      name: newSite.name,
      url: finalUrl,
      logoUrl: newSite.logoUrl,
      country: newSite.country,
      category: newSite.category
    };

    try {
      await storageService.saveWebsite(site);
      setSites(prev => [...prev, site].sort((a, b) => a.country.localeCompare(b.country)));
      setNewSite({});
      setIsAdding(false);
    } catch (error) {
      alert("Erro ao salvar site.");
    }
  };

  const handleImportOfficial = async () => {
     setIsImporting(true);
     try {
        let addedCount = 0;
        let updatedCount = 0;

        const currentSites = await storageService.getWebsites();

        for (const el of OFFICIAL_LOTTERIES) {
           if (!el.name || !el.url) continue;

           const existingIndex = currentSites.findIndex(s => 
              s.url === el.url || 
              s.name.toLowerCase() === el.name?.toLowerCase()
           );

           if (existingIndex >= 0) {
              const existing = currentSites[existingIndex];
              const updated: WebsiteLink = {
                 ...existing,
                 name: el.name,
                 url: el.url,
                 country: el.country || existing.country,
                 category: el.category || existing.category
              };
              await storageService.saveWebsite(updated);
              updatedCount++;
           } else {
              const site: WebsiteLink = {
                 id: Math.random().toString(36).substr(2, 9),
                 name: el.name,
                 url: el.url,
                 country: el.country || "Mundo",
                 category: el.category || "Official"
              };
              await storageService.saveWebsite(site);
              addedCount++;
           }
        }
        
        await loadSites();
        alert(`Sincronização concluída!\n${addedCount} novos sites adicionados.\n${updatedCount} sites atualizados/corrigidos.`);

     } catch (e) {
        console.error(e);
        alert("Erro ao importar.");
     } finally {
        setIsImporting(false);
     }
  };

  const handleDeleteSite = async (id: string) => {
    if (confirm("Apagar este link?")) {
      await storageService.deleteWebsite(id);
      setSites(prev => prev.filter(s => s.id !== id));
    }
  };

  const getLogo = (site: Partial<WebsiteLink>) => {
    if (site.logoUrl && site.logoUrl.trim() !== '') return site.logoUrl;
    if (site.url) {
      try {
        const domain = new URL(site.url.startsWith('http') ? site.url : `https://${site.url}`).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const filteredSites = sites.filter(site => {
     const term = searchTerm.toLowerCase();
     return site.name.toLowerCase().includes(term) || 
            site.country.toLowerCase().includes(term) ||
            (site.category && site.category.toLowerCase().includes(term));
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="bg-gray-900 border border-gray-800 w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl relative overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900/95 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-900/30 p-2 rounded-lg border border-blue-800/50">
               <Building2 className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">{t.title}</h2>
              <p className="text-gray-400 text-sm">{t.subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-950">
          
          {/* Actions & Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
             {isAdmin && (
                <button 
                  onClick={handleImportOfficial}
                  disabled={isImporting}
                  className="py-3 px-6 bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 rounded-xl flex items-center justify-center gap-2 text-blue-100 hover:text-white hover:from-blue-900/60 hover:to-indigo-900/60 transition-all shadow-lg group whitespace-nowrap"
                >
                  {isImporting ? <DownloadCloud className="w-4 h-4 animate-bounce" /> : <RefreshCw className="w-4 h-4 text-blue-400 group-hover:rotate-180 transition-transform" />}
                  <span className="font-bold text-sm">{isImporting ? "Sincronizando..." : "Sincronizar Lista Oficial"}</span>
                </button>
             )}
             
             <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-500 transition-colors" />
                <input 
                  type="text"
                  placeholder="Pesquisar site (ex: Argentina, MUSL, Santa Casa)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-white pl-10 pr-4 py-3 rounded-xl focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/20 transition-all shadow-inner"
                />
             </div>

             {isAdmin && (
               <button 
                  onClick={() => setIsAdding(!isAdding)}
                  className={`p-3 rounded-xl border transition-all ${isAdding ? 'bg-gray-800 border-gray-600 text-white' : 'bg-gray-900 border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'}`}
                  title="Adicionar Manualmente"
               >
                  <Plus className={`w-5 h-5 transition-transform ${isAdding ? 'rotate-45' : ''}`} />
               </button>
             )}
          </div>

          {/* Manual Add Form */}
          {isAdding && isAdmin && (
            <div className="mb-8 bg-gray-900 border border-dashed border-gray-700 rounded-xl p-6 shadow-lg animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-white flex items-center gap-2 text-sm uppercase tracking-wider"><Plus className="w-4 h-4 text-green-500"/> {t.add}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                  <div>
                    <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1">Nome</label>
                    <input 
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-brand-500 outline-none text-sm"
                      placeholder={t.namePlaceholder}
                      value={newSite.name || ''}
                      onChange={e => setNewSite({...newSite, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1">País</label>
                    <input 
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-brand-500 outline-none text-sm"
                      placeholder={t.countryPlaceholder}
                      value={newSite.country || ''}
                      onChange={e => setNewSite({...newSite, country: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1">URL Oficial</label>
                    <input 
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-brand-500 outline-none text-sm"
                      placeholder={t.urlPlaceholder}
                      value={newSite.url || ''}
                      onChange={e => setNewSite({...newSite, url: e.target.value})}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                      <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1">Categoria (Opcional)</label>
                      <input 
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-brand-500 outline-none text-sm"
                        placeholder={t.categoryPlaceholder}
                        value={newSite.category || ''}
                        onChange={e => setNewSite({...newSite, category: e.target.value})}
                      />
                  </div>

                  <div className="md:col-span-2">
                      <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1">Logo URL (Opcional)</label>
                      <input 
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-brand-500 outline-none text-xs"
                        placeholder="Ex: https://site.com/logo.png"
                        value={newSite.logoUrl || ''}
                        onChange={e => setNewSite({...newSite, logoUrl: e.target.value})}
                      />
                  </div>
                  
                  <div className="md:col-span-4 flex justify-end mt-2">
                    <button onClick={handleAddSite} className="bg-green-600 hover:bg-green-500 text-white px-8 py-2 rounded-lg font-bold shadow-lg">
                      {t.save}
                    </button>
                  </div>
                </div>
            </div>
          )}

          {/* List */}
          {filteredSites.length === 0 ? (
            <div className="text-center py-20 text-gray-500 bg-gray-900/30 rounded-2xl border border-gray-800 border-dashed">
               <Globe className="w-12 h-12 mx-auto mb-3 opacity-20" />
               <p>{searchTerm ? "Nenhum site encontrado com esse nome." : t.noSites}</p>
               {searchTerm && <button onClick={() => setSearchTerm('')} className="text-blue-400 text-sm hover:underline mt-2">Limpar pesquisa</button>}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSites.map(site => (
                <div key={site.id} className="bg-gray-900 border border-gray-800 hover:border-blue-500/50 rounded-2xl p-0 transition-all group relative overflow-hidden flex flex-col h-full shadow-lg hover:shadow-blue-900/10">
                   
                   <div className="p-5 flex items-start gap-4 flex-1">
                      <div className="w-14 h-14 shrink-0 bg-white rounded-xl p-1.5 flex items-center justify-center border border-gray-700 shadow-md group-hover:scale-105 transition-transform">
                         <img 
                           src={getLogo(site) || ''} 
                           alt={site.name} 
                           className="w-full h-full object-contain"
                           onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/1f2937/white?text=' + site.name.substring(0,2).toUpperCase();
                           }} 
                         />
                      </div>

                      <div className="flex-1 min-w-0">
                         <div className="flex flex-wrap gap-2 mb-1">
                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider bg-blue-900/20 px-2 py-0.5 rounded inline-block">
                              {site.country}
                            </span>
                            {site.category && (
                              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider bg-purple-900/20 px-2 py-0.5 rounded inline-block flex items-center gap-1">
                                <Tag className="w-3 h-3" />
                                {site.category}
                              </span>
                            )}
                         </div>
                         <h3 className="text-lg font-bold text-white truncate leading-tight" title={site.name}>
                           {site.name}
                         </h3>
                         <a href={site.url} target="_blank" rel="noreferrer" className="text-xs text-gray-500 truncate hover:text-blue-300 transition-colors flex items-center gap-1 mt-1">
                            <Link className="w-3 h-3" /> {new URL(site.url).hostname}
                         </a>
                      </div>
                   </div>

                   <div className="bg-gray-800/50 p-3 flex justify-between items-center border-t border-gray-800">
                      <a 
                        href={site.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs font-bold text-white flex items-center gap-2 hover:underline pl-2"
                      >
                        {t.visit} <ExternalLink className="w-3 h-3" />
                      </a>
                      
                      {isAdmin && (
                        <button 
                          onClick={() => handleDeleteSite(site.id)} 
                          className="text-gray-600 hover:text-red-500 hover:bg-red-900/20 p-1.5 rounded-lg transition-colors"
                          title={t.delete}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                   </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
