
import React, { useMemo, useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { Tooltip } from 'react-tooltip';
import { scaleSqrt } from "d3-scale";
import { ScratchcardData } from '../types';
import { ZoomIn, ZoomOut, RefreshCw, Layers, Loader2, Info, MapPin } from 'lucide-react';

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface WorldMapProps {
  images: ScratchcardData[];
  onCountrySelect: (country: string) => void;
  t: any;
}

// Mapa de normalização para nomes de países (DB -> TopoJSON)
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

export const WorldMap: React.FC<WorldMapProps> = ({ images, onCountrySelect, t }) => {
  const [position, setPosition] = useState({ coordinates: [10, 20] as [number, number], zoom: 1.2 });
  const [tooltipContent, setTooltipContent] = useState("");
  const [mapLoaded, setMapLoaded] = useState(false);

  // Agrupar dados por país
  const countryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    images.forEach(img => {
      const name = COUNTRY_MAP[img.country] || img.country;
      counts[name] = (counts[name] || 0) + 1;
    });
    return counts;
  }, [images]);

  const maxVal = useMemo(() => {
    // Explicitly cast Object.values to number[] to fix "unknown" type error during spread for Math.max
    const vals = Object.values(countryCounts) as number[];
    return vals.length > 0 ? Math.max(...vals) : 1;
  }, [countryCounts]);

  // Escala de cores profissional usando d3
  const colorScale = useMemo(() => {
    return scaleSqrt<string>()
      .domain([0, maxVal])
      .range(["#1e293b", "#f43f5e"]); // slate-800 para brand-500
  }, [maxVal]);

  const handleZoomIn = () => setPosition(pos => ({ ...pos, zoom: Math.min(pos.zoom * 1.5, 8) }));
  const handleZoomOut = () => setPosition(pos => ({ ...pos, zoom: Math.max(pos.zoom / 1.5, 1) }));
  const handleReset = () => setPosition({ coordinates: [10, 20], zoom: 1.2 });

  return (
    <div className="relative w-full h-full bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden flex flex-col shadow-2xl">
      {!mapLoaded && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md">
           <Loader2 className="w-12 h-12 text-brand-500 animate-spin mb-4" />
           <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em] animate-pulse">Renderizando Globo...</p>
        </div>
      )}

      {/* Controles Flutuantes */}
      <div className="absolute top-8 right-8 z-10 flex flex-col gap-3">
        <div className="flex flex-col gap-2 p-1.5 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl shadow-2xl">
          <button onClick={handleZoomIn} className="p-3 hover:bg-brand-600 hover:text-white text-slate-400 rounded-xl transition-all" title="Zoom In"><ZoomIn className="w-5 h-5" /></button>
          <button onClick={handleZoomOut} className="p-3 hover:bg-brand-600 hover:text-white text-slate-400 rounded-xl transition-all" title="Zoom Out"><ZoomOut className="w-5 h-5" /></button>
          <div className="h-px bg-slate-800 mx-2"></div>
          <button onClick={handleReset} className="p-3 hover:bg-blue-600 hover:text-white text-slate-400 rounded-xl transition-all" title="Reset Map"><RefreshCw className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Legenda e Top Ranking */}
      <div className="absolute bottom-8 left-8 z-10 w-72 space-y-4 hidden md:block">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <Layers className="w-5 h-5 text-brand-500" />
            <h4 className="text-white font-black uppercase text-xs tracking-widest">Densidade Mundial</h4>
          </div>
          
          <div className="space-y-4">
            {/* Explicitly cast Object.entries to [string, number][] to fix arithmetic operation type errors */}
            {(Object.entries(countryCounts) as [string, number][])
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([name, count], i) => (
                <button 
                  key={name} 
                  onClick={() => onCountrySelect(name)}
                  className="w-full flex flex-col gap-2 group text-left"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-black text-[9px] uppercase tracking-tighter group-hover:text-white transition-colors">
                      {i + 1}. {name}
                    </span>
                    <span className="text-[10px] font-mono font-black text-brand-400">{count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-1000" 
                      // Fixed type error: count and maxVal are now correctly typed as numbers
                      style={{ width: `${(count / maxVal) * 100}%` }}
                    ></div>
                  </div>
                </button>
              ))}
          </div>
          
          <div className="mt-8 pt-4 border-t border-slate-800 flex items-center gap-2">
            <Info className="w-3 h-3 text-slate-600" />
            <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Clique num país para filtrar</span>
          </div>
        </div>
      </div>

      <div className="flex-1 cursor-grab active:cursor-grabbing" data-tooltip-id="map-tooltip">
        <ComposableMap 
          projection="geoMercator" 
          width={800} 
          height={450}
          style={{ width: "100%", height: "100%" }}
        >
          <ZoomableGroup 
             zoom={position.zoom} 
             center={position.coordinates} 
             onMoveEnd={pos => setPosition(pos)}
          >
            <Geographies geography={GEO_URL} onGeographyRetrieved={() => setMapLoaded(true)}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const name = geo.properties.name;
                  const count = countryCounts[name] || 0;
                  const isSelected = count > 0;
                  
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={colorScale(count)}
                      stroke="#020617"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
                        hover: { 
                          fill: isSelected ? "#f43f5e" : "#334155",
                          outline: "none", 
                          stroke: "#fff",
                          strokeWidth: 1,
                          cursor: isSelected ? "pointer" : "default"
                        },
                        pressed: { outline: "none", scale: 0.98 },
                      }}
                      onMouseEnter={() => {
                         setTooltipContent(`${name}: ${count} ${count === 1 ? 'item' : 'itens'}`);
                      }}
                      onMouseLeave={() => setTooltipContent("")}
                      onClick={() => {
                         if (isSelected) {
                            // Encontrar o nome original do DB para o filtro
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
      </div>

      <Tooltip 
        id="map-tooltip" 
        content={tooltipContent} 
        style={{ 
          backgroundColor: "#0f172a", 
          color: "#fff", 
          borderRadius: "12px", 
          padding: "8px 12px", 
          fontSize: "10px", 
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          border: "1px solid #334155",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
          zIndex: 1000
        }} 
      />
    </div>
  );
};
