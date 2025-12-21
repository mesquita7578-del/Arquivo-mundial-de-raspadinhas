
import React, { useMemo, useState } from 'react';
import { ScratchcardData, Continent } from '../types';
import { 
  Globe, LayoutGrid, Search, MapPin, 
  ChevronRight, Zap, Trophy, Database, TrendingUp, Star, Award
} from 'lucide-react';

interface WorldMapProps {
  images: ScratchcardData[];
  onCountrySelect: (country: string) => void;
  activeContinent: Continent | 'Mundo';
  t: any;
}

export const WorldMap: React.FC<WorldMapProps> = ({ images, onCountrySelect, activeContinent }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  const stats = useMemo(() => {
    const countries: Record<string, { count: number; continent: Continent; percentage: number }> = {};
    const continentTotals: Record<string, number> = {
      'Europa': 0, 'América': 0, 'Ásia': 0, 'África': 0, 'Oceania': 0
    };

    images.forEach(img => {
      const name = img.country;
      if (!countries[name]) {
        countries[name] = { count: 0, continent: img.continent as Continent, percentage: 0 };
      }
      countries[name].count++;
      if (continentTotals[img.continent] !== undefined) {
        continentTotals[img.continent]++;
      }
    });

    const total = images.length || 1;
    Object.keys(countries).forEach(name => {
      countries[name].percentage = (countries[name].count / total) * 100;
    });

    return { countries, continentTotals, total };
  }, [images]);

  // Fixed: Cast Object.entries to explicit type to avoid 'unknown' properties in sort
  const topCountries = useMemo(() => {
    return (Object.entries(stats.countries) as [string, { count: number; continent: Continent; percentage: number }][])
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5);
  }, [stats.countries]);

  const filteredCountries = useMemo(() => {
    return (Object.entries(stats.countries) as [string, { count: number; continent: Continent; percentage: number }][])
      .filter(([name, data]) => {
        const matchesContinent = activeContinent === 'Mundo' || data.continent === activeContinent;
        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesContinent && matchesSearch;
      })
      .sort((a, b) => b[1].count - a[1].count);
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
    <div className="flex flex-col h-full w-full gap-8 animate-fade-in pb-10">
      
      {/* Header do Mapa */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Mapa Mundi <span className="text-brand-500">Interativo</span></h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Centro de Comando do Arquivo • {stats.total} Exemplares Localizados</p>
        </div>
        
        <div className="relative group w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Pesquisar país ou continente..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:border-brand-500/50 outline-none transition-all shadow-inner placeholder:text-slate-700"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Lado Esquerdo: Resumo & Ranking */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 space-y-8 shadow-2xl backdrop-blur-md">
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-3 mb-6">
                <TrendingUp className="w-4 h-4 text-emerald-500" /> Países com Mais Itens
              </h3>
              <div className="space-y-4">
                {topCountries.map(([name, data], idx) => (
                  <button 
                    key={name}
                    onClick={() => onCountrySelect(name)}
                    onMouseEnter={() => setHoveredCountry(name)}
                    onMouseLeave={() => setHoveredCountry(null)}
                    className="w-full group flex items-center gap-4 p-3 bg-slate-950/50 border border-slate-800 hover:border-brand-500/50 rounded-2xl transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 group-hover:text-white transition-colors">
                      {idx + 1}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-[11px] font-black text-white uppercase group-hover:text-brand-400 transition-colors">{name}</p>
                      <div className="w-full h-1 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${continentColors[data.continent]} transition-all duration-1000`} style={{ width: `${(data.count / topCountries[0][1].count) * 100}%` }}></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-black text-brand-500">{data.count}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800">
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-center">
                     <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest block mb-1">Continentes</span>
                     <span className="text-xl font-black text-white">5</span>
                  </div>
                  <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-center">
                     <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest block mb-1">Nações Ativas</span>
                     <span className="text-xl font-black text-white">{Object.keys(stats.countries).length}</span>
                  </div>
               </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-brand-600/10 to-slate-900 border border-brand-500/20 rounded-[2rem] p-6 shadow-xl group overflow-hidden">
             <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 bg-brand-600 rounded-2xl shadow-lg">
                   <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                   <h4 className="text-xs font-black text-white uppercase tracking-widest">Sinal da Chloe</h4>
                   <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Os países marcados com luz neon são os mais raros hihi!</p>
                </div>
             </div>
             <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:opacity-10 transition-opacity">
                <Globe className="w-32 h-32 text-white" />
             </div>
          </div>
        </div>

        {/* Lado Direito: Grid Geográfico Interativo */}
        <div className="lg:col-span-8 space-y-6">
           {/* Visual Map (Simulado por uma grelha mais fluida e colorida) */}
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredCountries.length === 0 ? (
                <div className="col-span-full py-20 text-center text-slate-700 bg-slate-950/20 border border-dashed border-slate-800 rounded-3xl">
                   <MapPin className="w-12 h-12 mx-auto mb-4 opacity-10" />
                   <p className="text-xs font-black uppercase tracking-widest">Nenhuma nação encontrada neste setor hihi!</p>
                </div>
              ) : (
                filteredCountries.map(([name, data]) => (
                  <button
                    key={name}
                    onClick={() => onCountrySelect(name)}
                    onMouseEnter={() => setHoveredCountry(name)}
                    onMouseLeave={() => setHoveredCountry(null)}
                    className={`group relative h-40 bg-slate-900/50 border-2 rounded-[2.5rem] p-6 transition-all flex flex-col justify-between overflow-hidden shadow-lg active:scale-95 text-left ${hoveredCountry === name ? 'border-brand-500 -translate-y-1' : 'border-slate-800'}`}
                  >
                    {/* Background Continent Indicator */}
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${continentColors[data.continent]} opacity-0 group-hover:opacity-10 rounded-full -mr-16 -mt-16 transition-opacity blur-3xl`}></div>
                    
                    <div className="flex justify-between items-start relative z-10">
                       <div className={`p-2 rounded-xl border transition-all ${hoveredCountry === name ? 'bg-brand-600 border-brand-400 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                          <MapPin className="w-4 h-4" />
                       </div>
                       <div className="flex flex-col items-end">
                          <span className={`text-[9px] font-black uppercase tracking-widest italic group-hover:text-white transition-colors ${hoveredCountry === name ? 'text-white' : 'text-slate-600'}`}>
                            {data.continent}
                          </span>
                       </div>
                    </div>

                    <div className="relative z-10">
                       <h4 className="text-lg font-black text-white uppercase italic tracking-tighter leading-none group-hover:text-brand-400 transition-colors mb-2">{name}</h4>
                       <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-brand-500">{data.count} <span className="text-[8px] uppercase tracking-widest text-slate-600">Registos</span></span>
                          <div className="h-3 w-[1px] bg-slate-800"></div>
                          <span className="text-[10px] font-black text-slate-500 group-hover:text-slate-300 transition-colors">{data.percentage.toFixed(1)}% do Arquivo</span>
                       </div>
                    </div>

                    {/* Heat Intensity Indicator */}
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-800">
                      <div className={`h-full bg-gradient-to-r ${continentColors[data.continent]} transition-all duration-1000`} style={{ width: `${(data.count / stats.total) * 100 * 5}%` }}></div>
                    </div>
                  </button>
                ))
              )}
           </div>
        </div>
      </div>
      
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] text-center shrink-0">
        <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em] italic">
           Exploração Geográfica Visionária • Ativo via GPS Digital hihi! 🐉
        </p>
      </div>
    </div>
  );
};
