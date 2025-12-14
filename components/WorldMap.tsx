import React, { useMemo, useState } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { scaleQuantile } from "d3-scale";
import { Tooltip } from 'react-tooltip';
import { ScratchcardData } from '../types';
import { Loader2, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

// Standard TopoJSON URL for world map
const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface WorldMapProps {
  images: ScratchcardData[];
  onCountrySelect: (country: string) => void;
  t: any;
}

// Dictionary to map standard TopoJSON English names to common stored names (PT/IT/EN variants)
// This ensures "Spain" on map matches "Espanha" in DB.
const COUNTRY_MAPPING: Record<string, string[]> = {
  "Portugal": ["Portugal", "PT"],
  "Spain": ["Espanha", "España", "Spain", "ES"],
  "France": ["França", "France", "FR"],
  "Italy": ["Itália", "Italia", "Italy", "IT"],
  "United States of America": ["EUA", "USA", "United States", "Estados Unidos", "US"],
  "Brazil": ["Brasil", "Brazil", "BR"],
  "Japan": ["Japão", "Japan", "JP"],
  "United Kingdom": ["Reino Unido", "UK", "Inglaterra", "England", "GB"],
  "Germany": ["Alemanha", "Germany", "Deutschland", "DE"],
  "China": ["China", "CN"],
  "Belgium": ["Bélgica", "Belgica", "Belgium", "BE"],
  "Switzerland": ["Suíça", "Suica", "Switzerland", "CH"],
  "Canada": ["Canadá", "Canada", "CA"],
  "Australia": ["Austrália", "Australia", "AU"],
  "Russia": ["Rússia", "Russia", "RU"],
  "India": ["Índia", "India", "IN"]
};

export const WorldMap: React.FC<WorldMapProps> = ({ images, onCountrySelect, t }) => {
  const [position, setPosition] = useState({ coordinates: [0, 20] as [number, number], zoom: 1.2 });
  const [tooltipContent, setTooltipContent] = useState("");

  // Aggregate Data: Count items per mapped country name
  const data = useMemo(() => {
    const counts: Record<string, number> = {}; // Key: Map Name (English), Value: Count

    images.forEach(img => {
      const dbCountry = img.country.trim();
      let mapNameFound = null;

      // Try to find which Map Name corresponds to this DB Country
      // 1. Check exact match
      // 2. Check mapping dictionary
      
      // Reverse lookup in mapping
      for (const [mapName, variations] of Object.entries(COUNTRY_MAPPING)) {
        if (variations.some(v => v.toLowerCase() === dbCountry.toLowerCase())) {
          mapNameFound = mapName;
          break;
        }
      }

      // If no mapping found, try to use the DB name directly (it might match standard English)
      const finalName = mapNameFound || dbCountry;

      counts[finalName] = (counts[finalName] || 0) + 1;
    });

    return counts;
  }, [images]);

  // Color Scale
  const colorScale = useMemo(() => {
    const vals = Object.values(data) as number[];
    const maxVal = Math.max(...vals, 1);
    
    return (val: number) => {
       if (val === 0) return "#1f2937"; // Gray-800
       // Simple Linear interpolation for red intensity
       // Min opacity 0.3, Max 1.0
       const intensity = 0.3 + (val / maxVal) * 0.7;
       return `rgba(225, 29, 72, ${intensity})`; // Brand-600
    };
  }, [data]);

  const handleZoomIn = () => {
    if (position.zoom >= 4) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom * 1.5 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 1) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom / 1.5 }));
  };
  
  const handleReset = () => {
     setPosition({ coordinates: [0, 20], zoom: 1.2 });
  };

  const handleMoveEnd = (position: { coordinates: [number, number]; zoom: number }) => {
    setPosition(position);
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden flex flex-col">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button onClick={handleZoomIn} className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 shadow-lg border border-gray-700" title="Zoom In">
          <ZoomIn className="w-5 h-5" />
        </button>
        <button onClick={handleZoomOut} className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 shadow-lg border border-gray-700" title="Zoom Out">
          <ZoomOut className="w-5 h-5" />
        </button>
        <button onClick={handleReset} className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 shadow-lg border border-gray-700" title="Reset">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Stats Overlay */}
      <div className="absolute bottom-4 left-4 z-10 bg-gray-900/90 backdrop-blur border border-gray-800 p-4 rounded-xl shadow-xl max-w-xs">
        <h4 className="text-brand-500 font-bold uppercase text-xs mb-2">Top Países</h4>
        <div className="space-y-1">
          {Object.entries(data)
            .sort((a, b) => (b[1] as number) - (a[1] as number))
            .slice(0, 5)
            .map(([name, count]) => (
              <div key={name} className="flex justify-between text-sm">
                <span className="text-gray-300">{name}</span>
                <span className="font-mono font-bold text-white">{count}</span>
              </div>
            ))}
        </div>
      </div>

      <div className="flex-1 cursor-grab active:cursor-grabbing" data-tooltip-id="map-tooltip">
        <ComposableMap projection="geoMercator" projectionConfig={{ scale: 120 }}>
          <ZoomableGroup 
             zoom={position.zoom} 
             center={position.coordinates} 
             onMoveEnd={handleMoveEnd}
             maxZoom={5}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }: { geographies: any[] }) =>
                geographies.map((geo) => {
                  const cur = data[geo.properties.name] || 0;
                  // Fallback: try mapping if direct name fails (e.g. United States)
                  // But usually data keys are already normalized to Map Names in useMemo
                  
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={cur > 0 ? colorScale(cur) : "#1f2937"} // brand vs gray-800
                      stroke="#374151" // gray-700
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none", transition: "all 250ms" },
                        hover: { 
                          fill: cur > 0 ? "#be123c" : "#4b5563", // darker brand or gray-600
                          outline: "none", 
                          stroke: "#fff",
                          cursor: cur > 0 ? "pointer" : "default"
                        },
                        pressed: { outline: "none" },
                      }}
                      onMouseEnter={() => {
                         const name = geo.properties.name;
                         const count = data[name] || 0;
                         setTooltipContent(`${name}: ${count} items`);
                      }}
                      onMouseLeave={() => {
                        setTooltipContent("");
                      }}
                      onClick={() => {
                         if (cur > 0) {
                            // Convert Map Name back to a search term likely to work
                            // Or pass the Map Name directly if the search logic is fuzzy
                            onCountrySelect(geo.properties.name);
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
      <Tooltip id="map-tooltip" content={tooltipContent} place="top" style={{ backgroundColor: "#000", color: "#fff", borderRadius: "8px" }} />
    </div>
  );
};