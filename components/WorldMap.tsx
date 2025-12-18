
import React, { useMemo, useState } from 'react';
import { ScratchcardData, Continent } from '../types';
import { 
  Globe, LayoutGrid, Search, MapPin, 
  ChevronRight, Zap, Trophy, Database
} from 'lucide-react';

interface WorldMapProps {
  images: ScratchcardData[];
  onCountrySelect: (country: string) => void;
  activeContinent: Continent | 'Mundo';
  t: any;
}

const COUNTRY_MAP: Record<string, string> = {
  "Portugal": "Portugal",
  "Itália": "Italy",
  "Espanha": "Spain",
  "Alemanha": "Germany",
  "França": "France",
  "Brasil": "Brazil",
  "EUA": "USA",
  "Reino Unido": "UK"
};

export const WorldMap: React.FC<WorldMapProps> = ({ images, onCountrySelect, activeContinent }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const stats = useMemo(() => {
    const countries: Record<string, { count: number; continent: Continent }> = {};
    const continentTotals: Record<string, number> = {
      'Europa': 0, 'América': 0, 'Ásia': 0, 'África': 0, 'Oceania': 0
    };

    images.forEach(img => {
      const name = img.country;
      if (!countries[name]) {
        countries[name] = { count: 0, continent: img.continent };
      }
      countries[name].count++;
      if (continentTotals[img.continent] !== undefined) {
        continentTotals[img.continent]++;
      }
    });

    return { countries, continentTotals };
  }, [images]);

  const filteredCountries = useMemo(() => {
    // Explicitly cast Object.entries to resolve 'unknown' type inference on data object
    return (Object.entries(stats.countries) as [string, { count: number; continent: Continent }][])
      .filter(([name, data]) => {
        const matchesContinent = activeContinent === 'Mundo' || data.continent === activeContinent;
        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesContinent && matchesSearch;
      })
      .sort((a, b) => a[0].localeCompare(b[0]));
  }, [stats, activeContinent, searchTerm]);

  const continentColors: Record<string, string> = {
    'Europa': 'from-blue-600 to-cyan-500',
    'América': 'from-red-600 to-pink-500',
    'Ásia': 'from-yellow-600 to-orange-500',
    'África': 'from-emerald-600 to-green-500',
    'Oceania': 'from-purple-600 to-indigo-500',
    'Mundo': 'from-slate-700 to-slate-800'
  };

  return (
    <div className="flex flex-col h-full w-full gap-8 animate-fade-in">
      
      {/* Search Bar Neon */}
      <div className="relative group max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
        <input 
          type="text" 
          placeholder="Pesquisar país no arquivo..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900/50 border-2 border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:border-cyan-500/50 outline-none transition-all shadow-inner placeholder:text-slate-600"
        />
      </div>

      {/* Grid de Continentes (Resumo) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {['Europa', 'América', 'Ásia', 'África', 'Oceania'].map((cont) => (
          <div 
            key={cont}
            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${activeContinent === cont ? 'bg-slate-900 border-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.2)]' : 'bg-slate-950 border-slate-900 opacity-60'}`}
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{cont}</span>
            <span className={`text-xl font-black italic bg-clip-text text-transparent bg-gradient-to-r ${continentColors[cont]}`}>
              {stats.continentTotals[cont]} <span className="text-[10px] not-italic">ITENS</span>
            </span>
          </div>
        ))}
      </div>

      {/* Lista de Países Estilizada */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        {filteredCountries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-700 border-2 border-dashed border-slate-900 rounded-[3rem]">
            <Globe className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-black uppercase tracking-[0.3em] text-xs text-center px-6">Nenhum país encontrado neste setor.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredCountries.map(([name, data]) => (
              <button
                key={name}
                onClick={() => onCountrySelect(name)}
                className="group relative bg-slate-900/40 border border-slate-800 hover:border-cyan-500/50 p-5 rounded-[2rem] transition-all flex flex-col gap-3 overflow-hidden active:scale-95 text-left"
              >
                {/* Glow Effect */}
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${continentColors[data.continent]} opacity-0 group-hover:opacity-10 rounded-full -mr-12 -mt-12 transition-opacity blur-2xl`}></div>
                
                <div className="flex justify-between items-start">
                   <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 group-hover:border-cyan-500/30 transition-colors">
                      <MapPin className="w-4 h-4 text-cyan-400" />
                   </div>
                   <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{data.continent}</span>
                      <span className="text-[8px] font-black text-slate-700 uppercase tracking-[0.2em] mt-0.5">Setor Ativo</span>
                   </div>
                </div>

                <div className="mt-2">
                   <h4 className="text-white font-black text-lg uppercase tracking-tighter leading-none group-hover:text-cyan-400 transition-colors">{name}</h4>
                   <div className="flex items-center gap-2 mt-2">
                      <Database className="w-3 h-3 text-slate-600" />
                      <span className="text-xs font-bold text-slate-400">{data.count} Registos</span>
                   </div>
                </div>

                <div className="absolute bottom-4 right-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all">
                   <ChevronRight className="w-5 h-5 text-cyan-500" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Rodapé do Explorador */}
      <div className="bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shrink-0">
         <div className="flex items-center gap-4">
            <div className="bg-cyan-600 p-2 rounded-lg shadow-[0_0_15px_rgba(8,145,178,0.4)]">
               <Zap className="w-4 h-4 text-white" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-relaxed">
               Navegação Otimizada pela Chloe • {filteredCountries.length} Nações Catalogadas
            </p>
         </div>
         <div className="flex gap-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-950 border border-slate-800 rounded-full">
               <Trophy className="w-3 h-3 text-yellow-500" />
               <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Arquivo Premium</span>
            </div>
         </div>
      </div>
    </div>
  );
};
