
import React, { useMemo, useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { Tooltip } from 'react-tooltip';
import { scaleSqrt } from "d3-scale";
import { ScratchcardData } from '../types';
import { ZoomIn, ZoomOut, RefreshCw, Layers, Loader2, Info, MapPin, AlertTriangle, Globe } from 'lucide-react';

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface WorldMapProps {
  images: ScratchcardData[];
  onCountrySelect: (country: string) => void;
  t: any;
}

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
  const [mapStatus, setMapStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  const countryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    images.forEach(img => {
      const name = COUNTRY_MAP[img.country] || img.country;
      counts[name] = (counts[name] || 0) + 1;
    });
    return counts;
  }, [images]);

  const maxVal = useMemo(() => {
    const vals = Object.values(countryCounts) as number[];
    return vals.length > 0 ? Math.max(...vals) : 1;
  }, [countryCounts]);

  const colorScale = useMemo(() => {
    return scaleSqrt<string>()
      .domain([0, maxVal])
      .range(["#1e293b", "#f43f5e"]);
  }, [maxVal]);

  const handleZoomIn = () => setPosition(pos => ({ ...pos, zoom: Math.min(pos.zoom * 1.5, 8) }));
  const handleZoomOut = () => setPosition(pos => ({ ...pos, zoom: Math.max(pos.zoom / 1.5, 1) }));
  const handleReset = () => setPosition({ coordinates: [10, 20], zoom: 1.2 });

  return (
    <div className="relative w-full h-full min-h-[500px] bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden flex flex-col shadow-2xl animate-fade-in">
      
      {mapStatus === 'loading' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md">
           <div className="relative mb-4">
              <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
              <Globe className="absolute inset-0 m-auto w-5 h-5 text-brand-400 opacity-50" />
           </div>
           <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.3em] animate-pulse text-center px-4">
              Chloe está a desenhar o mapa mundial...<br/>
              <span className="text-[8px] text-slate-600 mt-2 block">Conectando aos satélites do arquivo</span>
           </p>
        </div>
      )}

      {mapStatus === 'error' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/90 p-8 text-center">
           <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
           <h3 className="text-white font-black uppercase text-sm mb-2">Ops! O Globo encravou.</h3>
           <p className="text-slate-400 text-xs mb-6 max-w-xs">Não conseguimos carregar os dados geográficos. Podes usar a lista lateral para navegar!</p>
           <button onClick={() => window.location.reload()} className="px-6 py-2 bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-700 hover:bg-slate-700 transition-all">
             Tentar Novamente
           </button>
        </div>
      )}

      {/* Controles Flutuantes */}
      <div className="absolute top-6 right-6 z-10 flex flex-col gap-3">
        <div className="flex flex-col gap-2 p-1.5 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-2xl shadow-2xl">
          <button onClick={handleZoomIn} className="p-3 hover:bg-brand-600 hover:text-white text-slate-400 rounded-xl transition-all" title="Zoom In"><ZoomIn className="w-5 h-5" /></button>
          <button onClick={handleZoomOut} className="p-3 hover:bg-brand-600 hover:text-white text-slate-400 rounded-xl transition-all" title="Zoom Out"><ZoomOut className="w-5 h-5" /></button>
          <div className="h-px bg-slate-800 mx-2"></div>
          <button onClick={handleReset} className="p-3 hover:bg-blue-600 hover:text-white text-slate-400 rounded-xl transition-all" title="Reset Map"><RefreshCw className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Legenda e Top Ranking */}
      <div className="absolute bottom-6 left-6 z-10 w-full max-w-[280px] space-y-4">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-5 rounded-3xl shadow-2xl hidden md:block">
          <div className="flex items-center gap-3 mb-5">
            <Layers className="w-4 h-4 text-brand-500" />
            <h4 className="text-white font-black uppercase text-[10px] tracking-widest">Países em Destaque</h4>
          </div>
          
          <div className="space-y-3">
            {(Object.entries(countryCounts) as [string, number][])
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([name, count], i) => (
                <button 
                  key={name} 
                  onClick={() => {
                     const originalName = Object.keys(COUNTRY_MAP).find(k => COUNTRY_MAP[k] === name) || name;
                     onCountrySelect(originalName);
                  }}
                  className="w-full flex flex-col gap-1.5 group text-left transition-all"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-black text-[9px] uppercase tracking-tighter group-hover:text-brand-400 transition-colors">
                      {i + 1}. {name}
                    </span>
                    <span className="text-[9px] font-mono font-black text-white/40 group-hover:text-brand-500">{count}</span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-1000" 
                      style={{ width: `${(count / maxVal) * 100}%` }}
                    ></div>
                  </div>
                </button>
              ))}
          </div>
          
          <div className="mt-6 pt-3 border-t border-slate-800 flex items-center gap-2">
            <MapPin className="w-3 h-3 text-brand-500" />
            <span className="text-[7px] font-bold text-slate-500 uppercase tracking-[0.2em]">Clique num país para filtrar</span>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full h-full cursor-grab active:cursor-grabbing" data-tooltip-id="map-tooltip">
        <ComposableMap 
          projection="geoEqualEarth"
          style={{ width: "100%", height: "100%", minHeight: "500px" }}
        >
          <ZoomableGroup 
             zoom={position.zoom} 
             center={position.coordinates} 
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
                  
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={colorScale(count)}
                      stroke="#020617"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none", transition: "all 250ms" },
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
                         if (name) setTooltipContent(`${name}: ${count} ${count === 1 ? 'item' : 'itens'}`);
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
      </div>

      <Tooltip 
        id="map-tooltip" 
        content={tooltipContent} 
        style={{ 
          backgroundColor: "#0f172a", 
          color: "#fff", 
          borderRadius: "10px", 
          padding: "6px 10px", 
          fontSize: "9px", 
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
