
import React, { useMemo, useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { Tooltip } from 'react-tooltip';
import { scaleSqrt } from "d3-scale";
import { ScratchcardData, Continent } from '../types';
import { 
  ZoomIn, ZoomOut, RefreshCw, Layers, Loader2, 
  MapPin, AlertTriangle, Globe, Navigation2,
  Compass
} from 'lucide-react';

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface WorldMapProps {
  images: ScratchcardData[];
  onCountrySelect: (country: string) => void;
  activeContinent: Continent | 'Mundo';
  t: any;
}

// Configurações de visualização por continente para carregamento focado
const CONTINENT_VIEWS: Record<string, { center: [number, number]; zoom: number }> = {
  'Mundo': { center: [10, 20], zoom: 1.2 },
  'Europa': { center: [15, 52], zoom: 3.5 },
  'América': { center: [-80, 10], zoom: 1.8 },
  'Ásia': { center: [90, 30], zoom: 2 },
  'África': { center: [20, 0], zoom: 2.2 },
  'Oceania': { center: [140, -25], zoom: 3 },
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

  // Atualiza a posição quando o continente muda no menu superior
  useEffect(() => {
    if (CONTINENT_VIEWS[activeContinent]) {
      setPosition(CONTINENT_VIEWS[activeContinent]);
    }
  }, [activeContinent]);

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

  return (
    <div className="relative w-full h-full min-h-[600px] bg-[#020617] rounded-[2.5rem] border border-slate-800/50 overflow-hidden flex flex-col shadow-2xl animate-fade-in group">
      
      {/* Overlay de carregamento elegante */}
      {mapStatus === 'loading' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#020617]/95 backdrop-blur-xl">
           <div className="relative mb-6">
              <Loader2 className="w-20 h-20 text-brand-500 animate-spin opacity-20" />
              <Globe className="absolute inset-0 m-auto w-8 h-8 text-brand-500 animate-pulse" />
           </div>
           <div className="text-center space-y-2">
              <p className="text-white font-black uppercase text-xs tracking-[0.4em] animate-pulse">
                 Sincronizando Coordenadas
              </p>
              <p className="text-slate-600 text-[9px] font-bold uppercase tracking-widest">
                 Arquivo de {activeContinent} • A carregar...
              </p>
           </div>
        </div>
      )}

      {/* Mensagem de Erro com Botões de Recuperação */}
      {mapStatus === 'error' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/90 p-8 text-center animate-fade-in">
           <AlertTriangle className="w-16 h-16 text-yellow-500 mb-6" />
           <h3 className="text-2xl font-black text-white uppercase italic mb-2 tracking-tighter">O Mapa está Oculto</h3>
           <p className="text-slate-400 text-sm mb-8 max-w-sm leading-relaxed">
             O teu dispositivo pode estar com a memória cheia. Não te preocupes, usa a lista lateral ou tenta atualizar.
           </p>
           <button onClick={() => window.location.reload()} className="px-10 py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-2xl shadow-brand-900/40 active:scale-95">
             Reiniciar Sistema
           </button>
        </div>
      )}

      {/* Controlos e Info HUD */}
      <div className="absolute top-8 left-8 z-20 hidden md:flex flex-col gap-4">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-6 rounded-3xl shadow-2xl min-w-[240px]">
           <div className="flex items-center gap-3 mb-6">
              <Compass className="w-5 h-5 text-brand-500" />
              <h4 className="text-white font-black uppercase text-[10px] tracking-[0.2em]">{activeContinent}</h4>
           </div>
           
           <div className="space-y-4">
              {(Object.entries(countryCounts) as [string, number][])
                .sort((a, b) => b[1] - a[1])
                .slice(0, 4)
                .map(([name, count], i) => (
                  <div key={name} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-tighter">
                      <span className="text-slate-400">{i + 1}. {name}</span>
                      <span className="text-brand-500">{count}</span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full">
                      <div className="h-full bg-brand-600" style={{ width: `${(count / maxVal) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
           </div>
        </div>
      </div>

      {/* Floating Action Buttons para Zoom */}
      <div className="absolute bottom-8 right-8 z-20 flex flex-col gap-2">
         <button onClick={() => setPosition(p => ({...p, zoom: p.zoom + 0.5}))} className="w-12 h-12 bg-slate-900 border border-slate-700 text-white rounded-xl flex items-center justify-center hover:bg-brand-600 transition-all shadow-xl"><ZoomIn className="w-5 h-5" /></button>
         <button onClick={() => setPosition(p => ({...p, zoom: Math.max(1, p.zoom - 0.5)}))} className="w-12 h-12 bg-slate-900 border border-slate-700 text-white rounded-xl flex items-center justify-center hover:bg-brand-600 transition-all shadow-xl"><ZoomOut className="w-5 h-5" /></button>
         <button onClick={() => setPosition(CONTINENT_VIEWS[activeContinent] || CONTINENT_VIEWS['Mundo'])} className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-500 transition-all shadow-xl"><RefreshCw className="w-5 h-5" /></button>
      </div>

      <div className="flex-1 w-full h-full cursor-grab active:cursor-grabbing" data-tooltip-id="map-tooltip">
        <ComposableMap 
          projection="geoEqualEarth"
          style={{ width: "100%", height: "100%", minHeight: "600px" }}
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
                  
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={colorScale(count)}
                      stroke="#020617"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none", transition: "all 300ms" },
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
                         if (name) setTooltipContent(`${name}: ${count} itens`);
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
          backgroundColor: "#020617", 
          color: "#fff", 
          borderRadius: "12px", 
          padding: "8px 12px", 
          fontSize: "10px", 
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          border: "1px solid #334155",
          zIndex: 1000,
          boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)"
        }} 
      />
    </div>
  );
};
