
import React, { useMemo, useState } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { Tooltip } from 'react-tooltip';
import { ScratchcardData } from '../types';
import { ZoomIn, ZoomOut, RefreshCw, Layers } from 'lucide-react';

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface WorldMapProps {
  images: ScratchcardData[];
  onCountrySelect: (country: string) => void;
  t: any;
}

const COUNTRY_MAPPING: Record<string, string[]> = {
  "Portugal": ["Portugal", "PT"],
  "Spain": ["Espanha", "España", "Spain", "ES"],
  "France": ["França", "France", "FR"],
  "Italy": ["Itália", "Italia", "Italy", "IT"],
  "United States of America": ["EUA", "USA", "United States", "Estados Unidos", "US"],
  "Brazil": ["Brasil", "Brazil", "BR"],
  "Japan": ["Japão", "Japan", "JP"],
  "United Kingdom": ["Reino Unido", "UK", "Inglaterra", "England", "GB"],
  "Germany": ["Alemanha", "Germany", "Deutschland", "DE", "Alemanhã"],
  "China": ["China", "CN"],
  "Belgium": ["Bélgica", "Belgica", "Belgium", "BE"],
  "Switzerland": ["Suíça", "Suica", "Switzerland", "CH"],
  "Canada": ["Canadá", "Canada", "CA"],
  "Australia": ["Austrália", "Australia", "AU"],
  "Russia": ["Rússia", "Russia", "RU"],
  "India": ["Índia", "India", "IN"],
  "Argentina": ["Argentina", "AR"],
  "Mexico": ["México", "Mexico", "MX"],
  "Austria": ["Áustria", "Austria", "AT"]
};

export const WorldMap: React.FC<WorldMapProps> = ({ images, onCountrySelect, t }) => {
  const [position, setPosition] = useState({ coordinates: [0, 20] as [number, number], zoom: 1.2 });
  const [tooltipContent, setTooltipContent] = useState("");

  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    images.forEach(img => {
      const dbCountry = img.country.trim();
      let mapNameFound = null;
      for (const [mapName, variations] of Object.entries(COUNTRY_MAPPING)) {
        if (variations.some(v => v.toLowerCase() === dbCountry.toLowerCase())) {
          mapNameFound = mapName;
          break;
        }
      }
      const finalName = mapNameFound || dbCountry;
      counts[finalName] = (counts[finalName] || 0) + 1;
    });
    return counts;
  }, [images]);

  const colorScale = useMemo(() => {
    const vals = Object.values(data) as number[];
    const maxVal = Math.max(...vals, 1);
    return (val: number) => {
       if (val === 0) return "#0f172a";
       const intensity = 0.2 + (val / maxVal) * 0.8;
       return `rgba(225, 29, 72, ${intensity})`; 
    };
  }, [data]);

  const handleZoomIn = () => {
    if (position.zoom >= 6) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom * 1.5 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 1) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom / 1.5 }));
  };
  
  const handleReset = () => {
     setPosition({ coordinates: [0, 20], zoom: 1.2 });
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden flex flex-col shadow-2xl">
      {/* Controls */}
      <div className="absolute top-6 right-6 z-10 flex flex-col gap-3">
        <button onClick={handleZoomIn} className="p-3 bg-slate-900/80 backdrop-blur-md text-white rounded-xl hover:bg-brand-600 transition-all border border-slate-700 shadow-xl" title="Zoom In">
          <ZoomIn className="w-5 h-5" />
        </button>
        <button onClick={handleZoomOut} className="p-3 bg-slate-900/80 backdrop-blur-md text-white rounded-xl hover:bg-brand-600 transition-all border border-slate-700 shadow-xl" title="Zoom Out">
          <ZoomOut className="w-5 h-5" />
        </button>
        <button onClick={handleReset} className="p-3 bg-slate-900/80 backdrop-blur-md text-white rounded-xl hover:bg-blue-600 transition-all border border-slate-700 shadow-xl" title="Reset">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Stats Overlay */}
      <div className="absolute bottom-6 left-6 z-10 bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl shadow-2xl max-w-xs animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
           <Layers className="w-4 h-4 text-brand-500" />
           <h4 className="text-white font-black uppercase text-[10px] tracking-widest">Densidade do Arquivo</h4>
        </div>
        <div className="space-y-3">
          {Object.entries(data)
            .sort((a, b) => (b[1] as number) - (a[1] as number))
            .slice(0, 5)
            .map(([name, count], i) => (
              <div key={name} className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold">{i + 1}. {name}</span>
                  <span className="font-mono font-black text-brand-400">{count}</span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                   {/* Explicitly cast count to number to satisfy arithmetic operation requirements in strict TS environments */}
                   <div className="h-full bg-brand-600 rounded-full" style={{ width: `${((count as number) / Math.max(...(Object.values(data) as number[]), 1)) * 100}%` }}></div>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="flex-1 cursor-grab active:cursor-grabbing" data-tooltip-id="map-tooltip">
        <ComposableMap projection="geoMercator" projectionConfig={{ scale: 120 }}>
          <ZoomableGroup 
             zoom={position.zoom} 
             center={position.coordinates} 
             onMoveEnd={pos => setPosition(pos)}
             maxZoom={6}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }: { geographies: any[] }) =>
                geographies.map((geo) => {
                  const name = geo.properties.name;
                  const cur = data[name] || 0;
                  
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={cur > 0 ? colorScale(cur) : "#1e293b"}
                      stroke="#0f172a"
                      strokeWidth={0.3}
                      style={{
                        default: { outline: "none", transition: "all 300ms ease" },
                        hover: { 
                          fill: cur > 0 ? "#f43f5e" : "#334155",
                          outline: "none", 
                          stroke: "#fff",
                          strokeWidth: 1,
                          cursor: cur > 0 ? "pointer" : "default"
                        },
                        pressed: { outline: "none" },
                      }}
                      onMouseEnter={() => {
                         setTooltipContent(`${name}: ${cur} itens catalogados`);
                      }}
                      onMouseLeave={() => {
                        setTooltipContent("");
                      }}
                      onClick={() => {
                         if (cur > 0) {
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
        place="top" 
        style={{ 
          backgroundColor: "#0f172a", 
          color: "#fff", 
          borderRadius: "12px", 
          padding: "8px 12px", 
          fontSize: "10px", 
          fontWeight: "bold",
          border: "1px solid #334155",
          zIndex: 10000
        }} 
      />
    </div>
  );
};
