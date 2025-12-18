
import React, { useMemo, useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { Tooltip } from 'react-tooltip';
import { scaleSqrt } from "d3-scale";
import { ScratchcardData, Continent } from '../types';
import { 
  ZoomIn, ZoomOut, RefreshCw, Loader2, 
  MapPin, AlertTriangle, Globe, Compass, 
  LayoutGrid, Search
} from 'lucide-react';

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface WorldMapProps {
  images: ScratchcardData[];
  onCountrySelect: (country: string) => void;
  activeContinent: Continent | 'Mundo';
  t: any;
}

const CONTINENT_VIEWS: Record<string, { center: [number, number]; zoom: number }> = {
  'Mundo': { center: [10, 20], zoom: 1 },
  'Europa': { center: [15, 52], zoom: 3 },
  'América': { center: [-80, 10], zoom: 1.5 },
  'Ásia': { center: [90, 30], zoom: 1.8 },
  'África': { center: [20, 0], zoom: 2 },
  'Oceania': { center: [140, -25], zoom: 2.5 },
};

const COUNTRY_MAP: Record<string, string> = {
  "Portugal": "Portugal",
  "Itália": "Italy",
  "Espanha": "Spain",
  "Alemanha": "Germany",
  "França": "France",
  "Brasil": "Brazil",
  "EUA": "United States of America",
  "USA": "United States of America",
  "Reino Unido": "United Kingdom",
  "UK": "United Kingdom",
  "Suíça": "Switzerland",
  "Áustria": "Austria",
  "Bélgica": "Belgium"
};

export const WorldMap: React.FC<WorldMapProps> = ({ images, onCountrySelect, activeContinent, t }) => {
  const [position, setPosition] = useState(CONTINENT_VIEWS[activeContinent] || CONTINENT_VIEWS['Mundo']);
  const [tooltipContent, setTooltipContent] = useState("");
  const [mapStatus, setMapStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  useEffect(() => {
    setPosition(CONTINENT_VIEWS[activeContinent] || CONTINENT_VIEWS['Mundo']);
  }, [activeContinent]);

  const countryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    images.forEach(img => {
      const name = COUNTRY_MAP[img.country] || img.country;
      counts[name] = (counts[name] || 0) + 1;
    });
    return counts;
  }, [images]);

  const activeCountriesList = useMemo(() => {
    // Added type assertion to [string, number][] to fix 'unknown' type errors during filter and sort
    return (Object.entries(countryCounts) as [string, number][])
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);
  }, [countryCounts]);

  const maxVal = useMemo(() => {
    const vals = Object.values(countryCounts) as number[];
    return vals.length > 0 ? Math.max(...vals) : 1;
  }, [countryCounts]);

  return (
    <div className="flex flex-col h-full w-full gap-6">
      {/* Container do Mapa com Cores Neon */}
      <div className="relative w-full h-[500px] md:h-[600px] bg-black rounded-[2rem] border-2 border-slate-800 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        
        {/* Camada Neon de Fundo */}
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-900/10 via-blue-900/5 to-purple-900/10 pointer-events-none"></div>

        {mapStatus === 'loading' && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md">
             <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
             <p className="text-cyan-400 font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">Radar Chloe Ativo...</p>
          </div>
        )}

        {mapStatus === 'error' && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-8 text-center">
             <AlertTriangle className="w-12 h-12 text-brand-500 mb-4" />
             <h3 className="text-white font-black uppercase text-sm mb-4">Erro Crítico no Mapa</h3>
             <p className="text-slate-500 text-[10px] uppercase mb-6">A Chloe não conseguiu desenhar o globo. Use a lista abaixo para navegar.</p>
          </div>
        )}

        {/* Controles HUD Neon */}
        <div className="absolute bottom-6 right-6 z-30 flex flex-col gap-2">
           <button onClick={() => setPosition(p => ({...p, zoom: p.zoom + 0.5}))} className="w-12 h-12 bg-slate-900/80 border border-cyan-500/50 text-cyan-400 rounded-xl flex items-center justify-center hover:bg-cyan-500 hover:text-black transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)]"><ZoomIn className="w-5 h-5" /></button>
           <button onClick={() => setPosition(p => ({...p, zoom: Math.max(1, p.zoom - 0.5)}))} className="w-12 h-12 bg-slate-900/80 border border-cyan-500/50 text-cyan-400 rounded-xl flex items-center justify-center hover:bg-cyan-500 hover:text-black transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)]"><ZoomOut className="w-5 h-5" /></button>
           <button onClick={() => setPosition(CONTINENT_VIEWS[activeContinent] || CONTINENT_VIEWS['Mundo'])} className="w-12 h-12 bg-brand-600/80 border border-brand-400/50 text-white rounded-xl flex items-center justify-center hover:bg-brand-500 transition-all shadow-[0_0_15px_rgba(244,63,94,0.2)]"><RefreshCw className="w-5 h-5" /></button>
        </div>

        <ComposableMap 
          projection="geoEqualEarth"
          style={{ width: "100%", height: "100%" }}
        >
          <ZoomableGroup 
             zoom={position.zoom} 
             center={position.center} 
             onMoveEnd={pos => setPosition(pos)}
          >
            <Geographies 
               geography={GEO_URL} 
               onGeographyRetrieved={() => setMapStatus('loaded')}
               onError={() => setMapStatus('error')}
            >
              {({ geographies }) =>
                geographies.map((geo) => {
                  const name = geo.properties.name;
                  const count = countryCounts[name] || 0;
                  const isSelected = count > 0;
                  
                  // Cores Neon Reais
                  const fillColor = isSelected ? "#f43f5e" : "#0f172a";
                  const strokeColor = isSelected ? "#fff" : "#1e293b";
                  
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={isSelected ? 0.8 : 0.3}
                      style={{
                        default: { outline: "none", transition: "all 300ms" },
                        hover: { 
                          fill: isSelected ? "#ff0000" : "#22d3ee",
                          outline: "none", 
                          stroke: "#fff",
                          strokeWidth: 1,
                          cursor: isSelected ? "pointer" : "default"
                        },
                        pressed: { outline: "none", scale: 0.98 },
                      }}
                      onMouseEnter={() => {
                         if (name) setTooltipContent(`${name}: ${count} ITENS`);
                      }}
                      onMouseLeave={() => setTooltipContent("")}
                      onClick={() => {
                         if (isSelected) {
                            const originalName = Object.keys(COUNTRY_MAP).find(k => COUNTRY_MAP[k] === name) || name;
                            onCountrySelect(originalName);
                         }
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        <Tooltip 
          id="map-tooltip" 
          content={tooltipContent} 
          style={{ 
            backgroundColor: "#000", 
            color: "#00f3ff", 
            borderRadius: "4px", 
            padding: "4px 8px", 
            fontSize: "10px", 
            fontWeight: "900",
            border: "1px solid #00f3ff",
            boxShadow: "0 0 15px rgba(0, 243, 255, 0.4)",
            zIndex: 1000 
          }} 
        />
      </div>

      {/* Backup Navigation - Se o mapa falhar ou para navegação rápida */}
      <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-6">
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
               <LayoutGrid className="w-4 h-4 text-cyan-400" /> Países no Arquivo ({activeContinent})
            </h3>
         </div>
         <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {activeCountriesList.length === 0 ? (
               <div className="col-span-full py-10 text-center text-slate-600 font-black uppercase text-[8px] tracking-widest">
                  Nenhum país catalogado neste continente
               </div>
            ) : (
               activeCountriesList.map(([name, count]) => (
                  <button 
                     key={name}
                     onClick={() => {
                        const originalName = Object.keys(COUNTRY_MAP).find(k => COUNTRY_MAP[k] === name) || name;
                        onCountrySelect(originalName);
                     }}
                     className="bg-slate-900 hover:bg-cyan-900/20 border border-slate-800 hover:border-cyan-500/50 p-3 rounded-xl transition-all flex flex-col items-center gap-2 group"
                  >
                     <span className="text-white font-black text-[9px] uppercase tracking-tighter group-hover:text-cyan-400 text-center truncate w-full">{name}</span>
                     <span className="bg-slate-800 text-[8px] font-mono px-2 py-0.5 rounded text-slate-400 group-hover:text-cyan-300">{count}</span>
                  </button>
               ))
            )}
         </div>
      </div>
    </div>
  );
};
