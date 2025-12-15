import React, { useState, useEffect } from 'react';
import { X, Globe, Plus, Trash2, ExternalLink, Building2 } from 'lucide-react';
import { WebsiteLink } from '../types';
import { storageService } from '../services/storage';

interface WebsitesModalProps {
  onClose: () => void;
  isAdmin: boolean;
  t: any;
}

export const WebsitesModal: React.FC<WebsitesModalProps> = ({ onClose, isAdmin, t }) => {
  const [sites, setSites] = useState<WebsiteLink[]>([]);
  const [newSite, setNewSite] = useState<Partial<WebsiteLink>>({});
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      const data = await storageService.getWebsites();
      // Sort alphabetically by Country then Name
      data.sort((a, b) => a.country.localeCompare(b.country) || a.name.localeCompare(b.name));
      setSites(data);
    } catch (error) {
      console.error("Erro ao carregar sites:", error);
    }
  };

  const handleAddSite = async () => {
    if (!newSite.name || !newSite.url || !newSite.country) return;

    // Ensure URL has protocol
    let finalUrl = newSite.url;
    if (!finalUrl.startsWith('http')) {
      finalUrl = 'https://' + finalUrl;
    }

    const site: WebsiteLink = {
      id: Math.random().toString(36).substr(2, 9),
      name: newSite.name,
      url: finalUrl,
      country: newSite.country
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

  const handleDeleteSite = async (id: string) => {
    if (confirm("Apagar este link?")) {
      await storageService.deleteWebsite(id);
      setSites(prev => prev.filter(s => s.id !== id));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="bg-gray-900 border border-gray-800 w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl relative overflow-hidden flex flex-col">
        
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
          
          {/* Admin Add Form */}
          {isAdmin && (
            <div className="mb-8 bg-gray-900 border border-dashed border-gray-700 rounded-xl p-4">
               {!isAdding ? (
                 <button 
                   onClick={() => setIsAdding(true)}
                   className="w-full py-4 flex flex-col items-center justify-center text-gray-500 hover:text-white transition-colors gap-2"
                 >
                   <Plus className="w-8 h-8" />
                   <span className="font-bold">{t.add}</span>
                 </button>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                   <div>
                     <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Nome</label>
                     <input 
                       className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:border-brand-500 outline-none"
                       placeholder={t.namePlaceholder}
                       value={newSite.name || ''}
                       onChange={e => setNewSite({...newSite, name: e.target.value})}
                     />
                   </div>
                   <div>
                     <label className="block text-xs uppercase text-gray-500 font-bold mb-1">URL</label>
                     <input 
                       className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:border-brand-500 outline-none"
                       placeholder={t.urlPlaceholder}
                       value={newSite.url || ''}
                       onChange={e => setNewSite({...newSite, url: e.target.value})}
                     />
                   </div>
                   <div>
                     <label className="block text-xs uppercase text-gray-500 font-bold mb-1">País</label>
                     <input 
                       className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:border-brand-500 outline-none"
                       placeholder={t.countryPlaceholder}
                       value={newSite.country || ''}
                       onChange={e => setNewSite({...newSite, country: e.target.value})}
                     />
                   </div>
                   <div className="flex gap-2">
                     <button onClick={handleAddSite} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-bold flex-1">{t.save}</button>
                     <button onClick={() => setIsAdding(false)} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded font-bold">X</button>
                   </div>
                 </div>
               )}
            </div>
          )}

          {/* List */}
          {sites.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
               <Globe className="w-16 h-16 mx-auto mb-4 opacity-20" />
               <p>{t.noSites}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sites.map(site => (
                <div key={site.id} className="bg-gray-900 border border-gray-800 hover:border-blue-500/50 rounded-xl p-5 transition-all group relative">
                   <div className="flex justify-between items-start mb-2">
                     <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{site.country}</span>
                     {isAdmin && (
                       <button onClick={() => handleDeleteSite(site.id)} className="text-gray-600 hover:text-red-500 transition-colors">
                         <Trash2 className="w-4 h-4" />
                       </button>
                     )}
                   </div>
                   <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                     {site.name}
                   </h3>
                   <a 
                     href={site.url} 
                     target="_blank" 
                     rel="noreferrer"
                     className="flex items-center justify-center gap-2 w-full bg-gray-800 hover:bg-blue-600 text-gray-300 hover:text-white py-2 rounded-lg font-medium transition-all"
                   >
                     <ExternalLink className="w-4 h-4" /> {t.visit}
                   </a>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};