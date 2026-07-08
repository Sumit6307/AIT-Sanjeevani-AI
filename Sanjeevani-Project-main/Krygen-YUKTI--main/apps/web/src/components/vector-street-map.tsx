"use client";

import React, { useMemo } from "react";
import { Navigation, Info, Car, MapPin, CheckCircle, Compass } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MapMarker {
  id: string;
  name: string;
  lat: number;
  lon: number;
  type: "pharmacy" | "hospital" | "bloodbank" | "ambulance";
  distance?: number;
  info?: string;
}

interface VectorStreetMapProps {
  userCoords: { lat: number; lon: number } | null;
  selectedMarkerId: string | null;
  markers: MapMarker[];
  onSelectMarker: (id: string) => void;
  trafficCongestion: "low" | "medium" | "high";
  setTrafficCongestion: (val: "low" | "medium" | "high") => void;
  language: string;
  activeRouteOnly?: boolean;
}

export default function VectorStreetMap({
  userCoords,
  selectedMarkerId,
  markers,
  onSelectMarker,
  trafficCongestion,
  setTrafficCongestion,
  language,
  activeRouteOnly = false
}: VectorStreetMapProps) {
  const isEn = language === "en";

  // Traffic multiplier calculation
  const trafficFactor = useMemo(() => {
    if (trafficCongestion === "low") return 1.0;
    if (trafficCongestion === "medium") return 1.5;
    return 2.4;
  }, [trafficCongestion]);

  // Find active selected marker
  const activeMarker = useMemo(() => {
    return markers.find(m => m.id === selectedMarkerId) || null;
  }, [markers, selectedMarkerId]);

  // SVG grid size: 400 x 400
  // User is pinned at center (200, 200)
  // Calculate relative screen positions using latitude and longitude differences
  const projectedMarkers = useMemo(() => {
    if (!userCoords) return [];
    
    // Scale factor: roughly map 3km radius to 150px
    const scaleLat = 111 * 50; // pixels per degree lat
    const scaleLon = 100 * 50; // pixels per degree lon

    return markers.map(m => {
      const dLat = m.lat - userCoords.lat;
      const dLon = m.lon - userCoords.lon;
      
      let x = 200 + dLon * scaleLon;
      let y = 200 - dLat * scaleLat; // subtract because SVG y goes down

      // Clamp coordinates to keep inside map view
      const dist = Math.sqrt((x - 200) ** 2 + (y - 200) ** 2);
      if (dist > 180) {
        const angle = Math.atan2(y - 200, x - 200);
        x = 200 + Math.cos(angle) * 180;
        y = 200 + Math.sin(angle) * 180;
      }

      return {
        ...m,
        x,
        y
      };
    });
  }, [markers, userCoords]);

  // Find active marker projection coordinates
  const activeProjection = useMemo(() => {
    return projectedMarkers.find(p => p.id === selectedMarkerId) || null;
  }, [projectedMarkers, selectedMarkerId]);

  // Generate dynamic routing turn-by-turn directions based on destination sector
  const turnDirections = useMemo(() => {
    if (!activeMarker || !activeProjection) return [];

    const xDiff = activeProjection.x - 200;
    const yDiff = activeProjection.y - 200;
    const distanceVal = activeMarker.distance ?? 1.5;
    const delayMins = Math.round(distanceVal * 2.2 * trafficFactor);

    const stepsEn: string[] = [];
    const stepsHi: string[] = [];

    // Triage quadrants to output highly realistic directions
    if (xDiff >= 0 && yDiff < 0) {
      // North-East quadrant (e.g. Katra/University direction)
      stepsEn.push("Head North on MG Road toward Katra Crossing (400m).");
      stepsHi.push("एमजी रोड पर उत्तर दिशा में कटरा क्रॉसिंग की ओर चलें (400 मीटर)।");

      if (trafficCongestion === "high") {
        stepsEn.push("⚠️ High Congestion near University Road. Diverting via Beli Road split.");
        stepsHi.push("⚠️ यूनिवर्सिटी रोड के पास भारी जाम। बेली रोड कट से डायवर्ट करें।");
      } else {
        stepsEn.push("Turn Right onto University Road (600m) past Alfred Park.");
        stepsHi.push("अल्फ्रेड पार्क के आगे यूनिवर्सिटी रोड पर दाएं मुड़ें (600 मीटर)।");
      }

      stepsEn.push(`Proceed past confluences toward target. Destination arrived in ${delayMins} mins.`);
      stepsHi.push(`लक्ष्य की ओर आगे बढ़ें। ${delayMins} मिनट में गंतव्य पहुंचे।`);
    } else if (xDiff < 0 && yDiff < 0) {
      // North-West quadrant (e.g. Beli / Civil Lines)
      stepsEn.push("Head West on GT Road toward Civil Lines Crossing (300m).");
      stepsHi.push("जीटी रोड पर पश्चिम दिशा में सिविल लाइन्स क्रॉसिंग की ओर चलें (300 मीटर)।");

      stepsEn.push("Turn Right at Beli Crossing past Swarup Rani Hospital (800m).");
      stepsHi.push("स्वरूप रानी अस्पताल के पास बेली क्रॉसिंग पर दाएं मुड़ें (800 मीटर)।");

      stepsEn.push(`Destination is on the left in ${delayMins} mins.`);
      stepsHi.push(`गंतव्य ${delayMins} मिनट में बाईं ओर है।`);
    } else if (xDiff >= 0 && yDiff >= 0) {
      // South-East quadrant (e.g. Allahapur / Naini / Sangam)
      stepsEn.push("Head East toward Sangam Marg road confluence (500m).");
      stepsHi.push("पूर्व दिशा में संगम मार्ग रोड संगम की ओर चलें (500 मीटर)।");

      stepsEn.push("Follow route along Ganga River Confluence Parkway (1.2 km).");
      stepsHi.push("गंगा नदी संगम पार्कवे मार्ग का अनुसरण करें (1.2 किमी)।");

      stepsEn.push(`Arrive at emergency medical station in ${delayMins} mins.`);
      stepsHi.push(`${delayMins} मिनट में आपातकालीन चिकित्सा स्टेशन पहुंचे।`);
    } else {
      // South-West quadrant (e.g. Chowk / Rajapur)
      stepsEn.push("Head South on Chowk Market bypass road (350m).");
      stepsHi.push("चौक बाजार बाईपास रोड पर दक्षिण की ओर चलें (350 मीटर)।");

      stepsEn.push("Make a sharp left at Minto Park intersection (500m).");
      stepsHi.push("मिंटो पार्क चौराहे पर तेजी से बाएं मुड़ें (500 मीटर)।");

      stepsEn.push(`Target reached in ${delayMins} mins.`);
      stepsHi.push(`लक्ष्य ${delayMins} मिनट में पूरा हुआ।`);
    }

    return isEn ? stepsEn : stepsHi;
  }, [activeMarker, activeProjection, trafficFactor, isEn, trafficCongestion]);

  return (
    <Card className="border-4 border-black bg-white dark:bg-[#1E1E1E] p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none">
      
      {/* MAP SUBHEADER CONTROLS */}
      <div className="flex flex-wrap justify-between items-center gap-4 border-b-2 border-black pb-3 mb-4 text-xs font-bold">
        <div>
          <span className="text-[10px] text-muted-foreground uppercase block">{isEn ? "Live Route Navigation" : "लाइव रूट नेविगेशन"}</span>
          <span className="text-foreground font-black uppercase">
            📍 Prayagraj Vector Street Radar
          </span>
        </div>

        {/* Traffic select sliders buttons */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 uppercase flex items-center gap-1">
            <Car className="size-3.5 text-black dark:text-white" />
            {isEn ? "Live Traffic" : "लाइव ट्रैफिक"}:
          </span>
          <div className="flex border border-black overflow-hidden text-[9px] font-black">
            <button
              onClick={() => setTrafficCongestion("low")}
              className={`px-2.5 py-1 ${trafficCongestion === "low" ? "bg-[#A3E635] text-black" : "bg-white dark:bg-zinc-800"}`}
            >
              🟢 {isEn ? "Low" : "कम"}
            </button>
            <button
              onClick={() => setTrafficCongestion("medium")}
              className={`px-2.5 py-1 border-x border-black ${trafficCongestion === "medium" ? "bg-[#FFD166] text-black" : "bg-white dark:bg-zinc-800"}`}
            >
              🟡 {isEn ? "Med" : "मध्यम"}
            </button>
            <button
              onClick={() => setTrafficCongestion("high")}
              className={`px-2.5 py-1 ${trafficCongestion === "high" ? "bg-[#FF8A8A] text-black" : "bg-white dark:bg-zinc-800"}`}
            >
              🔴 {isEn ? "High" : "भारी"}
            </button>
          </div>
        </div>
      </div>

      {/* DYNAMIC MAP AND INFO PANELS CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* SVG VECTOR MAP RADAR CANVAS */}
        <div className="lg:col-span-8 bg-black border-4 border-black relative aspect-square overflow-hidden flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="absolute inset-0 bg-[radial-gradient(#1A1A1A_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
          
          <svg viewBox="0 0 400 400" className="w-full h-full relative z-10">
            {/* 1. Rivers Confluence (Sangam) - Confluences Ganga & Yamuna */}
            {/* Winding blue rivers that intersect */}
            <path 
              d="M -10 120 Q 150 140 220 200 T 410 410" 
              fill="none" 
              stroke="#5C94FF" 
              strokeWidth="14" 
              strokeLinecap="round"
              opacity="0.8"
            />
            <path 
              d="M -10 320 Q 180 270 220 200" 
              fill="none" 
              stroke="#4080FF" 
              strokeWidth="10" 
              strokeLinecap="round"
              opacity="0.8"
            />
            
            {/* River Labels */}
            <text x="50" y="110" fill="#93C5FD" fontSize="8" fontWeight="bold">Ganga River</text>
            <text x="50" y="340" fill="#93C5FD" fontSize="8" fontWeight="bold">Yamuna River</text>
            <text x="240" y="225" fill="#3B82F6" fontSize="9" fontWeight="black">Sangam</text>

            {/* 2. Alfred Park (Chandra Shekhar Azad Park) */}
            <rect x="230" y="60" width="80" height="70" fill="#A3E635" fillOpacity="0.25" stroke="#A3E635" strokeWidth="1.5" strokeDasharray="3 2" />
            <text x="270" y="100" fill="#84CC16" fontSize="7" fontWeight="bold" textAnchor="middle">Alfred Park</text>

            {/* 3. Minto Park */}
            <rect x="90" y="240" width="60" height="50" fill="#A3E635" fillOpacity="0.2" stroke="#A3E635" strokeWidth="1" strokeDasharray="2 2" />
            <text x="120" y="270" fill="#84CC16" fontSize="7" fontWeight="bold" textAnchor="middle">Minto Park</text>

            {/* 4. Streets Grid Paths */}
            {/* MG Road (Horizontal Center) */}
            <line x1="-10" y1="200" x2="410" y2="200" stroke="#222" strokeWidth="6" strokeLinecap="round" />
            <line x1="-10" y1="200" x2="410" y2="200" stroke="#333" strokeWidth="2" strokeDasharray="6 4" />
            <text x="320" y="193" fill="gray" fontSize="7" fontWeight="bold">MG Road</text>

            {/* GT Road (Diagonal Bypass) */}
            <line x1="-10" y1="360" x2="410" y2="40" stroke="#222" strokeWidth="5" />
            <text x="320" y="110" fill="gray" fontSize="7" fontWeight="bold" rotate="-37" transform="rotate(-37 320 110)">GT Road</text>

            {/* University Road (Vertical right) */}
            <line x1="290" y1="-10" x2="290" y2="410" stroke="#222" strokeWidth="4" />
            <text x="296" y="50" fill="gray" fontSize="6" fontWeight="bold" transform="rotate(90 296 50)">University Road</text>

            {/* Beli Hospital Road (Vertical left) */}
            <line x1="120" y1="-10" x2="120" y2="410" stroke="#222" strokeWidth="4" />
            <text x="126" y="50" fill="gray" fontSize="6" fontWeight="bold" transform="rotate(90 126 50)">Beli Road</text>

            {/* Katra Cross-Street (connecting center to Beli Road) */}
            <line x1="120" y1="120" x2="290" y2="120" stroke="#222" strokeWidth="4" />

            {/* 5. Dynamic Routed Path Trace (if marker is active) */}
            {activeProjection && (
              <g>
                {/* Outline shadow route */}
                <path 
                  d={`M 200 200 L 200 ${activeProjection.y} L ${activeProjection.x} ${activeProjection.y}`}
                  fill="none" 
                  stroke="black" 
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                
                {/* Traffic colored active line */}
                <path 
                  d={`M 200 200 L 200 ${activeProjection.y} L ${activeProjection.x} ${activeProjection.y}`}
                  fill="none" 
                  stroke={
                    trafficCongestion === "low" ? "#A3E635" : 
                    trafficCongestion === "medium" ? "#FFD166" : 
                    "#FF8A8A"
                  } 
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-pulse"
                />
              </g>
            )}

            {/* 6. Plot Patient/User (Center) */}
            {!activeRouteOnly && (
              <g>
                <circle cx="200" cy="200" r="10" fill="#5C94FF" className="animate-ping" opacity="0.3" />
                <circle cx="200" cy="200" r="6" fill="#5C94FF" stroke="black" strokeWidth="1.5" />
                <circle cx="200" cy="200" r="2" fill="white" />
              </g>
            )}

            {/* 7. Plot All Nearby Markers */}
            {projectedMarkers.map((marker) => {
              const isSelected = marker.id === selectedMarkerId;
              const size = isSelected ? 12 : 9;

              let iconEmoji = "🏥";
              if (marker.type === "pharmacy") iconEmoji = "🏪";
              if (marker.type === "bloodbank") iconEmoji = "🩸";
              if (marker.type === "ambulance") iconEmoji = "🚑";

              return (
                <g 
                  key={marker.id} 
                  className="cursor-pointer" 
                  onClick={() => onSelectMarker(marker.id)}
                >
                  {/* Highlight selected marker rings */}
                  {isSelected && (
                    <circle cx={marker.x} cy={marker.y} r={size + 5} fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="3 3" />
                  )}
                  
                  {/* Pin Circle container */}
                  <circle 
                    cx={marker.x} 
                    cy={marker.y} 
                    r={size} 
                    fill={
                      marker.type === "bloodbank" ? "#FF8A8A" : 
                      marker.type === "pharmacy" ? "#A3E635" : 
                      marker.type === "ambulance" ? "#FFD166" :
                      "#5C94FF"
                    } 
                    stroke="black" 
                    strokeWidth="1.5" 
                  />
                  
                  {/* Emojis marker overlay */}
                  <text 
                    x={marker.x} 
                    y={marker.y + 3.5} 
                    fontSize={isSelected ? "9" : "7"} 
                    textAnchor="middle"
                  >
                    {iconEmoji}
                  </text>

                  {/* Marker Labels (Only show selected or top 3 closest to avoid clutter) */}
                  {(isSelected || (marker.distance ?? 99) < 2.5) && (
                    <g>
                      <rect 
                        x={marker.x - 25} 
                        y={marker.y - 18} 
                        width="50" 
                        height="9" 
                        fill="black" 
                        rx="1"
                      />
                      <text 
                        x={marker.x} 
                        y={marker.y - 11} 
                        fill="white" 
                        fontSize="5.5" 
                        fontWeight="black" 
                        textAnchor="middle"
                      >
                        {marker.name.split(" ")[0]}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

          </svg>

          {/* Compass grid overlay */}
          <div className="absolute top-2 right-2 p-1.5 border border-black/25 bg-black/60 text-white text-[9px] font-mono flex items-center gap-1">
            <Compass className="size-3 animate-spin-slow" />
            <span>PRAYAGRAJ GPX</span>
          </div>

          <div className="absolute bottom-2 left-2 text-[8px] text-gray-500 font-mono">
            {isEn ? "MAP SCALE: 1 : 20,000" : "मानचित्र पैमाना: 1 : 20,000"}
          </div>
        </div>

        {/* RIGHT AREA: NAVIGATION DIRECTIONS INTERACTIVE ROLLER (4 columns) */}
        <div className="lg:col-span-4 flex flex-col justify-between">
          {activeMarker ? (
            <div className="space-y-4 h-full flex flex-col justify-between">
              
              {/* Routing detail header */}
              <div className="space-y-3 bg-gray-50 dark:bg-zinc-900 border-2 border-black p-3 rounded-none text-xs font-bold text-foreground">
                <div className="flex items-center gap-1.5 text-blue-900 dark:text-blue-200">
                  <Navigation className="size-4 shrink-0 animate-bounce" />
                  <span className="uppercase font-black">{isEn ? "Active Routing Guide" : "सक्रिय मार्गदर्शिका"}</span>
                </div>
                
                <div>
                  <span className="text-[10px] text-gray-500 uppercase block">{isEn ? "Destination" : "गंतव्य"}</span>
                  <span className="text-sm font-black">{activeMarker.name}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-dashed border-black/20 pt-2 font-mono text-[11px]">
                  <div>
                    <span className="text-[9px] text-gray-500 uppercase block">{isEn ? "Distance" : "दूरी"}</span>
                    <span>{activeMarker.distance} km</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-500 uppercase block">{isEn ? "Estimated ETA" : "अनुमानित समय"}</span>
                    <span className="text-red-600 font-black">
                      {Math.round((activeMarker.distance ?? 1.5) * 2.2 * trafficFactor)} {isEn ? "mins" : "मिनट"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Turn instructions step list */}
              <div className="flex-1 overflow-y-auto max-h-[220px] pr-1 space-y-2 mt-2">
                <span className="text-[9px] font-black uppercase text-gray-400 block tracking-wide">
                  🛣️ {isEn ? "Turn-by-Turn Navigation Details" : "मोड़-दर-मोड़ नेविगेशन विवरण"}
                </span>

                {turnDirections.map((step, idx) => (
                  <div key={idx} className="flex gap-2 items-start text-[11px] font-semibold text-muted-foreground border-l-2 border-black pl-2 pb-1">
                    <span className="font-mono text-black dark:text-white font-black">{idx + 1}.</span>
                    <p className="leading-tight">{step}</p>
                  </div>
                ))}
              </div>

              <div className="bg-[#A3E635]/15 border-2 border-[#A3E635] p-2 text-[10px] font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 mt-2">
                <CheckCircle className="size-4 shrink-0 text-emerald-600" />
                <span>
                  {isEn 
                    ? "Safe route verified. Traffic delays synced dynamically." 
                    : "सुरक्षित मार्ग सत्यापित। ट्रैफिक देरी को लाइव सिंक किया गया।"}
                </span>
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-black/35 text-xs text-muted-foreground font-bold">
              <Navigation className="size-8 text-gray-400 mb-2" />
              <p>
                {isEn 
                  ? "Select a nearby medical marker on the map to trace routes, view live traffic alerts, and get step-by-step directions." 
                  : "मार्ग ट्रेस करने, लाइव ट्रैफ़िक अलर्ट देखने और मोड़-दर-मोड़ निर्देश प्राप्त करने के लिए मानचित्र पर पास के किसी मार्कर का चयन करें।"}
              </p>
            </div>
          )}
        </div>

      </div>

    </Card>
  );
}
