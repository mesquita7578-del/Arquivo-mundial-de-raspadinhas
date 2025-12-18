
import React, { useMemo, useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { Tooltip } from 'react-tooltip';
import { ScratchcardData } from '../types';
import { ZoomIn, ZoomOut, RefreshCw, Layers, Loader2 } from 'lucide-react';

// URL de TopoJSON confiável e leve
const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface WorldMapProps {
  images: ScratchcardData[];
  onCountrySelect: (country: string) => void;
  t: any;
}

// Mapeamento para alinhar nomes do banco de dados com nomes do TopoJSON
const COUNTRY_NAME_FIX: Record<string, string> = {
  "EUA": "United States of America",
  "USA": "United States of America",
  "Estados Unidos": "United States of America",
  "Reino Unido": "United Kingdom",
  "UK": "United Kingdom",
  "Inglaterra": "United Kingdom",
  "Brasil": "Brazil",
  "Itália": "Italy",
  "Espanha": "Spain",
  "França": "France",
  "Alemanha": "Germany",
  "Japão": "Japan",
  "Suíça": "Switzerland",
  "Bélgica": "Belgium",
  "Áustria": "Austria",
  "Canadá": "Canada",
  "Austrália": "Australia",
  "Rússia": "Russia",
  "Índia": "India",
  "México": "Mexico"
};

export const WorldMap: React.FC<WorldMapProps> = ({ images, onCountrySelect, t }) => {
  const [position, setPosition] = useState({ coordinates: [0, 0] as [number, number], zoom: 1 });
  const [tooltipContent, setTooltipContent] = useState("");
  const [mapLoaded, setMapLoaded] = useState(false);

  // Calcula a densidade por país
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    images.forEach(img => {
      let countryName = img.country.trim();
      // Aplica correção de nome se existir
      if (COUNTRY_NAME_FIX[countryName]) {
        countryName = COUNTRY_NAME_FIX[countryName];
      }
      counts[countryName] = (counts[countryName] || 0) + 1;
    });
    return counts;
  }, [images]);

  const maxVal = useMemo(() => {
    const vals = Object.values(data) as number[];
    return Math.max(...vals, 1);
  }, [data]);

  const getColor = (count: number) => {
    if (count === 0) return "#1e293b"; // Slate-800 para países sem itens
    const intensity = 0.3 + (count / maxVal) * 0.7;
    return `rgba(244, 63, 94, ${intensity})`; // Brand-500 com opacidade baseada no volume
  };

  const handleZoomIn = () => {
    if (position.zoom >= 8) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom * 1.5 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 1) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom / 1.5 }));
  };
  
  const handleReset = () => {
     setPosition({ coordinates: [0, 0], zoom: 1 });
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-slate-900/50 rounded-3xl border border-slate-800 overflow-hidden flex flex-col shadow-2xl">
      {!mapLoaded && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm">
           <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-4" />
           <p className="text-slate-400 font-black uppercase text-xs tracking-[0.2em]">Desenhando Fronteiras...</p>
        </div>
      )}

      {/* Controlos de Zoom */}
      <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
        <button onClick={handleZoomIn} className="p-2.5 bg-slate-800/90 text-white rounded-xl hover:bg-brand-600 transition-all border border-slate-700 shadow-xl">
          <ZoomIn className="w-5 h-5" />
        </button>
        <button onClick={handleZoomOut} className="p-2.5 bg-slate-800/90 text-white rounded-xl hover:bg-brand-600 transition-all border border-slate-700 shadow-xl">
          <ZoomOut className="w-5 h-5" />
        </button>
        <button onClick={handleReset} className="p-2.5 bg-slate-800/90 text-white rounded-xl hover:bg-blue-600 transition-all border border-slate-700 shadow-xl">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Legenda de Top 5 */}
      <div className="absolute bottom-6 left-6 z-10 bg-slate-900/95 backdrop-blur-md border border-slate-800 p-5 rounded-2xl shadow-2xl hidden md:block w-64">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
           <Layers className="w-4 h-4 text-brand-500" />
           <h4 className="text-white font-black uppercase text-[10px] tracking-widest">Top Países</h4>
        </div>
        <div className="space-y-3">
          {Object.entries(data)
            .sort((a, b) => (b[1] as number) - (a[1] as number))
            .slice(0, 5)
            .map(([name, count], i) => (
              <div key={name} className="flex flex-col gap-1 cursor-pointer hover:bg-slate-800/50 p-1 rounded transition-colors" onClick={() => onCountrySelect(name)}>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 font-bold truncate pr-2">{i + 1}. {name}</span>
                  <span className="font-mono font-black text-brand-400">{count}</span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-brand-600" style={{ width: `${((count as number) / maxVal) * 100}%` }}></div>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="flex-1 cursor-grab active:cursor-grabbing w-full h-full" data-tooltip-id="map-tooltip">
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
                  const count = data[name] || 0;
                  
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={getColor(count)}
                      stroke="#0f172a"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
                        hover: { 
                          fill: count > 0 ? "#f43f5e" : "#334155",
                          outline: "none", 
                          stroke: "#fff",
                          strokeWidth: 1,
                          cursor: count > 0 ? "pointer" : "default"
                        },
                        pressed: { outline: "none" },
                      }}
                      onMouseEnter={() => {
                         setTooltipContent(`${name}: ${count} itens`);
                      }}
                      onMouseLeave={() => {
                        setTooltipContent("");
                      }}
                      onClick={() => {
                         if (count > 0) {
                            onCountrySelect(name);
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
          borderRadius: "8px", 
          padding: "6px 10px", 
          fontSize: "11px", 
          fontWeight: "bold",
          border: "1px solid #334155",
          zIndex: 1000
        }} 
      />
    </div>
  );
};
