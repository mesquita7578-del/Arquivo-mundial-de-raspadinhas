
import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Globe, Plus, Trash2, ExternalLink, Building2, Link, Tag, 
  DownloadCloud, Check, RefreshCw, Search, Filter, Map, 
  ChevronRight, Landmark, ShieldCheck, Globe2
} from 'lucide-react';
import { WebsiteLink, Continent } from '../types';
import { storageService } from '../services/storage';
import { OFFICIAL_LOTTERIES } from '../constants';

interface WebsitesModalProps {
  onClose: () => void;
  isAdmin: boolean;
  t: any;
}

export const WebsitesModal: React.FC<WebsitesModalProps> = ({ onClose, isAdmin, t }) => {
  const [sites, setSites] = useState<(WebsiteLink & { continent?: string })[]>([]);
  const [newSite, setNewSite] = useState<Partial<WebsiteLink & { continent?: string }>>({ continent: 'Europa' });
  const [isAdding, setIsAdding] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeContinentFilter, setActiveContinentFilter] = useState<string | 'all'>('all');

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      const data = await storageService.getWebsites();
      
      // Auto-merge continents from OFFICIAL_LOTTERIES if missing in DB
      const enrichedData = data.map(s => {
        const official = OFFICIAL_LOTTERIES.find(o => o.url === s.url);
        // Fix: Use the added continent property correctly
        return { ...s, continent: s.continent || official?.continent || 'Mundo' };
      });

      setSites(enrichedData.sort((a, b) => (a.continent || '').localeCompare(b.continent || '') || a.country.localeCompare(b.country)));
    } catch (error) {
      console.error("Erro ao carregar sites:", error);
    }
  };

  const handleAddSite = async () => {
    if (!newSite.name || !newSite.url || !newSite.country) return;

    let finalUrl = newSite.url;
    if (!finalUrl.startsWith('http')) finalUrl = 'https://' + finalUrl;

    const site: WebsiteLink & { continent?: string } = {
      id: Math.random().toString(36).substr(2, 9),
      name: newSite.name,
      url: finalUrl,
      logoUrl: newSite.logoUrl,
      country: newSite.country,
      category: newSite.category,
      continent: newSite.continent
    };

    try {
      await storageService.saveWebsite(site);
      loadSites();
      setNewSite({ continent: 'Europa' });
      setIsAdding(false);
    } catch (error) {
      alert("Erro ao salvar site.");
    }
  };

  const handleImportOfficial = async () => {
    setIsImporting(true);
    try {
      const currentSites = await storageService.getWebsites();
      let count = 0;

      for (const el of OFFICIAL_LOTTERIES) {
        if (!el.name || !el.url) continue;
        const exists = currentSites.some(s => s.url === el.url);
        
        if (!exists) {
          const site: WebsiteLink & { continent?: string } = {
            id: Math.random().toString(36).substr(2, 9),
            name: el.name,
            url: el.url,
            country: el.country || "Mundo",
            category: el.category || "Official",
            continent: el.continent || "Mundo"
          };
          await storageService.saveWebsite(site);
          count++;
        }
      }
      
      await loadSites();
      alert(`${count} novos sites oficiais sincronizados!`);
    } catch (e) {
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

  const filteredSites = useMemo(() => {
    return sites.filter(site => {
      const matchesSearch = site.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            site.country.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesContinent = activeContinentFilter === 'all' || site.continent === activeContinentFilter;
      return matchesSearch && matchesContinent;
    });
  }, [sites, searchTerm, activeContinentFilter]);

  const groupedSites = useMemo(() => {
    const groups: Record<string, typeof sites> = {};
    filteredSites.forEach(s => {
      const cont = s.continent || 'Outros';
      if (!groups[cont]) groups[cont] = [];
      groups[cont].push(s);
    });
    return groups;
  }, [filteredSites]);

  const getFavicon = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    } catch { return null; }
  };

  const continents = ['Mundo', 'Europa', 'América', 'Ásia', 'África', 'Oceania'];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-6xl h-[90vh] rounded-3xl shadow-2xl relative overflow-hidden flex flex-col">
        
        {/* Header Profissional */}
        <div className="p-6 md:p-8 border-b border-slate-800 bg-slate-900/50 flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-brand-600 p-3 rounded-2xl shadow-lg shadow-brand-900/20">
              <Globe2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">Diretório Mundial</h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Sites Oficiais & Organizações de Lotaria</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {isAdmin && (
              <button 
                onClick={handleImportOfficial} 
                disabled={isImporting}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl border border-slate-700 transition-all text-xs font-black uppercase"
              >
                {isImporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <DownloadCloud className="w-4 h-4" />}
                Sincronizar Oficial
              </button>
            )}
            <button onClick={onClose} className="text-slate-500 hover:text-white p-2 hover:bg-slate-800 rounded-full transition-colors">
              <X className="w-7 h-7" />
            </button>
          </div>
        </div>

        {/* Toolbar de Filtros e Busca */}
        <div className="px-6 md:px-8 py-4 bg-slate-950/50 border-b border-slate-800 flex flex-col lg:flex-row gap-4 shrink-0">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-brand-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Pesquisar por Nome, País ou Instituição..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:border-brand-500 outline-none shadow-inner transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            {continents.map(cont => (
              <button 
                key={cont}
                onClick={() => setActiveContinentFilter(cont === 'Mundo' ? 'all' : cont)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${activeContinentFilter === (cont === 'Mundo' ? 'all' : cont) ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'}`}
              >
                {cont}
              </button>
            ))}
            {isAdmin && (
              <button 
                onClick={() => setIsAdding(!isAdding)}
                className={`ml-2 p-2 rounded-xl border transition-all ${isAdding ? 'bg-brand-600 border-brand-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white'}`}
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Área de Conteúdo */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-slate-950/20">
          
          {/* Formulário de Adição Rápida */}
          {isAdding && isAdmin && (
            <div className="mb-10 bg-slate-900 border border-brand-500/20 rounded-3xl p-6 shadow-2xl animate-fade-in">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-brand-500" /> Adicionar Link Manualmente
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <input type="text" placeholder="Nome do Site" value={newSite.name || ''} onChange={e => setNewSite({...newSite, name: e.target.value})} className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-brand-500" />
                <input type="text" placeholder="País" value={newSite.country || ''} onChange={e => setNewSite({...newSite, country: e.target.value})} className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-brand-500" />
                <input type="text" placeholder="URL (ex: site.com)" value={newSite.url || ''} onChange={e => setNewSite({...newSite, url: e.target.value})} className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-brand-500" />
                <select value={newSite.continent} onChange={e => setNewSite({...newSite, continent: e.target.value})} className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white outline-none">
                  {continents.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button onClick={handleAddSite} className="bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-black text-xs uppercase transition-all shadow-lg active:scale-95">Salvar No Diretório</button>
              </div>
            </div>
          )}

          {/* Listagem Agrupada */}
          {Object.keys(groupedSites).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-600 italic">
              <Globe className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-bold uppercase tracking-widest text-sm">Nenhum site encontrado para esta seleção.</p>
            </div>
          ) : (
            <div className="space-y-12 pb-20">
              {/* Fix: Explicitly cast Object.entries results to maintain type safety for items */}
              {(Object.entries(groupedSites) as [string, (WebsiteLink & { continent?: string })[]][]).sort().map(([continent, items]) => (
                <section key={continent} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h3 className="text-sm font-black text-brand-500 uppercase tracking-[0.3em] flex items-center gap-3">
                      <Map className="w-4 h-4" /> {continent}
                    </h3>
                    <div className="h-px flex-1 bg-gradient-to-r from-slate-800 to-transparent"></div>
                    {/* Fix: items now correctly inferred with length property */}
                    <span className="text-[10px] font-black text-slate-600 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">{items.length} sites</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Fix: items now correctly inferred as array with map method */}
                    {items.map(site => (
                      <div key={site.id} className="group bg-slate-900/40 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-4 transition-all flex items-center gap-4 relative overflow-hidden shadow-sm hover:shadow-blue-900/10">
                        <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                           <Landmark className="w-12 h-12 text-white" />
                        </div>
                        
                        <div className="w-12 h-12 bg-white rounded-xl p-2 shrink-0 border border-slate-700 shadow-lg group-hover:scale-110 transition-transform">
                          <img 
                            src={getFavicon(site.url) || ''} 
                            alt={site.name} 
                            className="w-full h-full object-contain"
                            onError={e => (e.target as HTMLImageElement).src = 'https://placehold.co/100/1f2937/white?text=' + site.name[0]} 
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[9px] font-black text-blue-500 uppercase tracking-tighter">{site.country}</span>
                            {site.category === 'Global Organization' && <ShieldCheck className="w-3 h-3 text-yellow-500" title="Organização Internacional" />}
                          </div>
                          <h4 className="text-sm font-bold text-slate-200 truncate group-hover:text-white leading-tight" title={site.name}>{site.name}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <a href={site.url} target="_blank" rel="noreferrer" className="text-[10px] text-slate-500 font-bold hover:text-blue-400 flex items-center gap-1 transition-colors">
                              Aceder <ExternalLink className="w-3 h-3" />
                            </a>
                            {isAdmin && (
                              <button onClick={() => handleDeleteSite(site.id)} className="text-slate-700 hover:text-red-500 transition-colors">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <div className="opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                           <ChevronRight className="w-4 h-4 text-blue-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>

        {/* Rodapé Interno */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 text-center shrink-0">
           <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest flex items-center justify-center gap-2">
             <Info className="w-3 h-3" /> Todos os links abrem em novas janelas oficiais.
           </p>
        </div>
      </div>
    </div>
  );
};

const Info = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
);